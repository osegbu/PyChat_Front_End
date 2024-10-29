import Image from "next/image";
import styles from "./details.module.css";
import { memo, useMemo } from "react";
import backArrow from "@/icons/arrow.png";
import { useChatContext, useHomeContext } from "../homeComponent/HomeComponent";
import { useSession } from "next-auth/react";

const DetailsComponent = () => {
  const { data: session } = useSession();
  const { userID, messages } = useChatContext();
  const { Users, closeDetails, isDetailsOpen } = useHomeContext();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const BASE_URL_IMG = process.env.NEXT_PUBLIC_IMAGE;

  const user = useMemo(() => {
    return Users.find((user) => user.id === userID);
  }, [userID]);

  if (!user) {
    return <div className={styles.container}>User not found</div>;
  }

  const filteredChat = messages.filter(
    (message) =>
      (message.sender_id == session.user.id &&
        message.receiver_id == userID &&
        message.image) ||
      (message.receiver_id == session.user.id &&
        message.sender_id == userID &&
        message.image)
  );

  return (
    <div className={`${isDetailsOpen && styles.active} ${styles.container}`}>
      <Image
        className={styles.backBtn}
        src={backArrow}
        alt="Back button"
        height={24}
        width={24}
        onClick={() => closeDetails()}
      />
      <div className={styles.userDetails}>
        <div className={styles.profileImage}>
          <Image
            src={BASE_URL_IMG + user.profileimage}
            alt={`Profile picture of ${user.username}`}
            width={150}
            height={150}
          />
        </div>
        <div className={styles.userName}>
          <b>{user.username}</b>
        </div>
      </div>
      {filteredChat != "" && (
        <div className={styles.sharedImages}>
          <span>Shared Image</span>
          <div className={styles.chatImageWrapper}>
            {filteredChat.map((message) => (
              <div className={styles.eachImage} key={message.uuid}>
                <Image
                  placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAABAklEQVR4nO3RQREAIRDAsOP8C1tX8EYBfSQKOtM1M/sj438dwM2QGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDg4LBB+8RC3tAAAAAElFTkSuQmCC"
                  src={
                    message.id
                      ? `${BASE_URL}/static/${message.image}`
                      : message.image
                  }
                  alt="Chat Image"
                  fill
                  sizes="150px"
                  quality={50}
                  objectFit="cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(DetailsComponent);
