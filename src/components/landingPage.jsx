"use client";
import { useSession, getSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const HomeComponent = dynamic(
  () => import("@/components/homeComponent/HomeComponent"),
  { ssr: false, loading: () => <div>Checking Session...</div> }
);

export const LandingPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const currentSession = await getSession();
      if (!currentSession) {
        router.replace("/login");
      } else {
        console.log(currentSession);
      }
    };

    if (status === "unauthenticated") {
      checkSession();
    }
  }, [session, status, router]);

  return <>{session && <HomeComponent />}</>;
};
