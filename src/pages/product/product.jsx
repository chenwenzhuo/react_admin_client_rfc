import React from 'react';
import './product.less';
import {Navigate, Route, Routes} from "react-router-dom";
import ProductHome from "./product-home";
import ProductAddUpdate from "./product-add-update";
import ProductDetail from "./product-detail";

function Product() {

    return (
        <Routes>
            {/*使用exact属性为ProductHome开启严格匹配，否则二级路由无法匹配成功*/}
            <Route path={''} element={<ProductHome/>}/>
            <Route path={'add_update'} element={<ProductAddUpdate/>}/>
            <Route path={'detail'} element={<ProductDetail/>}/>
            <Route path={'*'} element={<Navigate to={''}/>}/>
        </Routes>
    );
}

export default Product;