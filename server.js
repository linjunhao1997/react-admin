/** 用于开发环境的服务启动 **/
/*var mqtt = require("mqtt");

var clientId = "mqttjs_" + Math.random().toString(16).substr(2, 8);

// This sample should be run in tandem with the aedes_server.js file.
// Simply run it:
// $ node aedes_server.js
//
// Then run this file in a separate console:
// $ node websocket_sample.js
//
var host = "ws://192.168.100.100:8083/mqtt";

var options = {
  keepalive: 30,
  clientId: clientId,
  protocolId: "Hook",
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  will: {
    topic: "WillMsg",
    payload: "Connection Closed abnormally..!",
    qos: 0,
    retain: false,
  },
  rejectUnauthorized: false,
};

console.log("connecting mqtt client");
var client = mqtt.connect(host, options);

client.on("error", function (err) {
  console.log(err);
  client.end();
});

client.on("connect", function () {
  console.log("client connected:" + clientId);
  client.subscribe("topic", { qos: 0 });
  client.publish("topic", "wss secure connection demo...!", {
    qos: 0,
    retain: false,
  });
});

client.on("message", function (topic, message, packet) {
  console.log(
    "Received Message:= " + message.toString() + "\nOn topic:= " + topic
  );
});

client.on("close", function () {
  console.log(clientId + " disconnected");
});*/

const path = require("path"); // 获取绝对路径有用
const express = require("express"); // express服务器端框架
const env = process.env.NODE_ENV; // 模式（dev开发环境，production生产环境）
const webpack = require("webpack"); // webpack核心
const webpackDevMiddleware = require("webpack-dev-middleware"); // webpack服务器
const webpackHotMiddleware = require("webpack-hot-middleware"); // HMR热更新中间件
const { createProxyMiddleware } = require("http-proxy-middleware");
const webpackConfig = require("./webpack.dev.config.js"); // webpack开发环境的配置文件

const mock = require("./mock/app-data"); // mock模拟数据，模拟后台业务

const app = express(); // 实例化express服务
const DIST_DIR = webpackConfig.output.path; // webpack配置中设置的文件输出路径，所有文件存放在内存中
let PORT = 8888; // 服务启动端口号

const proxyOptions = {
  "/api/v1": {
    target: "http://localhost:8080",
    changeOrigin: true,
    ws: true,
    logLevel: "debug",
  },
  "/auth/v1": {
    target: "http://localhost:8080",
    changeOrigin: true,
    ws: true,
    logLevel: "debug",
  },
};
Object.keys(proxyOptions).forEach(function (context) {
  const proxy = createProxyMiddleware(context, proxyOptions[context]);
  app.use(proxy);
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

/** 监听POST请求，返回MOCK模拟数据 **/
/*app.post(/\/api.*!/, (req, res, next) => {
  const result = mock.mockApi({ url: req.originalUrl, body: req.body });
  res.send(result);
});
app.get(/\/api.*!/, (req, res, next) => {
  const result = mock.mockApi({ url: req.originalUrl, body: req.body });
  res.send(result);
});*/

if (env === "production") {
  // 如果是生产环境，则运行build文件夹中的代码
  PORT = 8889;
  app.use(express.static("build"));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
} else {
  const compiler = webpack(webpackConfig); // 实例化webpack
  app.use(express.static("dll"));
  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath, // 对应webpack配置中的publicPath
    })
  );

  app.use(webpackHotMiddleware(compiler)); // 挂载HMR热更新中间件
  // 所有请求都返回index.html
  app.get("*", (req, res, next) => {
    const filename = path.join(DIST_DIR, "index.html");

    // 由于index.html是由html-webpack-plugin生成到内存中的，所以使用下面的方式获取
    compiler.outputFileSystem.readFile(filename, (err, result) => {
      if (err) {
        return next(err);
      }
      res.set("content-type", "text/html");
      res.send(result);
      res.end();
    });
  });
}

/** 启动服务 **/
app.listen(PORT, () => {
  console.log("本地服务启动地址: http://localhost:%s", PORT);
});
