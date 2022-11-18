import {createStore, applyMiddleware, combineReducers} from 'redux'
import thunk from 'redux-thunk'//引入redux-thunk，用于支持异步action
import {composeWithDevTools} from 'redux-devtools-extension';//用于支持redux浏览器插件
import {persistStore, persistReducer} from 'redux-persist';//redux持久化存储
import storage from 'redux-persist/lib/storage';//将redux信息存储于localStorage中
import loginUserReducer from "./reducers/login-user";

//整合所有reducer为一个
const appReducers = combineReducers({
    loginUser: loginUserReducer
});

//redux持久化存储配置
const persistConfig = {
    key: 'root', // 必须有的
    storage: storage, // 缓存机制
}
const myPersistReducer = persistReducer(persistConfig, appReducers);
const store = createStore(myPersistReducer, composeWithDevTools(applyMiddleware(thunk)));

export const persistor = persistStore(store);
export default store;