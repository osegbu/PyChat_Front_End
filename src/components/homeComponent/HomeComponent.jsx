"use client";
import dynamic from "next/dynamic";
import {
  useReducer,
  createContext,
  useContext,
  useMemo,
  useCallback,
  useEffect,
  memo,
  useState,
} from "react";
import UserComponent from "../usercomponent/UserComponent";
import useWebSocket from "@/app/websocket/Websocket";
import { getAllChatsFromDB } from "@/app/websocket/dbUtils";

const HomeContext = createContext();
const ChatContext = createContext();
const ConnectionContext = createContext();

const LoadChat = dynamic(() => import("@/components/chatanddetails/LoadChat"));

const initialState = {
  isChatOpen: false,
  userID: null,
  Users: [],
  fullUserList: [],
  typing: {},
};

const reducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_USER_LIST":
      return { ...state, Users: action.users, fullUserList: action.users };

    case "UPDATE_USER_STATUS":
      const updatedUsers = state.Users.map((user) =>
        user.id === action.user_id ? { ...user, status: action.status } : user
      );
      return { ...state, Users: updatedUsers };

    case "UPDATE_TYPING_STATUS":
      return {
        ...state,
        typing:
          action.status === "typing"
            ? { typing: true, user_id: action.user_id }
            : {},
      };

    case "CHAT_OPEN":
      return { ...state, isChatOpen: true, userID: action.id };

    case "CHAT_CLOSE":
      return { ...state, isChatOpen: false, userID: null };

    case "SEARCH":
      const searchResult = state.fullUserList.filter((user) =>
        user.username.toLowerCase().includes(action.value.toLowerCase())
      );
      return { ...state, Users: searchResult };

    default:
      return state;
  }
};

const HomeComponent = ({ userList }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [reOrder, setReOrder] = useState(false);
  const sound = new Audio("/notification.mp3");

  const reOrderNow = () => {
    setReOrder(true);
  };

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

  const unRead = useCallback(
    (user_id) => {
      return state.Users.map((user) => {
        if (user.id === user_id && state.userID !== user_id) {
          const unread = (user.unread ?? 0) + 1;
          return { ...user, unread };
        }
        return user;
      });
    },
    [state.Users, state.userID]
  );

  const {
    connect,
    sendMessage,
    messages,
    recent,
    connectionStatus,
    updateMessages,
  } = useWebSocket(onStatusUpdate, onTyping);

  useEffect(() => {
    updateMessages();
    connect();
  }, [connect, updateMessages]);

  const openDetails = useCallback(() => {
    setIsDetailsOpen(true);
    const newUrl = "?details=open";
    window.history.pushState(
      { ...window.history.state, as: newUrl },
      "",
      newUrl
    );
  }, []);

  const closeDetails = useCallback(() => {
    setIsDetailsOpen(false);
    const newUrl = state.isChatOpen ? "?chat=open" : "";
    window.history.replaceState(
      { ...window.history.state, as: newUrl },
      "",
      newUrl
    );
  }, [state.isChatOpen]);

  const openChat = useCallback(
    (id) => {
      const currentSearchParams = new URLSearchParams(window.location.search);
      const chatOpen = currentSearchParams.get("chat") === "open";

      const updatedUsers = state.Users.map((user) => {
        if (user.id === id && user.unread > 0) {
          const { unread, ...rest } = user;
          return rest;
        }
        return user;
      });
      dispatch({ type: "UPDATE_USER_LIST", users: updatedUsers });
      dispatch({ type: "CHAT_OPEN", id });

      if (!chatOpen) {
        const newUrl = "?chat=open";
        window.history.pushState(
          { ...window.history.state, as: newUrl, url: newUrl },
          "",
          newUrl
        );
      }
    },
    [dispatch, state.Users]
  );

  const closeChat = useCallback(() => {
    dispatch({ type: "CHAT_CLOSE" });
    window.history.replaceState({ ...window.history.state, as: "/" }, "", "/");
  }, [dispatch]);

  const search = useCallback((value) => {
    dispatch({ type: "SEARCH", value });
  }, []);

  const fetchAndSortUsers = async (allUsers) => {
    const allChats = await getAllChatsFromDB();
    const sortedList = allUsers
      .map((user) => {
        const userChats = allChats.filter(
          (chat) => chat.sender_id === user.id || chat.receiver_id === user.id
        );
        userChats.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const lastChat = userChats[0];
        return { ...user, lastChatTimestamp: lastChat?.timestamp || null };
      })
      .sort(
        (a, b) => new Date(b.lastChatTimestamp) - new Date(a.lastChatTimestamp)
      );

    dispatch({ type: "UPDATE_USER_LIST", users: sortedList });
    setReOrder(false);
  };

  useEffect(() => {
    fetchAndSortUsers(userList);
  }, [reOrder]);

  useEffect(() => {
    if (recent) {
      sound.play();
      const newList = unRead(recent.sender_id);
      fetchAndSortUsers(newList);
    }
  }, [recent]);

  const homeContextValue = useMemo(
    () => ({
      openChat,
      closeChat,
      openDetails,
      closeDetails,
      isDetailsOpen,
      search,
      isChatOpen: state.isChatOpen,
      Users: state.Users,
    }),
    [
      openChat,
      closeChat,
      openDetails,
      closeDetails,
      isDetailsOpen,
      search,
      state.isChatOpen,
      state.Users,
    ]
  );

  const chatContextValue = useMemo(
    () => ({
      userID: state.userID,
      sendMessage,
      reOrderNow,
      messages,
      typing: state.typing,
    }),
    [state.userID, sendMessage, reOrderNow, messages, state.typing]
  );

  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      if (isDetailsOpen) {
        setIsDetailsOpen(false);
      } else if (state.isChatOpen) {
        closeChat();
      }
    };

    window.addEventListener("popstate", handleBackButton);
    return () => window.removeEventListener("popstate", handleBackButton);
  }, [isDetailsOpen, state.isChatOpen, closeChat]);

  return (
    <HomeContext.Provider value={homeContextValue}>
      <ChatContext.Provider value={chatContextValue}>
        <ConnectionContext.Provider value={{ connectionStatus }}>
          <div className="mainContainer">
            <UserComponent />
            <LoadChat />
          </div>
        </ConnectionContext.Provider>
      </ChatContext.Provider>
    </HomeContext.Provider>
  );
};

export const useHomeContext = () => useContext(HomeContext);
export const useChatContext = () => useContext(ChatContext);
export const useConnectionContext = () => useContext(ConnectionContext);

export default memo(HomeComponent);
