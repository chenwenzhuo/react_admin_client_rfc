/*
* 将登陆用户信息保存到内存和localStorage
*/
import store from 'store';

const USER_KEY = 'login_user';
const memoryUtils = {
    user: {},//在内存中保存登陆的用户信息
    saveLoginUser: (user) => {//将用户信息保存到localStorage
        store.set(USER_KEY, user);
    },
    getLoginUser: () => {//从localStorage读取用户信息
        return store.get(USER_KEY) || {};
    },
    removeLoginUser: () => {//从从localStorage删除用户信息
        store.remove(USER_KEY);
    }
}

export default memoryUtils;