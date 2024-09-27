import { useEffect, useState } from "react";
import styles from "./notification.module.css";

const Notification = ({ message }) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(true);
  }, []);

  return (
    <div
      className={`${styles.container} ${isActive ? styles.active : ""} ${
        message.success ? styles.success : styles.error
      }`}
    >
      {message.message}
    </div>
  );
};

export default Notification;
