import {SAVE_LOGIN_USER, REMOVE_LOGIN_USER} from "../../utils/constants";

//用户信息初始值为空对象
const initState = {};

export default function loginUserReducer(preState = initState, action) {
    const {type, payload} = action;//从action中获取操作类型和数据
    switch (type) {
        case SAVE_LOGIN_USER:
            return payload;
        case REMOVE_LOGIN_USER:
            return {};
        default:
            return preState;
    }
};
