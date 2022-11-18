import {SAVE_LOGIN_USER, REMOVE_LOGIN_USER} from "../../utils/constants";

export const createSaveLoginUserAction = payload => ({type: SAVE_LOGIN_USER, payload});
export const createRemoveLoginUserAction = payload => ({type: REMOVE_LOGIN_USER, payload});