import React from 'react';
import {useNavigate} from "react-router-dom";
import {Button, Form, Input, message} from 'antd';
import {UserOutlined, LockOutlined} from '@ant-design/icons';

import ajaxMtd from "../../api/ajax";

import './login.less';
import logo from '../../assets/img/logo.png';

function Login() {
    const navigate = useNavigate();//useNavigate Hook用于实现编程路由导航

    const handleLoginSubmit = async loginData => {
        //发送请求，进行登陆
        const response = await ajaxMtd(
            '/ajaxProxy/login',
            {username: loginData.username, password: loginData.password},
            'POST'
        );
        if (response.status === 0) {//登陆成功，跳转到主页
            navigate('/');
        } else {//登陆失败，弹窗提示
            message.error(response.msg);
        }
    }

    return (
        <div className={'login-container'}>
            <div className={'login-header'}>
                <img src={logo} alt={'logo'}/>
                <span className={'login-title'}>商品管理系统</span>
            </div>
            <div className={'login-content'}>
                <div className={'content-title'}>用户登陆</div>
                <div className={'content-form'}>
                    <Form className={'content-form'} onFinish={handleLoginSubmit}>
                        <Form.Item name="username"
                                   rules={[{required: true, message: '请输入用户名'},
                                       {min: 4, message: '用户名长度不少于4位'},
                                       {max: 12, message: '用户名长度不多于12位'},
                                       {pattern: /^[a-zA-Z0-9_]+$/, message: '用户名应由字母、数字、下划线组成'}]}>
                            <Input className={'form-input'}
                                   prefix={<UserOutlined/>}
                                   placeholder="用户名"/>
                        </Form.Item>

                        <Form.Item name="password"
                                   rules={[{required: true, message: '请输入密码'},
                                       {min: 4, message: '用户名长度不少于4位'},
                                       {max: 12, message: '用户名长度不多于12位'},
                                       {pattern: /^[a-zA-Z0-9_]+$/, message: '用户名应由字母、数字、下划线组成'}]}>
                            <Input.Password className={'form-input'}
                                            prefix={<LockOutlined/>}
                                            placeholder="密码"/>
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" className={'login-button'}>
                                登陆
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
}

export default Login;