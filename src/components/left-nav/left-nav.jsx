import React, {useEffect, useState} from 'react';
import {Menu} from 'antd';
import {
    AppstoreOutlined, UserOutlined, CheckCircleOutlined, HomeOutlined, AreaChartOutlined, UnorderedListOutlined,
    ToolOutlined, BarChartOutlined, LineChartOutlined, PieChartOutlined
} from '@ant-design/icons';
import {connect} from 'react-redux';//connect用于连接UI组件与redux

import logo from '../../assets/img/logo.png'
import './left-nav.less';
import {
    createSaveLoginUserAction,
    createRemoveLoginUserAction
} from "../../redux/actions/login-user";

function LeftNav(props) {
    const {loginUser} = props;
    const [items, setItems] = useState([]);
    const [menuItemParams] = useState([
        {label: '首页', key: '/home', icon: <HomeOutlined/>},
        {label: '品类管理', key: '/category', icon: <UnorderedListOutlined/>},
        {label: '商品管理', key: '/products', icon: <ToolOutlined/>},
        {label: '用户管理', key: '/user', icon: <UserOutlined/>},
        {label: '角色管理', key: '/role', icon: <CheckCircleOutlined/>},
        {label: '柱形图', key: '/charts/barchart', icon: <BarChartOutlined/>},
        {label: '折线图', key: '/charts/linechart', icon: <LineChartOutlined/>},
        {label: '饼图', key: '/charts/piechart', icon: <PieChartOutlined/>},
    ]);

    //第二个参数传入空数组，不监听任何state，只在初始化时执行一次，相当于componentDidMount
    useEffect(() => {
        initMenuItems();
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function getItem(label, key, icon, children, type) {
        return {key, icon, children, label, type,};
    }

    //根据用户权限，展示菜单
    function initMenuItems() {
        //若当前用户是admin，直接展示所有菜单
        if (loginUser.username === 'admin') {
            initAdminMenus();
            return;
        }
        const curUserMenus = loginUser.role.menus;
        initUserMenus(curUserMenus);
    }

    function initAdminMenus() {
        const items = [
            getItem('首页', '/home', <HomeOutlined/>),
            getItem('商品', '/prodCate', <AppstoreOutlined/>, [
                getItem('品类管理', '/category', <UnorderedListOutlined/>),
                getItem('商品管理', '/products', <ToolOutlined/>)
            ]),
            getItem('用户管理', '/user', <UserOutlined/>),
            getItem('角色管理', '/role', <CheckCircleOutlined/>),
            getItem('图形图表', '/charts', <AreaChartOutlined/>, [
                getItem('柱形图', '/charts/barchart', <BarChartOutlined/>),
                getItem('折线图', '/charts/linechart', <LineChartOutlined/>),
                getItem('饼图', '/charts/piechart', <PieChartOutlined/>),
            ])
        ];
        setItems(items);
    }

    function initUserMenus(menus) {
        const userItems = [];
        menuItemParams.forEach(itemParam => {
            //菜单key不在已登陆的用户的menus数组中，直接返回
            if (menus.indexOf(itemParam.key)) {
                return;
            }
            //已登陆用户具有当前菜单权限时，将菜单对象加入userItems数组
            switch (itemParam.key) {
                case'/category':
                case'/products':
                    //检查父菜单是否已添加到userItems
                    checkFatherMenu(userItems, itemParam, '/prodCate');
                    break;
                case"/charts/barchart":
                case"/charts/linechart":
                case"/charts/piechart":
                    checkFatherMenu(userItems, itemParam, '/charts');
                    break;
                default://当前菜单不是子菜单，直接添加
                    userItems.push(getItem(itemParam.label, itemParam.key, itemParam.icon));
                    break;
            }
        });
        setItems(userItems);//更新state
    }

    function checkFatherMenu(userItems, itemParam, fmKey) {
        const fatherMenu = userItems.find(item => item.key === fmKey);
        if (fatherMenu) {//父菜单已添加到userItems，则向其children数组中添加子菜单
            fatherMenu.children.push(getItem(itemParam.label, itemParam.key, itemParam.icon));
            return;
        }
        //父菜单还未添加，则先添加父菜单，再添加子菜单
        const fmParam = menuItemParams.find(it => it.key === fmKey);//父菜单参数对象
        userItems.push(getItem(fmParam.label, fmParam.key, fmParam.icon, [
            getItem(itemParam.label, itemParam.key, itemParam.icon)//子菜单
        ]));
    }

    return (
        <div className={'left-nav-container'}>
            <div className={'left-nav-header'}>
                <img src={logo} alt={'logo'}/>
                <span className={'left-nav-title'}>商品管理系统</span>
            </div>
            <Menu defaultSelectedKeys={['/home']} mode="inline" theme="dark" items={items}/>
        </div>
    );
}

export default connect(
    state => ({
        loginUser: state.loginUser
    }), {
        saveLoginUser: createSaveLoginUserAction,
        removeLoginUser: createRemoveLoginUserAction
    }
)(LeftNav);
