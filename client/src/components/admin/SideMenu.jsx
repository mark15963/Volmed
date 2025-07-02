import { useState } from 'react'
import {
    AppstoreOutlined,
    MailOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined
} from '@ant-design/icons'
import { Button, Menu } from 'antd'
import DesktopNotification from '../../services/DesktopNotification'

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

export const SideMenu = () => {
    const [collapsed, setCollapsed] = useState(true)
    const toggleCollapsed = () => {
        setCollapsed(!collapsed)
    }



    return (
        <div>
            <Button type='primary' onClick={toggleCollapsed}>
                {collapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            </Button>
            <Menu
                mode='inline'
                theme='dark'
                inlineCollapsed={collapsed}
                items={items}
                onClick={(e) => {
                    if (e.key === '1') {
                        DesktopNotification.show("Testing", "Notification from button 1")
                        console.log('Testing", "Notification from button 1')
                    }
                    if (e.key === '2') {
                        DesktopNotification.show("Testing", "Notification from button 1.1")
                        console.log('Testing", "Notification from button 2')
                    }
                    if (e.key === '3') {
                        DesktopNotification.show("Testing", "Notification from button 1.2")
                        console.log('Testing", "Notification from button 3')
                    }
                }}
            />
        </div>
    )
}

export default SideMenu