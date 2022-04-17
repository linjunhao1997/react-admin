import {
  Props,
  UserBasicInfoParam,
} from "@/pages/System/UserSetting/index.type";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "@/store";
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Table,
} from "antd";
import { useAntdTable } from "ahooks";
import { getTableData } from "@/util/common";
import React, { useState } from "react";
import { ApiParam, Resp } from "@/models/index.type";
import { ControlledMenu, MenuItem, useMenuState } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import { useSetState } from "react-use";
import {
  ModalType,
  operateType,
  TableRecordData,
} from "@/pages/System/ApiSetting/index.type";
import {
  PlusCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
const { Option } = Select;
const { confirm } = Modal;

function ApiSettingContainer(props: Props): JSX.Element {
  const dispatch = useDispatch<Dispatch>();
  const userinfo = useSelector((state: RootState) => state.app.userinfo);
  const p = useSelector((state: RootState) => state.app.powersCode);

  const { toggleMenu, ...menuProps } = useMenuState();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [record, setRecord] = useState<any>(null);

  const [formForSearch] = Form.useForm();
  const { tableProps, search, refresh } = useAntdTable(
    getTableData(`/api/v1/sysApis/_search`),
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
      添加API
    </Button>
  );
  const advanceSearchForm = (
    <div>
      <Form form={formForSearch}>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item label="url" name="url">
              <Input placeholder="url" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="请求方式" name="method">
              <Input placeholder="method" />
            </Form.Item>
          </Col>
        </Row>
        <Row justify="end">
          <Form.Item style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="primary" onClick={submit}>
              查询
            </Button>
            <Button onClick={reset} style={{ marginLeft: 16 }}>
              重置
            </Button>
            <Button type="link" onClick={changeType}>
              简单查询
            </Button>
          </Form.Item>
        </Row>
      </Form>
    </div>
  );

  const searchForm = (
    <div style={{ marginBottom: 16 }}>
      <Form
        form={formForSearch}
        style={{ display: "flex", justifyContent: "flex-end" }}
      >
        <Form.Item name="disabled">
          <Select
            style={{ width: 120, marginRight: 16 }}
            defaultValue=""
            onChange={submit}
          >
            <Option value="">全部</Option>
            <Option value="0">启用</Option>
            <Option value="1">禁用</Option>
          </Select>
        </Form.Item>
        <Form.Item name="url">
          <Input.Search
            placeholder="url"
            style={{ width: 240 }}
            onSearch={submit}
          />
        </Form.Item>
        <Button type="link" onClick={changeType}>
          复杂查询
        </Button>
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
  const [modal, setModal] = useSetState<ModalType>({
    operateType: "add", // see查看，add添加，up修改
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
  const onModalShow = (
    data: TableRecordData | null,
    type: operateType
  ): void => {
    setModal({
      modalShow: true,
      nowData: data,
      operateType: type,
    });
    // 用setTimeout是因为首次让Modal出现时得等它挂载DOM，不然form对象还没来得及挂载到Form上
    setTimeout(() => {
      if (type === "add") {
        // 新增，需重置表单各控件的值
        formForModal.resetFields();
      } else if (data) {
        // 查看或修改，需设置表单各控件的值为当前所选中行的数据
        formForModal.setFieldsValue({
          formDisabled: data.disabled,
          formDesc: data.desc,
          formName: data.name,
          formUrl: data.url,
          formMethod: data.method,
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
      const params: ApiParam = {
        name: values.formName,
        desc: values.formDesc,
        url: values.formUrl,
        method: values.formMethod,
        disabled: values.formDisabled,
      };
      if (modal.operateType === "add") {
        // 新增
        try {
          const res: Resp | undefined = await dispatch.sys.addApi(params);
          if (res && res.success) {
            message.success(res?.message ?? "添加成功");
            refresh();
            onClose();
            dispatch.sys.getAllApis();
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
          const res: Resp | undefined = await dispatch.sys.upApi(params);
          if (res && res.success) {
            message.success(res.message);
            refresh();
            onClose();
            dispatch.sys.getAllApis();
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
      const res = await dispatch.sys.delApi({ id });
      if (res && res.success) {
        message.success("删除成功");
        refresh();
        dispatch.sys.getAllApis();
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

  const columns = [
    {
      title: "id",
      dataIndex: "id",
    },
    {
      title: "名称",
      dataIndex: "name",
    },
    {
      title: "url",
      dataIndex: "url",
    },
    {
      title: "请求方式",
      dataIndex: "method",
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
      {p.includes("api:add") && CreateButton}
      {type === "simple" ? searchForm : advanceSearchForm}
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
        {p.includes("api:up") && (
          <MenuItem onClick={() => onModalShow(record, "up")}>编辑</MenuItem>
        )}
        {p.includes("api:query") && (
          <MenuItem onClick={() => onModalShow(record, "see")}>详情</MenuItem>
        )}
        {p.includes("api:del") && (
          <MenuItem onClick={() => handleDelete(record)}>删除</MenuItem>
        )}
      </ControlledMenu>
      <Modal
        title={{ add: "新增", up: "修改", see: "查看" }[modal.operateType]}
        visible={modal.modalShow}
        onOk={onOk}
        onCancel={onClose}
        confirmLoading={modal.modalLoading}
      >
        <Form
          form={formForModal}
          initialValues={{
            formDisabled: 0,
          }}
        >
          <Form.Item
            label="名称"
            name="formName"
            {...formItemLayout}
            rules={[{ required: true, whitespace: true, message: "必填" }]}
          >
            <Input
              placeholder="请输入API名称"
              disabled={modal.operateType === "see"}
            />
          </Form.Item>
          <Form.Item
            label="url"
            name="formUrl"
            {...formItemLayout}
            rules={[{ required: true, whitespace: true, message: "必填" }]}
          >
            <Input
              placeholder="请输入url"
              disabled={modal.operateType === "see"}
            />
          </Form.Item>
          <Form.Item
            label="method"
            name="formMethod"
            {...formItemLayout}
            rules={[{ required: true, whitespace: true, message: "必填" }]}
          >
            <Input
              placeholder="请输入请求方式"
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
        </Form>
      </Modal>
    </>
  );
}

export default ApiSettingContainer;
