import MathJax from "../components/MathJax.tsx";
import LoadMath from "../islands/LoadMath.tsx";
import { Axiom, ProofTree, UnaryInf } from "../components/ProofTree.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import Template from "../components/Template.tsx";
import { User } from "../helpers/types.ts";
import { handle_auth } from "../helpers/auth.ts";

export const handler: Handlers<User | null> = {
  GET(req, ctx) {
    return handle_auth(req, () => {
      return ctx.render(null);
    }, (u) => {
      return ctx.render(u);
    });
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
