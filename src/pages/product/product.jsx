import React from 'react';
import './product.less';
import {Navigate, Route, Routes} from "react-router-dom";
import ProductHome from "./product-home";
import ProductAddUpdate from "./product-add-update";
import ProductDetail from "./product-detail";
import './product.less';

function Product() {

    return (
        <Routes>
            <Route path={''} element={<ProductHome/>}/>
            <Route path={'add_update'} element={<ProductAddUpdate/>}/>
            <Route path={'detail'} element={<ProductDetail/>}/>
            <Route path={'*'} element={<Navigate to={''}/>}/>
        </Routes>
    );
}

export default Product;