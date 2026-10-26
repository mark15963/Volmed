import { useState } from "react";
import { IMaskInput } from "react-imask";

interface PhoneFieldProps {
  value: string;
  onChange: (val: string) => void;
  safeMessage: (type: string, message: string, duration?: number) => void;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({
  value,
  onChange,
  safeMessage,
}) => {
  const [hasError, setHasError] = useState(false);

  const handleAccept = (val: string) => {
    onChange(val === "7" ? "" : val);
  };

  const handleFocus = () => {
    setHasError(false);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const digits = val.replace(/\D/g, "");
    const isEmpty = digits.length <= 1;
    const isComplete = digits.length === 11;

    if (!isEmpty && !isComplete) {
      setHasError(true);
    } else {
      setHasError(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <IMaskInput
        mask="+7(000)000-00-00"
        value={value}
        definitions={{ "0": /[0-9]/ }}
        placeholder="+7 (___) ___-__-__"
        onAccept={handleAccept}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{
          width: "100%",
          padding: "4px 11px",
          fontSize: "14px",
          lineHeight: "1.5",
          border: hasError ? "1px solid red" : "1px solid #d9d9d9",
          borderRadius: "6px",
          outline: "none",
        }}
      />
      {hasError && (
        <span
          style={{
            position: "absolute",
            bottom: "-16px",
            left: "5px",
            fontSize: "10px",
            color: "red",
            fontWeight: "700",
            width: "100%",
          }}
        >
          Номер телефона неполный
        </span>
      )}
    </div>
  );
};
