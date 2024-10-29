import styles from "./chat.module.css";
import Image from "next/image";
import { useChatContext, useHomeContext } from "../homeComponent/HomeComponent";
import { memo, useMemo } from "react";
import backArrow from "@/icons/arrow.png";

const UserDetails = () => {
  const BASE_URL = process.env.NEXT_PUBLIC_IMAGE;
  const { userID, typing } = useChatContext();
  const { Users, closeChat, openDetails } = useHomeContext();

  const user = useMemo(
    () => Users.find((user) => user.id === userID),
    [userID, Users]
  );

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
        src={BASE_URL + user.profileimage}
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
