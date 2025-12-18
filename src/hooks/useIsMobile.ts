import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";

/**
 * Hook to detect if the app is running on a native mobile platform (iOS/Android)
 * via Capacitor
 */
export const useIsNativeMobile = () => {
  const [isNativeMobile, setIsNativeMobile] = useState(false);

  useEffect(() => {
    setIsNativeMobile(Capacitor.isNativePlatform());
  }, []);

  return isNativeMobile;
};

/**
 * Hook to get the current platform (ios, android, web)
 */
export const usePlatform = () => {
  return Capacitor.getPlatform();
};
