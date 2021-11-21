/** 登录页 **/

// ==================
// 所需的各种插件
// ==================
import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import tools from "@/util/tools";

// ==================
// 所需的所有组件
// ==================
import Vcode from "react-vcode";
import { Form, Input, Button, Checkbox, message } from "antd";
import { UserOutlined, KeyOutlined } from "@ant-design/icons";
import CanvasBack from "@/components/CanvasBack";
import LogoImg from "@/assets/logo.png";

// ==================
// 类型声明
// ==================
import { RootState, Dispatch } from "@/store";
import {
  Role,
  Menu,
  Power,
  UserBasicInfo,
  Res,
  LoginRes,
  Resp,
} from "@/models/index.type";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import { History } from "history";
import { match } from "react-router-dom";

/**
 * 除了mapState和mapDispatch
 * 每个页面都自动被注入history,location,match 3个对象
 */
type Props = {
  history: History;
  location: Location;
  match: match;
};

// ==================
// CSS
// ==================
import "./index.less";

// ==================
// 本组件
// ==================
function LoginContainer(props: Props): JSX.Element {
  const dispatch = useDispatch<Dispatch>();
  const p = useSelector((state: RootState) => state.app.powersCode);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false); // 是否正在登录中
  const [rememberPassword, setRememberPassword] = useState(false); // 是否记住密码
  const [codeValue, setCodeValue] = useState("00000"); // 当前验证码的值
  const [show, setShow] = useState(false); // 加载完毕时触发动画

  // 进入登陆页时，判断之前是否保存了用户名和密码
  useEffect(() => {
    const userLoginInfo = localStorage.getItem("userLoginInfo");
    if (userLoginInfo) {
      const userLoginInfoObj = JSON.parse(userLoginInfo);
      setRememberPassword(true);

      form.setFieldsValue({
        username: userLoginInfoObj.username,
        password: tools.uncompile(userLoginInfoObj.password),
      });
    }
    if (!userLoginInfo) {
      document.getElementById("username")?.focus();
    } else {
      document.getElementById("vcode")?.focus();
    }
    setShow(true);
  }, [form]);

  /**
   * 执行登录
   * 这里模拟：
   * 1.登录，得到用户信息
   * 2.通过用户信息获取其拥有的所有角色信息
   * 3.通过角色信息获取其拥有的所有权限信息
   * **/
  const loginIn = useCallback(
    async (username, password) => {
      let userBasicInfo: UserBasicInfo | null = null;
      let roles: Role[] = [];
      const menus: Menu[] = [];
      const powers: Power[] = [];
      try {
        /** 1.登录 （返回信息中有该用户拥有的角色id） **/
        const res1: LoginRes | undefined = await dispatch.app.onLogin({
          username,
          password,
        });
        sessionStorage.setItem("token", res1?.token || "");
        const res2: Resp | undefined = await dispatch.sys.onSelf();

        userBasicInfo = res2?.data;

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
        console.log("menus:", menus);
        /** 4.根据权限id，获取权限信息 **/
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
        console.log("powers:", powers);
      } catch (e) {
        console.log("error", e);
        return {
          status: 400,
          data: { userBasicInfo: null, roles, menus, powers },
        };
      }
      return { status: 200, data: { userBasicInfo, roles, menus, powers } };
    },
    [dispatch.sys, dispatch.app]
  );

  // 用户提交登录
  const onSubmit = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await loginIn(values.username, values.password);
      if (res && res.status === 200) {
        message.success("登录成功");
        if (rememberPassword) {
          localStorage.setItem(
            "userLoginInfo",
            JSON.stringify({
              username: values.username,
              password: tools.compile(values.password), // 密码简单加密一下再存到localStorage
            })
          ); // 保存用户名和密码
        } else {
          localStorage.removeItem("userLoginInfo");
        }
        /** 将这些信息加密后存入sessionStorage,并存入store **/
        sessionStorage.setItem(
          "userinfo",
          tools.compile(JSON.stringify(res.data))
        );
        console.log("userinfo", res.data);
        await dispatch.app.setUserInfo(res.data);
        props.history.replace("/"); // 跳转到主页
      } else {
        setLoading(false);
      }
    } catch (e) {
      // 验证未通过
      setLoading(false);
    }
  };

  // 记住密码按钮点击
  const onRemember = (e: CheckboxChangeEvent): void => {
    setRememberPassword(e.target.checked);
  };

  // 验证码改变时触发
  const onVcodeChange = (code: string): void => {
    form.setFieldsValue({
      vcode: code, // 开发模式自动赋值验证码，正式环境，这里应该赋值''
    });
    setCodeValue(code);
  };

  return (
    <div className="page-login">
      <div className="canvasBox">
        <CanvasBack row={12} col={8} />
      </div>
      <div className={show ? "loginBox show" : "loginBox"}>
        <Form form={form}>
          <div className="title">
            <img src={LogoImg} alt="logo" />
            <span>React-Admin</span>
          </div>
          <div>
            <Form.Item
              name="username"
              rules={[
                { max: 12, message: "最大长度为12位字符" },
                {
                  required: true,
                  whitespace: true,
                  message: "请输入用户名",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ fontSize: 13 }} />}
                size="large"
                id="username" // 为了获取焦点
                placeholder="admin/user"
                onPressEnter={onSubmit}
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "请输入密码" },
                { max: 18, message: "最大长度18个字符" },
              ]}
            >
              <Input
                prefix={<KeyOutlined style={{ fontSize: 13 }} />}
                size="large"
                type="password"
                placeholder="123456/123456"
                onPressEnter={onSubmit}
              />
            </Form.Item>
            <Form.Item>
              <Form.Item
                name="vcode"
                noStyle
                rules={[
                  (): any => ({
                    validator: (rule: any, value: string): Promise<any> => {
                      const v = tools.trim(value);
                      if (v) {
                        if (v.length > 4) {
                          return Promise.reject("验证码为4位字符");
                        } else if (
                          v.toLowerCase() !== codeValue.toLowerCase()
                        ) {
                          return Promise.reject("验证码错误");
                        } else {
                          return Promise.resolve();
                        }
                      } else {
                        return Promise.reject("请输入验证码");
                      }
                    },
                  }),
                ]}
              >
                <Input
                  style={{ width: "200px" }}
                  size="large"
                  id="vcode" // 为了获取焦点
                  placeholder="请输入验证码"
                  onPressEnter={onSubmit}
                />
              </Form.Item>
              <Vcode
                height={40}
                width={150}
                onChange={onVcodeChange}
                className="vcode"
                style={{ color: "#f00" }}
                options={{
                  lines: 16,
                }}
              />
            </Form.Item>
            <div style={{ lineHeight: "40px" }}>
              <Checkbox
                className="remember"
                checked={rememberPassword}
                onChange={onRemember}
              >
                记住密码
              </Checkbox>
              <Button
                className="submit-btn"
                size="large"
                type="primary"
                loading={loading}
                onClick={onSubmit}
              >
                {loading ? "请稍后" : "登录"}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default LoginContainer;
