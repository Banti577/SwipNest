import BottomNavbar from "./BottomNavbar";
import { Outlet } from "react-router-dom";

function ShortLayout({user}) {
  return (
    <div className="short-layout">
      <div className="page">
        <Outlet />
      </div>
       <BottomNavbar user={user} /> 
    </div>
  );
}

export default ShortLayout;
