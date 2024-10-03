import { useSession } from "next-auth/react";
import { useRef, useState, useCallback, useEffect } from "react";

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

  const sendMessage = useCallback(
    (props) => {
      if (socketRef.current && connectionStatus === "Connected") {
        socketRef.current.send(props.jsonMessage);
      }
      const jsonMessage = JSON.parse(props.jsonMessage);

      if (jsonMessage?.file?.data) {
        const imageSrc = `data:${jsonMessage?.file.type};base64,${jsonMessage?.file.data}`;
        jsonMessage.image = imageSrc;
      }

      if (jsonMessage.type === "chat") {
        setMessages((prevMessages) => [...prevMessages, jsonMessage]);
        setMessageQueue((prevQueue) => [...prevQueue, props.jsonMessage]);
      }
    },
    [connectionStatus]
  );

  const flushMessageQueue = useCallback(() => {
    if (
      messageQueue.length > 0 &&
      socketRef.current &&
      connectionStatus === "Connected"
    ) {
      messageQueue.forEach((msg) => {
        socketRef.current.send(msg);
      });
    }
  }, [messageQueue, connectionStatus]);

  const updateMessages = useCallback(
    ({ chats }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        ...chats.map((chat) => ({
          ...chat,
          ...(chat.sender_id == session?.user?.id && { status: "sent" }),
        })),
      ]);
    },
    [session?.user?.id]
  );

  const startHeartbeat = useCallback(() => {
    heartbeatRef.current = setInterval(() => {
      if (socketRef.current) {
        socketRef.current.send(
          JSON.stringify({ type: "ping", user_id: session?.user?.id })
        );
        missedPingCountRef.current += 1;

        if (missedPingCountRef.current >= MAX_MISSED_PINGS) {
          console.warn("Max missed pings reached. Reconnecting...");
          socketRef.current.close();
        }
      }
    }, PING_INTERVAL);
  }, [session?.user?.id]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
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
      setConnectionStatus("Connected");
      console.log("WebSocket connection established");

      if (reconnectIntervalRef.current) {
        clearTimeout(reconnectIntervalRef.current);
        reconnectIntervalRef.current = null;
      }
      missedPingCountRef.current = 0;

      startHeartbeat();
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "pong") {
        missedPingCountRef.current = 0;
      }

      setMessages((prevMessages) => {
        if (message.type === "chat") {
          return [...prevMessages, message];
        }

        if (message.type === "msgupdate") {
          setMessageQueue((messageQueue) =>
            messageQueue.filter((msg) => {
              msg.uuid != message.uuid;
            })
          );

          return prevMessages.map((chat) =>
            chat.uuid === message.uuid
              ? { ...chat, status: message.event }
              : chat
          );
        }

        if (message.type === "status") {
          onStatusUpdate(message);
        }

        if (message.type === "blur" || message.type === "typing") {
          onTyping(message);
        }

        return prevMessages;
      });
    };

    socket.onerror = () => {
      setConnectionStatus("Error");
    };

    socket.onclose = () => {
      setConnectionStatus("Disconnected");
      socketRef.current = null;
      stopHeartbeat();

      if (navigator.onLine) {
        reconnectIntervalRef.current = setTimeout(connect, 5000);
      } else {
        console.warn(
          "No internet connection. Waiting for network to reconnect."
        );
      }
    };
  }, [session, flushMessageQueue, startHeartbeat, stopHeartbeat]);

  return {
    connect,
    sendMessage,
    updateMessages,
    flushMessageQueue,
    messages,
    connectionStatus,
  };
};

export default useWebSocket;
