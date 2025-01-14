import { Props, TableRecordData } from "@/pages/System/RoleSetting/index.type";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "@/store";
import { Button, Form, Input, message, Modal, Select, Table, Tag } from "antd";
import { useAntdTable } from "ahooks";
import { getTableData } from "@/util/common";
import React, { useState } from "react";
import { Api, Resp, RoleParam } from "@/models/index.type";
import { ControlledMenu, MenuItem, useMenuState } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import { useMount, useSetState } from "react-use";
import { ModalType, operateType } from "@/pages/System/RoleSetting/index.type";
import {
  PlusCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { PowerTreeInfo } from "@/pages/System/RoleSetting/index.type";
import PowerTreeCom, {
  PowerTreeDefault,
} from "@/components/TreeChose/PowerTreeTable";

const { Option } = Select;
const { confirm } = Modal;

const mapTag = {
  PATCH: "#D38042",
  DELETE: "#a41e22",
  GET: "#0f6ab4",
  POST: "#10a54a",
  PUT: "#c5862b",
  HEAD: "#ffd20f",
};

function RoleSettingContainer(props: Props): JSX.Element {
  const dispatch = useDispatch<Dispatch>();
  const p = useSelector((state: RootState) => state.app.powersCode);
  const powerTreeData = useSelector(
    (state: RootState) => state.sys.powerTreeData
  );
  const { toggleMenu, ...menuProps } = useMenuState();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [record, setRecord] = useState<any>(null);

  // 功能树相关参数
  const [power, setPower] = useSetState<PowerTreeInfo>({
    treeOnOkLoading: false,
    powerTreeShow: false,
    powerTreeDefault: { menus: [], powers: [] },
  });

  const [apis, setApis] = useState([]);

  // 生命周期 - 首次加载组件时触发
  useMount(() => {
    getPowerTreeData();
    dispatch.sys.getAllApis().then((resp) => {
      if (resp?.success) {
        setApis(resp.data);
      }
    });
  });

  // 函数 - 获取所有的菜单功能数据，用于分配功能控件的原始数据
  const getPowerTreeData = () => {
    dispatch.sys.getAllMenusAndPowers();
  };

  const [formForSearch] = Form.useForm();
  const { tableProps, search, refresh } = useAntdTable(
    getTableData(`/api/v1/sysRoles/_search`),
    {
      defaultPageSize: 10,
      form: formForSearch,
    }
  );
  const { pagination } = tableProps as any;
  pagination.showTotal = (total: number) => {
    return `共${total}条`;
  };
  pagination.showQuickJumper = true;
  pagination.showSizeChanger = true;
  const { type, changeType, submit, reset } = search;

  const CreateButton = (
    <Button
      type="primary"
      icon={<PlusCircleOutlined />}
      onClick={() => onModalShow(null, "add")}
    >
      添加角色
    </Button>
  );
  const searchForm = (
    <div style={{ marginBottom: 16 }}>
      <Form
        form={formForSearch}
        style={{ display: "flex", justifyContent: "flex-end" }}
        initialValues={{ fromDisabled: 0 }}
      >
        <Form.Item name="disabled">
          <Select
            style={{ width: 120, marginRight: 16 }}
            onChange={submit}
            defaultValue=""
          >
            <Option value="">全部</Option>
            <Option value="0">启用</Option>
            <Option value="1">禁用</Option>
          </Select>
        </Form.Item>
        <Form.Item name="name">
          <Input.Search
            placeholder="角色名"
            style={{ width: 240 }}
            onSearch={submit}
          />
        </Form.Item>
      </Form>
    </div>
  );

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 19 },
    },
  };
  const { TextArea } = Input;
  const [loading, setLoading] = useState(false); // 数据是否正在加载中
  // 模态框相关参数
  // 模态框相关参数控制
  const [modal, setModal] = useSetState<ModalType>({
    operateType: "add",
    nowData: null,
    modalShow: false,
    modalLoading: false,
  });

  const [formForModal] = Form.useForm();
  /**
   * 添加/修改/查看 模态框出现
   * @param data 当前选中的那条数据
   * @param type add添加/up修改/see查看
   * **/
  /**
   * 添加/修改/查看 模态框出现
   * @param data 当前选中的那条数据
   * @param type add添加/up修改/see查看
   * **/
  const onModalShow = (data: TableRecordData | null, type: operateType) => {
    setModal({
      modalShow: true,
      nowData: data,
      operateType: type,
    });
    setRecord(data);
    setTimeout(() => {
      if (type === "add") {
        // 新增，需重置表单各控件的值
        formForModal.resetFields();
      } else {
        // 查看或修改，需设置表单各控件的值为当前所选中行的数据
        formForModal.setFieldsValue({
          formDisabled: data?.disabled,
          formDesc: data?.desc,
          //formSorts: data?.sorts,
          formApiIds: data?.apis.map((api) => {
            return api.id;
          }),
          formTitle: data?.title,
        });
      }
    });
  };
  /** 模态框确定 **/
  const onOk = async (): Promise<void> => {
    if (modal.operateType === "see") {
      onClose();
      return;
    }
    try {
      const values = await formForModal.validateFields();
      setModal({
        modalLoading: true,
      });
      const params: RoleParam = {
        title: values.formTitle,
        desc: values.formDesc,
        //sorts: values.formSorts,
        apiIds: values.formApiIds,
        disabled: values.formDisabled,
      };
      if (modal.operateType === "add") {
        // 新增
        try {
          const res: Resp | undefined = await dispatch.sys.addRole(params);
          if (res && res.success) {
            message.success(res?.message ?? "添加成功");
            refresh();
            onClose();
          } else {
            message.error(res?.message ?? "操作失败");
          }
        } finally {
          setModal({
            modalLoading: false,
          });
        }
      } else {
        // 修改
        params.id = modal.nowData?.id;
        try {
          const res: Resp | undefined = await dispatch.sys.upRole(params);
          if (res && res.success) {
            message.success(res.message);
            refresh();
            onClose();
          } else {
            message.error(res?.message ?? res?.error ?? "操作失败");
          }
        } finally {
          setModal({
            modalLoading: false,
          });
        }
      }
    } catch {
      // 未通过校验
    }
  };

  const handleDelete = (record: TableRecordData) => {
    confirm({
      title: "确定删除此记录？",
      icon: <ExclamationCircleOutlined />,
      content: "",
      okText: "确认",
      cancelText: "取消",
      onOk() {
        return onDel(record.id);
      },
    });
  };

  // 删除某一条数据
  const onDel = async (id: number): Promise<void> => {
    setLoading(true);
    try {
      const res = await dispatch.sys.delRole({ id });
      if (res?.success) {
        message.success("删除成功");
        refresh();
        dispatch.app.updateUserInfo();
      } else {
        message.error(res?.message ?? "操作失败");
      }
    } finally {
      setLoading(false);
    }
  };

  /** 模态框关闭 **/
  const onClose = () => {
    setModal({
      modalShow: false,
    });
  };

  /** 分配功能按钮点击，功能控件出现 **/
  const onAllotPowerClick = (record: TableRecordData) => {
    const menuIds = record.menus.map((item) => item.id); // 需默认选中的菜单项ID
    // 需默认选中的功能ID
    const powers = record.menus.reduce(
      (v1, v2) => [...v1, ...(v2.powers || [])],
      []
    );
    const powerIds = powers.map((item) => item.id); // 需默认选中的功能项ID
    setModal({ nowData: record });
    setPower({
      powerTreeShow: true,
      powerTreeDefault: {
        menus: menuIds,
        powers: powerIds,
      },
    });
  };

  // 权限树确定 给角色分配菜单和权限
  const onPowerTreeOk = async (arr: PowerTreeDefault) => {
    if (!modal?.nowData?.id) {
      message.error("该数据没有ID");
      return;
    }
    const params = {
      id: modal.nowData.id,
      menuIds: arr.menus,
      powerIds: arr.powers,
    };

    setPower({ treeOnOkLoading: true });
    try {
      const res = await dispatch.sys.setPowersByRoleId(params);
      if (res?.success) {
        refresh();
        dispatch.app.updateUserInfo();
        onPowerTreeClose();
      } else {
        message.error(res?.message ?? "权限分配失败");
      }
    } finally {
      setPower({ treeOnOkLoading: false });
    }
  };

  // 关闭菜单树
  const onPowerTreeClose = () => {
    setPower({
      powerTreeShow: false,
    });
  };

  const columns = [
    {
      title: "序号",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "角色名",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "描述",
      dataIndex: "desc",
      key: "desc",
    },
    {
      title: "状态",
      dataIndex: "disabled",
      key: "disabled",
      render: (v: number) =>
        v === 0 ? (
          <span style={{ color: "green" }}>启用</span>
        ) : (
          <span style={{ color: "red" }}>禁用</span>
        ),
    },
  ];

  return (
    <>
      {CreateButton}
      {searchForm}
      <Table
        columns={columns}
        rowKey="id"
        onRow={(record: any) => {
          return {
            onContextMenu: (e) => {
              e.preventDefault();
              setRecord(record);
              toggleMenu(true);
              setAnchorPoint({ x: e.clientX, y: e.clientY });
            },
          };
        }}
        {...tableProps}
      />
      <ControlledMenu
        {...menuProps}
        anchorPoint={anchorPoint}
        onClose={() => toggleMenu(false)}
      >
        <MenuItem onClick={() => onModalShow(record, "up")}>编辑</MenuItem>
        <MenuItem onClick={() => onModalShow(record, "see")}>详情</MenuItem>
        <MenuItem onClick={() => onAllotPowerClick(record)}>
          分配菜单功能
        </MenuItem>
        <MenuItem onClick={() => handleDelete(record)}>删除</MenuItem>
      </ControlledMenu>
      {/* 新增&修改&查看 模态框 */}
      <Modal
        title={{ add: "新增", up: "修改", see: "查看" }[modal.operateType]}
        visible={modal.modalShow}
        onOk={() => onOk()}
        onCancel={() => onClose()}
        confirmLoading={modal.modalLoading}
      >
        <Form
          form={formForModal}
          initialValues={{
            formDisabled: 0,
          }}
        >
          <Form.Item
            label="角色名"
            name="formTitle"
            {...formItemLayout}
            rules={[
              { required: true, whitespace: true, message: "必填" },
              { max: 12, message: "最多输入12位字符" },
            ]}
          >
            <Input
              placeholder="请输入角色名"
              disabled={modal.operateType === "see"}
            />
          </Form.Item>
          <Form.Item
            label="描述"
            name="formDesc"
            {...formItemLayout}
            rules={[{ max: 100, message: "最多输入100个字符" }]}
          >
            <TextArea
              rows={4}
              disabled={modal.operateType === "see"}
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
          </Form.Item>
          <Form.Item
            label="状态"
            name="formDisabled"
            {...formItemLayout}
            rules={[{ required: true, message: "请选择状态" }]}
          >
            <Select disabled={modal.operateType === "see"}>
              <Option key={0} value={0}>
                启用
              </Option>
              <Option key={1} value={1}>
                禁用
              </Option>
            </Select>
          </Form.Item>
          <Form.Item label="api权限" name="formApiIds" {...formItemLayout}>
            <Select
              mode="multiple"
              showArrow
              style={{ width: "100%" }}
              disabled={modal.operateType === "see"}
            >
              {apis.map((item: Api) => {
                return (
                  <Option
                    key={item.id}
                    value={item.id}
                    disabled={!!item.disabled}
                  >
                    <span>
                      <Tag color={mapTag[item.method]}>{item.method}</Tag>
                    </span>
                    <span>{item.url}</span>
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <PowerTreeCom
        title={modal.nowData ? `分配权限：${modal.nowData.title}` : "分配权限"}
        data={powerTreeData}
        defaultChecked={power.powerTreeDefault}
        loading={power.treeOnOkLoading}
        modalShow={power.powerTreeShow}
        onOk={onPowerTreeOk}
        onClose={onPowerTreeClose}
      />
    </>
  );
}

export default RoleSettingContainer;
