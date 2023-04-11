import { Handlers, PageProps } from "$fresh/server.ts";
import { getCookies } from "std/http/cookie.ts";
import { decode } from "../helpers/encoders.ts";
import Template from "../components/Template.tsx";
import { User } from "../helpers/types.ts";

export const handler: Handlers<User> = {
  GET(req, ctx) {
    const cookies = getCookies(req.headers);
    if (!cookies.auth) {
      const headers = new Headers();
      headers.set("location", "/");
      return new Response(null, {
        status: 303,
        headers,
      });
    }

    const user = decode<{ user: User; token: string }>(cookies.auth).user;
    return ctx.render(user);
  },
};

const Dashboard = (props: PageProps<User>) => {
  return (
    <Template user={props.data} title={"Dashboard"}>
      Dashboard, Hello {props.data.username}!
    </Template>
  );
};

export default Dashboard;
