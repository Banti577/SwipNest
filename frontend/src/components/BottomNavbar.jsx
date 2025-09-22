import { useState } from "react";
import styles from "./BottomNavbar.module.css";
import { FaHome, FaPlusCircle, FaUser, FaVideo } from "react-icons/fa";
import { Link } from "react-router-dom";

function BottomNavbar({user}) {
  const [active, setActive] = useState("home");

  return (
    <div className={styles.navbar}>
      <div
        className={`${styles.navItem} ${active === "home" ? styles.active : ""}`}
        onClick={() => setActive("home")}
      >
        <FaHome size={20} />
         <Link className="navbar-brand fw-bold fs-8 text-danger" to="/">
           <span>Home</span>
          </Link>
        
      </div>

      <div
        className={`${styles.navItem} ${active === "shorts" ? styles.active : ""}`}
        onClick={() => setActive("shorts")}
      >
        <FaVideo size={20} />
        <Link className="navbar-brand fw-bold fs-8 text-danger" to="/Short">
           <span>Reels</span>
          </Link>
      </div>

      <div
        className={`${styles.navItem} ${active === "upload" ? styles.active : ""}`}
        onClick={() => setActive("upload")}
      >
        <FaPlusCircle size={20} />
         <Link className="navbar-brand fw-bold fs-8 text-danger" to="/video/upload">
            <span>Upload</span>
          </Link>
       
      </div>

      <div
      
        className={`${styles.navItem} ${active === "profile" ? styles.active : ""}`}
        onClick={() => setActive("profile")}

      
      >
        {user ? ( <img width={'25px'} src={`${process.env.REACT_APP_BACKEND_URL}/${user.profileImgUrl}`} alt="" />):(<FaUser size={20} />)}
       

         <Link className="navbar-brand fw-bold fs-8 text-danger" to="/user/profile">
            <span>Profile</span>
          </Link>
    
      </div>
    </div>
  );
}

export default BottomNavbar;
