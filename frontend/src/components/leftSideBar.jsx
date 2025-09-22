import React from "react";
import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css";

const Sidebar = ({ user, isSidebarOpen, setIsSidebarOpen }) => {
  return (
    <>
      <div
        className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}
      >
        <ul className="list-unstyled p-3">
          <li>
            <Link
              className="d-block py-2 px-3"
              to="/"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-house-door me-2"></i> Home
            </Link>
          </li>
          <li>
            <Link
              className="d-block py-2 px-3"
              to="/trending"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-fire me-2"></i> Trending
            </Link>
          </li>
          <li>
            <Link
              className="d-block py-2 px-3"
              to="/subscriptions"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-collection-play me-2"></i> Subscriptions
            </Link>

             <Link
              className="d-block py-2 px-3"
              to="/Short"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-house-door me-2"></i> Reels
            </Link>
          </li>
          {user && (
            <li>
              <Link
                className="d-block py-2 px-3"
                to="/blog/addBlog"
                onClick={() => setIsSidebarOpen(false)}
              >
                <i className="bi bi-plus-circle me-2"></i> Add Blog
              </Link>
            </li>
          )}
        </ul>
      </div>

      {isSidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
