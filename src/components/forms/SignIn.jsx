"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { login, fetchChats } from "@/lib/action";
import { persistChatInDB } from "../websocket/dbUtils";

export const SignIn = ({ children }) => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
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

      try {
        const result = await login(formData);

        if (result.success) {
          setMessage("Login successful!");

          const chats = await fetchChats();
          if (chats.success) {
            const chatArray = chats.chats;

            await Promise.all(
              chatArray.map(async (chat) => {
                if (chat.sender_id === result?.data?.id) {
                  chat.status = "sent";
                }
                await persistChatInDB(chat);
              })
            );

            console.log("Chats successfully persisted in IndexedDB");
          }
          router.refresh("/");
        } else {
          setMessage(result.message);
        }
      } catch (error) {
        setMessage("An error occurred during signin. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [formData, router]
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
        {message && <p className={styles.message}>{message}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </button>
        {children}
      </div>
    </form>
  );
};
