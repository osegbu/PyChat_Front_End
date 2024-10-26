"use server";

import { signIn, auth } from "@/lib/auth";
import { generateToken } from "./accessToken";
import { makeApiCall } from "./makeApiCall ";
import { persistChatInDB } from "@/app/websocket/dbUtils";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const handleApiCall = async (url, method, body, headers = {}) => {
  try {
    return await makeApiCall(url, method, body, headers);
  } catch (error) {
    console.error(`${method} request error:`, error);
    throw new Error(error.message);
  }
};

export const signup = async (formData) => {
  const { username, password, confirm_password } = Object.fromEntries(formData);
  const url = `${BASE_URL}/signup`;

  try {
    const credentials = await handleApiCall(url, "POST", {
      username,
      password,
      confirm_password,
    });

    await signIn("credentials", {
      ...credentials,
    });
  } catch (error) {
    if (error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return { success: false, message: `Signup error: ${error.message}` };
  }
};

export const login = async (formData) => {
  const { username, password } = formData;
  const url = `${BASE_URL}/login`;

  try {
    const credentials = await handleApiCall(url, "POST", {
      username,
      password,
    });

    await signIn("credentials", {
      ...credentials,
    });
  } catch (error) {
    if (error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return { success: false, message: `Login error: ${error.message}` };
  }
};

export const fetchUser = async () => {
  const url = `${BASE_URL}/get_all_users`;

  try {
    const users = await handleApiCall(url, "POST");
    return { success: true, users };
  } catch (error) {
    return { success: false, message: `Data fetch error: ${error.message}` };
  }
};

export const fetchChats = async () => {
  const session = await auth();
  const id = session.user.id;
  const url = `${BASE_URL}/load_chat/${id}`;

  try {
    const chats = await handleApiCall(url, "POST", "", {
      Authorization: `Bearer ${generateToken(session.user)}`,
    });
    return { success: true, chats };
  } catch (error) {
    return { success: false, message: `Data fetch error: ${error.message}` };
  }
};

export const handleLogout = async () => {
  const session = await auth();
  const id = session.user.id;
  const url = `${BASE_URL}/logout/${id}`;

  try {
    await handleApiCall(url, "POST");
    return { success: true };
  } catch (error) {
    return { success: false, message: `Error: ${error.message}` };
  }
};
