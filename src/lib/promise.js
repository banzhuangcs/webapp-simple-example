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

    1、异步流程控制库，类似书写同步代码一样书写异步代码
    2、promise只允许运行期间只存在一个状态，传递方向是单向且不可逆的
    3、提供核心then方法，
      1)、该方法会产生一个新的promise对象，方便链式调用
      2)、利用闭包特性传入当前promise和新创建的promise以及状态函数
        异常检测旧状态函数
        得到旧状态函数的值，如果是新promise对象则抛出异常
        如果捕获到异常，那么直接调用新创建的promise的错误状态函数
        将结果传入到新promise对象的成功状态函数

      3)、并且为当前调用then方法的promise对象绑定状态回调函数
    4、promise为异步调用状态函数，等promise链完全生成
    5、状态函数发生异常时，只能传给下一个promise的reject函数，不能传给自身的reject

**/

define(() => {

  // promise状态
  const __STATE__ = {
    PENDING: 0,
    RESOLVE: 1,
    REJECT: 2
  };

  // 函数异步执行
  const nextTick = (() => {
    const setImmediate = window.setImmediate;
    const setTimeout = window.setTimeout;
    let res;

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

    else if (state === __STATE__.REJECT)
      curr.resolveCallbacks.push(callback);

    else if (state === __STATE__.REJECT)
      curr.rejectCallbacks.push(callback);
  }

  function fire (curr) {
    let callbacks, info;

    if (curr.state === __STATE__.RESOLVE) {
      callbacks = curr.resolveCallbacks;
      info = curr.data;
    } else {
      callbacks = curr.rejectCallbacks;
      info = curr.reason;
    }

    if (!callbacks.length)
      return;

    nextTick(() => {
      callbacks.forEach(callback => callback(info));
    });
  }

  function processCallback (next, callback) {
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
    this.state = __STATE__.PENDING;
    this.data = [];
    this.reason = '';
    this.resolveCallbacks = [];
    this.rejectCallbacks = [];
  };

  // 定义Promise静态方法
  Object.assign(Promise, {
    createPromise(fn) {
      const promiseIns = new this();
      fn && fn(promiseIns);

      return promiseIns;
    },

    resolved(data) {
      return this.createPromise(
        promiseIns => promiseIns.resolve(data)
      );
    },

    rejected(reason) {
      return this.createPromise(
        promiseIns => promiseIns.reject(reason)
      );
    },

    /**
     * @param {Array|<Promise>} promiseIns promise数组
    */
    all(promiseInsArr) {
      !Array.isArray(promiseInsArr) && (promiseInsArr = [promiseInsArr]);
      const currPromise = this.createPromise();
      const res = [];
      let promiseCount = 0;

      function createResolveHandler (index) {
        return data => {
          res[index] = data;
          promiseCount++;

          if (index >= promiseInsArr.length)
            currPromise.resolve.apply(currPromise, res);
        };
      }

      promiseInsArr.forEach((ins, index) =>
        ins.then(
          createResolveHandler(index),
          reason => currPromise.reject(reason)
        )
      );

      return currPromise;
    },

    race(promiseInsArr) {
      !Array.isArray(promiseInsArr) && (promiseInsArr = [promiseInsArr]);
      const currPromise = this.createPromise();
      let promiseCount = 0;

      function createResolveHandler (index) {
        return data => {
          promiseCount++;

          if (promiseCount >= 1)
            currPromise.resolve(data);
        }
      }

      promiseInsArr.forEach((ins, index) =>
        ins.then(
          createResolveHandler(index),
          reason => currPromise.reject(reason)
        )
      );

      return currPromise;
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
        onResolve = processCallback(nextPromiseIns, onResolve);
      } else {
        onResolve = data => nextPromiseIns.resolve(data);
      }

      // 绑定成功状态回调函数
      addListener(currPromiseIns, __STATE__.RESOLVE, onResolve);

      // 如果是失败状态回调函数
      if (typeof onReject === 'function') {
        onReject = processCallback(currPromiseIns, nextPromiseIns, onReject);
      } else {
        onReject = reason => nextPromiseIns.reject(data);
      }

      // 绑定失败状态回调函数
      addListener(currPromiseIns, __STATE__.REJECT, onReject);

      return nextPromiseIns;
    },

    catch(onReject) {
      return this.then(null, onReject);
    },

    resolve(data) {
      if (this.state !== __STATE__.PENDING)
        return;

      this.state = __STATE__.RESOLVE;
      this.data = data;

      fire(this);
    },

    reject(reason) {
      if (this.state !== __STATE__.PENDING)
        return;

      this.state = __STATE__.REJECT;
      this.reason = reason;

      fire(this);
    }
  });

  return Promise;
});
