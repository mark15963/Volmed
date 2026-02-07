// Used in Footer.jsx
//#region === IMPORTS ===
import { useState, useRef, useEffect, memo } from "react";
import { createPortal } from "react-dom";

import UserChat from "./components/UserChat";
import AdminChat from "./components/AdminChat";
import Button from "../Button";
import { useAuth } from "../../context";
import { useOnClickOutside } from "../../hooks/UX/useOnClickOutside";

import styles from "./styles/chatWidget.module.scss";
import debug from "../../utils/debug";
//#endregion

export const ChatWidget = memo(() => {
  const chatRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const [chatVisible, setChatVisible] = useState(false);
  const [outsideClickEnabled, setOutsideClickEnabled] = useState(false);

  const { authState } = useAuth();

  const handleChatToggle = () => {
    setChatVisible((prev) => !prev);
  };

  // Close chat when clicking outside (but not on the button)
  useEffect(() => {
    if (!chatVisible) {
      setOutsideClickEnabled(false);
      return;
    }

    const timer = setTimeout(() => {
      setOutsideClickEnabled(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [chatVisible]);

  useOnClickOutside(
    [chatRef, buttonRef],
    () => setChatVisible(false),
    outsideClickEnabled,
  );

  if (!authState.isAuthenticated) return null;

  return (
    <>
      <div ref={buttonRef}>
        <Button
          onClick={handleChatToggle}
          text="Чат"
          className={styles.chatButton}
        />
      </div>

      {chatVisible &&
        createPortal(
          <div ref={chatRef} className={styles.chatContainer}>
            {authState.user.status === "admin" ? <AdminChat /> : <UserChat />}
          </div>,
          document.body,
        )}
    </>
  );
});

export default memo(ChatWidget);
