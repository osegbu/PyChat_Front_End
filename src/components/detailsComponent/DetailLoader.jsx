import styles from "./details.module.css";

export const DetailLoader = () => {
  return (
    <div className={styles.container}>
      <div className={styles.userDetails}>
        <div className={styles.imageEl}></div>
        <div className={styles.userNameLoader}></div>
        <div className={styles.userStatusLoader}></div>
      </div>
    </div>
  );
};
