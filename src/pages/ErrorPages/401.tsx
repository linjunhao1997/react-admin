/* 401 没有功能 */

import React from "react";
import { Button } from "antd";
import Img from "@/assets/error.gif";
import { History } from "history";

import "./index.less";

interface Props {
  history: History;
}

export default function NoPowerContainer(props: Props): JSX.Element {
  const gotoHome = (): void => {
    props.history.replace("/");
  };

  return (
    <div className="page-error">
      <div>
        <div className="title">401</div>
        <div className="info">你没有访问该页面的功能</div>
        <div className="info">请联系你的管理员</div>
        <Button className="backBtn" type="primary" ghost onClick={gotoHome}>
          返回首页
        </Button>
      </div>
      <img src={Img + `?${Date.now()}`} />
    </div>
  );
}
