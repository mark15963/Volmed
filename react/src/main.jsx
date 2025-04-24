import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from "react-router-dom";
import '@ant-design/v5-patch-for-react-19';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <ConfigProvider locale={ruRU}>
    <Router>
      <App />
    </Router>
  </ConfigProvider>
)
