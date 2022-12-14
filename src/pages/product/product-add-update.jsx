/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import {Button, Card, Cascader, Form, Input, message} from 'antd'
import {ArrowLeftOutlined} from '@ant-design/icons';
import BraftEditor from 'braft-editor';
import 'braft-editor/dist/index.css';

import ajaxMtd from "../../api/ajax";
import PictureWall from "./picture-wall";

const {Item} = Form;
const {TextArea} = Input;

function ProductAddUpdate() {
    const {state: {product}} = useLocation();//取state参数
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);//商品一级分类数组
    // const [initCateIds, setInitCateIds] = useState([]);//state参数product所属的分类id
    const [images, setImages] = useState([]);//商品的图片名称数组
    const [detailState, setDetailState] = useState(BraftEditor.createEditorState(null));//商品详情描述

    //组件挂载时查询商品分类
    useEffect(() => {
        reqCategories(0);
    }, []);

    //初始化商品详情
    useEffect(() => {
        if (!product) {
            return;
        }
        setDetailState(BraftEditor.createEditorState(product.detail));
    }, []);

    async function reqCategories(parentId) {
        const response = await ajaxMtd('/manage/category/list', {parentId});
        if (response.status !== 0) {
            message.error('查询分类列表出错');
            return;
        }
        if (parentId === 0) {//当前查询的是一级分类，初始化分类数组
            initCategories(response.data);
        } else {//当前查询的是二级分类，直接返回数据
            //reqCategories函数将返回一个成功的promise对象，PromiseResult为分类数组
            return response.data;
        }
    }

    async function initCategories(cateData) {
        //构造分类数组
        const cateArr = cateData.map(item => ({
            value: item._id,
            label: item.name,
            isLeaf: false//不是叶子结点（非末级选项）
        }));
        //若当前为更新，且商品所属的是二级分类，则需要查询子分类数据
        if (product && product.pCategoryId !== '0') {
            const subCategories = await reqCategories(product.pCategoryId);
            //生成子选项数组
            const subCateArr = subCategories.map(item => ({
                value: item._id,
                label: item.name,
                isLeaf: true//子选项一定为叶子结点
            }));
            //找到子选项数组对应的一级选项
            const parentOption = cateArr.find(item => item.value === product.pCategoryId);
            parentOption.children = subCateArr;
        }
        setCategories(cateArr);//更新state
    }

    //级联选择器选择一级选项时，加载子选项
    //级联选择器支持多选，故selectedOptions为数组，包含选择的所有选项
    async function loadSubCategories(selectedOptions) {
        //此处级联选择器为单选，故selectedOptions数组长度为1，直接选择第一项
        const selected = selectedOptions[0];
        const subCategories = await reqCategories(selected.value);
        if (!subCategories || subCategories.length <= 0) {//当前选项没有子选项
            selected.isLeaf = true;//将被选择的选项设为叶子结点
        } else {
            //有子选项时，生成子选项数组
            selected.children = subCategories.map(item => ({
                value: item._id,
                label: item.name,
                isLeaf: true
            }));
        }
        //更新state
        setCategories(oldCategories => {
            return [...oldCategories];
        });
    }

    function setProductImages(imgs) {
        setImages(imgs);
    }

    function validatePrice(_, value) {
        return new Promise((resolve, reject) => {
            if (!/^\d+$/.test(value) && !/^\d+.\d+$/.test(value)) {
                reject('只能输入数字');
            } else if (value <= 0) {
                reject('商品价格应大于0');
            } else {
                resolve();
            }
        });
    }

    async function onFormFinish(values) {
        //获取数据参数
        const {prodName, prodDesc, prodPrice, prodCategories} = values;
        const categoryId = prodCategories.length === 1 ? prodCategories[0] : prodCategories[1];//商品所属分类id
        const pCategoryId = prodCategories.length === 1 ? '0' : prodCategories[0];//商品所属分类的父分类id
        const detail = detailState.toHTML();//商品详情
        const productObj = {//封装商品对象
            categoryId, pCategoryId,
            name: prodName,
            price: prodPrice,
            desc: prodDesc,
            imgs: images,
            detail
        };
        if (product) {//若为更新，则需要_id属性
            productObj._id = product._id;
        }
        //发送请求
        const reqURL = `/manage/product/${product ? 'update' : 'add'}`;//请求url
        const response = await ajaxMtd(reqURL, productObj, 'POST');
        if (response.status === 0) {
            navigate(-1);
            message.success(`${product ? '更新' : '添加'}商品成功`);
        } else {
            message.error(`${product ? '更新' : '添加'}商品失败`);
        }
    }

    const cardTitle = (
        <button className={'op-btn-prod back-prod-home'}
                onClick={() => navigate(-1)}>
            <ArrowLeftOutlined/>&nbsp;&nbsp;返回
        </button>
    );
    const cardExtra = (<span className={'add-or-update'}>{product ? '修改' : '添加'}商品</span>);
    const cateIds = [];
    if (product) {
        cateIds.push(product.categoryId);
        if (product.pCategoryId !== '0') {//父分类id不为0时，将父分类id加到数组头部
            cateIds.unshift(product.pCategoryId);
        }
    }
    return (
        <Card title={cardTitle} extra={cardExtra}>
            <Form labelCol={{span: 2}} wrapperCol={{span: 8}} onFinish={onFormFinish}>
                <Item label={'商品名称'} name={'prodName'} initialValue={product ? product.name : ''}
                      rules={[{required: true, message: '商品名称必须输入'}]}>
                    <Input placeholder={'请输入商品名称'}/>
                </Item>
                <Item label={'商品描述'} name={'prodDesc'} initialValue={product ? product.desc : ''}
                      rules={[{required: true, message: '商品描述必须输入'}]}>
                    <TextArea placeholder={'请输入商品描述'} autoSize={{minRows: 2, maxRows: 6}}/>
                </Item>
                <Item label={'商品价格'} name={'prodPrice'} initialValue={product ? product.price : ''}
                      rules={[
                          {required: true, message: '商品价格必须输入'},
                          {validator: validatePrice}]}>
                    <Input placeholder={'请输入商品价格'} addonBefore={'¥'} addonAfter={"元"}/>
                </Item>
                <Item label={'商品分类'} name={'prodCategories'} initialValue={cateIds}
                      rules={[{required: true, message: '必须选择商品分类'}]}>
                    <Cascader placeholder={'请选择商品分类'} options={categories} loadData={loadSubCategories}
                              allowClear={false} changeOnSelect={true}/>
                </Item>
                <Item label={'商品图片'}>
                    {/*imgs用于在更新商品时显示已有图片，setProductImages函数用于将子组件的图片文件名传递至父组件*/}
                    <PictureWall imgs={product ? product.imgs : []} setProductImages={setProductImages}/>
                </Item>
                <Item label={'商品详情'} labelCol={{span: 2}} wrapperCol={{span: 20}}>
                    <BraftEditor value={detailState} onChange={setDetailState}
                                 language={'zh'} style={{border: '2px solid #cccccc', height: 450}}/>
                </Item>
                <Item>
                    <Button type={'primary'} htmlType={'submit'}>提交</Button>
                </Item>
            </Form>
        </Card>
    );
}

export default ProductAddUpdate;