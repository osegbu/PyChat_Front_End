import styles from "./user.module.css";
import Image from "next/image";
import { memo, useMemo, useCallback } from "react";
import { useChatContext, useHomeContext } from "../homeComponent/HomeComponent";
import { useSession } from "next-auth/react";

const User = memo(({ id, username, profileimage, status }) => {
  const { data: session } = useSession();
  const { openChat } = useHomeContext();
  const { messages } = useChatContext();

  const lastMsg = useMemo(() => {
    return messages
      .filter(
        (message) =>
          (message.sender_id == session?.user?.id &&
            message.receiver_id == id) ||
          (message.receiver_id == session?.user?.id && message.sender_id == id)
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  }, [messages, session?.user?.id, id]);

  const handleUserClick = useCallback(() => {
    openChat(id);
  }, [openChat, id]);

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
          src={profileimage}
          width={38}
          height={38}
          alt={`Profile picture of ${username}`}
        />
      </div>
      <div className={styles.flexRight}>
        <div className={styles.userName}>{username}</div>
        <div className={styles.lastMsg}>
          {lastMsg?.message || (lastMsg?.image && "Photo") || "No messages yet"}
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
