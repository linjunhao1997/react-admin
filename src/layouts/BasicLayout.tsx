/** 基础页面结构 - 有头部、底部、侧边导航 **/

// ==================
// 第三方库
// ==================
import React, { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Route, Redirect } from "react-router-dom";
import CacheRoute, { CacheSwitch } from "react-router-cache-route";
import loadable from "@loadable/component";
import { ConfigProvider, Layout, message } from "antd";
import zhCN from "antd/es/locale/zh_CN";
// ==================
// 自定义的东西
// ==================
import tools from "@/util/tools";
import "./BasicLayout.less";

// ==================
// 组件
// ==================
import Header from "@/components/Header";
import MenuCom from "@/components/Menu";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import ErrorBoundary from "@/components/ErrorBoundary";

import Bread from "@/components/Bread";
//import BreadTab from "@/components/BreadTab"; // Tab方式的导航

const { Content } = Layout;

// ==================
// 异步加载各路由模块
// ==================
const [
  NotFound,
  NoPower,
  Home,
  UserSetting,
  RoleSetting,
  PowerSetting,
  MenuSetting,
  ApiSetting,
  MQTT,
] = [
  () => import(`../pages/ErrorPages/404`),
  () => import(`../pages/ErrorPages/401`),
  () => import(`../pages/Home`),
  () => import(`../pages/System/UserSetting`),
  () => import(`../pages/System/RoleSetting`),
  () => import(`../pages/System/PowerSetting`),
  () => import(`../pages/System/MenuSetting`),
  () => import(`../pages/System/ApiSetting`),
  () => import(`../components/Hook`),
].map((item) => {
  return loadable(item as any, {
    fallback: <Loading />,
  });
});

// ==================
// 类型声明
// ==================
import { RootState, Dispatch } from "@/store";
import { Menu } from "@/models/index.type";
import { History } from "history";
import HookMqtt from "@/components/Hook";

type Props = {
  history: History;
  location: Location;
};

// ==================
// 本组件
// ==================
function BasicLayoutCom(props: Props): JSX.Element {
  const dispatch = useDispatch<Dispatch>();
  const userInfo = useSelector((state: RootState) => state.app.userInfo);
  const [collapsed, setCollapsed] = useState(false); // 菜单栏是否收起

  // 退出登录
  const onLogout = useCallback(() => {
    dispatch.app.onLogout().then(() => {
      message.success("退出成功");
      props.history.push("/user/login");
    });
  }, [props, dispatch.app]);

  /**
   * 工具 - 判断当前用户是否有该路由功能，如果没有就跳转至401页
   * @param pathname 路由路径
   * **/
  const checkRouterPower = useCallback(
    (pathname: string) => {
      let menus: Menu[] = [];
      if (userInfo.menus && userInfo.menus.length) {
        menus = userInfo.menus;
      } else if (sessionStorage.getItem("userInfo")) {
        menus = JSON.parse(
          tools.uncompile(sessionStorage.getItem("userInfo") || "[]")
        ).menus;
      }
      const m: string[] = menus.map((item) => item.url); // 当前用户拥有的所有菜单
      return m.includes(pathname);
    },
    [userInfo]
  );

  // 切换路由时触发
  const onEnter = useCallback(
    (Component, props) => {
      /**
       * 检查当前用户是否有该路由页面的功能
       * 没有则跳转至401页
       * **/
      if (checkRouterPower(props.location.pathname)) {
        return <Component {...props} />;
      }
      return <Redirect to="/nopower" />;
    },
    [checkRouterPower]
  );

  return (
    <Layout className="page-basic" hasSider>
      <MenuCom
        data={userInfo.menus}
        collapsed={collapsed}
        location={props.location}
        history={props.history}
      />

      <Layout>
        <Header
          collapsed={collapsed}
          userInfo={userInfo}
          onToggle={() => setCollapsed(!collapsed)}
          onLogout={onLogout}
        />
        {/* 普通面包屑导航 */}
        <Bread menus={userInfo.menus} location={props.location} />
        {/* Tab方式的导航 */}
        {/* <BreadTab
          menus={userInfo.menus}
          location={props.location}
          history={props.history}
        /> */}
        <ConfigProvider locale={zhCN}>
          <Content className="content">
            <ErrorBoundary location={props.location}>
              <CacheSwitch>
                <Redirect exact from="/" to="/home" />
                <Route
                  exact
                  path="/home"
                  render={(props) => onEnter(Home, props)}
                />
                {/*<!-- 使用CacheRoute可以缓存该页面，类似Keep-alive -->*/}
                <Route
                  exact
                  path="/system/usersetting"
                  render={(props) => onEnter(UserSetting, props)}
                />
                <Route
                  exact
                  path="/system/rolesetting"
                  render={(props) => onEnter(RoleSetting, props)}
                />
                <Route
                  exact
                  path="/system/powersetting"
                  render={(props) => onEnter(PowerSetting, props)}
                />
                <Route
                  exact
                  path="/system/menusetting"
                  render={(props) => onEnter(MenuSetting, props)}
                />
                <Route
                  exact
                  path="/system/apisetting"
                  render={(props) => onEnter(ApiSetting, props)}
                />
                <Route exact path="/system/mqtt" component={MQTT} />
                <Route exact path="/nopower" component={NoPower} />
                <Route component={NotFound} />
              </CacheSwitch>
            </ErrorBoundary>
          </Content>
        </ConfigProvider>

        <Footer />
      </Layout>
    </Layout>
  );
}

export default BasicLayoutCom;
