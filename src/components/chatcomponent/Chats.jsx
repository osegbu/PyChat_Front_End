import { useChatContext } from "../homeComponent/HomeComponent";
import { memo, useRef, useEffect } from "react";
import styles from "./chat.module.css";
import Image from "next/image";
import { useSession } from "next-auth/react";

const Chats = () => {
  const endRef = useRef();
  const { data: session } = useSession();
  const { userID, messages } = useChatContext();
  const BASE_URL = process.env.NEXT_PUBLIC_CHAT_URL;

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);

    const dayOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const isSameDay = (date1, date2) =>
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    if (isSameDay(messageDate, today)) {
      return "Today";
    } else if (isSameDay(messageDate, yesterday)) {
      return "Yesterday";
    } else if (messageDate >= oneWeekAgo && messageDate < today) {
      return dayOfWeek[messageDate.getDay()];
    } else {
      return messageDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const filteredChat = messages.filter(
    (message) =>
      (message.sender_id == session.user.id && message.receiver_id == userID) ||
      (message.receiver_id == session.user.id && message.sender_id == userID)
  );

  const groupMessagesByDate = () => {
    return filteredChat.reduce((grouped, message) => {
      const date = formatDate(message.timestamp);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
      return grouped;
    }, {});
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredChat]);

  const groupedMessages = groupMessagesByDate();

  return (
    <div className={styles.msgContainer}>
      <div style={{ display: "flow-root" }}>
        {Object.entries(groupedMessages).map(([date, messages]) => (
          <div key={date}>
            <div className={styles.chatDate}>
              <span>{date}</span>
            </div>
            {messages.map((message) => (
              <div
                className={
                  message.sender_id == session.user.id
                    ? styles.senderChat
                    : styles.receiverChat
                }
                key={message.uuid}
              >
                {message.image && (
                  <div className={styles.chatImageWrapper}>
                    <Image
                      placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAABAklEQVR4nO3RQREAIRDAsOP8C1tX8EYBfSQKOtM1M/sj438dwM2QGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDg4LBB+8RC3tAAAAAElFTkSuQmCC"
                      src={
                        message.id
                          ? `${BASE_URL}/static/${message.image}`
                          : message.image
                      }
                      alt="Chat Image"
                      width={200}
                      height={200}
                      objectFit="contain"
                    />
                  </div>
                )}

                {message.message && (
                  <div
                    className={styles.chatMessage}
                    dangerouslySetInnerHTML={{
                      __html: message.message.replace(/\n/g, "<br />"),
                    }}
                  />
                )}
                <span className={styles.chatTime}>
                  {formatTime(message.timestamp)} {message.status}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div ref={endRef}></div>
    </div>
  );
};
export default memo(Chats);
