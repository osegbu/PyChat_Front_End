"use client";
import { useState, useCallback, memo, useEffect } from "react";
import styles from "./login.module.css";
import { login, fetchChats } from "@/lib/action";
import { useRouter } from "next/navigation";
import { persistChatInDB } from "@/components/websocket/dbUtils";
import { getSession, useSession } from "next-auth/react";

const LoginPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const currentSession = await getSession();
      if (currentSession && !isFetching) {
        setIsFetching(true);
        setMessage("Loading chats...");
        const chats = await fetchChats();
        if (chats.success) {
          const chatArray = chats.chats;

          await Promise.all(
            chatArray.map(async (chat) => {
              await persistChatInDB(chat);
            })
          );
          router.push("/");
        }
      } else {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

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

      try {
        const result = await login(formData);

        if (!result.success) {
          setMessage(result.message);
        }
      } catch (error) {
        setMessage("An error occurred during signin. Please try again.");
        console.log(error);
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
            {message && <p className={styles.message}>{message}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Logging In..." : "Sign In"}
            </button>

            <div style={{ textAlign: "center", marginTop: "16px" }}>
              Don&apos;t have an account?{" "}
              <span
                style={{ color: "yellow", cursor: "pointer" }}
                onClick={() => router.replace("/register")}
              >
                Sign Up
              </span>
            </div>
          </div>
        </form>
      )}
    </>
  );
};

export default LoginPage;
