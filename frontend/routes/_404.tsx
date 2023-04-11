import { UnknownPageProps } from "$fresh/server.ts";

const NotFound = ({ url }: UnknownPageProps) => {
  return (
    <div>
      <a href={"/"}>Home!</a>
      <h3>404 Not Found! {url.pathname}</h3>
    </div>
  );
};

export default NotFound;
