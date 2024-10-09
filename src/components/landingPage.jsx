"use client";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HomeComponent from "./homeComponent/HomeComponent";

export const LandingPage = () => {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const currentSession = await getSession();

      if (!currentSession) {
        router.replace("/login");
      }
    };

    checkSession();
  }, [router]);

  return <HomeComponent />;
};
