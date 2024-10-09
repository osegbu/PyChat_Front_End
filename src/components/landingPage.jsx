"use client";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HomeComponent from "./homeComponent/HomeComponent";

export const LandingPage = () => {
  const { status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const currentSession = await getSession();
      setIsLoading(false);

      if (!currentSession) {
        router.replace("/login");
      }
    };

    if (status === "unauthenticated") {
      checkSession();
    } else {
      setIsLoading(false);
    }
  }, [status, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <HomeComponent />;
};
