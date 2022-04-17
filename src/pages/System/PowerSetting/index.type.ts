/** 当前页面所需所有类型声明 **/

import { PowerTreeDefault } from "@/components/TreeChose/PowerTreeTable";
import { Menu, Power, Role } from "@/models/index.type";
export type {
  Menu,
  UserInfo,
  Role,
  Power,
  PowerParam,
  Res,
} from "@/models/index.type";

// 构建table所需数据
export type TableRecordData = Power & {
  key: number;
  serial: number;
  control: number;
};
export type operateType = "add" | "see" | "up";
export type ModalType = {
  operateType: operateType;
  nowData: TableRecordData | null;
  modalShow: boolean;
  modalLoading: boolean;
};
export type PowerTreeInfo = {
  treeOnOkLoading: boolean; // 是否正在分配功能
  powerTreeShow: boolean; // 功能树是否显示
  // 树默认需要选中的项
  powerTreeDefault: PowerTreeDefault;
};
export type SearchInfo = {
  title: string | undefined; // 用户名
  disabled: number | undefined; // 状态
};
