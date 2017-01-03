'use strict';

require.config({
  baseUrl: '../',
  alias: {
    a: '../a',
    b: '../b',
    c: '../c'
  }
});

require(['a', 'b', 'c'], function (a, b, c) {
  console.log(a + ':' + b + ':' + c);
});