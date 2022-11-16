import React from 'react';
// import ReactDOM from 'react-dom/client';//react18的写法
import ReactDOM from 'react-dom';//react18以下的写法
import './index.css';
import App from './App';

//react18的写法
/*const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);*/

//react18以下的写法
ReactDOM.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    document.getElementById('root')
);
