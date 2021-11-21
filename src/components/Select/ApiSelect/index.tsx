import React, { Ref } from "react";
import { Select, Tag } from "antd";
import { useRequest } from "ahooks";
import axios from "axios";

const { Option } = Select;

interface Props {
  value?: [];
  //defaultValue: number[]; // 选中的菜单
  onChange?: (value: any) => void;
}

const mapTag = {
  PATCH: "#D38042",
  DELETE: "#a41e22",
  GET: "#0f6ab4",
  POST: "#10a54a",
  PUT: "#c5862b",
  HEAD: "#ffd20f",
};

export default function ApiSelect(props: Props): JSX.Element {
  console.log("props", props);
  const { data, error, loading } = useRequest("/api/v1/sysApis", {
    requestMethod: (param: any) => axios.get(param),
  });
  if (error) {
    return <div>failed to load</div>;
  }
  if (loading) {
    return <div>loading...</div>;
  }

  const children: JSX.Element[] = [];
  data.data.forEach((item: any) => {
    children.push(
      <Option key={item.id} value={item.id}>
        <span>
          <Tag color={mapTag[item.method]}>{item.method}</Tag>
        </span>
        <span>{item.url}</span>
      </Option>
    );
  });

  // 之所以key用时间戳是因为key不变时antd的select的defaultValue只在第一次render时生效
  return (
    <Select
      key={new Date().toString()}
      mode="multiple"
      showArrow
      style={{ width: "100%" }}
      defaultValue={props.value}
    >
      {children}
    </Select>
  );
}
