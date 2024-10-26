import styles from "./chat.module.css";
import Image from "next/image";
import { useChatContext, useHomeContext } from "../homeComponent/HomeComponent";
import { memo, useMemo, useEffect } from "react";
import backArrow from "@/icons/arrow.png";

const UserDetails = ({ openDetails }) => {
  const { userID, typing } = useChatContext();
  const { Users, closeChat } = useHomeContext();

  const user = useMemo(
    () => Users.find((user) => user.id === userID),
    [userID, Users]
  );

  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      closeChat();
      window.history.pushState(null, "", window.location.pathname);
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [closeChat]);

  return (
    <div className={styles.chatUserDetails}>
      <Image
        className={styles.backBtn}
        src={backArrow}
        alt="Back button"
        height={24}
        width={24}
        onClick={closeChat}
      />
      <Image
        src={user.profileimage}
        width={38}
        height={38}
        alt={`${user.username}'s profile picture`}
        onClick={openDetails}
      />
      <div>
        <div className={styles.userName}>
          <b>{user.username}</b>
        </div>
        {typing?.typing && typing.user_id === userID ? (
          <div className={styles.typingIndicator}>Typing...</div>
        ) : (
          <div
            className={`${styles.onlineStatus} ${
              user.status === "Online" ? styles.online : ""
            }`}
          >
            {user.status}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(UserDetails);
