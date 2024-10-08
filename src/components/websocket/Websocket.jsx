import { useSession } from "next-auth/react";
import { useRef, useState, useCallback, useEffect } from "react";
import {
  startHeartbeat,
  stopHeartbeat,
  handleReconnect,
} from "./connectionUtils";
import {
  persistChatInDB,
  updateChatInDB,
  getAllChatsFromDB,
  initDB,
} from "./dbUtils";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

const useWebSocket = (onStatusUpdate, onTyping) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const socketRef = useRef(null);
  const reconnectIntervalRef = useRef(null);
  const heartbeatRef = useRef(null);
  const missedPingCountRef = useRef(0);
  const [messageQueue, setMessageQueue] = useState([]);

  const PING_INTERVAL = 5000;
  const MAX_MISSED_PINGS = 3;
  const QUEUE_CHECK_INTERVAL = 15000;

  const sendMessage = useCallback(
    (props) => {
      if (
        socketRef.current &&
        connectionStatus === "Connected" &&
        navigator.onLine
      ) {
        socketRef.current.send(props.jsonMessage);
      }

      const jsonMessage = JSON.parse(props.jsonMessage);
      if (jsonMessage.type === "chat") {
        setMessages((prevMessages) => [...prevMessages, jsonMessage]);
        persistChatInDB(jsonMessage);
      }

      setMessageQueue((prevQueue) => [...prevQueue, props.jsonMessage]);
    },
    [connectionStatus]
  );

  const sendPendingMessages = useCallback(() => {
    if (
      socketRef.current &&
      connectionStatus === "Connected" &&
      navigator.onLine
    ) {
      messageQueue.forEach((msg) => {
        socketRef.current.send(msg);
      });
    }
  }, [messageQueue, connectionStatus]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        socketRef.current &&
        connectionStatus === "Connected" &&
        navigator.onLine
      ) {
        sendPendingMessages();
      }
    }, QUEUE_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [connectionStatus, sendPendingMessages]);

  useEffect(() => {
    if (
      socketRef.current &&
      connectionStatus === "Connected" &&
      navigator.onLine
    ) {
      sendPendingMessages();
    }
  }, [connectionStatus]);

  const updateMessages = useCallback(async () => {
    try {
      const allChatsFromDB = await getAllChatsFromDB();
      setMessages((prevMessages) => {
        const existingMessageIds = new Set(prevMessages.map((msg) => msg.uuid));
        const newChats = allChatsFromDB.filter(
          (chat) => !existingMessageIds.has(chat.uuid)
        );

        newChats.forEach((chat) => {
          if (chat.sender_id === session.user.id && chat.status !== "sent") {
            setMessageQueue((prevQueue) => [
              ...prevQueue,
              JSON.stringify(chat),
            ]);
          }
        });

        return [...prevMessages, ...newChats];
      });
    } catch (error) {
      console.error("Failed to update messages from IndexedDB", error);
    }
  }, []);

  const connect = useCallback(() => {
    if (!navigator.onLine) {
      console.warn("No internet connection. Will retry when online.");
      return;
    }

    if (!session || !session.user) {
      console.warn(
        "User session is not available. Cannot connect to WebSocket."
      );
      return;
    }

    if (socketRef.current) {
      return;
    }

    setConnectionStatus("Connecting...");
    const socket = new WebSocket(`ws://${WS_URL}/ws/${session.user.id}`);
    socketRef.current = socket;

    socket.onopen = () => {
      initDB();
      setConnectionStatus("Connected");
      console.log("WebSocket connection established");

      if (reconnectIntervalRef.current) {
        clearTimeout(reconnectIntervalRef.current);
        reconnectIntervalRef.current = null;
      }
      missedPingCountRef.current = 0;

      // Start heartbeat
      heartbeatRef.current = startHeartbeat(
        socketRef,
        missedPingCountRef,
        session,
        PING_INTERVAL,
        MAX_MISSED_PINGS,
        () => handleReconnect(socketRef, reconnectIntervalRef, connect)
      );
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type != "pong") {
        socketRef.current.send(
          JSON.stringify({
            type: "ack",
            message_id: message.message_id,
            receiver_id: session.user.id,
          })
        );
      }

      if (message.type === "chat") {
        setMessages((prevMessages) => [...prevMessages, message]);
        persistChatInDB(message);
      }

      if (message.type === "msgupdate") {
        const updatedQueue = messageQueue.filter(
          (msg) => msg.uuid != message.uuid
        );

        setMessageQueue((prevQueue) => [...updatedQueue]);
        setMessages((prevMessages) =>
          prevMessages.map((chat) =>
            chat.uuid === message.uuid
              ? { ...chat, status: message.event }
              : chat
          )
        );
        updateChatInDB(message.uuid, { status: message.event });
      }

      if (message.type === "pong") {
        missedPingCountRef.current = 0;
      }

      if (message.type === "status") {
        onStatusUpdate(message);
      }

      if (message.type === "blur" || message.type === "typing") {
        onTyping(message);
      }
    };

    socket.onerror = () => {
      setConnectionStatus("Error");
    };

    socket.onclose = () => {
      setConnectionStatus("Disconnected");
      socketRef.current = null;

      stopHeartbeat(heartbeatRef);

      handleReconnect(socketRef, reconnectIntervalRef, connect);
    };
  }, [session, onStatusUpdate, onTyping]);

  useEffect(() => {
    const handleOnline = () => {
      console.log("Internet connection restored. Reconnecting...");
      connect();
    };

    const handleOffline = () => {
      console.warn("Lost internet connection.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [connect]);

  return {
    connect,
    sendMessage,
    updateMessages,
    messages,
    connectionStatus,
  };
};

export default useWebSocket;
