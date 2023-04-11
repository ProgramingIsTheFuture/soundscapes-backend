import { ComponentChildren } from "preact";
import Footer from "./Footer.tsx";
import Navbar from "./Navbar.tsx";
import { User } from "../helpers/types.ts";
import { Head } from "$fresh/runtime.ts";

const Template = (
  { user, title, children }: {
    user: User | null;
    title: string;
    children: ComponentChildren;
  },
) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={"Good webpage"} />
        <script src="https://cdn.twind.style"></script>
      </Head>
      <Navbar user={user} />
      <div className="mx-auto max-w-screen-md">
        {children}
      </div>
      <Footer />
    </>
  );
};

export default Template;
