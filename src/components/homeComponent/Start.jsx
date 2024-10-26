"use client";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import HomeComponent from "@/components/homeComponent/HomeComponent";
import { fetchUser, fetchChats } from "@/lib/action";
import { usePathname, useRouter } from "next/navigation";
import { initDB, persistChatInDB } from "@/app/websocket/dbUtils";

export default memo(function Start() {
  const { data: sessionData, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [userList, setUserList] = useState([]);
  const [chatsLoaded, setChatsLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const hasFetchedUsers = useRef(false);
  const isFetchingUsers = useRef(false);
  const isFetchingChats = useRef(false);

  const FetchUsers = useCallback(async () => {
    if (!isFetchingUsers.current) {
      isFetchingUsers.current = true;
      const users = await fetchUser();
      if (users.success) {
        const filteredUsers = users.users.filter(
          (user) => user.id != sessionData.user.id
        );
        setUserList(filteredUsers);
        hasFetchedUsers.current = true;
      } else {
        console.log(users.message);
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
      await FetchUsers();
      setLoading(false);
    };

    if (status === "authenticated") {
      fetchData();
    }
  }, [status, FetchUsers, FetchChats]);

  if (loading || !chatsLoaded || !hasFetchedUsers.current) {
    return <div>Loading data...</div>;
  }

  return <HomeComponent userList={userList} />;
});
