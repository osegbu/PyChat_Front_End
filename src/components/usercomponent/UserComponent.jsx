import styles from "./user.module.css";
import Search from "./Search";
import dynamic from "next/dynamic";
import { memo, useMemo } from "react";
import Loader from "./Loader";
import CurrentUser from "../currentUser/CurrentUser";
import { useHomeContext } from "../homeComponent/HomeComponent";

const UserComponent = () => {
  const { isChatOpen } = useHomeContext();

  const MemoizedUserList = dynamic(() => import("./UserList"), {
    ssr: false,
    loading: () => (
      <div className={styles.userListLoader}>
        <Loader />
        <Loader />
        <Loader />
        <Loader />
        <Loader />
        <Loader />
        <Loader />
      </div>
    ),
  });

  const UserList = useMemo(() => <MemoizedUserList />, []);

  return (
    <div className={`${isChatOpen && styles.collapse} ${styles.container}`}>
      <CurrentUser />
      <Search />
      {UserList}
    </div>
  );
};

export default memo(UserComponent);
