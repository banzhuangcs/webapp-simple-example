/**
  promise：异步流程处理库，像同步一样书写异步代码。
  原理分析：
    通过链式机制

    核心
      then catch
    其他方法
      all race promise resolve reject
  1、每一次调用then都会产生一个新的promise，以便链式调用；
    then:
      1)、创建新promise对象
      2)、使用闭包特性重新定义状态回调函数，
        (1)、重新定义的状态回调函数需要传入，以便返回的闭包中对其缓存（传入的参数是当前promise对象、新创建的promise对象，旧的状态回调函数）
      3)、绑定状态改变回调函数
  2、调用状态改变回调函数时候，使用异步调用
  3、在重新定义的状态改变回调函数中，得到旧回调函数的值，如果该值是当前then方法返回的promise对象，则抛出异常，如果是promise对象
    return createPromise(this);
    .promise() {  } { return createPromise(this) }

    核心底层（模块加载器、模板引擎、DOM库、Promise、Ajax、Router、ViewportAdapter）
    基础扩展（日期处理、工具库）
    ui组件（按钮、面板、对话框、Tab、lightbox）
    实时动画系统(平滑动画)
**/

define(() => {

  // promise状态
  const __STATE__ = {
    pending: 0,
    resolved: 1,
    rejected: 2
  };

  // 函数延迟执行
  const nextTick = (() => {
    const setImmediate = window.setImmediate;
    const setTimeout = window.setTimeout, res;

    if (setImmediate && typeof setImmediate === 'function')
      res = setImmediate;
    else if (setTimeout && typeof setTimeout === 'function')
      res = setTimeout;

    return fn => res(fn, 0);
  })();

  // 绑定状态回调函数
  function addListener (curr, state, callback) {
    // 如果curr的状态已经改变，那么再次绑定，将立即调用callback
    if (curr.state === state)
      nextTick(() => callback(curr.data));

    else if (state === __STATE__.resolved)
      curr.resolveCallbacks.push(callback);

    else if (state === __STATE__.rejected)
      curr.rejectCallbacks.push(callback);
  }

  function fire () {

  }

  function processCallback (curr, next, callback) {
    return info => {
      try {
        let value = callback(info);

        // 如果返回的是同一个promise实例
        // 抛异常
        /*
          如 var promise = Promise.createPromise().then(function () {
            return promise;
           });
        */
        if (value === next)
          throw new Error('不能返回相同的引用');

        if (typeof value === 'function')
          value = value();

        if (value instanceof Promise) {
          value.then(data => next.resolve(data), error => next.reject(error));
        } else {
          next.resolve(value);
        }
      } catch (e) {
        next.reject(e);
      }
    };
  }

  function Promise () {
    this.state = __STATE__.pending;
    this.data = [];
    this.reason = '';
    this.resolveCallbacks = [];
    this.rejectCallbacks = [];
  };

  // 定义Promise静态方法
  Object.assign(Promise, {
    createPromise(fn) {
      const promiseIns = new Promise();

      fn && fn(promiseIns);

      return promiseIns;
    },

    parsePromise() {

    },

    resolve() {

    },

    reject() {

    },

    all() {

    },

    race() {

    }
  });

  // 定义Promise实例方法
  Object.assign(Promise.prototype, {
    then(onResolve, onReject) {
      if (!onResolve && !onReject)
        throw new Error('请传入任意resolve或reject一个参数');

      const currPromiseIns = this;
      const nextPromiseIns = this.constructor.createPromise();

      // 如果是成功状态回调函数
      if (typeof onResolve === 'function') {
        onResolve = processCallback(currPromiseIns, nextPromiseIns, onResolve);
      } else {

      }

      // 绑定成功状态回调函数
      addListener(currPromiseIns, __STATE__.resolved, onResolve);

      // 如果是失败状态回调函数
      if (typeof onReject === 'function') {
        onReject = processCallback(currPromiseIns, nextPromiseIns, onReject);
      } else {

      }

      // 绑定失败状态回调函数
      addListener(currPromiseIns, __STATE__.rejected, onReject);

      return nextPromiseIns;
    },

    catch(onReject) {
      return this.then(null, onReject);
    }
  });

  return Promise;
});
