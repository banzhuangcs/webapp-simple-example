/**
  js模板引擎
  提供字符串占位符、绑定数据后替换占位符
  步骤：
    1、先匹配<%%>开始的位置
    2、存储<%%>之前的字符串，将"进行转义
    3、如果<%%>里面的字符存在if else elseif ? { }这种结构语句，那么直接拼接起来
    4、如果<%%>里面是求值(表达式或变量)，那么就
    xx.push('<h1>12321</h1>');
    for() {
    xx.push(this[i])
**/
define(() => {
  const breakline = '\r\n';
  const templateContentExp = /<%([\s\S]*?)%>/g;
  const operatorExp = /for|if|else|elseif|switch|[?}]/;
  const sepecialExp = /(['"])/g;

  function resolveCode(templatePart, isTemplateContent) {
    if (!isTemplateContent) {
      // 如果不是模板内容，例html标签
      // 将'或"转义
      return `res.push('${templatePart.replace(sepecialExp, '\\$1')}');${breakline}`;
    } else {
      // 如果模板内容是语法逻辑
      if (operatorExp.test(templatePart)) {
        return `${templatePart}${breakline}`;
      } else {
        return `res.push(${templatePart})${breakline}`;
      }
    }
  }

  return (template, data) => {
    let execCode = `var res=[];${breakline}`;
    let match = null;
    let index = 0;

    while (match = templateContentExp.exec(template)) {
      execCode += resolveCode(template.slice(index, match.index));
      execCode += resolveCode(match[1], true);
      index = templateContentExp.lastIndex;
    }

    execCode += resolveCode(template.substr(index, template.length - index));
    execCode += `return res.join('');`

    return new Function(execCode).call(data);
  };
});
