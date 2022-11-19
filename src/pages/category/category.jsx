/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {Card, Table, Button, Modal, message} from "antd";
import {PlusOutlined, ArrowRightOutlined} from '@ant-design/icons';

import './category.less';
import ajaxMtd from "../../api/ajax";

function Category() {
    //组件所需state
    const [tableColumns, setTableColumns] = useState([]);//表格列名数组
    const [categories, setCategories] = useState([]);//一级分类数据数组
    const [subCategories, setSubCategories] = useState([]);//二级分类数据数组
    const [parentCateId, setParentCateId] = useState('0');//当前展示的分类的父分类id
    const [parentCateName, setParentCateName] = useState('');//当前展示的分类的父分类名称
    const [modalDisplayStatus, setModalDisplayStatus] = useState(0);//弹窗展示状态，0-都不显示，1-显示添加，2-显示修改
    const [cateNewName, setCateNewName] = useState('');//修改分类名称时，输入的新名称

    //组件挂载时，初始化表格列名数组
    useEffect(() => {
        const tbCols = [{title: '分类名称', dataIndex: 'name'},
            {
                title: '操作', width: 360, render: category => (
                    <>
                        <button className={'op-btn'}>
                            修改分类名称
                        </button>
                        {parentCateId !== '0' ? null :
                            <button className={'op-btn view-sub-btn'}
                                    onClick={() => showSubCategories(category)}>
                                查看子分类
                            </button>}
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
        <Button type={'primary'}>
            <PlusOutlined/>添加{parentCateId === '0' ? '' : '子'}分类
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
        </Card>
    );
}

export default Category;