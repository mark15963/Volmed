import { InputHTMLAttributes, CSSProperties, FC, useRef } from "react";
import { Search } from "lucide-react"; // not permanent
import "./styles/Input.scss";
import Button from "./Button";
import { useConfig } from "../context";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type?:
    | "text"
    | "password"
    | "email"
    | "tel"
    | "search"
    | "number"
    | "color"
    | "file";
  value?: string;
  placeholder?: string;
  name?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  style?: CSSProperties;
  loading?: boolean;
  loadingPosition?: "left" | "right";
  loadingText?: string;
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
  loadingText,
  disabled,
  onSubmitClick,
  ...props
}) => {
  const { theme } = useConfig();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const inputClass = ["input", loading ? "input--loading" : "", className]
    .filter(Boolean)
    .join(" ");

  // if input type is COLOR - default color is black
  const inputValue = type === "color" ? value || "#000000" : (value ?? "");

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

  // style of input type FILE
  if (type === "file") {
    return (
      <div className="input-file-wrapper">
        <input
          ref={fileInputRef}
          id={name || "file-upload"}
          type="file"
          onChange={onChange}
          disabled={disabled || loading}
          className="input-file-hidden"
          {...props}
        />
        <Button
          text={placeholder || "Выбрать файл"}
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || loading}
          className="input-file-button"
          icon="upload"
          loading={loading}
          loadingText={loadingText}
        />
        {value && <span className="input-file-name">{value}</span>}
      </div>
    );
  }

  return (
    <div
      className={`
        input-wrapper ${type === "search" ? "input-wrapper--search" : ""}
      `}
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
        onChange={(e) => {
          onChange?.(e);
        }}
        pattern={pattern}
        inputMode={inputMode}
        className={inputClass}
        style={mergedStyle}
        value={inputValue}
        disabled={disabled || loading}
        data-theme-app={theme.app}
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
