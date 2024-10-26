"use client";
import { useState, useCallback } from "react";
import styles from "./login.module.css";
import { login } from "@/lib/action";
import Link from "next/link";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
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

      if (!formData.username || !formData.password) {
        setMessage("All fields are required.");
        return;
      }

      setLoading(true);
      setMessage("");

      const result = await login(formData);
      if (result?.message) {
        setMessage(result.message);
        setLoading(false);
      }
    },
    [formData]
  );

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <div className={styles.formTitle}>
        <b>PyChat</b>
      </div>
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
        {message && <p className={styles.message}>{message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging In..." : "Sign In"}
        </button>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          Don&apos;t have an account? <Link href="/register">Sign Up</Link>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
