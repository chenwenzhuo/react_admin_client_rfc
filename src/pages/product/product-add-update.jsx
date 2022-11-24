/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {useLocation} from "react-router-dom";
import {Button, Card, Cascader, Form, Input, message} from 'antd'
import {ArrowLeftOutlined} from '@ant-design/icons';

import ajaxMtd from "../../api/ajax";
import PictureWall from "./picture-wall";

const {Item} = Form;
const {TextArea} = Input;

function ProductAddUpdate(props) {
    const {state: {product}} = useLocation();//取state参数
    const [categories, setCategories] = useState([]);//商品一级分类数组
    const [initCateIds, setInitCateIds] = useState([]);//state参数product所属的分类id

    //组件挂载时查询商品分类
    useEffect(() => {
        reqCategories(0);
    }, []);

    //初始化initCateIds
    useEffect(() => {
        const cateIds = [];
        if (product) {
            cateIds.push(product.categoryId);
            if (product.pCategoryId !== '0') {//父分类id不为0时，将父分类id加到数组头部
                cateIds.unshift(product.pCategoryId);
            }
        }
        setInitCateIds(cateIds);
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

    }

    function validatePrice(_, value) {
        return new Promise((resolve, reject) => {
            if (value <= 0) {
                reject('商品价格应大于0');
            } else {
                resolve();
            }
        });
    }

    const cardTitle = (
        <button className={'op-btn-prod back-prod-home'}>
            <ArrowLeftOutlined/>&nbsp;&nbsp;返回
        </button>
    );
    const cardExtra = (<span className={'add-or-update'}>{product ? '修改' : '添加'}商品</span>);
    return (
        <Card title={cardTitle} extra={cardExtra}>
            <Form labelCol={{span: 2}} wrapperCol={{span: 8}}>
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
                          {type: 'number', message: '只能输入数字'},
                          {validator: validatePrice}]}>
                    <Input placeholder={'请输入商品价格'} addonBefore={'¥'} addonAfter={"元"}/>
                </Item>
                <Item label={'商品分类'} name={'prodCategories'} initialValue={initCateIds}
                      rules={[{required: true, message: '必须选择商品分类'}]}>
                    <Cascader placeholder={'请选择商品分类'} options={categories} loadData={loadSubCategories}/>
                </Item>
                <Item label={'商品图片'}>
                    {/*imgs用于在更新商品时显示已有图片，setProductImages函数用于将子组件的图片文件名传递至父组件*/}
                    <PictureWall imgs={product ? product.imgs : []} setProductImages={setProductImages}/>
                </Item>
            </Form>
        </Card>
    );
}

export default ProductAddUpdate;