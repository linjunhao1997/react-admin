/** 当前页面所需所有类型声明 **/

import { Role, UserBasicInfoParam } from "@/models/index.type";

export type { UserBasicInfoParam, Res } from "@/models/index.type";
import { History } from "history";
import { match } from "react-router-dom";

// 列表table的数据类型
export type TableRecordData = {
  key?: number;
  id?: number;
  serial?: number; // 序号
  name: string; // api名称
  desc: string; // 描述
  url: string; // url
  method: string; // 请求方式
  conditions: number; // 是否启用 1启用 -1禁用
};

export type Page = {
  pageNum: number;
  pageSize: number;
  total: number;
};

export type operateType = "add" | "see" | "up";

export type ModalType = {
  operateType: operateType;
  nowData: TableRecordData | null;
  modalShow: boolean;
  modalLoading: boolean;
};

export type SearchInfo = {
  username: string | undefined; // 用户名
  conditions: number | undefined; // 状态
};

export type RoleTreeInfo = {
  roleData: Role[]; // 所有的角色数据
  roleTreeLoading: boolean; // 控制树的loading状态，因为要先加载当前role的菜单，才能显示树
  roleTreeShow: boolean; // 角色树是否显示
  roleTreeDefault: number[]; // 用于角色树，默认需要选中的项
};

export type Props = {
  history: History;
  location: Location;
  match: match;
};
