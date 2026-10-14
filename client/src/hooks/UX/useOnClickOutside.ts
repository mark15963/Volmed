// Used in ChatWidget.tsx
import { useEffect, RefObject } from "react";

type Handler = (event: MouseEvent | TouchEvent) => void;

/**
 * Trigger callback when user clicks / taps outside of the given element(s)
 *
 * @example
 * ```tsx
 * const chatRef = useRef<HTMLDivElement>(null)
 * const buttonRef = useRef<HTMLDivElement>(null)
 *
 * const [chatVisible, setChatVisible] = useState(false)
 * const [outsideClickEnabled, setOutsideClickEnabled] = useState(false)
 *
 * // Toggle chat + delay enabling outside click detection (prevents instant close)
 * const handleChatToggle = () => {
 *   setChatVisible(prev => !prev)
 *   // We reset the flag immediately — the useEffect will re-enable it
 * }
 *
 * // Delay enabling outside-click listener so the click that opens doesn't close it
 * useEffect(()=>{
 *   if(!chatVisible){
 *     setOutsideClickEnabled(false)
 *     return
 *   }
 *
 *   const timer = setTimeout(()=>{
 *     setOutsideClickEnabled(true)
 *   }, 300)
 *
 *   return () => clearTimeout(timer)
 * }, [chatVisible])
 *
 * // ────────────────────────────────────────────────
 * //          The only thing you need now
 * // ────────────────────────────────────────────────
 * useOnClickOutside(
 *   [chatRef, buttonRef],           // close if click is outside both
 *   () => setChatVisible(false),    // what to do on outside click
 *   outsideClickEnabled             // only listen when safe
 * )
 * // ────────────────────────────────────────────────
 * ```
 */
export function useOnClickOutside<T extends HTMLElement | null = HTMLElement>(
  refs: RefObject<T> | RefObject<T>[],
  handler: Handler,
  // sometimes useful to disable (during animations / mount)
  enabled: boolean = true,
  // which events to listen to
  events: readonly ("mousedown" | "touchstart")[] = [
    "mousedown",
    "touchstart",
  ] as const,
) {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const targetArray = Array.isArray(refs) ? refs : [refs];

      // Check if click happened inside **any** of the referenced elements
      const clickedInside = targetArray.some((ref) => {
        // Safe access — if ref.current is null → false
        return ref.current?.contains(event.target as Node) ?? false;
      });

      if (!clickedInside) {
        handler(event);
      }
    };

    events.forEach((eventName) => {
      const options =
        eventName === "touchstart" ? { passive: false } : undefined;
      document.addEventListener(eventName, listener, options);
    });

    return () => {
      events.forEach((eventName) => {
        document.removeEventListener(eventName, listener);
      });
    };
  }, [refs, handler, enabled, ...events]);
}
