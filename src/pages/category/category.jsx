/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from 'react';
import {Card, Table, Button, Modal, message, Form, Select, Input} from "antd";
import {PlusOutlined, ArrowRightOutlined, ExclamationCircleOutlined} from '@ant-design/icons';

import './category.less';
import ajaxMtd from "../../api/ajax";

const Item = Form.Item;//表单项对象
const Option = Select.Option;//下拉框选项对象

function Category() {
    //组件所需state
    const [tableColumns, setTableColumns] = useState([]);//表格列名数组
    const [categories, setCategories] = useState([]);//一级分类数据数组
    const [subCategories, setSubCategories] = useState([]);//二级分类数据数组
    const [parentCateId, setParentCateId] = useState('0');//当前展示的分类的父分类id
    const [parentCateName, setParentCateName] = useState('');//当前展示的分类的父分类名称
    //弹窗展示状态，0-都不显示，1-显示添加，2-显示修改
    const [modalDisplayStatus, setModalDisplayStatus] = useState(0);
    const [targetCategory, setTargetCategory] = useState({});//更新操作的目标分类

    let addCateFormRef = useRef();//添加分类表单
    let modCateFormRef = useRef();//修改分类表单

    //组件挂载时，初始化表格列名数组
    useEffect(() => {
        const tbCols = [{title: '分类名称', dataIndex: 'name'},
            {
                title: '操作', width: 360, render: category => (
                    <>
                        <button className={'op-btn-cate'} onClick={() => showOperationModal(category, 2)}>
                            修改分类名称
                        </button>
                        {parentCateId !== '0' ? null :
                            <button className={'op-btn-cate view-sub-cate-btn'}
                                    onClick={() => showSubCategories(category)}>
                                查看子分类
                            </button>}
                        <button className={'op-btn-cate'} onClick={() => handleDeleteCate(category)}>
                            删除分类
                        </button>
                    </>
                )
            }];
        setTableColumns(tbCols);
    }, []);

    //组件挂载时，查询分类数据
    useEffect(() => {
        reqCategories();
    }, []);

    //当parentCateId更新后，重新查询分类数据
    useEffect(() => {
        reqCategories();
    }, [parentCateId]);

    //modalDisplayStatus更新后，
    //调用Form的setFieldsValue方法，更新添加分类弹窗中下拉框的初始值
    useEffect(() => {
        switch (modalDisplayStatus) {
            case 1:
                addCateFormRef.current.setFieldsValue({fatherCate: parentCateId});
                break
            case 2:
                modCateFormRef.current.setFieldsValue({newCateName: targetCategory.name});
                break;
            default:
                break;
        }
    }, [modalDisplayStatus]);

    async function reqCategories() {
        const response = await ajaxMtd('/manage/category/list', {parentId: parentCateId});
        if (response.status !== 0) {//获取失败
            message.error('获取分类列表失败');
            return;
        }
        //获取成功时，更新分类数据
        if (parentCateId === '0') {
            setCategories(response.data);//更新一级分类
        } else {
            setSubCategories(response.data);//更新二级分类
        }
    }

    function showParentCategories() {
        setParentCateId('0');
        setParentCateName('');
    }

    function showSubCategories(prnCategory) {
        setParentCateId(prnCategory._id);
        setParentCateName(prnCategory.name);
    }

    function showOperationModal(category, status) {
        setModalDisplayStatus(status);
        if (status !== 1) {
            setTargetCategory(category);
        }
    }

    function handleCreateCate() {
        //校验表单
        addCateFormRef.current.validateFields().then(async values => {
            const response = await ajaxMtd('/manage/category/add', {
                categoryName: values.cateNameInput,
                parentId: values.fatherCate
            }, 'POST');
            if (response.status === 0) {
                message.success('添加分类成功！');
                addCateFormRef.current.resetFields();//重置form表单
                setModalDisplayStatus(0);//隐藏弹窗
                reqCategories();
            } else {
                message.error('添加分类失败');
            }
        }).catch(error => {
            console.log(error);
        });
    }

    function handleModifyCate() {
        modCateFormRef.current.validateFields().then(async values => {
            const response = await ajaxMtd('/manage/category/update', {
                categoryId: targetCategory._id,
                categoryName: values.newCateName
            }, 'POST');
            if (response.status === 0) {
                message.success('修改分类名称成功！');
                modCateFormRef.current.resetFields();//重置form表单
                setModalDisplayStatus(0);//隐藏弹窗
                reqCategories();
            } else {
                message.error('修改分类名称失败');
            }
        });
    }

    function handleDeleteCate(category) {
        Modal.confirm({
            title: `是否确认删除用户"${category.name}"？`,
            icon: <ExclamationCircleOutlined/>,
            okText: "确认",
            cancelText: "取消",
            onOk: async () => {
                const response = await ajaxMtd('/manage/category/delete', {
                    categoryId: category._id
                }, 'POST');
                if (response.status === 0) {
                    message.success('删除分类成功！');
                    setModalDisplayStatus(0);
                    reqCategories();
                } else {
                    message.error('删除分类失败');
                }
            }
        });
    }

    function handleCancelModal() {
        if (modalDisplayStatus === 1) {
            addCateFormRef.current.resetFields();
        } else if (modalDisplayStatus === 2) {
            modCateFormRef.current.resetFields();
        }
        setModalDisplayStatus(0);
    }

    const cardTitle = parentCateId === '0' ? '一级分类列表' : (
        <span>
            <button className={'show-parent-cate-btn'} onClick={showParentCategories}>
                一级分类列表
            </button>
            <ArrowRightOutlined className={'arrow'}/>
            <span>{parentCateName}</span>
        </span>
    );
    const cardExtra = (
        <Button type={'primary'} onClick={() => showOperationModal(null, 1)}>
            <PlusOutlined/>添加分类
        </Button>
    );
    /*const tableDataSource = [
        {name: "cate1"}, {name: "cate2"}, {name: "cate3"}
    ];*/
    return (
        <Card title={cardTitle} extra={cardExtra}>
            <Table dataSource={parentCateId === '0' ? categories : subCategories}
                   columns={tableColumns} bordered rowKey={'_id'}
                   pagination={{
                       defaultPageSize: 10,
                       pageSizeOptions: [5, 10, 20, 50],
                       showQuickJumper: true,
                       showSizeChanger: true
                   }}/>
            <Modal title="添加分类" open={modalDisplayStatus === 1}
                   onOk={handleCreateCate} onCancel={handleCancelModal}>
                {/*为Item设置name属性后，需要用initialValues设置表单项的初始值*/}
                {/*但initialValues不能被setState动态更新，需要用Form组件的setFieldsValue更新*/}
                <Form ref={addCateFormRef} initialValues={{fatherCate: parentCateId}}>
                    <Item label={'所属分类'} name={'fatherCate'}
                          rules={[{required: true, message: '必须选择所属分类'}]}>
                        <Select>
                            <Option value="0" key="0">一级分类</Option>
                            {
                                categories.map(cateIt => {
                                    return (
                                        <Option value={cateIt._id} key={cateIt._id}>
                                            {cateIt.name}
                                        </Option>
                                    )
                                })
                            }
                        </Select>
                    </Item>
                    <Item label={'分类名称'} name={'cateNameInput'}
                          rules={[{required: true, message: '分类名称不能为空'}]}>
                        <Input placeholder={'请输入分类名称'}/>
                    </Item>
                </Form>
            </Modal>
            <Modal title={'修改分类名称'} open={modalDisplayStatus === 2}
                   onOk={handleModifyCate} onCancel={handleCancelModal}>
                <Form ref={modCateFormRef}>
                    <Item label={'分类名称'} name={'newCateName'}
                          rules={[{required: true, message: '分类名称不能为空'}]}>
                        <Input placeholder={'请输入分类名称'}/>
                    </Item>
                </Form>
            </Modal>
        </Card>
    );
}

export default Category;