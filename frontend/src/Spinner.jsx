import React from "react";
import "./Spinner.css"; // spinner ka CSS yahin import karenge

const Spinner = () => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
};

export default Spinner;
