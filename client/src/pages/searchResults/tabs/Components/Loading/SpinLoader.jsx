import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

export const SpinLoader = () => (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Spin indicator={<LoadingOutlined spin style={{ color: 'aliceblue', fontSize: '50px' }} />} />
    </div>
);