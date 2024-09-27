import styles from "./chat.module.css";

const UserDetailLoader = () => {
  return (
    <div className={styles.container}>
      <div className={styles.chatUserDetails}>
        <div className={styles.imageEl}></div>
        <div>
          <div className={styles.usernameLoader}></div>
          <div className={styles.onlineStatusLoader}></div>
        </div>
      </div>
    </div>
  );
};
export default UserDetailLoader;
