"use client";

import { useState, useEffect, useRef } from "react";
import { colors } from "@/config/colors";

interface OtpTimerProps {
  seconds: number;
  onExpire: () => void;
}

export const OtpTimer: React.FC<OtpTimerProps> = ({ seconds, onExpire }) => {
  const [remaining, setRemaining] = useState(seconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    const expiresAt = Date.now() + seconds * 1000;
    expiredRef.current = false;
    setRemaining(seconds);

    const tick = () => {
      const left = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire();
      }
    };

    const interval = setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
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
