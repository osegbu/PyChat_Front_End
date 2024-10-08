import styles from "./user.module.css";
import Search from "./Search";
import dynamic from "next/dynamic";
import { memo, useMemo, useState } from "react";
import Loader from "./Loader";
import CurrentUser from "../currentUser/CurrentUser";
import {
  useConnectionContext,
  useHomeContext,
} from "../homeComponent/HomeComponent";

const UserComponent = () => {
  const [loading, setLoading] = useState(false);
  const { connectionStatus } = useConnectionContext();
  const { isChatOpen } = useHomeContext();

  const logout = () => {
    setLoading(true);
  };

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
      <CurrentUser logout={logout} />
      {loading && <div className={styles.connectionStatus}>Logging out...</div>}

      {connectionStatus !== "Connected" && (
        <div className={styles.connectionStatus}>{connectionStatus}</div>
      )}
      <Search />
      {UserList}
    </div>
  );
};

export default memo(UserComponent);
