import { User } from "./types.ts";
import { getCookies } from "std/http/cookie.ts";
import { decode } from "./encoders.ts";
import { get } from "./api.ts";

export const handle_auth = async (
  req: Request,
  not_auth: () => Response | Promise<Response>,
  auth: (_: User) => Response | Promise<Response>,
) => {
  const cookies = getCookies(req.headers);

  if (!cookies.auth) {
    return not_auth();
  }

  const data = decode<{ user: User; token: string }>(cookies.auth);
  const res = await get("is_auth", { auth: data.token });

  const d = await res.json();
  if (d.login === true) {
    return not_auth();
  }
  return auth(data.user);
};
