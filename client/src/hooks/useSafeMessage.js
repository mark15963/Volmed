//#region ===== Usage: =====
// import { useSafeMessage } from "../../../hooks/useSafeMessage"
//
// const safeMessage = useSafeMessage();
//
// safeMessage("loading", "Данные сохраняются...", 1)
//
// Same as:
// await messageApi.open({
//     type: 'loading',
//     content: 'Данные сохраняются...',
//     duration: 1
//   })
//#endregion

import { useRef } from "react";
import { useMessageApi } from "../context/MessageContext";
import { message } from "antd";

export const useSafeMessage = () => {
  const messageApi = useMessageApi();
  const lockRef = useRef(false);

  const showMessage = (type, content, duration = 2) => {
    if (lockRef.current) return;
    lockRef.current = true;

    const mApi = messageApi || message;

    if (type === "success") mApi.success(content, duration);
    else if (type === "error") mApi.error(content, duration);
    else if (type === "info") mApi.info(content, duration);
    else if (type === "warning") mApi.warning(content, duration);
    else if (type === "loading") mApi.open({ type, content, duration });

    // Reset lock after duration (or default 1s)
    setTimeout(() => (lockRef.current = false), duration * 1000);
  };
  return showMessage;
};
