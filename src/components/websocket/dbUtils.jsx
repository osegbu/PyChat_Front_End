export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ChatDB", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("chats")) {
        db.createObjectStore("chats", { keyPath: "uuid" });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      reject(event);
    };
  });
};

export const persistChatInDB = async (chat) => {
  try {
    const db = await initDB();
    const transaction = db.transaction("chats", "readwrite");
    const store = transaction.objectStore("chats");
    store.put(chat);
  } catch (error) {
    console.error("Failed to persist chat in IndexedDB", error);
  }
};

export const updateChatInDB = async (uuid, updatedChat) => {
  try {
    const db = await initDB();
    const transaction = db.transaction("chats", "readwrite");
    const store = transaction.objectStore("chats");
    const existingChatRequest = store.get(uuid);

    existingChatRequest.onsuccess = () => {
      const existingChat = existingChatRequest.result;
      if (existingChat) {
        const updated = { ...existingChat, ...updatedChat };
        store.put(updated);
      }
    };
  } catch (error) {
    console.error("Failed to update chat in IndexedDB", error);
  }
};

export const getAllChatsFromDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ChatDB", 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction("chats", "readonly");
      const store = transaction.objectStore("chats");
      const allChatsRequest = store.getAll();

      allChatsRequest.onsuccess = () => {
        const allChats = allChatsRequest.result;
        const sortedChats = allChats.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        resolve(sortedChats);
      };

      allChatsRequest.onerror = (err) => {
        reject(err);
      };
    };

    request.onerror = (err) => {
      reject(err);
    };
  });
};

export const deleteDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase("ChatDB");

    request.onsuccess = () => {
      console.log("ChatDB deleted successfully.");
      resolve();
    };

    request.onerror = (err) => {
      console.error("Error deleting ChatDB:", err);
      resolve();
    };

    request.onblocked = () => {
      console.warn("ChatDB deletion is blocked.");
      resolve();
    };
  });
};
