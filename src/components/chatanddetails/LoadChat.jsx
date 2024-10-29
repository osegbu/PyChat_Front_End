import { memo } from "react";
import { useHomeContext } from "../homeComponent/HomeComponent";
import ChatComponent from "../chatcomponent/ChatComponent";
import DetailsComponent from "../detailsComponent/DetailsComponent";

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
