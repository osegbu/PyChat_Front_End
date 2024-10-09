import { auth } from "@/lib/auth";
import { SessionProvider } from "next-auth/react";
import { LandingPage } from "@/components/landingPage";

export default async function Home() {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <LandingPage />
    </SessionProvider>
  );
}
