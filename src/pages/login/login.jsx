import React from 'react';
import {Button, Form, Input} from 'antd';

import './login.less';
import logo from '../../assets/img/logo.png';

function Login() {
    return (
        <div className={'login-container'}>
            <div className={'login-header'}>
                <img src={logo} alt={'logo'}/>
                <span className={'login-title'}>商品管理系统</span>
            </div>
            <div className={'login-content'}>
                <div className={'content-title'}>用户登陆</div>
                <div className={'content-form'}>
                    <Form name="basic" initialValues={{remember: true}}>
                        <Form.Item name="username"
                                   rules={[{required: true, message: '请输入用户名'},
                                       {min: 4, message: '密码长度不少于4位'},
                                       {max: 12, message: '密码长度不多于12位'}]}>
                            <Input/>
                        </Form.Item>

                        <Form.Item name="password"
                                   rules={[{required: true, message: '请输入密码',},]}>
                            <Input.Password/>
                        </Form.Item>

                        <Form.Item wrapperCol={{offset: 8, span: 16,}}>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
}

export default Login;