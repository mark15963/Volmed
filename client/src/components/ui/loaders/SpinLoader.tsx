import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import React from "react";

interface SpinLoaderProps {
  color?: string;
  size?: number;
  className?: string;
}

export const SpinLoader: React.FC<SpinLoaderProps> = ({
  color = "aliceblue",
  size = "50px",
  className = "",
}) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
    }}
    className={className}
  >
    <Spin
      indicator={
        <LoadingOutlined
          spin
          style={{
            color: color,
            fontSize: size,
          }}
        />
      }
    />
  </div>
);
