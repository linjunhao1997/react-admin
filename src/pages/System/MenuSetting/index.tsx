/** 菜单管理页 **/

// ==================
// 第三方库
// ==================
import React, { useState, useCallback, useMemo } from "react";
import { useSetState, useMount } from "react-use";
import { useSelector, useDispatch } from "react-redux";
import {
  Tree,
  Button,
  Table,
  Tooltip,
  Popconfirm,
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  message,
  Divider,
} from "antd";
import {
  EyeOutlined,
  ToolOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  ExclamationOutlined,
} from "@ant-design/icons";
import { cloneDeep } from "lodash";

// ==================
// 组件
// ==================
import { IconsData } from "@/util/json";
import Icon from "@/components/Icon";

const { Option } = Select;
const { TextArea } = Input;

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

// ==================
// 类型声明
// ==================
import {
  TableRecordData,
  Menu,
  ModalType,
  operateType,
  MenuParam,
  Props,
} from "./index.type";
import { RootState, Dispatch } from "@/store";

// ==================
// CSS
// ==================
import "./index.less";
import { Resp } from "@/models/index.type";
import { ColumnsType } from "antd/lib/table/interface";

// ==================
// 本组件
// ==================
function MenuSettingContainer(props: Props) {
  const p = useSelector((state: RootState) => state.app.powersCode);
  const dispatch = useDispatch<Dispatch>();

  const [form] = Form.useForm();

  const [data, setData] = useState<Menu[]>([]); // 所有的菜单数据（未分层级）
  const [loading, setLoading] = useState<boolean>(false); // 数据是否正在加载中

  // 模态框相关参数控制
  const [modal, setModal] = useSetState<ModalType>({
    operateType: "add",
    nowData: null,
    modalShow: false,
    modalLoading: false,
  });

  const [treeSelect, setTreeSelect] = useState<{ title?: string; id?: number }>(
    {}
  );

  // 生命周期 - 首次加载组件时触发
  useMount(() => {
    getData();
  });

  // 获取本页面所需数据
  const getData = async () => {
    if (!p.includes("menu:query")) {
      return;
    }
    setLoading(true);
    try {
      const resp = await dispatch.sys.getMenus();
      if (resp && resp.success) {
        setData(resp.data);
      }
    } finally {
      setLoading(false);
    }
  };

  /** 工具 - 递归将扁平数据转换为层级数据 **/
  const dataToJson = useCallback((one, data) => {
    let kids;
    if (!one) {
      // 第1次递归
      kids = data.filter((item: Menu) => !item.parent);
    } else {
      kids = data.filter((item: Menu) => item.parent === one.id);
    }
    kids.forEach((item: Menu, index: number) => {
      item.index = index;
      item.children = dataToJson(item, data);
    });
    return kids.length ? kids : null;
  }, []);

  /** 点击树目录时触发 **/
  const onTreeSelect = useCallback((keys, e) => {
    let treeSelect = {};
    if (e.selected) {
      // 选中
      treeSelect = { title: e.node.title, id: e.node.id };
    }
    setTreeSelect(treeSelect);
  }, []);

  /** 工具 - 根据parentID返回parentName **/
  const getNameByParentId = (id: number | null) => {
    const p = data.find((item) => item.id === id);
    return p ? p.title : undefined;
  };

  /** 新增&修改 模态框出现 **/
  const onModalShow = (data: TableRecordData | null, type: operateType) => {
    setModal({
      modalShow: true,
      nowData: data,
      operateType: type,
    });

    setTimeout(() => {
      if (type === "add") {
        form.resetFields();
      } else {
        if (data) {
          form.setFieldsValue({
            formDisabled: data.disabled,
            formDesc: data.desc,
            formIcon: data.icon,
            formSorts: data.sorts,
            formTitle: data.title,
            formUrl: data.url,
          });
        }
      }
    });
  };

  /** 新增&修改 模态框关闭 **/
  const onClose = () => {
    setModal({
      modalShow: false,
    });
  };

  /** 新增&修改 提交 **/
  const onOk = async () => {
    if (modal.operateType === "see") {
      onClose();
      return;
    }
    try {
      const values = await form.validateFields();

      const params: MenuParam = {
        title: values.formTitle,
        url: values.formUrl,
        icon: values.formIcon,
        parent: Number(treeSelect.id) || null,
        sorts: values.formSorts,
        desc: values.formDesc,
        disabled: values.formDisabled,
      };
      setModal({
        modalLoading: true,
      });
      if (modal.operateType === "add") {
        try {
          const res = await dispatch.sys.addMenu(params);
          if (res && res.success) {
            message.success("添加成功");
            getData();
            onClose();
            dispatch.app.updateUserInfo();
          } else {
            message.error("添加失败");
          }
        } finally {
          setModal({
            modalLoading: false,
          });
        }
      } else {
        try {
          params.id = modal?.nowData?.id;
          const res: Resp | undefined = await dispatch.sys.upMenu(params);
          if (res && res.success) {
            message.success("修改成功");
            getData();
            onClose();
            dispatch.app.updateUserInfo();
          } else {
            message.error("修改失败");
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

  /** 删除一条数据 **/
  const onDel = async (record: TableRecordData) => {
    const params = { id: record.id };
    const res = await dispatch.sys.delMenu(params);
    if (res && res.status === 200) {
      getData();
      dispatch.app.updateUserInfo();
      message.success("删除成功");
    } else {
      message.error(res?.message ?? "操作失败");
    }
  };

  // ==================
  // 属性 和 memo
  // ==================

  /** 处理原始数据，将原始数据处理为层级关系 **/
  const sourceData = useMemo(() => {
    const d: Menu[] = cloneDeep(data);
    d.forEach((item: Menu & { key: string }) => {
      item.key = String(item.id);
    });
    // 按照sort排序
    d.sort((a, b) => {
      return a.sorts - b.sorts;
    });
    return dataToJson(null, d) || [];
  }, [data, dataToJson]);

  /** 构建表格字段 **/
  const tableColumns: ColumnsType = [
    {
      title: "序号",
      dataIndex: "sorts",
      key: "serial",
      defaultSortOrder: "ascend",
      sorter: (a: Menu, b: Menu) => a.sorts - b.sorts,
    },
    {
      title: "图标",
      dataIndex: "icon",
      key: "icon",
      render: (v: string | null) => {
        return v ? <Icon type={v} /> : "";
      },
    },
    {
      title: "菜单名称",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "路径",
      dataIndex: "url",
      key: "url",
      render: (v: string | null) => {
        return v ? `/${v.replace(/^\//, "")}` : "";
      },
    },
    {
      title: "描述",
      dataIndex: "desc",
      key: "desc",
    },
    {
      title: "父级",
      dataIndex: "parent",
      key: "parent",
      render: (v: number | null) => getNameByParentId(v),
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
    {
      title: "操作",
      key: "control",
      width: 120,
      render: (v: number, record: TableRecordData) => {
        const controls = [];

        p.includes("menu:query") &&
          controls.push(
            <span
              key="0"
              className="control-btn green"
              onClick={() => onModalShow(record, "see")}
            >
              <Tooltip placement="top" title="查看">
                <EyeOutlined />
              </Tooltip>
            </span>
          );
        p.includes("menu:up") &&
          controls.push(
            <span
              key="1"
              className="control-btn blue"
              onClick={() => onModalShow(record, "up")}
            >
              <Tooltip placement="top" title="修改">
                <ToolOutlined />
              </Tooltip>
            </span>
          );
        p.includes("menu:del") &&
          controls.push(
            <Popconfirm
              key="2"
              title="确定删除吗?"
              okText="确定"
              cancelText="取消"
              onConfirm={() => onDel(record)}
            >
              <span className="control-btn red">
                <Tooltip placement="top" title="删除">
                  <DeleteOutlined />
                </Tooltip>
              </span>
            </Popconfirm>
          );
        const result: JSX.Element[] = [];
        controls.forEach((item, index) => {
          if (index) {
            result.push(<Divider key={`line${index}`} type="vertical" />);
          }
          result.push(item);
        });
        return result;
      },
    },
  ];

  /** 构建表格数据 **/
  const tableData = useMemo(() => {
    return data
      .filter(
        (item: Menu) => item.parent === (Number(treeSelect.id) || null || 0)
      )
      .map((item, index) => {
        return {
          key: index,
          id: item.id,
          icon: item.icon,
          parent: item.parent,
          title: item.title,
          url: item.url,
          desc: item.desc,
          sorts: item.sorts,
          disabled: item.disabled,
          serial: index + 1,
        };
      });
  }, [data, treeSelect.id]);
  const onDrop = (info: any) => {
    const { dragNode, dropPosition, dropToGap } = info;
    let targetMenus: Menu[] = [];
    const loop = (data: any, key: string) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          targetMenus = data;
          return;
        } else if (data[i].children) {
          loop(data[i].children, key);
        }
      }
    };
    //     0          1       2          3       4
    // 0 功能管理 1 用户管理 2 菜单管理 3 角色管理 4 接口管理 5
    const targetData = cloneDeep(sourceData);
    loop(targetData, dragNode.key);
    const drag: Menu = targetMenus[dragNode.index];
    targetMenus.splice(dragNode.index, 1);
    let resultMenus: Menu[] = [];
    if (!dropToGap) {
      // 针对父子级的空隙
      targetMenus.unshift(drag);
      resultMenus = targetMenus;
    } else if (dropPosition === drag.index || dropPosition === 1 + drag.index) {
      // 忽略
    } else {
      let position: number;
      if (dragNode.index < dropPosition) {
        // 因为在前边时由于splice删了一个所以要减1
        position = dropPosition - 1;
      } else {
        position = dropPosition;
      }
      const a1 = targetMenus.slice(0, position);
      const a2 = targetMenus.slice(position);
      resultMenus = a1
        .concat(drag)
        .concat(a2)
        .filter((e: any) => e != undefined);
    }

    dispatch.sys
      .sortMenus(resultMenus.map((item: any) => item.id))
      .then((resp) => {
        if (resp?.success) {
          getData();
          dispatch.app.updateUserInfo();
        }
      });
  };

  const onDragEnter = (info: any) => {
    //console.log(info);
  };

  const allowDrop = ({ dropNode, dropPosition, dragNode }: any) => {
    return dragNode.parent == dropNode.parent || dropPosition == 0;
  };

  return (
    <div className="page-menu-admin">
      <div className="l">
        <div className="title">目录结构</div>
        <div>
          <Tree
            draggable
            onDrop={onDrop}
            allowDrop={allowDrop}
            onDragEnter={onDragEnter}
            defaultExpandedKeys={["0"]}
            onSelect={onTreeSelect}
            selectedKeys={[String(treeSelect.id)]}
            treeData={sourceData}
          />
        </div>
      </div>
      <div className="r">
        <div className="searchBox">
          <ul>
            <li>
              <Button
                type="primary"
                icon={<PlusCircleOutlined />}
                onClick={() => onModalShow(null, "add")}
                disabled={!p.includes("menu:add")}
              >
                {`添加${treeSelect.title || "根级"}子菜单`}
              </Button>
            </li>
          </ul>
        </div>
        <Table
          className="diy-table"
          columns={tableColumns}
          loading={loading}
          dataSource={tableData}
          pagination={{
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条数据`,
          }}
        />
      </div>

      <Modal
        title={`${{ add: "新增", up: "修改", see: "查看" }[modal.operateType]}`}
        visible={modal.modalShow}
        onOk={onOk}
        onCancel={onClose}
        confirmLoading={modal.modalLoading}
      >
        <Form form={form} initialValues={{ formDisabled: 0 }}>
          <Form.Item
            label="菜单名"
            name="formTitle"
            {...formItemLayout}
            rules={[
              { required: true, whitespace: true, message: "必填" },
              { max: 12, message: "最多输入12位字符" },
            ]}
          >
            <Input
              placeholder="请输入菜单名"
              disabled={modal.operateType === "see"}
            />
          </Form.Item>
          <Form.Item
            label="菜单模块"
            name="formUrl"
            {...formItemLayout}
            rules={[{ required: true, whitespace: true, message: "必填" }]}
            extra={
              <span>
                <ExclamationOutlined />
                只能已创建时的为准
              </span>
            }
          >
            <Input
              placeholder="请输入菜单链接"
              disabled={modal.operateType === "see"}
            />
          </Form.Item>
          <Form.Item label="图标" name="formIcon" {...formItemLayout}>
            <Select
              dropdownClassName="iconSelect"
              disabled={modal.operateType === "see"}
            >
              {IconsData.map((item, index) => {
                return (
                  <Option key={index} value={item}>
                    <Icon type={item} />
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item
            label="描述"
            name="formDesc"
            {...formItemLayout}
            rules={[{ max: 100, message: "最多输入100位字符" }]}
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
          {modal.operateType === "add" ? (
            <Form.Item label="赋予" {...formItemLayout}>
              <span style={{ color: "green" }}>
                新增菜单后请前往角色管理将菜单授权给相关角色
              </span>
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
    </div>
  );
}

export default MenuSettingContainer;
