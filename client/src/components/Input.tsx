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

  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      onChange={onChange}
      pattern={pattern}
      inputMode={inputMode}
      className={inputClass}
      style={style}
      value={inputValue}
      {...props}
    />
  );
};

export default Input;
