import { FC, ReactNode, useState } from "react";
import styles from "./TooltipHover.module.scss";

interface TooltipHoverProps {
  children: ReactNode;
  content: ReactNode;
  className?: string;
  delay?: number;
}

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
