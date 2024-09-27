"use client";
import { SignIn } from "./SignIn";
import { SignUp } from "./SignUp";
import { useState } from "react";

const Form = () => {
  const [isLogin, setIsLogin] = useState(true);

  return isLogin ? (
    <SignIn>
      <div
        style={{ textAlign: "center", marginTop: "16px", fontWeight: "500" }}
      >
        Already have an account?{" "}
        <span
          style={{ color: "yellow", cursor: "pointer" }}
          onClick={() => setIsLogin(!isLogin)}
        >
          Sign Up
        </span>
      </div>
    </SignIn>
  ) : (
    <SignUp>
      <div
        style={{ textAlign: "center", marginTop: "16px", fontWeight: "500" }}
      >
        Already have an account?{" "}
        <span
          style={{ color: "yellow", cursor: "pointer" }}
          onClick={() => setIsLogin(!isLogin)}
        >
          Sign In
        </span>
      </div>
    </SignUp>
  );
};
export default Form;
