/*
  单元测试：最小可测单元进行检查和验证
  最小可测单元：函数、类、组件

  1、验证代码正确性
  2、确保增加新功能不会影响其他功能
  3、提高代码可维护性

  如果长久的项目，必须要写单元测试，否则后期可能会造成项目维护困难大，甚至根本无法维护（）

  TDD: 测试驱动开发，先编写测试 case，然后针对测试 case编写业务代码

  单元测试启动原理：
    先用断言库来比较可测单元的actual和expect是否相同，如果不等则抛出异常然后BDD测试框架捕获异常
  解释api
  增加新功能，无需担心会影响其他代码
  BDD框架(mocha)：描述单元测试的过程
  断言库(chai)：检查代码执行结果是否符合预期
  开发环境、框架、单元测试

  单元测试的核心思想给函数特定的参数，测试其行为
  函数、类、组件
  行为测试
  集成测试
  覆盖率
  断言、测试覆盖率
  当测试不通过时，报出assertException,中断测试用例的执行

  内存分配：系统在栈或堆内存中声明空间，存储变量值；
  内存使用：函数中使用变量、等到执行完毕；
  内存回收：函数执行完成，局部变量全部；

*/
mocha.setup('bdd');

describe('require.js单元测试', function () {
  var assert;

  before(function () {
    assert = chai.assert;
  });

  describe('#define', function () {
    it('定义匿名无依赖模块', function (done) {
      require(['../../test/requirejs/TestDefineNoDeps'], function (TestDefineNoDeps) {
        assert.typeOf(TestDefineNoDeps, 'function');
        done();
      });
    });

    it('定义匿名依赖模块', function (done) {
      require(['../../test/requirejs/TestDefineDeps'], function (testDefineDeps) {
        //assert.typeOf(testDefineDeps, 'objec');
        // chai.assert.equal strictEqual deepEqual
        assert.lengthOf(Object.keys(testDefineDeps), 1);
        done();
      });
    });
  });
});

mocha.run();
