define(['../../test/requirejs/TestDefineNoDeps'], function (TestDefineNoDeps) {
  var testDefineNoDeps = new TestDefineNoDeps('呵呵呵');
  testDefineNoDeps.say();

  return {
    name: TestDefineNoDeps.name
  };
});
