import { InputHTMLAttributes, CSSProperties, FC } from "react";

import "./styles/Input.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type?: "text" | "password" | "email" | "tel" | "search" | "number";
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
  ...props
}) => {
  const inputClass = ["input", className].filter(Boolean).join(" ");
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
      {...props}
    />
  );
};

export default Input;
