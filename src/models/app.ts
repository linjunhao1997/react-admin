/**
 * 基础model
 * 在src/store/index.js 中被挂载到store上，命名为 app
 * **/

import axios from "@/util/axios"; // 自己写的工具函数，封装了请求数据的通用接口
import { message } from "antd";
import { Dispatch, RootState } from "@/store";
import {
  Menu,
  Role,
  Power,
  MenuAndPower,
  UserInfo,
  AppState,
  Res,
  LoginRes,
  Resp,
} from "./index.type";
import tools from "@/util/tools";

const defaultState: AppState = {
  userinfo: {
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
    reducerUserInfo(state: AppState, payload: UserInfo) {
      return {
        ...state,
        userinfo: payload,
        powersCode: payload.powers.map((item) => item.code),
      };
    },
    reducerLogout(state: AppState) {
      return {
        ...state,
        userinfo: {
          menus: [],
          roles: [],
          powers: [],
        },
      };
    },
  },

  effects: (dispatch: Dispatch) => ({
    /**
     * 登录
     * @param { username, password } params
     * */
    async onLogin(params: { username: string; password: string }) {
      try {
        const res: LoginRes = await axios.post("/auth/v1/login", params);
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },
    /**
     * 退出登录
     * @param null
     * **/
    async onLogout() {
      try {
        // 同 dispatch.app.reducerLogout();

        dispatch({ type: "app/reducerLogout", payload: null });
        sessionStorage.removeItem("userinfo");
        return "success";
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },
    /**
     * 设置用户信息
     * @param: {*} params
     * **/
    async setUserInfo(params: UserInfo) {
      sessionStorage.setItem("userinfo", tools.compile(JSON.stringify(params)));
      dispatch.app.reducerUserInfo(params);
      return "success";
    },

    /** 修改了角色/菜单/功能信息后需要更新用户的roles,menus,powers数据 **/
    async updateUserInfo(
      params: undefined,
      rootState: RootState
    ): Promise<any> {
      /** 2.重新查询角色信息 **/
      const userinfo: UserInfo = rootState.app.userinfo;

      let roles: Role[] = [];
      const menus: Menu[] = [];
      const powers: Power[] = [];
      try {
        const res2: Resp | undefined = await dispatch.sys.onSelf();

        /** 2.获取角色信息 **/
        roles = res2?.data.roles;
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
      this.setUserInfo({
        ...userinfo,
        roles,
        menus,
        powers,
      });
      return;
    },
  }),
};
