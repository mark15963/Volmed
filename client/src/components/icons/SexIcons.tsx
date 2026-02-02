import { FC } from "react";
import { Icon } from "./Icon";

interface SexIconProps {
  sex: string;
  className?: string;
  size?: number;
}

export const SexIcon: FC<SexIconProps> = ({ sex, className, size = 24 }) => {
  let name: "sex-male" | "sex-female" | null = null;

  const normalized = sex?.trim();
  if (["M", "М", "Мужской"].includes(normalized)) {
    name = "sex-male";
  } else if (["F", "Ж", "Женский"].includes(normalized)) {
    name = "sex-female";
  }
  if (!name) {
    return <span className={className}>?</span>;
  }

  const color = name === "sex-male" ? "#0f4882" : "#f11f73"; //Override

  return <Icon name={name} size={size} color={color} className={className} />;
};
