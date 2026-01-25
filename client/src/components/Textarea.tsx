import { CSSProperties, FC, TextareaHTMLAttributes } from "react";
import "./styles/Input.scss";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  value?: string;
  placeholder?: string;
  name?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  style?: CSSProperties;
  autoSize?: { minRows?: number; maxRows?: number };
  disabled?: boolean;
}

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
