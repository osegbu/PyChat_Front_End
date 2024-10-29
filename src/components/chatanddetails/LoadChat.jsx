import dynamic from "next/dynamic";
import { DetailLoader } from "../detailsComponent/DetailLoader";
import UserDetailLoader from "../chatcomponent/UserDetailLoader";
import { memo, useState, useEffect } from "react";
import { useHomeContext } from "../homeComponent/HomeComponent";

const ChatComponent = dynamic(() => import("../chatcomponent/ChatComponent"), {
  ssr: false,
  loading: () => <UserDetailLoader />,
});

const DetailsComponent = dynamic(
  () => import("../detailsComponent/DetailsComponent"),
  {
    ssr: false,
    loading: () => <DetailLoader />,
  }
);

const LoadChat = () => {
  const { isChatOpen } = useHomeContext();

  if (!isChatOpen) return null;

  return (
    <>
      <ChatComponent />
      <DetailsComponent />
    </>
  );
};

export default memo(LoadChat);
