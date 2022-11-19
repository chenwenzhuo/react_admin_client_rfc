import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {connect} from 'react-redux';//connect用于连接UI组件与redux
import {Menu} from 'antd';
import {
    AppstoreOutlined, UserOutlined, CheckCircleOutlined, HomeOutlined, AreaChartOutlined, UnorderedListOutlined,
    ToolOutlined, BarChartOutlined, LineChartOutlined, PieChartOutlined
} from '@ant-design/icons';

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
        {label: '商品管理', key: '/product', icon: <ToolOutlined/>},
        {label: '用户管理', key: '/user', icon: <UserOutlined/>},
        {label: '角色管理', key: '/role', icon: <CheckCircleOutlined/>},
        {label: '柱形图', key: '/barchart', icon: <BarChartOutlined/>},
        {label: '折线图', key: '/linechart', icon: <LineChartOutlined/>},
        {label: '饼图', key: '/piechart', icon: <PieChartOutlined/>},
    ]);
    const navigate = useNavigate();

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
                getItem('商品管理', '/product', <ToolOutlined/>)
            ]),
            getItem('用户管理', '/user', <UserOutlined/>),
            getItem('角色管理', '/role', <CheckCircleOutlined/>),
            getItem('图形图表', '/charts', <AreaChartOutlined/>, [
                getItem('柱形图', '/barchart', <BarChartOutlined/>),
                getItem('折线图', '/linechart', <LineChartOutlined/>),
                getItem('饼图', '/piechart', <PieChartOutlined/>),
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
                case'/product':
                    //检查父菜单是否已添加到userItems
                    checkFatherMenu(userItems, itemParam, '/prodCate');
                    break;
                case"/barchart":
                case"/linechart":
                case"/piechart":
                    checkFatherMenu(userItems, itemParam, '/charts');
                    break;
                default://当前菜单不是子菜单，直接添加
                    userItems.push(getItem(itemParam.label, itemParam.key, itemParam.icon));
                    break;
            }
        });
        setItems(userItems);//更新state
    }

    /**
     * 检查父级菜单是否已加入userItems数组
     * @param userItems 数组，包含当前登陆用户可访问的菜单项
     * @param itemParam 菜单参数对象
     * @param fmKey 父菜单key值
     */
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

    /**
     * 处理菜单项点击事件，进行路由跳转，并携带被点击的菜单名称
     * @param key 被点击的菜单项key值
     * @param keyPath 数组，元素依次为最内层子菜单到外层菜单的key值
     */
    function onMenuItemClick({key, keyPath}) {//解构获得被点击的菜单项key值和keyPath
        //查找被点击的菜单项名称
        const fatherItem = items.find(it => it.key === keyPath[keyPath.length - 1]);//外层菜单项
        if (keyPath.length === 1) {//keyPath长度为1，则点击的是外层菜单，可直接跳转
            navigate(key, {
                replace: false,
                state: {menuName: fatherItem.label}
            });
            return;
        }
        //keyPath长度大于1，则点击的是子菜单，需要查找子菜单名称
        const sonItem = fatherItem.children.find(it => it.key === keyPath[0]);
        navigate(key, {
            replace: false,
            state: {menuName: sonItem.label}
        });
    }

    return (
        <div className={'left-nav-container'}>
            <div className={'left-nav-header'}>
                <img src={logo} alt={'logo'}/>
                <span className={'left-nav-title'}>商品管理系统</span>
            </div>
            <Menu defaultSelectedKeys={['/home']} mode="inline" theme="dark"
                  items={items} onClick={onMenuItemClick}/>
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
