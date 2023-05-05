import { Handlers, PageProps } from "$fresh/server.ts";
import Template from "../components/Template.tsx";
import { User } from "../helpers/types.ts";
import { handle_auth } from "../helpers/auth.ts";

export const handler: Handlers<User> = {
  async GET(req, ctx) {
    return await handle_auth(req, () => {
      const headers = new Headers();
      headers.set("location", "/");
      return new Response(null, {
        status: 303,
        headers,
      });
    }, (u) => {
      return ctx.render(u);
    });
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
