import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from "react-router";
import axios from 'axios';

import App from './App.jsx'

import '@ant-design/v5-patch-for-react-19';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import './index.css'

axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')).render(
  <ConfigProvider
    locale={ruRU}
    theme={{
      components: {
        Collapse: {
          headerBg: '#fff'
        },
        Select: {
          colorBgContainerDisabled: '#bbb'
        }
      }
    }}
  >
    <Router>
      <App />
    </Router>
  </ConfigProvider>
)
