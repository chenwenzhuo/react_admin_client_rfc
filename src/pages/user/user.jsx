/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from 'react';
import {Card, Table, Modal, Form, Input, Select, Button, message} from 'antd';
import {PlusOutlined} from '@ant-design/icons';

import './user.less';
import ajaxMtd from "../../api/ajax";

const {Item} = Form;
const {Option} = Select;

function User() {
    const [users, setUsers] = useState([]);//用户数组
    const [roles, setRoles] = useState([]);//角色数组
    const [modalDisplayFlag, setModalDisplayFlag] = useState(0);//添加/修改弹窗是否展示
    const [modifiedUser, setModifiedUser] = useState(null);//修改用户时的目标对象

    const addUpdateFormRef = useRef();

    //组件挂载时，查询用户列表
    useEffect(() => {
        reqUsers();
    }, []);

    //弹窗打开时，若功能为修改，将待修改用户的信息填入Form表单
    useEffect(() => {
        if (modalDisplayFlag === 2 && modifiedUser) {
            const {username, phone, email, role_id} = modifiedUser;
            addUpdateFormRef.current.setFieldsValue({username, phone, email, role_id});
        }
    }, [modalDisplayFlag, modifiedUser]);

    //弹窗关闭时，清除modifiedUser对象
    useEffect(() => {
        if (modalDisplayFlag === 0) {
            setModifiedUser(null);
        }
    }, [modalDisplayFlag]);

    async function reqUsers() {
        const response = await ajaxMtd('/manage/user/list');
        if (response.status !== 0) {
            message.error('获取用户列表失败');
            return;
        }
        setUsers(response.data.users);
        setRoles(response.data.roles);
    }

    function formatTime(milliseconds) {
        const timeObj = new Date(milliseconds);
        return timeObj.getFullYear() + '-' + (timeObj.getMonth() + 1) + '-' + timeObj.getDate() + ' ' +
            ((timeObj.getHours() < 10 ? '0' : '') + timeObj.getHours()) + ':' +
            ((timeObj.getMinutes() < 10 ? '0' : '') + timeObj.getMinutes()) + ':' +
            ((timeObj.getSeconds() < 10 ? '0' : '') + timeObj.getSeconds());
    }

    function showModal(flag) {
        setModalDisplayFlag(flag);
    }

    function cancelModal() {
        addUpdateFormRef.current.resetFields();
        setModalDisplayFlag(0);
    }

    function handleAddUpdate() {
        addUpdateFormRef.current.validateFields().then(values => {
            if (modalDisplayFlag === 1) {
                addUser(values);
            } else if (modalDisplayFlag === 2) {
                updateUser(values);
            } else {
                setModalDisplayFlag(0);
            }
        }).catch(error => {
            message.error('输入有误，请检查输入');
            console.error(error);
        });
    }

    async function addUser({username, password, phone, email, role_id}) {
        const response = await ajaxMtd('/manage/user/add', {
            username, password, phone, email, role_id
        }, 'POST');
        if (response.status !== 0) {
            message.error('添加用户失败');
            return;
        }
        message.success('添加用户成功');
        addUpdateFormRef.current.resetFields();
        setModalDisplayFlag(0);
        reqUsers();
    }

    async function updateUser({username, phone, email, role_id}) {
        const response = await ajaxMtd('/manage/user/update', {
            _id: modifiedUser._id, username, phone, email, role_id
        }, 'POST');
        if (response.status !== 0) {
            message.error('修改用户失败');
            return;
        }
        message.success('修改用户成功');
        addUpdateFormRef.current.resetFields();
        setModalDisplayFlag(0);
        reqUsers();
    }

    async function deleteUser(userToDel) {
        const response = await ajaxMtd('/manage/user/delete', {userId: userToDel._id}, 'POST');
        if (response.status !== 0) {
            message.error('删除用户失败');
            return;
        }
        message.success('删除用户成功');
        reqUsers();
    }

    const cardExtra = (
        <Button type={'primary'} onClick={() => showModal(1)}>
            <PlusOutlined/>创建用户
        </Button>
    );
    const tableColumns = [
        {title: '用户名', dataIndex: 'username', align: 'center'},
        {title: '邮箱', dataIndex: 'email', align: 'center'},
        {title: '电话', dataIndex: 'phone', align: 'center'},
        {
            title: '注册时间',
            dataIndex: 'create_time',
            align: 'center',
            render: create_time => formatTime(create_time)
        },
        {
            title: '所属角色',
            dataIndex: 'role_id',
            align: 'center',
            render: role_id => {
                const role = roles.find(item => item._id === role_id);
                return role ? role.name : '';
            }
        },
        {
            title: '操作',
            align: 'center',
            render: targetUser => (
                <>
                    <button className={'op-btn-user'}
                            onClick={() => {
                                setModifiedUser(targetUser);
                                showModal(2);
                            }}>
                        修改
                    </button>
                    <button className={'op-btn-user del-btn'}
                            onClick={() => deleteUser(targetUser)}>
                        删除
                    </button>
                </>
            )
        }
    ];
    return (
        <Card extra={cardExtra}>
            <Table columns={tableColumns} dataSource={users} rowKey={'_id'}
                   pagination={{
                       total: users.length,
                       defaultPageSize: 10,
                       pageSizeOptions: [10, 20, 50],
                       showQuickJumper: true
                   }}/>
            <Modal open={modalDisplayFlag !== 0} title={`${modalDisplayFlag === 1 ? '添加' : '修改'}用户`}
                   onOk={handleAddUpdate} onCancel={cancelModal}>
                <Form ref={addUpdateFormRef}
                      labelCol={{xs: {span: 24}, sm: {span: 6}}}
                      wrapperCol={{xs: {span: 24}, sm: {span: 14}}}>
                    <Item label={'用户名'} name={'username'}
                          rules={[
                              {required: true, message: '用户名不能为空'},
                              {min: 4, message: '用户名长度不少于4位'},
                              {max: 12, message: '用户名长度不多于12位'},
                              {pattern: /^[a-zA-Z0-9_]+$/, message: '用户名应由字母、数字、下划线组成'}
                          ]}>
                        <Input placeholder={'请输入用户名'}/>
                    </Item>
                    {   //修改时不展示密码栏位
                        modalDisplayFlag !== 0 && modalDisplayFlag === 2 ? null :
                            <Item label={'密码'} name={'password'}
                                  rules={[
                                      {required: true, message: '密码不能为空'},
                                      {min: 4, message: '密码长度不少于4位'},
                                      {max: 12, message: '密码长度不多于12位'},
                                      {pattern: /^[a-zA-Z0-9_]+$/, message: '密码应由字母、数字、下划线组成'}
                                  ]}>
                                <Input placeholder={'请输入密码'} type={'password'}/>
                            </Item>
                    }
                    <Item label={'手机号'} name={'phone'}
                          rules={[
                              {required: true, message: '手机号不能为空'},
                              {len: 11, message: '请输入11位数字手机号'},
                              {pattern: /^[0-9]+$/, message: '手机号仅包含数字'}
                          ]}>
                        <Input placeholder={'请输入手机号'}/>
                    </Item>
                    <Item label={'邮箱'} name={'email'} rules={[{required: true, message: '邮箱不能为空'}]}>
                        <Input placeholder={'请输入邮箱'}/>
                    </Item>
                    <Item label={'角色'} name={'role_id'} rules={[{required: true, message: '角色不能为空'}]}>
                        <Select placeholder={'请选择角色'}>{
                            roles.map(item => (
                                <Option value={item._id} key={item._id}>{item.name}</Option>
                            ))
                        }</Select>
                    </Item>
                </Form>
            </Modal>
        </Card>
    );
}

export default User;