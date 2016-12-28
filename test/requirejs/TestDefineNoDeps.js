define(function () {
  function TestDefine () {
    this.name = 'hello';
  }

  TestDefine.prototype.say = function () {
    console.log('say' + this.name);
  };

  return TestDefine;
});
