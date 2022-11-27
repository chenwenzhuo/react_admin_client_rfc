/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from 'react';
import {Card, Table, Modal, Form, Input, Button, Tree, message} from 'antd';
import {PlusOutlined, EditOutlined} from '@ant-design/icons';
import {connect} from "react-redux";

import './role.less';
import ajaxMtd from "../../api/ajax";
import {createRemoveLoginUserAction, createSaveLoginUserAction} from "../../redux/actions/login-user";

const {Item} = Form;

function Role(props) {
    const {loginUser} = props;//获取当前登陆的用户
    const [roles, setRoles] = useState([]);//角色数组
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);//表格中被选中行的key数组，此处表格单选，数组长度最多为1
    const [selectedRole, setSelectedRole] = useState({});//表格被选中行代表的role对象
    const [modalDisplayFlag, setModalDisplayFlag] = useState(0);//弹窗展示标志位，0-隐藏 1-显示添加角色 2-显示权限设置
    const [roleMenus, setRoleMenus] = useState([]);//权限设置弹窗中，Tree组件被选择的结点值数组
    const createRoleFormRef = useRef();

    //组件挂载时，获取角色列表
    useEffect(() => {
        reqRoles();
    }, []);

    //弹窗状态改变时，若为打开授权弹窗，更新权限数组
    useEffect(() => {
        if (modalDisplayFlag === 2) {
            setRoleMenus(selectedRole.menus);
        }
    }, [modalDisplayFlag]);

    async function reqRoles() {
        const response = await ajaxMtd('/manage/role/list');
        if (!response.status === 0) {
            message.error('获取角色列表失败');
            return;
        }
        setRoles(response.data);
    }

    function onSelectedRowKeysChange(selected) {
        setSelectedRowKeys(selected);
    }

    function onTableRow(rowRole) {
        return {
            onClick: () => onTableRowClick(rowRole)
        }
    }

    function onTableRowClick(rowRole) {
        let rowKeys = [];
        let role = {};
        //若此次点击的是一个未选中的行，则将此次点击行的_id和行对象进行记录
        if (selectedRowKeys.indexOf(rowRole._id) < 0) {
            rowKeys.push(rowRole._id);
            role = rowRole;
        }
        //清除或更新state中的被点击行
        setSelectedRowKeys(rowKeys);
        setSelectedRole(role);
    }

    function onCreateRole() {
        createRoleFormRef.current.validateFields().then(async values => {
            const response = await ajaxMtd('/manage/role/add', {roleName: values.roleName}, 'POST');
            if (response.status !== 0) {
                message.error('创建角色失败');
                return;
            }
            message.success('创建角色成功');
            createRoleFormRef.current.resetFields();
            setModalDisplayFlag(0);
            reqRoles();
        }).catch(error => {
            console.error(error);
        });
    }

    async function onAuthRole() {
        const response = await ajaxMtd('/manage/role/update', {
            _id: selectedRole._id,
            menus: roleMenus,
            auth_name: loginUser.username
        }, 'POST');
        if (response.status !== 0) {
            message.error('角色权限设置失败');
            return;
        }
        message.success('角色权限设置成功');
        setModalDisplayFlag(0);
        setSelectedRowKeys([]);
        setSelectedRole({});
        reqRoles();
    }

    function onCancelModal() {
        if (modalDisplayFlag === 1) {
            createRoleFormRef.current.resetFields();
        }
        setModalDisplayFlag(0);
    }

    //点击Tree复选框触发函数，selectedKeys参数包含所有被选中的节点值
    function onCheckAuthItem(selectedKeys) {
        setRoleMenus(selectedKeys);
    }

    //点击Tree节点触发，selectedKeys参数仅包含当前被点击的节点值
    function onSelectAuthItem(selectedKeys, eventObj) {
        setRoleMenus(roleMenus => {
            if (selectedKeys.length !== 0) {
                return [...roleMenus, ...selectedKeys];
            }
            return roleMenus.filter(item => item !== eventObj.node.key);
        });
    }

    function formatTime(milliseconds) {
        if (!milliseconds) {
            return '';
        }
        const timeObj = new Date(milliseconds);
        return timeObj.getFullYear() + '-' + (timeObj.getMonth() + 1) + '-' + timeObj.getDate() + ' ' +
            ((timeObj.getHours() < 10 ? '0' : '') + timeObj.getHours()) + ':' +
            ((timeObj.getMinutes() < 10 ? '0' : '') + timeObj.getMinutes()) + ':' +
            ((timeObj.getSeconds() < 10 ? '0' : '') + timeObj.getSeconds());
    }

    const cardExtra = (
        <>
            <Button type={'primary'} onClick={() => setModalDisplayFlag(1)}>
                <PlusOutlined/>创建角色
            </Button>
            <Button type={'primary'} className={'btn-mod-auth'}
                    disabled={selectedRowKeys.length === 0}
                    onClick={() => setModalDisplayFlag(2)}>
                <EditOutlined/>设置角色权限
            </Button>
        </>
    );
    const tableColumns = [
        {title: '角色名称', dataIndex: 'name', align: 'center'},
        {
            title: '创建时间', dataIndex: 'create_time', align: 'center',
            render: create_time => formatTime(create_time)
        },
        {
            title: '授权时间', dataIndex: 'auth_time', align: 'center',
            render: auth_time => formatTime(auth_time)
        },
        {title: '授权人', dataIndex: 'auth_name', align: 'center'}
    ];
    const treeData = [
        {title: "首页", key: "/home"},
        {
            title: "商品", key: "/prodCate",
            children: [
                {title: "品类管理", key: "/category"},
                {title: "商品管理", key: "/product"}
            ]
        },
        {title: "用户管理", key: "/user"},
        {title: "角色管理", key: "/role"},
        {
            title: "图形图表", key: "/charts",
            children: [
                {title: "柱形图", key: "/barchart"},
                {title: "折线图", key: "/linechart"},
                {title: "饼图", key: "/piechart"}
            ]
        }];
    return (
        <Card extra={cardExtra}>
            <Table bordered columns={tableColumns} dataSource={roles} rowKey={'_id'}
                   rowSelection={{type: 'radio', selectedRowKeys, onChange: onSelectedRowKeysChange}}
                   onRow={onTableRow}
                   pagination={{total: roles.length, defaultPageSize: 10, pageSizeOptions: [10, 20]}}/>
            <Modal open={modalDisplayFlag === 1} title={'创建角色'}
                   onOk={onCreateRole} onCancel={onCancelModal}>
                <Form ref={createRoleFormRef}
                      labelCol={{xs: {span: 24}, sm: {span: 6}}}
                      wrapperCol={{xs: {span: 24}, sm: {span: 14}}}>
                    <Item label={'角色名称'} name={'roleName'}
                          rules={[{required: true, message: '角色名称不能为空'}]}>
                        <Input placeholder={'请输入角色名称'}/>
                    </Item>
                </Form>
            </Modal>
            <Modal open={modalDisplayFlag === 2} title={'设置角色权限'}
                   onOk={onAuthRole} onCancel={onCancelModal}>
                <Form labelCol={{xs: {span: 24}, sm: {span: 6}}}
                      wrapperCol={{xs: {span: 24}, sm: {span: 14}}}>
                    <Item label={'角色名称'}>
                        <Input value={selectedRole.name} disabled/>
                    </Item>
                    <Item label={'角色权限'}>
                        <Tree checkable={true} defaultExpandAll={true} treeData={treeData}
                              checkedKeys={roleMenus}
                              onCheck={onCheckAuthItem}/*点击Tree复选框触发*/
                              onSelect={onSelectAuthItem}/*点击Tree节点触发*/
                        />
                    </Item>
                </Form>
            </Modal>
        </Card>
    );
}

export default connect(
    state => ({
        loginUser: state.loginUser
    }), {
        saveLoginUser: createSaveLoginUserAction,
        removeLoginUser: createRemoveLoginUserAction,
    }
)(Role);