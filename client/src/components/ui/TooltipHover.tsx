// Used in PatientsCount.jsx
import { FC, useState } from "react";
import styles from "./TooltipHover.module.scss";
import { TooltipHoverProps } from "../../interfaces";

/**
 * TooltipHover component
 * ----------------------
 * A more stylized version of:
 * ```html
 * <abbr title="Oh my god">OMG</abbr>
 * ```
 *
 * Wrap an element you want to have a tooltip and in the `content` prop you add the component you want to be seen as a tooltip
 *
 * @example
 * ```jsx
 * <TooltipHover
 *   content={
 *     <>
 *       <strong>
 *         Всего пациентов:
 *       </strong>
 *
 *       {loading ? '' : count}
 *     </>
 *   }
 * >
 *   <span>Пациенты в стационаре:</span>
 * </TooltipHover>
 * ```
 */
export const TooltipHover: FC<TooltipHoverProps> = ({
  children,
  content,
  className = "",
  delay = 0,
}) => {
  const [show, setShow] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleEnter = () => {
    if (delay > 0) {
      const id = setTimeout(() => setShow(true), delay);
      setTimeoutId(id);
    } else {
      setShow(true);
    }
  };

  const handleLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setShow(false);
  };

  return (
    <div
      className={`${styles.tooltipWrapper} ${className}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
      {show && <div className={styles.tooltipContent}>{content}</div>}
    </div>
  );
};
