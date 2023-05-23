open Opium
open Types
open Db
open Lwt.Infix

let logged_in_tokens : string list ref = ref []
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
  | e ->
      let msg = Printexc.to_string e and stack = Printexc.get_backtrace () in
      Printf.eprintf "there was an error: %s%s\n" msg stack;
      Response.of_json ~status:`Internal_server_error
        (`Assoc [ ("message", `String "Erro") ])
      |> Lwt.return

let response ~status msg =
  Response.of_json ~status (`Assoc [ ("message", `String msg) ]) |> Lwt.return

let req_user_key = Context.Key.create ("user", sexp_of_user)
let get_user req = Opium.Context.find_exn req_user_key req.Request.env

let user_is_admin req =
  let user = get_user req in
  if user.role <> 1 then Lwt.fail (request_error "Not allowed" `Forbidden)
  else Lwt.return user

let admin_users req =
  let* _ = user_is_admin req in
  read_all_users () >>= fun u ->
  let r = u |> List.map yojson_of_user in
  `List r |> Response.of_json ~status:`OK |> Lwt.return

let admin_user_change req =
  let* _ = user_is_admin req in
  let user_id = Router.param req "user_id" in
  let* user_db = select_user_id user_id in
  let* user = Request.to_json req in
  let* user =
    match user with
    | Some v -> Lwt.return v
    | None -> Lwt.fail (request_error "Invalid body" `Bad_request)
  in
  let user = user_of_yojson user in
  let user_db =
    if user_db.role <> user.role then { user_db with role = user.role }
    else user_db
  in
  let user_db =
    if user_db.email <> user.email then { user_db with email = user.email }
    else user_db
  in
  let user_db =
    if user_db.username <> user.username then
      { user_db with username = user.username }
    else user_db
  in
  let user_db =
    if user_db.password <> (hash_password user).password then
      { user_db with password = user.password }
    else user_db
  in
  let* () = update_user user_db in
  Response.of_json ~status:`OK (yojson_of_user user_db) |> Lwt.return

let admin_user_delete req =
  let* user = user_is_admin req in
  let user_id = Router.param req "user_id" in
  if user.id <> user_id then
    let* () = delete_user user_id in
    response ~status:`No_content "Deleted"
  else Lwt.fail (request_error "User ID" `Bad_request)

let admin_user_insert req =
  let* _ = user_is_admin req in
  let* user = Request.to_json req in
  let* user =
    match user with
    | Some v -> Lwt.return v
    | None -> Lwt.fail (request_error "Invalid body" `Bad_request)
  in
  let user = user_of_yojson user in
  let* () = set_id user |> hash_password |> insert_user in
  response ~status:`Created "Done!"

let playlists_list req =
  let user = get_user req in
  let* playlists = select_playlists user.id in
  yojson_of_list yojson_of_playlist playlists
  |> Response.of_json ~status:`OK
  |> Lwt.return

let playlists_insert req =
  let user = get_user req in
  let* playlist = Request.to_json req in
  let* playlist =
    match playlist with
    | Some p -> p |> playlist_of_yojson |> Lwt.return
    | None -> Lwt.fail (request_error "Invalid body" `Bad_request)
  in
  let playlist = { playlist with id = new_uuid () } in
  let playlist = { playlist with user_id = user.id } in
  let* () = insert_playlists playlist in
  response ~status:`Created "Done!"

let playlist_delete req =
  let user = get_user req in
  let id = Router.param req "id" in
  let* () = delete_playlists id user.id in
  response ~status:`Created "Done!"

let is_auth req =
  let token = Request.header "auth" req in
  let resp v user =
    match user with
    | Some u ->
        Response.of_json ~status:`OK
          (`Assoc [ ("login", `Bool v); ("user", `String u) ])
        |> Lwt.return
    | None ->
        Response.of_json ~status:`OK (`Assoc [ ("login", `Bool v) ])
        |> Lwt.return
  in
  match token with
  | Some t ->
      let v = List.mem t !logged_in_tokens in
      Format.printf "%b\n@." v;
      if v then resp true (Some (decode_token t)) else resp false None
  | None -> resp false None

let logout req =
  let token = Request.header "auth" req in
  match token with
  | Some t ->
      let () =
        logged_in_tokens := List.filter (fun a -> a <> t) !logged_in_tokens
      in
      response ~status:`OK "Done!"
  | None -> response ~status:`OK "Empty token!"

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
  let* user_db = select_user_email user_login.email in
  if hash user_login.password = user_db.password then
    let token = encode_token user_db in
    let () = logged_in_tokens := token :: !logged_in_tokens in
    (* user_db.token <- token; *)
    user_db |> yojson_of_user
    |> Response.of_json ~status:`OK
         ~headers:(Headers.add Headers.empty "auth" token)
    |> Lwt.return
  else response ~status:`Bad_request "Fail to login"

let auth_middleware =
  let filter handler req =
    if req.Request.target = "/login" || req.Request.target = "/register" then
      handler req
    else
      let* user =
        let token = Request.header "auth" req in
        match token with
        | Some v -> Lwt.return (decode_token v |> user_of_string)
        | None -> Lwt.fail (request_error "Not authenticated" `Forbidden)
      in
      let env = Context.add req_user_key user req.env in
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
     @@ Middleware.allow_cors ~origins:[ "*" ] ?headers:(Some [ "*" ])
          ?expose:(Some [ "*" ])
          ?methods:(Some [ `POST; `GET; `PUT; `DELETE ])
          ()
  |> App.middleware auth_middleware
  |> App.get "/admin/users" admin_users
  |> App.post "/admin/users" admin_user_insert
  |> App.put "/admin/users/:user_id" admin_user_change
  |> App.delete "/admin/users/:user_id" admin_user_delete
  |> App.get "/playlists" playlists_list
  |> App.post "/playlists" playlists_insert
  |> App.delete "/playlists/:id" playlist_delete
  |> App.post "/register" register
  |> App.post "/login" login |> App.get "/is_auth" is_auth
  |> App.get "/logout" logout |> App.run_command
