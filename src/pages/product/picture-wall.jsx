/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Modal, Upload, message} from 'antd';
import {PlusOutlined} from '@ant-design/icons';
import ajaxMtd from "../../api/ajax";

function PictureWall(props) {
    const {imgs, setProductImages} = props;//获取父组件传递的参数
    const [fileList, setFileList] = useState([]);//所有已上传的图片数组
    const [previewVisible, setPreviewVisible] = useState(false);//预览大图弹窗是否可见
    const [previewImage, setPreviewImage] = useState('');//预览大图的url
    const [previewTitle, setPreviewTitle] = useState('');//预览大图的窗口标题

    const BASE_IMG_URL = 'http://localhost:5001/upload/';//图片在后端的的基础路径
    useEffect(() => {
        //更新商品时，初始化图片信息数组
        let list = [];
        if (imgs && imgs.length > 0) {
            list = imgs.map((img, index) => ({
                uid: -index,
                name: img,
                status: "done",
                url: BASE_IMG_URL + img
            }));
        }
        setFileList(list);
    }, []);

    useEffect(() => {//图片数组变化时，将其文件名数组传递至父组件
        setProductImages(fileList.map(item => item.name));
    }, [fileList]);

    async function onFileListChange({file, fileList}) {
        if (file.status === 'done') {//图片上传完成
            const {response} = file;//file.response-服务端响应内容
            if (response.status === 0) {//图片上传成功
                message.success('图片上传成功');
                /*初始时，fileList数组元素中没有url属性，name属性为图片上传前的原始名称
                * 上传后，后端会对图片重命名，前端需要拿到重命名后的名称，和上传后的url
                * 故使用file对象中数据更新fileList*/
                file = fileList[fileList.length - 1];//需要更新的是fileList中的最后一个对象
                file.name = response.data.name;//后端重命名后的图片文件名
                file.url = response.data.url;//后端重命名后的图片url
            } else {
                message.error('图片上传失败');
            }
        } else if (file.status === 'removed') {//删除图片
            const response = await ajaxMtd('/manage/img/delete', {name: file.name}, 'POST');
            if (response.status === 0) {
                message.success('图片删除成功');
            } else {
                message.error('图片删除失败');
            }
        }
        setFileList(fileList);
    }

    async function onPreviewImage(file) {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewVisible(true);
        setPreviewImage(file.url || file.preview);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    }

    function getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    function cancelPreview() {
        setPreviewVisible(false);
        setPreviewImage('');
        setPreviewTitle('');
    }

    const uploadButton = (
        <div>
            <PlusOutlined/>
            <div style={{marginTop: 8}}>上传</div>
        </div>
    );
    return (
        <>
            <Upload action={'http://localhost:3000/ajaxProxy/manage/img/upload'}/*上传图片的接口地址*/
                    name={'image'}/*发到后台的文件参数名*/
                    accept={'image/*'}/*接受上传的文件类型*/
                    listType={'picture-card'}/*组件在页面上展示的样式*/
                    fileList={fileList} onChange={onFileListChange} onPreview={onPreviewImage}>
                {fileList.length >= 3 ? null : uploadButton}
            </Upload>
            <Modal open={previewVisible} title={previewTitle} footer={[]}
                   onCancel={cancelPreview}>
                <img src={previewImage} alt={'product'}/>
            </Modal>
        </>
    );
}

//使用PropTypes进行参数类型检查
PictureWall.propTypes = {
    imgs: PropTypes.array.isRequired,//应为imgs参数传入数组，且必传（没有图片时传入空数组）
    setProductImages: PropTypes.func.isRequired//应为setProductImages参数传入函数，且必传
}

export default PictureWall;