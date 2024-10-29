"use client";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import HomeComponent from "@/components/homeComponent/HomeComponent";
import { fetchUser, fetchChats } from "@/lib/action";
import { usePathname, useRouter } from "next/navigation";
import {
  getAllChatsFromDB,
  initDB,
  persistChatInDB,
} from "@/app/websocket/dbUtils";

export default memo(function Start() {
  const { data: sessionData, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [userList, setUserList] = useState([]);
  const [chatsLoaded, setChatsLoaded] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Loading...");
  const router = useRouter();
  const pathname = usePathname();

  const hasFetchedUsers = useRef(false);
  const isFetchingUsers = useRef(false);
  const isFetchingChats = useRef(false);

  const FetchUsers = useCallback(async () => {
    if (!isFetchingUsers.current) {
      isFetchingUsers.current = true;
      console.log("Fetching...");
      try {
        const allChats = await getAllChatsFromDB();

        const usersResponse = await fetchUser();
        if (usersResponse.success) {
          const filteredUsers = usersResponse.users
            .filter((user) => user.id != sessionData.user.id)
            .map((user) => {
              const userChats = allChats.filter(
                (chat) =>
                  chat.sender_id === user.id || chat.receiver_id === user.id
              );
              userChats.sort(
                (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
              );
              const lastChat = userChats[0];
              return {
                ...user,
                lastChatTimestamp: lastChat?.timestamp || null,
              };
            })
            .sort(
              (a, b) =>
                new Date(b.lastChatTimestamp) - new Date(a.lastChatTimestamp)
            );
          setUserList(filteredUsers);
          hasFetchedUsers.current = true;
        } else {
          console.error(usersResponse.message);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    }
  }, [sessionData]);

  const FetchChats = useCallback(async () => {
    if (!isFetchingChats.current) {
      isFetchingChats.current = true;
      try {
        const dbExists = await initDB();
        const transaction = dbExists.transaction("chats", "readonly");
        const store = transaction.objectStore("chats");
        const chatCountRequest = store.count();

        chatCountRequest.onsuccess = async () => {
          if (chatCountRequest.result === 0) {
            const chats = await fetchChats();
            const chatArray = chats.chats;
            await Promise.all(chatArray.map((chat) => persistChatInDB(chat)));
          }
          setChatsLoaded(true);
        };
        chatCountRequest.onerror = (err) => {
          console.error("Error checking chat database:", err);
          setChatsLoaded(true);
        };
      } catch (error) {
        console.error("Error fetching chats:", error);
        setChatsLoaded(true);
      }
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && pathname !== "/") {
      router.push("/");
    }
  }, [status, pathname, router]);

  useEffect(() => {
    const fetchData = async () => {
      await FetchChats();
      setLoadingMsg("Fetching Chats...");
      if (chatsLoaded) {
        setLoadingMsg("Fetching Users...");
        await FetchUsers();
      }
      setLoading(false);
    };

    if (status === "authenticated") {
      fetchData();
    }
  }, [status, chatsLoaded, FetchUsers, FetchChats]);
  if (loading || !chatsLoaded || !hasFetchedUsers.current) {
    return <div>{loadingMsg}</div>;
  }

  return <HomeComponent userList={userList} />;
});
