"use client";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HomeComponent from "./homeComponent/HomeComponent";

export const LandingPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      const currentSession = await getSession();

      if (!currentSession) {
        router.replace("/login");
      } else {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <HomeComponent />;
};
