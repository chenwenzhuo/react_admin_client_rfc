/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
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
        {label: '商品', key: '/prodCate', icon: <AppstoreOutlined/>},
        {label: '品类管理', key: '/category', icon: <UnorderedListOutlined/>},
        {label: '商品管理', key: '/product', icon: <ToolOutlined/>},
        {label: '用户管理', key: '/user', icon: <UserOutlined/>},
        {label: '角色管理', key: '/role', icon: <CheckCircleOutlined/>},
        {label: '图形图表', key: '/charts', icon: <AreaChartOutlined/>},
        {label: '柱形图', key: '/barchart', icon: <BarChartOutlined/>},
        {label: '折线图', key: '/linechart', icon: <LineChartOutlined/>},
        {label: '饼图', key: '/piechart', icon: <PieChartOutlined/>},
    ]);
    const [selectedMenuKey, setSelectedMenuKey] = useState('');//被选中的菜单项key值
    const [fatherMenuKey, setFatherMenuKey] = useState('');//被选中的菜单项的父菜单key值
    const navigate = useNavigate();
    const location = useLocation();

    //第二个参数传入空数组，不监听任何state，只在初始化时执行一次，相当于componentDidMount
    useEffect(() => {
        initMenuItems();
    }, []);

    //根据当前菜单路径，设置Menu组件中被选中的项
    useEffect(() => {
        let curPathname = location.pathname;
        //若当前请求的是商品管理或其子路由界面
        if (curPathname.indexOf('product') >= 0) {
            curPathname = '/product';//将curPathname值改为/product，使得进入子路由界面后LeftNav中菜单项也能选中
        } else if (curPathname === '/') {
            curPathname = '/home';//将curPathname值改为/home，解决登陆后首页菜单项无法自动选中的问题
        }
        setSelectedMenuKey(curPathname);
    }, []);

    //根据当前菜单路径，设置Menu组件中应展开的父菜单
    useEffect(() => {
        //在items数组中查找当前菜单项的父菜单key值
        const fatherMenuItem = items.find(it => {
            if (!it.children) {//items数组当前项没有子菜单，直接返回false
                return false;
            }
            //当前项有子菜单时
            return (it.children.find(cIt => cIt.key === selectedMenuKey) !== undefined);
        });
        setFatherMenuKey(fatherMenuItem ? fatherMenuItem.key : '');
    }, [selectedMenuKey]);

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
            if (menus.indexOf(itemParam.key) < 0) {
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
                state: {menuName: fatherItem.label}//state参数用于Header组件中显示菜单名称
            });
        } else {//keyPath长度大于1，则点击的是子菜单，需要查找子菜单名称
            const sonItem = fatherItem.children.find(it => it.key === keyPath[0]);
            navigate(key, {
                replace: false,
                state: {menuName: sonItem.label}
            });
        }
        setSelectedMenuKey(key);
    }

    function onOpenKeyChange(keys) {
        setFatherMenuKey(keys[keys.length - 1]);
    }

    return (
        <div className={'left-nav-container'}>
            <div className={'left-nav-header'}>
                <img src={logo} alt={'logo'}/>
                <span className={'left-nav-title'}>商品管理系统</span>
            </div>
            <Menu defaultSelectedKeys={['/home']} mode="inline" theme="dark"
                  items={items} onClick={onMenuItemClick}
                  selectedKeys={[selectedMenuKey]}
                  openKeys={fatherMenuKey ? [fatherMenuKey] : []}
                  onOpenChange={onOpenKeyChange}/>
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
