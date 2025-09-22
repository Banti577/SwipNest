import Navbar from "./Navbar";

import { Outlet } from "react-router-dom";
import "./Layout.css";
import BottomNavbar from "./BottomNavbar";

function Layout({ user, setUser }) {
  return (
    <div className="app">
      {/* Main Content */}
      <div className="main-content">
        <Navbar user={user} setUser={setUser} />
        <div className="page">
          <Outlet />
        </div>
      <BottomNavbar />

      </div>
    </div>
  );
}

export default Layout;
