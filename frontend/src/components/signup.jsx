import React, { useState } from "react";
import styles from "./signup.module.css";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const BASE_URL = process.env.REACT_APP_BACKEND_URL;
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/user/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
         credentials: "include",
        body: JSON.stringify({
          FullName: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("OTP sent to your email!");
        //toast.success("OTP sent to your email!");
        navigate("/verifyOtp", { state: { email: form.email } });
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError(err.message || "Failed to sign up");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Sign Up</h2>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.inputGroup}>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" className={styles.button}>
        Sign Up
      </button>
       <p>For Testing Use - test@example.com and password - 1234</p>

        {/* Signup Link */}
      <p>
        Already have an account?{" "}
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => navigate("/user/login")}
        >
          Login
        </span>
      </p>
      
    </form>
  );
};

export default Signup;
