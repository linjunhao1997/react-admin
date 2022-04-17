/** 对axios做一些配置 **/

import { baseUrl } from "../config";
import axios from "axios";
import { message } from "antd";
import tools from "@/util/tools";

// 不需要下面这些mock配置，仅本地发布DEMO用
// import Mock from "mockjs";
// const mock = require("../../mock/app-data");
// Mock.mock(/\/api.*/, (options: any) => {
//   const res = mock.mockApi(options);
//   return res;
// });

/**
 * 根据不同环境设置不同的请求地址
 * 把返回值赋给axios.defaults.baseURL即可
 */
// function setBaseUrl(){
//   switch(process.env.NODE_ENV){
//     case 'development': return 'http://development.com';
//     case 'test': return 'http://test.com';
//     case 'production' : return 'https://production.com';
//     default : return baseUrl;
//   }
// }

// 默认基础请求地址
axios.defaults.baseURL = baseUrl;
// 请求是否带上cookie
axios.defaults.withCredentials = false;

axios.interceptors.request.use((config) => {
  if (!config.url?.endsWith("/auth/v1/login")) {
    config.headers.Authorization = "Bearer " + sessionStorage.getItem("token");
  }
  return config;
});

// 对返回的结果做处理
axios.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error?.response?.status ?? 500;
    switch (status) {
      case 400:
        message.error({
          content:
            error?.response?.data?.message ??
            error?.response?.data?.error ??
            "参数错误",
          className: "custom-class",
          style: {
            marginTop: "20vh",
          },
        });
        break;
      case 401:
        message.error({
          content:
            error?.response?.data?.message ??
            error?.response?.data?.error ??
            "授权失败",
          className: "custom-class",
          style: {
            marginTop: "20vh",
          },
        });
        break;
      case 403:
        message.error({
          content:
            error?.response?.data?.message ??
            error?.response?.data?.error ??
            "拒绝访问",
          className: "custom-class",
          style: {
            marginTop: "20vh",
          },
        });
        break;
      case 404:
        message.error({
          content:
            error?.response?.data?.message ??
            error?.response?.data?.error ??
            "请求目标不存在",
          className: "custom-class",
          style: {
            marginTop: "20vh",
          },
        });
        break;
      default:
        message.error({
          content:
            error?.response?.data?.message ??
            error?.response?.data?.error ??
            "连接异常",
          className: "custom-class",
          style: {
            marginTop: "20vh",
          },
        });
    }
    return Promise.reject(error);
  }
);

export default axios;
