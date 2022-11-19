import axios from "axios";
import {message} from "antd";

const ajaxMtd = (url, data = {}, method = 'GET') => {
    const URL_PREFIX = '/ajaxProxy';
    return new Promise((resolve) => {
        let promise;
        //1.向后端发送GET/POST请求
        if (method === 'GET') {
            promise = axios.get('http://localhost:3000' + URL_PREFIX + url, {params: data});
        } else {
            promise = axios.post('http://localhost:3000' + URL_PREFIX + url, data);
        }
        promise.then(response => {//2.若请求成功（与后端通信成功），将promise置为成功状态
            resolve(response.data);
        }).catch(error => {//3.请求失败时，弹窗提示
            console.log('----------------------请求出错----------------------');
            console.log(error);
            message.error('请求出错！' + error.message);
        });
    });
}

export default ajaxMtd;
