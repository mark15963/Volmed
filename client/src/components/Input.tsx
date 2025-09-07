import { InputHTMLAttributes, CSSProperties, FC } from "react";

import "./styles/Input.scss";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type?: "text" | "password" | "email" | "tel" | "search" | "number" | "color";
  value?: string;
  placeholder?: string;
  name?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  style?: CSSProperties;
}

export const Input: FC<InputProps> = ({
  name,
  type = "text",
  placeholder,
  onChange,
  pattern,
  inputMode,
  className,
  style,
  value,
  ...props
}) => {
  const inputClass = ["input", className].filter(Boolean).join(" ");
  const inputValue = type === "color" ? value || "#000000" : value;

  const mergedStyle: CSSProperties =
    type === "color"
      ? { width: "50px", height: "30px", padding: 0, border: "none", ...style }
      : style || {};

  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      onChange={onChange}
      pattern={pattern}
      inputMode={inputMode}
      className={inputClass}
      style={mergedStyle}
      value={inputValue}
      {...props}
    />
  );
};

export default Input;
