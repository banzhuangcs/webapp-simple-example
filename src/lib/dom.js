/**
 * DOM操作
 * 常用DOM操作包括：
 1)、选择器
 2)、当前节点：attr、prop、addClass、removeClass、toggleClass、css、html、text、val、width、height、position、index
 3)、关联兄弟节点：prev、next、siblings
 4)、关联父节点：parent
 5)、关联子节点：children、firstChild、lastChild
 6)、多个节点：filter
 7)、单个节点：first、last
 8)、插入子节点 append appendTo prepend prependTo
 9)、
*/

define(() => {
  const singleHTMLTagExp = /^<([\w]+)\s*?\/?>(?:<\/\1>|)$/;
  const tagExpandExp = /<(?!br|input|img|hr)((\w+)[^>]*?)\/>/ig;
  const tagNameExp = /<(\w+)[^>]*?>/;
  const selectStatExp = /checked|selected/;
  const numberExp = /^\d*?$/;
  const capitalExp = /[A-Z](?=[a-z])/;
  const parentTagName = { 'li': 'ul' };
  const numberStyleMap = ['line-height', 'font-weight', 'opacity', 'z-index', 'zoom'];

  function $ (selector, context) {
    return new Dom(selector, context);
  }

  Object.assign($, {
    ready(fn) {
      if (typeof fn !== 'function')
        throw new TypeError('请传入一个函数');

      // 如果当前文档处于DOMContentLoaded或load状态，则直接执行
      if (document.readyState !== 'interactive'
        && document.readyState !== 'complete')
          fn($);
      else {
        const handler = () => {
          document.removeEventListener('DOMContentLoaded', handler, false);
          fn($);
        };

        document.addEventListener('DOMContentLoaded', handler, false);
      }
    },

    // 解析html得到dom
    getElementsByFragment(html) {
      if (singleHTMLTagExp.test(html))
        // 如果是没有子级的标签
        // <div></div> <div ></div> <br/> <br />
        return Array.from(document.createElement(RegExp.$1));

      html = html.replace(tagExpandExp, '<$1></$2>');
      let tagName = tagNameExp.exec(html) && RegExp.$1.toLowerCase();
      let parentElement = document.createElement(parentTagName[tagName] || 'div');
      parentElement.innerHTML = html;

      return parentElement;
    },

    // 根据selector得到dom
    getElementsBySelector(selector, context) {
      let first = selector.charAt(0);
      let elements;

      if (first === '#') {
        // id选择器
        elements = [ context.getElementById(selector.slice(1)) ];
      } else if(first === '.') {
        // class选择器
        elements = Array.from(context.getElementsByClassName(selector.slice(1)));
      } else {
        // tag选择器
        elements = Array.from(context.getElementsByTagName(selector));
      }

      return elements;
    },

    each(array, callback) {
      const isArray = Array.isArray(array);

      (isArray ? array : Object.keys(array))
        .forEach((value, index) => {
           if (callback.call(
                array,
                !isArray ? array[value] : value,
                !isArray ? value : index, array) === false)
             return;
        });
    }
  });

  function Dom (selector, context) {
    let elements;
    context || (context = document);

    if (typeof selector === 'string') {
      // 如果是html标签，那么代表的就是准备根据标签创建dom
      if (selector.charAt(0) === '<') {
        elements = $.getElementByFragment(html);
      } else {
        // 如果是单个选择器
        if (!selector.match(/,|\s/)) {
          elements = $.getElementBySelector(selector, context);
        }

        elements = context.querySelectorAll(selector);
      }
    } else if (selector && selector.nodeType === 1) {
      elements = [selector];
      selector = void 0;
    } else if (typeof selector === 'function') {
      $.ready(selector);
      elements = [];
      selector = void 0;
    } else if (Array.isArray(selector)) {
      elements = selector;
      selector = void 0;
    } else if (selector instanceof Dom) {
      elements = selector;
      selector = selector.selector;
    }

    Array
      .from(elements)
      .forEach((el, index) => this[index] = el);
    this.length = elements ? elements.length : 0;
    this.selector = selector || '';
  }

  Dom.prototype._filterIndex = function (fn) {
    return function (index) {
      return fn.call(this, index >= this.length
        ? this.length - 1
        : index < 0
          ? this.length - index
          : index
      );
    }
  };

  Dom.prototype._size = function (attr, fn) {
    return function (value) {
      let element = this.get(0);

      if (value == null) {
        return element.getBoundingClientRect()[attr];
      } else {
        numberExp.test(value) && (value = `${value}px`);
        fn.call(element, value);
      }
    };
  };

  Dom.prototype._content = function (attr, fn) {
    return function (value) {
      let element;

      if (value == null)
        return (element = this.get(0))
          ? fn.call(this, element)
          : '';

      return this.each(element => element[attr] = value);
    };
  };

  Dom.prototype._adjacent = function (attr) {
    return function (selector) {
      const siblings = this.get(0) && Array.from(this).map(element => attr ? element[attr] : );

      if (siblings == null)
        return this;

      return this.constructor(
        siblings.filter(element => !selector || element.matches(selector))
      );
    };
  };

  Object.assign(Dom.prototype, {
    each(callback) {
      this.constructor.each(Array.from(this), callback);
      return this;
    },

    get: Dom.prototype._filterIndex(function (index) {
      return this[index] || null;
    }),

    eq: Dom.prototype._filterIndex(function (index) {
      return this.constructor(this.get(index));
    }),

    index() {
      const element = this.get(0);

      if (element == null)
        return this;

      if (element.offsetParent == null)
        return 0;

      return Array.from(element.parentNode.children).findIndex(ele => ele === element);
    },

    attr(key, value) {
      let res, attrs;

      if (value == null) {
        if (typeof key === 'string') {
          return (res = this.get(0))
            ? res.getAttribute(key) || null
            : null;
        } else {
          attrs = key;
        }
      } else {
        attrs = ({})[key] = value;
      }

      return this.each(element => {
        this.constructor().each(attrs, (value, key) =>
          element.setAttribute(key, value);
        );
      });
    },

    prop(key) {
      if (typeof key !== 'string')
        throw new TypeError('请传入一个字符串类型作为key');

      const value = this.attr(key);

      if (selectStatExp.test(key)) {
        if (value != null)
          return true;

        return Array
          .from(this.get(0).attributes)
          .some((attrElement) => selectStatExp.test(attrElement.nodeValue));
      }

      return value;
    },

    css(key, value) {
      let res, styles;

      if (value == null) {
        if (typeof key === 'string') {
          return (res = this.get(0))
            ? res.style[key] || window.getComputedStyle(res, null).getPropertyValue(key)
            : null;
        } else {
          styles = key;
        }
      } else {
        styles = ({})[key] = value;
      }

      return this.each(element => {
        key = key.replace(capitalExp, match => `-${match}`);
        numberExp.test(value)
          && numberStyleMap.findIndex(name => name === key) < 0 && (value = `${value}px`);

        element.style.cssText += JSON.stringify(styles).replace(/[{}'"]/g, '').replace(',', ';');
      });
    },

    addClass(className) {
      const element = this.get(0);
      let prevClassName, classList;

      if (typeof className === 'function')
        className = className(element.className);
      else if (Array.isArray(className))
        className = className.join(' ');

      if (element != null)
        classList = Array.from(new Set(className.split(' ').concat((element.className || '').split(' '))));

      return this.each(element => element.className = classList.join(' '));
    },

    removeClass(className) {
      Array.isArray(className) || (className = className.split(' '));
      let classList, prevClassName;

      return this.each(element => {
        if (element != null && (prevClassName = element.className))
        classList = prevClassName
          .split(' ')
          .filter(clsName => className.indexOf(clsName) < 0);
        element.className = classList.join(' ');
      });
    },

    toggleClass(className) {
      let classList;

      return this.each(element => {
        if (element != null) {
          (classList = element.classList).contains(className)
            ? classList.remove(className)
            : classList.add(className);
        }
      });
    },

    hasClass(className) {
      return Array
        .from(this)
        .some(element => element.classList.contains(className));
    },

    offset() {
      const element = this.get(0);
      const clientRect = element.getBoundingClientRect();

      return {
        left: clientRect.left + window.pageXOffset,
        top: clientRect.top + window.pageYOffset
      };
    },

    position() {
      let element = this.get(0);
      let currOffset = this.offset();
      let parent = element.parentNode;
      let parentOffset;

      while (parent.offsetParent != null) {
        if (window.getComputedStyle(parent, null).getPropertyValue('position') === 'static')
          parent = parent.parentNode;
        else
          break;
      }

      parentOffset = (parent = parent.getBoundingClientRect())
        && { left: parent.left, top: parent.top };

      return {
        left: currOffset.left - parentOffset.left,
        top: currOffset.top - parentOffset.top
      };
    },

    width: Dom.prototype._size('width', function (width) {
      this.style.width = width;
    }),

    height: Dom.prototype._size('height', function (height) {
      this.style.height = height;
    }),

    empty() {
      return this.each(element => element.innerHTML = '');
    },

    remove() {
      return this.each(element => element.parentNode.removeChild(element));
    },

    html: Dom.prototype._content('innerHTML', function (element) {
      return element.innerHTML;
    }),

    text: Dom.prototype._content('textContent', function (element) {
      return element.textContent;
    }),

    val: Dom.prototype._content('value', function (element) {
      return element.multiple
        ? Array.from(this.constructor(this).find('option').filter(ele => ele.selected)).map(ele => ele.value)
        : element.value;
    }),

    /**
      得到兄弟元素或元素集合
    **/
    prev: Dom.prototype._adjacent('previousElementSibling'),

    next: Dom.prototype._adjacent('nextElementSibling'),

    siblings(selector) {
      const element = this.get(0);

      if (element == null)
        return this;

      return this.constructor(
        Array
          .from(element.parentNode.children)
          .filter(
            ele => element !== ele
              && (selector ? ele.matches(selector) : true)
          );
      );
    }
  });

  return Selector;
});
