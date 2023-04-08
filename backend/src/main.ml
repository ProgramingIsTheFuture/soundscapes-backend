open Opium
open Types
open Db
open Lwt.Infix

(* docker run --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword -e POSTGRES_USER=root -e POSTGRES_DB=pweb -d -p 5432:5432 postgres *)

let ( let* ) = ( >>= )
let ( let- ) = Lwt.catch

exception RequestError of (string * Status.t)

let request_error msg status = RequestError (msg, status)

let error_handler (f : Request.t -> 'a Lwt.t) req : 'b Lwt.t =
  let- err () = f req in
  match err with
  | RequestError (msg, status) ->
      Response.of_json ~status (`Assoc [ ("message", `String msg) ])
      |> Lwt.return
  | Caqti_error.Exn e ->
      Response.of_json ~status:`Internal_server_error
        (`Assoc
          [
            ("message", `String ("Error interno [Debug]: " ^ Caqti_error.show e));
          ])
      |> Lwt.return
  | Invalid_argument s ->
      Response.of_json ~status:`Forbidden
        (`Assoc [ ("message", `String ("Unauthorized" ^ s)) ])
      |> Lwt.return
  | Yojson.Json_error e ->
      Response.of_json ~status:`Internal_server_error
        (`Assoc [ ("message", `String ("JSON: " ^ e)) ])
      |> Lwt.return
  | _ ->
      Response.of_json ~status:`Internal_server_error
        (`Assoc [ ("message", `String "Erro") ])
      |> Lwt.return

let response ~status msg =
  Response.of_json ~status (`Assoc [ ("message", `String msg) ]) |> Lwt.return

let hello _req =
  read_all_users () >>= fun u ->
  let r = u |> List.map yojson_of_user in
  `List r |> Response.of_json ~status:`OK |> Lwt.return

let register req =
  let* user = Request.to_json req in
  let* user =
    match user with
    | Some v -> Lwt.return v
    | None -> Lwt.fail (request_error "Invalid body" `Bad_request)
  in
  let user = user_of_yojson user in
  if user.password = "" || user.email = "" || user.username = "" then
    Lwt.fail (request_error "Missing fields" `Bad_request)
  else
    let* () = insert_user (user |> set_id |> hash_password) in
    response ~status:`OK "success"

let login req =
  let* user = Request.to_json req in
  let* user =
    match user with
    | Some v -> Lwt.return v
    | None -> Lwt.fail (request_error "Invalid body" `Bad_request)
  in
  let user_login = user_login_of_yojson user in
  let* user_db = select_user user_login.email in
  if hash user_login.password = user_db.password then
    let token = encode_token user_db in
    user_db |> yojson_of_user
    |> Response.of_json ~status:`OK
         ~headers:(Headers.add Headers.empty "Auth" token)
    |> Lwt.return
  else response ~status:`Bad_request "Falha ao fazer login"

let auth_middleware =
  let filter handler req =
    if req.Request.target = "/login" || req.Request.target = "/register" then
      handler req
    else
      let key = Context.Key.create ("user", sexp_of_user) in
      let* user =
        let token = Request.header "auth" req in
        match token with
        | Some v -> Lwt.return (decode_token v)
        | None -> Lwt.fail (request_error "Not authenticated" `Forbidden)
      in
      let env = Context.add key user req.env in
      let req =
        Request.make ~version:req.version ~body:req.body ~env
          ~headers:req.headers req.target req.meth
      in
      handler req
  in
  Rock.Middleware.create
    ~filter:(fun h r -> error_handler (filter h) r)
    ~name:"Auth"

let () =
  Logs.set_reporter (Logs_fmt.reporter ());
  Logs.set_level (Some Logs.Info);
  App.empty
  |> App.middleware @@ Middleware.logger
  |> App.middleware
     @@ Middleware.allow_cors ~origins:[ "http://localhost:8000" ] ()
  |> App.middleware auth_middleware
  |> App.post "/register" register
  |> App.post "/login" login |> App.get "/" hello |> App.run_command
