import React, {useEffect} from 'react';
import {useNavigate} from "react-router-dom";
import {Layout} from 'antd';
import cookie from "react-cookies";
import {connect} from "react-redux";

import LeftNav from "../../components/left-nav/left-nav";
import './admin.less';
import {
    createSaveLoginUserAction,
    createRemoveLoginUserAction
} from "../../redux/actions/login-user";

const {Header, Footer, Sider, Content} = Layout;

function Admin(props) {
    const {removeLoginUser} = props;
    const navigate = useNavigate();//useNavigate Hook用于实现编程路由导航

    //使用useEffect模拟生命周期回调componentDidUpdate
    useEffect(() => {
        //检查cookie是否已过期
        const userIdCookie = cookie.load('userid');
        if (!userIdCookie) {
            removeLoginUser();
            navigate('/login');//cookie已过期，跳转到登陆页
        } else {
            //cookie没有过期，刷新其有效时间
            const expDate = new Date(Date.now() + 1000 * 60 * 60);
            cookie.save('userid', userIdCookie, {expires: expDate});
        }
    });

    return (
        <Layout className={'admin-layout'}>
            <Sider className={'admin-sider'} width={260}>
                <LeftNav/>
            </Sider>
            <Layout>
                <Header style={{color: "blue", backgroundColor: '#bbdeac'}}>Header</Header>
                <Content>Content</Content>
                <Footer>Footer</Footer>
            </Layout>
        </Layout>
    );
}

export default connect(
    state => ({
        loginUser: state.loginUser
    }), {
        saveLoginUser: createSaveLoginUserAction,
        removeLoginUser: createRemoveLoginUserAction
    }
)(Admin);
