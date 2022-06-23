/**
 * 基础model
 * 在src/store/index.js 中被挂载到store上，命名为 app
 * **/

import axios from "@/util/axios"; // 自己写的工具函数，封装了请求数据的通用接口
import { Dispatch, RootState } from "@/store";
import {
  AppState,
  LoginRes,
  Menu,
  Power,
  Resp,
  Role,
  UserInfo,
} from "./index.type";
import tools from "@/util/tools";

const defaultState: AppState = {
  userInfo: {
    roles: [], // 当前用户拥有的角色
    menus: [], // 当前用户拥有的已授权的菜单
    powers: [], // 当前用户拥有的功能数据
    userBasicInfo: null, // 用户的基础信息，id,用户名...
  }, // 当前用户基本信息
  powersCode: [], // 当前用户拥有的功能code列表(仅保留了code)，页面中的按钮的功能控制将根据此数据源判断
};
export default {
  state: defaultState,
  reducers: {
    SET_USER_INFO(state: AppState, payload: UserInfo) {
      return {
        ...state,
        userInfo: payload,
        powersCode: payload.powers.map((item) => item.code),
      };
    },
    CLEAR_APP_STATE(state: AppState) {
      // TS2349.当defaultState与AppState的字段不能一一对应时报此错误
      return {
        ...state,
        defaultState,
      };
    },
  },

  effects: (dispatch: Dispatch) => ({
    /**
     * 登录
     * @param { username, password } params
     * */
    async onLogin(params: {
      username: string;
      password: string;
    }): Promise<LoginRes> {
      return await axios.post("/auth/v1/login", params);
    },
    /**
     * 退出登录
     * @param null
     * **/
    async onLogout() {
      //dispatch({ type: "app/CLEAR_APP_STATE", payload: null });
      dispatch.app.CLEAR_APP_STATE();
      sessionStorage.removeItem("userInfo");
      return "success";
    },
    /**
     * 设置用户信息
     * @param: {*} params
     * **/
    async setUserInfo(params: UserInfo) {
      sessionStorage.setItem("userInfo", tools.compile(JSON.stringify(params)));
      dispatch.app.SET_USER_INFO(params);
      return "success";
    },

    /** 修改了角色/菜单/功能信息后需要更新用户的roles,menus,powers数据 **/
    async updateUserInfo(): Promise<UserInfo> {
      /** 2.重新查询角色信息 **/
      const userInfo: UserInfo = defaultState.userInfo;
      let roles: Role[] = [];
      const menus: Menu[] = [];
      const powers: Power[] = [];
      try {
        const selfRes = await dispatch.sys.onSelf();
        userInfo.userBasicInfo = selfRes?.data;
        /** 2.获取角色信息 **/
        roles = selfRes?.data.roles;
        /** 3.获取菜单信息 **/
        const menuInfo = roles.reduce((a, b) => [...a, ...b.menus], []);
        const menuMap = {};
        menuInfo.forEach((item) => {
          menuMap[item?.id] = item;
        });
        const menuIds = Array.from(new Set(menuInfo.map((item) => item.id)));
        menuIds.forEach((id) => {
          if (menuMap[id]) {
            menus.push(menuMap[id]);
          }
        });
        /** 4.根据功能id，获取功能信息 **/
        const powerInfo = roles.reduce((a, b) => [...a, ...b.powers], []);
        const powerMap = {};
        powerInfo.forEach((item) => {
          powerMap[item?.id] = item;
        });
        const powerIds = Array.from(new Set(powerInfo.map((item) => item.id)));
        powerIds.forEach((id) => {
          if (powerMap[id]) {
            powers.push(powerMap[id]);
          }
        });
      } catch (e) {
        console.log("error", e);
      }
      const latestUserInfo = {
        ...userInfo,
        roles,
        menus,
        powers,
      };
      await this.setUserInfo(latestUserInfo);
      return latestUserInfo;
    },
  }),
};
