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

    if (!currentSession) {
      router.replace("/login");
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true);
    } else if (status === "unauthenticated") {
      checkSession();
    } else {
      setIsLoading(false);
    }
  }, [status, router]);

  if (isLoading || status === "loading") {
    return <div>Loading...</div>;
  }

  return <HomeComponent />;
};
