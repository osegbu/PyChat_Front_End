import Form from "@/components/forms/Form";
import { auth } from "@/lib/auth";
import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";

const HomeComponent = dynamic(
  () => import("@/components/homeComponent/HomeComponent"),
  { ssr: false, loading: () => <div>Checking Session.....</div> }
);

export default async function Home() {
  const session = await auth();

  if (!session) {
    return <Form />;
  }

  return (
    <SessionProvider session={session}>
      <HomeComponent />
    </SessionProvider>
  );
}
