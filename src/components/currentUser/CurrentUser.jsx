import Image from "next/image";
import { useCallback, memo, useState, useEffect } from "react";
import styles from "./user.module.css";
import logoutIcon from "@/icons/logout.png";
import { signOut, useSession } from "next-auth/react";
import { handleLogout } from "@/lib/action";
import { useConnectionContext } from "../homeComponent/HomeComponent";
import { deleteDatabase } from "@/app/websocket/dbUtils";

const CurrentUser = () => {
  const BASE_URL = process.env.NEXT_PUBLIC_IMAGE;
  const { data: session } = useSession();
  const { connectionStatus } = useConnectionContext();
  const [loggingOut, setLoggingOut] = useState(false);

  const logOutUser = useCallback(async () => {
    setLoggingOut(true);
    const result = await handleLogout();
    if (result.success) {
      await deleteDatabase();
      await signOut();
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.profileImage}>
        <Image
          src={BASE_URL + "/" + session.user.profileimage}
          width={38}
          height={38}
          alt={`Profile picture of ${session.user.username}`}
        />
      </div>
      <div className={styles.appName}>
        <div>
          <b>{session?.user?.username}</b>
        </div>
        <div className={styles.connectionStatus}>
          {loggingOut ? "Logging out..." : connectionStatus}
        </div>
      </div>
      <button onClick={logOutUser} title="Logout">
        <Image src={logoutIcon} alt="Logout Button" height={24} width={24} />
      </button>
    </div>
  );
};

export default memo(CurrentUser);
