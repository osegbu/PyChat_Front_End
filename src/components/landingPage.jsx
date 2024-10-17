"use client";
import { useSession, getSession } from "next-auth/react";
import { useEffect } from "react";
import HomeComponent from "./homeComponent/HomeComponent";

export const LandingPage = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    const checkSession = async () => {
      const currentSession = await getSession();
      if (!currentSession) {
        window.location.href = "/login";
      }
    };
    checkSession();
  }, [session]);

  if (session) {
    return <HomeComponent />;
  }
};
