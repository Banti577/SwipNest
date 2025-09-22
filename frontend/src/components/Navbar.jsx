import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "./leftSideBar";
import styles from "./Navbar.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import axios from "axios";

import { HiMenuAlt3, HiSearch } from "react-icons/hi";

const Navbar = ({ user, setUser }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
  const checkAuth = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/me`, {
        withCredentials: true,
      });
      setUser(res.data.user); 
    } catch (err) {
      setUser(null);
    }
  };

  checkAuth(); // Initial call

  const interval = setInterval(checkAuth, 15000); // Every 15 sec

  return () => clearInterval(interval); // Clean up
}, [BASE_URL, setUser]); //  No dependency (run once)

  useEffect(() => {

    
    if (query.trim()) {
      axios
        .get(`${BASE_URL}/videoSearch?q=${query}`, { withCredentials: true })
        .then((res) => setSuggestions(res.data.results))
        .catch((err) => console.error(err));
    } else {
      setSuggestions([]); // clear suggestions if query is empty
    }
  }, [BASE_URL, query]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${query}`);
      /*const res = await axios(`${BASE_URL}/video/videoSearch?q=${query}`)*/
      setQuery("");
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <nav className={styles.navbar}>
        <div className="d-flex align-items-center gap-3">
          {/* Sidebar Toggle */}
          <button
            className="btn btn-light d-lg"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ display: "block" }}
          >
            <i className="bi bi-menu-button-wide-fill fs-3">
              {" "}
              <HiMenuAlt3 size={20} />
            </i>
          </button>

          {/* Logo */}
          <Link className="navbar-brand fw-bold fs-4 text-dark" to="/">
            <i className="bi bi-youtube me-2"></i> SwipNest
          </Link>


        </div>

        {/* Search Bar */}
        <form className={styles.searchBar} onSubmit={handleSearch}>
          <input
            className={styles.input}
            type="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className={styles.button}>
            <HiSearch size={20} />
          </button>

          {suggestions.length > 0 && (
            <ul className={styles.suggestions}>
              {suggestions.map((item) => (
                <li
                  key={item._id}
                  onClick={() => {
                    navigate(`/video/${item._id}`);
                    setSuggestions([]);
                    //setQuery(""); // input clear
                    window.scrollTo(0, 0); // scroll top
                  }}
                >
                  {item.title}
                </li>
              ))}
            </ul>
          )}
        </form>

        {/* Right Side */}
        <div className="d-flex align-items-center gap-2">
          {user ? (
            <div className="dropdown">
              <button
                className="btn d-flex align-items-center dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <Link className="navbar-brand fw-bold fs-4 text-danger">
                  <i className="bi bi-youtube me-2"></i> Create +
                </Link>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" to="/video/upload">
                    Upload Video
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/blog/addBlog">
                    Create Blog
                  </Link>
                </li>
              </ul>
            </div>
          ) : (
            <Link
              className="navbar-brand fw-bold fs-4 text-danger"
              to="/video/upload"
            >
              <i className="bi bi-youtube me-2"></i> Create +
            </Link>
          )}

          {user ? (
            <div className="dropdown">
              <button
                className="btn d-flex align-items-center dropdown-toggle"
                data-bs-toggle="dropdown"
              >
                <img
                  src={`${BASE_URL}${
                    user.profileImgUrl || "/default-profile.png"
                  }`}
                  className="rounded-circle me-2"
                  width="36"
                  height="36"
                  alt="Profile"
                />
                <span>{user.FullName}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" to="/user/profile">
                    My Profile
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/user/logout">
                    Logout
                  </Link>
                </li>
              </ul>
            </div>
          ) : (
            <>
              <Link className="btn btn-outline-primary me-2" to="/user/login">
                Login
              </Link>
              <Link className="btn btn-primary" to="/user/signup">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <Sidebar
        user={user}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
    </>
  );
};

export default Navbar;
