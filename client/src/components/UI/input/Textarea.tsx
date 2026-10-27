import { CSSProperties, FC, TextareaHTMLAttributes } from "react";
import "./Input.scss";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  value?: string;
  placeholder?: string;
  name?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  style?: CSSProperties;
  autoSize?: { minRows?: number; maxRows?: number };
  disabled?: boolean;
}

/**
 * Textarea component for multi-line text input.
 *
 * @param {string} name - The name of the textarea.
 * @param {string} value - The value of the textarea.
 * @param {string} placeholder - The placeholder text for the textarea.
 * @param {function} onChange - Callback function to handle changes in the textarea.
 * @param {object} style - Inline styles for the textarea.
 * @param {object} autoSize - Object containing minRows and maxRows for auto-sizing the textarea.
 * @param {boolean} disabled - Whether the textarea is disabled or not.
 */
const Textarea: FC<TextareaProps> = ({
  name,
  value,
  placeholder,
  onChange,
  style,
  autoSize,
  disabled,
  ...props
}) => {
  const minRows = autoSize?.minRows || 2;
  const maxRows = autoSize?.maxRows || 6;

  return (
    <textarea
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className="input"
      style={{
        padding: "6px 10px",
        lineHeight: 1.5,
        resize: "none",
        minHeight: `${minRows * 1.5}rem`,
        maxHeight: `${maxRows * 1.5}rem`,
        ...style,
      }}
      disabled={disabled}
      {...props}
    />
  );
};

export default Textarea;
