open Lwt.Infix
open Types

module type DB = Rapper_helper.CONNECTION

let pool =
  Caqti_lwt.connect_pool ~max_size:10
    (Uri.of_string
       "postgresql://localhost/pweb?user=root&password=mysecretpassword")
  |> function
  | Ok v -> v
  | Error e ->
      Format.printf "%s\n" (Caqti_error.show e);
      exit 1

let make_query f =
  Caqti_lwt.Pool.use f pool >>= function
  | Ok v -> Lwt.return v
  | Error e -> Lwt.fail (Caqti_error.Exn e)

let create_users_table =
  [%rapper
    execute
      {sql| CREATE TABLE IF NOT EXISTS users (
        id uuid NOT NULL PRIMARY KEY,
        username TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role INT
      );
 |sql}]
    ()

let () = make_query create_users_table |> Lwt_main.run

let read_all_users () =
  [%rapper
    get_many
      {sql|
      SELECT @string{id}, @string{username}, @string{email}, @string{password}, @int{role} FROM users
 |sql}
      record_out]
    ()
  |> make_query

let insert_user user =
  [%rapper
    execute
      {sql|
    INSERT INTO users (id, username, email, password, role) VALUES
    (%string{id}, %string{username}, %string{email}, %string{password}, %int{role})
    |sql}
      record_in]
    user
  |> make_query

let select_user email =
  [%rapper
    get_one
      {sql|
    SELECT @string{id}, @string{username}, @string{email}, @string{password}, @int{role} FROM users WHERE email = %string{email}
  |sql}
      record_out]
    ~email
  |> make_query
