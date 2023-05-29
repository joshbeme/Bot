"use client";
import { useState, useEffect } from "react";

// Same as use state but we overwrite the default value with the value from local storage
export const usePersistentState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    const persistedState =
      typeof window !== "undefined" && window?.localStorage.getItem(key);

    try {
      return persistedState
        ? { ...defaultValue, ...JSON.parse(persistedState) }
        : defaultValue;
    } catch (err) {
      return defaultValue;
    }
  });

  useEffect(() => {
    // Save to local storage
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [state, key]);

  return [state, setState];
};
