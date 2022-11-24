import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Modal, Upload, message} from 'antd';
import {PlusOutlined} from '@ant-design/icons';

function PictureWall(props) {
    const {imgs, setProductImages} = props;//获取父组件传递的参数
    const [fileList, setFileList] = useState([]);//所有已上传的图片数组

    const uploadButton = (
        <div>
            <PlusOutlined/>
            <div style={{marginTop: 8}}>上传</div>
        </div>
    );
    return (
        <>
            <Upload action={'http://localhost:3000/ajaxProxy/manage/img/upload'}/*上传图片的接口地址*/
                    name={'image'}
                    accept={'image/*'}
                    listType={'picture-card'}
                    fileList={fileList}>
                {fileList.length >= 3 ? null : uploadButton}
            </Upload>
        </>
    );
}

//使用PropTypes进行参数类型检查
PictureWall.propTypes = {
    imgs: PropTypes.array.isRequired,//应为imgs参数传入数组，且必传（没有图片时传入空数组）
    setProductImages: PropTypes.func.isRequired//应为setProductImages参数传入函数，且必传
}

export default PictureWall;