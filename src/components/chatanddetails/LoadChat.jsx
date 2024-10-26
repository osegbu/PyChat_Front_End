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
  const [isOpen, setIsOpen] = useState(false);
  const { isChatOpen, closeChat } = useHomeContext();

  const openDetails = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();

      if (isOpen) {
        setIsOpen(false);
      } else {
        closeChat();
      }
    };
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [isOpen, closeChat]);

  if (!isChatOpen) return null;

  return (
    <>
      <ChatComponent isOpen={isOpen} openDetails={openDetails} />
      <DetailsComponent isOpen={isOpen} openDetails={openDetails} />
    </>
  );
};

export default memo(LoadChat);
