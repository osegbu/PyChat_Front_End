import { useCallback, useRef, useState } from "react";
import { uploadProfileImage } from "@/lib/action";
import { useNotification } from "../homeComponent/HomeComponent";
import cameraIcon from "@/icons/camera.png";
import spinner from "@/icons/spinner-2.gif";
import Image from "next/image";
import styles from "./user.module.css";
import { signIn } from "next-auth/react";

const Uploader = () => {
  const { notify } = useNotification();
  const [loading, setLoading] = useState(false);
  const inputEl = useRef();

  const handleFileChange = useCallback(async () => {
    setLoading(true);
    try {
      const file = inputEl.current?.files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const result = await uploadProfileImage(formData);
        notify(result);

        if (result.success) {
          await signIn("credentials", {
            redirect: false,
            ...result.data,
          });
        }
      }
    } finally {
      setLoading(false);
      inputEl.current.value = "";
    }
  });

  return (
    <div className={`${styles.coverDiv} ${loading && styles.active}`}>
      <input
        type="file"
        accept="image/jpeg, image/png"
        onChange={handleFileChange}
        ref={inputEl}
        className={styles.hiddenInput}
      />
      <button
        className={styles.uploadBtn}
        disabled={loading}
        onClick={() => inputEl.current.click()}
      >
        {loading ? (
          <Image src={spinner} alt="spinner" width={28} height={28} />
        ) : (
          <Image src={cameraIcon} alt="camera" width={28} height={28} />
        )}
      </button>
    </div>
  );
};

export default Uploader;
