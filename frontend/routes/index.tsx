import { Head } from "$fresh/runtime.ts";
import MathJax from "../components/MathJax.tsx";
import LoadMath from "../islands/LoadMath.tsx";
import { Axiom, ProofTree, UnaryInf } from "../components/ProofTree.tsx";
import { getCookies } from "std/http/cookie.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { decode } from "../helpers/encoders.ts";

type User = {
  id: string;
  email: string;
  username: string;
  password: string;
  role: number;
};

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
    <>
      <Head>
        <title>Fresh App</title>
        <meta name="description" content={"Good webpage"} />
        <script src="https://cdn.twind.style"></script>
      </Head>
      <div className="p-4 mx-auto max-w-screen-md">
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
        <p>{JSON.stringify(props.data)}</p>
        <LoadMath />
      </div>
    </>
  );
}
