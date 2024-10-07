import Image from "next/image";
import { useCallback, memo } from "react";
import styles from "./user.module.css";
import logout from "@/icons/logout.png";
import { signOut } from "next-auth/react";
import { handleLogout } from "@/lib/action";
import { deleteDatabase } from "../websocket/dbUtils";

const CurrentUser = () => {
  const logOutUser = useCallback(async () => {
    const result = await handleLogout();
    if (result.success) {
      await deleteDatabase();
      await signOut();
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.appName}>PyChat</div>
      <button onClick={logOutUser} title="Logout">
        <Image src={logout} alt="Logout Button" height={24} width={24} />
      </button>
    </div>
  );
};

export default memo(CurrentUser);
