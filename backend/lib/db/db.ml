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

let create_playlists_table =
  [%rapper
    execute
      {sql| CREATE TABLE IF NOT EXISTS playlists (
        id uuid NOT NULL PRIMARY KEY,
        name TEXT,
        user_id uuid NOT NULL,
        url TEXT,
        CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id)
      );
 |sql}]
    ()

let () =
  let open Lwt.Infix in
  let p =
    make_query create_users_table >>= fun _ -> make_query create_playlists_table
  in
  Lwt_main.run p

let read_all_users () =
  [%rapper
    get_many
      {sql|
      SELECT @string{id}, @string{username}, @string{email}, @string{password}, @int{role} FROM users
 |sql}
      record_out]
    ()
  |> make_query

let update_user user =
  [%rapper
    execute
      {sql|
  UPDATE users 
  SET 
    username = %string{username},
    email = %string{email},
    password = %string{password},
    role = %int{role}
  WHERE id = %string{id};
  |sql}
      record_in]
    user
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

let select_user_id id =
  [%rapper
    get_one
      {sql|
    select @string{id}, @string{username}, @string{email}, @string{password}, @int{role} 
    from users 
    where id = %string{id}
  |sql}
      record_out]
    ~id
  |> make_query

let select_user_email email =
  [%rapper
    get_one
      {sql|
    SELECT @string{id}, @string{username}, @string{email}, @string{password}, @int{role} 
    FROM users 
    WHERE email = %string{email}
  |sql}
      record_out]
    ~email
  |> make_query

let delete_user id =
  [%rapper execute {sql|
    DELETE FROM users WHERE id = %string{id}
  |sql}]
    ~id
  |> make_query

let select_playlists user_id =
  [%rapper
    get_many
      {sql|
    SELECT @string{id}, @string{name}, @string{user_id}, @string{url} FROM playlists WHERE user_id = %string{user_id} 
    |sql}
      record_out]
    ~user_id
  |> make_query

let insert_playlists playlist =
  [%rapper
    execute
      {sql|
    INSERT INTO playlists (id, name, user_id, url) VALUES
    (%string{id}, %string{name}, %string{user_id}, %string{url})
    |sql}
      record_in]
    playlist
  |> make_query
