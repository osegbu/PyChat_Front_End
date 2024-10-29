import { memo, useState, useCallback } from "react";
import styles from "./chat.module.css";
import ChatInputField from "./ChatInputField";
import UserDetails from "./UserDetails";
import { useChatContext, useHomeContext } from "../homeComponent/HomeComponent";
import Image from "next/image";
import cancel from "@/icons/x-button.png";
import Chats from "./Chats";

const ChatComponent = () => {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [imagePreviewSrc, setImagePreviewSrc] = useState("");
  const { userID } = useChatContext();
  const { isDetailsOpen } = useHomeContext();

  const selectImage = useCallback((fileData) => {
    if (fileData) {
      const reader = new FileReader();
      reader.onload = function (e) {
        setImagePreviewSrc(e.target.result);
      };
      reader.readAsDataURL(fileData);
    }
    setIsImageOpen((prevOpen) => !prevOpen);
  }, []);

  return (
    <div className={`${isDetailsOpen && styles.collapse} ${styles.container}`}>
      <UserDetails />
      <Chats />

      {isImageOpen && (
        <div className={styles.uploadImageContainer}>
          <div
            className={styles.closeUploadContainer}
            onClick={() => setIsImageOpen(false)}
          >
            <Image src={cancel} alt="Cancel Button" width={12} height={12} />
          </div>

          {imagePreviewSrc && (
            <div className={styles.imagePreviewWrapper}>
              <Image
                src={imagePreviewSrc}
                alt="Selected Image"
                fill
                style={{
                  objectFit: "contain",
                  maxHeight: "100%",
                  maxWidth: "100%",
                }}
              />
            </div>
          )}
        </div>
      )}

      <ChatInputField
        receiver_id={userID}
        selectImage={selectImage}
        isImageOpen={isImageOpen}
        setIsImageOpen={setIsImageOpen}
      />
    </div>
  );
};

export default memo(ChatComponent);
