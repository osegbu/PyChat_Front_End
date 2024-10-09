"use client";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HomeComponent from "./homeComponent/HomeComponent";

export const LandingPage = () => {
  const { status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = async () => {
    const currentSession = await getSession();
    setIsLoading(false);

    if (!currentSession) {
      router.replace("/login");
    } else {
      setIsLoading(false);
      console.log(currentSession);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      checkSession();
    } else {
      console.log("No show in useEffect");
      setIsLoading(false);
    }
  }, [isLoading, status, router]);

  return <>{isLoading ? <div>Loading...</div> : <HomeComponent />}</>;
};
