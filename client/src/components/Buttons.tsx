import { ButtonHTMLAttributes, CSSProperties, FC } from "react";
import {
  LoginOutlined,
  LogoutOutlined,
  SearchOutlined,
  TeamOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import "./styles/Button.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
  shape?: string;
  icon?: "login" | "logout" | "newPatient" | "patients" | "search" | string;
  margin?: string;
  text?: string;
  style?: CSSProperties;
  className?: string;
  size?: "s" | "m" | "l" | "xl";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
}

export const Button: FC<ButtonProps> = ({
  onClick,
  shape,
  icon,
  margin,
  text,
  style,
  className,
  size = "l",
  disabled,
  loading,
  type = "button",
  ...props
}) => {
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

  const renderText = () => {
    if (icon === "login" || icon === "logout") {
      if (!text) return (text = "");
      if (text) return " " + text;
    }

    if (icon !== "login" || "logout") {
      if (text) {
        return " " + text;
      }
      return "";
    }
  };

  return (
    <button
      onClick={onClick}
      className={buttonClass}
      disabled={disabled}
      type={type}
      style={style || undefined}
      {...props}
    >
      {renderIcon()}
      {renderText() && (
        <span
          className="button-text"
          style={margin ? { margin: margin } : undefined}
        >
          {renderText()}
        </span>
      )}
    </button>
  );
};

export default Button;
