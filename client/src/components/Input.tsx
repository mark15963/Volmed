import { InputHTMLAttributes, CSSProperties, FC } from "react";

import "./styles/Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type?: "text" | "password" | "email" | "tel" | "search" | "number";
  value?: string;
  placeholder?: string;
  name?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  autoComplete?: string;
  style?: CSSProperties;
}

export const Input: FC<InputProps> = ({
  name,
  type = "text",
  value,
  placeholder,
  onChange,
  autoComplete,
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
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      pattern={pattern}
      inputMode={inputMode}
      className={inputClass}
      style={style}
      {...props}
    />
  );
};

export default Input;
