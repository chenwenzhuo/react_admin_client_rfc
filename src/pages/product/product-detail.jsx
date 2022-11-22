import React from 'react';
import {useLocation} from "react-router-dom";

function ProductDetail(props) {
    const {state: {product}} = useLocation();
    return (
        <div>ProductDetail---------------{product.name}</div>
    );
}

export default ProductDetail;