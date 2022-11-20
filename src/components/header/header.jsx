import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import {useLocation, useNavigate} from "react-router-dom";
import cookie from 'react-cookies';
import {Modal} from "antd";
import {ExclamationCircleOutlined} from '@ant-design/icons';

import './header.less';
import {
    createRemoveLoginUserAction
} from "../../redux/actions/login-user";

function Header(props) {
    const {loginUser, removeLoginUser} = props;
    const [currentTime, setCurrentTime] = useState('');
    const {state} = useLocation();
    const navigate = useNavigate();

    //使用useEffect模拟componentDidMount和componentWillUnmount
    useEffect(() => {
        let updateTimeInterval = updateCurrentTime();//组件挂载时设置周期任务
        return () => clearInterval(updateTimeInterval);//组件卸载时执行函数，终止周期任务
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function logout() {
        Modal.confirm({
            title: "是否确认退出登陆？",
            icon: <ExclamationCircleOutlined/>,
            content: "点击\"确认\"立即退出，点击\"取消\"保持登陆状态",
            okText: "确认",
            cancelText: "取消",
            onOk: () => {
                //删除保存的用户数据，并跳转到登陆界面
                removeLoginUser();
                cookie.remove('userid');
                navigate('/login');
            },
        });
    }

    function updateCurrentTime() {
        function getFormatDate() {
            const curDate = new Date(Date.now());
            return curDate.getFullYear() + '-' + (curDate.getMonth() + 1) + '-' + curDate.getDate() +
                ' ' + curDate.getHours() + ':' + curDate.getMinutes() + ':' +
                (curDate.getSeconds() >= 10 ? curDate.getSeconds() : '0' + curDate.getSeconds());
        }

        return setInterval(() => {
            const time = getFormatDate();
            setCurrentTime(time);
        }, 1000);
    }

    return (
        <div className={'header'}>
            <div className={'header-top'}>
                <span>欢迎，{loginUser.username}</span>
                <button onClick={logout}>退出登陆</button>
            </div>
            <div className={'header-bottom'}>
                <span className={'page-name'}>{state && state.menuName ? state.menuName : '首页'}</span>
                <span>{currentTime}</span>
            </div>
        </div>
    );
}

export default connect(
    state => ({
        loginUser: state.loginUser
    }), {
        removeLoginUser: createRemoveLoginUserAction,
    }
)(Header);
