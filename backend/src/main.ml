open Opium

type register = { username : string; password : string } [@@deriving yojson]

let hello _req =
  { username = "Hello"; password = "World" }
  |> register_to_yojson
  |> Response.of_json ~status:`OK
  |> Lwt.return

let () =
  Logs.set_reporter (Logs_fmt.reporter ());
  Logs.set_level (Some Logs.Info);
  App.empty
  |> App.middleware @@ Middleware.logger
  |> App.middleware
     @@ Middleware.allow_cors ~origins:[ "http://localhost:8000" ] ()
  |> App.get "/" hello |> App.run_command
