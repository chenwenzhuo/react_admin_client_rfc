import React from 'react';
// import ReactDOM from 'react-dom/client';//react18的写法
import ReactDOM from 'react-dom';//react18以下的写法
import {Provider} from 'react-redux'
import {PersistGate} from "redux-persist/integration/react";
import store from './redux/store'
import {persistor} from "./redux/store";
import {ConfigProvider} from "antd";
import zhCN from 'antd/es/locale/zh_CN';//中文语言包
import App from './App';
import './index.css';

//react18的写法
/*const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);*/

//react18以下的写法
ReactDOM.render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <React.StrictMode>
                <ConfigProvider locale={zhCN}>
                    <App/>
                </ConfigProvider>
            </React.StrictMode>
        </PersistGate>
    </Provider>,
    document.getElementById('root')
);
