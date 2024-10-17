"use client";

import { useCallback, useEffect, useState } from "react";
import { signup } from "@/lib/action";
import styles from "./login.module.css";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";

const RegisterPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const currentSession = await getSession();
      if (currentSession) {
        router.replace("/");
      } else {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirm_password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "username") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value.replace(/\s+/g, ""),
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (
        !formData.username ||
        !formData.password ||
        !formData.confirm_password
      ) {
        setMessage("All fields are required.");
        return;
      }

      if (formData.password !== formData.confirm_password) {
        setMessage("Passwords do not match.");
        return;
      }

      setLoading(true);
      setMessage("");

      try {
        const formDataEntries = new FormData();
        Object.entries(formData).forEach(([key, value]) =>
          formDataEntries.append(key, value)
        );

        const result = await signup(formDataEntries);

        if (result.success) {
          setMessage("Signup successful!");
        } else {
          setMessage(result.message);
        }
      } catch (error) {
        setMessage("An error occurred during signup. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [formData]
  );

  return (
    <>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.formTitle}>PyChat</div>
          <div className={styles.formBody}>
            <label>
              Your Name:
              <input
                name="username"
                type="text"
                placeholder="First & Last Name"
                value={formData.username}
                onChange={handleChange}
              />
            </label>
            <label>
              Password:
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </label>
            <label>
              Confirm Password:
              <input
                name="confirm_password"
                type="password"
                placeholder="Enter the password above"
                value={formData.confirm_password}
                onChange={handleChange}
              />
            </label>
            {message && <p className={styles.message}>{message}</p>}
            <button type="submit" disabled={loading}>
              {loading ? "Signing Up..." : "Sign Up"}
            </button>

            <div style={{ textAlign: "center", marginTop: "16px" }}>
              Already have an account?{" "}
              <span
                style={{ color: "yellow", cursor: "pointer" }}
                onClick={() => router.replace("/login")}
              >
                Sign In
              </span>
            </div>
          </div>
        </form>
      )}
    </>
  );
};

export default RegisterPage;
