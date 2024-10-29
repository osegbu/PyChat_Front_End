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
import { useRouter, useSearchParams } from "next/navigation";

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
      const userList = action.users.map((user) => ({
        ...user,
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

const HomeComponent = ({ userList }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, dispatch] = useReducer(reducer, initialState);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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

  const reOrderUsers = useCallback((userList) => {
    dispatch({ type: "UPDATE_USER_LIST", users: userList });
  }, []);

  const { connect, sendMessage, messages, connectionStatus, updateMessages } =
    useWebSocket(onStatusUpdate, onTyping);

  useEffect(() => {
    dispatch({ type: "UPDATE_USER_LIST", users: userList });
    updateMessages();
    connect();
  }, []);

  const openDetails = useCallback(() => {
    setIsDetailsOpen(true);
    const currentSearchParams = new URLSearchParams(window.location.search);
    const chatOpen = currentSearchParams.get("details") === "open";
    if (!chatOpen) {
      const newUrl = "?details=open";
      window.history.pushState(
        { ...window.history.state, as: newUrl, url: newUrl },
        "",
        newUrl
      );
    }
  }, []);

  const closeDetails = useCallback(() => {
    setIsDetailsOpen(false);
    const newUrl = state.isChatOpen ? "?chat=open" : "";
    window.history.replaceState(
      { ...window.history.state, as: newUrl, url: newUrl },
      "",
      newUrl
    );
  }, [state.isChatOpen]);

  const openChat = useCallback(
    (id) => {
      const currentSearchParams = new URLSearchParams(window.location.search);
      const chatOpen = currentSearchParams.get("chat") === "open";

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
    [dispatch]
  );

  const closeChat = useCallback(() => {
    dispatch({ type: "CHAT_CLOSE" });
    const newUrl = "";
    window.history.replaceState(
      { ...window.history.state, as: newUrl, url: newUrl },
      "",
      newUrl
    );
  }, []);

  const search = useCallback((value) => {
    dispatch({ type: "SEARCH", value });
  }, []);

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
      messages,
      typing: state.typing,
      reOrderUsers,
    }),
    [state.userID, sendMessage, messages, state.typing, reOrderUsers]
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

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
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
