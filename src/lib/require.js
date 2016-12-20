/**
  amd模块化
    提供了独立作用域，具体描述模块间的依赖关系，在开发环境直接能用，无需编译工具，方便模块的打包、压缩
  实现步骤
    1、定义baseUrl，初始为引用require.js目录
    2、实现define，向描述模块依赖对象注入一个模块
**/

;((root) => {
  // 定义模块集合描述对象
  const modules = {};
  // 定义模块引用的根路径
  let baseUrl = '';
  // 默认后缀是.js
  const suffix = '.js';
  // 匹配module id正则表达式
  const matchIdExp = /([^/]+)\.js$/;

  let define, require, config, initialize;
  let getCurrentScriptPath, getFilePathById, getIdByFilePath;

  /**
   定义模块
   只允许定义匿名模块
  **/
  define = (id, deps, factory) => {
    if (typeof id === 'function' && !deps && !factory) {
      // 匿名无依赖模块
      factory = id;
    } else if (Array.isArray(id) && typeof deps === 'function') {
      // 匿名依赖模块
      factory = deps;
      deps = id;
    }

    id = getIdByFilePath(getCurrentScriptPath()) || '';

  };

  require = () => {};

  config = () => {};

  /**
   获取引用require.js的文件路径
  **/
  getCurrentScriptPath = () =>
    document.currentScript.src;

  /**
   根据module id获取文件路径
  **/
  getFilePathById = (id) =>
    `${baseUrl}${id}${suffix}`;

  /**
   正则匹配文件路径获取Module id
  **/
  getIdByFilePath = (filePath) =>
    matchIdExp.test(filePath) && RegExp.$1;

  require.config = config;
  root.require = require;
  root.define = define;
})(window);
