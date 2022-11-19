import React, {useEffect} from 'react';
import {Navigate, Route, Routes, useNavigate} from "react-router-dom";
import {Layout} from 'antd';
import cookie from "react-cookies";
import {connect} from "react-redux";

import './admin.less';
import {
    createSaveLoginUserAction,
    createRemoveLoginUserAction
} from "../../redux/actions/login-user";
import LeftNav from "../../components/left-nav/left-nav";
import Header from "../../components/header/header"
import Home from "../home/home";
import Category from "../category/category";
import Product from "../product/product";
import User from "../user/user";
import Role from "../role/role";
import BarChart from "../charts/barchart";
import LineChart from "../charts/linechart";
import Piechart from "../charts/piechart";

const {Footer, Sider, Content} = Layout;

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
        <Layout className={'layout-outer'}>
            <Sider width={280}>
                <LeftNav/>
            </Sider>
            <Layout className={'layout-inner'}>
                <Header/>
                <Content className={'content'}>
                    <Routes>
                        <Route path={'/home'} element={<Home/>}/>
                        <Route path={'/category'} element={<Category/>}/>
                        <Route path={'/product'} element={<Product/>}/>
                        <Route path={'/user'} element={<User/>}/>
                        <Route path={'/role'} element={<Role/>}/>
                        <Route path={'/barchart'} element={<BarChart/>}/>
                        <Route path={'/linechart'} element={<LineChart/>}/>
                        <Route path={'/piechart'} element={<Piechart/>}/>
                        {/*以上路径都不匹配时，定向到首页*/}
                        <Route path={'*'} element={<Navigate to={'/home'}/>}/>
                    </Routes>
                </Content>
                <Footer className={'footer'}>推荐使用谷歌浏览器，可获得更佳浏览体验</Footer>
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
