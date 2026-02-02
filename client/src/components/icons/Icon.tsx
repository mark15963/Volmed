import { FC, SVGProps } from "react";

type IconName = "sex-male" | "sex-female";

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  name: IconName;
  size?: number | string;
  color?: string;
}

export const Icon: FC<IconProps> = ({
  name,
  size = 24,
  color,
  className,
  ...rest
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      color={color} // → currentColor flows down
      {...rest}
    >
      <use href={`/icons/sprite.svg#${name}`} />
    </svg>
  );
};
