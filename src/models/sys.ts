/**
 * 基础model,系统权限相关功能
 * 在src/store/index.js 中被挂载到store上，命名为 sys
 * **/

import axios from "@/util/axios"; // 自己写的工具函数，封装了请求数据的通用接口
import qs from "qs";
import { message } from "antd";
import { Dispatch } from "@/store";

import {
  Api,
  ApiParam,
  Menu,
  MenuParam,
  PowerParam,
  PowerTree,
  Res,
  Resp,
  Role,
  RoleParam,
  SysState,
  UserBasicInfoParam,
} from "./index.type";

const defaultState: SysState = {
  menus: [], // 所有的菜单信息（用于菜单管理，无视权限）
  roles: [], // 所有的角色信息（用于Model赋予项，无视权限）
  apis: [], // 所有的API信息
  powerTreeData: [], // 分配权限treeTable组件所需原始数据
};

export default {
  state: defaultState,
  reducers: {
    // 保存所有菜单数据
    reducerSetMenus(state: SysState, payload: Menu[]): SysState {
      return { ...state, menus: payload };
    },
    // 保存所有角色数据
    reducerSetRoles(state: SysState, payload: Role[]): SysState {
      return { ...state, roles: payload };
    },

    // 保存所有权限数据
    reducerSetAllPowers(state: SysState, payload: PowerTree[]): SysState {
      return { ...state, powerTreeData: payload };
    },

    // 保存所有权限数据
    reducerSetApis(state: SysState, payload: Api[]): SysState {
      return { ...state, apis: payload };
    },
  },

  effects: (dispatch: Dispatch) => ({
    /**
     * 获取所有菜单
     * **/
    async getMenus(): Promise<Resp | undefined> {
      try {
        const res: Resp = await axios.get("/api/v1/sysMenus");
        if (res && res.success) {
          dispatch.sys.reducerSetMenus(res.data);
        }
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },
    /**
     * 根据菜单ID获取对应的菜单信息
     * @param {number} id 可以是一个数字也可以是一个数组
     * **/
    async getMenusById(params: { id: number | number[] }) {
      try {
        const res: Res = await axios.post(`/api/getMenusById`, params);
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },

    /**
     * 添加菜单
     * @param params MenuParam
     */
    async addMenu(params: MenuParam) {
      try {
        const res: Resp = await axios.post("/api/v1/sysMenus", params);
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },
    /**
     * 修改菜单
     * **/
    async upMenu(params: MenuParam) {
      try {
        const res: Resp = await axios.patch(
          `/api/v1/sysMenus/${params.id}`,
          params
        );
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },
    /**
     * 删除菜单
     * **/
    async delMenu(params: { id: number }) {
      try {
        const res: Res = await axios.delete(`/api/v1/sysMenus/${params.id}`);
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },

    /**
     * 根据菜单ID查询其下的权限数据
     * **/
    async getPowerDataByMenuId(
      menuId: string | number | null = null
    ): Promise<Resp | undefined> {
      try {
        const res: Resp = await axios.get(
          `/api/v1/sysMenus/${menuId}/sysPowers`
        );
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },

    /**
     * 排序菜单
     * @param id数组
     * **/
    async sortMenus(menuIds: number[]) {
      try {
        const res: Resp = await axios.post(`/api/v1/sysMenus/_sort`, menuIds);
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },

    /** 获取所有角色 **/
    async getAllRoles(): Promise<Role[]> {
      let roles: Role[] = [];
      try {
        const res: Resp = await axios.get("/api/v1/sysRoles");
        if (res && res.success) {
          dispatch.sys.reducerSetRoles(res.data);
        }
        roles = res.data;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return roles;
    },
    /**
     * 添加权限
     * **/
    async addPower(params: PowerParam) {
      try {
        const res: Resp = await axios.post(`/api/v1/sysPowers`, params);
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },

    /**
     * 修改权限
     * **/
    async upPower(params: PowerParam) {
      try {
        const res: Resp = await axios.patch(
          `/api/v1/sysPowers/${params.id}`,
          params
        );
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },

    /**
     * 删除权限
     * **/
    async delPower(params: { id: number }) {
      try {
        const res: Res = await axios.post("/api/delpower", params);
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },

    /**
     * 分页查询角色数据
     * **/
    async getRoles(params: {
      pageNum: number;
      pageSize: number;
      title?: string;
      disabled?: number;
    }) {
      try {
        const res: Res = await axios.get(
          `/api/getroles?${qs.stringify(params)}`
        );
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },

    /**
     * 通过角色ID查询对应的角色数据
     * @param id 可以是一个数字，也可以是一个数组
     * @return 返回值是数组
     * **/
    async getRoleById(params: { id: number | number[] }) {
      try {
        const res: Res = await axios.post(`/api/getRoleById`, params);
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },

    /**
     * 添加角色
     * **/
    async addRole(params: RoleParam) {
      try {
        const res: Resp = await axios.post("/api/v1/sysRoles", params);
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },
    /**
     * 修改角色
     * **/
    async upRole(params: RoleParam) {
      try {
        const res: Resp = await axios.patch(
          `/api/v1/sysRoles/${params.id}`,
          params
        );
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },

    /**
     * 删除角色
     * **/
    async delRole(params: { id: number }): Promise<Resp> {
      return await axios.delete(`/api/v1/sysRoles/${params.id}`);
    },

    /**
     * 通过角色ID查询该角色拥有的所有菜单和权限详细信息
     * **/
    async findAllPowerByRoleId(params: { id: number }) {
      try {
        const res: Res = await axios.get(
          `/api/findAllPowerByRoleId?${qs.stringify(params)}`
        );
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },

    /**
     * 获取所有的菜单及权限详细信息
     * 如果你在sys.ts中引用了sys本身，则需要显式的注明返回值的类型
     * **/
    async getAllMenusAndPowers(): Promise<Resp | undefined> {
      try {
        const res: Resp = await axios.get(`/api/v1/sysMenus`);
        if (res && res.success) {
          dispatch.sys.reducerSetAllPowers(res.data);
        }
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },

    /**
     * 通过角色ID给指定角色设置菜单及权限
     * **/
    async setPowersByRoleId(params: {
      id: number;
      menuIds: number[];
      powerIds: number[];
    }): Promise<Resp> {
      return await axios.patch(`/api/v1/sysRoles/${params.id}`, params);
    },

    /**
     * (批量)通过角色ID给指定角色设置菜单及权限
     * @param params [{id,menus,powers},...]
     * */
    async setPowersByRoleIds(
      params: {
        id: number;
        menus: number[];
        powers: number[];
      }[]
    ): Promise<Res> {
      return await axios.post("/api/setPowersByRoleIds", params);
    },

    /**
     * 条件分页查询用户列表
     * **/
    async getUserList(params: {
      pageNum: number;
      pageSize: number;
      username?: string;
      disabled?: number;
    }) {
      try {
        const res: Res = await axios.get(
          `/api/getUserList?${qs.stringify(params)}`
        );
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },

    /**
     * 添加用户
     * **/
    async addUser(params: UserBasicInfoParam) {
      try {
        const res: Resp = await axios.post("/api/v1/sysUsers", params);
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },

    /**
     * 修改用户
     * **/
    async upUser(params: UserBasicInfoParam) {
      try {
        const res: Resp = await axios.patch(
          `/api/v1/sysUsers/${params.id}`,
          params
        );
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },

    /**
     * 删除用户
     * **/
    async delUser(params: { id: number }) {
      try {
        const res: Resp = await axios.delete(`/api/v1/sysUsers/${params.id}`);
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },

    /**
     * 给用户分配角色
     * 用的也是upUser接口
     * **/
    async setUserRoles(params: { id: number; roles: number[] }) {
      try {
        const res: Res = await axios.post("/api/upUser", params);
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },

    async onSelf(): Promise<Resp> {
      return await axios.get("/api/v1/sysUsers/self");
    },

    /**
     * 添加Api
     * **/
    async addApi(params: ApiParam) {
      try {
        const res: Resp = await axios.post("/api/v1/sysApis", params);
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },

    /**
     * 修改Api
     * **/
    async upApi(params: ApiParam) {
      try {
        const res: Resp = await axios.patch(
          `/api/v1/sysApis/${params.id}`,
          params
        );
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },

    /**
     * 删除Api
     * **/
    async delApi(params: { id: number }) {
      try {
        const res: Resp = await axios.delete(`/api/v1/sysApis/${params.id}`);
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },

    /** 获取所有api **/
    async getAllApis(): Promise<Resp | undefined> {
      try {
        const res: Resp = await axios.get("/api/v1/sysApis");
        if (res && res.success) {
          dispatch.sys.reducerSetApis(res.data);
        }
        return res;
      } catch (err) {
        message.error("网络错误，请重试");
      }
      return;
    },
  }),
};
