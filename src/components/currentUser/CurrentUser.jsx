import Image from "next/image";
import { useState, useCallback, memo } from "react";
import { useSession } from "next-auth/react";
import styles from "./user.module.css";
import EditProfile from "./EditProfile";
import menu from "@/icons/menu.png";
import backArrow from "@/icons/arrow.png";

const CurrentUser = () => {
  const BASE_URL = process.env.NEXT_PUBLIC_PROFILE_IMAGE;

  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleProfile = useCallback(() => {
    setIsProfileOpen((prev) => !prev);
  }, []);

  return (
    <div className={styles.container}>
      <Image
        src={`${BASE_URL}/${session.user.profileimage}`}
        width={38}
        height={38}
        className={styles.profileimage}
        alt={`${session.user.username}'s Profile Image`}
      />
      <div className={styles.flexRight}>
        <div className={styles.userName}>{session.user.username}</div>
        <div className={styles.about}>{session.user.about}</div>
      </div>
      <button
        className={`${isProfileOpen && styles.closeBtn} ${
          styles.expandProfile
        }`}
        onClick={toggleProfile}
      >
        {isProfileOpen ? (
          <Image src={backArrow} alt="back Button" height={24} width={24} />
        ) : (
          <Image src={menu} alt="Menu Button" width={24} height={24} />
        )}
      </button>
      {isProfileOpen && <EditProfile />}
    </div>
  );
};

export default memo(CurrentUser);
