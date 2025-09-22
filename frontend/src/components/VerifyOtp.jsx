import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const VerifyOtp = () => {
  const BASE_URL = process.env.REACT_APP_BACKEND_URL;
  const [otp, setOtp] = useState("");
  
  const navigate = useNavigate();

  //const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASE_URL}/user/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
         credentials: "include",  // ✅ ADD THIS
        body: JSON.stringify({ otp }),
      });

      const data = await res.json();

      if (res.ok) {
          toast.success("Account created successfully!");
        setTimeout(() => navigate("/"), 1500); // thoda delay smooth UX ke liye
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (err) {
       toast.error("Failed to verify OTP");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Verify OTP</h2>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
        required
      />
      <button type="submit">Verify</button>
        <ToastContainer position="top-center" />
    </form>
  );
};

export default VerifyOtp;
