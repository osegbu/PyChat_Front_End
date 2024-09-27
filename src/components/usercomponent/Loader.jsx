import styles from "./user.module.css";

const Loader = () => {
  return (
    <div className={styles.loader}>
      <div className={styles.imageLoader}></div>
      <div className={styles.flexRight}>
        <div className={styles.userNameLoader}></div>
        <div className={styles.aboutLoader}></div>
      </div>
    </div>
  );
};
export default Loader;
