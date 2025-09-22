import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout({ setUser }) {
  const BASE_URL = process.env.REACT_APP_BACKEND_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        const res = await fetch(`${BASE_URL}/user/logout`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          setUser(null);
          navigate("/user/login");
        } else {
          console.error("Logout failed");
        }
      } catch (err) {
        console.error("Logout error:", err);
      }
    };

    logout();
  }, [setUser, navigate]);

  return <p>Logging out...</p>;
}

export default Logout;
