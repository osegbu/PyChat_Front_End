"use client";

import { useCallback, useState } from "react";
import { signup } from "@/lib/action";
import styles from "./login.module.css";
import Link from "next/link";

const RegisterForm = () => {
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

      const formDataEntries = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        formDataEntries.append(key, value)
      );

      const result = await signup(formDataEntries);
      if (result?.message) {
        setMessage(result.message);
        setLoading(false);
      }
    },
    [formData]
  );

  return (
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
          Already have an account? <Link href="/login">Sign In</Link>
        </div>
      </div>
    </form>
  );
};

export default RegisterForm;
