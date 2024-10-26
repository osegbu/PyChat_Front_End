import { auth } from "@/lib/auth";
import { SessionProvider } from "next-auth/react";
import Start from "@/components/homeComponent/Start";

export default async function Home() {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <Start />
    </SessionProvider>
  );
}
