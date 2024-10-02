"use client";
import dynamic from "next/dynamic";
import {
  useReducer,
  createContext,
  useContext,
  useMemo,
  useCallback,
  useEffect,
  useState,
  useRef,
  memo,
} from "react";
import { fetchChats, fetchUser } from "@/lib/action";
import UserComponent from "../usercomponent/UserComponent";
import Notification from "../notification/Notification";
import { useSession } from "next-auth/react";
import useWebSocket from "../websocket/WebSocketComponent ";

const HomeContext = createContext();
const ChatContext = createContext();
const NotificationContext = createContext();

const LoadChat = dynamic(() => import("@/components/chatanddetails/LoadChat"));

const initialState = {
  isChatOpen: false,
  userID: null,
  Users: [],
  fullUserList: [],
  typing: {},
};

const BASE_URL = process.env.NEXT_PUBLIC_IMAGE;

const reducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_USER_LIST":
      const userList = action.users.map((users) => ({
        ...users,
        profileimage: `${BASE_URL}/${users.profileimage}`,
      }));
      return { ...state, Users: userList, fullUserList: userList };

    case "UPDATE_USER_STATUS":
      const updatedUsers = state.Users.map((user) =>
        user.id === action.user_id ? { ...user, status: action.status } : user
      );
      return { ...state, Users: updatedUsers, fullUserList: updatedUsers };

    case "UPDATE_TYPING_STATUS":
      return action.status === "typing"
        ? { ...state, typing: { typing: true, user_id: action.user_id } }
        : { ...state, typing: {} };

    case "CHAT_OPEN":
      return { ...state, isChatOpen: true, userID: action.id };

    case "CHAT_CLOSE":
      return { ...state, isChatOpen: false, userID: null };

    case "SEARCH":
      const searchTerm = action.value.toLowerCase();
      const searchResult = state.fullUserList.filter((user) =>
        user.username.toLowerCase().includes(searchTerm)
      );
      return { ...state, Users: searchResult };

    default:
      return state;
  }
};

const HomeComponent = () => {
  const { data: session } = useSession();
  const [notification, setNotification] = useState(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showStatus, setShowStatus] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");

  const onStatusUpdate = useCallback((message) => {
    dispatch({
      type: "UPDATE_USER_STATUS",
      user_id: message.user_id,
      status: message.status,
    });
  }, []);

  const onTyping = useCallback((message) => {
    dispatch({
      type: "UPDATE_TYPING_STATUS",
      user_id: message.sender_id,
      status: message.type,
    });
  }, []);

  const {
    connect,
    sendMessage,
    updateMessages,
    messages,
    connectionStatus,
    flushMessageQueue,
    onlineStatus,
  } = useWebSocket(onStatusUpdate, onTyping);

  const hasFetchedUsers = useRef(false);
  const isFetching = useRef(false);

  const fetchDataAndChats = useCallback(async () => {
    isFetching.current = true;
    setLoadingStage("Fetching users...");
    const users = await fetchUser();
    if (users.success) {
      const userList = users.users.filter((user) => user.id != session.user.id);
      dispatch({ type: "UPDATE_USER_LIST", users: userList });
      console.log("Done getting users");
    } else {
      console.log(users.message);
    }

    setLoadingStage("Fetching chats...");
    const chats = await fetchChats();
    if (chats.success) {
      updateMessages({ chats: chats.chats });
      console.log("Done getting users");
    } else {
      console.log(users.message);
    }

    if (chats.success && users.success) hasFetchedUsers.current = true;
  }, []);

  useEffect(() => {
    if (connectionStatus === "Disconnected") connect();

    if (!isFetching.current) {
      fetchDataAndChats();
    }
  }, []);

  useEffect(() => {
    if (connectionStatus === "Connected") {
      setShowStatus(true);
      flushMessageQueue();
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [connectionStatus]);

  const openChat = useCallback((id) => {
    dispatch({ type: "CHAT_OPEN", id });
  }, []);

  const closeChat = useCallback(() => {
    dispatch({ type: "CHAT_CLOSE" });
  }, []);

  const search = useCallback((value) => {
    dispatch({ type: "SEARCH", value });
  }, []);

  const homeContextValue = useMemo(
    () => ({
      openChat,
      closeChat,
      search,
      isChatOpen: state.isChatOpen,
      Users: state.Users,
    }),
    [openChat, closeChat, search, state.isChatOpen, state.Users]
  );

  const chatContextValue = useMemo(
    () => ({
      userID: state.userID,
      sendMessage,
      messages,
      typing: state.typing,
    }),
    [state.userID, sendMessage, messages, state.typing]
  );

  const notify = useCallback((message) => {
    setNotification(null);
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const notificationValue = useMemo(
    () => ({
      typing: state.typing,
      notify,
    }),
    [notify, state.typing]
  );

  return (
    <>
      {hasFetchedUsers.current ? (
        <HomeContext.Provider value={homeContextValue}>
          <ChatContext.Provider value={chatContextValue}>
            <NotificationContext.Provider value={notificationValue}>
              <div className="mainContainer">
                <UserComponent />
                <LoadChat />
                {notification && <Notification message={notification} />}

                {showStatus && onlineStatus != "Offline" && (
                  <div className="connectedStatus">{connectionStatus}</div>
                )}

                {onlineStatus === "Offline" && (
                  <div className="connectedStatus">Waiting for network...</div>
                )}

                {connectionStatus != "Connected" &&
                  onlineStatus != "Offline" && (
                    <div className="connectedStatus">{connectionStatus}</div>
                  )}
              </div>
            </NotificationContext.Provider>
          </ChatContext.Provider>
        </HomeContext.Provider>
      ) : (
        <div>{loadingStage}</div>
      )}
    </>
  );
};

export const useHomeContext = () => useContext(HomeContext);
export const useChatContext = () => useContext(ChatContext);
export const useNotification = () => useContext(NotificationContext);

export default memo(HomeComponent);
