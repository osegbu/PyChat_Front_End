import Image from "next/image";
import { useCallback, memo, useState, useEffect } from "react";
import styles from "./user.module.css";
import logoutIcon from "@/icons/logout.png";
import { getSession, signOut, useSession } from "next-auth/react";
import { handleLogout } from "@/lib/action";
import { deleteDatabase } from "../websocket/dbUtils";
import { useConnectionContext } from "../homeComponent/HomeComponent";
import { useRouter } from "next/navigation";

const CurrentUser = () => {
  const BASE_URL = process.env.NEXT_PUBLIC_IMAGE;
  const router = useRouter();
  const { data: session } = useSession();
  const { connectionStatus } = useConnectionContext();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logOutUser = useCallback(async () => {
    const result = await handleLogout();
    if (result.success) {
      setLoggingOut(true);
      await deleteDatabase();
      await signOut({ redirect: false });
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const currentSession = await getSession();
      if (!currentSession) {
        window.location.href = "/login";
      } else {
        setIsLoading(false);
      }
    };
    checkSession();
  }, [session]);

  return (
    <div className={styles.container}>
      <div className={styles.profileImage}>
        <Image
          src={BASE_URL + "/" + session?.user?.profileimage}
          width={38}
          height={38}
          alt={`Profile picture of ${session?.user?.username}`}
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
