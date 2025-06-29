import { ButtonHTMLAttributes, CSSProperties, FC, useState } from "react";

import "./styles/Button.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
  shape?: string;
  icon?: string;
  margin?: string;
  text?: string;
  style?: CSSProperties;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export const Button: FC<ButtonProps> = ({
  onClick,
  shape,
  type = "button",
  style,
  icon,
  margin,
  text,
  className,
  disabled,
  ...props
}) => {
  const buttonClass = ["button", shape, className].filter(Boolean).join(" ");

  return (
    <button
      onClick={onClick}
      className={buttonClass}
      disabled={disabled}
      type={type}
      style={style}
      {...props}
    >
      <i className={icon}>
        {text && (
          <span
            className="button-text"
            style={margin ? { margin: margin } : undefined}
          >
            {text}
          </span>
        )}
      </i>
    </button>
  );
};

export default Button;
