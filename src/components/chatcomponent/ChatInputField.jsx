import Image from "next/image";
import styles from "./chat.module.css";
import imgIcon from "@/icons/image.png";
import { useState, useCallback, useRef, useEffect, memo } from "react";
import { useChatContext, useHomeContext } from "../homeComponent/HomeComponent";
import { useSession } from "next-auth/react";
import debounce from "lodash/debounce";
import { v4 as uuidv4 } from "uuid";
import { getAllChatsFromDB } from "@/app/websocket/dbUtils";

const ChatInputField = ({
  receiver_id,
  selectImage,
  isImageOpen,
  setIsImageOpen,
}) => {
  const { data: session } = useSession();
  const { sendMessage, reOrderNow } = useChatContext();
  const [message, setMessage] = useState("");
  const [fileData, setFileData] = useState(null);
  const textareaRef = useRef(null);
  const file = useRef(null);

  const handleInputChange = useCallback((e) => {
    setMessage(e.target.value);
  }, []);
  const handleSendMessage = useCallback(async () => {
    if (!message.trim() && !fileData) return;

    const uuid = uuidv4();
    const timestamp = new Date().toISOString();

    let base64File = null;

    if (fileData) {
      const reader = new FileReader();
      reader.onloadend = () => {
        base64File = reader.result.split(",")[1];
        const jsonMessage = JSON.stringify({
          type: "chat",
          uuid,
          message,
          sender_id: session.user.id,
          receiver_id,
          timestamp,
          status: "sending...",
          image: `data:${fileData.type};base64,${base64File}`,
          file: {
            name: fileData.name,
            type: fileData.type,
            size: fileData.size,
            data: base64File,
          },
        });

        sendMessage({ jsonMessage });
        setMessage("");
        setFileData(null);
        setIsImageOpen(false);
      };
      reader.readAsDataURL(fileData);
    } else {
      const jsonMessage = JSON.stringify({
        type: "chat",
        uuid,
        message: message.trimStart().trimEnd(),
        sender_id: session.user.id,
        receiver_id,
        timestamp,
        status: "sending...",
      });

      sendMessage({ jsonMessage });
      setMessage("");
    }
    reOrderNow();
  }, [
    message,
    fileData,
    session.user.id,
    receiver_id,
    setIsImageOpen,
    sendMessage,
  ]);

  const handleTyping = useCallback(
    debounce(() => {
      const jsonMessage = JSON.stringify({
        type: "typing",
        sender_id: session?.user?.id,
        receiver_id,
      });
      sendMessage({ jsonMessage });
    }, 300),
    [session?.user?.id, receiver_id, sendMessage]
  );

  const handleBlur = useCallback(() => {
    const jsonMessage = JSON.stringify({
      type: "blur",
      sender_id: session?.user?.id,
      receiver_id,
    });
    sendMessage({ jsonMessage });
  }, [session?.user?.id, receiver_id, sendMessage]);

  const handleImageUpload = useCallback(() => {
    const data = file.current.files[0];
    if (data) {
      setFileData(data);
    }
  }, []);

  useEffect(() => {
    if (fileData) selectImage(fileData);
  }, [fileData, selectImage]);

  useEffect(() => {
    if (!isImageOpen) setFileData(null);
    file.current.value = "";
  }, [isImageOpen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "30px";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  }, [message]);

  return (
    <div className={styles.inputContainer}>
      <div className={styles.inputCover}>
        <button
          className={styles.iconButton}
          onClick={() => file.current.click()}
        >
          <Image src={imgIcon} alt="Select File" width={35} height={30} />
        </button>

        <input
          type="file"
          id="imageUpload"
          accept="image/jpeg, image/png"
          style={{ display: "none" }}
          onChange={handleImageUpload}
          ref={file}
        />
        <textarea
          placeholder="Type a message"
          name="chat"
          className={styles.inputTag}
          value={message}
          onChange={handleInputChange}
          onFocus={handleTyping}
          onBlur={handleBlur}
          ref={textareaRef}
        />

        <button
          className={styles.sendButton}
          onClick={handleSendMessage}
          disabled={!message.trim() && !fileData}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            fill="none"
            viewBox="0 0 32 32"
          >
            <path
              fill="rgba(0,0,0,.7)"
              d="M15.192 8.906a1.143 1.143 0 0 1 1.616 0l5.143 5.143a1.143 1.143 0 0 1-1.616 1.616l-3.192-3.192v9.813a1.143 1.143 0 0 1-2.286 0v-9.813l-3.192 3.192a1.143 1.143 0 1 1-1.616-1.616z"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default memo(ChatInputField);
