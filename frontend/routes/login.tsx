import { Handlers, PageProps } from "$fresh/server.ts";
import { setCookie } from "std/http/cookie.ts";
import { post } from "../helpers/api.ts";
import { Head } from "$fresh/runtime.ts";
import Message from "../islands/Message.tsx";
import { encode } from "../helpers/encoders.ts";

type data = {
  message: string | null | undefined;
};

export const handler: Handlers = {
  async POST(req, ctx) {
    const url = new URL(req.url);
    const form = await req.formData();

    const data = await post(
      "login",
      { email: form.get("email"), password: form.get("password") },
      undefined,
    );
    if (data.status !== 200) {
      return ctx.render({ message: "Failed to login" });
    }

    const token = data.headers.get("auth");
    if (!token) {
      return ctx.render({ message: "Failed to login" });
    }

    let d = await data.json();
    if (d === undefined) d = null;

    const headers = new Headers();
    setCookie(headers, {
      name: "auth",
      value: encode({ token, user: d }), // this should be a unique value for each session
      maxAge: 120,
      sameSite: "Lax", // this is important to prevent CSRF attacks
      domain: url.hostname,
      path: "/",
      secure: true,
    });

    headers.set("location", "/");
    return new Response(null, {
      status: 303,
      headers,
    });
  },
};

const Login = (props: PageProps<data>) => {
  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="description" content={"Good webpage"} />
      </Head>
      <div className="mx-auto max-w-screen-md flex flex-col justify-center items-center">
        <Message message={props.data?.message} timeout={5000} />
        <form className={"w-9/12"} method={"POST"}>
          <label className={"block flex flex-col"}>
            <div className={"mt-5"}>
              <span class="block text-sm font-medium text-slate-700">
                Email
              </span>
              <input
                type={"email"}
                required
                name={"email"}
                placeholder={"email"}
                className={"mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400"}
              />
            </div>
            <div className={"mt-5"}>
              <span class="block text-sm font-medium text-slate-700">
                Password
              </span>
              <input
                type={"password"}
                required
                name={"password"}
                placeholder={"password"}
                className={"mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400"}
              />
            </div>
            <div className={"flex justify-center mt-5"}>
              <button
                type={"submit"}
                className={"w-40 rounded-md bg-blue-300 hover:bg-blue-400 p-3"}
              >
                Submit
              </button>
            </div>
          </label>
        </form>
      </div>
    </>
  );
};

export default Login;
