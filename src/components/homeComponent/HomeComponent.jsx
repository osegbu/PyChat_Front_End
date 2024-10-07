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
import { fetchUser } from "@/lib/action";
import UserComponent from "../usercomponent/UserComponent";
import { useSession } from "next-auth/react";
import WebSocket from "../websocket/Websocket";

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
  const [state, dispatch] = useReducer(reducer, initialState);
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

  const { connect, sendMessage, messages, connectionStatus, updateMessages } =
    WebSocket(onStatusUpdate, onTyping);

  const hasFetchedUsers = useRef(false);
  const isFetchingUsers = useRef(false);

  const FetchUsers = useCallback(async () => {
    isFetchingUsers.current = true;
    setLoadingStage("Fetching users...");
    const users = await fetchUser();
    if (users.success) {
      const userList = users.users.filter((user) => user.id != session.user.id);
      dispatch({ type: "UPDATE_USER_LIST", users: userList });
      console.log("Done getting users");
      updateMessages();
      hasFetchedUsers.current = true;
    } else {
      console.log(users.message);
    }
  }, []);

  useEffect(() => {
    if (connectionStatus === "Disconnected") connect();
    if (!isFetchingUsers.current) {
      FetchUsers();
    }
  }, []);

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

  return (
    <>
      {hasFetchedUsers.current ? (
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
      ) : (
        <div>{loadingStage}</div>
      )}
    </>
  );
};

export const useHomeContext = () => useContext(HomeContext);
export const useChatContext = () => useContext(ChatContext);
export const useConnectionContext = () => useContext(ConnectionContext);

export default memo(HomeComponent);
