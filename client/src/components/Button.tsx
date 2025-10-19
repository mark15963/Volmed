import { ButtonHTMLAttributes, CSSProperties, FC } from "react";
import debug from "../utils/debug";
import {
  LoginOutlined,
  LogoutOutlined,
  SearchOutlined,
  TeamOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import loader from "../assets/images/Loader.gif";
import "./styles/Button.scss";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
  shape?: "default" | "circle";
  icon?: "none" | "login" | "logout" | "newPatient" | "patients" | "search";
  text?: string;
  style?: CSSProperties;
  className?: string;
  size?: "s" | "m" | "l" | "xl";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  loadingText?: string;
}

const Button: FC<ButtonProps> = ({
  onClick,
  shape = "default",
  icon = "none",
  text,
  style,
  className,
  size = "l",
  disabled,
  loading,
  type = "button",
  loadingText,
  ...props
}) => {
  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    // Force blur to remove active state
    e.currentTarget.blur();

    // Call the original onClick if provided
    if (onClick) onClick();
  };

  const buttonClass = [
    "button",
    size,
    shape,
    className,
    disabled ? "disabled" : "",
    loading ? "loading" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const renderIcon = () => {
    switch (icon) {
      case "none":
        return null;
      case "login":
        return <LoginOutlined />;
      case "logout":
        return <LogoutOutlined />;
      case "newPatient":
        return <UserAddOutlined />;
      case "patients":
        return <TeamOutlined />;
      case "search":
        return <SearchOutlined />;
      default:
        return icon ? <i className={icon} /> : null;
    }
  };

  const handleClick = () => {
    debug.log(`Button clicked: ${text || "(no text)"}`);
    if (onClick) onClick();
  };

  return (
    <button
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      className={buttonClass}
      disabled={disabled || loading}
      type={type}
      style={style || undefined}
      {...props}
    >
      {loading ? (
        <>
          {/* <img src={loader} style={{ height: "20px" }} alt="Loading..." /> */}
          {loadingText && (
            <span className="button-text" style={{ marginLeft: "3px" }}>
              {loadingText}
            </span>
          )}
        </>
      ) : (
        renderIcon()
      )}
      {text && !loading && (
        <span
          className="button-text"
          style={icon !== "none" ? { marginLeft: "3px" } : undefined}
        >
          {text}
        </span>
      )}
    </button>
  );
};

export default Button;
