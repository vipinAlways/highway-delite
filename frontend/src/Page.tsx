import { Outlet } from "react-router-dom";
import Nav from "./components/Nav";

function Page() {
  return (
    <div className="px-12">
      <Nav />

      <Outlet />

      <div className="w-full h-20 "></div>
    </div>
  );
}

export default Page;
