import { InputHTMLAttributes, CSSProperties, FC } from "react";

import "./styles/Input.scss";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type?: "text" | "password" | "email" | "tel" | "search" | "number" | "color";
  value?: string;
  placeholder?: string;
  name?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  style?: CSSProperties;
  loading?: boolean;
  loadingPosition?: "left" | "right";
}

const Input: FC<InputProps> = ({
  name,
  type = "text",
  placeholder,
  onChange,
  pattern,
  inputMode,
  className,
  style,
  value,
  loading = false,
  loadingPosition = "right",
  disabled,
  ...props
}) => {
  const inputClass = ["input", loading ? "input--loading" : "", className]
    .filter(Boolean)
    .join(" ");

  const inputValue = type === "color" ? value || "#000000" : value;

  const mergedStyle: CSSProperties =
    type === "color"
      ? { width: "50px", height: "30px", padding: 0, border: "none", ...style }
      : style || {};

  return (
    <div className="input-wrapper">
      {loading && loadingPosition === "left" && (
        <div className="input-loader input-loader--left">
          <div className="input-loader-spinner"></div>
        </div>
      )}

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
        disabled={disabled || loading}
        {...props}
      />

      {loading && loadingPosition === "right" && (
        <div className="input-loader input-loader--right">
          <div className="input-loader-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default Input;
