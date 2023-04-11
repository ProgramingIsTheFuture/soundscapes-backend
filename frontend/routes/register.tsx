import { Handlers, PageProps } from "$fresh/server.ts";
import { post } from "../helpers/api.ts";
import Message from "../islands/Message.tsx";
import Template from "../components/Template.tsx";

export const handler: Handlers = {
  async POST(req, ctx) {
    const form = await req.formData();

    const data = await post(
      "register",
      {
        email: form.get("email"),
        username: form.get("username"),
        password: form.get("password"),
      },
      undefined,
    );
    if (data.status !== 200) {
      return ctx.render({ message: "Failed to register, try again!" });
    }

    const headers = new Headers();
    headers.set("location", "/login");
    return new Response(null, {
      status: 303,
      headers,
    });
  },
};

const Register = (props: PageProps<{ message: string }>) => {
  return (
    <Template user={null} title={"Register | Web Classes"}>
      <div
        className={"flex flex-col justify-center items-center"}
      >
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
                Username
              </span>
              <input
                type={"text"}
                required
                name={"username"}
                placeholder={"username"}
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
    </Template>
  );
};

export default Register;
