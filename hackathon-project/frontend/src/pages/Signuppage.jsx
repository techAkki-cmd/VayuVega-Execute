import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import SignupForm from "@/components/signup/SignupForm";
import OtpVerification from "@/components/signup/OtpVerification";

const Signuppage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Routes>
        <Route index element={<SignupForm />} />
        <Route path="verify" element={<OtpVerification />} />
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </div>
  );
};

export default Signuppage;