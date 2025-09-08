import { useEffect, useState } from 'react'
import {
    AppstoreOutlined,
    MailOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined
} from '@ant-design/icons'
import { Button, Menu } from 'antd'
import DesktopNotification from '../../services/DesktopNotification'
import debug from '../../utils/debug'

const items = [
    {
        key: '1',
        icon: <MailOutlined />,
        label: 'Option 1',
    },
    {
        key: 'sub1',
        icon: <AppstoreOutlined />,
        label: 'Navigation 1',
        children: [
            { key: '2', label: 'Option 1.1' },
            { key: '3', label: 'Option 1.2' }
        ],
    },
]

const SideMenu = () => {
    const [collapsed, setCollapsed] = useState(true)
    const toggleCollapsed = () => {
        setCollapsed(!collapsed)
    }

    useEffect(() => {
        DesktopNotification.requestPermission();
    }, []);

    const handleNotification = (key) => {
        switch (key) {
            case '1':
                DesktopNotification.show("Testing", "Notification from button 1")
                debug.log("Notification from button 1")
                break
            case '2':
                DesktopNotification.show("Testing", "Notification from button 1.1")
                debug.log("Notification from button 1.1")
                break
            case '3':
                DesktopNotification.show("Testing", "Notification from button 1.2")
                debug.log("Notification from button 1.2")
                break
            default:
                break
        }
    }

    return (
        <div>
            <Button type='primary' onClick={() => setCollapsed(!collapsed)}>
                {collapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            </Button>
            <Menu
                mode='inline'
                theme='dark'
                inlineCollapsed={collapsed}
                items={items}
                onClick={(e) => handleNotification(e.key)}
            />
        </div>
    )
}

export default SideMenu