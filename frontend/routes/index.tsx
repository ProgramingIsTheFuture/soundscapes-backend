import MathJax from "../components/MathJax.tsx";
import LoadMath from "../islands/LoadMath.tsx";
import { Axiom, ProofTree, UnaryInf } from "../components/ProofTree.tsx";
import { getCookies } from "std/http/cookie.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { decode } from "../helpers/encoders.ts";
import Template from "../components/Template.tsx";
import { User } from "../helpers/types.ts";

export const handler: Handlers<User | null> = {
  GET(req, ctx) {
    const cookies = getCookies(req.headers);
    if (!cookies.auth) {
      return ctx.render(null);
    }
    const user = decode<{ user: User; token: string }>(cookies.auth).user;
    return ctx.render(user);
  },
};

export default function Home(props: PageProps<User | null>) {
  return (
    <Template user={props.data} title="Web Classes">
      <img
        src="/logo.svg"
        className="w-32 h-32"
        alt="the fresh logo: a sliced lemon dripping with juice"
      />
      <MathJax>
        <ProofTree>
          <Axiom>$(\lambda x. x)$</Axiom>
          <UnaryInf>$(\lambda x. x)$</UnaryInf>
        </ProofTree>
      </MathJax>
      <div>
        <a href={"/login"}>Login!</a>
        <a href={"/register"}>Register!</a>
      </div>
      <p>{props.data?.username}</p>
      <LoadMath />
    </Template>
  );
}
