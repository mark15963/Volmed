// Used in PatientsCount.jsx
// A more stylized version of <abbr title="Oh my god">OMG</abbr>

import { FC, useState } from "react";
import styles from "./TooltipHover.module.scss";
import { TooltipHoverProps } from "../../interfaces";

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
