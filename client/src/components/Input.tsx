import { InputHTMLAttributes, CSSProperties, FC } from "react";
import { Search } from "lucide-react"; // not permanent
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
  onSubmitClick?: () => void;
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
  onSubmitClick,
  ...props
}) => {
  const inputClass = ["input", loading ? "input--loading" : "", className]
    .filter(Boolean)
    .join(" ");

  // if input type is COLOR - default color is black
  const inputValue = type === "color" ? value || "#000000" : value;

  // style of input type COLOR
  const mergedStyle: CSSProperties =
    type === "color"
      ? {
          width: "50px",
          height: "30px",
          padding: 0,
          border: "none",
          ...style,
        }
      : style || {};

  // style of input type SEARCH
  if (type === "search") {
    mergedStyle.borderWidth = "0px";
    mergedStyle.borderRadius = "25px";
  }

  return (
    <div
      className={`input-wrapper ${
        type === "search" ? "input-wrapper--search" : ""
      }`}
    >
      {loading && loadingPosition === "left" ? (
        <div className="input-loader input-loader--left">
          <div className="input-loader-spinner"></div>
        </div>
      ) : (
        type === "search" && (
          <button
            type="submit"
            className="input-search-button"
            onClick={onSubmitClick}
            disabled={disabled}
          >
            <Search size={18} />
          </button>
        )
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
