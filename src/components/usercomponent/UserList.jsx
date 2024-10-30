import styles from "./user.module.css";
import Image from "next/image";
import { memo, useMemo, useCallback } from "react";
import { useChatContext, useHomeContext } from "../homeComponent/HomeComponent";
import Cookies from "js-cookie";

import sentIcon from "@/icons/sent.png";
import notSent from "@/icons/clock.png";

const User = memo(({ id, username, profileimage, unread, status }) => {
  const BASE_URL = process.env.NEXT_PUBLIC_IMAGE;

  const session = JSON.parse(Cookies.get("sessionData"));
  const { openChat } = useHomeContext();
  const { messages } = useChatContext();

  const lastMsg = useMemo(() => {
    return messages
      .filter(
        (message) =>
          (message.sender_id == session.id && message.receiver_id == id) ||
          (message.receiver_id == session.id && message.sender_id == id)
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  }, [messages, id]);

  const handleUserClick = useCallback(() => {
    openChat(id);
  }, [openChat, id]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();
    const isYesterday =
      new Date(now.setDate(now.getDate() - 1)).toDateString() ===
      date.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else if (isYesterday) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      });
    }
  };

  return (
    <div className={styles.eachUser} onClick={handleUserClick}>
      <div className={styles.imageContainer}>
        <div
          className={
            status === "Online"
              ? styles.onlineIndicator
              : styles.offlineIndicator
          }
        ></div>
        <Image
          src={BASE_URL + profileimage}
          width={38}
          height={38}
          alt={`Profile picture of ${username}`}
        />
      </div>
      <div className={styles.flexRight}>
        <div className={styles.lastMessage}>
          <div className={styles.userName}>
            <b>{username}</b>
          </div>
          <div className={styles.lastTime}>
            {lastMsg?.timestamp && formatTime(lastMsg?.timestamp)}
          </div>
        </div>
        <div className={styles.lastMessage}>
          <div className={styles.lastMsg}>
            {lastMsg?.message ||
              (lastMsg?.image && "Photo") ||
              "No messages yet"}
          </div>
          <div className={styles.lastStatus}>
            {lastMsg?.status &&
              (lastMsg?.status === "sent" ? (
                <Image
                  src={sentIcon}
                  alt="Sent"
                  height={16}
                  width={16}
                  style={{ marginBottom: "-2px" }}
                />
              ) : (
                <Image
                  src={notSent}
                  alt="Not sent"
                  height={16}
                  width={16}
                  style={{ marginBottom: "-2px" }}
                />
              ))}
            {unread && <div className={styles.unread}>{unread}</div>}
          </div>
        </div>
      </div>
    </div>
  );
});

User.displayName = "User";

const UsersList = () => {
  const { Users } = useHomeContext();

  const usersList = useMemo(() => {
    return Users.map((user) => <User {...user} key={user.id} />);
  }, [Users]);

  return (
    <div className={styles.userList}>
      {Users.length > 0 ? (
        usersList
      ) : (
        <div className={styles.noUsers}>No users found</div>
      )}
    </div>
  );
};

export default memo(UsersList);
