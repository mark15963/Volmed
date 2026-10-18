import { ButtonHTMLAttributes, CSSProperties, FC } from "react";
import { useNavigate } from "react-router";

import { PAGES } from "../constants";
import { debug } from "../utils";

import {
  LoginOutlined,
  LogoutOutlined,
  SearchOutlined,
  TeamOutlined,
  UploadOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { MessagesSquare } from "lucide-react";
import "./styles/Button.scss";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Callback fired when the button is clicked. */
  onClick?: () => void;

  /**
   * Sape of the button.
   * @default "default"
   */
  shape?: "default" | "circle";

  /**
   * Icon in the button. None - for no icon.
   * @example
   * <Button icon="search" />
   * @default "none"
   */
  icon?:
    | "none"
    | "login"
    | "logout"
    | "newPatient"
    | "patients"
    | "search"
    | "upload"
    | "chat";

  /**
   * Text in the button
   * @example
   * <Button text="TEXT" />
   */
  text?: string;

  /** Add CSS inline */
  style?: CSSProperties;
  className?: string;

  /**
   * Size of button.
   *
   * s - font 11
   * m - font 13
   * l - font 15
   * xl - font 17
   *
   * @default "l"
   */
  size?: "s" | "m" | "l" | "xl";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";

  /** Text while loading */
  loadingText?: string;

  /** Route key from `PAGES` to navigate to when clicked. */
  navigateTo?: keyof typeof PAGES;

  /**
   * If true, replaces history entry instead of pushing.
   * @default false
   */
  replace?: boolean;
}

/**
 * Button component
 * ----------------
 * @example
 * <Button
 *   type="button"
 *   style={{ color: "black" }}
 *   className=
 *   size="l"
 *   shape="default"
 *   icon="none"
 *   text="Button text"
 *   loadingText="Loading text"
 *   disabled
 *   loading
 *   replace
 *   onClick={function}
 * />
 */
const Button: FC<ButtonProps> = ({
  onClick,
  shape = "default",
  icon = "none",
  text,
  style,
  className,
  size = "l",
  disabled = false,
  loading = false,
  type = "button",
  loadingText,
  navigateTo,
  replace = false,
  ...props
}) => {
  const navigate = useNavigate();

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
      case "chat":
        return <MessagesSquare />;
      default: // If the icon doesn't matches the options -> null
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
                  : icon === "upload"
                    ? "upload"
                    : icon === "chat"
                      ? "chat"
                      : "(no text)")
      }`,
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
      onClick={handleClick}
      onTouchEnd={(e) => {
        e.preventDefault();
        e.currentTarget.blur();
        onClick?.();
      }}
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
