// 菜单添加，修改时的参数类型
export interface MenuParam {
  id?: number; // ID,添加时可以没有id
  title: string; // 标题
  icon: string; // 图标
  url: string; // 链接路径
  parent: number | null; // 父级ID
  desc: string; // 描述
  sorts?: number; // 排序编号
  disabled: number; // 状态: 1禁用,0启用
  children?: Menu[]; // 子菜单
  powers?: Power[]; // 菜单功能
}

// 菜单对象
export interface Menu extends MenuParam {
  id: number; // ID
  index?: number;
}

// 菜单id和功能id
export interface MenuAndPower {
  menuId: number; // 菜单ID
  powers: number[]; // 该菜单拥有的所有功能ID
}

// 角色添加和修改时的参数类型
export interface RoleParam {
  id?: number; // ID,添加时可以不传id
  title: string; // 角色名
  desc: string; // 描述
  sorts?: number; // 排序编号
  disabled: number; // 状态: 1禁用,0启用
  menuIds?: number[]; // 当前角色拥有的菜单Id
  powerIds?: number[]; // 当前角色拥有的功能Id
  apiIds?: number[]; // 当前角色拥有apiId
}

// 角色对象
export interface Role extends RoleParam {
  id: number; // ID
  menus: Menu[]; // 当前角色拥有的菜单
  powers: Power[]; // 当前角色拥有的功能
  apis: Api[]; // 当前角色拥有api
}

// 功能添加修改时的参数类型
export interface PowerParam {
  id?: number; // ID, 添加时可以没有id
  menuId: number; // 所属的菜单
  title: string; // 标题
  code: string; // CODE
  desc: string; // 描述
  sorts: number; // 排序
  disabled: number; // 状态: 1禁用,0启用
  roleIds: number[]; // 属于的角色id
}

// 功能对象
export interface Power extends PowerParam {
  id: number; // ID
  roles: Role[];
}

// api对象
export interface ApiParam {
  id?: number; // ID, 添加时可以没有id
  name: number; // api名称
  url: string; // url
  method: string; // 请求方式
  desc: string; // 描述
  disabled: number; // 状态: 1禁用,0启用
}

// 功能对象
export interface Api extends ApiParam {
  id: number; // ID
}

// 用户数据类型
export interface UserInfo {
  userBasicInfo: UserBasicInfo | null; // 用户的基本信息
  menus: Menu[]; // 拥有的所有菜单对象
  roles: Role[]; // 拥有的所有角色对象
  powers: Power[]; // 拥有的所有权限对象
}

// 用户的基本信息
export interface UserBasicInfo {
  id: number; // ID
  username: string; // 用户名
  password: string | number; // 密码
  phone: string | number; // 手机
  email: string; // 邮箱
  desc: string; // 描述
  disabled: number; // 状态: 1禁用,0启用
  roles: number[]; // 拥有的所有角色ID
}

// 添加修改用户时参数的数据类型
export interface UserBasicInfoParam {
  id?: number; // ID
  username: string; // 用户名
  password: string | number; // 密码
  phone?: string | number; // 手机
  email?: string; // 邮箱
  desc?: string; // 描述
  roleIds?: number[]; // 角色
  disabled?: number; // 状态: 1禁用,0启用
}

export interface PowerTree extends Menu {
  powers: Power[];
}

// ./app.js的state类型
export interface AppState {
  userinfo: UserInfo;
  powersCode: string[];
}

// ./sys.js的state类型
export interface SysState {
  menus: Menu[];
  roles: Role[];
  apis: Api[];
  powerTreeData: PowerTree[];
}

// 接口的返回值类型
export type Res =
  | {
      status: number; // 状态，200成功
      data?: any; // 返回的数据
      message?: string; // 返回的消息
    }
  | undefined;

export interface Resp {
  code: number;
  data: any;
  error: string;
  success: boolean;
  message: string;
}

export interface LoginRes {
  code: number;
  token: string;
}
