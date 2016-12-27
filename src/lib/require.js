/**
  amd模块化
    提供了独立作用域，具体描述模块间的依赖关系，在开发环境直接能用，无需编译工具，方便模块的打包、压缩
  实现步骤
    1、定义baseUrl，初始为引用require.js目录
    2、实现define，向描述模块依赖对象注入一个模块

   理解amd模块化库从两点入手
    1)、如何加载模块
    2)、如何保持模块的依赖

    如何加载模块？
      通过动态创建script标签，写入src、绑定onload和onerror，然后追加到head元素里
    如何保持模块的依赖？
      1、创建变量存储每个模块信息，包括模块对应的文件路径、加载状态、依赖项、内部逻辑、返回值
      2、当通过入口文件require了一个模块，首先记录入口模块的依赖项，并且将当前模块注入到loadingModules(加载完成，但是不确定依赖是否加载完成)
      3、加载每个依赖模块，加载完成后，将每个依赖模块注入到loadingModules中，继续循环加载依赖模块，检查依赖项是否全部加载完，如果某一个依赖模块加载完，
      改变他的状态，将依赖项传入给内部逻辑返回给模块的exports值

    开发要求
      1、定义模块都是匿名的，包括匿名依赖模块、匿名无依赖模块
      2、模块标识都是相对路径的，不允许出现/、http(s)
**/

;((root) => {
  // 定义模块集合描述对象
  const modules = {};
  // 模块加载完成，但可能存在依赖模块没有加载
  const loadingModules = {};
  // 定义模块引用的根路径
  let baseUrl = '';
  // 默认后缀是.js
  const suffix = '.js';
  // 匹配module id正则表达式
  const matchIdExp = /([^/]+)\.js$/;
  const matchPathPosExp = /\.+\//g;
  const protocolExp = /(http:\/{2}|file:\/{3})/;

  let define, require, config, initialize;
  let resolveFilePath, getCurrentFilePath, getFilePathById, getIdByFilePath;
  let loadResource, loadDepModules, checkDepIsLoaded, fireFactory;

  // head dom
  const __HEADNODE__ = document.getElementsByTagName('head')[0];

  /**
   定义模块
   只允许定义匿名模块
  **/
  define = (id, deps, factory) => {
    if (typeof id === 'function' && !deps && !factory) {
      // 匿名无依赖模块
      factory = id;
      deps = [];
      id = false;
    } else if (Array.isArray(id) && typeof deps === 'function') {
      // 匿名依赖模块
      factory = deps;
      deps = id;
      id = false;
    }

    id = id ? getFilePathById(id) : getFilePathById(getIdByFilePath(getCurrentFilePath()));
    deps = deps.map(dep => getFilePathById(dep));

    if (!modules[id]) {
      // 每次定义模块，记录模块的加载状态、依赖项、内部逻辑、返回值
      modules[id] = {
        id,
        state: 0,
        deps,
        factory,
        exports: null
      };
    }
  };

  require = (deps, factory) => {
    if (!Array.isArray(deps) || !deps.length)
      throw new Error('缺少加载模块');

    if (typeof factory !== 'function')
      throw new Error('缺少加载完成依赖模块回调');

    // 获取使用require加载模块的script文件路径
    const id = getFilePathById(getIdByFilePath(getCurrentFilePath()));
    let module = modules[id];

    if (!module) {
      deps = deps.map(dep => getFilePathById(dep));
      module = modules[id] = {
        id,
        state: 0,
        deps,
        factory,
        exports: null
      };

      loadingModules.push(module);
    }

    loadDepModules(module.id);
  };

  config = () => {};

  /**
   获取引用require.js的文件路径
  **/
  getCurrentFilePath = () =>
    document.currentScript.src;

  /**
   根据module id获取文件路径
  **/
  getFilePathById = (id) =>
    `${resolveFilePath(id)}${suffix}`;

  /**
   正则匹配文件路径获取Module id
  **/
  getIdByFilePath = (filePath) =>
    matchIdExp.test(filePath) && RegExp.$1;

  /**
   加载依赖模块
  **/
  loadDepModules = (filePath) => {
    let module = null;

    if (module = modules[filePath]) {
      const depModules = module.deps;
      node = depModules.forEach(module => {
        loadResource(module.id, () => {
          // 删除加载的script dom
          __HEADNODE__.removeChild(node);
          // 添加到未加载完集合中
          loadingModules.push(module);
          // 继续加载依赖
          loadDepModules(module.id);
          // 检查依赖是否全部加载完成
          checkDepIsLoaded();
        });
      });
    }
  };

  /**
   加载模块文件
  **/
  loadResource = (filePath, callback) => {
    const script = document.createElement('script');
    script.src = filePath;
    script.async = true;
    script.onload = () => callback && callback()
    script.onerror = () => { throw new Error('加载模块失败') };
    __HEADNODE__.appendChild(script);
    
    return script;
  };

  /**
   检查依赖模块是否加载完成
  **/
  checkDepIsLoaded = () => {
    for (let i = loadingModules.length - 1; i >= 0; i--) {
      const module = loadingModules[i];
      const depModules = module.deps;
      const isAllLoaded = !depModules.length
        || depModules.every(depModule => !!depModule && depModule.state === 2);

      if (!isAllLoaded)
        break;

      fireFactory(module);
    }
  };

  /**
    当模块及依赖模块全部加载完成调用模块的factory内部逻辑
  **/
  fireFactory = (module) => {
    const params = module.deps.map(dep => dep.exports);
    module.state = 2;
    module.exports = module.factory.apply(this, params) || null;
  };

  /**
   解析模块文件路径
  **/
  resolveFilePath = (filePath) => {
    const protocol = protocolExp.test(baseUrl) && RegExp.$1;
    const baseUrlPaths = baseUrl.slice(protocol.length).split(/\//);
    const filePaths = filePath.split(/\//);
    const posList = filePath.match(matchPathPosExp);
    let finalFilePath;

    if (baseUrlPaths[baseUrlPaths.length - 1] === '')
      baseUrlPaths.pop();

    if (posList) {
      posList.forEach(pos =>
        pos.indexOf('..') >= 0 && baseUrlPaths.pop()
      );

      finalFilePath = `${protocol}${[...baseUrlPaths,  ...filePaths.slice(posList.length)].join('/')}`;
    } else {
      finalFilePath = `${protocol}${[...baseUrlPaths, filePath]}`;
    }

    return finalFilePath;
  };

  initialize = () => {
    baseUrl = getCurrentFilePath().replace(matchIdExp, '');
    let mainPath = document.currentScript.getAttribute('data-main');

    if (mainPath)
      loadResource(resolveFilePath(mainPath));
  };

  initialize();
  require.config = config;
  define.amd = true;
  root.require = require;
  root.define = define;
})(window);
