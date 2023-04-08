open Ppx_sexp_conv_lib.Conv

type user = {
  id : string; [@default ""]
  username : string;
  email : string;
  password : string; [@default ""] [@yojson_drop_if fun _ -> true]
  role : int; [@default 2]
}
[@@deriving yojson, sexp] [@@yojson.allow_extra_fields]

type user_login = { email : string; password : string }
[@@deriving yojson] [@@yojson.allow_extra_fields]

let set_id user = { user with id = Uuidm.v `V4 |> Uuidm.to_string }
let hash s = Digestif.SHA256.digest_string s |> Digestif.SHA256.to_hex

let hash_password (user : user) : user =
  { user with password = hash user.password }

let encode_token user =
  yojson_of_user user |> Yojson.Safe.to_string |> Base64.encode_exn

exception InvalidToken of string

let decode_token token =
  Base64.decode_exn token |> Yojson.Safe.from_string |> user_of_yojson
