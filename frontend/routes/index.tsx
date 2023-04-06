import { Head } from "$fresh/runtime.ts";
import MathJax from "../components/MathJax.tsx";
import LoadMath from "../islands/LoadMath.tsx";
import { Axiom, ProofTree, UnaryInf } from "../components/ProofTree.tsx";

import { Handlers, PageProps } from "$fresh/server.ts";

interface User {
  username: string;
  password: string;
}

export const handler: Handlers<User | null> = {
  async GET(_, ctx) {
    const resp = await fetch("http://localhost:3000");
    if (resp.status === 404) {
      return ctx.render(null);
    }
    const user: User = await resp.json();
    return ctx.render(user);
  },
};

export default function Home(props: PageProps) {
  return (
    <>
      <Head>
        <title>Fresh App</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <img
          src="/logo.svg"
          class="w-32 h-32"
          alt="the fresh logo: a sliced lemon dripping with juice"
        />
        <p class="my-6">
          Hello {props.data.username} {props.data.password}.
          <MathJax>
            <ProofTree>
              <Axiom>$(\lambda x. x)$</Axiom>
              <UnaryInf>$(\lambda x. x)$</UnaryInf>
            </ProofTree>
          </MathJax>
        </p>
        <LoadMath />
      </div>
    </>
  );
}
