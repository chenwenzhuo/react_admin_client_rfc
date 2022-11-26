/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import {Card, List, Modal} from "antd";
import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';
import ajaxMtd from "../../api/ajax";

const {Item} = List;

function ProductDetail() {
    const {state: {product}} = useLocation();
    const navigate = useNavigate();
    const [categoryName, setCategoryName] = useState('');//商品所属分类名称
    const [pCategoryName, setPCategoryName] = useState('');//商品所属分类的父分类名称
    const [showPreview, setShowPreview] = useState(false);//是否展示大图预览窗口
    const [previewSrc, setPreviewSrc] = useState('');//预览窗口中的图片地址

    useEffect(() => {
        getCategoryNames();
    }, []);

    async function getCategoryNames() {
        /* 使用Promise.all，连续发送多个请求
         * 若使用多个await，则后面的请求会在前面的请求成功返回后才发送*/
        const reqUrl = '/manage/category/info';
        const responses = await Promise.all([
            ajaxMtd(reqUrl, {categoryId: product.categoryId}),
            ajaxMtd(reqUrl, {categoryId: product.pCategoryId})
        ]);
        const cateName = responses[0].status === 0 ? responses[0].data.name : '';
        const pCateName = responses[1].status === 0 ? responses[1].data.name : '';
        setCategoryName(cateName);
        setPCategoryName(pCateName);
    }

    function showImagePreview(event) {
        const {target: {src}} = event;
        setPreviewSrc(src);
        setShowPreview(true);
    }

    function hideImagePreview() {
        setShowPreview(false);
    }

    const cardTitle = (
        <button className={'op-btn-prod back-prod-home'}
                onClick={() => navigate(-1)}>
            <ArrowLeftOutlined/>&nbsp;&nbsp;商品详情
        </button>
    );
    return (
        <Card title={cardTitle}>
            <List bordered itemLayout={'horizontal'}>
                <Item>
                    <div>
                        <span className={'detail-label'}>商品名称:</span>
                        <span className={'detail-content'}>{product.name}</span>
                    </div>
                </Item>
                <Item>
                    <div>
                        <span className={'detail-label'}>商品描述:</span>
                        <span className={'detail-content'}>{product.desc}</span>
                    </div>
                </Item>
                <Item>
                    <div>
                        <span className={'detail-label'}>所属分类:</span>
                        <span className={'detail-content'}>
                            {pCategoryName}
                            {pCategoryName ? <ArrowRightOutlined/> : ''}
                            {categoryName}
                        </span>
                    </div>
                </Item>
                <Item>
                    <div>
                        <span className={'detail-label'}>商品图片:</span>
                        <span className={'detail-content'}>
                            {product.imgs.map(item => (
                                <img src={`http://localhost:5001/upload/${item}`}
                                     alt={product} key={item} className={'detail-image'}
                                     onClick={event => showImagePreview(event)}/>
                            ))}
                        </span>
                    </div>
                </Item>
                <Item>
                    <span className={'detail-desc'}>
                        <span className={'detail-label'}>商品详情:</span>
                        <span className={'detail-content'}
                              dangerouslySetInnerHTML={{__html: product.detail}}/>
                    </span>
                </Item>
            </List>
            {/*footer属性用于去掉弹窗按钮*/}
            <Modal open={showPreview} title={'图片预览'} footer={[]}
                   onCancel={hideImagePreview}>
                <img src={previewSrc} alt={'preview'}/>
            </Modal>
        </Card>
    );
}

export default ProductDetail;