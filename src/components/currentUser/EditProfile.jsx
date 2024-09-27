import Image from "next/image";
import { useState, useCallback, memo, useRef, useEffect } from "react";
import { updateUsername, updateAbout, handleLogout } from "@/lib/action";
import styles from "./user.module.css";
import { useNotification } from "../homeComponent/HomeComponent";
import Uploader from "./Uploader";
import { signIn, signOut, useSession } from "next-auth/react";

const EditProfile = () => {
  const BASE_URL = process.env.NEXT_PUBLIC_PROFILE_IMAGE;

  const { data: session, status } = useSession();

  const textareaRef = useRef(null);

  const [state, setState] = useState({
    userName: session.user.username,
    userAbout: session.user.about,
    username_loading: false,
    about_loading: false,
    loading: false,
  });

  const { userName, userAbout, username_loading, about_loading, loading } =
    state;
  const { notify } = useNotification();

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const preventEnterKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const isUserNameChanged = session.user.username !== userName;
  const isUserAboutChanged = session.user.about !== userAbout;

  const handleUpdate = useCallback(
    async (type, value) => {
      if (!value.trim()) {
        notify({ success: false, message: `${type} cannot be empty` });
        return;
      }

      if (type === "username") {
        setState((prevState) => ({ ...prevState, username_loading: true }));
      } else {
        setState((prevState) => ({ ...prevState, about_loading: true }));
      }

      try {
        const formData = { [type]: value };
        const result =
          type === "username"
            ? await updateUsername(formData)
            : await updateAbout(formData);

        if (result.success) {
          await signIn("credentials", {
            redirect: false,
            ...result.data,
          });
        }
        notify(result);
      } finally {
        if (type === "username") {
          setState((prevState) => ({ ...prevState, username_loading: false }));
        } else {
          setState((prevState) => ({ ...prevState, about_loading: false }));
        }
      }
    },
    [notify]
  );

  const logOutUser = useCallback(async () => {
    setState((prevState) => ({ ...prevState, loading: true }));

    try {
      const result = await handleLogout();
      if (result.success) {
        await signOut();
      }
    } finally {
      setState((prevState) => ({ ...prevState, loading: false }));
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "30px";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight + 1,
        112
      )}px`;
    }
  }, [userAbout]);

  return (
    <div className={styles.editProfileContainer}>
      <div className={styles.editProfileImage}>
        <div className={styles.imageCover}>
          <div className={styles.imageCoverLoader}></div>
          <Uploader />
          {status === "loading" ? (
            <div className={styles.imageCoverLoader}></div>
          ) : (
            <Image
              className={styles.profileimage}
              src={`${BASE_URL}/${session.user.profileimage}`}
              alt={`${session.user.username} profile image`}
              width={160}
              height={160}
            />
          )}
        </div>
      </div>

      <div className={styles.form}>
        <div className={styles.formDiv}>
          <input
            type="text"
            value={userName}
            name="userName"
            onChange={handleInputChange}
            onKeyDown={preventEnterKey}
          />
          {isUserNameChanged && (
            <button
              type="button"
              className={styles.logOutButton}
              disabled={username_loading}
              onClick={() => handleUpdate("username", userName)}
            >
              {username_loading ? "Saving..." : "Save"}
            </button>
          )}
        </div>

        <div className={styles.formDiv}>
          <textarea
            type="text"
            value={userAbout}
            name="userAbout"
            ref={textareaRef}
            onChange={handleInputChange}
            onKeyDown={preventEnterKey}
          />
          {isUserAboutChanged && (
            <button
              type="button"
              className={styles.logOutButton}
              disabled={about_loading}
              onClick={() => handleUpdate("about", userAbout)}
            >
              {about_loading ? "Saving..." : "Save"}
            </button>
          )}
        </div>
      </div>

      <div className={styles.signOutContainer}>
        <button
          className={styles.logOutButton}
          disabled={loading}
          onClick={logOutUser}
        >
          {loading ? "Signing Out..." : "Sign Out"}
        </button>
      </div>
    </div>
  );
};

export default memo(EditProfile);
