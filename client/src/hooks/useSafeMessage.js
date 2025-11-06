// Used in:
// - SearchResults.jsx

import { useRef, useCallback } from "react";
import { useMessageApi } from "../context/MessageContext";
import { message } from "antd";

/**
 * Custom React hook: `useSafeMessage`
 * -----------------------------------
 *
 * Can use anywhere.
 *
 * `{contextHolder}` is in context/index.jsx -> `<MessageProvider>`, wrapping the whole app.
 *
 * ---
 *
 * **Behavior:**
 * - Ensures only one message is shown at a time (using an internal lock).
 * - Automatically releases the lock after the message duration.
 * - Supports all standard message types: `"success"`, `"error"`, `"info"`, `"warning"`, and `"loading"`.
 *
 * ---
 *
 * **Example Usage**
 * @example
 * ```js
 * import { useSafeMessage } from "../../../hooks/useSafeMessage"
 *
 * const safeMessage = useSafeMessage();
 *
 * // Display a loading message for 1 second
 * safeMessage("loading", "Данные сохраняются...", 1)
 * ```
 *
 * Same as:
 * ```js
 * await messageApi.open({
 *   type: 'loading',
 *   content: 'Данные сохраняются...',
 *   duration: 1
 * })
 * ```
 *
 * ---
 *
 * @function useSafeMessage
 * @returns {function} A `showMessage` function with the following signature:
 *
 * @param {("success"|"error"|"info"|"warning"|"loading")} type - Type of message to display.
 * @param {string|React.ReactNode} content - The text or node content of the message.
 * @param {number} [duration=2] - Duration in seconds before the message closes automatically.
 *
 * @example
 * const message = useSafeMessage();
 * message("success", "Saved successfully!", 2);
 *
 *
 */
export const useSafeMessage = () => {
  const messageApi = useMessageApi();
  const lockRef = useRef(false);

  const showMessage = useCallback(
    (type, content, duration = 2) => {
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
    },
    [messageApi]
  );
  return showMessage;
};
