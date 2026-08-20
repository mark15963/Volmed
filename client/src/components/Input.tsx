import { InputHTMLAttributes, CSSProperties, FC, useRef, useMemo } from "react";
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

// ============================================
// TYPE CONFIGURATIONS
// ============================================
interface TypeConfig {
  defaultStyles: CSSProperties;
  wrapperClass?: string;
  showSearchIcon?: boolean;
  isFile?: boolean;
}

const TYPE_CONFIGS: Record<Exclude<InputProps["type"], undefined>, TypeConfig> = {
  text: {
    defaultStyles:{},
  },
  password: {
    defaultStyles:{},
  },
  email: {
    defaultStyles:{},
  },
  tel: {
    defaultStyles:{},
  },
  number: {
    defaultStyles:{},
  },
  search: {
    defaultStyles:{
      borderWidth: "0px",
      borderRadius: "25px",
    },
    wrapperClass: "input-wrapper--search",
    showSearchIcon: true,
  },
  color: {
    defaultStyles:{
      width: "50px",
      height: "30px",
      padding: 0,
      border: "none",
    },
  },
  file: {
    isFile: true,
    defaultStyles:{},
  },
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

  // Get configuration for this input type
  const config = TYPE_CONFIGS[type];

  // ============================================
  // MERGE STYLES
  // ============================================
  const mergedStyle = useMemo((): CSSProperties => {
    // Start with type-specific default styles
    const baseStyle = config.defaultStyles;

    // Handle color type special value
    const colorValue = type === "color" ? value || "#000000" : undefined
  
    // Merge with user-provided styles
    return{
      ...baseStyle,
      ...(type === "color" ? {value: colorValue}: {}),
      ...style,
    };
  }, [type, value, style])

  // ============================================
  // CLASS NAMES
  // ============================================
  const inputClass = [
    "input", 
    loading && "input--loading",
    className,
  ].filter(Boolean).join(" ");

  const wrapperClass = [
    "input-wrapper",
    config.wrapperClass,
  ].filter(Boolean).join(" ");
  
  const inputValue = type === "color" ? value || "#000000" : (value ?? "");

  // ============================================
  // FILE INPUT
  // ============================================
  if (config.isFile) {
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

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className={wrapperClass}>
      {/* Left loading */}
      {loading && loadingPosition === "left" && (
        <div className="input-loader input-loader--left">
          <div className="input-loader-spinner"></div>
        </div>
      )}

      {!loading && config.showSearchIcon && (
          <button
            type="submit"
            className="input-search-button"
            onClick={onSubmitClick}
            disabled={disabled}
          >
            <Search size={18} />
          </button>
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

      {/* Right Loading */}
      {loading && loadingPosition === "right" && (
        <div className="input-loader input-loader--right">
          <div className="input-loader-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default Input;
