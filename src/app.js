// 配置模块加载器esl
// 全局require可以使用/ http来抛开 baseUrl + paths + moduleId
require(['a'], function (a) {
  console.log(a);
});

// paths shim相对路径都是基于baseUrl
// requirejs如何异步加载模块
// requirejs如何确定模块之间的依赖关系
// 组织依赖关系
// define 解析deps的路径注入到模块集合里
// define deps的
// 组织依赖关系
//
/*
  异步加载模块
    动态创建script，插入head，监听onload和onerror
  管理模块之间的依赖关系
    1、组织依赖关系
      定义各个模块的信息对象
        state: 模块的加载状态
        deps: 模块的依赖关系
        factory: 模块的内部逻辑
        exports: {} 模块的返回值
      确定正在加载但是没有加载完成的模块

    2、define
      像模块信息对象注入模块
      deps
*/
