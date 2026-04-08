"use client";

import { useState, useEffect } from "react";
import { colors } from "@/config/colors";

interface OtpTimerProps {
  seconds: number;
  onExpire: () => void;
}

export const OtpTimer: React.FC<OtpTimerProps> = ({ seconds, onExpire }) => {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <span
      className={`font-mono font-semibold ${remaining < 60 ? colors.error.text : colors.text.secondary}`}
    >
      {mins}:{secs.toString().padStart(2, "0")}
    </span>
  );
};

export default OtpTimer;
