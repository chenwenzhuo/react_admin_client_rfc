import React from 'react';
import {useLocation} from "react-router-dom";

function ProductAddUpdate(props) {
    const {state: {product}} = useLocation();
    return (
        <div>ProductAddUpdate--------{product ? product.name : 'no product delivered'}</div>
    );
}

export default ProductAddUpdate;