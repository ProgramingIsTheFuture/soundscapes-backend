import { User } from "../helpers/types.ts";

const Navbar = ({ user }: { user: User | null }) => {
  return (
    <>
      Navbar
      <ul>
        <li>
          <a href={"/"}>Home</a>
        </li>
        {user
          ? (
            <li>
              <a href={"/dashboard"}>Dashboard</a>
            </li>
          )
          : null}
      </ul>
    </>
  );
};

export default Navbar;
