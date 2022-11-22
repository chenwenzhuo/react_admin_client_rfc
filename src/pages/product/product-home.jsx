/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {
    Card, Select, Input, Button, Table, message
} from "antd";
import {PlusOutlined} from '@ant-design/icons';

import ajaxMtd from "../../api/ajax";

const {Option} = Select;

function ProductHome() {
    const [products, setProducts] = useState([]);//表格商品数据数组
    const [prodTotal, setProdTotal] = useState(0);//表格商品数据总数
    const [tablePage, setTablePage] = useState(1);//表格当前页码
    const [tablePageSize, setTablePageSize] = useState(10);//表格分页大小
    const [searchKey, setSearchKey] = useState('');//搜索商品时的关键字
    const [searchType, setSearchType] = useState('productName');//搜索商品的方式，按名称/描述搜索

    const navigate = useNavigate();

    //组件挂载时，查询商品信息
    useEffect(() => {
        reqProducts(tablePage, tablePageSize);
    }, []);

    //表格分页参数变化时，重新查询表格
    useEffect(() => {
        reqProducts(tablePage, tablePageSize);
    }, [tablePage, tablePageSize]);

    //当搜索关键字清空时，查询全部数据
    useEffect(() => {
        if (tablePage === 1) {//若表格当前在第一页，直接查询数据
            reqProducts(1, tablePageSize);
        } else {//当前表格不在第一页，跳转回第一页，然后通过tablePage的变化回调查询数据
            setTablePage(1);
        }
    }, [searchKey]);

    async function handleSearchProduct() {
        const response = await ajaxMtd('/manage/product/search', {
            pageNum: 1, pageSize: tablePageSize, searchType, productName: searchKey, productDesc: searchKey
        });
        if (response.status === 0) {
            setProducts(response.data.list);
            setProdTotal(response.data.total);
        } else {
            message.error('查询商品出错');
        }
    }

    function handleAddUpdateProduct(product) {
        console.log('-----------------handleAddUpdateProduct-----------------');
        navigate('add_update', {replace: false, state: {product}});
    }

    function showProductDetail(product) {
        navigate('detail', {replace: false, state: {product}});
    }

    async function changeProductStatus(product) {
        const response = await ajaxMtd('/manage/product/updateStatus', {
            productId: product._id,
            status: (product.status === 1 ? 0 : 1)
        }, 'POST');
        if (response.status === 0) {
            message.success(`${product.status === 1 ? '下架' : '上架'}成功`);
            reqProducts(tablePage, tablePageSize);//更改商品状态后重新查询表格
        } else {
            message.error(`${product.status === 1 ? '下架' : '上架'}失败`);
        }
    }

    //表格分页参数变化回调
    function onTablePaginationChange(pageNum, pageSize) {
        setTablePage(pageNum);
        setTablePageSize(pageSize);
    }

    async function reqProducts(pageNum, pageSize) {
        const response = await ajaxMtd('/manage/product/list', {
            pageNum, pageSize
        });
        if (response.status === 0) {
            setProducts(response.data.list);
            setProdTotal(response.data.total);
        } else {
            message.error('获取商品列表出错');
        }
    }

    const cardTitle = (
        <>
            <Select value={searchType} className={'search-type-select'}
                    onChange={value => setSearchType(value)}>
                <Option value={'productName'}>按名称搜索</Option>
                <Option value={'productDesc'}>按描述搜索</Option>
            </Select>
            <Input placeholder={'请输入关键字'} value={searchKey} className={'search-key-input'}
                   onChange={event => setSearchKey(event.target.value)}/>
            <Button type={'primary'} onClick={handleSearchProduct}>搜索</Button>
        </>
    );
    const cardExtra = (
        <Button type={'primary'} onClick={() => handleAddUpdateProduct()}>
            <PlusOutlined/>添加商品
        </Button>
    )
    const tableColumns = [{
        title: '商品名称', dataIndex: 'name', align: 'center', render: name => (
            <p style={{textAlign: 'left'}}>{name}</p>
        )
    }, {
        title: '商品描述', dataIndex: 'desc', align: 'center', render: desc => (
            <p style={{textAlign: 'left'}}>{desc}</p>
        )
    }, {
        title: '价格', dataIndex: 'price', align: 'center', width: 120, render: price => '¥' + price
    }, {
        title: '状态', align: 'center', width: 120, render: product => (
            <span>{product.status === 1 ? '在售' : '下架'}</span>
        )
    }, {
        title: '操作', align: 'center', width: 200, render: product => (
            <>
                <button className={'op-btn-prod'} onClick={() => showProductDetail(product)}>
                    详情
                </button>
                <button className={'op-btn-prod mod-btn'} onClick={() => handleAddUpdateProduct(product)}>
                    修改
                </button>
                <button className={'op-btn-prod'} onClick={() => changeProductStatus(product)}>
                    {product.status === 1 ? '下' : '上'}架
                </button>
            </>
        )
    }];
    return (
        <Card title={cardTitle} extra={cardExtra}>
            <Table columns={tableColumns} dataSource={products} rowKey={'_id'}
                   pagination={{
                       total: prodTotal,
                       current: tablePage,//表格当前页码
                       defaultPageSize: tablePageSize,
                       pageSizeOptions: [10, 20, 50],
                       showQuickJumper: true,
                       showSizeChanger: true,
                       onChange: onTablePaginationChange
                   }}/>
        </Card>
    );
}

export default ProductHome;