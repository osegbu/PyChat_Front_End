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
  const { isChatOpen } = useHomeContext();

  useEffect(() => {
    const handleBackButton = (event) => {
      if (isOpen) {
        event.preventDefault();
        setIsOpen(false);
        window.history.pushState({ chatOpen: false }, "");
      }
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [isOpen]);

  if (!isChatOpen) return null;

  const openDetails = () => setIsOpen(!isOpen);

  return (
    <>
      <ChatComponent isOpen={isOpen} openDetails={openDetails} />
      <DetailsComponent isOpen={isOpen} openDetails={openDetails} />
    </>
  );
};

export default memo(LoadChat);
