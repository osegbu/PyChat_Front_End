import { useEffect, useState } from "react";

const getTimeAgo = (timestamp) => {
  const now = new Date();
  const timeDiff = (now - new Date(timestamp)) / 1000; // difference in seconds

  const intervals = [
    { label: "Yr", seconds: 31536000 },
    { label: "Mon", seconds: 2592000 },
    { label: "Wk", seconds: 604800 },
    { label: "Day", seconds: 86400 },
    { label: "Hr", seconds: 3600 },
    { label: "Min", seconds: 60 },
  ];

  for (const interval of intervals) {
    const result = Math.floor(timeDiff / interval.seconds);
    if (result >= 1) {
      return `${result} ${interval.label}${result > 1 ? "s" : ""}`;
    }
  }

  return "just now";
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

const TimeStamp = ({ timestamp }) => {
  const [timeDisplay, setTimeDisplay] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const timeDiff = (new Date() - new Date(timestamp)) / 1000;
      if (timeDiff < 86400) {
        setTimeDisplay(formatTime(timestamp)); // show 'time ago' if within 24 hours
      } else {
        setTimeDisplay(formatTime(timestamp)); // show actual time after 24 hours
      }
    };

    updateTime();
    const intervalId = setInterval(updateTime, 60000); // update every minute

    return () => clearInterval(intervalId); // clean up on unmount
  }, [timestamp]);

  return timeDisplay;
};

export default TimeStamp;
