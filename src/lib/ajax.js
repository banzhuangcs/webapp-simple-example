/**
  跨域是指浏览器访问不同站点的资源，浏览器单方面阻止的同源安全策略
  location.protocol + location.host不同即为跨域
  解决方案：
  1、JSONP（GET）
    动态创建script节点，利用script节点可以跨域的原因，带上一个参数为函数名，后端返回一个带有方法调用的字符串，前端eval解析
    因为浏览器会阻止JSON数据的返回
  2、CORS支持GET、POST、HEAD类型的请求，如果POST要求类型是
    application/x-www-form-urlencoded
    multipart/form-data 或 text/plain
    浏览器会自动在头中加入origin:
    在服务端返回的响应头中有个access-control-allow-origin: origin
    浏览器判断是否相等，
**/
define(() => {
    
});
