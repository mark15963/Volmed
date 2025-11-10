import { ButtonHTMLAttributes, CSSProperties, FC } from "react";
import debug from "../utils/debug";
import {
  LoginOutlined,
  LogoutOutlined,
  SearchOutlined,
  TeamOutlined,
  UploadOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import "./styles/Button.scss";
import { PAGES } from "../constants";
import { useNavigate } from "react-router";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
  shape?: "default" | "circle";
  icon?:
    | "none"
    | "login"
    | "logout"
    | "newPatient"
    | "patients"
    | "search"
    | "upload";
  text?: string;
  style?: CSSProperties;
  className?: string;
  size?: "s" | "m" | "l" | "xl";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  loadingText?: string;
  navigateTo?: keyof typeof PAGES;
  replace?: boolean;
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
  navigateTo,
  replace = false,
  ...props
}) => {
  const navigate = useNavigate();

  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
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
      case "upload":
        return <UploadOutlined />;
      default:
        return icon ? <i className={icon} /> : null;
    }
  };

  const handleClick = () => {
    debug.log(
      `Button clicked: ${
        text ||
        (icon === "search"
          ? "search"
          : icon === "logout"
          ? "logout"
          : icon === "login"
          ? "login"
          : icon === "newPatient"
          ? "newPatient"
          : icon === "patients"
          ? "patients"
          : "(no text)")
      }`
    );

    // Handle navigation if navigateTo is provided
    if (navigateTo) {
      const route = PAGES[navigateTo];
      // If replace = true - the url changes to a clean route link.
      // If replace = false - link added to existing link
      navigate(route, { replace });
    }
    // Call original onClick if provided
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
