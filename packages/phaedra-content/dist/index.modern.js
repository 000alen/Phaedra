import 'quill/dist/quill.bubble.css';
import React from 'react';
import Quill from 'quill';
import defer from 'lodash/defer';
import map from 'lodash/map';
import { v4 } from 'uuid';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];

  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }

  return (hint === "string" ? String : Number)(input);
}

function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");

  return typeof key === "symbol" ? key : String(key);
}

var Delta = Quill["import"]("delta");
var Autoformat = /*#__PURE__*/function () {
  function Autoformat(quill, options) {
    this.quill = quill;
    this.options = options;
    this.transforms = options;
    this.registerTypeListener();
    this.registerPasteListener();
  }

  var _proto = Autoformat.prototype;

  _proto.registerPasteListener = function registerPasteListener() {
    var _this = this;

    var _loop = function _loop(name) {
      var transform = _this.transforms[name];

      _this.quill.clipboard.addMatcher(Node.TEXT_NODE, function (node, delta) {
        if (typeof node.data !== "string") {
          return;
        }

        delta.ops.forEach(function (op, index, deltaOps) {
          if (typeof op.insert === "string") {
            var changeDelta = makeTransformedDelta(transform, op.insert);
            var composedDelta = new Delta([op]).compose(changeDelta);
            deltaOps.splice.apply(deltaOps, [index, 1].concat(composedDelta.ops));
          }
        });
        return delta;
      });
    };

    for (var name in this.transforms) {
      _loop(name);
    }
  };

  _proto.registerTypeListener = function registerTypeListener() {
    var _this2 = this;

    this.quill.keyboard.addBinding({
      key: 38,
      collapsed: true,
      format: ["autoformat-helper"]
    }, this.forwardKeyboardUp.bind(this));
    this.quill.keyboard.addBinding({
      key: 40,
      collapsed: true,
      format: ["autoformat-helper"]
    }, this.forwardKeyboardDown.bind(this));
    this.quill.on(Quill.events.TEXT_CHANGE, function (delta, oldDelta, source) {
      var ops = delta.ops;

      if (source !== "user" || !ops || ops.length < 1) {
        return;
      }

      var lastOpIndex = ops.length - 1;
      var lastOp = ops[lastOpIndex];

      while (!lastOp.insert && lastOpIndex > 0) {
        lastOpIndex--;
        lastOp = ops[lastOpIndex];
      }

      if (!lastOp.insert || typeof lastOp.insert !== "string") {
        return;
      }

      var isEnter = lastOp.insert === "\n";

      var sel = _this2.quill.getSelection();

      if (!sel) {
        return;
      }

      var endSelIndex = _this2.quill.getLength() - sel.index - (isEnter ? 1 : 0);
      var checkIndex = sel.index;

      var _this2$quill$getLeaf = _this2.quill.getLeaf(checkIndex),
          leaf = _this2$quill$getLeaf[0];

      if (!leaf || !leaf.text) {
        return;
      }

      var leafIndex = leaf.offset(leaf.scroll);
      var leafSelIndex = checkIndex - leafIndex;
      var transformed = false;

      for (var name in _this2.transforms) {
        var transform = _this2.transforms[name];

        if (transform.helper && transform.helper.trigger) {
          if (lastOp.insert.match(transform.helper.trigger)) {
            _this2.quill.formatText(checkIndex, 1, "autoformat-helper", name, Quill.sources.API);

            _this2.openHelper(transform, checkIndex);

            continue;
          }
        }

        if (lastOp.insert.match(transform.trigger || /./)) {
          _this2.closeHelper(transform);

          var _ops = new Delta().retain(leafIndex);

          var transformOps = makeTransformedDelta(transform, leaf.text, leafSelIndex);

          if (transformOps) {
            _ops = _ops.concat(transformOps);
          }

          _this2.quill.updateContents(_ops, "api");

          transformed = true;
        }
      }

      if (transformed) {
        setTimeout(function () {
          _this2.quill.setSelection(_this2.quill.getLength() - endSelIndex, "api");
        }, 0);
      }
    });
  };

  _proto.forwardKeyboard = function forwardKeyboard(range, context) {
    if (this.currentHelper && this.currentHelper.container) {
      var target = this.currentHelper.container.querySelector(".dropdown-menu");
      console.log("keyboard", target, context.event);
      target.dispatchEvent(context.event);
    }
  };

  _proto.forwardKeyboardUp = function forwardKeyboardUp(range, context) {
    var e = new KeyboardEvent("keydown", {
      key: "ArrowUp",
      keyCode: 38,
      which: 38,
      bubbles: true,
      cancelable: true
    });
    context.event = e;
    this.forwardKeyboard(range, context);
  };

  _proto.forwardKeyboardDown = function forwardKeyboardDown(range, context) {
    var e = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      keyCode: 40,
      which: 40,
      bubbles: true,
      cancelable: true
    });
    context.event = e;
    this.forwardKeyboard(range, context);
  };

  _proto.openHelper = function openHelper(transform, index) {
    if (transform.helper) {
      this.currentHelper = transform.helper;

      if (typeof transform.helper.open === "function") {
        console.log("openHelper", index, this.quill.getFormat(index));
        var pos = this.quill.getBounds(index);
        var helperNode = this.quill.addContainer("ql-helper");
        helperNode.style.position = "absolute";
        helperNode.style.top = pos.top + "px";
        helperNode.style.left = pos.left + "px";
        helperNode.style.width = pos.width + "px";
        helperNode.style.height = pos.height + "px";
        console.log("openHelper", pos, helperNode);
        transform.helper.container = helperNode;
        transform.helper.open(helperNode);
      }
    }
  };

  _proto.closeHelper = function closeHelper(transform) {
    if (transform.helper) {
      if (typeof transform.helper.close === "function") {
        transform.helper.close(transform.helper.container);
      }
    }
  };

  return Autoformat;
}();

function getFormat(transform, match) {
  var format = {};

  if (typeof transform.format === "string") {
    format[transform.format] = match;
  } else if (typeof transform.format === "object") {
    format = transform.format;
  }

  return format;
}

function transformMatch(transform, match) {
  var find = new RegExp(transform.extract || transform.find);
  return transform.transform ? match.replace(find, transform.transform) : match;
}

function applyExtract(transform, match) {
  if (transform.extract) {
    var extract = new RegExp(transform.extract);
    var extractMatch = extract.exec(match[0]);

    if (!extractMatch || !extractMatch.length) {
      return match;
    }

    extractMatch.index += match.index;
    return extractMatch;
  }

  return match;
}

function makeTransformedDelta(transform, text, atIndex) {
  if (!transform.find.global) {
    transform.find = new RegExp(transform.find, transform.find.flags + "g");
  }

  transform.find.lastIndex = 0;
  var ops = new Delta();
  var findResult = null;
  var checkAtIndex = atIndex !== undefined && atIndex !== null;

  if (checkAtIndex) {
    findResult = transform.find.exec(text);

    while (findResult && findResult.length && findResult.index < atIndex) {
      if (findResult.index < atIndex && findResult.index + findResult[0].length + 1 >= atIndex) {
        ops = ops.concat(transformedMatchOps(transform, findResult).ops);
        break;
      } else {
        findResult = transform.find.exec(text);
      }
    }
  } else {
    while ((findResult = transform.find.exec(text)) !== null) {
      var transformedMatch = transformedMatchOps(transform, findResult);
      ops = ops.concat(transformedMatch.ops);
      text = text.substr(transformedMatch.rightIndex);
      transform.find.lastIndex = 0;
    }
  }

  return ops;
}

function transformedMatchOps(transform, result) {
  result = applyExtract(transform, result);
  var resultIndex = result.index;
  var transformedMatch = transformMatch(transform, result[0]);
  var insert = transformedMatch;

  if (transform.insert) {
    insert = {};
    insert[transform.insert] = transformedMatch;
  }

  var format = getFormat(transform, transformedMatch);
  var ops = new Delta();
  ops.retain(resultIndex)["delete"](result[0].length).insert(insert, format);
  var rightIndex = resultIndex + result[0].length;
  return {
    ops: ops,
    rightIndex: rightIndex
  };
}

var Embed = Quill["import"]("blots/embed");
var Mention = /*#__PURE__*/function (_Embed) {
  _inheritsLoose(Mention, _Embed);

  function Mention() {
    return _Embed.apply(this, arguments) || this;
  }

  Mention.create = function create(value) {
    var node = _Embed.create.call(this, value);

    node.setAttribute("title", value);
    node.setAttribute("href", this.BASE_URL + value);
    node.textContent = "@" + value;
    return node;
  };

  Mention.value = function value(domNode) {
    return domNode.textContent;
  };

  return Mention;
}(Embed);
Mention.blotName = "mention";
Mention.className = "ql-mention";
Mention.tagName = "A";
Mention.BASE_URL = "/";

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
  if (val === null || val === undefined) {
    throw new TypeError('Object.assign cannot be called with null or undefined');
  }

  return Object(val);
}

function shouldUseNative() {
  try {
    if (!Object.assign) {
      return false;
    }

    var test1 = new String('abc');
    test1[5] = 'de';

    if (Object.getOwnPropertyNames(test1)[0] === '5') {
      return false;
    }

    var test2 = {};

    for (var i = 0; i < 10; i++) {
      test2['_' + String.fromCharCode(i)] = i;
    }

    var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
      return test2[n];
    });

    if (order2.join('') !== '0123456789') {
      return false;
    }

    var test3 = {};
    'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
      test3[letter] = letter;
    });

    if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
  var from;
  var to = toObject(target);
  var symbols;

  for (var s = 1; s < arguments.length; s++) {
    from = Object(arguments[s]);

    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }

    if (getOwnPropertySymbols) {
      symbols = getOwnPropertySymbols(from);

      for (var i = 0; i < symbols.length; i++) {
        if (propIsEnumerable.call(from, symbols[i])) {
          to[symbols[i]] = from[symbols[i]];
        }
      }
    }
  }

  return to;
};

var scheduler_production_min = createCommonjsModule(function (module, exports) {

  var _f, g, h, k, l;

  if ("undefined" === typeof window || "function" !== typeof MessageChannel) {
    var p = null,
        q = null,
        t = function t() {
      if (null !== p) try {
        var a = exports.unstable_now();
        p(!0, a);
        p = null;
      } catch (b) {
        throw setTimeout(t, 0), b;
      }
    },
        u = Date.now();

    exports.unstable_now = function () {
      return Date.now() - u;
    };

    _f = function f(a) {
      null !== p ? setTimeout(_f, 0, a) : (p = a, setTimeout(t, 0));
    };

    g = function g(a, b) {
      q = setTimeout(a, b);
    };

    h = function h() {
      clearTimeout(q);
    };

    k = function k() {
      return !1;
    };

    l = exports.unstable_forceFrameRate = function () {};
  } else {
    var w = window.performance,
        x = window.Date,
        y = window.setTimeout,
        z = window.clearTimeout;

    if ("undefined" !== typeof console) {
      var A = window.cancelAnimationFrame;
      "function" !== typeof window.requestAnimationFrame && console.error("This browser doesn't support requestAnimationFrame. Make sure that you load a polyfill in older browsers. https://fb.me/react-polyfills");
      "function" !== typeof A && console.error("This browser doesn't support cancelAnimationFrame. Make sure that you load a polyfill in older browsers. https://fb.me/react-polyfills");
    }

    if ("object" === typeof w && "function" === typeof w.now) exports.unstable_now = function () {
      return w.now();
    };else {
      var B = x.now();

      exports.unstable_now = function () {
        return x.now() - B;
      };
    }
    var C = !1,
        D = null,
        E = -1,
        F = 5,
        G = 0;

    k = function k() {
      return exports.unstable_now() >= G;
    };

    l = function l() {};

    exports.unstable_forceFrameRate = function (a) {
      0 > a || 125 < a ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing framerates higher than 125 fps is not unsupported") : F = 0 < a ? Math.floor(1E3 / a) : 5;
    };

    var H = new MessageChannel(),
        I = H.port2;

    H.port1.onmessage = function () {
      if (null !== D) {
        var a = exports.unstable_now();
        G = a + F;

        try {
          D(!0, a) ? I.postMessage(null) : (C = !1, D = null);
        } catch (b) {
          throw I.postMessage(null), b;
        }
      } else C = !1;
    };

    _f = function _f(a) {
      D = a;
      C || (C = !0, I.postMessage(null));
    };

    g = function g(a, b) {
      E = y(function () {
        a(exports.unstable_now());
      }, b);
    };

    h = function h() {
      z(E);
      E = -1;
    };
  }

  function J(a, b) {
    var c = a.length;
    a.push(b);

    a: for (;;) {
      var d = c - 1 >>> 1,
          e = a[d];
      if (void 0 !== e && 0 < K(e, b)) a[d] = b, a[c] = e, c = d;else break a;
    }
  }

  function L(a) {
    a = a[0];
    return void 0 === a ? null : a;
  }

  function M(a) {
    var b = a[0];

    if (void 0 !== b) {
      var c = a.pop();

      if (c !== b) {
        a[0] = c;

        a: for (var d = 0, e = a.length; d < e;) {
          var m = 2 * (d + 1) - 1,
              n = a[m],
              v = m + 1,
              r = a[v];
          if (void 0 !== n && 0 > K(n, c)) void 0 !== r && 0 > K(r, n) ? (a[d] = r, a[v] = c, d = v) : (a[d] = n, a[m] = c, d = m);else if (void 0 !== r && 0 > K(r, c)) a[d] = r, a[v] = c, d = v;else break a;
        }
      }

      return b;
    }

    return null;
  }

  function K(a, b) {
    var c = a.sortIndex - b.sortIndex;
    return 0 !== c ? c : a.id - b.id;
  }

  var N = [],
      O = [],
      P = 1,
      Q = null,
      R = 3,
      S = !1,
      T = !1,
      U = !1;

  function V(a) {
    for (var b = L(O); null !== b;) {
      if (null === b.callback) M(O);else if (b.startTime <= a) M(O), b.sortIndex = b.expirationTime, J(N, b);else break;
      b = L(O);
    }
  }

  function W(a) {
    U = !1;
    V(a);
    if (!T) if (null !== L(N)) T = !0, _f(X);else {
      var b = L(O);
      null !== b && g(W, b.startTime - a);
    }
  }

  function X(a, b) {
    T = !1;
    U && (U = !1, h());
    S = !0;
    var c = R;

    try {
      V(b);

      for (Q = L(N); null !== Q && (!(Q.expirationTime > b) || a && !k());) {
        var d = Q.callback;

        if (null !== d) {
          Q.callback = null;
          R = Q.priorityLevel;
          var e = d(Q.expirationTime <= b);
          b = exports.unstable_now();
          "function" === typeof e ? Q.callback = e : Q === L(N) && M(N);
          V(b);
        } else M(N);

        Q = L(N);
      }

      if (null !== Q) var m = !0;else {
        var n = L(O);
        null !== n && g(W, n.startTime - b);
        m = !1;
      }
      return m;
    } finally {
      Q = null, R = c, S = !1;
    }
  }

  function Y(a) {
    switch (a) {
      case 1:
        return -1;

      case 2:
        return 250;

      case 5:
        return 1073741823;

      case 4:
        return 1E4;

      default:
        return 5E3;
    }
  }

  var Z = l;
  exports.unstable_IdlePriority = 5;
  exports.unstable_ImmediatePriority = 1;
  exports.unstable_LowPriority = 4;
  exports.unstable_NormalPriority = 3;
  exports.unstable_Profiling = null;
  exports.unstable_UserBlockingPriority = 2;

  exports.unstable_cancelCallback = function (a) {
    a.callback = null;
  };

  exports.unstable_continueExecution = function () {
    T || S || (T = !0, _f(X));
  };

  exports.unstable_getCurrentPriorityLevel = function () {
    return R;
  };

  exports.unstable_getFirstCallbackNode = function () {
    return L(N);
  };

  exports.unstable_next = function (a) {
    switch (R) {
      case 1:
      case 2:
      case 3:
        var b = 3;
        break;

      default:
        b = R;
    }

    var c = R;
    R = b;

    try {
      return a();
    } finally {
      R = c;
    }
  };

  exports.unstable_pauseExecution = function () {};

  exports.unstable_requestPaint = Z;

  exports.unstable_runWithPriority = function (a, b) {
    switch (a) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break;

      default:
        a = 3;
    }

    var c = R;
    R = a;

    try {
      return b();
    } finally {
      R = c;
    }
  };

  exports.unstable_scheduleCallback = function (a, b, c) {
    var d = exports.unstable_now();

    if ("object" === typeof c && null !== c) {
      var e = c.delay;
      e = "number" === typeof e && 0 < e ? d + e : d;
      c = "number" === typeof c.timeout ? c.timeout : Y(a);
    } else c = Y(a), e = d;

    c = e + c;
    a = {
      id: P++,
      callback: b,
      priorityLevel: a,
      startTime: e,
      expirationTime: c,
      sortIndex: -1
    };
    e > d ? (a.sortIndex = e, J(O, a), null === L(N) && a === L(O) && (U ? h() : U = !0, g(W, e - d))) : (a.sortIndex = c, J(N, a), T || S || (T = !0, _f(X)));
    return a;
  };

  exports.unstable_shouldYield = function () {
    var a = exports.unstable_now();
    V(a);
    var b = L(N);
    return b !== Q && null !== Q && null !== b && null !== b.callback && b.startTime <= a && b.expirationTime < Q.expirationTime || k();
  };

  exports.unstable_wrapCallback = function (a) {
    var b = R;
    return function () {
      var c = R;
      R = b;

      try {
        return a.apply(this, arguments);
      } finally {
        R = c;
      }
    };
  };
});

var scheduler_development = createCommonjsModule(function (module, exports) {

  if (process.env.NODE_ENV !== "production") {
    (function () {

      var enableSchedulerDebugging = false;
      var enableProfiling = true;

      var _requestHostCallback;

      var requestHostTimeout;
      var cancelHostTimeout;
      var shouldYieldToHost;
      var requestPaint;

      if (typeof window === 'undefined' || typeof MessageChannel !== 'function') {
        var _callback = null;
        var _timeoutID = null;

        var _flushCallback = function _flushCallback() {
          if (_callback !== null) {
            try {
              var currentTime = exports.unstable_now();
              var hasRemainingTime = true;

              _callback(hasRemainingTime, currentTime);

              _callback = null;
            } catch (e) {
              setTimeout(_flushCallback, 0);
              throw e;
            }
          }
        };

        var initialTime = Date.now();

        exports.unstable_now = function () {
          return Date.now() - initialTime;
        };

        _requestHostCallback = function requestHostCallback(cb) {
          if (_callback !== null) {
            setTimeout(_requestHostCallback, 0, cb);
          } else {
            _callback = cb;
            setTimeout(_flushCallback, 0);
          }
        };

        requestHostTimeout = function requestHostTimeout(cb, ms) {
          _timeoutID = setTimeout(cb, ms);
        };

        cancelHostTimeout = function cancelHostTimeout() {
          clearTimeout(_timeoutID);
        };

        shouldYieldToHost = function shouldYieldToHost() {
          return false;
        };

        requestPaint = exports.unstable_forceFrameRate = function () {};
      } else {
        var performance = window.performance;
        var _Date = window.Date;
        var _setTimeout = window.setTimeout;
        var _clearTimeout = window.clearTimeout;

        if (typeof console !== 'undefined') {
          var requestAnimationFrame = window.requestAnimationFrame;
          var cancelAnimationFrame = window.cancelAnimationFrame;

          if (typeof requestAnimationFrame !== 'function') {
            console['error']("This browser doesn't support requestAnimationFrame. " + 'Make sure that you load a ' + 'polyfill in older browsers. https://fb.me/react-polyfills');
          }

          if (typeof cancelAnimationFrame !== 'function') {
            console['error']("This browser doesn't support cancelAnimationFrame. " + 'Make sure that you load a ' + 'polyfill in older browsers. https://fb.me/react-polyfills');
          }
        }

        if (typeof performance === 'object' && typeof performance.now === 'function') {
          exports.unstable_now = function () {
            return performance.now();
          };
        } else {
          var _initialTime = _Date.now();

          exports.unstable_now = function () {
            return _Date.now() - _initialTime;
          };
        }

        var isMessageLoopRunning = false;
        var scheduledHostCallback = null;
        var taskTimeoutID = -1;
        var yieldInterval = 5;
        var deadline = 0;
        {
          shouldYieldToHost = function shouldYieldToHost() {
            return exports.unstable_now() >= deadline;
          };

          requestPaint = function requestPaint() {};
        }

        exports.unstable_forceFrameRate = function (fps) {
          if (fps < 0 || fps > 125) {
            console['error']('forceFrameRate takes a positive int between 0 and 125, ' + 'forcing framerates higher than 125 fps is not unsupported');
            return;
          }

          if (fps > 0) {
            yieldInterval = Math.floor(1000 / fps);
          } else {
            yieldInterval = 5;
          }
        };

        var performWorkUntilDeadline = function performWorkUntilDeadline() {
          if (scheduledHostCallback !== null) {
            var currentTime = exports.unstable_now();
            deadline = currentTime + yieldInterval;
            var hasTimeRemaining = true;

            try {
              var hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);

              if (!hasMoreWork) {
                isMessageLoopRunning = false;
                scheduledHostCallback = null;
              } else {
                port.postMessage(null);
              }
            } catch (error) {
              port.postMessage(null);
              throw error;
            }
          } else {
            isMessageLoopRunning = false;
          }
        };

        var channel = new MessageChannel();
        var port = channel.port2;
        channel.port1.onmessage = performWorkUntilDeadline;

        _requestHostCallback = function _requestHostCallback(callback) {
          scheduledHostCallback = callback;

          if (!isMessageLoopRunning) {
            isMessageLoopRunning = true;
            port.postMessage(null);
          }
        };

        requestHostTimeout = function requestHostTimeout(callback, ms) {
          taskTimeoutID = _setTimeout(function () {
            callback(exports.unstable_now());
          }, ms);
        };

        cancelHostTimeout = function cancelHostTimeout() {
          _clearTimeout(taskTimeoutID);

          taskTimeoutID = -1;
        };
      }

      function push(heap, node) {
        var index = heap.length;
        heap.push(node);
        siftUp(heap, node, index);
      }

      function peek(heap) {
        var first = heap[0];
        return first === undefined ? null : first;
      }

      function pop(heap) {
        var first = heap[0];

        if (first !== undefined) {
          var last = heap.pop();

          if (last !== first) {
            heap[0] = last;
            siftDown(heap, last, 0);
          }

          return first;
        } else {
          return null;
        }
      }

      function siftUp(heap, node, i) {
        var index = i;

        while (true) {
          var parentIndex = index - 1 >>> 1;
          var parent = heap[parentIndex];

          if (parent !== undefined && compare(parent, node) > 0) {
            heap[parentIndex] = node;
            heap[index] = parent;
            index = parentIndex;
          } else {
            return;
          }
        }
      }

      function siftDown(heap, node, i) {
        var index = i;
        var length = heap.length;

        while (index < length) {
          var leftIndex = (index + 1) * 2 - 1;
          var left = heap[leftIndex];
          var rightIndex = leftIndex + 1;
          var right = heap[rightIndex];

          if (left !== undefined && compare(left, node) < 0) {
            if (right !== undefined && compare(right, left) < 0) {
              heap[index] = right;
              heap[rightIndex] = node;
              index = rightIndex;
            } else {
              heap[index] = left;
              heap[leftIndex] = node;
              index = leftIndex;
            }
          } else if (right !== undefined && compare(right, node) < 0) {
            heap[index] = right;
            heap[rightIndex] = node;
            index = rightIndex;
          } else {
            return;
          }
        }
      }

      function compare(a, b) {
        var diff = a.sortIndex - b.sortIndex;
        return diff !== 0 ? diff : a.id - b.id;
      }

      var NoPriority = 0;
      var ImmediatePriority = 1;
      var UserBlockingPriority = 2;
      var NormalPriority = 3;
      var LowPriority = 4;
      var IdlePriority = 5;
      var runIdCounter = 0;
      var mainThreadIdCounter = 0;
      var profilingStateSize = 4;
      var sharedProfilingBuffer = typeof SharedArrayBuffer === 'function' ? new SharedArrayBuffer(profilingStateSize * Int32Array.BYTES_PER_ELEMENT) : typeof ArrayBuffer === 'function' ? new ArrayBuffer(profilingStateSize * Int32Array.BYTES_PER_ELEMENT) : null;
      var profilingState = sharedProfilingBuffer !== null ? new Int32Array(sharedProfilingBuffer) : [];
      var PRIORITY = 0;
      var CURRENT_TASK_ID = 1;
      var CURRENT_RUN_ID = 2;
      var QUEUE_SIZE = 3;
      {
        profilingState[PRIORITY] = NoPriority;
        profilingState[QUEUE_SIZE] = 0;
        profilingState[CURRENT_TASK_ID] = 0;
      }
      var INITIAL_EVENT_LOG_SIZE = 131072;
      var MAX_EVENT_LOG_SIZE = 524288;
      var eventLogSize = 0;
      var eventLogBuffer = null;
      var eventLog = null;
      var eventLogIndex = 0;
      var TaskStartEvent = 1;
      var TaskCompleteEvent = 2;
      var TaskErrorEvent = 3;
      var TaskCancelEvent = 4;
      var TaskRunEvent = 5;
      var TaskYieldEvent = 6;
      var SchedulerSuspendEvent = 7;
      var SchedulerResumeEvent = 8;

      function logEvent(entries) {
        if (eventLog !== null) {
          var offset = eventLogIndex;
          eventLogIndex += entries.length;

          if (eventLogIndex + 1 > eventLogSize) {
            eventLogSize *= 2;

            if (eventLogSize > MAX_EVENT_LOG_SIZE) {
              console['error']("Scheduler Profiling: Event log exceeded maximum size. Don't " + 'forget to call `stopLoggingProfilingEvents()`.');
              stopLoggingProfilingEvents();
              return;
            }

            var newEventLog = new Int32Array(eventLogSize * 4);
            newEventLog.set(eventLog);
            eventLogBuffer = newEventLog.buffer;
            eventLog = newEventLog;
          }

          eventLog.set(entries, offset);
        }
      }

      function startLoggingProfilingEvents() {
        eventLogSize = INITIAL_EVENT_LOG_SIZE;
        eventLogBuffer = new ArrayBuffer(eventLogSize * 4);
        eventLog = new Int32Array(eventLogBuffer);
        eventLogIndex = 0;
      }

      function stopLoggingProfilingEvents() {
        var buffer = eventLogBuffer;
        eventLogSize = 0;
        eventLogBuffer = null;
        eventLog = null;
        eventLogIndex = 0;
        return buffer;
      }

      function markTaskStart(task, ms) {
        {
          profilingState[QUEUE_SIZE]++;

          if (eventLog !== null) {
            logEvent([TaskStartEvent, ms * 1000, task.id, task.priorityLevel]);
          }
        }
      }

      function markTaskCompleted(task, ms) {
        {
          profilingState[PRIORITY] = NoPriority;
          profilingState[CURRENT_TASK_ID] = 0;
          profilingState[QUEUE_SIZE]--;

          if (eventLog !== null) {
            logEvent([TaskCompleteEvent, ms * 1000, task.id]);
          }
        }
      }

      function markTaskCanceled(task, ms) {
        {
          profilingState[QUEUE_SIZE]--;

          if (eventLog !== null) {
            logEvent([TaskCancelEvent, ms * 1000, task.id]);
          }
        }
      }

      function markTaskErrored(task, ms) {
        {
          profilingState[PRIORITY] = NoPriority;
          profilingState[CURRENT_TASK_ID] = 0;
          profilingState[QUEUE_SIZE]--;

          if (eventLog !== null) {
            logEvent([TaskErrorEvent, ms * 1000, task.id]);
          }
        }
      }

      function markTaskRun(task, ms) {
        {
          runIdCounter++;
          profilingState[PRIORITY] = task.priorityLevel;
          profilingState[CURRENT_TASK_ID] = task.id;
          profilingState[CURRENT_RUN_ID] = runIdCounter;

          if (eventLog !== null) {
            logEvent([TaskRunEvent, ms * 1000, task.id, runIdCounter]);
          }
        }
      }

      function markTaskYield(task, ms) {
        {
          profilingState[PRIORITY] = NoPriority;
          profilingState[CURRENT_TASK_ID] = 0;
          profilingState[CURRENT_RUN_ID] = 0;

          if (eventLog !== null) {
            logEvent([TaskYieldEvent, ms * 1000, task.id, runIdCounter]);
          }
        }
      }

      function markSchedulerSuspended(ms) {
        {
          mainThreadIdCounter++;

          if (eventLog !== null) {
            logEvent([SchedulerSuspendEvent, ms * 1000, mainThreadIdCounter]);
          }
        }
      }

      function markSchedulerUnsuspended(ms) {
        {
          if (eventLog !== null) {
            logEvent([SchedulerResumeEvent, ms * 1000, mainThreadIdCounter]);
          }
        }
      }

      var maxSigned31BitInt = 1073741823;
      var IMMEDIATE_PRIORITY_TIMEOUT = -1;
      var USER_BLOCKING_PRIORITY = 250;
      var NORMAL_PRIORITY_TIMEOUT = 5000;
      var LOW_PRIORITY_TIMEOUT = 10000;
      var IDLE_PRIORITY = maxSigned31BitInt;
      var taskQueue = [];
      var timerQueue = [];
      var taskIdCounter = 1;
      var currentTask = null;
      var currentPriorityLevel = NormalPriority;
      var isPerformingWork = false;
      var isHostCallbackScheduled = false;
      var isHostTimeoutScheduled = false;

      function advanceTimers(currentTime) {
        var timer = peek(timerQueue);

        while (timer !== null) {
          if (timer.callback === null) {
            pop(timerQueue);
          } else if (timer.startTime <= currentTime) {
            pop(timerQueue);
            timer.sortIndex = timer.expirationTime;
            push(taskQueue, timer);
            {
              markTaskStart(timer, currentTime);
              timer.isQueued = true;
            }
          } else {
            return;
          }

          timer = peek(timerQueue);
        }
      }

      function handleTimeout(currentTime) {
        isHostTimeoutScheduled = false;
        advanceTimers(currentTime);

        if (!isHostCallbackScheduled) {
          if (peek(taskQueue) !== null) {
            isHostCallbackScheduled = true;

            _requestHostCallback(flushWork);
          } else {
            var firstTimer = peek(timerQueue);

            if (firstTimer !== null) {
              requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
            }
          }
        }
      }

      function flushWork(hasTimeRemaining, initialTime) {
        {
          markSchedulerUnsuspended(initialTime);
        }
        isHostCallbackScheduled = false;

        if (isHostTimeoutScheduled) {
          isHostTimeoutScheduled = false;
          cancelHostTimeout();
        }

        isPerformingWork = true;
        var previousPriorityLevel = currentPriorityLevel;

        try {
          if (enableProfiling) {
            try {
              return workLoop(hasTimeRemaining, initialTime);
            } catch (error) {
              if (currentTask !== null) {
                var currentTime = exports.unstable_now();
                markTaskErrored(currentTask, currentTime);
                currentTask.isQueued = false;
              }

              throw error;
            }
          } else {
            return workLoop(hasTimeRemaining, initialTime);
          }
        } finally {
          currentTask = null;
          currentPriorityLevel = previousPriorityLevel;
          isPerformingWork = false;
          {
            var _currentTime = exports.unstable_now();

            markSchedulerSuspended(_currentTime);
          }
        }
      }

      function workLoop(hasTimeRemaining, initialTime) {
        var currentTime = initialTime;
        advanceTimers(currentTime);
        currentTask = peek(taskQueue);

        while (currentTask !== null && !enableSchedulerDebugging) {
          if (currentTask.expirationTime > currentTime && (!hasTimeRemaining || shouldYieldToHost())) {
            break;
          }

          var callback = currentTask.callback;

          if (callback !== null) {
            currentTask.callback = null;
            currentPriorityLevel = currentTask.priorityLevel;
            var didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
            markTaskRun(currentTask, currentTime);
            var continuationCallback = callback(didUserCallbackTimeout);
            currentTime = exports.unstable_now();

            if (typeof continuationCallback === 'function') {
              currentTask.callback = continuationCallback;
              markTaskYield(currentTask, currentTime);
            } else {
              {
                markTaskCompleted(currentTask, currentTime);
                currentTask.isQueued = false;
              }

              if (currentTask === peek(taskQueue)) {
                pop(taskQueue);
              }
            }

            advanceTimers(currentTime);
          } else {
            pop(taskQueue);
          }

          currentTask = peek(taskQueue);
        }

        if (currentTask !== null) {
          return true;
        } else {
          var firstTimer = peek(timerQueue);

          if (firstTimer !== null) {
            requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
          }

          return false;
        }
      }

      function unstable_runWithPriority(priorityLevel, eventHandler) {
        switch (priorityLevel) {
          case ImmediatePriority:
          case UserBlockingPriority:
          case NormalPriority:
          case LowPriority:
          case IdlePriority:
            break;

          default:
            priorityLevel = NormalPriority;
        }

        var previousPriorityLevel = currentPriorityLevel;
        currentPriorityLevel = priorityLevel;

        try {
          return eventHandler();
        } finally {
          currentPriorityLevel = previousPriorityLevel;
        }
      }

      function unstable_next(eventHandler) {
        var priorityLevel;

        switch (currentPriorityLevel) {
          case ImmediatePriority:
          case UserBlockingPriority:
          case NormalPriority:
            priorityLevel = NormalPriority;
            break;

          default:
            priorityLevel = currentPriorityLevel;
            break;
        }

        var previousPriorityLevel = currentPriorityLevel;
        currentPriorityLevel = priorityLevel;

        try {
          return eventHandler();
        } finally {
          currentPriorityLevel = previousPriorityLevel;
        }
      }

      function unstable_wrapCallback(callback) {
        var parentPriorityLevel = currentPriorityLevel;
        return function () {
          var previousPriorityLevel = currentPriorityLevel;
          currentPriorityLevel = parentPriorityLevel;

          try {
            return callback.apply(this, arguments);
          } finally {
            currentPriorityLevel = previousPriorityLevel;
          }
        };
      }

      function timeoutForPriorityLevel(priorityLevel) {
        switch (priorityLevel) {
          case ImmediatePriority:
            return IMMEDIATE_PRIORITY_TIMEOUT;

          case UserBlockingPriority:
            return USER_BLOCKING_PRIORITY;

          case IdlePriority:
            return IDLE_PRIORITY;

          case LowPriority:
            return LOW_PRIORITY_TIMEOUT;

          case NormalPriority:
          default:
            return NORMAL_PRIORITY_TIMEOUT;
        }
      }

      function unstable_scheduleCallback(priorityLevel, callback, options) {
        var currentTime = exports.unstable_now();
        var startTime;
        var timeout;

        if (typeof options === 'object' && options !== null) {
          var delay = options.delay;

          if (typeof delay === 'number' && delay > 0) {
            startTime = currentTime + delay;
          } else {
            startTime = currentTime;
          }

          timeout = typeof options.timeout === 'number' ? options.timeout : timeoutForPriorityLevel(priorityLevel);
        } else {
          timeout = timeoutForPriorityLevel(priorityLevel);
          startTime = currentTime;
        }

        var expirationTime = startTime + timeout;
        var newTask = {
          id: taskIdCounter++,
          callback: callback,
          priorityLevel: priorityLevel,
          startTime: startTime,
          expirationTime: expirationTime,
          sortIndex: -1
        };
        {
          newTask.isQueued = false;
        }

        if (startTime > currentTime) {
          newTask.sortIndex = startTime;
          push(timerQueue, newTask);

          if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
            if (isHostTimeoutScheduled) {
              cancelHostTimeout();
            } else {
              isHostTimeoutScheduled = true;
            }

            requestHostTimeout(handleTimeout, startTime - currentTime);
          }
        } else {
          newTask.sortIndex = expirationTime;
          push(taskQueue, newTask);
          {
            markTaskStart(newTask, currentTime);
            newTask.isQueued = true;
          }

          if (!isHostCallbackScheduled && !isPerformingWork) {
            isHostCallbackScheduled = true;

            _requestHostCallback(flushWork);
          }
        }

        return newTask;
      }

      function unstable_pauseExecution() {}

      function unstable_continueExecution() {
        if (!isHostCallbackScheduled && !isPerformingWork) {
          isHostCallbackScheduled = true;

          _requestHostCallback(flushWork);
        }
      }

      function unstable_getFirstCallbackNode() {
        return peek(taskQueue);
      }

      function unstable_cancelCallback(task) {
        {
          if (task.isQueued) {
            var currentTime = exports.unstable_now();
            markTaskCanceled(task, currentTime);
            task.isQueued = false;
          }
        }
        task.callback = null;
      }

      function unstable_getCurrentPriorityLevel() {
        return currentPriorityLevel;
      }

      function unstable_shouldYield() {
        var currentTime = exports.unstable_now();
        advanceTimers(currentTime);
        var firstTask = peek(taskQueue);
        return firstTask !== currentTask && currentTask !== null && firstTask !== null && firstTask.callback !== null && firstTask.startTime <= currentTime && firstTask.expirationTime < currentTask.expirationTime || shouldYieldToHost();
      }

      var unstable_requestPaint = requestPaint;
      var unstable_Profiling = {
        startLoggingProfilingEvents: startLoggingProfilingEvents,
        stopLoggingProfilingEvents: stopLoggingProfilingEvents,
        sharedProfilingBuffer: sharedProfilingBuffer
      };
      exports.unstable_IdlePriority = IdlePriority;
      exports.unstable_ImmediatePriority = ImmediatePriority;
      exports.unstable_LowPriority = LowPriority;
      exports.unstable_NormalPriority = NormalPriority;
      exports.unstable_Profiling = unstable_Profiling;
      exports.unstable_UserBlockingPriority = UserBlockingPriority;
      exports.unstable_cancelCallback = unstable_cancelCallback;
      exports.unstable_continueExecution = unstable_continueExecution;
      exports.unstable_getCurrentPriorityLevel = unstable_getCurrentPriorityLevel;
      exports.unstable_getFirstCallbackNode = unstable_getFirstCallbackNode;
      exports.unstable_next = unstable_next;
      exports.unstable_pauseExecution = unstable_pauseExecution;
      exports.unstable_requestPaint = unstable_requestPaint;
      exports.unstable_runWithPriority = unstable_runWithPriority;
      exports.unstable_scheduleCallback = unstable_scheduleCallback;
      exports.unstable_shouldYield = unstable_shouldYield;
      exports.unstable_wrapCallback = unstable_wrapCallback;
    })();
  }
});

var scheduler = createCommonjsModule(function (module) {

  if (process.env.NODE_ENV === 'production') {
    module.exports = scheduler_production_min;
  } else {
    module.exports = scheduler_development;
  }
});

function u(a) {
  for (var b = "https://reactjs.org/docs/error-decoder.html?invariant=" + a, c = 1; c < arguments.length; c++) {
    b += "&args[]=" + encodeURIComponent(arguments[c]);
  }

  return "Minified React error #" + a + "; visit " + b + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}

if (!React) throw Error(u(227));

function ba(a, b, c, d, e, f, g, h, k) {
  var l = Array.prototype.slice.call(arguments, 3);

  try {
    b.apply(c, l);
  } catch (m) {
    this.onError(m);
  }
}

var da = !1,
    ea = null,
    fa = !1,
    ha = null,
    ia = {
  onError: function onError(a) {
    da = !0;
    ea = a;
  }
};

function ja(a, b, c, d, e, f, g, h, k) {
  da = !1;
  ea = null;
  ba.apply(ia, arguments);
}

function ka(a, b, c, d, e, f, g, h, k) {
  ja.apply(this, arguments);

  if (da) {
    if (da) {
      var l = ea;
      da = !1;
      ea = null;
    } else throw Error(u(198));

    fa || (fa = !0, ha = l);
  }
}

var la = null,
    ma = null,
    na = null;

function oa(a, b, c) {
  var d = a.type || "unknown-event";
  a.currentTarget = na(c);
  ka(d, b, void 0, a);
  a.currentTarget = null;
}

var pa = null,
    qa = {};

function ra() {
  if (pa) for (var a in qa) {
    var b = qa[a],
        c = pa.indexOf(a);
    if (!(-1 < c)) throw Error(u(96, a));

    if (!sa[c]) {
      if (!b.extractEvents) throw Error(u(97, a));
      sa[c] = b;
      c = b.eventTypes;

      for (var d in c) {
        var e = void 0;
        var f = c[d],
            g = b,
            h = d;
        if (ta.hasOwnProperty(h)) throw Error(u(99, h));
        ta[h] = f;
        var k = f.phasedRegistrationNames;

        if (k) {
          for (e in k) {
            k.hasOwnProperty(e) && ua(k[e], g, h);
          }

          e = !0;
        } else f.registrationName ? (ua(f.registrationName, g, h), e = !0) : e = !1;

        if (!e) throw Error(u(98, d, a));
      }
    }
  }
}

function ua(a, b, c) {
  if (va[a]) throw Error(u(100, a));
  va[a] = b;
  wa[a] = b.eventTypes[c].dependencies;
}

var sa = [],
    ta = {},
    va = {},
    wa = {};

function xa(a) {
  var b = !1,
      c;

  for (c in a) {
    if (a.hasOwnProperty(c)) {
      var d = a[c];

      if (!qa.hasOwnProperty(c) || qa[c] !== d) {
        if (qa[c]) throw Error(u(102, c));
        qa[c] = d;
        b = !0;
      }
    }
  }

  b && ra();
}

var ya = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement),
    za = null,
    Aa = null,
    Ba = null;

function Ca(a) {
  if (a = ma(a)) {
    if ("function" !== typeof za) throw Error(u(280));
    var b = a.stateNode;
    b && (b = la(b), za(a.stateNode, a.type, b));
  }
}

function Da(a) {
  Aa ? Ba ? Ba.push(a) : Ba = [a] : Aa = a;
}

function Ea() {
  if (Aa) {
    var a = Aa,
        b = Ba;
    Ba = Aa = null;
    Ca(a);
    if (b) for (a = 0; a < b.length; a++) {
      Ca(b[a]);
    }
  }
}

function Fa(a, b) {
  return a(b);
}

function Ga(a, b, c, d, e) {
  return a(b, c, d, e);
}

function Ha() {}

var Ia = Fa,
    Ja = !1,
    Ka = !1;

function La() {
  if (null !== Aa || null !== Ba) Ha(), Ea();
}

function Ma(a, b, c) {
  if (Ka) return a(b, c);
  Ka = !0;

  try {
    return Ia(a, b, c);
  } finally {
    Ka = !1, La();
  }
}

var Na = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
    Oa = Object.prototype.hasOwnProperty,
    Pa = {},
    Qa = {};

function Ra(a) {
  if (Oa.call(Qa, a)) return !0;
  if (Oa.call(Pa, a)) return !1;
  if (Na.test(a)) return Qa[a] = !0;
  Pa[a] = !0;
  return !1;
}

function Sa(a, b, c, d) {
  if (null !== c && 0 === c.type) return !1;

  switch (typeof b) {
    case "function":
    case "symbol":
      return !0;

    case "boolean":
      if (d) return !1;
      if (null !== c) return !c.acceptsBooleans;
      a = a.toLowerCase().slice(0, 5);
      return "data-" !== a && "aria-" !== a;

    default:
      return !1;
  }
}

function Ta(a, b, c, d) {
  if (null === b || "undefined" === typeof b || Sa(a, b, c, d)) return !0;
  if (d) return !1;
  if (null !== c) switch (c.type) {
    case 3:
      return !b;

    case 4:
      return !1 === b;

    case 5:
      return isNaN(b);

    case 6:
      return isNaN(b) || 1 > b;
  }
  return !1;
}

function v(a, b, c, d, e, f) {
  this.acceptsBooleans = 2 === b || 3 === b || 4 === b;
  this.attributeName = d;
  this.attributeNamespace = e;
  this.mustUseProperty = c;
  this.propertyName = a;
  this.type = b;
  this.sanitizeURL = f;
}

var C = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function (a) {
  C[a] = new v(a, 0, !1, a, null, !1);
});
[["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function (a) {
  var b = a[0];
  C[b] = new v(b, 1, !1, a[1], null, !1);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function (a) {
  C[a] = new v(a, 2, !1, a.toLowerCase(), null, !1);
});
["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function (a) {
  C[a] = new v(a, 2, !1, a, null, !1);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function (a) {
  C[a] = new v(a, 3, !1, a.toLowerCase(), null, !1);
});
["checked", "multiple", "muted", "selected"].forEach(function (a) {
  C[a] = new v(a, 3, !0, a, null, !1);
});
["capture", "download"].forEach(function (a) {
  C[a] = new v(a, 4, !1, a, null, !1);
});
["cols", "rows", "size", "span"].forEach(function (a) {
  C[a] = new v(a, 6, !1, a, null, !1);
});
["rowSpan", "start"].forEach(function (a) {
  C[a] = new v(a, 5, !1, a.toLowerCase(), null, !1);
});
var Ua = /[\-:]([a-z])/g;

function Va(a) {
  return a[1].toUpperCase();
}

"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function (a) {
  var b = a.replace(Ua, Va);
  C[b] = new v(b, 1, !1, a, null, !1);
});
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function (a) {
  var b = a.replace(Ua, Va);
  C[b] = new v(b, 1, !1, a, "http://www.w3.org/1999/xlink", !1);
});
["xml:base", "xml:lang", "xml:space"].forEach(function (a) {
  var b = a.replace(Ua, Va);
  C[b] = new v(b, 1, !1, a, "http://www.w3.org/XML/1998/namespace", !1);
});
["tabIndex", "crossOrigin"].forEach(function (a) {
  C[a] = new v(a, 1, !1, a.toLowerCase(), null, !1);
});
C.xlinkHref = new v("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0);
["src", "href", "action", "formAction"].forEach(function (a) {
  C[a] = new v(a, 1, !1, a.toLowerCase(), null, !0);
});
var Wa = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
Wa.hasOwnProperty("ReactCurrentDispatcher") || (Wa.ReactCurrentDispatcher = {
  current: null
});
Wa.hasOwnProperty("ReactCurrentBatchConfig") || (Wa.ReactCurrentBatchConfig = {
  suspense: null
});

function Xa(a, b, c, d) {
  var e = C.hasOwnProperty(b) ? C[b] : null;
  var f = null !== e ? 0 === e.type : d ? !1 : !(2 < b.length) || "o" !== b[0] && "O" !== b[0] || "n" !== b[1] && "N" !== b[1] ? !1 : !0;
  f || (Ta(b, c, e, d) && (c = null), d || null === e ? Ra(b) && (null === c ? a.removeAttribute(b) : a.setAttribute(b, "" + c)) : e.mustUseProperty ? a[e.propertyName] = null === c ? 3 === e.type ? !1 : "" : c : (b = e.attributeName, d = e.attributeNamespace, null === c ? a.removeAttribute(b) : (e = e.type, c = 3 === e || 4 === e && !0 === c ? "" : "" + c, d ? a.setAttributeNS(d, b, c) : a.setAttribute(b, c))));
}

var Ya = /^(.*)[\\\/]/,
    E = "function" === typeof Symbol && Symbol["for"],
    Za = E ? Symbol["for"]("react.element") : 60103,
    $a = E ? Symbol["for"]("react.portal") : 60106,
    ab = E ? Symbol["for"]("react.fragment") : 60107,
    bb = E ? Symbol["for"]("react.strict_mode") : 60108,
    cb = E ? Symbol["for"]("react.profiler") : 60114,
    db = E ? Symbol["for"]("react.provider") : 60109,
    eb = E ? Symbol["for"]("react.context") : 60110,
    fb = E ? Symbol["for"]("react.concurrent_mode") : 60111,
    gb = E ? Symbol["for"]("react.forward_ref") : 60112,
    hb = E ? Symbol["for"]("react.suspense") : 60113,
    ib = E ? Symbol["for"]("react.suspense_list") : 60120,
    jb = E ? Symbol["for"]("react.memo") : 60115,
    kb = E ? Symbol["for"]("react.lazy") : 60116,
    lb = E ? Symbol["for"]("react.block") : 60121,
    mb = "function" === typeof Symbol && Symbol.iterator;

function nb(a) {
  if (null === a || "object" !== typeof a) return null;
  a = mb && a[mb] || a["@@iterator"];
  return "function" === typeof a ? a : null;
}

function ob(a) {
  if (-1 === a._status) {
    a._status = 0;
    var b = a._ctor;
    b = b();
    a._result = b;
    b.then(function (b) {
      0 === a._status && (b = b["default"], a._status = 1, a._result = b);
    }, function (b) {
      0 === a._status && (a._status = 2, a._result = b);
    });
  }
}

function pb(a) {
  if (null == a) return null;
  if ("function" === typeof a) return a.displayName || a.name || null;
  if ("string" === typeof a) return a;

  switch (a) {
    case ab:
      return "Fragment";

    case $a:
      return "Portal";

    case cb:
      return "Profiler";

    case bb:
      return "StrictMode";

    case hb:
      return "Suspense";

    case ib:
      return "SuspenseList";
  }

  if ("object" === typeof a) switch (a.$$typeof) {
    case eb:
      return "Context.Consumer";

    case db:
      return "Context.Provider";

    case gb:
      var b = a.render;
      b = b.displayName || b.name || "";
      return a.displayName || ("" !== b ? "ForwardRef(" + b + ")" : "ForwardRef");

    case jb:
      return pb(a.type);

    case lb:
      return pb(a.render);

    case kb:
      if (a = 1 === a._status ? a._result : null) return pb(a);
  }
  return null;
}

function qb(a) {
  var b = "";

  do {
    a: switch (a.tag) {
      case 3:
      case 4:
      case 6:
      case 7:
      case 10:
      case 9:
        var c = "";
        break a;

      default:
        var d = a._debugOwner,
            e = a._debugSource,
            f = pb(a.type);
        c = null;
        d && (c = pb(d.type));
        d = f;
        f = "";
        e ? f = " (at " + e.fileName.replace(Ya, "") + ":" + e.lineNumber + ")" : c && (f = " (created by " + c + ")");
        c = "\n    in " + (d || "Unknown") + f;
    }

    b += c;
    a = a["return"];
  } while (a);

  return b;
}

function rb(a) {
  switch (typeof a) {
    case "boolean":
    case "number":
    case "object":
    case "string":
    case "undefined":
      return a;

    default:
      return "";
  }
}

function sb(a) {
  var b = a.type;
  return (a = a.nodeName) && "input" === a.toLowerCase() && ("checkbox" === b || "radio" === b);
}

function tb(a) {
  var b = sb(a) ? "checked" : "value",
      c = Object.getOwnPropertyDescriptor(a.constructor.prototype, b),
      d = "" + a[b];

  if (!a.hasOwnProperty(b) && "undefined" !== typeof c && "function" === typeof c.get && "function" === typeof c.set) {
    var e = c.get,
        f = c.set;
    Object.defineProperty(a, b, {
      configurable: !0,
      get: function get() {
        return e.call(this);
      },
      set: function set(a) {
        d = "" + a;
        f.call(this, a);
      }
    });
    Object.defineProperty(a, b, {
      enumerable: c.enumerable
    });
    return {
      getValue: function getValue() {
        return d;
      },
      setValue: function setValue(a) {
        d = "" + a;
      },
      stopTracking: function stopTracking() {
        a._valueTracker = null;
        delete a[b];
      }
    };
  }
}

function xb(a) {
  a._valueTracker || (a._valueTracker = tb(a));
}

function yb(a) {
  if (!a) return !1;
  var b = a._valueTracker;
  if (!b) return !0;
  var c = b.getValue();
  var d = "";
  a && (d = sb(a) ? a.checked ? "true" : "false" : a.value);
  a = d;
  return a !== c ? (b.setValue(a), !0) : !1;
}

function zb(a, b) {
  var c = b.checked;
  return objectAssign({}, b, {
    defaultChecked: void 0,
    defaultValue: void 0,
    value: void 0,
    checked: null != c ? c : a._wrapperState.initialChecked
  });
}

function Ab(a, b) {
  var c = null == b.defaultValue ? "" : b.defaultValue,
      d = null != b.checked ? b.checked : b.defaultChecked;
  c = rb(null != b.value ? b.value : c);
  a._wrapperState = {
    initialChecked: d,
    initialValue: c,
    controlled: "checkbox" === b.type || "radio" === b.type ? null != b.checked : null != b.value
  };
}

function Bb(a, b) {
  b = b.checked;
  null != b && Xa(a, "checked", b, !1);
}

function Cb(a, b) {
  Bb(a, b);
  var c = rb(b.value),
      d = b.type;
  if (null != c) {
    if ("number" === d) {
      if (0 === c && "" === a.value || a.value != c) a.value = "" + c;
    } else a.value !== "" + c && (a.value = "" + c);
  } else if ("submit" === d || "reset" === d) {
    a.removeAttribute("value");
    return;
  }
  b.hasOwnProperty("value") ? Db(a, b.type, c) : b.hasOwnProperty("defaultValue") && Db(a, b.type, rb(b.defaultValue));
  null == b.checked && null != b.defaultChecked && (a.defaultChecked = !!b.defaultChecked);
}

function Eb(a, b, c) {
  if (b.hasOwnProperty("value") || b.hasOwnProperty("defaultValue")) {
    var d = b.type;
    if (!("submit" !== d && "reset" !== d || void 0 !== b.value && null !== b.value)) return;
    b = "" + a._wrapperState.initialValue;
    c || b === a.value || (a.value = b);
    a.defaultValue = b;
  }

  c = a.name;
  "" !== c && (a.name = "");
  a.defaultChecked = !!a._wrapperState.initialChecked;
  "" !== c && (a.name = c);
}

function Db(a, b, c) {
  if ("number" !== b || a.ownerDocument.activeElement !== a) null == c ? a.defaultValue = "" + a._wrapperState.initialValue : a.defaultValue !== "" + c && (a.defaultValue = "" + c);
}

function Fb(a) {
  var b = "";
  React.Children.forEach(a, function (a) {
    null != a && (b += a);
  });
  return b;
}

function Gb(a, b) {
  a = objectAssign({
    children: void 0
  }, b);
  if (b = Fb(b.children)) a.children = b;
  return a;
}

function Hb(a, b, c, d) {
  a = a.options;

  if (b) {
    b = {};

    for (var e = 0; e < c.length; e++) {
      b["$" + c[e]] = !0;
    }

    for (c = 0; c < a.length; c++) {
      e = b.hasOwnProperty("$" + a[c].value), a[c].selected !== e && (a[c].selected = e), e && d && (a[c].defaultSelected = !0);
    }
  } else {
    c = "" + rb(c);
    b = null;

    for (e = 0; e < a.length; e++) {
      if (a[e].value === c) {
        a[e].selected = !0;
        d && (a[e].defaultSelected = !0);
        return;
      }

      null !== b || a[e].disabled || (b = a[e]);
    }

    null !== b && (b.selected = !0);
  }
}

function Ib(a, b) {
  if (null != b.dangerouslySetInnerHTML) throw Error(u(91));
  return objectAssign({}, b, {
    value: void 0,
    defaultValue: void 0,
    children: "" + a._wrapperState.initialValue
  });
}

function Jb(a, b) {
  var c = b.value;

  if (null == c) {
    c = b.children;
    b = b.defaultValue;

    if (null != c) {
      if (null != b) throw Error(u(92));

      if (Array.isArray(c)) {
        if (!(1 >= c.length)) throw Error(u(93));
        c = c[0];
      }

      b = c;
    }

    null == b && (b = "");
    c = b;
  }

  a._wrapperState = {
    initialValue: rb(c)
  };
}

function Kb(a, b) {
  var c = rb(b.value),
      d = rb(b.defaultValue);
  null != c && (c = "" + c, c !== a.value && (a.value = c), null == b.defaultValue && a.defaultValue !== c && (a.defaultValue = c));
  null != d && (a.defaultValue = "" + d);
}

function Lb(a) {
  var b = a.textContent;
  b === a._wrapperState.initialValue && "" !== b && null !== b && (a.value = b);
}

var Mb = {
  html: "http://www.w3.org/1999/xhtml",
  mathml: "http://www.w3.org/1998/Math/MathML",
  svg: "http://www.w3.org/2000/svg"
};

function Nb(a) {
  switch (a) {
    case "svg":
      return "http://www.w3.org/2000/svg";

    case "math":
      return "http://www.w3.org/1998/Math/MathML";

    default:
      return "http://www.w3.org/1999/xhtml";
  }
}

function Ob(a, b) {
  return null == a || "http://www.w3.org/1999/xhtml" === a ? Nb(b) : "http://www.w3.org/2000/svg" === a && "foreignObject" === b ? "http://www.w3.org/1999/xhtml" : a;
}

var Pb,
    Qb = function (a) {
  return "undefined" !== typeof MSApp && MSApp.execUnsafeLocalFunction ? function (b, c, d, e) {
    MSApp.execUnsafeLocalFunction(function () {
      return a(b, c, d, e);
    });
  } : a;
}(function (a, b) {
  if (a.namespaceURI !== Mb.svg || "innerHTML" in a) a.innerHTML = b;else {
    Pb = Pb || document.createElement("div");
    Pb.innerHTML = "<svg>" + b.valueOf().toString() + "</svg>";

    for (b = Pb.firstChild; a.firstChild;) {
      a.removeChild(a.firstChild);
    }

    for (; b.firstChild;) {
      a.appendChild(b.firstChild);
    }
  }
});

function Rb(a, b) {
  if (b) {
    var c = a.firstChild;

    if (c && c === a.lastChild && 3 === c.nodeType) {
      c.nodeValue = b;
      return;
    }
  }

  a.textContent = b;
}

function Sb(a, b) {
  var c = {};
  c[a.toLowerCase()] = b.toLowerCase();
  c["Webkit" + a] = "webkit" + b;
  c["Moz" + a] = "moz" + b;
  return c;
}

var Tb = {
  animationend: Sb("Animation", "AnimationEnd"),
  animationiteration: Sb("Animation", "AnimationIteration"),
  animationstart: Sb("Animation", "AnimationStart"),
  transitionend: Sb("Transition", "TransitionEnd")
},
    Ub = {},
    Vb = {};
ya && (Vb = document.createElement("div").style, "AnimationEvent" in window || (delete Tb.animationend.animation, delete Tb.animationiteration.animation, delete Tb.animationstart.animation), "TransitionEvent" in window || delete Tb.transitionend.transition);

function Wb(a) {
  if (Ub[a]) return Ub[a];
  if (!Tb[a]) return a;
  var b = Tb[a],
      c;

  for (c in b) {
    if (b.hasOwnProperty(c) && c in Vb) return Ub[a] = b[c];
  }

  return a;
}

var Xb = Wb("animationend"),
    Yb = Wb("animationiteration"),
    Zb = Wb("animationstart"),
    $b = Wb("transitionend"),
    ac = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),
    bc = new ("function" === typeof WeakMap ? WeakMap : Map)();

function cc(a) {
  var b = bc.get(a);
  void 0 === b && (b = new Map(), bc.set(a, b));
  return b;
}

function dc(a) {
  var b = a,
      c = a;
  if (a.alternate) for (; b["return"];) {
    b = b["return"];
  } else {
    a = b;

    do {
      b = a, 0 !== (b.effectTag & 1026) && (c = b["return"]), a = b["return"];
    } while (a);
  }
  return 3 === b.tag ? c : null;
}

function ec(a) {
  if (13 === a.tag) {
    var b = a.memoizedState;
    null === b && (a = a.alternate, null !== a && (b = a.memoizedState));
    if (null !== b) return b.dehydrated;
  }

  return null;
}

function fc(a) {
  if (dc(a) !== a) throw Error(u(188));
}

function gc(a) {
  var b = a.alternate;

  if (!b) {
    b = dc(a);
    if (null === b) throw Error(u(188));
    return b !== a ? null : a;
  }

  for (var c = a, d = b;;) {
    var e = c["return"];
    if (null === e) break;
    var f = e.alternate;

    if (null === f) {
      d = e["return"];

      if (null !== d) {
        c = d;
        continue;
      }

      break;
    }

    if (e.child === f.child) {
      for (f = e.child; f;) {
        if (f === c) return fc(e), a;
        if (f === d) return fc(e), b;
        f = f.sibling;
      }

      throw Error(u(188));
    }

    if (c["return"] !== d["return"]) c = e, d = f;else {
      for (var g = !1, h = e.child; h;) {
        if (h === c) {
          g = !0;
          c = e;
          d = f;
          break;
        }

        if (h === d) {
          g = !0;
          d = e;
          c = f;
          break;
        }

        h = h.sibling;
      }

      if (!g) {
        for (h = f.child; h;) {
          if (h === c) {
            g = !0;
            c = f;
            d = e;
            break;
          }

          if (h === d) {
            g = !0;
            d = f;
            c = e;
            break;
          }

          h = h.sibling;
        }

        if (!g) throw Error(u(189));
      }
    }
    if (c.alternate !== d) throw Error(u(190));
  }

  if (3 !== c.tag) throw Error(u(188));
  return c.stateNode.current === c ? a : b;
}

function hc(a) {
  a = gc(a);
  if (!a) return null;

  for (var b = a;;) {
    if (5 === b.tag || 6 === b.tag) return b;
    if (b.child) b.child["return"] = b, b = b.child;else {
      if (b === a) break;

      for (; !b.sibling;) {
        if (!b["return"] || b["return"] === a) return null;
        b = b["return"];
      }

      b.sibling["return"] = b["return"];
      b = b.sibling;
    }
  }

  return null;
}

function ic(a, b) {
  if (null == b) throw Error(u(30));
  if (null == a) return b;

  if (Array.isArray(a)) {
    if (Array.isArray(b)) return a.push.apply(a, b), a;
    a.push(b);
    return a;
  }

  return Array.isArray(b) ? [a].concat(b) : [a, b];
}

function jc(a, b, c) {
  Array.isArray(a) ? a.forEach(b, c) : a && b.call(c, a);
}

var kc = null;

function lc(a) {
  if (a) {
    var b = a._dispatchListeners,
        c = a._dispatchInstances;
    if (Array.isArray(b)) for (var d = 0; d < b.length && !a.isPropagationStopped(); d++) {
      oa(a, b[d], c[d]);
    } else b && oa(a, b, c);
    a._dispatchListeners = null;
    a._dispatchInstances = null;
    a.isPersistent() || a.constructor.release(a);
  }
}

function mc(a) {
  null !== a && (kc = ic(kc, a));
  a = kc;
  kc = null;

  if (a) {
    jc(a, lc);
    if (kc) throw Error(u(95));
    if (fa) throw a = ha, fa = !1, ha = null, a;
  }
}

function nc(a) {
  a = a.target || a.srcElement || window;
  a.correspondingUseElement && (a = a.correspondingUseElement);
  return 3 === a.nodeType ? a.parentNode : a;
}

function oc(a) {
  if (!ya) return !1;
  a = "on" + a;
  var b = (a in document);
  b || (b = document.createElement("div"), b.setAttribute(a, "return;"), b = "function" === typeof b[a]);
  return b;
}

var pc = [];

function qc(a) {
  a.topLevelType = null;
  a.nativeEvent = null;
  a.targetInst = null;
  a.ancestors.length = 0;
  10 > pc.length && pc.push(a);
}

function rc(a, b, c, d) {
  if (pc.length) {
    var e = pc.pop();
    e.topLevelType = a;
    e.eventSystemFlags = d;
    e.nativeEvent = b;
    e.targetInst = c;
    return e;
  }

  return {
    topLevelType: a,
    eventSystemFlags: d,
    nativeEvent: b,
    targetInst: c,
    ancestors: []
  };
}

function sc(a) {
  var b = a.targetInst,
      c = b;

  do {
    if (!c) {
      a.ancestors.push(c);
      break;
    }

    var d = c;
    if (3 === d.tag) d = d.stateNode.containerInfo;else {
      for (; d["return"];) {
        d = d["return"];
      }

      d = 3 !== d.tag ? null : d.stateNode.containerInfo;
    }
    if (!d) break;
    b = c.tag;
    5 !== b && 6 !== b || a.ancestors.push(c);
    c = tc(d);
  } while (c);

  for (c = 0; c < a.ancestors.length; c++) {
    b = a.ancestors[c];
    var e = nc(a.nativeEvent);
    d = a.topLevelType;
    var f = a.nativeEvent,
        g = a.eventSystemFlags;
    0 === c && (g |= 64);

    for (var h = null, k = 0; k < sa.length; k++) {
      var l = sa[k];
      l && (l = l.extractEvents(d, b, f, e, g)) && (h = ic(h, l));
    }

    mc(h);
  }
}

function uc(a, b, c) {
  if (!c.has(a)) {
    switch (a) {
      case "scroll":
        vc(b, "scroll", !0);
        break;

      case "focus":
      case "blur":
        vc(b, "focus", !0);
        vc(b, "blur", !0);
        c.set("blur", null);
        c.set("focus", null);
        break;

      case "cancel":
      case "close":
        oc(a) && vc(b, a, !0);
        break;

      case "invalid":
      case "submit":
      case "reset":
        break;

      default:
        -1 === ac.indexOf(a) && F(a, b);
    }

    c.set(a, null);
  }
}

var wc,
    xc,
    yc,
    zc = !1,
    Ac = [],
    Bc = null,
    Cc = null,
    Dc = null,
    Ec = new Map(),
    Fc = new Map(),
    Gc = [],
    Hc = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput close cancel copy cut paste click change contextmenu reset submit".split(" "),
    Ic = "focus blur dragenter dragleave mouseover mouseout pointerover pointerout gotpointercapture lostpointercapture".split(" ");

function Jc(a, b) {
  var c = cc(b);
  Hc.forEach(function (a) {
    uc(a, b, c);
  });
  Ic.forEach(function (a) {
    uc(a, b, c);
  });
}

function Kc(a, b, c, d, e) {
  return {
    blockedOn: a,
    topLevelType: b,
    eventSystemFlags: c | 32,
    nativeEvent: e,
    container: d
  };
}

function Lc(a, b) {
  switch (a) {
    case "focus":
    case "blur":
      Bc = null;
      break;

    case "dragenter":
    case "dragleave":
      Cc = null;
      break;

    case "mouseover":
    case "mouseout":
      Dc = null;
      break;

    case "pointerover":
    case "pointerout":
      Ec["delete"](b.pointerId);
      break;

    case "gotpointercapture":
    case "lostpointercapture":
      Fc["delete"](b.pointerId);
  }
}

function Mc(a, b, c, d, e, f) {
  if (null === a || a.nativeEvent !== f) return a = Kc(b, c, d, e, f), null !== b && (b = Nc(b), null !== b && xc(b)), a;
  a.eventSystemFlags |= d;
  return a;
}

function Oc(a, b, c, d, e) {
  switch (b) {
    case "focus":
      return Bc = Mc(Bc, a, b, c, d, e), !0;

    case "dragenter":
      return Cc = Mc(Cc, a, b, c, d, e), !0;

    case "mouseover":
      return Dc = Mc(Dc, a, b, c, d, e), !0;

    case "pointerover":
      var f = e.pointerId;
      Ec.set(f, Mc(Ec.get(f) || null, a, b, c, d, e));
      return !0;

    case "gotpointercapture":
      return f = e.pointerId, Fc.set(f, Mc(Fc.get(f) || null, a, b, c, d, e)), !0;
  }

  return !1;
}

function Pc(a) {
  var b = tc(a.target);

  if (null !== b) {
    var c = dc(b);
    if (null !== c) if (b = c.tag, 13 === b) {
      if (b = ec(c), null !== b) {
        a.blockedOn = b;
        scheduler.unstable_runWithPriority(a.priority, function () {
          yc(c);
        });
        return;
      }
    } else if (3 === b && c.stateNode.hydrate) {
      a.blockedOn = 3 === c.tag ? c.stateNode.containerInfo : null;
      return;
    }
  }

  a.blockedOn = null;
}

function Qc(a) {
  if (null !== a.blockedOn) return !1;
  var b = Rc(a.topLevelType, a.eventSystemFlags, a.container, a.nativeEvent);

  if (null !== b) {
    var c = Nc(b);
    null !== c && xc(c);
    a.blockedOn = b;
    return !1;
  }

  return !0;
}

function Sc(a, b, c) {
  Qc(a) && c["delete"](b);
}

function Tc() {
  for (zc = !1; 0 < Ac.length;) {
    var a = Ac[0];

    if (null !== a.blockedOn) {
      a = Nc(a.blockedOn);
      null !== a && wc(a);
      break;
    }

    var b = Rc(a.topLevelType, a.eventSystemFlags, a.container, a.nativeEvent);
    null !== b ? a.blockedOn = b : Ac.shift();
  }

  null !== Bc && Qc(Bc) && (Bc = null);
  null !== Cc && Qc(Cc) && (Cc = null);
  null !== Dc && Qc(Dc) && (Dc = null);
  Ec.forEach(Sc);
  Fc.forEach(Sc);
}

function Uc(a, b) {
  a.blockedOn === b && (a.blockedOn = null, zc || (zc = !0, scheduler.unstable_scheduleCallback(scheduler.unstable_NormalPriority, Tc)));
}

function Vc(a) {
  function b(b) {
    return Uc(b, a);
  }

  if (0 < Ac.length) {
    Uc(Ac[0], a);

    for (var c = 1; c < Ac.length; c++) {
      var d = Ac[c];
      d.blockedOn === a && (d.blockedOn = null);
    }
  }

  null !== Bc && Uc(Bc, a);
  null !== Cc && Uc(Cc, a);
  null !== Dc && Uc(Dc, a);
  Ec.forEach(b);
  Fc.forEach(b);

  for (c = 0; c < Gc.length; c++) {
    d = Gc[c], d.blockedOn === a && (d.blockedOn = null);
  }

  for (; 0 < Gc.length && (c = Gc[0], null === c.blockedOn);) {
    Pc(c), null === c.blockedOn && Gc.shift();
  }
}

var Wc = {},
    Yc = new Map(),
    Zc = new Map(),
    $c = ["abort", "abort", Xb, "animationEnd", Yb, "animationIteration", Zb, "animationStart", "canplay", "canPlay", "canplaythrough", "canPlayThrough", "durationchange", "durationChange", "emptied", "emptied", "encrypted", "encrypted", "ended", "ended", "error", "error", "gotpointercapture", "gotPointerCapture", "load", "load", "loadeddata", "loadedData", "loadedmetadata", "loadedMetadata", "loadstart", "loadStart", "lostpointercapture", "lostPointerCapture", "playing", "playing", "progress", "progress", "seeking", "seeking", "stalled", "stalled", "suspend", "suspend", "timeupdate", "timeUpdate", $b, "transitionEnd", "waiting", "waiting"];

function ad(a, b) {
  for (var c = 0; c < a.length; c += 2) {
    var d = a[c],
        e = a[c + 1],
        f = "on" + (e[0].toUpperCase() + e.slice(1));
    f = {
      phasedRegistrationNames: {
        bubbled: f,
        captured: f + "Capture"
      },
      dependencies: [d],
      eventPriority: b
    };
    Zc.set(d, b);
    Yc.set(d, f);
    Wc[e] = f;
  }
}

ad("blur blur cancel cancel click click close close contextmenu contextMenu copy copy cut cut auxclick auxClick dblclick doubleClick dragend dragEnd dragstart dragStart drop drop focus focus input input invalid invalid keydown keyDown keypress keyPress keyup keyUp mousedown mouseDown mouseup mouseUp paste paste pause pause play play pointercancel pointerCancel pointerdown pointerDown pointerup pointerUp ratechange rateChange reset reset seeked seeked submit submit touchcancel touchCancel touchend touchEnd touchstart touchStart volumechange volumeChange".split(" "), 0);
ad("drag drag dragenter dragEnter dragexit dragExit dragleave dragLeave dragover dragOver mousemove mouseMove mouseout mouseOut mouseover mouseOver pointermove pointerMove pointerout pointerOut pointerover pointerOver scroll scroll toggle toggle touchmove touchMove wheel wheel".split(" "), 1);
ad($c, 2);

for (var bd = "change selectionchange textInput compositionstart compositionend compositionupdate".split(" "), cd = 0; cd < bd.length; cd++) {
  Zc.set(bd[cd], 0);
}

var dd = scheduler.unstable_UserBlockingPriority,
    ed = scheduler.unstable_runWithPriority,
    fd = !0;

function F(a, b) {
  vc(b, a, !1);
}

function vc(a, b, c) {
  var d = Zc.get(b);

  switch (void 0 === d ? 2 : d) {
    case 0:
      d = gd.bind(null, b, 1, a);
      break;

    case 1:
      d = hd.bind(null, b, 1, a);
      break;

    default:
      d = id.bind(null, b, 1, a);
  }

  c ? a.addEventListener(b, d, !0) : a.addEventListener(b, d, !1);
}

function gd(a, b, c, d) {
  Ja || Ha();
  var e = id,
      f = Ja;
  Ja = !0;

  try {
    Ga(e, a, b, c, d);
  } finally {
    (Ja = f) || La();
  }
}

function hd(a, b, c, d) {
  ed(dd, id.bind(null, a, b, c, d));
}

function id(a, b, c, d) {
  if (fd) if (0 < Ac.length && -1 < Hc.indexOf(a)) a = Kc(null, a, b, c, d), Ac.push(a);else {
    var e = Rc(a, b, c, d);
    if (null === e) Lc(a, d);else if (-1 < Hc.indexOf(a)) a = Kc(e, a, b, c, d), Ac.push(a);else if (!Oc(e, a, b, c, d)) {
      Lc(a, d);
      a = rc(a, d, null, b);

      try {
        Ma(sc, a);
      } finally {
        qc(a);
      }
    }
  }
}

function Rc(a, b, c, d) {
  c = nc(d);
  c = tc(c);

  if (null !== c) {
    var e = dc(c);
    if (null === e) c = null;else {
      var f = e.tag;

      if (13 === f) {
        c = ec(e);
        if (null !== c) return c;
        c = null;
      } else if (3 === f) {
        if (e.stateNode.hydrate) return 3 === e.tag ? e.stateNode.containerInfo : null;
        c = null;
      } else e !== c && (c = null);
    }
  }

  a = rc(a, d, c, b);

  try {
    Ma(sc, a);
  } finally {
    qc(a);
  }

  return null;
}

var jd = {
  animationIterationCount: !0,
  borderImageOutset: !0,
  borderImageSlice: !0,
  borderImageWidth: !0,
  boxFlex: !0,
  boxFlexGroup: !0,
  boxOrdinalGroup: !0,
  columnCount: !0,
  columns: !0,
  flex: !0,
  flexGrow: !0,
  flexPositive: !0,
  flexShrink: !0,
  flexNegative: !0,
  flexOrder: !0,
  gridArea: !0,
  gridRow: !0,
  gridRowEnd: !0,
  gridRowSpan: !0,
  gridRowStart: !0,
  gridColumn: !0,
  gridColumnEnd: !0,
  gridColumnSpan: !0,
  gridColumnStart: !0,
  fontWeight: !0,
  lineClamp: !0,
  lineHeight: !0,
  opacity: !0,
  order: !0,
  orphans: !0,
  tabSize: !0,
  widows: !0,
  zIndex: !0,
  zoom: !0,
  fillOpacity: !0,
  floodOpacity: !0,
  stopOpacity: !0,
  strokeDasharray: !0,
  strokeDashoffset: !0,
  strokeMiterlimit: !0,
  strokeOpacity: !0,
  strokeWidth: !0
},
    kd = ["Webkit", "ms", "Moz", "O"];
Object.keys(jd).forEach(function (a) {
  kd.forEach(function (b) {
    b = b + a.charAt(0).toUpperCase() + a.substring(1);
    jd[b] = jd[a];
  });
});

function ld(a, b, c) {
  return null == b || "boolean" === typeof b || "" === b ? "" : c || "number" !== typeof b || 0 === b || jd.hasOwnProperty(a) && jd[a] ? ("" + b).trim() : b + "px";
}

function md(a, b) {
  a = a.style;

  for (var c in b) {
    if (b.hasOwnProperty(c)) {
      var d = 0 === c.indexOf("--"),
          e = ld(c, b[c], d);
      "float" === c && (c = "cssFloat");
      d ? a.setProperty(c, e) : a[c] = e;
    }
  }
}

var nd = objectAssign({
  menuitem: !0
}, {
  area: !0,
  base: !0,
  br: !0,
  col: !0,
  embed: !0,
  hr: !0,
  img: !0,
  input: !0,
  keygen: !0,
  link: !0,
  meta: !0,
  param: !0,
  source: !0,
  track: !0,
  wbr: !0
});

function od(a, b) {
  if (b) {
    if (nd[a] && (null != b.children || null != b.dangerouslySetInnerHTML)) throw Error(u(137, a, ""));

    if (null != b.dangerouslySetInnerHTML) {
      if (null != b.children) throw Error(u(60));
      if (!("object" === typeof b.dangerouslySetInnerHTML && "__html" in b.dangerouslySetInnerHTML)) throw Error(u(61));
    }

    if (null != b.style && "object" !== typeof b.style) throw Error(u(62, ""));
  }
}

function pd(a, b) {
  if (-1 === a.indexOf("-")) return "string" === typeof b.is;

  switch (a) {
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      return !1;

    default:
      return !0;
  }
}

var qd = Mb.html;

function rd(a, b) {
  a = 9 === a.nodeType || 11 === a.nodeType ? a : a.ownerDocument;
  var c = cc(a);
  b = wa[b];

  for (var d = 0; d < b.length; d++) {
    uc(b[d], a, c);
  }
}

function sd() {}

function td(a) {
  a = a || ("undefined" !== typeof document ? document : void 0);
  if ("undefined" === typeof a) return null;

  try {
    return a.activeElement || a.body;
  } catch (b) {
    return a.body;
  }
}

function ud(a) {
  for (; a && a.firstChild;) {
    a = a.firstChild;
  }

  return a;
}

function vd(a, b) {
  var c = ud(a);
  a = 0;

  for (var d; c;) {
    if (3 === c.nodeType) {
      d = a + c.textContent.length;
      if (a <= b && d >= b) return {
        node: c,
        offset: b - a
      };
      a = d;
    }

    a: {
      for (; c;) {
        if (c.nextSibling) {
          c = c.nextSibling;
          break a;
        }

        c = c.parentNode;
      }

      c = void 0;
    }

    c = ud(c);
  }
}

function wd(a, b) {
  return a && b ? a === b ? !0 : a && 3 === a.nodeType ? !1 : b && 3 === b.nodeType ? wd(a, b.parentNode) : "contains" in a ? a.contains(b) : a.compareDocumentPosition ? !!(a.compareDocumentPosition(b) & 16) : !1 : !1;
}

function xd() {
  for (var a = window, b = td(); b instanceof a.HTMLIFrameElement;) {
    try {
      var c = "string" === typeof b.contentWindow.location.href;
    } catch (d) {
      c = !1;
    }

    if (c) a = b.contentWindow;else break;
    b = td(a.document);
  }

  return b;
}

function yd(a) {
  var b = a && a.nodeName && a.nodeName.toLowerCase();
  return b && ("input" === b && ("text" === a.type || "search" === a.type || "tel" === a.type || "url" === a.type || "password" === a.type) || "textarea" === b || "true" === a.contentEditable);
}

var zd = "$",
    Ad = "/$",
    Bd = "$?",
    Cd = "$!",
    Dd = null,
    Ed = null;

function Fd(a, b) {
  switch (a) {
    case "button":
    case "input":
    case "select":
    case "textarea":
      return !!b.autoFocus;
  }

  return !1;
}

function Gd(a, b) {
  return "textarea" === a || "option" === a || "noscript" === a || "string" === typeof b.children || "number" === typeof b.children || "object" === typeof b.dangerouslySetInnerHTML && null !== b.dangerouslySetInnerHTML && null != b.dangerouslySetInnerHTML.__html;
}

var Hd = "function" === typeof setTimeout ? setTimeout : void 0,
    Id = "function" === typeof clearTimeout ? clearTimeout : void 0;

function Jd(a) {
  for (; null != a; a = a.nextSibling) {
    var b = a.nodeType;
    if (1 === b || 3 === b) break;
  }

  return a;
}

function Kd(a) {
  a = a.previousSibling;

  for (var b = 0; a;) {
    if (8 === a.nodeType) {
      var c = a.data;

      if (c === zd || c === Cd || c === Bd) {
        if (0 === b) return a;
        b--;
      } else c === Ad && b++;
    }

    a = a.previousSibling;
  }

  return null;
}

var Ld = Math.random().toString(36).slice(2),
    Md = "__reactInternalInstance$" + Ld,
    Nd = "__reactEventHandlers$" + Ld,
    Od = "__reactContainere$" + Ld;

function tc(a) {
  var b = a[Md];
  if (b) return b;

  for (var c = a.parentNode; c;) {
    if (b = c[Od] || c[Md]) {
      c = b.alternate;
      if (null !== b.child || null !== c && null !== c.child) for (a = Kd(a); null !== a;) {
        if (c = a[Md]) return c;
        a = Kd(a);
      }
      return b;
    }

    a = c;
    c = a.parentNode;
  }

  return null;
}

function Nc(a) {
  a = a[Md] || a[Od];
  return !a || 5 !== a.tag && 6 !== a.tag && 13 !== a.tag && 3 !== a.tag ? null : a;
}

function Pd(a) {
  if (5 === a.tag || 6 === a.tag) return a.stateNode;
  throw Error(u(33));
}

function Qd(a) {
  return a[Nd] || null;
}

function Rd(a) {
  do {
    a = a["return"];
  } while (a && 5 !== a.tag);

  return a ? a : null;
}

function Sd(a, b) {
  var c = a.stateNode;
  if (!c) return null;
  var d = la(c);
  if (!d) return null;
  c = d[b];

  a: switch (b) {
    case "onClick":
    case "onClickCapture":
    case "onDoubleClick":
    case "onDoubleClickCapture":
    case "onMouseDown":
    case "onMouseDownCapture":
    case "onMouseMove":
    case "onMouseMoveCapture":
    case "onMouseUp":
    case "onMouseUpCapture":
    case "onMouseEnter":
      (d = !d.disabled) || (a = a.type, d = !("button" === a || "input" === a || "select" === a || "textarea" === a));
      a = !d;
      break a;

    default:
      a = !1;
  }

  if (a) return null;
  if (c && "function" !== typeof c) throw Error(u(231, b, typeof c));
  return c;
}

function Td(a, b, c) {
  if (b = Sd(a, c.dispatchConfig.phasedRegistrationNames[b])) c._dispatchListeners = ic(c._dispatchListeners, b), c._dispatchInstances = ic(c._dispatchInstances, a);
}

function Ud(a) {
  if (a && a.dispatchConfig.phasedRegistrationNames) {
    for (var b = a._targetInst, c = []; b;) {
      c.push(b), b = Rd(b);
    }

    for (b = c.length; 0 < b--;) {
      Td(c[b], "captured", a);
    }

    for (b = 0; b < c.length; b++) {
      Td(c[b], "bubbled", a);
    }
  }
}

function Vd(a, b, c) {
  a && c && c.dispatchConfig.registrationName && (b = Sd(a, c.dispatchConfig.registrationName)) && (c._dispatchListeners = ic(c._dispatchListeners, b), c._dispatchInstances = ic(c._dispatchInstances, a));
}

function Wd(a) {
  a && a.dispatchConfig.registrationName && Vd(a._targetInst, null, a);
}

function Xd(a) {
  jc(a, Ud);
}

var Yd = null,
    Zd = null,
    $d = null;

function ae() {
  if ($d) return $d;
  var a,
      b = Zd,
      c = b.length,
      d,
      e = "value" in Yd ? Yd.value : Yd.textContent,
      f = e.length;

  for (a = 0; a < c && b[a] === e[a]; a++) {
  }

  var g = c - a;

  for (d = 1; d <= g && b[c - d] === e[f - d]; d++) {
  }

  return $d = e.slice(a, 1 < d ? 1 - d : void 0);
}

function be() {
  return !0;
}

function ce() {
  return !1;
}

function G(a, b, c, d) {
  this.dispatchConfig = a;
  this._targetInst = b;
  this.nativeEvent = c;
  a = this.constructor.Interface;

  for (var e in a) {
    a.hasOwnProperty(e) && ((b = a[e]) ? this[e] = b(c) : "target" === e ? this.target = d : this[e] = c[e]);
  }

  this.isDefaultPrevented = (null != c.defaultPrevented ? c.defaultPrevented : !1 === c.returnValue) ? be : ce;
  this.isPropagationStopped = ce;
  return this;
}

objectAssign(G.prototype, {
  preventDefault: function preventDefault() {
    this.defaultPrevented = !0;
    var a = this.nativeEvent;
    a && (a.preventDefault ? a.preventDefault() : "unknown" !== typeof a.returnValue && (a.returnValue = !1), this.isDefaultPrevented = be);
  },
  stopPropagation: function stopPropagation() {
    var a = this.nativeEvent;
    a && (a.stopPropagation ? a.stopPropagation() : "unknown" !== typeof a.cancelBubble && (a.cancelBubble = !0), this.isPropagationStopped = be);
  },
  persist: function persist() {
    this.isPersistent = be;
  },
  isPersistent: ce,
  destructor: function destructor() {
    var a = this.constructor.Interface,
        b;

    for (b in a) {
      this[b] = null;
    }

    this.nativeEvent = this._targetInst = this.dispatchConfig = null;
    this.isPropagationStopped = this.isDefaultPrevented = ce;
    this._dispatchInstances = this._dispatchListeners = null;
  }
});
G.Interface = {
  type: null,
  target: null,
  currentTarget: function currentTarget() {
    return null;
  },
  eventPhase: null,
  bubbles: null,
  cancelable: null,
  timeStamp: function timeStamp(a) {
    return a.timeStamp || Date.now();
  },
  defaultPrevented: null,
  isTrusted: null
};

G.extend = function (a) {
  function b() {}

  function c() {
    return d.apply(this, arguments);
  }

  var d = this;
  b.prototype = d.prototype;
  var e = new b();
  objectAssign(e, c.prototype);
  c.prototype = e;
  c.prototype.constructor = c;
  c.Interface = objectAssign({}, d.Interface, a);
  c.extend = d.extend;
  de(c);
  return c;
};

de(G);

function ee(a, b, c, d) {
  if (this.eventPool.length) {
    var e = this.eventPool.pop();
    this.call(e, a, b, c, d);
    return e;
  }

  return new this(a, b, c, d);
}

function fe(a) {
  if (!(a instanceof this)) throw Error(u(279));
  a.destructor();
  10 > this.eventPool.length && this.eventPool.push(a);
}

function de(a) {
  a.eventPool = [];
  a.getPooled = ee;
  a.release = fe;
}

var ge = G.extend({
  data: null
}),
    he = G.extend({
  data: null
}),
    ie = [9, 13, 27, 32],
    je = ya && "CompositionEvent" in window,
    ke = null;
ya && "documentMode" in document && (ke = document.documentMode);
var le = ya && "TextEvent" in window && !ke,
    me = ya && (!je || ke && 8 < ke && 11 >= ke),
    ne = String.fromCharCode(32),
    oe = {
  beforeInput: {
    phasedRegistrationNames: {
      bubbled: "onBeforeInput",
      captured: "onBeforeInputCapture"
    },
    dependencies: ["compositionend", "keypress", "textInput", "paste"]
  },
  compositionEnd: {
    phasedRegistrationNames: {
      bubbled: "onCompositionEnd",
      captured: "onCompositionEndCapture"
    },
    dependencies: "blur compositionend keydown keypress keyup mousedown".split(" ")
  },
  compositionStart: {
    phasedRegistrationNames: {
      bubbled: "onCompositionStart",
      captured: "onCompositionStartCapture"
    },
    dependencies: "blur compositionstart keydown keypress keyup mousedown".split(" ")
  },
  compositionUpdate: {
    phasedRegistrationNames: {
      bubbled: "onCompositionUpdate",
      captured: "onCompositionUpdateCapture"
    },
    dependencies: "blur compositionupdate keydown keypress keyup mousedown".split(" ")
  }
},
    pe = !1;

function qe(a, b) {
  switch (a) {
    case "keyup":
      return -1 !== ie.indexOf(b.keyCode);

    case "keydown":
      return 229 !== b.keyCode;

    case "keypress":
    case "mousedown":
    case "blur":
      return !0;

    default:
      return !1;
  }
}

function re(a) {
  a = a.detail;
  return "object" === typeof a && "data" in a ? a.data : null;
}

var se = !1;

function te(a, b) {
  switch (a) {
    case "compositionend":
      return re(b);

    case "keypress":
      if (32 !== b.which) return null;
      pe = !0;
      return ne;

    case "textInput":
      return a = b.data, a === ne && pe ? null : a;

    default:
      return null;
  }
}

function ue(a, b) {
  if (se) return "compositionend" === a || !je && qe(a, b) ? (a = ae(), $d = Zd = Yd = null, se = !1, a) : null;

  switch (a) {
    case "paste":
      return null;

    case "keypress":
      if (!(b.ctrlKey || b.altKey || b.metaKey) || b.ctrlKey && b.altKey) {
        if (b["char"] && 1 < b["char"].length) return b["char"];
        if (b.which) return String.fromCharCode(b.which);
      }

      return null;

    case "compositionend":
      return me && "ko" !== b.locale ? null : b.data;

    default:
      return null;
  }
}

var ve = {
  eventTypes: oe,
  extractEvents: function extractEvents(a, b, c, d) {
    var e;
    if (je) b: {
      switch (a) {
        case "compositionstart":
          var f = oe.compositionStart;
          break b;

        case "compositionend":
          f = oe.compositionEnd;
          break b;

        case "compositionupdate":
          f = oe.compositionUpdate;
          break b;
      }

      f = void 0;
    } else se ? qe(a, c) && (f = oe.compositionEnd) : "keydown" === a && 229 === c.keyCode && (f = oe.compositionStart);
    f ? (me && "ko" !== c.locale && (se || f !== oe.compositionStart ? f === oe.compositionEnd && se && (e = ae()) : (Yd = d, Zd = "value" in Yd ? Yd.value : Yd.textContent, se = !0)), f = ge.getPooled(f, b, c, d), e ? f.data = e : (e = re(c), null !== e && (f.data = e)), Xd(f), e = f) : e = null;
    (a = le ? te(a, c) : ue(a, c)) ? (b = he.getPooled(oe.beforeInput, b, c, d), b.data = a, Xd(b)) : b = null;
    return null === e ? b : null === b ? e : [e, b];
  }
},
    we = {
  color: !0,
  date: !0,
  datetime: !0,
  "datetime-local": !0,
  email: !0,
  month: !0,
  number: !0,
  password: !0,
  range: !0,
  search: !0,
  tel: !0,
  text: !0,
  time: !0,
  url: !0,
  week: !0
};

function xe(a) {
  var b = a && a.nodeName && a.nodeName.toLowerCase();
  return "input" === b ? !!we[a.type] : "textarea" === b ? !0 : !1;
}

var ye = {
  change: {
    phasedRegistrationNames: {
      bubbled: "onChange",
      captured: "onChangeCapture"
    },
    dependencies: "blur change click focus input keydown keyup selectionchange".split(" ")
  }
};

function ze(a, b, c) {
  a = G.getPooled(ye.change, a, b, c);
  a.type = "change";
  Da(c);
  Xd(a);
  return a;
}

var Ae = null,
    Be = null;

function Ce(a) {
  mc(a);
}

function De(a) {
  var b = Pd(a);
  if (yb(b)) return a;
}

function Ee(a, b) {
  if ("change" === a) return b;
}

var Fe = !1;
ya && (Fe = oc("input") && (!document.documentMode || 9 < document.documentMode));

function Ge() {
  Ae && (Ae.detachEvent("onpropertychange", He), Be = Ae = null);
}

function He(a) {
  if ("value" === a.propertyName && De(Be)) if (a = ze(Be, a, nc(a)), Ja) mc(a);else {
    Ja = !0;

    try {
      Fa(Ce, a);
    } finally {
      Ja = !1, La();
    }
  }
}

function Ie(a, b, c) {
  "focus" === a ? (Ge(), Ae = b, Be = c, Ae.attachEvent("onpropertychange", He)) : "blur" === a && Ge();
}

function Je(a) {
  if ("selectionchange" === a || "keyup" === a || "keydown" === a) return De(Be);
}

function Ke(a, b) {
  if ("click" === a) return De(b);
}

function Le(a, b) {
  if ("input" === a || "change" === a) return De(b);
}

var Me = {
  eventTypes: ye,
  _isInputEventSupported: Fe,
  extractEvents: function extractEvents(a, b, c, d) {
    var e = b ? Pd(b) : window,
        f = e.nodeName && e.nodeName.toLowerCase();
    if ("select" === f || "input" === f && "file" === e.type) var g = Ee;else if (xe(e)) {
      if (Fe) g = Le;else {
        g = Je;
        var h = Ie;
      }
    } else (f = e.nodeName) && "input" === f.toLowerCase() && ("checkbox" === e.type || "radio" === e.type) && (g = Ke);
    if (g && (g = g(a, b))) return ze(g, c, d);
    h && h(a, e, b);
    "blur" === a && (a = e._wrapperState) && a.controlled && "number" === e.type && Db(e, "number", e.value);
  }
},
    Ne = G.extend({
  view: null,
  detail: null
}),
    Oe = {
  Alt: "altKey",
  Control: "ctrlKey",
  Meta: "metaKey",
  Shift: "shiftKey"
};

function Pe(a) {
  var b = this.nativeEvent;
  return b.getModifierState ? b.getModifierState(a) : (a = Oe[a]) ? !!b[a] : !1;
}

function Qe() {
  return Pe;
}

var Re = 0,
    Se = 0,
    Te = !1,
    Ue = !1,
    Ve = Ne.extend({
  screenX: null,
  screenY: null,
  clientX: null,
  clientY: null,
  pageX: null,
  pageY: null,
  ctrlKey: null,
  shiftKey: null,
  altKey: null,
  metaKey: null,
  getModifierState: Qe,
  button: null,
  buttons: null,
  relatedTarget: function relatedTarget(a) {
    return a.relatedTarget || (a.fromElement === a.srcElement ? a.toElement : a.fromElement);
  },
  movementX: function movementX(a) {
    if ("movementX" in a) return a.movementX;
    var b = Re;
    Re = a.screenX;
    return Te ? "mousemove" === a.type ? a.screenX - b : 0 : (Te = !0, 0);
  },
  movementY: function movementY(a) {
    if ("movementY" in a) return a.movementY;
    var b = Se;
    Se = a.screenY;
    return Ue ? "mousemove" === a.type ? a.screenY - b : 0 : (Ue = !0, 0);
  }
}),
    We = Ve.extend({
  pointerId: null,
  width: null,
  height: null,
  pressure: null,
  tangentialPressure: null,
  tiltX: null,
  tiltY: null,
  twist: null,
  pointerType: null,
  isPrimary: null
}),
    Xe = {
  mouseEnter: {
    registrationName: "onMouseEnter",
    dependencies: ["mouseout", "mouseover"]
  },
  mouseLeave: {
    registrationName: "onMouseLeave",
    dependencies: ["mouseout", "mouseover"]
  },
  pointerEnter: {
    registrationName: "onPointerEnter",
    dependencies: ["pointerout", "pointerover"]
  },
  pointerLeave: {
    registrationName: "onPointerLeave",
    dependencies: ["pointerout", "pointerover"]
  }
},
    Ye = {
  eventTypes: Xe,
  extractEvents: function extractEvents(a, b, c, d, e) {
    var f = "mouseover" === a || "pointerover" === a,
        g = "mouseout" === a || "pointerout" === a;
    if (f && 0 === (e & 32) && (c.relatedTarget || c.fromElement) || !g && !f) return null;
    f = d.window === d ? d : (f = d.ownerDocument) ? f.defaultView || f.parentWindow : window;

    if (g) {
      if (g = b, b = (b = c.relatedTarget || c.toElement) ? tc(b) : null, null !== b) {
        var h = dc(b);
        if (b !== h || 5 !== b.tag && 6 !== b.tag) b = null;
      }
    } else g = null;

    if (g === b) return null;

    if ("mouseout" === a || "mouseover" === a) {
      var k = Ve;
      var l = Xe.mouseLeave;
      var m = Xe.mouseEnter;
      var p = "mouse";
    } else if ("pointerout" === a || "pointerover" === a) k = We, l = Xe.pointerLeave, m = Xe.pointerEnter, p = "pointer";

    a = null == g ? f : Pd(g);
    f = null == b ? f : Pd(b);
    l = k.getPooled(l, g, c, d);
    l.type = p + "leave";
    l.target = a;
    l.relatedTarget = f;
    c = k.getPooled(m, b, c, d);
    c.type = p + "enter";
    c.target = f;
    c.relatedTarget = a;
    d = g;
    p = b;
    if (d && p) a: {
      k = d;
      m = p;
      g = 0;

      for (a = k; a; a = Rd(a)) {
        g++;
      }

      a = 0;

      for (b = m; b; b = Rd(b)) {
        a++;
      }

      for (; 0 < g - a;) {
        k = Rd(k), g--;
      }

      for (; 0 < a - g;) {
        m = Rd(m), a--;
      }

      for (; g--;) {
        if (k === m || k === m.alternate) break a;
        k = Rd(k);
        m = Rd(m);
      }

      k = null;
    } else k = null;
    m = k;

    for (k = []; d && d !== m;) {
      g = d.alternate;
      if (null !== g && g === m) break;
      k.push(d);
      d = Rd(d);
    }

    for (d = []; p && p !== m;) {
      g = p.alternate;
      if (null !== g && g === m) break;
      d.push(p);
      p = Rd(p);
    }

    for (p = 0; p < k.length; p++) {
      Vd(k[p], "bubbled", l);
    }

    for (p = d.length; 0 < p--;) {
      Vd(d[p], "captured", c);
    }

    return 0 === (e & 64) ? [l] : [l, c];
  }
};

function Ze(a, b) {
  return a === b && (0 !== a || 1 / a === 1 / b) || a !== a && b !== b;
}

var $e = "function" === typeof Object.is ? Object.is : Ze,
    af = Object.prototype.hasOwnProperty;

function bf(a, b) {
  if ($e(a, b)) return !0;
  if ("object" !== typeof a || null === a || "object" !== typeof b || null === b) return !1;
  var c = Object.keys(a),
      d = Object.keys(b);
  if (c.length !== d.length) return !1;

  for (d = 0; d < c.length; d++) {
    if (!af.call(b, c[d]) || !$e(a[c[d]], b[c[d]])) return !1;
  }

  return !0;
}

var cf = ya && "documentMode" in document && 11 >= document.documentMode,
    df = {
  select: {
    phasedRegistrationNames: {
      bubbled: "onSelect",
      captured: "onSelectCapture"
    },
    dependencies: "blur contextmenu dragend focus keydown keyup mousedown mouseup selectionchange".split(" ")
  }
},
    ef = null,
    ff = null,
    gf = null,
    hf = !1;

function jf(a, b) {
  var c = b.window === b ? b.document : 9 === b.nodeType ? b : b.ownerDocument;
  if (hf || null == ef || ef !== td(c)) return null;
  c = ef;
  "selectionStart" in c && yd(c) ? c = {
    start: c.selectionStart,
    end: c.selectionEnd
  } : (c = (c.ownerDocument && c.ownerDocument.defaultView || window).getSelection(), c = {
    anchorNode: c.anchorNode,
    anchorOffset: c.anchorOffset,
    focusNode: c.focusNode,
    focusOffset: c.focusOffset
  });
  return gf && bf(gf, c) ? null : (gf = c, a = G.getPooled(df.select, ff, a, b), a.type = "select", a.target = ef, Xd(a), a);
}

var kf = {
  eventTypes: df,
  extractEvents: function extractEvents(a, b, c, d, e, f) {
    e = f || (d.window === d ? d.document : 9 === d.nodeType ? d : d.ownerDocument);

    if (!(f = !e)) {
      a: {
        e = cc(e);
        f = wa.onSelect;

        for (var g = 0; g < f.length; g++) {
          if (!e.has(f[g])) {
            e = !1;
            break a;
          }
        }

        e = !0;
      }

      f = !e;
    }

    if (f) return null;
    e = b ? Pd(b) : window;

    switch (a) {
      case "focus":
        if (xe(e) || "true" === e.contentEditable) ef = e, ff = b, gf = null;
        break;

      case "blur":
        gf = ff = ef = null;
        break;

      case "mousedown":
        hf = !0;
        break;

      case "contextmenu":
      case "mouseup":
      case "dragend":
        return hf = !1, jf(c, d);

      case "selectionchange":
        if (cf) break;

      case "keydown":
      case "keyup":
        return jf(c, d);
    }

    return null;
  }
},
    lf = G.extend({
  animationName: null,
  elapsedTime: null,
  pseudoElement: null
}),
    mf = G.extend({
  clipboardData: function clipboardData(a) {
    return "clipboardData" in a ? a.clipboardData : window.clipboardData;
  }
}),
    nf = Ne.extend({
  relatedTarget: null
});

function of(a) {
  var b = a.keyCode;
  "charCode" in a ? (a = a.charCode, 0 === a && 13 === b && (a = 13)) : a = b;
  10 === a && (a = 13);
  return 32 <= a || 13 === a ? a : 0;
}

var pf = {
  Esc: "Escape",
  Spacebar: " ",
  Left: "ArrowLeft",
  Up: "ArrowUp",
  Right: "ArrowRight",
  Down: "ArrowDown",
  Del: "Delete",
  Win: "OS",
  Menu: "ContextMenu",
  Apps: "ContextMenu",
  Scroll: "ScrollLock",
  MozPrintableKey: "Unidentified"
},
    qf = {
  8: "Backspace",
  9: "Tab",
  12: "Clear",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  19: "Pause",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  45: "Insert",
  46: "Delete",
  112: "F1",
  113: "F2",
  114: "F3",
  115: "F4",
  116: "F5",
  117: "F6",
  118: "F7",
  119: "F8",
  120: "F9",
  121: "F10",
  122: "F11",
  123: "F12",
  144: "NumLock",
  145: "ScrollLock",
  224: "Meta"
},
    rf = Ne.extend({
  key: function key(a) {
    if (a.key) {
      var b = pf[a.key] || a.key;
      if ("Unidentified" !== b) return b;
    }

    return "keypress" === a.type ? (a = of(a), 13 === a ? "Enter" : String.fromCharCode(a)) : "keydown" === a.type || "keyup" === a.type ? qf[a.keyCode] || "Unidentified" : "";
  },
  location: null,
  ctrlKey: null,
  shiftKey: null,
  altKey: null,
  metaKey: null,
  repeat: null,
  locale: null,
  getModifierState: Qe,
  charCode: function charCode(a) {
    return "keypress" === a.type ? of(a) : 0;
  },
  keyCode: function keyCode(a) {
    return "keydown" === a.type || "keyup" === a.type ? a.keyCode : 0;
  },
  which: function which(a) {
    return "keypress" === a.type ? of(a) : "keydown" === a.type || "keyup" === a.type ? a.keyCode : 0;
  }
}),
    sf = Ve.extend({
  dataTransfer: null
}),
    tf = Ne.extend({
  touches: null,
  targetTouches: null,
  changedTouches: null,
  altKey: null,
  metaKey: null,
  ctrlKey: null,
  shiftKey: null,
  getModifierState: Qe
}),
    uf = G.extend({
  propertyName: null,
  elapsedTime: null,
  pseudoElement: null
}),
    vf = Ve.extend({
  deltaX: function deltaX(a) {
    return "deltaX" in a ? a.deltaX : "wheelDeltaX" in a ? -a.wheelDeltaX : 0;
  },
  deltaY: function deltaY(a) {
    return "deltaY" in a ? a.deltaY : "wheelDeltaY" in a ? -a.wheelDeltaY : "wheelDelta" in a ? -a.wheelDelta : 0;
  },
  deltaZ: null,
  deltaMode: null
}),
    wf = {
  eventTypes: Wc,
  extractEvents: function extractEvents(a, b, c, d) {
    var e = Yc.get(a);
    if (!e) return null;

    switch (a) {
      case "keypress":
        if (0 === of(c)) return null;

      case "keydown":
      case "keyup":
        a = rf;
        break;

      case "blur":
      case "focus":
        a = nf;
        break;

      case "click":
        if (2 === c.button) return null;

      case "auxclick":
      case "dblclick":
      case "mousedown":
      case "mousemove":
      case "mouseup":
      case "mouseout":
      case "mouseover":
      case "contextmenu":
        a = Ve;
        break;

      case "drag":
      case "dragend":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "dragstart":
      case "drop":
        a = sf;
        break;

      case "touchcancel":
      case "touchend":
      case "touchmove":
      case "touchstart":
        a = tf;
        break;

      case Xb:
      case Yb:
      case Zb:
        a = lf;
        break;

      case $b:
        a = uf;
        break;

      case "scroll":
        a = Ne;
        break;

      case "wheel":
        a = vf;
        break;

      case "copy":
      case "cut":
      case "paste":
        a = mf;
        break;

      case "gotpointercapture":
      case "lostpointercapture":
      case "pointercancel":
      case "pointerdown":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "pointerup":
        a = We;
        break;

      default:
        a = G;
    }

    b = a.getPooled(e, b, c, d);
    Xd(b);
    return b;
  }
};
if (pa) throw Error(u(101));
pa = Array.prototype.slice.call("ResponderEventPlugin SimpleEventPlugin EnterLeaveEventPlugin ChangeEventPlugin SelectEventPlugin BeforeInputEventPlugin".split(" "));
ra();
var xf = Nc;
la = Qd;
ma = xf;
na = Pd;
xa({
  SimpleEventPlugin: wf,
  EnterLeaveEventPlugin: Ye,
  ChangeEventPlugin: Me,
  SelectEventPlugin: kf,
  BeforeInputEventPlugin: ve
});
var yf = [],
    zf = -1;

function H(a) {
  0 > zf || (a.current = yf[zf], yf[zf] = null, zf--);
}

function I(a, b) {
  zf++;
  yf[zf] = a.current;
  a.current = b;
}

var Af = {},
    J = {
  current: Af
},
    K = {
  current: !1
},
    Bf = Af;

function Cf(a, b) {
  var c = a.type.contextTypes;
  if (!c) return Af;
  var d = a.stateNode;
  if (d && d.__reactInternalMemoizedUnmaskedChildContext === b) return d.__reactInternalMemoizedMaskedChildContext;
  var e = {},
      f;

  for (f in c) {
    e[f] = b[f];
  }

  d && (a = a.stateNode, a.__reactInternalMemoizedUnmaskedChildContext = b, a.__reactInternalMemoizedMaskedChildContext = e);
  return e;
}

function L(a) {
  a = a.childContextTypes;
  return null !== a && void 0 !== a;
}

function Df() {
  H(K);
  H(J);
}

function Ef(a, b, c) {
  if (J.current !== Af) throw Error(u(168));
  I(J, b);
  I(K, c);
}

function Ff(a, b, c) {
  var d = a.stateNode;
  a = b.childContextTypes;
  if ("function" !== typeof d.getChildContext) return c;
  d = d.getChildContext();

  for (var e in d) {
    if (!(e in a)) throw Error(u(108, pb(b) || "Unknown", e));
  }

  return objectAssign({}, c, {}, d);
}

function Gf(a) {
  a = (a = a.stateNode) && a.__reactInternalMemoizedMergedChildContext || Af;
  Bf = J.current;
  I(J, a);
  I(K, K.current);
  return !0;
}

function Hf(a, b, c) {
  var d = a.stateNode;
  if (!d) throw Error(u(169));
  c ? (a = Ff(a, b, Bf), d.__reactInternalMemoizedMergedChildContext = a, H(K), H(J), I(J, a)) : H(K);
  I(K, c);
}

var If = scheduler.unstable_runWithPriority,
    Jf = scheduler.unstable_scheduleCallback,
    Kf = scheduler.unstable_cancelCallback,
    Lf = scheduler.unstable_requestPaint,
    Mf = scheduler.unstable_now,
    Nf = scheduler.unstable_getCurrentPriorityLevel,
    Of = scheduler.unstable_ImmediatePriority,
    Pf = scheduler.unstable_UserBlockingPriority,
    Qf = scheduler.unstable_NormalPriority,
    Rf = scheduler.unstable_LowPriority,
    Sf = scheduler.unstable_IdlePriority,
    Tf = {},
    Uf = scheduler.unstable_shouldYield,
    Vf = void 0 !== Lf ? Lf : function () {},
    Wf = null,
    Xf = null,
    Yf = !1,
    Zf = Mf(),
    $f = 1E4 > Zf ? Mf : function () {
  return Mf() - Zf;
};

function ag() {
  switch (Nf()) {
    case Of:
      return 99;

    case Pf:
      return 98;

    case Qf:
      return 97;

    case Rf:
      return 96;

    case Sf:
      return 95;

    default:
      throw Error(u(332));
  }
}

function bg(a) {
  switch (a) {
    case 99:
      return Of;

    case 98:
      return Pf;

    case 97:
      return Qf;

    case 96:
      return Rf;

    case 95:
      return Sf;

    default:
      throw Error(u(332));
  }
}

function cg(a, b) {
  a = bg(a);
  return If(a, b);
}

function dg(a, b, c) {
  a = bg(a);
  return Jf(a, b, c);
}

function eg(a) {
  null === Wf ? (Wf = [a], Xf = Jf(Of, fg)) : Wf.push(a);
  return Tf;
}

function gg() {
  if (null !== Xf) {
    var a = Xf;
    Xf = null;
    Kf(a);
  }

  fg();
}

function fg() {
  if (!Yf && null !== Wf) {
    Yf = !0;
    var a = 0;

    try {
      var b = Wf;
      cg(99, function () {
        for (; a < b.length; a++) {
          var c = b[a];

          do {
            c = c(!0);
          } while (null !== c);
        }
      });
      Wf = null;
    } catch (c) {
      throw null !== Wf && (Wf = Wf.slice(a + 1)), Jf(Of, gg), c;
    } finally {
      Yf = !1;
    }
  }
}

function hg(a, b, c) {
  c /= 10;
  return 1073741821 - (((1073741821 - a + b / 10) / c | 0) + 1) * c;
}

function ig(a, b) {
  if (a && a.defaultProps) {
    b = objectAssign({}, b);
    a = a.defaultProps;

    for (var c in a) {
      void 0 === b[c] && (b[c] = a[c]);
    }
  }

  return b;
}

var jg = {
  current: null
},
    kg = null,
    lg = null,
    mg = null;

function ng() {
  mg = lg = kg = null;
}

function og(a) {
  var b = jg.current;
  H(jg);
  a.type._context._currentValue = b;
}

function pg(a, b) {
  for (; null !== a;) {
    var c = a.alternate;
    if (a.childExpirationTime < b) a.childExpirationTime = b, null !== c && c.childExpirationTime < b && (c.childExpirationTime = b);else if (null !== c && c.childExpirationTime < b) c.childExpirationTime = b;else break;
    a = a["return"];
  }
}

function qg(a, b) {
  kg = a;
  mg = lg = null;
  a = a.dependencies;
  null !== a && null !== a.firstContext && (a.expirationTime >= b && (rg = !0), a.firstContext = null);
}

function sg(a, b) {
  if (mg !== a && !1 !== b && 0 !== b) {
    if ("number" !== typeof b || 1073741823 === b) mg = a, b = 1073741823;
    b = {
      context: a,
      observedBits: b,
      next: null
    };

    if (null === lg) {
      if (null === kg) throw Error(u(308));
      lg = b;
      kg.dependencies = {
        expirationTime: 0,
        firstContext: b,
        responders: null
      };
    } else lg = lg.next = b;
  }

  return a._currentValue;
}

var tg = !1;

function ug(a) {
  a.updateQueue = {
    baseState: a.memoizedState,
    baseQueue: null,
    shared: {
      pending: null
    },
    effects: null
  };
}

function vg(a, b) {
  a = a.updateQueue;
  b.updateQueue === a && (b.updateQueue = {
    baseState: a.baseState,
    baseQueue: a.baseQueue,
    shared: a.shared,
    effects: a.effects
  });
}

function wg(a, b) {
  a = {
    expirationTime: a,
    suspenseConfig: b,
    tag: 0,
    payload: null,
    callback: null,
    next: null
  };
  return a.next = a;
}

function xg(a, b) {
  a = a.updateQueue;

  if (null !== a) {
    a = a.shared;
    var c = a.pending;
    null === c ? b.next = b : (b.next = c.next, c.next = b);
    a.pending = b;
  }
}

function yg(a, b) {
  var c = a.alternate;
  null !== c && vg(c, a);
  a = a.updateQueue;
  c = a.baseQueue;
  null === c ? (a.baseQueue = b.next = b, b.next = b) : (b.next = c.next, c.next = b);
}

function zg(a, b, c, d) {
  var e = a.updateQueue;
  tg = !1;
  var f = e.baseQueue,
      g = e.shared.pending;

  if (null !== g) {
    if (null !== f) {
      var h = f.next;
      f.next = g.next;
      g.next = h;
    }

    f = g;
    e.shared.pending = null;
    h = a.alternate;
    null !== h && (h = h.updateQueue, null !== h && (h.baseQueue = g));
  }

  if (null !== f) {
    h = f.next;
    var k = e.baseState,
        l = 0,
        m = null,
        p = null,
        x = null;

    if (null !== h) {
      var z = h;

      do {
        g = z.expirationTime;

        if (g < d) {
          var ca = {
            expirationTime: z.expirationTime,
            suspenseConfig: z.suspenseConfig,
            tag: z.tag,
            payload: z.payload,
            callback: z.callback,
            next: null
          };
          null === x ? (p = x = ca, m = k) : x = x.next = ca;
          g > l && (l = g);
        } else {
          null !== x && (x = x.next = {
            expirationTime: 1073741823,
            suspenseConfig: z.suspenseConfig,
            tag: z.tag,
            payload: z.payload,
            callback: z.callback,
            next: null
          });
          Ag(g, z.suspenseConfig);

          a: {
            var D = a,
                t = z;
            g = b;
            ca = c;

            switch (t.tag) {
              case 1:
                D = t.payload;

                if ("function" === typeof D) {
                  k = D.call(ca, k, g);
                  break a;
                }

                k = D;
                break a;

              case 3:
                D.effectTag = D.effectTag & -4097 | 64;

              case 0:
                D = t.payload;
                g = "function" === typeof D ? D.call(ca, k, g) : D;
                if (null === g || void 0 === g) break a;
                k = objectAssign({}, k, g);
                break a;

              case 2:
                tg = !0;
            }
          }

          null !== z.callback && (a.effectTag |= 32, g = e.effects, null === g ? e.effects = [z] : g.push(z));
        }

        z = z.next;
        if (null === z || z === h) if (g = e.shared.pending, null === g) break;else z = f.next = g.next, g.next = h, e.baseQueue = f = g, e.shared.pending = null;
      } while (1);
    }

    null === x ? m = k : x.next = p;
    e.baseState = m;
    e.baseQueue = x;
    Bg(l);
    a.expirationTime = l;
    a.memoizedState = k;
  }
}

function Cg(a, b, c) {
  a = b.effects;
  b.effects = null;
  if (null !== a) for (b = 0; b < a.length; b++) {
    var d = a[b],
        e = d.callback;

    if (null !== e) {
      d.callback = null;
      d = e;
      e = c;
      if ("function" !== typeof d) throw Error(u(191, d));
      d.call(e);
    }
  }
}

var Dg = Wa.ReactCurrentBatchConfig,
    Eg = new React.Component().refs;

function Fg(a, b, c, d) {
  b = a.memoizedState;
  c = c(d, b);
  c = null === c || void 0 === c ? b : objectAssign({}, b, c);
  a.memoizedState = c;
  0 === a.expirationTime && (a.updateQueue.baseState = c);
}

var Jg = {
  isMounted: function isMounted(a) {
    return (a = a._reactInternalFiber) ? dc(a) === a : !1;
  },
  enqueueSetState: function enqueueSetState(a, b, c) {
    a = a._reactInternalFiber;
    var d = Gg(),
        e = Dg.suspense;
    d = Hg(d, a, e);
    e = wg(d, e);
    e.payload = b;
    void 0 !== c && null !== c && (e.callback = c);
    xg(a, e);
    Ig(a, d);
  },
  enqueueReplaceState: function enqueueReplaceState(a, b, c) {
    a = a._reactInternalFiber;
    var d = Gg(),
        e = Dg.suspense;
    d = Hg(d, a, e);
    e = wg(d, e);
    e.tag = 1;
    e.payload = b;
    void 0 !== c && null !== c && (e.callback = c);
    xg(a, e);
    Ig(a, d);
  },
  enqueueForceUpdate: function enqueueForceUpdate(a, b) {
    a = a._reactInternalFiber;
    var c = Gg(),
        d = Dg.suspense;
    c = Hg(c, a, d);
    d = wg(c, d);
    d.tag = 2;
    void 0 !== b && null !== b && (d.callback = b);
    xg(a, d);
    Ig(a, c);
  }
};

function Kg(a, b, c, d, e, f, g) {
  a = a.stateNode;
  return "function" === typeof a.shouldComponentUpdate ? a.shouldComponentUpdate(d, f, g) : b.prototype && b.prototype.isPureReactComponent ? !bf(c, d) || !bf(e, f) : !0;
}

function Lg(a, b, c) {
  var d = !1,
      e = Af;
  var f = b.contextType;
  "object" === typeof f && null !== f ? f = sg(f) : (e = L(b) ? Bf : J.current, d = b.contextTypes, f = (d = null !== d && void 0 !== d) ? Cf(a, e) : Af);
  b = new b(c, f);
  a.memoizedState = null !== b.state && void 0 !== b.state ? b.state : null;
  b.updater = Jg;
  a.stateNode = b;
  b._reactInternalFiber = a;
  d && (a = a.stateNode, a.__reactInternalMemoizedUnmaskedChildContext = e, a.__reactInternalMemoizedMaskedChildContext = f);
  return b;
}

function Mg(a, b, c, d) {
  a = b.state;
  "function" === typeof b.componentWillReceiveProps && b.componentWillReceiveProps(c, d);
  "function" === typeof b.UNSAFE_componentWillReceiveProps && b.UNSAFE_componentWillReceiveProps(c, d);
  b.state !== a && Jg.enqueueReplaceState(b, b.state, null);
}

function Ng(a, b, c, d) {
  var e = a.stateNode;
  e.props = c;
  e.state = a.memoizedState;
  e.refs = Eg;
  ug(a);
  var f = b.contextType;
  "object" === typeof f && null !== f ? e.context = sg(f) : (f = L(b) ? Bf : J.current, e.context = Cf(a, f));
  zg(a, c, e, d);
  e.state = a.memoizedState;
  f = b.getDerivedStateFromProps;
  "function" === typeof f && (Fg(a, b, f, c), e.state = a.memoizedState);
  "function" === typeof b.getDerivedStateFromProps || "function" === typeof e.getSnapshotBeforeUpdate || "function" !== typeof e.UNSAFE_componentWillMount && "function" !== typeof e.componentWillMount || (b = e.state, "function" === typeof e.componentWillMount && e.componentWillMount(), "function" === typeof e.UNSAFE_componentWillMount && e.UNSAFE_componentWillMount(), b !== e.state && Jg.enqueueReplaceState(e, e.state, null), zg(a, c, e, d), e.state = a.memoizedState);
  "function" === typeof e.componentDidMount && (a.effectTag |= 4);
}

var Og = Array.isArray;

function Pg(a, b, c) {
  a = c.ref;

  if (null !== a && "function" !== typeof a && "object" !== typeof a) {
    if (c._owner) {
      c = c._owner;

      if (c) {
        if (1 !== c.tag) throw Error(u(309));
        var d = c.stateNode;
      }

      if (!d) throw Error(u(147, a));
      var e = "" + a;
      if (null !== b && null !== b.ref && "function" === typeof b.ref && b.ref._stringRef === e) return b.ref;

      b = function b(a) {
        var b = d.refs;
        b === Eg && (b = d.refs = {});
        null === a ? delete b[e] : b[e] = a;
      };

      b._stringRef = e;
      return b;
    }

    if ("string" !== typeof a) throw Error(u(284));
    if (!c._owner) throw Error(u(290, a));
  }

  return a;
}

function Qg(a, b) {
  if ("textarea" !== a.type) throw Error(u(31, "[object Object]" === Object.prototype.toString.call(b) ? "object with keys {" + Object.keys(b).join(", ") + "}" : b, ""));
}

function Rg(a) {
  function b(b, c) {
    if (a) {
      var d = b.lastEffect;
      null !== d ? (d.nextEffect = c, b.lastEffect = c) : b.firstEffect = b.lastEffect = c;
      c.nextEffect = null;
      c.effectTag = 8;
    }
  }

  function c(c, d) {
    if (!a) return null;

    for (; null !== d;) {
      b(c, d), d = d.sibling;
    }

    return null;
  }

  function d(a, b) {
    for (a = new Map(); null !== b;) {
      null !== b.key ? a.set(b.key, b) : a.set(b.index, b), b = b.sibling;
    }

    return a;
  }

  function e(a, b) {
    a = Sg(a, b);
    a.index = 0;
    a.sibling = null;
    return a;
  }

  function f(b, c, d) {
    b.index = d;
    if (!a) return c;
    d = b.alternate;
    if (null !== d) return d = d.index, d < c ? (b.effectTag = 2, c) : d;
    b.effectTag = 2;
    return c;
  }

  function g(b) {
    a && null === b.alternate && (b.effectTag = 2);
    return b;
  }

  function h(a, b, c, d) {
    if (null === b || 6 !== b.tag) return b = Tg(c, a.mode, d), b["return"] = a, b;
    b = e(b, c);
    b["return"] = a;
    return b;
  }

  function k(a, b, c, d) {
    if (null !== b && b.elementType === c.type) return d = e(b, c.props), d.ref = Pg(a, b, c), d["return"] = a, d;
    d = Ug(c.type, c.key, c.props, null, a.mode, d);
    d.ref = Pg(a, b, c);
    d["return"] = a;
    return d;
  }

  function l(a, b, c, d) {
    if (null === b || 4 !== b.tag || b.stateNode.containerInfo !== c.containerInfo || b.stateNode.implementation !== c.implementation) return b = Vg(c, a.mode, d), b["return"] = a, b;
    b = e(b, c.children || []);
    b["return"] = a;
    return b;
  }

  function m(a, b, c, d, f) {
    if (null === b || 7 !== b.tag) return b = Wg(c, a.mode, d, f), b["return"] = a, b;
    b = e(b, c);
    b["return"] = a;
    return b;
  }

  function p(a, b, c) {
    if ("string" === typeof b || "number" === typeof b) return b = Tg("" + b, a.mode, c), b["return"] = a, b;

    if ("object" === typeof b && null !== b) {
      switch (b.$$typeof) {
        case Za:
          return c = Ug(b.type, b.key, b.props, null, a.mode, c), c.ref = Pg(a, null, b), c["return"] = a, c;

        case $a:
          return b = Vg(b, a.mode, c), b["return"] = a, b;
      }

      if (Og(b) || nb(b)) return b = Wg(b, a.mode, c, null), b["return"] = a, b;
      Qg(a, b);
    }

    return null;
  }

  function x(a, b, c, d) {
    var e = null !== b ? b.key : null;
    if ("string" === typeof c || "number" === typeof c) return null !== e ? null : h(a, b, "" + c, d);

    if ("object" === typeof c && null !== c) {
      switch (c.$$typeof) {
        case Za:
          return c.key === e ? c.type === ab ? m(a, b, c.props.children, d, e) : k(a, b, c, d) : null;

        case $a:
          return c.key === e ? l(a, b, c, d) : null;
      }

      if (Og(c) || nb(c)) return null !== e ? null : m(a, b, c, d, null);
      Qg(a, c);
    }

    return null;
  }

  function z(a, b, c, d, e) {
    if ("string" === typeof d || "number" === typeof d) return a = a.get(c) || null, h(b, a, "" + d, e);

    if ("object" === typeof d && null !== d) {
      switch (d.$$typeof) {
        case Za:
          return a = a.get(null === d.key ? c : d.key) || null, d.type === ab ? m(b, a, d.props.children, e, d.key) : k(b, a, d, e);

        case $a:
          return a = a.get(null === d.key ? c : d.key) || null, l(b, a, d, e);
      }

      if (Og(d) || nb(d)) return a = a.get(c) || null, m(b, a, d, e, null);
      Qg(b, d);
    }

    return null;
  }

  function ca(e, g, h, k) {
    for (var l = null, t = null, m = g, y = g = 0, A = null; null !== m && y < h.length; y++) {
      m.index > y ? (A = m, m = null) : A = m.sibling;
      var q = x(e, m, h[y], k);

      if (null === q) {
        null === m && (m = A);
        break;
      }

      a && m && null === q.alternate && b(e, m);
      g = f(q, g, y);
      null === t ? l = q : t.sibling = q;
      t = q;
      m = A;
    }

    if (y === h.length) return c(e, m), l;

    if (null === m) {
      for (; y < h.length; y++) {
        m = p(e, h[y], k), null !== m && (g = f(m, g, y), null === t ? l = m : t.sibling = m, t = m);
      }

      return l;
    }

    for (m = d(e, m); y < h.length; y++) {
      A = z(m, e, y, h[y], k), null !== A && (a && null !== A.alternate && m["delete"](null === A.key ? y : A.key), g = f(A, g, y), null === t ? l = A : t.sibling = A, t = A);
    }

    a && m.forEach(function (a) {
      return b(e, a);
    });
    return l;
  }

  function D(e, g, h, l) {
    var k = nb(h);
    if ("function" !== typeof k) throw Error(u(150));
    h = k.call(h);
    if (null == h) throw Error(u(151));

    for (var m = k = null, t = g, y = g = 0, A = null, q = h.next(); null !== t && !q.done; y++, q = h.next()) {
      t.index > y ? (A = t, t = null) : A = t.sibling;
      var D = x(e, t, q.value, l);

      if (null === D) {
        null === t && (t = A);
        break;
      }

      a && t && null === D.alternate && b(e, t);
      g = f(D, g, y);
      null === m ? k = D : m.sibling = D;
      m = D;
      t = A;
    }

    if (q.done) return c(e, t), k;

    if (null === t) {
      for (; !q.done; y++, q = h.next()) {
        q = p(e, q.value, l), null !== q && (g = f(q, g, y), null === m ? k = q : m.sibling = q, m = q);
      }

      return k;
    }

    for (t = d(e, t); !q.done; y++, q = h.next()) {
      q = z(t, e, y, q.value, l), null !== q && (a && null !== q.alternate && t["delete"](null === q.key ? y : q.key), g = f(q, g, y), null === m ? k = q : m.sibling = q, m = q);
    }

    a && t.forEach(function (a) {
      return b(e, a);
    });
    return k;
  }

  return function (a, d, f, h) {
    var k = "object" === typeof f && null !== f && f.type === ab && null === f.key;
    k && (f = f.props.children);
    var l = "object" === typeof f && null !== f;
    if (l) switch (f.$$typeof) {
      case Za:
        a: {
          l = f.key;

          for (k = d; null !== k;) {
            if (k.key === l) {
              switch (k.tag) {
                case 7:
                  if (f.type === ab) {
                    c(a, k.sibling);
                    d = e(k, f.props.children);
                    d["return"] = a;
                    a = d;
                    break a;
                  }

                  break;

                default:
                  if (k.elementType === f.type) {
                    c(a, k.sibling);
                    d = e(k, f.props);
                    d.ref = Pg(a, k, f);
                    d["return"] = a;
                    a = d;
                    break a;
                  }

              }

              c(a, k);
              break;
            } else b(a, k);

            k = k.sibling;
          }

          f.type === ab ? (d = Wg(f.props.children, a.mode, h, f.key), d["return"] = a, a = d) : (h = Ug(f.type, f.key, f.props, null, a.mode, h), h.ref = Pg(a, d, f), h["return"] = a, a = h);
        }

        return g(a);

      case $a:
        a: {
          for (k = f.key; null !== d;) {
            if (d.key === k) {
              if (4 === d.tag && d.stateNode.containerInfo === f.containerInfo && d.stateNode.implementation === f.implementation) {
                c(a, d.sibling);
                d = e(d, f.children || []);
                d["return"] = a;
                a = d;
                break a;
              } else {
                c(a, d);
                break;
              }
            } else b(a, d);
            d = d.sibling;
          }

          d = Vg(f, a.mode, h);
          d["return"] = a;
          a = d;
        }

        return g(a);
    }
    if ("string" === typeof f || "number" === typeof f) return f = "" + f, null !== d && 6 === d.tag ? (c(a, d.sibling), d = e(d, f), d["return"] = a, a = d) : (c(a, d), d = Tg(f, a.mode, h), d["return"] = a, a = d), g(a);
    if (Og(f)) return ca(a, d, f, h);
    if (nb(f)) return D(a, d, f, h);
    l && Qg(a, f);
    if ("undefined" === typeof f && !k) switch (a.tag) {
      case 1:
      case 0:
        throw a = a.type, Error(u(152, a.displayName || a.name || "Component"));
    }
    return c(a, d);
  };
}

var Xg = Rg(!0),
    Yg = Rg(!1),
    Zg = {},
    $g = {
  current: Zg
},
    ah = {
  current: Zg
},
    bh = {
  current: Zg
};

function ch(a) {
  if (a === Zg) throw Error(u(174));
  return a;
}

function dh(a, b) {
  I(bh, b);
  I(ah, a);
  I($g, Zg);
  a = b.nodeType;

  switch (a) {
    case 9:
    case 11:
      b = (b = b.documentElement) ? b.namespaceURI : Ob(null, "");
      break;

    default:
      a = 8 === a ? b.parentNode : b, b = a.namespaceURI || null, a = a.tagName, b = Ob(b, a);
  }

  H($g);
  I($g, b);
}

function eh() {
  H($g);
  H(ah);
  H(bh);
}

function fh(a) {
  ch(bh.current);
  var b = ch($g.current);
  var c = Ob(b, a.type);
  b !== c && (I(ah, a), I($g, c));
}

function gh(a) {
  ah.current === a && (H($g), H(ah));
}

var M = {
  current: 0
};

function hh(a) {
  for (var b = a; null !== b;) {
    if (13 === b.tag) {
      var c = b.memoizedState;
      if (null !== c && (c = c.dehydrated, null === c || c.data === Bd || c.data === Cd)) return b;
    } else if (19 === b.tag && void 0 !== b.memoizedProps.revealOrder) {
      if (0 !== (b.effectTag & 64)) return b;
    } else if (null !== b.child) {
      b.child["return"] = b;
      b = b.child;
      continue;
    }

    if (b === a) break;

    for (; null === b.sibling;) {
      if (null === b["return"] || b["return"] === a) return null;
      b = b["return"];
    }

    b.sibling["return"] = b["return"];
    b = b.sibling;
  }

  return null;
}

function ih(a, b) {
  return {
    responder: a,
    props: b
  };
}

var jh = Wa.ReactCurrentDispatcher,
    kh = Wa.ReactCurrentBatchConfig,
    lh = 0,
    N = null,
    O = null,
    P = null,
    mh = !1;

function Q() {
  throw Error(u(321));
}

function nh(a, b) {
  if (null === b) return !1;

  for (var c = 0; c < b.length && c < a.length; c++) {
    if (!$e(a[c], b[c])) return !1;
  }

  return !0;
}

function oh(a, b, c, d, e, f) {
  lh = f;
  N = b;
  b.memoizedState = null;
  b.updateQueue = null;
  b.expirationTime = 0;
  jh.current = null === a || null === a.memoizedState ? ph : qh;
  a = c(d, e);

  if (b.expirationTime === lh) {
    f = 0;

    do {
      b.expirationTime = 0;
      if (!(25 > f)) throw Error(u(301));
      f += 1;
      P = O = null;
      b.updateQueue = null;
      jh.current = rh;
      a = c(d, e);
    } while (b.expirationTime === lh);
  }

  jh.current = sh;
  b = null !== O && null !== O.next;
  lh = 0;
  P = O = N = null;
  mh = !1;
  if (b) throw Error(u(300));
  return a;
}

function th() {
  var a = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null
  };
  null === P ? N.memoizedState = P = a : P = P.next = a;
  return P;
}

function uh() {
  if (null === O) {
    var a = N.alternate;
    a = null !== a ? a.memoizedState : null;
  } else a = O.next;

  var b = null === P ? N.memoizedState : P.next;
  if (null !== b) P = b, O = a;else {
    if (null === a) throw Error(u(310));
    O = a;
    a = {
      memoizedState: O.memoizedState,
      baseState: O.baseState,
      baseQueue: O.baseQueue,
      queue: O.queue,
      next: null
    };
    null === P ? N.memoizedState = P = a : P = P.next = a;
  }
  return P;
}

function vh(a, b) {
  return "function" === typeof b ? b(a) : b;
}

function wh(a) {
  var b = uh(),
      c = b.queue;
  if (null === c) throw Error(u(311));
  c.lastRenderedReducer = a;
  var d = O,
      e = d.baseQueue,
      f = c.pending;

  if (null !== f) {
    if (null !== e) {
      var g = e.next;
      e.next = f.next;
      f.next = g;
    }

    d.baseQueue = e = f;
    c.pending = null;
  }

  if (null !== e) {
    e = e.next;
    d = d.baseState;
    var h = g = f = null,
        k = e;

    do {
      var l = k.expirationTime;

      if (l < lh) {
        var m = {
          expirationTime: k.expirationTime,
          suspenseConfig: k.suspenseConfig,
          action: k.action,
          eagerReducer: k.eagerReducer,
          eagerState: k.eagerState,
          next: null
        };
        null === h ? (g = h = m, f = d) : h = h.next = m;
        l > N.expirationTime && (N.expirationTime = l, Bg(l));
      } else null !== h && (h = h.next = {
        expirationTime: 1073741823,
        suspenseConfig: k.suspenseConfig,
        action: k.action,
        eagerReducer: k.eagerReducer,
        eagerState: k.eagerState,
        next: null
      }), Ag(l, k.suspenseConfig), d = k.eagerReducer === a ? k.eagerState : a(d, k.action);

      k = k.next;
    } while (null !== k && k !== e);

    null === h ? f = d : h.next = g;
    $e(d, b.memoizedState) || (rg = !0);
    b.memoizedState = d;
    b.baseState = f;
    b.baseQueue = h;
    c.lastRenderedState = d;
  }

  return [b.memoizedState, c.dispatch];
}

function xh(a) {
  var b = uh(),
      c = b.queue;
  if (null === c) throw Error(u(311));
  c.lastRenderedReducer = a;
  var d = c.dispatch,
      e = c.pending,
      f = b.memoizedState;

  if (null !== e) {
    c.pending = null;
    var g = e = e.next;

    do {
      f = a(f, g.action), g = g.next;
    } while (g !== e);

    $e(f, b.memoizedState) || (rg = !0);
    b.memoizedState = f;
    null === b.baseQueue && (b.baseState = f);
    c.lastRenderedState = f;
  }

  return [f, d];
}

function yh(a) {
  var b = th();
  "function" === typeof a && (a = a());
  b.memoizedState = b.baseState = a;
  a = b.queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: vh,
    lastRenderedState: a
  };
  a = a.dispatch = zh.bind(null, N, a);
  return [b.memoizedState, a];
}

function Ah(a, b, c, d) {
  a = {
    tag: a,
    create: b,
    destroy: c,
    deps: d,
    next: null
  };
  b = N.updateQueue;
  null === b ? (b = {
    lastEffect: null
  }, N.updateQueue = b, b.lastEffect = a.next = a) : (c = b.lastEffect, null === c ? b.lastEffect = a.next = a : (d = c.next, c.next = a, a.next = d, b.lastEffect = a));
  return a;
}

function Bh() {
  return uh().memoizedState;
}

function Ch(a, b, c, d) {
  var e = th();
  N.effectTag |= a;
  e.memoizedState = Ah(1 | b, c, void 0, void 0 === d ? null : d);
}

function Dh(a, b, c, d) {
  var e = uh();
  d = void 0 === d ? null : d;
  var f = void 0;

  if (null !== O) {
    var g = O.memoizedState;
    f = g.destroy;

    if (null !== d && nh(d, g.deps)) {
      Ah(b, c, f, d);
      return;
    }
  }

  N.effectTag |= a;
  e.memoizedState = Ah(1 | b, c, f, d);
}

function Eh(a, b) {
  return Ch(516, 4, a, b);
}

function Fh(a, b) {
  return Dh(516, 4, a, b);
}

function Gh(a, b) {
  return Dh(4, 2, a, b);
}

function Hh(a, b) {
  if ("function" === typeof b) return a = a(), b(a), function () {
    b(null);
  };
  if (null !== b && void 0 !== b) return a = a(), b.current = a, function () {
    b.current = null;
  };
}

function Ih(a, b, c) {
  c = null !== c && void 0 !== c ? c.concat([a]) : null;
  return Dh(4, 2, Hh.bind(null, b, a), c);
}

function Jh() {}

function Kh(a, b) {
  th().memoizedState = [a, void 0 === b ? null : b];
  return a;
}

function Lh(a, b) {
  var c = uh();
  b = void 0 === b ? null : b;
  var d = c.memoizedState;
  if (null !== d && null !== b && nh(b, d[1])) return d[0];
  c.memoizedState = [a, b];
  return a;
}

function Mh(a, b) {
  var c = uh();
  b = void 0 === b ? null : b;
  var d = c.memoizedState;
  if (null !== d && null !== b && nh(b, d[1])) return d[0];
  a = a();
  c.memoizedState = [a, b];
  return a;
}

function Nh(a, b, c) {
  var d = ag();
  cg(98 > d ? 98 : d, function () {
    a(!0);
  });
  cg(97 < d ? 97 : d, function () {
    var d = kh.suspense;
    kh.suspense = void 0 === b ? null : b;

    try {
      a(!1), c();
    } finally {
      kh.suspense = d;
    }
  });
}

function zh(a, b, c) {
  var d = Gg(),
      e = Dg.suspense;
  d = Hg(d, a, e);
  e = {
    expirationTime: d,
    suspenseConfig: e,
    action: c,
    eagerReducer: null,
    eagerState: null,
    next: null
  };
  var f = b.pending;
  null === f ? e.next = e : (e.next = f.next, f.next = e);
  b.pending = e;
  f = a.alternate;
  if (a === N || null !== f && f === N) mh = !0, e.expirationTime = lh, N.expirationTime = lh;else {
    if (0 === a.expirationTime && (null === f || 0 === f.expirationTime) && (f = b.lastRenderedReducer, null !== f)) try {
      var g = b.lastRenderedState,
          h = f(g, c);
      e.eagerReducer = f;
      e.eagerState = h;
      if ($e(h, g)) return;
    } catch (k) {} finally {}
    Ig(a, d);
  }
}

var sh = {
  readContext: sg,
  useCallback: Q,
  useContext: Q,
  useEffect: Q,
  useImperativeHandle: Q,
  useLayoutEffect: Q,
  useMemo: Q,
  useReducer: Q,
  useRef: Q,
  useState: Q,
  useDebugValue: Q,
  useResponder: Q,
  useDeferredValue: Q,
  useTransition: Q
},
    ph = {
  readContext: sg,
  useCallback: Kh,
  useContext: sg,
  useEffect: Eh,
  useImperativeHandle: function useImperativeHandle(a, b, c) {
    c = null !== c && void 0 !== c ? c.concat([a]) : null;
    return Ch(4, 2, Hh.bind(null, b, a), c);
  },
  useLayoutEffect: function useLayoutEffect(a, b) {
    return Ch(4, 2, a, b);
  },
  useMemo: function useMemo(a, b) {
    var c = th();
    b = void 0 === b ? null : b;
    a = a();
    c.memoizedState = [a, b];
    return a;
  },
  useReducer: function useReducer(a, b, c) {
    var d = th();
    b = void 0 !== c ? c(b) : b;
    d.memoizedState = d.baseState = b;
    a = d.queue = {
      pending: null,
      dispatch: null,
      lastRenderedReducer: a,
      lastRenderedState: b
    };
    a = a.dispatch = zh.bind(null, N, a);
    return [d.memoizedState, a];
  },
  useRef: function useRef(a) {
    var b = th();
    a = {
      current: a
    };
    return b.memoizedState = a;
  },
  useState: yh,
  useDebugValue: Jh,
  useResponder: ih,
  useDeferredValue: function useDeferredValue(a, b) {
    var c = yh(a),
        d = c[0],
        e = c[1];
    Eh(function () {
      var c = kh.suspense;
      kh.suspense = void 0 === b ? null : b;

      try {
        e(a);
      } finally {
        kh.suspense = c;
      }
    }, [a, b]);
    return d;
  },
  useTransition: function useTransition(a) {
    var b = yh(!1),
        c = b[0];
    b = b[1];
    return [Kh(Nh.bind(null, b, a), [b, a]), c];
  }
},
    qh = {
  readContext: sg,
  useCallback: Lh,
  useContext: sg,
  useEffect: Fh,
  useImperativeHandle: Ih,
  useLayoutEffect: Gh,
  useMemo: Mh,
  useReducer: wh,
  useRef: Bh,
  useState: function useState() {
    return wh(vh);
  },
  useDebugValue: Jh,
  useResponder: ih,
  useDeferredValue: function useDeferredValue(a, b) {
    var c = wh(vh),
        d = c[0],
        e = c[1];
    Fh(function () {
      var c = kh.suspense;
      kh.suspense = void 0 === b ? null : b;

      try {
        e(a);
      } finally {
        kh.suspense = c;
      }
    }, [a, b]);
    return d;
  },
  useTransition: function useTransition(a) {
    var b = wh(vh),
        c = b[0];
    b = b[1];
    return [Lh(Nh.bind(null, b, a), [b, a]), c];
  }
},
    rh = {
  readContext: sg,
  useCallback: Lh,
  useContext: sg,
  useEffect: Fh,
  useImperativeHandle: Ih,
  useLayoutEffect: Gh,
  useMemo: Mh,
  useReducer: xh,
  useRef: Bh,
  useState: function useState() {
    return xh(vh);
  },
  useDebugValue: Jh,
  useResponder: ih,
  useDeferredValue: function useDeferredValue(a, b) {
    var c = xh(vh),
        d = c[0],
        e = c[1];
    Fh(function () {
      var c = kh.suspense;
      kh.suspense = void 0 === b ? null : b;

      try {
        e(a);
      } finally {
        kh.suspense = c;
      }
    }, [a, b]);
    return d;
  },
  useTransition: function useTransition(a) {
    var b = xh(vh),
        c = b[0];
    b = b[1];
    return [Lh(Nh.bind(null, b, a), [b, a]), c];
  }
},
    Oh = null,
    Ph = null,
    Qh = !1;

function Rh(a, b) {
  var c = Sh(5, null, null, 0);
  c.elementType = "DELETED";
  c.type = "DELETED";
  c.stateNode = b;
  c["return"] = a;
  c.effectTag = 8;
  null !== a.lastEffect ? (a.lastEffect.nextEffect = c, a.lastEffect = c) : a.firstEffect = a.lastEffect = c;
}

function Th(a, b) {
  switch (a.tag) {
    case 5:
      var c = a.type;
      b = 1 !== b.nodeType || c.toLowerCase() !== b.nodeName.toLowerCase() ? null : b;
      return null !== b ? (a.stateNode = b, !0) : !1;

    case 6:
      return b = "" === a.pendingProps || 3 !== b.nodeType ? null : b, null !== b ? (a.stateNode = b, !0) : !1;

    case 13:
      return !1;

    default:
      return !1;
  }
}

function Uh(a) {
  if (Qh) {
    var b = Ph;

    if (b) {
      var c = b;

      if (!Th(a, b)) {
        b = Jd(c.nextSibling);

        if (!b || !Th(a, b)) {
          a.effectTag = a.effectTag & -1025 | 2;
          Qh = !1;
          Oh = a;
          return;
        }

        Rh(Oh, c);
      }

      Oh = a;
      Ph = Jd(b.firstChild);
    } else a.effectTag = a.effectTag & -1025 | 2, Qh = !1, Oh = a;
  }
}

function Vh(a) {
  for (a = a["return"]; null !== a && 5 !== a.tag && 3 !== a.tag && 13 !== a.tag;) {
    a = a["return"];
  }

  Oh = a;
}

function Wh(a) {
  if (a !== Oh) return !1;
  if (!Qh) return Vh(a), Qh = !0, !1;
  var b = a.type;
  if (5 !== a.tag || "head" !== b && "body" !== b && !Gd(b, a.memoizedProps)) for (b = Ph; b;) {
    Rh(a, b), b = Jd(b.nextSibling);
  }
  Vh(a);

  if (13 === a.tag) {
    a = a.memoizedState;
    a = null !== a ? a.dehydrated : null;
    if (!a) throw Error(u(317));

    a: {
      a = a.nextSibling;

      for (b = 0; a;) {
        if (8 === a.nodeType) {
          var c = a.data;

          if (c === Ad) {
            if (0 === b) {
              Ph = Jd(a.nextSibling);
              break a;
            }

            b--;
          } else c !== zd && c !== Cd && c !== Bd || b++;
        }

        a = a.nextSibling;
      }

      Ph = null;
    }
  } else Ph = Oh ? Jd(a.stateNode.nextSibling) : null;

  return !0;
}

function Xh() {
  Ph = Oh = null;
  Qh = !1;
}

var Yh = Wa.ReactCurrentOwner,
    rg = !1;

function R(a, b, c, d) {
  b.child = null === a ? Yg(b, null, c, d) : Xg(b, a.child, c, d);
}

function Zh(a, b, c, d, e) {
  c = c.render;
  var f = b.ref;
  qg(b, e);
  d = oh(a, b, c, d, f, e);
  if (null !== a && !rg) return b.updateQueue = a.updateQueue, b.effectTag &= -517, a.expirationTime <= e && (a.expirationTime = 0), $h(a, b, e);
  b.effectTag |= 1;
  R(a, b, d, e);
  return b.child;
}

function ai(a, b, c, d, e, f) {
  if (null === a) {
    var g = c.type;
    if ("function" === typeof g && !bi(g) && void 0 === g.defaultProps && null === c.compare && void 0 === c.defaultProps) return b.tag = 15, b.type = g, ci(a, b, g, d, e, f);
    a = Ug(c.type, null, d, null, b.mode, f);
    a.ref = b.ref;
    a["return"] = b;
    return b.child = a;
  }

  g = a.child;
  if (e < f && (e = g.memoizedProps, c = c.compare, c = null !== c ? c : bf, c(e, d) && a.ref === b.ref)) return $h(a, b, f);
  b.effectTag |= 1;
  a = Sg(g, d);
  a.ref = b.ref;
  a["return"] = b;
  return b.child = a;
}

function ci(a, b, c, d, e, f) {
  return null !== a && bf(a.memoizedProps, d) && a.ref === b.ref && (rg = !1, e < f) ? (b.expirationTime = a.expirationTime, $h(a, b, f)) : di(a, b, c, d, f);
}

function ei(a, b) {
  var c = b.ref;
  if (null === a && null !== c || null !== a && a.ref !== c) b.effectTag |= 128;
}

function di(a, b, c, d, e) {
  var f = L(c) ? Bf : J.current;
  f = Cf(b, f);
  qg(b, e);
  c = oh(a, b, c, d, f, e);
  if (null !== a && !rg) return b.updateQueue = a.updateQueue, b.effectTag &= -517, a.expirationTime <= e && (a.expirationTime = 0), $h(a, b, e);
  b.effectTag |= 1;
  R(a, b, c, e);
  return b.child;
}

function fi(a, b, c, d, e) {
  if (L(c)) {
    var f = !0;
    Gf(b);
  } else f = !1;

  qg(b, e);
  if (null === b.stateNode) null !== a && (a.alternate = null, b.alternate = null, b.effectTag |= 2), Lg(b, c, d), Ng(b, c, d, e), d = !0;else if (null === a) {
    var g = b.stateNode,
        h = b.memoizedProps;
    g.props = h;
    var k = g.context,
        l = c.contextType;
    "object" === typeof l && null !== l ? l = sg(l) : (l = L(c) ? Bf : J.current, l = Cf(b, l));
    var m = c.getDerivedStateFromProps,
        p = "function" === typeof m || "function" === typeof g.getSnapshotBeforeUpdate;
    p || "function" !== typeof g.UNSAFE_componentWillReceiveProps && "function" !== typeof g.componentWillReceiveProps || (h !== d || k !== l) && Mg(b, g, d, l);
    tg = !1;
    var x = b.memoizedState;
    g.state = x;
    zg(b, d, g, e);
    k = b.memoizedState;
    h !== d || x !== k || K.current || tg ? ("function" === typeof m && (Fg(b, c, m, d), k = b.memoizedState), (h = tg || Kg(b, c, h, d, x, k, l)) ? (p || "function" !== typeof g.UNSAFE_componentWillMount && "function" !== typeof g.componentWillMount || ("function" === typeof g.componentWillMount && g.componentWillMount(), "function" === typeof g.UNSAFE_componentWillMount && g.UNSAFE_componentWillMount()), "function" === typeof g.componentDidMount && (b.effectTag |= 4)) : ("function" === typeof g.componentDidMount && (b.effectTag |= 4), b.memoizedProps = d, b.memoizedState = k), g.props = d, g.state = k, g.context = l, d = h) : ("function" === typeof g.componentDidMount && (b.effectTag |= 4), d = !1);
  } else g = b.stateNode, vg(a, b), h = b.memoizedProps, g.props = b.type === b.elementType ? h : ig(b.type, h), k = g.context, l = c.contextType, "object" === typeof l && null !== l ? l = sg(l) : (l = L(c) ? Bf : J.current, l = Cf(b, l)), m = c.getDerivedStateFromProps, (p = "function" === typeof m || "function" === typeof g.getSnapshotBeforeUpdate) || "function" !== typeof g.UNSAFE_componentWillReceiveProps && "function" !== typeof g.componentWillReceiveProps || (h !== d || k !== l) && Mg(b, g, d, l), tg = !1, k = b.memoizedState, g.state = k, zg(b, d, g, e), x = b.memoizedState, h !== d || k !== x || K.current || tg ? ("function" === typeof m && (Fg(b, c, m, d), x = b.memoizedState), (m = tg || Kg(b, c, h, d, k, x, l)) ? (p || "function" !== typeof g.UNSAFE_componentWillUpdate && "function" !== typeof g.componentWillUpdate || ("function" === typeof g.componentWillUpdate && g.componentWillUpdate(d, x, l), "function" === typeof g.UNSAFE_componentWillUpdate && g.UNSAFE_componentWillUpdate(d, x, l)), "function" === typeof g.componentDidUpdate && (b.effectTag |= 4), "function" === typeof g.getSnapshotBeforeUpdate && (b.effectTag |= 256)) : ("function" !== typeof g.componentDidUpdate || h === a.memoizedProps && k === a.memoizedState || (b.effectTag |= 4), "function" !== typeof g.getSnapshotBeforeUpdate || h === a.memoizedProps && k === a.memoizedState || (b.effectTag |= 256), b.memoizedProps = d, b.memoizedState = x), g.props = d, g.state = x, g.context = l, d = m) : ("function" !== typeof g.componentDidUpdate || h === a.memoizedProps && k === a.memoizedState || (b.effectTag |= 4), "function" !== typeof g.getSnapshotBeforeUpdate || h === a.memoizedProps && k === a.memoizedState || (b.effectTag |= 256), d = !1);
  return gi(a, b, c, d, f, e);
}

function gi(a, b, c, d, e, f) {
  ei(a, b);
  var g = 0 !== (b.effectTag & 64);
  if (!d && !g) return e && Hf(b, c, !1), $h(a, b, f);
  d = b.stateNode;
  Yh.current = b;
  var h = g && "function" !== typeof c.getDerivedStateFromError ? null : d.render();
  b.effectTag |= 1;
  null !== a && g ? (b.child = Xg(b, a.child, null, f), b.child = Xg(b, null, h, f)) : R(a, b, h, f);
  b.memoizedState = d.state;
  e && Hf(b, c, !0);
  return b.child;
}

function hi(a) {
  var b = a.stateNode;
  b.pendingContext ? Ef(a, b.pendingContext, b.pendingContext !== b.context) : b.context && Ef(a, b.context, !1);
  dh(a, b.containerInfo);
}

var ii = {
  dehydrated: null,
  retryTime: 0
};

function ji(a, b, c) {
  var d = b.mode,
      e = b.pendingProps,
      f = M.current,
      g = !1,
      h;
  (h = 0 !== (b.effectTag & 64)) || (h = 0 !== (f & 2) && (null === a || null !== a.memoizedState));
  h ? (g = !0, b.effectTag &= -65) : null !== a && null === a.memoizedState || void 0 === e.fallback || !0 === e.unstable_avoidThisFallback || (f |= 1);
  I(M, f & 1);

  if (null === a) {
    void 0 !== e.fallback && Uh(b);

    if (g) {
      g = e.fallback;
      e = Wg(null, d, 0, null);
      e["return"] = b;
      if (0 === (b.mode & 2)) for (a = null !== b.memoizedState ? b.child.child : b.child, e.child = a; null !== a;) {
        a["return"] = e, a = a.sibling;
      }
      c = Wg(g, d, c, null);
      c["return"] = b;
      e.sibling = c;
      b.memoizedState = ii;
      b.child = e;
      return c;
    }

    d = e.children;
    b.memoizedState = null;
    return b.child = Yg(b, null, d, c);
  }

  if (null !== a.memoizedState) {
    a = a.child;
    d = a.sibling;

    if (g) {
      e = e.fallback;
      c = Sg(a, a.pendingProps);
      c["return"] = b;
      if (0 === (b.mode & 2) && (g = null !== b.memoizedState ? b.child.child : b.child, g !== a.child)) for (c.child = g; null !== g;) {
        g["return"] = c, g = g.sibling;
      }
      d = Sg(d, e);
      d["return"] = b;
      c.sibling = d;
      c.childExpirationTime = 0;
      b.memoizedState = ii;
      b.child = c;
      return d;
    }

    c = Xg(b, a.child, e.children, c);
    b.memoizedState = null;
    return b.child = c;
  }

  a = a.child;

  if (g) {
    g = e.fallback;
    e = Wg(null, d, 0, null);
    e["return"] = b;
    e.child = a;
    null !== a && (a["return"] = e);
    if (0 === (b.mode & 2)) for (a = null !== b.memoizedState ? b.child.child : b.child, e.child = a; null !== a;) {
      a["return"] = e, a = a.sibling;
    }
    c = Wg(g, d, c, null);
    c["return"] = b;
    e.sibling = c;
    c.effectTag |= 2;
    e.childExpirationTime = 0;
    b.memoizedState = ii;
    b.child = e;
    return c;
  }

  b.memoizedState = null;
  return b.child = Xg(b, a, e.children, c);
}

function ki(a, b) {
  a.expirationTime < b && (a.expirationTime = b);
  var c = a.alternate;
  null !== c && c.expirationTime < b && (c.expirationTime = b);
  pg(a["return"], b);
}

function li(a, b, c, d, e, f) {
  var g = a.memoizedState;
  null === g ? a.memoizedState = {
    isBackwards: b,
    rendering: null,
    renderingStartTime: 0,
    last: d,
    tail: c,
    tailExpiration: 0,
    tailMode: e,
    lastEffect: f
  } : (g.isBackwards = b, g.rendering = null, g.renderingStartTime = 0, g.last = d, g.tail = c, g.tailExpiration = 0, g.tailMode = e, g.lastEffect = f);
}

function mi(a, b, c) {
  var d = b.pendingProps,
      e = d.revealOrder,
      f = d.tail;
  R(a, b, d.children, c);
  d = M.current;
  if (0 !== (d & 2)) d = d & 1 | 2, b.effectTag |= 64;else {
    if (null !== a && 0 !== (a.effectTag & 64)) a: for (a = b.child; null !== a;) {
      if (13 === a.tag) null !== a.memoizedState && ki(a, c);else if (19 === a.tag) ki(a, c);else if (null !== a.child) {
        a.child["return"] = a;
        a = a.child;
        continue;
      }
      if (a === b) break a;

      for (; null === a.sibling;) {
        if (null === a["return"] || a["return"] === b) break a;
        a = a["return"];
      }

      a.sibling["return"] = a["return"];
      a = a.sibling;
    }
    d &= 1;
  }
  I(M, d);
  if (0 === (b.mode & 2)) b.memoizedState = null;else switch (e) {
    case "forwards":
      c = b.child;

      for (e = null; null !== c;) {
        a = c.alternate, null !== a && null === hh(a) && (e = c), c = c.sibling;
      }

      c = e;
      null === c ? (e = b.child, b.child = null) : (e = c.sibling, c.sibling = null);
      li(b, !1, e, c, f, b.lastEffect);
      break;

    case "backwards":
      c = null;
      e = b.child;

      for (b.child = null; null !== e;) {
        a = e.alternate;

        if (null !== a && null === hh(a)) {
          b.child = e;
          break;
        }

        a = e.sibling;
        e.sibling = c;
        c = e;
        e = a;
      }

      li(b, !0, c, null, f, b.lastEffect);
      break;

    case "together":
      li(b, !1, null, null, void 0, b.lastEffect);
      break;

    default:
      b.memoizedState = null;
  }
  return b.child;
}

function $h(a, b, c) {
  null !== a && (b.dependencies = a.dependencies);
  var d = b.expirationTime;
  0 !== d && Bg(d);
  if (b.childExpirationTime < c) return null;
  if (null !== a && b.child !== a.child) throw Error(u(153));

  if (null !== b.child) {
    a = b.child;
    c = Sg(a, a.pendingProps);
    b.child = c;

    for (c["return"] = b; null !== a.sibling;) {
      a = a.sibling, c = c.sibling = Sg(a, a.pendingProps), c["return"] = b;
    }

    c.sibling = null;
  }

  return b.child;
}

var ni, oi, pi, qi;

ni = function ni(a, b) {
  for (var c = b.child; null !== c;) {
    if (5 === c.tag || 6 === c.tag) a.appendChild(c.stateNode);else if (4 !== c.tag && null !== c.child) {
      c.child["return"] = c;
      c = c.child;
      continue;
    }
    if (c === b) break;

    for (; null === c.sibling;) {
      if (null === c["return"] || c["return"] === b) return;
      c = c["return"];
    }

    c.sibling["return"] = c["return"];
    c = c.sibling;
  }
};

oi = function oi() {};

pi = function pi(a, b, c, d, e) {
  var f = a.memoizedProps;

  if (f !== d) {
    var g = b.stateNode;
    ch($g.current);
    a = null;

    switch (c) {
      case "input":
        f = zb(g, f);
        d = zb(g, d);
        a = [];
        break;

      case "option":
        f = Gb(g, f);
        d = Gb(g, d);
        a = [];
        break;

      case "select":
        f = objectAssign({}, f, {
          value: void 0
        });
        d = objectAssign({}, d, {
          value: void 0
        });
        a = [];
        break;

      case "textarea":
        f = Ib(g, f);
        d = Ib(g, d);
        a = [];
        break;

      default:
        "function" !== typeof f.onClick && "function" === typeof d.onClick && (g.onclick = sd);
    }

    od(c, d);
    var h, k;
    c = null;

    for (h in f) {
      if (!d.hasOwnProperty(h) && f.hasOwnProperty(h) && null != f[h]) if ("style" === h) for (k in g = f[h], g) {
        g.hasOwnProperty(k) && (c || (c = {}), c[k] = "");
      } else "dangerouslySetInnerHTML" !== h && "children" !== h && "suppressContentEditableWarning" !== h && "suppressHydrationWarning" !== h && "autoFocus" !== h && (va.hasOwnProperty(h) ? a || (a = []) : (a = a || []).push(h, null));
    }

    for (h in d) {
      var l = d[h];
      g = null != f ? f[h] : void 0;
      if (d.hasOwnProperty(h) && l !== g && (null != l || null != g)) if ("style" === h) {
        if (g) {
          for (k in g) {
            !g.hasOwnProperty(k) || l && l.hasOwnProperty(k) || (c || (c = {}), c[k] = "");
          }

          for (k in l) {
            l.hasOwnProperty(k) && g[k] !== l[k] && (c || (c = {}), c[k] = l[k]);
          }
        } else c || (a || (a = []), a.push(h, c)), c = l;
      } else "dangerouslySetInnerHTML" === h ? (l = l ? l.__html : void 0, g = g ? g.__html : void 0, null != l && g !== l && (a = a || []).push(h, l)) : "children" === h ? g === l || "string" !== typeof l && "number" !== typeof l || (a = a || []).push(h, "" + l) : "suppressContentEditableWarning" !== h && "suppressHydrationWarning" !== h && (va.hasOwnProperty(h) ? (null != l && rd(e, h), a || g === l || (a = [])) : (a = a || []).push(h, l));
    }

    c && (a = a || []).push("style", c);
    e = a;
    if (b.updateQueue = e) b.effectTag |= 4;
  }
};

qi = function qi(a, b, c, d) {
  c !== d && (b.effectTag |= 4);
};

function ri(a, b) {
  switch (a.tailMode) {
    case "hidden":
      b = a.tail;

      for (var c = null; null !== b;) {
        null !== b.alternate && (c = b), b = b.sibling;
      }

      null === c ? a.tail = null : c.sibling = null;
      break;

    case "collapsed":
      c = a.tail;

      for (var d = null; null !== c;) {
        null !== c.alternate && (d = c), c = c.sibling;
      }

      null === d ? b || null === a.tail ? a.tail = null : a.tail.sibling = null : d.sibling = null;
  }
}

function si(a, b, c) {
  var d = b.pendingProps;

  switch (b.tag) {
    case 2:
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return null;

    case 1:
      return L(b.type) && Df(), null;

    case 3:
      return eh(), H(K), H(J), c = b.stateNode, c.pendingContext && (c.context = c.pendingContext, c.pendingContext = null), null !== a && null !== a.child || !Wh(b) || (b.effectTag |= 4), oi(b), null;

    case 5:
      gh(b);
      c = ch(bh.current);
      var e = b.type;
      if (null !== a && null != b.stateNode) pi(a, b, e, d, c), a.ref !== b.ref && (b.effectTag |= 128);else {
        if (!d) {
          if (null === b.stateNode) throw Error(u(166));
          return null;
        }

        a = ch($g.current);

        if (Wh(b)) {
          d = b.stateNode;
          e = b.type;
          var f = b.memoizedProps;
          d[Md] = b;
          d[Nd] = f;

          switch (e) {
            case "iframe":
            case "object":
            case "embed":
              F("load", d);
              break;

            case "video":
            case "audio":
              for (a = 0; a < ac.length; a++) {
                F(ac[a], d);
              }

              break;

            case "source":
              F("error", d);
              break;

            case "img":
            case "image":
            case "link":
              F("error", d);
              F("load", d);
              break;

            case "form":
              F("reset", d);
              F("submit", d);
              break;

            case "details":
              F("toggle", d);
              break;

            case "input":
              Ab(d, f);
              F("invalid", d);
              rd(c, "onChange");
              break;

            case "select":
              d._wrapperState = {
                wasMultiple: !!f.multiple
              };
              F("invalid", d);
              rd(c, "onChange");
              break;

            case "textarea":
              Jb(d, f), F("invalid", d), rd(c, "onChange");
          }

          od(e, f);
          a = null;

          for (var g in f) {
            if (f.hasOwnProperty(g)) {
              var h = f[g];
              "children" === g ? "string" === typeof h ? d.textContent !== h && (a = ["children", h]) : "number" === typeof h && d.textContent !== "" + h && (a = ["children", "" + h]) : va.hasOwnProperty(g) && null != h && rd(c, g);
            }
          }

          switch (e) {
            case "input":
              xb(d);
              Eb(d, f, !0);
              break;

            case "textarea":
              xb(d);
              Lb(d);
              break;

            case "select":
            case "option":
              break;

            default:
              "function" === typeof f.onClick && (d.onclick = sd);
          }

          c = a;
          b.updateQueue = c;
          null !== c && (b.effectTag |= 4);
        } else {
          g = 9 === c.nodeType ? c : c.ownerDocument;
          a === qd && (a = Nb(e));
          a === qd ? "script" === e ? (a = g.createElement("div"), a.innerHTML = "<script>\x3c/script>", a = a.removeChild(a.firstChild)) : "string" === typeof d.is ? a = g.createElement(e, {
            is: d.is
          }) : (a = g.createElement(e), "select" === e && (g = a, d.multiple ? g.multiple = !0 : d.size && (g.size = d.size))) : a = g.createElementNS(a, e);
          a[Md] = b;
          a[Nd] = d;
          ni(a, b, !1, !1);
          b.stateNode = a;
          g = pd(e, d);

          switch (e) {
            case "iframe":
            case "object":
            case "embed":
              F("load", a);
              h = d;
              break;

            case "video":
            case "audio":
              for (h = 0; h < ac.length; h++) {
                F(ac[h], a);
              }

              h = d;
              break;

            case "source":
              F("error", a);
              h = d;
              break;

            case "img":
            case "image":
            case "link":
              F("error", a);
              F("load", a);
              h = d;
              break;

            case "form":
              F("reset", a);
              F("submit", a);
              h = d;
              break;

            case "details":
              F("toggle", a);
              h = d;
              break;

            case "input":
              Ab(a, d);
              h = zb(a, d);
              F("invalid", a);
              rd(c, "onChange");
              break;

            case "option":
              h = Gb(a, d);
              break;

            case "select":
              a._wrapperState = {
                wasMultiple: !!d.multiple
              };
              h = objectAssign({}, d, {
                value: void 0
              });
              F("invalid", a);
              rd(c, "onChange");
              break;

            case "textarea":
              Jb(a, d);
              h = Ib(a, d);
              F("invalid", a);
              rd(c, "onChange");
              break;

            default:
              h = d;
          }

          od(e, h);
          var k = h;

          for (f in k) {
            if (k.hasOwnProperty(f)) {
              var l = k[f];
              "style" === f ? md(a, l) : "dangerouslySetInnerHTML" === f ? (l = l ? l.__html : void 0, null != l && Qb(a, l)) : "children" === f ? "string" === typeof l ? ("textarea" !== e || "" !== l) && Rb(a, l) : "number" === typeof l && Rb(a, "" + l) : "suppressContentEditableWarning" !== f && "suppressHydrationWarning" !== f && "autoFocus" !== f && (va.hasOwnProperty(f) ? null != l && rd(c, f) : null != l && Xa(a, f, l, g));
            }
          }

          switch (e) {
            case "input":
              xb(a);
              Eb(a, d, !1);
              break;

            case "textarea":
              xb(a);
              Lb(a);
              break;

            case "option":
              null != d.value && a.setAttribute("value", "" + rb(d.value));
              break;

            case "select":
              a.multiple = !!d.multiple;
              c = d.value;
              null != c ? Hb(a, !!d.multiple, c, !1) : null != d.defaultValue && Hb(a, !!d.multiple, d.defaultValue, !0);
              break;

            default:
              "function" === typeof h.onClick && (a.onclick = sd);
          }

          Fd(e, d) && (b.effectTag |= 4);
        }

        null !== b.ref && (b.effectTag |= 128);
      }
      return null;

    case 6:
      if (a && null != b.stateNode) qi(a, b, a.memoizedProps, d);else {
        if ("string" !== typeof d && null === b.stateNode) throw Error(u(166));
        c = ch(bh.current);
        ch($g.current);
        Wh(b) ? (c = b.stateNode, d = b.memoizedProps, c[Md] = b, c.nodeValue !== d && (b.effectTag |= 4)) : (c = (9 === c.nodeType ? c : c.ownerDocument).createTextNode(d), c[Md] = b, b.stateNode = c);
      }
      return null;

    case 13:
      H(M);
      d = b.memoizedState;
      if (0 !== (b.effectTag & 64)) return b.expirationTime = c, b;
      c = null !== d;
      d = !1;
      null === a ? void 0 !== b.memoizedProps.fallback && Wh(b) : (e = a.memoizedState, d = null !== e, c || null === e || (e = a.child.sibling, null !== e && (f = b.firstEffect, null !== f ? (b.firstEffect = e, e.nextEffect = f) : (b.firstEffect = b.lastEffect = e, e.nextEffect = null), e.effectTag = 8)));
      if (c && !d && 0 !== (b.mode & 2)) if (null === a && !0 !== b.memoizedProps.unstable_avoidThisFallback || 0 !== (M.current & 1)) S === ti && (S = ui);else {
        if (S === ti || S === ui) S = vi;
        0 !== wi && null !== T && (xi(T, U), yi(T, wi));
      }
      if (c || d) b.effectTag |= 4;
      return null;

    case 4:
      return eh(), oi(b), null;

    case 10:
      return og(b), null;

    case 17:
      return L(b.type) && Df(), null;

    case 19:
      H(M);
      d = b.memoizedState;
      if (null === d) return null;
      e = 0 !== (b.effectTag & 64);
      f = d.rendering;
      if (null === f) {
        if (e) ri(d, !1);else {
          if (S !== ti || null !== a && 0 !== (a.effectTag & 64)) for (f = b.child; null !== f;) {
            a = hh(f);

            if (null !== a) {
              b.effectTag |= 64;
              ri(d, !1);
              e = a.updateQueue;
              null !== e && (b.updateQueue = e, b.effectTag |= 4);
              null === d.lastEffect && (b.firstEffect = null);
              b.lastEffect = d.lastEffect;

              for (d = b.child; null !== d;) {
                e = d, f = c, e.effectTag &= 2, e.nextEffect = null, e.firstEffect = null, e.lastEffect = null, a = e.alternate, null === a ? (e.childExpirationTime = 0, e.expirationTime = f, e.child = null, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null) : (e.childExpirationTime = a.childExpirationTime, e.expirationTime = a.expirationTime, e.child = a.child, e.memoizedProps = a.memoizedProps, e.memoizedState = a.memoizedState, e.updateQueue = a.updateQueue, f = a.dependencies, e.dependencies = null === f ? null : {
                  expirationTime: f.expirationTime,
                  firstContext: f.firstContext,
                  responders: f.responders
                }), d = d.sibling;
              }

              I(M, M.current & 1 | 2);
              return b.child;
            }

            f = f.sibling;
          }
        }
      } else {
        if (!e) if (a = hh(f), null !== a) {
          if (b.effectTag |= 64, e = !0, c = a.updateQueue, null !== c && (b.updateQueue = c, b.effectTag |= 4), ri(d, !0), null === d.tail && "hidden" === d.tailMode && !f.alternate) return b = b.lastEffect = d.lastEffect, null !== b && (b.nextEffect = null), null;
        } else 2 * $f() - d.renderingStartTime > d.tailExpiration && 1 < c && (b.effectTag |= 64, e = !0, ri(d, !1), b.expirationTime = b.childExpirationTime = c - 1);
        d.isBackwards ? (f.sibling = b.child, b.child = f) : (c = d.last, null !== c ? c.sibling = f : b.child = f, d.last = f);
      }
      return null !== d.tail ? (0 === d.tailExpiration && (d.tailExpiration = $f() + 500), c = d.tail, d.rendering = c, d.tail = c.sibling, d.lastEffect = b.lastEffect, d.renderingStartTime = $f(), c.sibling = null, b = M.current, I(M, e ? b & 1 | 2 : b & 1), c) : null;
  }

  throw Error(u(156, b.tag));
}

function zi(a) {
  switch (a.tag) {
    case 1:
      L(a.type) && Df();
      var b = a.effectTag;
      return b & 4096 ? (a.effectTag = b & -4097 | 64, a) : null;

    case 3:
      eh();
      H(K);
      H(J);
      b = a.effectTag;
      if (0 !== (b & 64)) throw Error(u(285));
      a.effectTag = b & -4097 | 64;
      return a;

    case 5:
      return gh(a), null;

    case 13:
      return H(M), b = a.effectTag, b & 4096 ? (a.effectTag = b & -4097 | 64, a) : null;

    case 19:
      return H(M), null;

    case 4:
      return eh(), null;

    case 10:
      return og(a), null;

    default:
      return null;
  }
}

function Ai(a, b) {
  return {
    value: a,
    source: b,
    stack: qb(b)
  };
}

var Bi = "function" === typeof WeakSet ? WeakSet : Set;

function Ci(a, b) {
  var c = b.source,
      d = b.stack;
  null === d && null !== c && (d = qb(c));
  null !== c && pb(c.type);
  b = b.value;
  null !== a && 1 === a.tag && pb(a.type);

  try {
    console.error(b);
  } catch (e) {
    setTimeout(function () {
      throw e;
    });
  }
}

function Di(a, b) {
  try {
    b.props = a.memoizedProps, b.state = a.memoizedState, b.componentWillUnmount();
  } catch (c) {
    Ei(a, c);
  }
}

function Fi(a) {
  var b = a.ref;
  if (null !== b) if ("function" === typeof b) try {
    b(null);
  } catch (c) {
    Ei(a, c);
  } else b.current = null;
}

function Gi(a, b) {
  switch (b.tag) {
    case 0:
    case 11:
    case 15:
    case 22:
      return;

    case 1:
      if (b.effectTag & 256 && null !== a) {
        var c = a.memoizedProps,
            d = a.memoizedState;
        a = b.stateNode;
        b = a.getSnapshotBeforeUpdate(b.elementType === b.type ? c : ig(b.type, c), d);
        a.__reactInternalSnapshotBeforeUpdate = b;
      }

      return;

    case 3:
    case 5:
    case 6:
    case 4:
    case 17:
      return;
  }

  throw Error(u(163));
}

function Hi(a, b) {
  b = b.updateQueue;
  b = null !== b ? b.lastEffect : null;

  if (null !== b) {
    var c = b = b.next;

    do {
      if ((c.tag & a) === a) {
        var d = c.destroy;
        c.destroy = void 0;
        void 0 !== d && d();
      }

      c = c.next;
    } while (c !== b);
  }
}

function Ii(a, b) {
  b = b.updateQueue;
  b = null !== b ? b.lastEffect : null;

  if (null !== b) {
    var c = b = b.next;

    do {
      if ((c.tag & a) === a) {
        var d = c.create;
        c.destroy = d();
      }

      c = c.next;
    } while (c !== b);
  }
}

function Ji(a, b, c) {
  switch (c.tag) {
    case 0:
    case 11:
    case 15:
    case 22:
      Ii(3, c);
      return;

    case 1:
      a = c.stateNode;
      if (c.effectTag & 4) if (null === b) a.componentDidMount();else {
        var d = c.elementType === c.type ? b.memoizedProps : ig(c.type, b.memoizedProps);
        a.componentDidUpdate(d, b.memoizedState, a.__reactInternalSnapshotBeforeUpdate);
      }
      b = c.updateQueue;
      null !== b && Cg(c, b, a);
      return;

    case 3:
      b = c.updateQueue;

      if (null !== b) {
        a = null;
        if (null !== c.child) switch (c.child.tag) {
          case 5:
            a = c.child.stateNode;
            break;

          case 1:
            a = c.child.stateNode;
        }
        Cg(c, b, a);
      }

      return;

    case 5:
      a = c.stateNode;
      null === b && c.effectTag & 4 && Fd(c.type, c.memoizedProps) && a.focus();
      return;

    case 6:
      return;

    case 4:
      return;

    case 12:
      return;

    case 13:
      null === c.memoizedState && (c = c.alternate, null !== c && (c = c.memoizedState, null !== c && (c = c.dehydrated, null !== c && Vc(c))));
      return;

    case 19:
    case 17:
    case 20:
    case 21:
      return;
  }

  throw Error(u(163));
}

function Ki(a, b, c) {
  "function" === typeof Li && Li(b);

  switch (b.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
    case 22:
      a = b.updateQueue;

      if (null !== a && (a = a.lastEffect, null !== a)) {
        var d = a.next;
        cg(97 < c ? 97 : c, function () {
          var a = d;

          do {
            var c = a.destroy;

            if (void 0 !== c) {
              var g = b;

              try {
                c();
              } catch (h) {
                Ei(g, h);
              }
            }

            a = a.next;
          } while (a !== d);
        });
      }

      break;

    case 1:
      Fi(b);
      c = b.stateNode;
      "function" === typeof c.componentWillUnmount && Di(b, c);
      break;

    case 5:
      Fi(b);
      break;

    case 4:
      Mi(a, b, c);
  }
}

function Ni(a) {
  var b = a.alternate;
  a["return"] = null;
  a.child = null;
  a.memoizedState = null;
  a.updateQueue = null;
  a.dependencies = null;
  a.alternate = null;
  a.firstEffect = null;
  a.lastEffect = null;
  a.pendingProps = null;
  a.memoizedProps = null;
  a.stateNode = null;
  null !== b && Ni(b);
}

function Oi(a) {
  return 5 === a.tag || 3 === a.tag || 4 === a.tag;
}

function Pi(a) {
  a: {
    for (var b = a["return"]; null !== b;) {
      if (Oi(b)) {
        var c = b;
        break a;
      }

      b = b["return"];
    }

    throw Error(u(160));
  }

  b = c.stateNode;

  switch (c.tag) {
    case 5:
      var d = !1;
      break;

    case 3:
      b = b.containerInfo;
      d = !0;
      break;

    case 4:
      b = b.containerInfo;
      d = !0;
      break;

    default:
      throw Error(u(161));
  }

  c.effectTag & 16 && (Rb(b, ""), c.effectTag &= -17);

  a: b: for (c = a;;) {
    for (; null === c.sibling;) {
      if (null === c["return"] || Oi(c["return"])) {
        c = null;
        break a;
      }

      c = c["return"];
    }

    c.sibling["return"] = c["return"];

    for (c = c.sibling; 5 !== c.tag && 6 !== c.tag && 18 !== c.tag;) {
      if (c.effectTag & 2) continue b;
      if (null === c.child || 4 === c.tag) continue b;else c.child["return"] = c, c = c.child;
    }

    if (!(c.effectTag & 2)) {
      c = c.stateNode;
      break a;
    }
  }

  d ? Qi(a, c, b) : Ri(a, c, b);
}

function Qi(a, b, c) {
  var d = a.tag,
      e = 5 === d || 6 === d;
  if (e) a = e ? a.stateNode : a.stateNode.instance, b ? 8 === c.nodeType ? c.parentNode.insertBefore(a, b) : c.insertBefore(a, b) : (8 === c.nodeType ? (b = c.parentNode, b.insertBefore(a, c)) : (b = c, b.appendChild(a)), c = c._reactRootContainer, null !== c && void 0 !== c || null !== b.onclick || (b.onclick = sd));else if (4 !== d && (a = a.child, null !== a)) for (Qi(a, b, c), a = a.sibling; null !== a;) {
    Qi(a, b, c), a = a.sibling;
  }
}

function Ri(a, b, c) {
  var d = a.tag,
      e = 5 === d || 6 === d;
  if (e) a = e ? a.stateNode : a.stateNode.instance, b ? c.insertBefore(a, b) : c.appendChild(a);else if (4 !== d && (a = a.child, null !== a)) for (Ri(a, b, c), a = a.sibling; null !== a;) {
    Ri(a, b, c), a = a.sibling;
  }
}

function Mi(a, b, c) {
  for (var d = b, e = !1, f, g;;) {
    if (!e) {
      e = d["return"];

      a: for (;;) {
        if (null === e) throw Error(u(160));
        f = e.stateNode;

        switch (e.tag) {
          case 5:
            g = !1;
            break a;

          case 3:
            f = f.containerInfo;
            g = !0;
            break a;

          case 4:
            f = f.containerInfo;
            g = !0;
            break a;
        }

        e = e["return"];
      }

      e = !0;
    }

    if (5 === d.tag || 6 === d.tag) {
      a: for (var h = a, k = d, l = c, m = k;;) {
        if (Ki(h, m, l), null !== m.child && 4 !== m.tag) m.child["return"] = m, m = m.child;else {
          if (m === k) break a;

          for (; null === m.sibling;) {
            if (null === m["return"] || m["return"] === k) break a;
            m = m["return"];
          }

          m.sibling["return"] = m["return"];
          m = m.sibling;
        }
      }

      g ? (h = f, k = d.stateNode, 8 === h.nodeType ? h.parentNode.removeChild(k) : h.removeChild(k)) : f.removeChild(d.stateNode);
    } else if (4 === d.tag) {
      if (null !== d.child) {
        f = d.stateNode.containerInfo;
        g = !0;
        d.child["return"] = d;
        d = d.child;
        continue;
      }
    } else if (Ki(a, d, c), null !== d.child) {
      d.child["return"] = d;
      d = d.child;
      continue;
    }

    if (d === b) break;

    for (; null === d.sibling;) {
      if (null === d["return"] || d["return"] === b) return;
      d = d["return"];
      4 === d.tag && (e = !1);
    }

    d.sibling["return"] = d["return"];
    d = d.sibling;
  }
}

function Si(a, b) {
  switch (b.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
    case 22:
      Hi(3, b);
      return;

    case 1:
      return;

    case 5:
      var c = b.stateNode;

      if (null != c) {
        var d = b.memoizedProps,
            e = null !== a ? a.memoizedProps : d;
        a = b.type;
        var f = b.updateQueue;
        b.updateQueue = null;

        if (null !== f) {
          c[Nd] = d;
          "input" === a && "radio" === d.type && null != d.name && Bb(c, d);
          pd(a, e);
          b = pd(a, d);

          for (e = 0; e < f.length; e += 2) {
            var g = f[e],
                h = f[e + 1];
            "style" === g ? md(c, h) : "dangerouslySetInnerHTML" === g ? Qb(c, h) : "children" === g ? Rb(c, h) : Xa(c, g, h, b);
          }

          switch (a) {
            case "input":
              Cb(c, d);
              break;

            case "textarea":
              Kb(c, d);
              break;

            case "select":
              b = c._wrapperState.wasMultiple, c._wrapperState.wasMultiple = !!d.multiple, a = d.value, null != a ? Hb(c, !!d.multiple, a, !1) : b !== !!d.multiple && (null != d.defaultValue ? Hb(c, !!d.multiple, d.defaultValue, !0) : Hb(c, !!d.multiple, d.multiple ? [] : "", !1));
          }
        }
      }

      return;

    case 6:
      if (null === b.stateNode) throw Error(u(162));
      b.stateNode.nodeValue = b.memoizedProps;
      return;

    case 3:
      b = b.stateNode;
      b.hydrate && (b.hydrate = !1, Vc(b.containerInfo));
      return;

    case 12:
      return;

    case 13:
      c = b;
      null === b.memoizedState ? d = !1 : (d = !0, c = b.child, Ti = $f());
      if (null !== c) a: for (a = c;;) {
        if (5 === a.tag) f = a.stateNode, d ? (f = f.style, "function" === typeof f.setProperty ? f.setProperty("display", "none", "important") : f.display = "none") : (f = a.stateNode, e = a.memoizedProps.style, e = void 0 !== e && null !== e && e.hasOwnProperty("display") ? e.display : null, f.style.display = ld("display", e));else if (6 === a.tag) a.stateNode.nodeValue = d ? "" : a.memoizedProps;else if (13 === a.tag && null !== a.memoizedState && null === a.memoizedState.dehydrated) {
          f = a.child.sibling;
          f["return"] = a;
          a = f;
          continue;
        } else if (null !== a.child) {
          a.child["return"] = a;
          a = a.child;
          continue;
        }
        if (a === c) break;

        for (; null === a.sibling;) {
          if (null === a["return"] || a["return"] === c) break a;
          a = a["return"];
        }

        a.sibling["return"] = a["return"];
        a = a.sibling;
      }
      Ui(b);
      return;

    case 19:
      Ui(b);
      return;

    case 17:
      return;
  }

  throw Error(u(163));
}

function Ui(a) {
  var b = a.updateQueue;

  if (null !== b) {
    a.updateQueue = null;
    var c = a.stateNode;
    null === c && (c = a.stateNode = new Bi());
    b.forEach(function (b) {
      var d = Vi.bind(null, a, b);
      c.has(b) || (c.add(b), b.then(d, d));
    });
  }
}

var Wi = "function" === typeof WeakMap ? WeakMap : Map;

function Xi(a, b, c) {
  c = wg(c, null);
  c.tag = 3;
  c.payload = {
    element: null
  };
  var d = b.value;

  c.callback = function () {
    Yi || (Yi = !0, Zi = d);
    Ci(a, b);
  };

  return c;
}

function $i(a, b, c) {
  c = wg(c, null);
  c.tag = 3;
  var d = a.type.getDerivedStateFromError;

  if ("function" === typeof d) {
    var e = b.value;

    c.payload = function () {
      Ci(a, b);
      return d(e);
    };
  }

  var f = a.stateNode;
  null !== f && "function" === typeof f.componentDidCatch && (c.callback = function () {
    "function" !== typeof d && (null === aj ? aj = new Set([this]) : aj.add(this), Ci(a, b));
    var c = b.stack;
    this.componentDidCatch(b.value, {
      componentStack: null !== c ? c : ""
    });
  });
  return c;
}

var bj = Math.ceil,
    cj = Wa.ReactCurrentDispatcher,
    dj = Wa.ReactCurrentOwner,
    V = 0,
    ej = 8,
    fj = 16,
    gj = 32,
    ti = 0,
    hj = 1,
    ij = 2,
    ui = 3,
    vi = 4,
    jj = 5,
    W = V,
    T = null,
    X = null,
    U = 0,
    S = ti,
    kj = null,
    lj = 1073741823,
    mj = 1073741823,
    nj = null,
    wi = 0,
    oj = !1,
    Ti = 0,
    pj = 500,
    Y = null,
    Yi = !1,
    Zi = null,
    aj = null,
    qj = !1,
    rj = null,
    sj = 90,
    tj = null,
    uj = 0,
    vj = null,
    wj = 0;

function Gg() {
  return (W & (fj | gj)) !== V ? 1073741821 - ($f() / 10 | 0) : 0 !== wj ? wj : wj = 1073741821 - ($f() / 10 | 0);
}

function Hg(a, b, c) {
  b = b.mode;
  if (0 === (b & 2)) return 1073741823;
  var d = ag();
  if (0 === (b & 4)) return 99 === d ? 1073741823 : 1073741822;
  if ((W & fj) !== V) return U;
  if (null !== c) a = hg(a, c.timeoutMs | 0 || 5E3, 250);else switch (d) {
    case 99:
      a = 1073741823;
      break;

    case 98:
      a = hg(a, 150, 100);
      break;

    case 97:
    case 96:
      a = hg(a, 5E3, 250);
      break;

    case 95:
      a = 2;
      break;

    default:
      throw Error(u(326));
  }
  null !== T && a === U && --a;
  return a;
}

function Ig(a, b) {
  if (50 < uj) throw uj = 0, vj = null, Error(u(185));
  a = xj(a, b);

  if (null !== a) {
    var c = ag();
    1073741823 === b ? (W & ej) !== V && (W & (fj | gj)) === V ? yj(a) : (Z(a), W === V && gg()) : Z(a);
    (W & 4) === V || 98 !== c && 99 !== c || (null === tj ? tj = new Map([[a, b]]) : (c = tj.get(a), (void 0 === c || c > b) && tj.set(a, b)));
  }
}

function xj(a, b) {
  a.expirationTime < b && (a.expirationTime = b);
  var c = a.alternate;
  null !== c && c.expirationTime < b && (c.expirationTime = b);
  var d = a["return"],
      e = null;
  if (null === d && 3 === a.tag) e = a.stateNode;else for (; null !== d;) {
    c = d.alternate;
    d.childExpirationTime < b && (d.childExpirationTime = b);
    null !== c && c.childExpirationTime < b && (c.childExpirationTime = b);

    if (null === d["return"] && 3 === d.tag) {
      e = d.stateNode;
      break;
    }

    d = d["return"];
  }
  null !== e && (T === e && (Bg(b), S === vi && xi(e, U)), yi(e, b));
  return e;
}

function zj(a) {
  var b = a.lastExpiredTime;
  if (0 !== b) return b;
  b = a.firstPendingTime;
  if (!Aj(a, b)) return b;
  var c = a.lastPingedTime;
  a = a.nextKnownPendingLevel;
  a = c > a ? c : a;
  return 2 >= a && b !== a ? 0 : a;
}

function Z(a) {
  if (0 !== a.lastExpiredTime) a.callbackExpirationTime = 1073741823, a.callbackPriority = 99, a.callbackNode = eg(yj.bind(null, a));else {
    var b = zj(a),
        c = a.callbackNode;
    if (0 === b) null !== c && (a.callbackNode = null, a.callbackExpirationTime = 0, a.callbackPriority = 90);else {
      var d = Gg();
      1073741823 === b ? d = 99 : 1 === b || 2 === b ? d = 95 : (d = 10 * (1073741821 - b) - 10 * (1073741821 - d), d = 0 >= d ? 99 : 250 >= d ? 98 : 5250 >= d ? 97 : 95);

      if (null !== c) {
        var e = a.callbackPriority;
        if (a.callbackExpirationTime === b && e >= d) return;
        c !== Tf && Kf(c);
      }

      a.callbackExpirationTime = b;
      a.callbackPriority = d;
      b = 1073741823 === b ? eg(yj.bind(null, a)) : dg(d, Bj.bind(null, a), {
        timeout: 10 * (1073741821 - b) - $f()
      });
      a.callbackNode = b;
    }
  }
}

function Bj(a, b) {
  wj = 0;
  if (b) return b = Gg(), Cj(a, b), Z(a), null;
  var c = zj(a);

  if (0 !== c) {
    b = a.callbackNode;
    if ((W & (fj | gj)) !== V) throw Error(u(327));
    Dj();
    a === T && c === U || Ej(a, c);

    if (null !== X) {
      var d = W;
      W |= fj;
      var e = Fj();

      do {
        try {
          Gj();
          break;
        } catch (h) {
          Hj(a, h);
        }
      } while (1);

      ng();
      W = d;
      cj.current = e;
      if (S === hj) throw b = kj, Ej(a, c), xi(a, c), Z(a), b;
      if (null === X) switch (e = a.finishedWork = a.current.alternate, a.finishedExpirationTime = c, d = S, T = null, d) {
        case ti:
        case hj:
          throw Error(u(345));

        case ij:
          Cj(a, 2 < c ? 2 : c);
          break;

        case ui:
          xi(a, c);
          d = a.lastSuspendedTime;
          c === d && (a.nextKnownPendingLevel = Ij(e));

          if (1073741823 === lj && (e = Ti + pj - $f(), 10 < e)) {
            if (oj) {
              var f = a.lastPingedTime;

              if (0 === f || f >= c) {
                a.lastPingedTime = c;
                Ej(a, c);
                break;
              }
            }

            f = zj(a);
            if (0 !== f && f !== c) break;

            if (0 !== d && d !== c) {
              a.lastPingedTime = d;
              break;
            }

            a.timeoutHandle = Hd(Jj.bind(null, a), e);
            break;
          }

          Jj(a);
          break;

        case vi:
          xi(a, c);
          d = a.lastSuspendedTime;
          c === d && (a.nextKnownPendingLevel = Ij(e));

          if (oj && (e = a.lastPingedTime, 0 === e || e >= c)) {
            a.lastPingedTime = c;
            Ej(a, c);
            break;
          }

          e = zj(a);
          if (0 !== e && e !== c) break;

          if (0 !== d && d !== c) {
            a.lastPingedTime = d;
            break;
          }

          1073741823 !== mj ? d = 10 * (1073741821 - mj) - $f() : 1073741823 === lj ? d = 0 : (d = 10 * (1073741821 - lj) - 5E3, e = $f(), c = 10 * (1073741821 - c) - e, d = e - d, 0 > d && (d = 0), d = (120 > d ? 120 : 480 > d ? 480 : 1080 > d ? 1080 : 1920 > d ? 1920 : 3E3 > d ? 3E3 : 4320 > d ? 4320 : 1960 * bj(d / 1960)) - d, c < d && (d = c));

          if (10 < d) {
            a.timeoutHandle = Hd(Jj.bind(null, a), d);
            break;
          }

          Jj(a);
          break;

        case jj:
          if (1073741823 !== lj && null !== nj) {
            f = lj;
            var g = nj;
            d = g.busyMinDurationMs | 0;
            0 >= d ? d = 0 : (e = g.busyDelayMs | 0, f = $f() - (10 * (1073741821 - f) - (g.timeoutMs | 0 || 5E3)), d = f <= e ? 0 : e + d - f);

            if (10 < d) {
              xi(a, c);
              a.timeoutHandle = Hd(Jj.bind(null, a), d);
              break;
            }
          }

          Jj(a);
          break;

        default:
          throw Error(u(329));
      }
      Z(a);
      if (a.callbackNode === b) return Bj.bind(null, a);
    }
  }

  return null;
}

function yj(a) {
  var b = a.lastExpiredTime;
  b = 0 !== b ? b : 1073741823;
  if ((W & (fj | gj)) !== V) throw Error(u(327));
  Dj();
  a === T && b === U || Ej(a, b);

  if (null !== X) {
    var c = W;
    W |= fj;
    var d = Fj();

    do {
      try {
        Kj();
        break;
      } catch (e) {
        Hj(a, e);
      }
    } while (1);

    ng();
    W = c;
    cj.current = d;
    if (S === hj) throw c = kj, Ej(a, b), xi(a, b), Z(a), c;
    if (null !== X) throw Error(u(261));
    a.finishedWork = a.current.alternate;
    a.finishedExpirationTime = b;
    T = null;
    Jj(a);
    Z(a);
  }

  return null;
}

function Lj() {
  if (null !== tj) {
    var a = tj;
    tj = null;
    a.forEach(function (a, c) {
      Cj(c, a);
      Z(c);
    });
    gg();
  }
}

function Mj(a, b) {
  var c = W;
  W |= 1;

  try {
    return a(b);
  } finally {
    W = c, W === V && gg();
  }
}

function Nj(a, b) {
  var c = W;
  W &= -2;
  W |= ej;

  try {
    return a(b);
  } finally {
    W = c, W === V && gg();
  }
}

function Ej(a, b) {
  a.finishedWork = null;
  a.finishedExpirationTime = 0;
  var c = a.timeoutHandle;
  -1 !== c && (a.timeoutHandle = -1, Id(c));
  if (null !== X) for (c = X["return"]; null !== c;) {
    var d = c;

    switch (d.tag) {
      case 1:
        d = d.type.childContextTypes;
        null !== d && void 0 !== d && Df();
        break;

      case 3:
        eh();
        H(K);
        H(J);
        break;

      case 5:
        gh(d);
        break;

      case 4:
        eh();
        break;

      case 13:
        H(M);
        break;

      case 19:
        H(M);
        break;

      case 10:
        og(d);
    }

    c = c["return"];
  }
  T = a;
  X = Sg(a.current, null);
  U = b;
  S = ti;
  kj = null;
  mj = lj = 1073741823;
  nj = null;
  wi = 0;
  oj = !1;
}

function Hj(a, b) {
  do {
    try {
      ng();
      jh.current = sh;
      if (mh) for (var c = N.memoizedState; null !== c;) {
        var d = c.queue;
        null !== d && (d.pending = null);
        c = c.next;
      }
      lh = 0;
      P = O = N = null;
      mh = !1;
      if (null === X || null === X["return"]) return S = hj, kj = b, X = null;

      a: {
        var e = a,
            f = X["return"],
            g = X,
            h = b;
        b = U;
        g.effectTag |= 2048;
        g.firstEffect = g.lastEffect = null;

        if (null !== h && "object" === typeof h && "function" === typeof h.then) {
          var k = h;

          if (0 === (g.mode & 2)) {
            var l = g.alternate;
            l ? (g.updateQueue = l.updateQueue, g.memoizedState = l.memoizedState, g.expirationTime = l.expirationTime) : (g.updateQueue = null, g.memoizedState = null);
          }

          var m = 0 !== (M.current & 1),
              p = f;

          do {
            var x;

            if (x = 13 === p.tag) {
              var z = p.memoizedState;
              if (null !== z) x = null !== z.dehydrated ? !0 : !1;else {
                var ca = p.memoizedProps;
                x = void 0 === ca.fallback ? !1 : !0 !== ca.unstable_avoidThisFallback ? !0 : m ? !1 : !0;
              }
            }

            if (x) {
              var D = p.updateQueue;

              if (null === D) {
                var t = new Set();
                t.add(k);
                p.updateQueue = t;
              } else D.add(k);

              if (0 === (p.mode & 2)) {
                p.effectTag |= 64;
                g.effectTag &= -2981;
                if (1 === g.tag) if (null === g.alternate) g.tag = 17;else {
                  var y = wg(1073741823, null);
                  y.tag = 2;
                  xg(g, y);
                }
                g.expirationTime = 1073741823;
                break a;
              }

              h = void 0;
              g = b;
              var A = e.pingCache;
              null === A ? (A = e.pingCache = new Wi(), h = new Set(), A.set(k, h)) : (h = A.get(k), void 0 === h && (h = new Set(), A.set(k, h)));

              if (!h.has(g)) {
                h.add(g);
                var q = Oj.bind(null, e, k, g);
                k.then(q, q);
              }

              p.effectTag |= 4096;
              p.expirationTime = b;
              break a;
            }

            p = p["return"];
          } while (null !== p);

          h = Error((pb(g.type) || "A React component") + " suspended while rendering, but no fallback UI was specified.\n\nAdd a <Suspense fallback=...> component higher in the tree to provide a loading indicator or placeholder to display." + qb(g));
        }

        S !== jj && (S = ij);
        h = Ai(h, g);
        p = f;

        do {
          switch (p.tag) {
            case 3:
              k = h;
              p.effectTag |= 4096;
              p.expirationTime = b;
              var B = Xi(p, k, b);
              yg(p, B);
              break a;

            case 1:
              k = h;
              var w = p.type,
                  ub = p.stateNode;

              if (0 === (p.effectTag & 64) && ("function" === typeof w.getDerivedStateFromError || null !== ub && "function" === typeof ub.componentDidCatch && (null === aj || !aj.has(ub)))) {
                p.effectTag |= 4096;
                p.expirationTime = b;
                var vb = $i(p, k, b);
                yg(p, vb);
                break a;
              }

          }

          p = p["return"];
        } while (null !== p);
      }

      X = Pj(X);
    } catch (Xc) {
      b = Xc;
      continue;
    }

    break;
  } while (1);
}

function Fj() {
  var a = cj.current;
  cj.current = sh;
  return null === a ? sh : a;
}

function Ag(a, b) {
  a < lj && 2 < a && (lj = a);
  null !== b && a < mj && 2 < a && (mj = a, nj = b);
}

function Bg(a) {
  a > wi && (wi = a);
}

function Kj() {
  for (; null !== X;) {
    X = Qj(X);
  }
}

function Gj() {
  for (; null !== X && !Uf();) {
    X = Qj(X);
  }
}

function Qj(a) {
  var b = Rj(a.alternate, a, U);
  a.memoizedProps = a.pendingProps;
  null === b && (b = Pj(a));
  dj.current = null;
  return b;
}

function Pj(a) {
  X = a;

  do {
    var b = X.alternate;
    a = X["return"];

    if (0 === (X.effectTag & 2048)) {
      b = si(b, X, U);

      if (1 === U || 1 !== X.childExpirationTime) {
        for (var c = 0, d = X.child; null !== d;) {
          var e = d.expirationTime,
              f = d.childExpirationTime;
          e > c && (c = e);
          f > c && (c = f);
          d = d.sibling;
        }

        X.childExpirationTime = c;
      }

      if (null !== b) return b;
      null !== a && 0 === (a.effectTag & 2048) && (null === a.firstEffect && (a.firstEffect = X.firstEffect), null !== X.lastEffect && (null !== a.lastEffect && (a.lastEffect.nextEffect = X.firstEffect), a.lastEffect = X.lastEffect), 1 < X.effectTag && (null !== a.lastEffect ? a.lastEffect.nextEffect = X : a.firstEffect = X, a.lastEffect = X));
    } else {
      b = zi(X);
      if (null !== b) return b.effectTag &= 2047, b;
      null !== a && (a.firstEffect = a.lastEffect = null, a.effectTag |= 2048);
    }

    b = X.sibling;
    if (null !== b) return b;
    X = a;
  } while (null !== X);

  S === ti && (S = jj);
  return null;
}

function Ij(a) {
  var b = a.expirationTime;
  a = a.childExpirationTime;
  return b > a ? b : a;
}

function Jj(a) {
  var b = ag();
  cg(99, Sj.bind(null, a, b));
  return null;
}

function Sj(a, b) {
  do {
    Dj();
  } while (null !== rj);

  if ((W & (fj | gj)) !== V) throw Error(u(327));
  var c = a.finishedWork,
      d = a.finishedExpirationTime;
  if (null === c) return null;
  a.finishedWork = null;
  a.finishedExpirationTime = 0;
  if (c === a.current) throw Error(u(177));
  a.callbackNode = null;
  a.callbackExpirationTime = 0;
  a.callbackPriority = 90;
  a.nextKnownPendingLevel = 0;
  var e = Ij(c);
  a.firstPendingTime = e;
  d <= a.lastSuspendedTime ? a.firstSuspendedTime = a.lastSuspendedTime = a.nextKnownPendingLevel = 0 : d <= a.firstSuspendedTime && (a.firstSuspendedTime = d - 1);
  d <= a.lastPingedTime && (a.lastPingedTime = 0);
  d <= a.lastExpiredTime && (a.lastExpiredTime = 0);
  a === T && (X = T = null, U = 0);
  1 < c.effectTag ? null !== c.lastEffect ? (c.lastEffect.nextEffect = c, e = c.firstEffect) : e = c : e = c.firstEffect;

  if (null !== e) {
    var f = W;
    W |= gj;
    dj.current = null;
    Dd = fd;
    var g = xd();

    if (yd(g)) {
      if ("selectionStart" in g) var h = {
        start: g.selectionStart,
        end: g.selectionEnd
      };else a: {
        h = (h = g.ownerDocument) && h.defaultView || window;
        var k = h.getSelection && h.getSelection();

        if (k && 0 !== k.rangeCount) {
          h = k.anchorNode;
          var l = k.anchorOffset,
              m = k.focusNode;
          k = k.focusOffset;

          try {
            h.nodeType, m.nodeType;
          } catch (wb) {
            h = null;
            break a;
          }

          var p = 0,
              x = -1,
              z = -1,
              ca = 0,
              D = 0,
              t = g,
              y = null;

          b: for (;;) {
            for (var A;;) {
              t !== h || 0 !== l && 3 !== t.nodeType || (x = p + l);
              t !== m || 0 !== k && 3 !== t.nodeType || (z = p + k);
              3 === t.nodeType && (p += t.nodeValue.length);
              if (null === (A = t.firstChild)) break;
              y = t;
              t = A;
            }

            for (;;) {
              if (t === g) break b;
              y === h && ++ca === l && (x = p);
              y === m && ++D === k && (z = p);
              if (null !== (A = t.nextSibling)) break;
              t = y;
              y = t.parentNode;
            }

            t = A;
          }

          h = -1 === x || -1 === z ? null : {
            start: x,
            end: z
          };
        } else h = null;
      }
      h = h || {
        start: 0,
        end: 0
      };
    } else h = null;

    Ed = {
      activeElementDetached: null,
      focusedElem: g,
      selectionRange: h
    };
    fd = !1;
    Y = e;

    do {
      try {
        Tj();
      } catch (wb) {
        if (null === Y) throw Error(u(330));
        Ei(Y, wb);
        Y = Y.nextEffect;
      }
    } while (null !== Y);

    Y = e;

    do {
      try {
        for (g = a, h = b; null !== Y;) {
          var q = Y.effectTag;
          q & 16 && Rb(Y.stateNode, "");

          if (q & 128) {
            var B = Y.alternate;

            if (null !== B) {
              var w = B.ref;
              null !== w && ("function" === typeof w ? w(null) : w.current = null);
            }
          }

          switch (q & 1038) {
            case 2:
              Pi(Y);
              Y.effectTag &= -3;
              break;

            case 6:
              Pi(Y);
              Y.effectTag &= -3;
              Si(Y.alternate, Y);
              break;

            case 1024:
              Y.effectTag &= -1025;
              break;

            case 1028:
              Y.effectTag &= -1025;
              Si(Y.alternate, Y);
              break;

            case 4:
              Si(Y.alternate, Y);
              break;

            case 8:
              l = Y, Mi(g, l, h), Ni(l);
          }

          Y = Y.nextEffect;
        }
      } catch (wb) {
        if (null === Y) throw Error(u(330));
        Ei(Y, wb);
        Y = Y.nextEffect;
      }
    } while (null !== Y);

    w = Ed;
    B = xd();
    q = w.focusedElem;
    h = w.selectionRange;

    if (B !== q && q && q.ownerDocument && wd(q.ownerDocument.documentElement, q)) {
      null !== h && yd(q) && (B = h.start, w = h.end, void 0 === w && (w = B), "selectionStart" in q ? (q.selectionStart = B, q.selectionEnd = Math.min(w, q.value.length)) : (w = (B = q.ownerDocument || document) && B.defaultView || window, w.getSelection && (w = w.getSelection(), l = q.textContent.length, g = Math.min(h.start, l), h = void 0 === h.end ? g : Math.min(h.end, l), !w.extend && g > h && (l = h, h = g, g = l), l = vd(q, g), m = vd(q, h), l && m && (1 !== w.rangeCount || w.anchorNode !== l.node || w.anchorOffset !== l.offset || w.focusNode !== m.node || w.focusOffset !== m.offset) && (B = B.createRange(), B.setStart(l.node, l.offset), w.removeAllRanges(), g > h ? (w.addRange(B), w.extend(m.node, m.offset)) : (B.setEnd(m.node, m.offset), w.addRange(B))))));
      B = [];

      for (w = q; w = w.parentNode;) {
        1 === w.nodeType && B.push({
          element: w,
          left: w.scrollLeft,
          top: w.scrollTop
        });
      }

      "function" === typeof q.focus && q.focus();

      for (q = 0; q < B.length; q++) {
        w = B[q], w.element.scrollLeft = w.left, w.element.scrollTop = w.top;
      }
    }

    fd = !!Dd;
    Ed = Dd = null;
    a.current = c;
    Y = e;

    do {
      try {
        for (q = a; null !== Y;) {
          var ub = Y.effectTag;
          ub & 36 && Ji(q, Y.alternate, Y);

          if (ub & 128) {
            B = void 0;
            var vb = Y.ref;

            if (null !== vb) {
              var Xc = Y.stateNode;

              switch (Y.tag) {
                case 5:
                  B = Xc;
                  break;

                default:
                  B = Xc;
              }

              "function" === typeof vb ? vb(B) : vb.current = B;
            }
          }

          Y = Y.nextEffect;
        }
      } catch (wb) {
        if (null === Y) throw Error(u(330));
        Ei(Y, wb);
        Y = Y.nextEffect;
      }
    } while (null !== Y);

    Y = null;
    Vf();
    W = f;
  } else a.current = c;

  if (qj) qj = !1, rj = a, sj = b;else for (Y = e; null !== Y;) {
    b = Y.nextEffect, Y.nextEffect = null, Y = b;
  }
  b = a.firstPendingTime;
  0 === b && (aj = null);
  1073741823 === b ? a === vj ? uj++ : (uj = 0, vj = a) : uj = 0;
  "function" === typeof Uj && Uj(c.stateNode, d);
  Z(a);
  if (Yi) throw Yi = !1, a = Zi, Zi = null, a;
  if ((W & ej) !== V) return null;
  gg();
  return null;
}

function Tj() {
  for (; null !== Y;) {
    var a = Y.effectTag;
    0 !== (a & 256) && Gi(Y.alternate, Y);
    0 === (a & 512) || qj || (qj = !0, dg(97, function () {
      Dj();
      return null;
    }));
    Y = Y.nextEffect;
  }
}

function Dj() {
  if (90 !== sj) {
    var a = 97 < sj ? 97 : sj;
    sj = 90;
    return cg(a, Vj);
  }
}

function Vj() {
  if (null === rj) return !1;
  var a = rj;
  rj = null;
  if ((W & (fj | gj)) !== V) throw Error(u(331));
  var b = W;
  W |= gj;

  for (a = a.current.firstEffect; null !== a;) {
    try {
      var c = a;
      if (0 !== (c.effectTag & 512)) switch (c.tag) {
        case 0:
        case 11:
        case 15:
        case 22:
          Hi(5, c), Ii(5, c);
      }
    } catch (d) {
      if (null === a) throw Error(u(330));
      Ei(a, d);
    }

    c = a.nextEffect;
    a.nextEffect = null;
    a = c;
  }

  W = b;
  gg();
  return !0;
}

function Wj(a, b, c) {
  b = Ai(c, b);
  b = Xi(a, b, 1073741823);
  xg(a, b);
  a = xj(a, 1073741823);
  null !== a && Z(a);
}

function Ei(a, b) {
  if (3 === a.tag) Wj(a, a, b);else for (var c = a["return"]; null !== c;) {
    if (3 === c.tag) {
      Wj(c, a, b);
      break;
    } else if (1 === c.tag) {
      var d = c.stateNode;

      if ("function" === typeof c.type.getDerivedStateFromError || "function" === typeof d.componentDidCatch && (null === aj || !aj.has(d))) {
        a = Ai(b, a);
        a = $i(c, a, 1073741823);
        xg(c, a);
        c = xj(c, 1073741823);
        null !== c && Z(c);
        break;
      }
    }

    c = c["return"];
  }
}

function Oj(a, b, c) {
  var d = a.pingCache;
  null !== d && d["delete"](b);
  T === a && U === c ? S === vi || S === ui && 1073741823 === lj && $f() - Ti < pj ? Ej(a, U) : oj = !0 : Aj(a, c) && (b = a.lastPingedTime, 0 !== b && b < c || (a.lastPingedTime = c, Z(a)));
}

function Vi(a, b) {
  var c = a.stateNode;
  null !== c && c["delete"](b);
  b = 0;
  0 === b && (b = Gg(), b = Hg(b, a, null));
  a = xj(a, b);
  null !== a && Z(a);
}

var Rj;

Rj = function Rj(a, b, c) {
  var d = b.expirationTime;

  if (null !== a) {
    var e = b.pendingProps;
    if (a.memoizedProps !== e || K.current) rg = !0;else {
      if (d < c) {
        rg = !1;

        switch (b.tag) {
          case 3:
            hi(b);
            Xh();
            break;

          case 5:
            fh(b);
            if (b.mode & 4 && 1 !== c && e.hidden) return b.expirationTime = b.childExpirationTime = 1, null;
            break;

          case 1:
            L(b.type) && Gf(b);
            break;

          case 4:
            dh(b, b.stateNode.containerInfo);
            break;

          case 10:
            d = b.memoizedProps.value;
            e = b.type._context;
            I(jg, e._currentValue);
            e._currentValue = d;
            break;

          case 13:
            if (null !== b.memoizedState) {
              d = b.child.childExpirationTime;
              if (0 !== d && d >= c) return ji(a, b, c);
              I(M, M.current & 1);
              b = $h(a, b, c);
              return null !== b ? b.sibling : null;
            }

            I(M, M.current & 1);
            break;

          case 19:
            d = b.childExpirationTime >= c;

            if (0 !== (a.effectTag & 64)) {
              if (d) return mi(a, b, c);
              b.effectTag |= 64;
            }

            e = b.memoizedState;
            null !== e && (e.rendering = null, e.tail = null);
            I(M, M.current);
            if (!d) return null;
        }

        return $h(a, b, c);
      }

      rg = !1;
    }
  } else rg = !1;

  b.expirationTime = 0;

  switch (b.tag) {
    case 2:
      d = b.type;
      null !== a && (a.alternate = null, b.alternate = null, b.effectTag |= 2);
      a = b.pendingProps;
      e = Cf(b, J.current);
      qg(b, c);
      e = oh(null, b, d, a, e, c);
      b.effectTag |= 1;

      if ("object" === typeof e && null !== e && "function" === typeof e.render && void 0 === e.$$typeof) {
        b.tag = 1;
        b.memoizedState = null;
        b.updateQueue = null;

        if (L(d)) {
          var f = !0;
          Gf(b);
        } else f = !1;

        b.memoizedState = null !== e.state && void 0 !== e.state ? e.state : null;
        ug(b);
        var g = d.getDerivedStateFromProps;
        "function" === typeof g && Fg(b, d, g, a);
        e.updater = Jg;
        b.stateNode = e;
        e._reactInternalFiber = b;
        Ng(b, d, a, c);
        b = gi(null, b, d, !0, f, c);
      } else b.tag = 0, R(null, b, e, c), b = b.child;

      return b;

    case 16:
      a: {
        e = b.elementType;
        null !== a && (a.alternate = null, b.alternate = null, b.effectTag |= 2);
        a = b.pendingProps;
        ob(e);
        if (1 !== e._status) throw e._result;
        e = e._result;
        b.type = e;
        f = b.tag = Xj(e);
        a = ig(e, a);

        switch (f) {
          case 0:
            b = di(null, b, e, a, c);
            break a;

          case 1:
            b = fi(null, b, e, a, c);
            break a;

          case 11:
            b = Zh(null, b, e, a, c);
            break a;

          case 14:
            b = ai(null, b, e, ig(e.type, a), d, c);
            break a;
        }

        throw Error(u(306, e, ""));
      }

      return b;

    case 0:
      return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : ig(d, e), di(a, b, d, e, c);

    case 1:
      return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : ig(d, e), fi(a, b, d, e, c);

    case 3:
      hi(b);
      d = b.updateQueue;
      if (null === a || null === d) throw Error(u(282));
      d = b.pendingProps;
      e = b.memoizedState;
      e = null !== e ? e.element : null;
      vg(a, b);
      zg(b, d, null, c);
      d = b.memoizedState.element;
      if (d === e) Xh(), b = $h(a, b, c);else {
        if (e = b.stateNode.hydrate) Ph = Jd(b.stateNode.containerInfo.firstChild), Oh = b, e = Qh = !0;
        if (e) for (c = Yg(b, null, d, c), b.child = c; c;) {
          c.effectTag = c.effectTag & -3 | 1024, c = c.sibling;
        } else R(a, b, d, c), Xh();
        b = b.child;
      }
      return b;

    case 5:
      return fh(b), null === a && Uh(b), d = b.type, e = b.pendingProps, f = null !== a ? a.memoizedProps : null, g = e.children, Gd(d, e) ? g = null : null !== f && Gd(d, f) && (b.effectTag |= 16), ei(a, b), b.mode & 4 && 1 !== c && e.hidden ? (b.expirationTime = b.childExpirationTime = 1, b = null) : (R(a, b, g, c), b = b.child), b;

    case 6:
      return null === a && Uh(b), null;

    case 13:
      return ji(a, b, c);

    case 4:
      return dh(b, b.stateNode.containerInfo), d = b.pendingProps, null === a ? b.child = Xg(b, null, d, c) : R(a, b, d, c), b.child;

    case 11:
      return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : ig(d, e), Zh(a, b, d, e, c);

    case 7:
      return R(a, b, b.pendingProps, c), b.child;

    case 8:
      return R(a, b, b.pendingProps.children, c), b.child;

    case 12:
      return R(a, b, b.pendingProps.children, c), b.child;

    case 10:
      a: {
        d = b.type._context;
        e = b.pendingProps;
        g = b.memoizedProps;
        f = e.value;
        var h = b.type._context;
        I(jg, h._currentValue);
        h._currentValue = f;
        if (null !== g) if (h = g.value, f = $e(h, f) ? 0 : ("function" === typeof d._calculateChangedBits ? d._calculateChangedBits(h, f) : 1073741823) | 0, 0 === f) {
          if (g.children === e.children && !K.current) {
            b = $h(a, b, c);
            break a;
          }
        } else for (h = b.child, null !== h && (h["return"] = b); null !== h;) {
          var k = h.dependencies;

          if (null !== k) {
            g = h.child;

            for (var l = k.firstContext; null !== l;) {
              if (l.context === d && 0 !== (l.observedBits & f)) {
                1 === h.tag && (l = wg(c, null), l.tag = 2, xg(h, l));
                h.expirationTime < c && (h.expirationTime = c);
                l = h.alternate;
                null !== l && l.expirationTime < c && (l.expirationTime = c);
                pg(h["return"], c);
                k.expirationTime < c && (k.expirationTime = c);
                break;
              }

              l = l.next;
            }
          } else g = 10 === h.tag ? h.type === b.type ? null : h.child : h.child;

          if (null !== g) g["return"] = h;else for (g = h; null !== g;) {
            if (g === b) {
              g = null;
              break;
            }

            h = g.sibling;

            if (null !== h) {
              h["return"] = g["return"];
              g = h;
              break;
            }

            g = g["return"];
          }
          h = g;
        }
        R(a, b, e.children, c);
        b = b.child;
      }

      return b;

    case 9:
      return e = b.type, f = b.pendingProps, d = f.children, qg(b, c), e = sg(e, f.unstable_observedBits), d = d(e), b.effectTag |= 1, R(a, b, d, c), b.child;

    case 14:
      return e = b.type, f = ig(e, b.pendingProps), f = ig(e.type, f), ai(a, b, e, f, d, c);

    case 15:
      return ci(a, b, b.type, b.pendingProps, d, c);

    case 17:
      return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : ig(d, e), null !== a && (a.alternate = null, b.alternate = null, b.effectTag |= 2), b.tag = 1, L(d) ? (a = !0, Gf(b)) : a = !1, qg(b, c), Lg(b, d, e), Ng(b, d, e, c), gi(null, b, d, !0, a, c);

    case 19:
      return mi(a, b, c);
  }

  throw Error(u(156, b.tag));
};

var Uj = null,
    Li = null;

function Yj(a) {
  if ("undefined" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) return !1;
  var b = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (b.isDisabled || !b.supportsFiber) return !0;

  try {
    var c = b.inject(a);

    Uj = function Uj(a) {
      try {
        b.onCommitFiberRoot(c, a, void 0, 64 === (a.current.effectTag & 64));
      } catch (e) {}
    };

    Li = function Li(a) {
      try {
        b.onCommitFiberUnmount(c, a);
      } catch (e) {}
    };
  } catch (d) {}

  return !0;
}

function Zj(a, b, c, d) {
  this.tag = a;
  this.key = c;
  this.sibling = this.child = this["return"] = this.stateNode = this.type = this.elementType = null;
  this.index = 0;
  this.ref = null;
  this.pendingProps = b;
  this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
  this.mode = d;
  this.effectTag = 0;
  this.lastEffect = this.firstEffect = this.nextEffect = null;
  this.childExpirationTime = this.expirationTime = 0;
  this.alternate = null;
}

function Sh(a, b, c, d) {
  return new Zj(a, b, c, d);
}

function bi(a) {
  a = a.prototype;
  return !(!a || !a.isReactComponent);
}

function Xj(a) {
  if ("function" === typeof a) return bi(a) ? 1 : 0;

  if (void 0 !== a && null !== a) {
    a = a.$$typeof;
    if (a === gb) return 11;
    if (a === jb) return 14;
  }

  return 2;
}

function Sg(a, b) {
  var c = a.alternate;
  null === c ? (c = Sh(a.tag, b, a.key, a.mode), c.elementType = a.elementType, c.type = a.type, c.stateNode = a.stateNode, c.alternate = a, a.alternate = c) : (c.pendingProps = b, c.effectTag = 0, c.nextEffect = null, c.firstEffect = null, c.lastEffect = null);
  c.childExpirationTime = a.childExpirationTime;
  c.expirationTime = a.expirationTime;
  c.child = a.child;
  c.memoizedProps = a.memoizedProps;
  c.memoizedState = a.memoizedState;
  c.updateQueue = a.updateQueue;
  b = a.dependencies;
  c.dependencies = null === b ? null : {
    expirationTime: b.expirationTime,
    firstContext: b.firstContext,
    responders: b.responders
  };
  c.sibling = a.sibling;
  c.index = a.index;
  c.ref = a.ref;
  return c;
}

function Ug(a, b, c, d, e, f) {
  var g = 2;
  d = a;
  if ("function" === typeof a) bi(a) && (g = 1);else if ("string" === typeof a) g = 5;else a: switch (a) {
    case ab:
      return Wg(c.children, e, f, b);

    case fb:
      g = 8;
      e |= 7;
      break;

    case bb:
      g = 8;
      e |= 1;
      break;

    case cb:
      return a = Sh(12, c, b, e | 8), a.elementType = cb, a.type = cb, a.expirationTime = f, a;

    case hb:
      return a = Sh(13, c, b, e), a.type = hb, a.elementType = hb, a.expirationTime = f, a;

    case ib:
      return a = Sh(19, c, b, e), a.elementType = ib, a.expirationTime = f, a;

    default:
      if ("object" === typeof a && null !== a) switch (a.$$typeof) {
        case db:
          g = 10;
          break a;

        case eb:
          g = 9;
          break a;

        case gb:
          g = 11;
          break a;

        case jb:
          g = 14;
          break a;

        case kb:
          g = 16;
          d = null;
          break a;

        case lb:
          g = 22;
          break a;
      }
      throw Error(u(130, null == a ? a : typeof a, ""));
  }
  b = Sh(g, c, b, e);
  b.elementType = a;
  b.type = d;
  b.expirationTime = f;
  return b;
}

function Wg(a, b, c, d) {
  a = Sh(7, a, d, b);
  a.expirationTime = c;
  return a;
}

function Tg(a, b, c) {
  a = Sh(6, a, null, b);
  a.expirationTime = c;
  return a;
}

function Vg(a, b, c) {
  b = Sh(4, null !== a.children ? a.children : [], a.key, b);
  b.expirationTime = c;
  b.stateNode = {
    containerInfo: a.containerInfo,
    pendingChildren: null,
    implementation: a.implementation
  };
  return b;
}

function ak(a, b, c) {
  this.tag = b;
  this.current = null;
  this.containerInfo = a;
  this.pingCache = this.pendingChildren = null;
  this.finishedExpirationTime = 0;
  this.finishedWork = null;
  this.timeoutHandle = -1;
  this.pendingContext = this.context = null;
  this.hydrate = c;
  this.callbackNode = null;
  this.callbackPriority = 90;
  this.lastExpiredTime = this.lastPingedTime = this.nextKnownPendingLevel = this.lastSuspendedTime = this.firstSuspendedTime = this.firstPendingTime = 0;
}

function Aj(a, b) {
  var c = a.firstSuspendedTime;
  a = a.lastSuspendedTime;
  return 0 !== c && c >= b && a <= b;
}

function xi(a, b) {
  var c = a.firstSuspendedTime,
      d = a.lastSuspendedTime;
  c < b && (a.firstSuspendedTime = b);
  if (d > b || 0 === c) a.lastSuspendedTime = b;
  b <= a.lastPingedTime && (a.lastPingedTime = 0);
  b <= a.lastExpiredTime && (a.lastExpiredTime = 0);
}

function yi(a, b) {
  b > a.firstPendingTime && (a.firstPendingTime = b);
  var c = a.firstSuspendedTime;
  0 !== c && (b >= c ? a.firstSuspendedTime = a.lastSuspendedTime = a.nextKnownPendingLevel = 0 : b >= a.lastSuspendedTime && (a.lastSuspendedTime = b + 1), b > a.nextKnownPendingLevel && (a.nextKnownPendingLevel = b));
}

function Cj(a, b) {
  var c = a.lastExpiredTime;
  if (0 === c || c > b) a.lastExpiredTime = b;
}

function bk(a, b, c, d) {
  var e = b.current,
      f = Gg(),
      g = Dg.suspense;
  f = Hg(f, e, g);

  a: if (c) {
    c = c._reactInternalFiber;

    b: {
      if (dc(c) !== c || 1 !== c.tag) throw Error(u(170));
      var h = c;

      do {
        switch (h.tag) {
          case 3:
            h = h.stateNode.context;
            break b;

          case 1:
            if (L(h.type)) {
              h = h.stateNode.__reactInternalMemoizedMergedChildContext;
              break b;
            }

        }

        h = h["return"];
      } while (null !== h);

      throw Error(u(171));
    }

    if (1 === c.tag) {
      var k = c.type;

      if (L(k)) {
        c = Ff(c, k, h);
        break a;
      }
    }

    c = h;
  } else c = Af;

  null === b.context ? b.context = c : b.pendingContext = c;
  b = wg(f, g);
  b.payload = {
    element: a
  };
  d = void 0 === d ? null : d;
  null !== d && (b.callback = d);
  xg(e, b);
  Ig(e, f);
  return f;
}

function ck(a) {
  a = a.current;
  if (!a.child) return null;

  switch (a.child.tag) {
    case 5:
      return a.child.stateNode;

    default:
      return a.child.stateNode;
  }
}

function dk(a, b) {
  a = a.memoizedState;
  null !== a && null !== a.dehydrated && a.retryTime < b && (a.retryTime = b);
}

function ek(a, b) {
  dk(a, b);
  (a = a.alternate) && dk(a, b);
}

function fk(a, b, c) {
  c = null != c && !0 === c.hydrate;
  var d = new ak(a, b, c),
      e = Sh(3, null, null, 2 === b ? 7 : 1 === b ? 3 : 0);
  d.current = e;
  e.stateNode = d;
  ug(e);
  a[Od] = d.current;
  c && 0 !== b && Jc(a, 9 === a.nodeType ? a : a.ownerDocument);
  this._internalRoot = d;
}

fk.prototype.render = function (a) {
  bk(a, this._internalRoot, null, null);
};

fk.prototype.unmount = function () {
  var a = this._internalRoot,
      b = a.containerInfo;
  bk(null, a, null, function () {
    b[Od] = null;
  });
};

function gk(a) {
  return !(!a || 1 !== a.nodeType && 9 !== a.nodeType && 11 !== a.nodeType && (8 !== a.nodeType || " react-mount-point-unstable " !== a.nodeValue));
}

function hk(a, b) {
  b || (b = a ? 9 === a.nodeType ? a.documentElement : a.firstChild : null, b = !(!b || 1 !== b.nodeType || !b.hasAttribute("data-reactroot")));
  if (!b) for (var c; c = a.lastChild;) {
    a.removeChild(c);
  }
  return new fk(a, 0, b ? {
    hydrate: !0
  } : void 0);
}

function ik(a, b, c, d, e) {
  var f = c._reactRootContainer;

  if (f) {
    var g = f._internalRoot;

    if ("function" === typeof e) {
      var h = e;

      e = function e() {
        var a = ck(g);
        h.call(a);
      };
    }

    bk(b, g, a, e);
  } else {
    f = c._reactRootContainer = hk(c, d);
    g = f._internalRoot;

    if ("function" === typeof e) {
      var k = e;

      e = function e() {
        var a = ck(g);
        k.call(a);
      };
    }

    Nj(function () {
      bk(b, g, a, e);
    });
  }

  return ck(g);
}

function jk(a, b, c) {
  var d = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
  return {
    $$typeof: $a,
    key: null == d ? null : "" + d,
    children: a,
    containerInfo: b,
    implementation: c
  };
}

wc = function wc(a) {
  if (13 === a.tag) {
    var b = hg(Gg(), 150, 100);
    Ig(a, b);
    ek(a, b);
  }
};

xc = function xc(a) {
  13 === a.tag && (Ig(a, 3), ek(a, 3));
};

yc = function yc(a) {
  if (13 === a.tag) {
    var b = Gg();
    b = Hg(b, a, null);
    Ig(a, b);
    ek(a, b);
  }
};

za = function za(a, b, c) {
  switch (b) {
    case "input":
      Cb(a, c);
      b = c.name;

      if ("radio" === c.type && null != b) {
        for (c = a; c.parentNode;) {
          c = c.parentNode;
        }

        c = c.querySelectorAll("input[name=" + JSON.stringify("" + b) + '][type="radio"]');

        for (b = 0; b < c.length; b++) {
          var d = c[b];

          if (d !== a && d.form === a.form) {
            var e = Qd(d);
            if (!e) throw Error(u(90));
            yb(d);
            Cb(d, e);
          }
        }
      }

      break;

    case "textarea":
      Kb(a, c);
      break;

    case "select":
      b = c.value, null != b && Hb(a, !!c.multiple, b, !1);
  }
};

Fa = Mj;

Ga = function Ga(a, b, c, d, e) {
  var f = W;
  W |= 4;

  try {
    return cg(98, a.bind(null, b, c, d, e));
  } finally {
    W = f, W === V && gg();
  }
};

Ha = function Ha() {
  (W & (1 | fj | gj)) === V && (Lj(), Dj());
};

Ia = function Ia(a, b) {
  var c = W;
  W |= 2;

  try {
    return a(b);
  } finally {
    W = c, W === V && gg();
  }
};

function kk(a, b) {
  var c = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
  if (!gk(b)) throw Error(u(200));
  return jk(a, b, null, c);
}

var lk = {
  Events: [Nc, Pd, Qd, xa, ta, Xd, function (a) {
    jc(a, Wd);
  }, Da, Ea, id, mc, Dj, {
    current: !1
  }]
};

(function (a) {
  var b = a.findFiberByHostInstance;
  return Yj(objectAssign({}, a, {
    overrideHookState: null,
    overrideProps: null,
    setSuspenseHandler: null,
    scheduleUpdate: null,
    currentDispatcherRef: Wa.ReactCurrentDispatcher,
    findHostInstanceByFiber: function findHostInstanceByFiber(a) {
      a = hc(a);
      return null === a ? null : a.stateNode;
    },
    findFiberByHostInstance: function findFiberByHostInstance(a) {
      return b ? b(a) : null;
    },
    findHostInstancesForRefresh: null,
    scheduleRefresh: null,
    scheduleRoot: null,
    setRefreshHandler: null,
    getCurrentFiber: null
  }));
})({
  findFiberByHostInstance: tc,
  bundleType: 0,
  version: "16.14.0",
  rendererPackageName: "react-dom"
});

var __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = lk;
var createPortal = kk;

var findDOMNode = function findDOMNode(a) {
  if (null == a) return null;
  if (1 === a.nodeType) return a;
  var b = a._reactInternalFiber;

  if (void 0 === b) {
    if ("function" === typeof a.render) throw Error(u(188));
    throw Error(u(268, Object.keys(a)));
  }

  a = hc(b);
  a = null === a ? null : a.stateNode;
  return a;
};

var flushSync = function flushSync(a, b) {
  if ((W & (fj | gj)) !== V) throw Error(u(187));
  var c = W;
  W |= 1;

  try {
    return cg(99, a.bind(null, b));
  } finally {
    W = c, gg();
  }
};

var hydrate = function hydrate(a, b, c) {
  if (!gk(b)) throw Error(u(200));
  return ik(null, a, b, !0, c);
};

var render = function render(a, b, c) {
  if (!gk(b)) throw Error(u(200));
  return ik(null, a, b, !1, c);
};

var unmountComponentAtNode = function unmountComponentAtNode(a) {
  if (!gk(a)) throw Error(u(40));
  return a._reactRootContainer ? (Nj(function () {
    ik(null, null, a, !1, function () {
      a._reactRootContainer = null;
      a[Od] = null;
    });
  }), !0) : !1;
};

var unstable_batchedUpdates = Mj;

var unstable_createPortal = function unstable_createPortal(a, b) {
  return kk(a, b, 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null);
};

var unstable_renderSubtreeIntoContainer = function unstable_renderSubtreeIntoContainer(a, b, c, d) {
  if (!gk(c)) throw Error(u(200));
  if (null == a || void 0 === a._reactInternalFiber) throw Error(u(38));
  return ik(a, b, c, !1, d);
};

var version = "16.14.0";
var reactDom_production_min = {
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  createPortal: createPortal,
  findDOMNode: findDOMNode,
  flushSync: flushSync,
  hydrate: hydrate,
  render: render,
  unmountComponentAtNode: unmountComponentAtNode,
  unstable_batchedUpdates: unstable_batchedUpdates,
  unstable_createPortal: unstable_createPortal,
  unstable_renderSubtreeIntoContainer: unstable_renderSubtreeIntoContainer,
  version: version
};

var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';
var ReactPropTypesSecret_1 = ReactPropTypesSecret;

var printWarning = function printWarning() {};

if (process.env.NODE_ENV !== 'production') {
  var ReactPropTypesSecret$1 = ReactPropTypesSecret_1;
  var loggedTypeFailures = {};
  var has = Function.call.bind(Object.prototype.hasOwnProperty);

  printWarning = function printWarning(text) {
    var message = 'Warning: ' + text;

    if (typeof console !== 'undefined') {
      console.error(message);
    }

    try {
      throw new Error(message);
    } catch (x) {}
  };
}

function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
  if (process.env.NODE_ENV !== 'production') {
    for (var typeSpecName in typeSpecs) {
      if (has(typeSpecs, typeSpecName)) {
        var error;

        try {
          if (typeof typeSpecs[typeSpecName] !== 'function') {
            var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.');
            err.name = 'Invariant Violation';
            throw err;
          }

          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret$1);
        } catch (ex) {
          error = ex;
        }

        if (error && !(error instanceof Error)) {
          printWarning((componentName || 'React class') + ': type specification of ' + location + ' `' + typeSpecName + '` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a ' + typeof error + '. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).');
        }

        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          loggedTypeFailures[error.message] = true;
          var stack = getStack ? getStack() : '';
          printWarning('Failed ' + location + ' type: ' + error.message + (stack != null ? stack : ''));
        }
      }
    }
  }
}

checkPropTypes.resetWarningCache = function () {
  if (process.env.NODE_ENV !== 'production') {
    loggedTypeFailures = {};
  }
};

var checkPropTypes_1 = checkPropTypes;

var b = 0;
var __interactionsRef = null;
var __subscriberRef = null;

var unstable_clear = function unstable_clear(a) {
  return a();
};

var unstable_getCurrent = function unstable_getCurrent() {
  return null;
};

var unstable_getThreadID = function unstable_getThreadID() {
  return ++b;
};

var unstable_subscribe = function unstable_subscribe() {};

var unstable_trace = function unstable_trace(a, d, c) {
  return c();
};

var unstable_unsubscribe = function unstable_unsubscribe() {};

var unstable_wrap = function unstable_wrap(a) {
  return a;
};

var schedulerTracing_production_min = {
  __interactionsRef: __interactionsRef,
  __subscriberRef: __subscriberRef,
  unstable_clear: unstable_clear,
  unstable_getCurrent: unstable_getCurrent,
  unstable_getThreadID: unstable_getThreadID,
  unstable_subscribe: unstable_subscribe,
  unstable_trace: unstable_trace,
  unstable_unsubscribe: unstable_unsubscribe,
  unstable_wrap: unstable_wrap
};

var schedulerTracing_development = createCommonjsModule(function (module, exports) {

  if (process.env.NODE_ENV !== "production") {
    (function () {

      var DEFAULT_THREAD_ID = 0;
      var interactionIDCounter = 0;
      var threadIDCounter = 0;
      exports.__interactionsRef = null;
      exports.__subscriberRef = null;
      {
        exports.__interactionsRef = {
          current: new Set()
        };
        exports.__subscriberRef = {
          current: null
        };
      }

      function unstable_clear(callback) {
        var prevInteractions = exports.__interactionsRef.current;
        exports.__interactionsRef.current = new Set();

        try {
          return callback();
        } finally {
          exports.__interactionsRef.current = prevInteractions;
        }
      }

      function unstable_getCurrent() {
        {
          return exports.__interactionsRef.current;
        }
      }

      function unstable_getThreadID() {
        return ++threadIDCounter;
      }

      function unstable_trace(name, timestamp, callback) {
        var threadID = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : DEFAULT_THREAD_ID;
        var interaction = {
          __count: 1,
          id: interactionIDCounter++,
          name: name,
          timestamp: timestamp
        };
        var prevInteractions = exports.__interactionsRef.current;
        var interactions = new Set(prevInteractions);
        interactions.add(interaction);
        exports.__interactionsRef.current = interactions;
        var subscriber = exports.__subscriberRef.current;
        var returnValue;

        try {
          if (subscriber !== null) {
            subscriber.onInteractionTraced(interaction);
          }
        } finally {
          try {
            if (subscriber !== null) {
              subscriber.onWorkStarted(interactions, threadID);
            }
          } finally {
            try {
              returnValue = callback();
            } finally {
              exports.__interactionsRef.current = prevInteractions;

              try {
                if (subscriber !== null) {
                  subscriber.onWorkStopped(interactions, threadID);
                }
              } finally {
                interaction.__count--;

                if (subscriber !== null && interaction.__count === 0) {
                  subscriber.onInteractionScheduledWorkCompleted(interaction);
                }
              }
            }
          }
        }

        return returnValue;
      }

      function unstable_wrap(callback) {
        var threadID = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_THREAD_ID;
        var wrappedInteractions = exports.__interactionsRef.current;
        var subscriber = exports.__subscriberRef.current;

        if (subscriber !== null) {
          subscriber.onWorkScheduled(wrappedInteractions, threadID);
        }

        wrappedInteractions.forEach(function (interaction) {
          interaction.__count++;
        });
        var hasRun = false;

        function wrapped() {
          var prevInteractions = exports.__interactionsRef.current;
          exports.__interactionsRef.current = wrappedInteractions;
          subscriber = exports.__subscriberRef.current;

          try {
            var returnValue;

            try {
              if (subscriber !== null) {
                subscriber.onWorkStarted(wrappedInteractions, threadID);
              }
            } finally {
              try {
                returnValue = callback.apply(undefined, arguments);
              } finally {
                exports.__interactionsRef.current = prevInteractions;

                if (subscriber !== null) {
                  subscriber.onWorkStopped(wrappedInteractions, threadID);
                }
              }
            }

            return returnValue;
          } finally {
            if (!hasRun) {
              hasRun = true;
              wrappedInteractions.forEach(function (interaction) {
                interaction.__count--;

                if (subscriber !== null && interaction.__count === 0) {
                  subscriber.onInteractionScheduledWorkCompleted(interaction);
                }
              });
            }
          }
        }

        wrapped.cancel = function cancel() {
          subscriber = exports.__subscriberRef.current;

          try {
            if (subscriber !== null) {
              subscriber.onWorkCanceled(wrappedInteractions, threadID);
            }
          } finally {
            wrappedInteractions.forEach(function (interaction) {
              interaction.__count--;

              if (subscriber && interaction.__count === 0) {
                subscriber.onInteractionScheduledWorkCompleted(interaction);
              }
            });
          }
        };

        return wrapped;
      }

      var subscribers = null;
      {
        subscribers = new Set();
      }

      function unstable_subscribe(subscriber) {
        {
          subscribers.add(subscriber);

          if (subscribers.size === 1) {
            exports.__subscriberRef.current = {
              onInteractionScheduledWorkCompleted: onInteractionScheduledWorkCompleted,
              onInteractionTraced: onInteractionTraced,
              onWorkCanceled: onWorkCanceled,
              onWorkScheduled: onWorkScheduled,
              onWorkStarted: onWorkStarted,
              onWorkStopped: onWorkStopped
            };
          }
        }
      }

      function unstable_unsubscribe(subscriber) {
        {
          subscribers["delete"](subscriber);

          if (subscribers.size === 0) {
            exports.__subscriberRef.current = null;
          }
        }
      }

      function onInteractionTraced(interaction) {
        var didCatchError = false;
        var caughtError = null;
        subscribers.forEach(function (subscriber) {
          try {
            subscriber.onInteractionTraced(interaction);
          } catch (error) {
            if (!didCatchError) {
              didCatchError = true;
              caughtError = error;
            }
          }
        });

        if (didCatchError) {
          throw caughtError;
        }
      }

      function onInteractionScheduledWorkCompleted(interaction) {
        var didCatchError = false;
        var caughtError = null;
        subscribers.forEach(function (subscriber) {
          try {
            subscriber.onInteractionScheduledWorkCompleted(interaction);
          } catch (error) {
            if (!didCatchError) {
              didCatchError = true;
              caughtError = error;
            }
          }
        });

        if (didCatchError) {
          throw caughtError;
        }
      }

      function onWorkScheduled(interactions, threadID) {
        var didCatchError = false;
        var caughtError = null;
        subscribers.forEach(function (subscriber) {
          try {
            subscriber.onWorkScheduled(interactions, threadID);
          } catch (error) {
            if (!didCatchError) {
              didCatchError = true;
              caughtError = error;
            }
          }
        });

        if (didCatchError) {
          throw caughtError;
        }
      }

      function onWorkStarted(interactions, threadID) {
        var didCatchError = false;
        var caughtError = null;
        subscribers.forEach(function (subscriber) {
          try {
            subscriber.onWorkStarted(interactions, threadID);
          } catch (error) {
            if (!didCatchError) {
              didCatchError = true;
              caughtError = error;
            }
          }
        });

        if (didCatchError) {
          throw caughtError;
        }
      }

      function onWorkStopped(interactions, threadID) {
        var didCatchError = false;
        var caughtError = null;
        subscribers.forEach(function (subscriber) {
          try {
            subscriber.onWorkStopped(interactions, threadID);
          } catch (error) {
            if (!didCatchError) {
              didCatchError = true;
              caughtError = error;
            }
          }
        });

        if (didCatchError) {
          throw caughtError;
        }
      }

      function onWorkCanceled(interactions, threadID) {
        var didCatchError = false;
        var caughtError = null;
        subscribers.forEach(function (subscriber) {
          try {
            subscriber.onWorkCanceled(interactions, threadID);
          } catch (error) {
            if (!didCatchError) {
              didCatchError = true;
              caughtError = error;
            }
          }
        });

        if (didCatchError) {
          throw caughtError;
        }
      }

      exports.unstable_clear = unstable_clear;
      exports.unstable_getCurrent = unstable_getCurrent;
      exports.unstable_getThreadID = unstable_getThreadID;
      exports.unstable_subscribe = unstable_subscribe;
      exports.unstable_trace = unstable_trace;
      exports.unstable_unsubscribe = unstable_unsubscribe;
      exports.unstable_wrap = unstable_wrap;
    })();
  }
});

var tracing = createCommonjsModule(function (module) {

  if (process.env.NODE_ENV === 'production') {
    module.exports = schedulerTracing_production_min;
  } else {
    module.exports = schedulerTracing_development;
  }
});

var reactDom_development = createCommonjsModule(function (module, exports) {

  if (process.env.NODE_ENV !== "production") {
    (function () {

      var React$1 = React;
      var _assign = objectAssign;
      var Scheduler = scheduler;
      var checkPropTypes = checkPropTypes_1;
      var tracing$1 = tracing;
      var ReactSharedInternals = React$1.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

      if (!ReactSharedInternals.hasOwnProperty('ReactCurrentDispatcher')) {
        ReactSharedInternals.ReactCurrentDispatcher = {
          current: null
        };
      }

      if (!ReactSharedInternals.hasOwnProperty('ReactCurrentBatchConfig')) {
        ReactSharedInternals.ReactCurrentBatchConfig = {
          suspense: null
        };
      }

      function warn(format) {
        {
          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          printWarning('warn', format, args);
        }
      }

      function error(format) {
        {
          for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
          }

          printWarning('error', format, args);
        }
      }

      function printWarning(level, format, args) {
        {
          var hasExistingStack = args.length > 0 && typeof args[args.length - 1] === 'string' && args[args.length - 1].indexOf('\n    in') === 0;

          if (!hasExistingStack) {
            var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
            var stack = ReactDebugCurrentFrame.getStackAddendum();

            if (stack !== '') {
              format += '%s';
              args = args.concat([stack]);
            }
          }

          var argsWithFormat = args.map(function (item) {
            return '' + item;
          });
          argsWithFormat.unshift('Warning: ' + format);
          Function.prototype.apply.call(console[level], console, argsWithFormat);

          try {
            var argIndex = 0;
            var message = 'Warning: ' + format.replace(/%s/g, function () {
              return args[argIndex++];
            });
            throw new Error(message);
          } catch (x) {}
        }
      }

      if (!React$1) {
        {
          throw Error("ReactDOM was loaded before React. Make sure you load the React package before loading ReactDOM.");
        }
      }

      var invokeGuardedCallbackImpl = function invokeGuardedCallbackImpl(name, func, context, a, b, c, d, e, f) {
        var funcArgs = Array.prototype.slice.call(arguments, 3);

        try {
          func.apply(context, funcArgs);
        } catch (error) {
          this.onError(error);
        }
      };

      {
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof document !== 'undefined' && typeof document.createEvent === 'function') {
          var fakeNode = document.createElement('react');

          var invokeGuardedCallbackDev = function invokeGuardedCallbackDev(name, func, context, a, b, c, d, e, f) {
            if (!(typeof document !== 'undefined')) {
              {
                throw Error("The `document` global was defined when React was initialized, but is not defined anymore. This can happen in a test environment if a component schedules an update from an asynchronous callback, but the test has already finished running. To solve this, you can either unmount the component at the end of your test (and ensure that any asynchronous operations get canceled in `componentWillUnmount`), or you can change the test itself to be asynchronous.");
              }
            }

            var evt = document.createEvent('Event');
            var didError = true;
            var windowEvent = window.event;
            var windowEventDescriptor = Object.getOwnPropertyDescriptor(window, 'event');
            var funcArgs = Array.prototype.slice.call(arguments, 3);

            function callCallback() {
              fakeNode.removeEventListener(evtType, callCallback, false);

              if (typeof window.event !== 'undefined' && window.hasOwnProperty('event')) {
                window.event = windowEvent;
              }

              func.apply(context, funcArgs);
              didError = false;
            }

            var error;
            var didSetError = false;
            var isCrossOriginError = false;

            function handleWindowError(event) {
              error = event.error;
              didSetError = true;

              if (error === null && event.colno === 0 && event.lineno === 0) {
                isCrossOriginError = true;
              }

              if (event.defaultPrevented) {
                if (error != null && typeof error === 'object') {
                  try {
                    error._suppressLogging = true;
                  } catch (inner) {}
                }
              }
            }

            var evtType = "react-" + (name ? name : 'invokeguardedcallback');
            window.addEventListener('error', handleWindowError);
            fakeNode.addEventListener(evtType, callCallback, false);
            evt.initEvent(evtType, false, false);
            fakeNode.dispatchEvent(evt);

            if (windowEventDescriptor) {
              Object.defineProperty(window, 'event', windowEventDescriptor);
            }

            if (didError) {
              if (!didSetError) {
                error = new Error('An error was thrown inside one of your components, but React ' + "doesn't know what it was. This is likely due to browser " + 'flakiness. React does its best to preserve the "Pause on ' + 'exceptions" behavior of the DevTools, which requires some ' + "DEV-mode only tricks. It's possible that these don't work in " + 'your browser. Try triggering the error in production mode, ' + 'or switching to a modern browser. If you suspect that this is ' + 'actually an issue with React, please file an issue.');
              } else if (isCrossOriginError) {
                error = new Error("A cross-origin error was thrown. React doesn't have access to " + 'the actual error object in development. ' + 'See https://fb.me/react-crossorigin-error for more information.');
              }

              this.onError(error);
            }

            window.removeEventListener('error', handleWindowError);
          };

          invokeGuardedCallbackImpl = invokeGuardedCallbackDev;
        }
      }
      var invokeGuardedCallbackImpl$1 = invokeGuardedCallbackImpl;
      var hasError = false;
      var caughtError = null;
      var hasRethrowError = false;
      var rethrowError = null;
      var reporter = {
        onError: function onError(error) {
          hasError = true;
          caughtError = error;
        }
      };

      function invokeGuardedCallback(name, func, context, a, b, c, d, e, f) {
        hasError = false;
        caughtError = null;
        invokeGuardedCallbackImpl$1.apply(reporter, arguments);
      }

      function invokeGuardedCallbackAndCatchFirstError(name, func, context, a, b, c, d, e, f) {
        invokeGuardedCallback.apply(this, arguments);

        if (hasError) {
          var error = clearCaughtError();

          if (!hasRethrowError) {
            hasRethrowError = true;
            rethrowError = error;
          }
        }
      }

      function rethrowCaughtError() {
        if (hasRethrowError) {
          var error = rethrowError;
          hasRethrowError = false;
          rethrowError = null;
          throw error;
        }
      }

      function hasCaughtError() {
        return hasError;
      }

      function clearCaughtError() {
        if (hasError) {
          var error = caughtError;
          hasError = false;
          caughtError = null;
          return error;
        } else {
          {
            {
              throw Error("clearCaughtError was called but no error was captured. This error is likely caused by a bug in React. Please file an issue.");
            }
          }
        }
      }

      var getFiberCurrentPropsFromNode = null;
      var getInstanceFromNode = null;
      var getNodeFromInstance = null;

      function setComponentTree(getFiberCurrentPropsFromNodeImpl, getInstanceFromNodeImpl, getNodeFromInstanceImpl) {
        getFiberCurrentPropsFromNode = getFiberCurrentPropsFromNodeImpl;
        getInstanceFromNode = getInstanceFromNodeImpl;
        getNodeFromInstance = getNodeFromInstanceImpl;
        {
          if (!getNodeFromInstance || !getInstanceFromNode) {
            error('EventPluginUtils.setComponentTree(...): Injected ' + 'module is missing getNodeFromInstance or getInstanceFromNode.');
          }
        }
      }

      var validateEventDispatches;
      {
        validateEventDispatches = function validateEventDispatches(event) {
          var dispatchListeners = event._dispatchListeners;
          var dispatchInstances = event._dispatchInstances;
          var listenersIsArr = Array.isArray(dispatchListeners);
          var listenersLen = listenersIsArr ? dispatchListeners.length : dispatchListeners ? 1 : 0;
          var instancesIsArr = Array.isArray(dispatchInstances);
          var instancesLen = instancesIsArr ? dispatchInstances.length : dispatchInstances ? 1 : 0;

          if (instancesIsArr !== listenersIsArr || instancesLen !== listenersLen) {
            error('EventPluginUtils: Invalid `event`.');
          }
        };
      }

      function executeDispatch(event, listener, inst) {
        var type = event.type || 'unknown-event';
        event.currentTarget = getNodeFromInstance(inst);
        invokeGuardedCallbackAndCatchFirstError(type, listener, undefined, event);
        event.currentTarget = null;
      }

      function executeDispatchesInOrder(event) {
        var dispatchListeners = event._dispatchListeners;
        var dispatchInstances = event._dispatchInstances;
        {
          validateEventDispatches(event);
        }

        if (Array.isArray(dispatchListeners)) {
          for (var i = 0; i < dispatchListeners.length; i++) {
            if (event.isPropagationStopped()) {
              break;
            }

            executeDispatch(event, dispatchListeners[i], dispatchInstances[i]);
          }
        } else if (dispatchListeners) {
          executeDispatch(event, dispatchListeners, dispatchInstances);
        }

        event._dispatchListeners = null;
        event._dispatchInstances = null;
      }

      var FunctionComponent = 0;
      var ClassComponent = 1;
      var IndeterminateComponent = 2;
      var HostRoot = 3;
      var HostPortal = 4;
      var HostComponent = 5;
      var HostText = 6;
      var Fragment = 7;
      var Mode = 8;
      var ContextConsumer = 9;
      var ContextProvider = 10;
      var ForwardRef = 11;
      var Profiler = 12;
      var SuspenseComponent = 13;
      var MemoComponent = 14;
      var SimpleMemoComponent = 15;
      var LazyComponent = 16;
      var IncompleteClassComponent = 17;
      var DehydratedFragment = 18;
      var SuspenseListComponent = 19;
      var FundamentalComponent = 20;
      var ScopeComponent = 21;
      var Block = 22;
      var eventPluginOrder = null;
      var namesToPlugins = {};

      function recomputePluginOrdering() {
        if (!eventPluginOrder) {
          return;
        }

        for (var pluginName in namesToPlugins) {
          var pluginModule = namesToPlugins[pluginName];
          var pluginIndex = eventPluginOrder.indexOf(pluginName);

          if (!(pluginIndex > -1)) {
            {
              throw Error("EventPluginRegistry: Cannot inject event plugins that do not exist in the plugin ordering, `" + pluginName + "`.");
            }
          }

          if (plugins[pluginIndex]) {
            continue;
          }

          if (!pluginModule.extractEvents) {
            {
              throw Error("EventPluginRegistry: Event plugins must implement an `extractEvents` method, but `" + pluginName + "` does not.");
            }
          }

          plugins[pluginIndex] = pluginModule;
          var publishedEvents = pluginModule.eventTypes;

          for (var eventName in publishedEvents) {
            if (!publishEventForPlugin(publishedEvents[eventName], pluginModule, eventName)) {
              {
                throw Error("EventPluginRegistry: Failed to publish event `" + eventName + "` for plugin `" + pluginName + "`.");
              }
            }
          }
        }
      }

      function publishEventForPlugin(dispatchConfig, pluginModule, eventName) {
        if (!!eventNameDispatchConfigs.hasOwnProperty(eventName)) {
          {
            throw Error("EventPluginRegistry: More than one plugin attempted to publish the same event name, `" + eventName + "`.");
          }
        }

        eventNameDispatchConfigs[eventName] = dispatchConfig;
        var phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;

        if (phasedRegistrationNames) {
          for (var phaseName in phasedRegistrationNames) {
            if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
              var phasedRegistrationName = phasedRegistrationNames[phaseName];
              publishRegistrationName(phasedRegistrationName, pluginModule, eventName);
            }
          }

          return true;
        } else if (dispatchConfig.registrationName) {
          publishRegistrationName(dispatchConfig.registrationName, pluginModule, eventName);
          return true;
        }

        return false;
      }

      function publishRegistrationName(registrationName, pluginModule, eventName) {
        if (!!registrationNameModules[registrationName]) {
          {
            throw Error("EventPluginRegistry: More than one plugin attempted to publish the same registration name, `" + registrationName + "`.");
          }
        }

        registrationNameModules[registrationName] = pluginModule;
        registrationNameDependencies[registrationName] = pluginModule.eventTypes[eventName].dependencies;
        {
          var lowerCasedName = registrationName.toLowerCase();
          possibleRegistrationNames[lowerCasedName] = registrationName;

          if (registrationName === 'onDoubleClick') {
            possibleRegistrationNames.ondblclick = registrationName;
          }
        }
      }

      var plugins = [];
      var eventNameDispatchConfigs = {};
      var registrationNameModules = {};
      var registrationNameDependencies = {};
      var possibleRegistrationNames = {};

      function injectEventPluginOrder(injectedEventPluginOrder) {
        if (!!eventPluginOrder) {
          {
            throw Error("EventPluginRegistry: Cannot inject event plugin ordering more than once. You are likely trying to load more than one copy of React.");
          }
        }

        eventPluginOrder = Array.prototype.slice.call(injectedEventPluginOrder);
        recomputePluginOrdering();
      }

      function injectEventPluginsByName(injectedNamesToPlugins) {
        var isOrderingDirty = false;

        for (var pluginName in injectedNamesToPlugins) {
          if (!injectedNamesToPlugins.hasOwnProperty(pluginName)) {
            continue;
          }

          var pluginModule = injectedNamesToPlugins[pluginName];

          if (!namesToPlugins.hasOwnProperty(pluginName) || namesToPlugins[pluginName] !== pluginModule) {
            if (!!namesToPlugins[pluginName]) {
              {
                throw Error("EventPluginRegistry: Cannot inject two different event plugins using the same name, `" + pluginName + "`.");
              }
            }

            namesToPlugins[pluginName] = pluginModule;
            isOrderingDirty = true;
          }
        }

        if (isOrderingDirty) {
          recomputePluginOrdering();
        }
      }

      var canUseDOM = !!(typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof window.document.createElement !== 'undefined');
      var PLUGIN_EVENT_SYSTEM = 1;
      var IS_REPLAYED = 1 << 5;
      var IS_FIRST_ANCESTOR = 1 << 6;
      var restoreImpl = null;
      var restoreTarget = null;
      var restoreQueue = null;

      function restoreStateOfTarget(target) {
        var internalInstance = getInstanceFromNode(target);

        if (!internalInstance) {
          return;
        }

        if (!(typeof restoreImpl === 'function')) {
          {
            throw Error("setRestoreImplementation() needs to be called to handle a target for controlled events. This error is likely caused by a bug in React. Please file an issue.");
          }
        }

        var stateNode = internalInstance.stateNode;

        if (stateNode) {
          var _props = getFiberCurrentPropsFromNode(stateNode);

          restoreImpl(internalInstance.stateNode, internalInstance.type, _props);
        }
      }

      function setRestoreImplementation(impl) {
        restoreImpl = impl;
      }

      function enqueueStateRestore(target) {
        if (restoreTarget) {
          if (restoreQueue) {
            restoreQueue.push(target);
          } else {
            restoreQueue = [target];
          }
        } else {
          restoreTarget = target;
        }
      }

      function needsStateRestore() {
        return restoreTarget !== null || restoreQueue !== null;
      }

      function restoreStateIfNeeded() {
        if (!restoreTarget) {
          return;
        }

        var target = restoreTarget;
        var queuedTargets = restoreQueue;
        restoreTarget = null;
        restoreQueue = null;
        restoreStateOfTarget(target);

        if (queuedTargets) {
          for (var i = 0; i < queuedTargets.length; i++) {
            restoreStateOfTarget(queuedTargets[i]);
          }
        }
      }

      var enableProfilerTimer = true;
      var enableDeprecatedFlareAPI = false;
      var enableFundamentalAPI = false;
      var warnAboutStringRefs = false;

      var batchedUpdatesImpl = function batchedUpdatesImpl(fn, bookkeeping) {
        return fn(bookkeeping);
      };

      var discreteUpdatesImpl = function discreteUpdatesImpl(fn, a, b, c, d) {
        return fn(a, b, c, d);
      };

      var flushDiscreteUpdatesImpl = function flushDiscreteUpdatesImpl() {};

      var batchedEventUpdatesImpl = batchedUpdatesImpl;
      var isInsideEventHandler = false;
      var isBatchingEventUpdates = false;

      function finishEventHandler() {
        var controlledComponentsHavePendingUpdates = needsStateRestore();

        if (controlledComponentsHavePendingUpdates) {
          flushDiscreteUpdatesImpl();
          restoreStateIfNeeded();
        }
      }

      function batchedUpdates(fn, bookkeeping) {
        if (isInsideEventHandler) {
          return fn(bookkeeping);
        }

        isInsideEventHandler = true;

        try {
          return batchedUpdatesImpl(fn, bookkeeping);
        } finally {
          isInsideEventHandler = false;
          finishEventHandler();
        }
      }

      function batchedEventUpdates(fn, a, b) {
        if (isBatchingEventUpdates) {
          return fn(a, b);
        }

        isBatchingEventUpdates = true;

        try {
          return batchedEventUpdatesImpl(fn, a, b);
        } finally {
          isBatchingEventUpdates = false;
          finishEventHandler();
        }
      }

      function discreteUpdates(fn, a, b, c, d) {
        var prevIsInsideEventHandler = isInsideEventHandler;
        isInsideEventHandler = true;

        try {
          return discreteUpdatesImpl(fn, a, b, c, d);
        } finally {
          isInsideEventHandler = prevIsInsideEventHandler;

          if (!isInsideEventHandler) {
            finishEventHandler();
          }
        }
      }

      function flushDiscreteUpdatesIfNeeded(timeStamp) {
        if (!isInsideEventHandler && !enableDeprecatedFlareAPI) {
          flushDiscreteUpdatesImpl();
        }
      }

      function setBatchingImplementation(_batchedUpdatesImpl, _discreteUpdatesImpl, _flushDiscreteUpdatesImpl, _batchedEventUpdatesImpl) {
        batchedUpdatesImpl = _batchedUpdatesImpl;
        discreteUpdatesImpl = _discreteUpdatesImpl;
        flushDiscreteUpdatesImpl = _flushDiscreteUpdatesImpl;
        batchedEventUpdatesImpl = _batchedEventUpdatesImpl;
      }

      var DiscreteEvent = 0;
      var UserBlockingEvent = 1;
      var ContinuousEvent = 2;
      var RESERVED = 0;
      var STRING = 1;
      var BOOLEANISH_STRING = 2;
      var BOOLEAN = 3;
      var OVERLOADED_BOOLEAN = 4;
      var NUMERIC = 5;
      var POSITIVE_NUMERIC = 6;
      var ATTRIBUTE_NAME_START_CHAR = ":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
      var ATTRIBUTE_NAME_CHAR = ATTRIBUTE_NAME_START_CHAR + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
      var ROOT_ATTRIBUTE_NAME = 'data-reactroot';
      var VALID_ATTRIBUTE_NAME_REGEX = new RegExp('^[' + ATTRIBUTE_NAME_START_CHAR + '][' + ATTRIBUTE_NAME_CHAR + ']*$');
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var illegalAttributeNameCache = {};
      var validatedAttributeNameCache = {};

      function isAttributeNameSafe(attributeName) {
        if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) {
          return true;
        }

        if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) {
          return false;
        }

        if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
          validatedAttributeNameCache[attributeName] = true;
          return true;
        }

        illegalAttributeNameCache[attributeName] = true;
        {
          error('Invalid attribute name: `%s`', attributeName);
        }
        return false;
      }

      function shouldIgnoreAttribute(name, propertyInfo, isCustomComponentTag) {
        if (propertyInfo !== null) {
          return propertyInfo.type === RESERVED;
        }

        if (isCustomComponentTag) {
          return false;
        }

        if (name.length > 2 && (name[0] === 'o' || name[0] === 'O') && (name[1] === 'n' || name[1] === 'N')) {
          return true;
        }

        return false;
      }

      function shouldRemoveAttributeWithWarning(name, value, propertyInfo, isCustomComponentTag) {
        if (propertyInfo !== null && propertyInfo.type === RESERVED) {
          return false;
        }

        switch (typeof value) {
          case 'function':
          case 'symbol':
            return true;

          case 'boolean':
            {
              if (isCustomComponentTag) {
                return false;
              }

              if (propertyInfo !== null) {
                return !propertyInfo.acceptsBooleans;
              } else {
                var prefix = name.toLowerCase().slice(0, 5);
                return prefix !== 'data-' && prefix !== 'aria-';
              }
            }

          default:
            return false;
        }
      }

      function shouldRemoveAttribute(name, value, propertyInfo, isCustomComponentTag) {
        if (value === null || typeof value === 'undefined') {
          return true;
        }

        if (shouldRemoveAttributeWithWarning(name, value, propertyInfo, isCustomComponentTag)) {
          return true;
        }

        if (isCustomComponentTag) {
          return false;
        }

        if (propertyInfo !== null) {
          switch (propertyInfo.type) {
            case BOOLEAN:
              return !value;

            case OVERLOADED_BOOLEAN:
              return value === false;

            case NUMERIC:
              return isNaN(value);

            case POSITIVE_NUMERIC:
              return isNaN(value) || value < 1;
          }
        }

        return false;
      }

      function getPropertyInfo(name) {
        return properties.hasOwnProperty(name) ? properties[name] : null;
      }

      function PropertyInfoRecord(name, type, mustUseProperty, attributeName, attributeNamespace, sanitizeURL) {
        this.acceptsBooleans = type === BOOLEANISH_STRING || type === BOOLEAN || type === OVERLOADED_BOOLEAN;
        this.attributeName = attributeName;
        this.attributeNamespace = attributeNamespace;
        this.mustUseProperty = mustUseProperty;
        this.propertyName = name;
        this.type = type;
        this.sanitizeURL = sanitizeURL;
      }

      var properties = {};
      var reservedProps = ['children', 'dangerouslySetInnerHTML', 'defaultValue', 'defaultChecked', 'innerHTML', 'suppressContentEditableWarning', 'suppressHydrationWarning', 'style'];
      reservedProps.forEach(function (name) {
        properties[name] = new PropertyInfoRecord(name, RESERVED, false, name, null, false);
      });
      [['acceptCharset', 'accept-charset'], ['className', 'class'], ['htmlFor', 'for'], ['httpEquiv', 'http-equiv']].forEach(function (_ref) {
        var name = _ref[0],
            attributeName = _ref[1];
        properties[name] = new PropertyInfoRecord(name, STRING, false, attributeName, null, false);
      });
      ['contentEditable', 'draggable', 'spellCheck', 'value'].forEach(function (name) {
        properties[name] = new PropertyInfoRecord(name, BOOLEANISH_STRING, false, name.toLowerCase(), null, false);
      });
      ['autoReverse', 'externalResourcesRequired', 'focusable', 'preserveAlpha'].forEach(function (name) {
        properties[name] = new PropertyInfoRecord(name, BOOLEANISH_STRING, false, name, null, false);
      });
      ['allowFullScreen', 'async', 'autoFocus', 'autoPlay', 'controls', 'default', 'defer', 'disabled', 'disablePictureInPicture', 'formNoValidate', 'hidden', 'loop', 'noModule', 'noValidate', 'open', 'playsInline', 'readOnly', 'required', 'reversed', 'scoped', 'seamless', 'itemScope'].forEach(function (name) {
        properties[name] = new PropertyInfoRecord(name, BOOLEAN, false, name.toLowerCase(), null, false);
      });
      ['checked', 'multiple', 'muted', 'selected'].forEach(function (name) {
        properties[name] = new PropertyInfoRecord(name, BOOLEAN, true, name, null, false);
      });
      ['capture', 'download'].forEach(function (name) {
        properties[name] = new PropertyInfoRecord(name, OVERLOADED_BOOLEAN, false, name, null, false);
      });
      ['cols', 'rows', 'size', 'span'].forEach(function (name) {
        properties[name] = new PropertyInfoRecord(name, POSITIVE_NUMERIC, false, name, null, false);
      });
      ['rowSpan', 'start'].forEach(function (name) {
        properties[name] = new PropertyInfoRecord(name, NUMERIC, false, name.toLowerCase(), null, false);
      });
      var CAMELIZE = /[\-\:]([a-z])/g;

      var capitalize = function capitalize(token) {
        return token[1].toUpperCase();
      };

      ['accent-height', 'alignment-baseline', 'arabic-form', 'baseline-shift', 'cap-height', 'clip-path', 'clip-rule', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'dominant-baseline', 'enable-background', 'fill-opacity', 'fill-rule', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'glyph-name', 'glyph-orientation-horizontal', 'glyph-orientation-vertical', 'horiz-adv-x', 'horiz-origin-x', 'image-rendering', 'letter-spacing', 'lighting-color', 'marker-end', 'marker-mid', 'marker-start', 'overline-position', 'overline-thickness', 'paint-order', 'panose-1', 'pointer-events', 'rendering-intent', 'shape-rendering', 'stop-color', 'stop-opacity', 'strikethrough-position', 'strikethrough-thickness', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'text-anchor', 'text-decoration', 'text-rendering', 'underline-position', 'underline-thickness', 'unicode-bidi', 'unicode-range', 'units-per-em', 'v-alphabetic', 'v-hanging', 'v-ideographic', 'v-mathematical', 'vector-effect', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'word-spacing', 'writing-mode', 'xmlns:xlink', 'x-height'].forEach(function (attributeName) {
        var name = attributeName.replace(CAMELIZE, capitalize);
        properties[name] = new PropertyInfoRecord(name, STRING, false, attributeName, null, false);
      });
      ['xlink:actuate', 'xlink:arcrole', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type'].forEach(function (attributeName) {
        var name = attributeName.replace(CAMELIZE, capitalize);
        properties[name] = new PropertyInfoRecord(name, STRING, false, attributeName, 'http://www.w3.org/1999/xlink', false);
      });
      ['xml:base', 'xml:lang', 'xml:space'].forEach(function (attributeName) {
        var name = attributeName.replace(CAMELIZE, capitalize);
        properties[name] = new PropertyInfoRecord(name, STRING, false, attributeName, 'http://www.w3.org/XML/1998/namespace', false);
      });
      ['tabIndex', 'crossOrigin'].forEach(function (attributeName) {
        properties[attributeName] = new PropertyInfoRecord(attributeName, STRING, false, attributeName.toLowerCase(), null, false);
      });
      var xlinkHref = 'xlinkHref';
      properties[xlinkHref] = new PropertyInfoRecord('xlinkHref', STRING, false, 'xlink:href', 'http://www.w3.org/1999/xlink', true);
      ['src', 'href', 'action', 'formAction'].forEach(function (attributeName) {
        properties[attributeName] = new PropertyInfoRecord(attributeName, STRING, false, attributeName.toLowerCase(), null, true);
      });
      var isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i;
      var didWarn = false;

      function sanitizeURL(url) {
        {
          if (!didWarn && isJavaScriptProtocol.test(url)) {
            didWarn = true;
            error('A future version of React will block javascript: URLs as a security precaution. ' + 'Use event handlers instead if you can. If you need to generate unsafe HTML try ' + 'using dangerouslySetInnerHTML instead. React was passed %s.', JSON.stringify(url));
          }
        }
      }

      function getValueForProperty(node, name, expected, propertyInfo) {
        {
          if (propertyInfo.mustUseProperty) {
            var propertyName = propertyInfo.propertyName;
            return node[propertyName];
          } else {
            if (propertyInfo.sanitizeURL) {
              sanitizeURL('' + expected);
            }

            var attributeName = propertyInfo.attributeName;
            var stringValue = null;

            if (propertyInfo.type === OVERLOADED_BOOLEAN) {
              if (node.hasAttribute(attributeName)) {
                var value = node.getAttribute(attributeName);

                if (value === '') {
                  return true;
                }

                if (shouldRemoveAttribute(name, expected, propertyInfo, false)) {
                  return value;
                }

                if (value === '' + expected) {
                  return expected;
                }

                return value;
              }
            } else if (node.hasAttribute(attributeName)) {
              if (shouldRemoveAttribute(name, expected, propertyInfo, false)) {
                return node.getAttribute(attributeName);
              }

              if (propertyInfo.type === BOOLEAN) {
                return expected;
              }

              stringValue = node.getAttribute(attributeName);
            }

            if (shouldRemoveAttribute(name, expected, propertyInfo, false)) {
              return stringValue === null ? expected : stringValue;
            } else if (stringValue === '' + expected) {
              return expected;
            } else {
              return stringValue;
            }
          }
        }
      }

      function getValueForAttribute(node, name, expected) {
        {
          if (!isAttributeNameSafe(name)) {
            return;
          }

          if (!node.hasAttribute(name)) {
            return expected === undefined ? undefined : null;
          }

          var value = node.getAttribute(name);

          if (value === '' + expected) {
            return expected;
          }

          return value;
        }
      }

      function setValueForProperty(node, name, value, isCustomComponentTag) {
        var propertyInfo = getPropertyInfo(name);

        if (shouldIgnoreAttribute(name, propertyInfo, isCustomComponentTag)) {
          return;
        }

        if (shouldRemoveAttribute(name, value, propertyInfo, isCustomComponentTag)) {
          value = null;
        }

        if (isCustomComponentTag || propertyInfo === null) {
          if (isAttributeNameSafe(name)) {
            var _attributeName = name;

            if (value === null) {
              node.removeAttribute(_attributeName);
            } else {
              node.setAttribute(_attributeName, '' + value);
            }
          }

          return;
        }

        var mustUseProperty = propertyInfo.mustUseProperty;

        if (mustUseProperty) {
          var propertyName = propertyInfo.propertyName;

          if (value === null) {
            var type = propertyInfo.type;
            node[propertyName] = type === BOOLEAN ? false : '';
          } else {
            node[propertyName] = value;
          }

          return;
        }

        var attributeName = propertyInfo.attributeName,
            attributeNamespace = propertyInfo.attributeNamespace;

        if (value === null) {
          node.removeAttribute(attributeName);
        } else {
          var _type = propertyInfo.type;
          var attributeValue;

          if (_type === BOOLEAN || _type === OVERLOADED_BOOLEAN && value === true) {
            attributeValue = '';
          } else {
            {
              attributeValue = '' + value;
            }

            if (propertyInfo.sanitizeURL) {
              sanitizeURL(attributeValue.toString());
            }
          }

          if (attributeNamespace) {
            node.setAttributeNS(attributeNamespace, attributeName, attributeValue);
          } else {
            node.setAttribute(attributeName, attributeValue);
          }
        }
      }

      var BEFORE_SLASH_RE = /^(.*)[\\\/]/;

      function describeComponentFrame(name, source, ownerName) {
        var sourceInfo = '';

        if (source) {
          var path = source.fileName;
          var fileName = path.replace(BEFORE_SLASH_RE, '');
          {
            if (/^index\./.test(fileName)) {
              var match = path.match(BEFORE_SLASH_RE);

              if (match) {
                var pathBeforeSlash = match[1];

                if (pathBeforeSlash) {
                  var folderName = pathBeforeSlash.replace(BEFORE_SLASH_RE, '');
                  fileName = folderName + '/' + fileName;
                }
              }
            }
          }
          sourceInfo = ' (at ' + fileName + ':' + source.lineNumber + ')';
        } else if (ownerName) {
          sourceInfo = ' (created by ' + ownerName + ')';
        }

        return '\n    in ' + (name || 'Unknown') + sourceInfo;
      }

      var hasSymbol = typeof Symbol === 'function' && Symbol["for"];
      var REACT_ELEMENT_TYPE = hasSymbol ? Symbol["for"]('react.element') : 0xeac7;
      var REACT_PORTAL_TYPE = hasSymbol ? Symbol["for"]('react.portal') : 0xeaca;
      var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol["for"]('react.fragment') : 0xeacb;
      var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol["for"]('react.strict_mode') : 0xeacc;
      var REACT_PROFILER_TYPE = hasSymbol ? Symbol["for"]('react.profiler') : 0xead2;
      var REACT_PROVIDER_TYPE = hasSymbol ? Symbol["for"]('react.provider') : 0xeacd;
      var REACT_CONTEXT_TYPE = hasSymbol ? Symbol["for"]('react.context') : 0xeace;
      var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol["for"]('react.concurrent_mode') : 0xeacf;
      var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol["for"]('react.forward_ref') : 0xead0;
      var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol["for"]('react.suspense') : 0xead1;
      var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol["for"]('react.suspense_list') : 0xead8;
      var REACT_MEMO_TYPE = hasSymbol ? Symbol["for"]('react.memo') : 0xead3;
      var REACT_LAZY_TYPE = hasSymbol ? Symbol["for"]('react.lazy') : 0xead4;
      var REACT_BLOCK_TYPE = hasSymbol ? Symbol["for"]('react.block') : 0xead9;
      var MAYBE_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
      var FAUX_ITERATOR_SYMBOL = '@@iterator';

      function getIteratorFn(maybeIterable) {
        if (maybeIterable === null || typeof maybeIterable !== 'object') {
          return null;
        }

        var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];

        if (typeof maybeIterator === 'function') {
          return maybeIterator;
        }

        return null;
      }

      var Uninitialized = -1;
      var Pending = 0;
      var Resolved = 1;
      var Rejected = 2;

      function refineResolvedLazyComponent(lazyComponent) {
        return lazyComponent._status === Resolved ? lazyComponent._result : null;
      }

      function initializeLazyComponentType(lazyComponent) {
        if (lazyComponent._status === Uninitialized) {
          lazyComponent._status = Pending;
          var ctor = lazyComponent._ctor;
          var thenable = ctor();
          lazyComponent._result = thenable;
          thenable.then(function (moduleObject) {
            if (lazyComponent._status === Pending) {
              var defaultExport = moduleObject["default"];
              {
                if (defaultExport === undefined) {
                  error('lazy: Expected the result of a dynamic import() call. ' + 'Instead received: %s\n\nYour code should look like: \n  ' + "const MyComponent = lazy(() => import('./MyComponent'))", moduleObject);
                }
              }
              lazyComponent._status = Resolved;
              lazyComponent._result = defaultExport;
            }
          }, function (error) {
            if (lazyComponent._status === Pending) {
              lazyComponent._status = Rejected;
              lazyComponent._result = error;
            }
          });
        }
      }

      function getWrappedName(outerType, innerType, wrapperName) {
        var functionName = innerType.displayName || innerType.name || '';
        return outerType.displayName || (functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName);
      }

      function getComponentName(type) {
        if (type == null) {
          return null;
        }

        {
          if (typeof type.tag === 'number') {
            error('Received an unexpected object in getComponentName(). ' + 'This is likely a bug in React. Please file an issue.');
          }
        }

        if (typeof type === 'function') {
          return type.displayName || type.name || null;
        }

        if (typeof type === 'string') {
          return type;
        }

        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return 'Fragment';

          case REACT_PORTAL_TYPE:
            return 'Portal';

          case REACT_PROFILER_TYPE:
            return "Profiler";

          case REACT_STRICT_MODE_TYPE:
            return 'StrictMode';

          case REACT_SUSPENSE_TYPE:
            return 'Suspense';

          case REACT_SUSPENSE_LIST_TYPE:
            return 'SuspenseList';
        }

        if (typeof type === 'object') {
          switch (type.$$typeof) {
            case REACT_CONTEXT_TYPE:
              return 'Context.Consumer';

            case REACT_PROVIDER_TYPE:
              return 'Context.Provider';

            case REACT_FORWARD_REF_TYPE:
              return getWrappedName(type, type.render, 'ForwardRef');

            case REACT_MEMO_TYPE:
              return getComponentName(type.type);

            case REACT_BLOCK_TYPE:
              return getComponentName(type.render);

            case REACT_LAZY_TYPE:
              {
                var thenable = type;
                var resolvedThenable = refineResolvedLazyComponent(thenable);

                if (resolvedThenable) {
                  return getComponentName(resolvedThenable);
                }

                break;
              }
          }
        }

        return null;
      }

      var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;

      function describeFiber(fiber) {
        switch (fiber.tag) {
          case HostRoot:
          case HostPortal:
          case HostText:
          case Fragment:
          case ContextProvider:
          case ContextConsumer:
            return '';

          default:
            var owner = fiber._debugOwner;
            var source = fiber._debugSource;
            var name = getComponentName(fiber.type);
            var ownerName = null;

            if (owner) {
              ownerName = getComponentName(owner.type);
            }

            return describeComponentFrame(name, source, ownerName);
        }
      }

      function getStackByFiberInDevAndProd(workInProgress) {
        var info = '';
        var node = workInProgress;

        do {
          info += describeFiber(node);
          node = node["return"];
        } while (node);

        return info;
      }

      var current = null;
      var isRendering = false;

      function getCurrentFiberOwnerNameInDevOrNull() {
        {
          if (current === null) {
            return null;
          }

          var owner = current._debugOwner;

          if (owner !== null && typeof owner !== 'undefined') {
            return getComponentName(owner.type);
          }
        }
        return null;
      }

      function getCurrentFiberStackInDev() {
        {
          if (current === null) {
            return '';
          }

          return getStackByFiberInDevAndProd(current);
        }
      }

      function resetCurrentFiber() {
        {
          ReactDebugCurrentFrame$1.getCurrentStack = null;
          current = null;
          isRendering = false;
        }
      }

      function setCurrentFiber(fiber) {
        {
          ReactDebugCurrentFrame$1.getCurrentStack = getCurrentFiberStackInDev;
          current = fiber;
          isRendering = false;
        }
      }

      function setIsRendering(rendering) {
        {
          isRendering = rendering;
        }
      }

      function toString(value) {
        return '' + value;
      }

      function getToStringValue(value) {
        switch (typeof value) {
          case 'boolean':
          case 'number':
          case 'object':
          case 'string':
          case 'undefined':
            return value;

          default:
            return '';
        }
      }

      var ReactDebugCurrentFrame$2 = null;
      var ReactControlledValuePropTypes = {
        checkPropTypes: null
      };
      {
        ReactDebugCurrentFrame$2 = ReactSharedInternals.ReactDebugCurrentFrame;
        var hasReadOnlyValue = {
          button: true,
          checkbox: true,
          image: true,
          hidden: true,
          radio: true,
          reset: true,
          submit: true
        };
        var propTypes = {
          value: function value(props, propName, componentName) {
            if (hasReadOnlyValue[props.type] || props.onChange || props.readOnly || props.disabled || props[propName] == null || enableDeprecatedFlareAPI) {
              return null;
            }

            return new Error('You provided a `value` prop to a form field without an ' + '`onChange` handler. This will render a read-only field. If ' + 'the field should be mutable use `defaultValue`. Otherwise, ' + 'set either `onChange` or `readOnly`.');
          },
          checked: function checked(props, propName, componentName) {
            if (props.onChange || props.readOnly || props.disabled || props[propName] == null || enableDeprecatedFlareAPI) {
              return null;
            }

            return new Error('You provided a `checked` prop to a form field without an ' + '`onChange` handler. This will render a read-only field. If ' + 'the field should be mutable use `defaultChecked`. Otherwise, ' + 'set either `onChange` or `readOnly`.');
          }
        };

        ReactControlledValuePropTypes.checkPropTypes = function (tagName, props) {
          checkPropTypes(propTypes, props, 'prop', tagName, ReactDebugCurrentFrame$2.getStackAddendum);
        };
      }

      function isCheckable(elem) {
        var type = elem.type;
        var nodeName = elem.nodeName;
        return nodeName && nodeName.toLowerCase() === 'input' && (type === 'checkbox' || type === 'radio');
      }

      function getTracker(node) {
        return node._valueTracker;
      }

      function detachTracker(node) {
        node._valueTracker = null;
      }

      function getValueFromNode(node) {
        var value = '';

        if (!node) {
          return value;
        }

        if (isCheckable(node)) {
          value = node.checked ? 'true' : 'false';
        } else {
          value = node.value;
        }

        return value;
      }

      function trackValueOnNode(node) {
        var valueField = isCheckable(node) ? 'checked' : 'value';
        var descriptor = Object.getOwnPropertyDescriptor(node.constructor.prototype, valueField);
        var currentValue = '' + node[valueField];

        if (node.hasOwnProperty(valueField) || typeof descriptor === 'undefined' || typeof descriptor.get !== 'function' || typeof descriptor.set !== 'function') {
          return;
        }

        var _get = descriptor.get,
            _set = descriptor.set;
        Object.defineProperty(node, valueField, {
          configurable: true,
          get: function get() {
            return _get.call(this);
          },
          set: function set(value) {
            currentValue = '' + value;

            _set.call(this, value);
          }
        });
        Object.defineProperty(node, valueField, {
          enumerable: descriptor.enumerable
        });
        var tracker = {
          getValue: function getValue() {
            return currentValue;
          },
          setValue: function setValue(value) {
            currentValue = '' + value;
          },
          stopTracking: function stopTracking() {
            detachTracker(node);
            delete node[valueField];
          }
        };
        return tracker;
      }

      function track(node) {
        if (getTracker(node)) {
          return;
        }

        node._valueTracker = trackValueOnNode(node);
      }

      function updateValueIfChanged(node) {
        if (!node) {
          return false;
        }

        var tracker = getTracker(node);

        if (!tracker) {
          return true;
        }

        var lastValue = tracker.getValue();
        var nextValue = getValueFromNode(node);

        if (nextValue !== lastValue) {
          tracker.setValue(nextValue);
          return true;
        }

        return false;
      }

      var didWarnValueDefaultValue = false;
      var didWarnCheckedDefaultChecked = false;
      var didWarnControlledToUncontrolled = false;
      var didWarnUncontrolledToControlled = false;

      function isControlled(props) {
        var usesChecked = props.type === 'checkbox' || props.type === 'radio';
        return usesChecked ? props.checked != null : props.value != null;
      }

      function getHostProps(element, props) {
        var node = element;
        var checked = props.checked;

        var hostProps = _assign({}, props, {
          defaultChecked: undefined,
          defaultValue: undefined,
          value: undefined,
          checked: checked != null ? checked : node._wrapperState.initialChecked
        });

        return hostProps;
      }

      function initWrapperState(element, props) {
        {
          ReactControlledValuePropTypes.checkPropTypes('input', props);

          if (props.checked !== undefined && props.defaultChecked !== undefined && !didWarnCheckedDefaultChecked) {
            error('%s contains an input of type %s with both checked and defaultChecked props. ' + 'Input elements must be either controlled or uncontrolled ' + '(specify either the checked prop, or the defaultChecked prop, but not ' + 'both). Decide between using a controlled or uncontrolled input ' + 'element and remove one of these props. More info: ' + 'https://fb.me/react-controlled-components', getCurrentFiberOwnerNameInDevOrNull() || 'A component', props.type);
            didWarnCheckedDefaultChecked = true;
          }

          if (props.value !== undefined && props.defaultValue !== undefined && !didWarnValueDefaultValue) {
            error('%s contains an input of type %s with both value and defaultValue props. ' + 'Input elements must be either controlled or uncontrolled ' + '(specify either the value prop, or the defaultValue prop, but not ' + 'both). Decide between using a controlled or uncontrolled input ' + 'element and remove one of these props. More info: ' + 'https://fb.me/react-controlled-components', getCurrentFiberOwnerNameInDevOrNull() || 'A component', props.type);
            didWarnValueDefaultValue = true;
          }
        }
        var node = element;
        var defaultValue = props.defaultValue == null ? '' : props.defaultValue;
        node._wrapperState = {
          initialChecked: props.checked != null ? props.checked : props.defaultChecked,
          initialValue: getToStringValue(props.value != null ? props.value : defaultValue),
          controlled: isControlled(props)
        };
      }

      function updateChecked(element, props) {
        var node = element;
        var checked = props.checked;

        if (checked != null) {
          setValueForProperty(node, 'checked', checked, false);
        }
      }

      function updateWrapper(element, props) {
        var node = element;
        {
          var controlled = isControlled(props);

          if (!node._wrapperState.controlled && controlled && !didWarnUncontrolledToControlled) {
            error('A component is changing an uncontrolled input of type %s to be controlled. ' + 'Input elements should not switch from uncontrolled to controlled (or vice versa). ' + 'Decide between using a controlled or uncontrolled input ' + 'element for the lifetime of the component. More info: https://fb.me/react-controlled-components', props.type);
            didWarnUncontrolledToControlled = true;
          }

          if (node._wrapperState.controlled && !controlled && !didWarnControlledToUncontrolled) {
            error('A component is changing a controlled input of type %s to be uncontrolled. ' + 'Input elements should not switch from controlled to uncontrolled (or vice versa). ' + 'Decide between using a controlled or uncontrolled input ' + 'element for the lifetime of the component. More info: https://fb.me/react-controlled-components', props.type);
            didWarnControlledToUncontrolled = true;
          }
        }
        updateChecked(element, props);
        var value = getToStringValue(props.value);
        var type = props.type;

        if (value != null) {
          if (type === 'number') {
            if (value === 0 && node.value === '' || node.value != value) {
              node.value = toString(value);
            }
          } else if (node.value !== toString(value)) {
            node.value = toString(value);
          }
        } else if (type === 'submit' || type === 'reset') {
          node.removeAttribute('value');
          return;
        }

        {
          if (props.hasOwnProperty('value')) {
            setDefaultValue(node, props.type, value);
          } else if (props.hasOwnProperty('defaultValue')) {
            setDefaultValue(node, props.type, getToStringValue(props.defaultValue));
          }
        }
        {
          if (props.checked == null && props.defaultChecked != null) {
            node.defaultChecked = !!props.defaultChecked;
          }
        }
      }

      function postMountWrapper(element, props, isHydrating) {
        var node = element;

        if (props.hasOwnProperty('value') || props.hasOwnProperty('defaultValue')) {
          var type = props.type;
          var isButton = type === 'submit' || type === 'reset';

          if (isButton && (props.value === undefined || props.value === null)) {
            return;
          }

          var initialValue = toString(node._wrapperState.initialValue);

          if (!isHydrating) {
            {
              if (initialValue !== node.value) {
                node.value = initialValue;
              }
            }
          }

          {
            node.defaultValue = initialValue;
          }
        }

        var name = node.name;

        if (name !== '') {
          node.name = '';
        }

        {
          node.defaultChecked = !node.defaultChecked;
          node.defaultChecked = !!node._wrapperState.initialChecked;
        }

        if (name !== '') {
          node.name = name;
        }
      }

      function restoreControlledState(element, props) {
        var node = element;
        updateWrapper(node, props);
        updateNamedCousins(node, props);
      }

      function updateNamedCousins(rootNode, props) {
        var name = props.name;

        if (props.type === 'radio' && name != null) {
          var queryRoot = rootNode;

          while (queryRoot.parentNode) {
            queryRoot = queryRoot.parentNode;
          }

          var group = queryRoot.querySelectorAll('input[name=' + JSON.stringify('' + name) + '][type="radio"]');

          for (var i = 0; i < group.length; i++) {
            var otherNode = group[i];

            if (otherNode === rootNode || otherNode.form !== rootNode.form) {
              continue;
            }

            var otherProps = getFiberCurrentPropsFromNode$1(otherNode);

            if (!otherProps) {
              {
                throw Error("ReactDOMInput: Mixing React and non-React radio inputs with the same `name` is not supported.");
              }
            }

            updateValueIfChanged(otherNode);
            updateWrapper(otherNode, otherProps);
          }
        }
      }

      function setDefaultValue(node, type, value) {
        if (type !== 'number' || node.ownerDocument.activeElement !== node) {
          if (value == null) {
            node.defaultValue = toString(node._wrapperState.initialValue);
          } else if (node.defaultValue !== toString(value)) {
            node.defaultValue = toString(value);
          }
        }
      }

      var didWarnSelectedSetOnOption = false;
      var didWarnInvalidChild = false;

      function flattenChildren(children) {
        var content = '';
        React$1.Children.forEach(children, function (child) {
          if (child == null) {
            return;
          }

          content += child;
        });
        return content;
      }

      function validateProps(element, props) {
        {
          if (typeof props.children === 'object' && props.children !== null) {
            React$1.Children.forEach(props.children, function (child) {
              if (child == null) {
                return;
              }

              if (typeof child === 'string' || typeof child === 'number') {
                return;
              }

              if (typeof child.type !== 'string') {
                return;
              }

              if (!didWarnInvalidChild) {
                didWarnInvalidChild = true;
                error('Only strings and numbers are supported as <option> children.');
              }
            });
          }

          if (props.selected != null && !didWarnSelectedSetOnOption) {
            error('Use the `defaultValue` or `value` props on <select> instead of ' + 'setting `selected` on <option>.');
            didWarnSelectedSetOnOption = true;
          }
        }
      }

      function postMountWrapper$1(element, props) {
        if (props.value != null) {
          element.setAttribute('value', toString(getToStringValue(props.value)));
        }
      }

      function getHostProps$1(element, props) {
        var hostProps = _assign({
          children: undefined
        }, props);

        var content = flattenChildren(props.children);

        if (content) {
          hostProps.children = content;
        }

        return hostProps;
      }

      var didWarnValueDefaultValue$1;
      {
        didWarnValueDefaultValue$1 = false;
      }

      function getDeclarationErrorAddendum() {
        var ownerName = getCurrentFiberOwnerNameInDevOrNull();

        if (ownerName) {
          return '\n\nCheck the render method of `' + ownerName + '`.';
        }

        return '';
      }

      var valuePropNames = ['value', 'defaultValue'];

      function checkSelectPropTypes(props) {
        {
          ReactControlledValuePropTypes.checkPropTypes('select', props);

          for (var i = 0; i < valuePropNames.length; i++) {
            var propName = valuePropNames[i];

            if (props[propName] == null) {
              continue;
            }

            var isArray = Array.isArray(props[propName]);

            if (props.multiple && !isArray) {
              error('The `%s` prop supplied to <select> must be an array if ' + '`multiple` is true.%s', propName, getDeclarationErrorAddendum());
            } else if (!props.multiple && isArray) {
              error('The `%s` prop supplied to <select> must be a scalar ' + 'value if `multiple` is false.%s', propName, getDeclarationErrorAddendum());
            }
          }
        }
      }

      function updateOptions(node, multiple, propValue, setDefaultSelected) {
        var options = node.options;

        if (multiple) {
          var selectedValues = propValue;
          var selectedValue = {};

          for (var i = 0; i < selectedValues.length; i++) {
            selectedValue['$' + selectedValues[i]] = true;
          }

          for (var _i = 0; _i < options.length; _i++) {
            var selected = selectedValue.hasOwnProperty('$' + options[_i].value);

            if (options[_i].selected !== selected) {
              options[_i].selected = selected;
            }

            if (selected && setDefaultSelected) {
              options[_i].defaultSelected = true;
            }
          }
        } else {
          var _selectedValue = toString(getToStringValue(propValue));

          var defaultSelected = null;

          for (var _i2 = 0; _i2 < options.length; _i2++) {
            if (options[_i2].value === _selectedValue) {
              options[_i2].selected = true;

              if (setDefaultSelected) {
                options[_i2].defaultSelected = true;
              }

              return;
            }

            if (defaultSelected === null && !options[_i2].disabled) {
              defaultSelected = options[_i2];
            }
          }

          if (defaultSelected !== null) {
            defaultSelected.selected = true;
          }
        }
      }

      function getHostProps$2(element, props) {
        return _assign({}, props, {
          value: undefined
        });
      }

      function initWrapperState$1(element, props) {
        var node = element;
        {
          checkSelectPropTypes(props);
        }
        node._wrapperState = {
          wasMultiple: !!props.multiple
        };
        {
          if (props.value !== undefined && props.defaultValue !== undefined && !didWarnValueDefaultValue$1) {
            error('Select elements must be either controlled or uncontrolled ' + '(specify either the value prop, or the defaultValue prop, but not ' + 'both). Decide between using a controlled or uncontrolled select ' + 'element and remove one of these props. More info: ' + 'https://fb.me/react-controlled-components');
            didWarnValueDefaultValue$1 = true;
          }
        }
      }

      function postMountWrapper$2(element, props) {
        var node = element;
        node.multiple = !!props.multiple;
        var value = props.value;

        if (value != null) {
          updateOptions(node, !!props.multiple, value, false);
        } else if (props.defaultValue != null) {
          updateOptions(node, !!props.multiple, props.defaultValue, true);
        }
      }

      function postUpdateWrapper(element, props) {
        var node = element;
        var wasMultiple = node._wrapperState.wasMultiple;
        node._wrapperState.wasMultiple = !!props.multiple;
        var value = props.value;

        if (value != null) {
          updateOptions(node, !!props.multiple, value, false);
        } else if (wasMultiple !== !!props.multiple) {
          if (props.defaultValue != null) {
            updateOptions(node, !!props.multiple, props.defaultValue, true);
          } else {
            updateOptions(node, !!props.multiple, props.multiple ? [] : '', false);
          }
        }
      }

      function restoreControlledState$1(element, props) {
        var node = element;
        var value = props.value;

        if (value != null) {
          updateOptions(node, !!props.multiple, value, false);
        }
      }

      var didWarnValDefaultVal = false;

      function getHostProps$3(element, props) {
        var node = element;

        if (!(props.dangerouslySetInnerHTML == null)) {
          {
            throw Error("`dangerouslySetInnerHTML` does not make sense on <textarea>.");
          }
        }

        var hostProps = _assign({}, props, {
          value: undefined,
          defaultValue: undefined,
          children: toString(node._wrapperState.initialValue)
        });

        return hostProps;
      }

      function initWrapperState$2(element, props) {
        var node = element;
        {
          ReactControlledValuePropTypes.checkPropTypes('textarea', props);

          if (props.value !== undefined && props.defaultValue !== undefined && !didWarnValDefaultVal) {
            error('%s contains a textarea with both value and defaultValue props. ' + 'Textarea elements must be either controlled or uncontrolled ' + '(specify either the value prop, or the defaultValue prop, but not ' + 'both). Decide between using a controlled or uncontrolled textarea ' + 'and remove one of these props. More info: ' + 'https://fb.me/react-controlled-components', getCurrentFiberOwnerNameInDevOrNull() || 'A component');
            didWarnValDefaultVal = true;
          }
        }
        var initialValue = props.value;

        if (initialValue == null) {
          var children = props.children,
              defaultValue = props.defaultValue;

          if (children != null) {
            {
              error('Use the `defaultValue` or `value` props instead of setting ' + 'children on <textarea>.');
            }
            {
              if (!(defaultValue == null)) {
                {
                  throw Error("If you supply `defaultValue` on a <textarea>, do not pass children.");
                }
              }

              if (Array.isArray(children)) {
                if (!(children.length <= 1)) {
                  {
                    throw Error("<textarea> can only have at most one child.");
                  }
                }

                children = children[0];
              }

              defaultValue = children;
            }
          }

          if (defaultValue == null) {
            defaultValue = '';
          }

          initialValue = defaultValue;
        }

        node._wrapperState = {
          initialValue: getToStringValue(initialValue)
        };
      }

      function updateWrapper$1(element, props) {
        var node = element;
        var value = getToStringValue(props.value);
        var defaultValue = getToStringValue(props.defaultValue);

        if (value != null) {
          var newValue = toString(value);

          if (newValue !== node.value) {
            node.value = newValue;
          }

          if (props.defaultValue == null && node.defaultValue !== newValue) {
            node.defaultValue = newValue;
          }
        }

        if (defaultValue != null) {
          node.defaultValue = toString(defaultValue);
        }
      }

      function postMountWrapper$3(element, props) {
        var node = element;
        var textContent = node.textContent;

        if (textContent === node._wrapperState.initialValue) {
          if (textContent !== '' && textContent !== null) {
            node.value = textContent;
          }
        }
      }

      function restoreControlledState$2(element, props) {
        updateWrapper$1(element, props);
      }

      var HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
      var MATH_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
      var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
      var Namespaces = {
        html: HTML_NAMESPACE,
        mathml: MATH_NAMESPACE,
        svg: SVG_NAMESPACE
      };

      function getIntrinsicNamespace(type) {
        switch (type) {
          case 'svg':
            return SVG_NAMESPACE;

          case 'math':
            return MATH_NAMESPACE;

          default:
            return HTML_NAMESPACE;
        }
      }

      function getChildNamespace(parentNamespace, type) {
        if (parentNamespace == null || parentNamespace === HTML_NAMESPACE) {
          return getIntrinsicNamespace(type);
        }

        if (parentNamespace === SVG_NAMESPACE && type === 'foreignObject') {
          return HTML_NAMESPACE;
        }

        return parentNamespace;
      }

      var createMicrosoftUnsafeLocalFunction = function createMicrosoftUnsafeLocalFunction(func) {
        if (typeof MSApp !== 'undefined' && MSApp.execUnsafeLocalFunction) {
          return function (arg0, arg1, arg2, arg3) {
            MSApp.execUnsafeLocalFunction(function () {
              return func(arg0, arg1, arg2, arg3);
            });
          };
        } else {
          return func;
        }
      };

      var reusableSVGContainer;
      var setInnerHTML = createMicrosoftUnsafeLocalFunction(function (node, html) {
        if (node.namespaceURI === Namespaces.svg) {
          if (!('innerHTML' in node)) {
            reusableSVGContainer = reusableSVGContainer || document.createElement('div');
            reusableSVGContainer.innerHTML = '<svg>' + html.valueOf().toString() + '</svg>';
            var svgNode = reusableSVGContainer.firstChild;

            while (node.firstChild) {
              node.removeChild(node.firstChild);
            }

            while (svgNode.firstChild) {
              node.appendChild(svgNode.firstChild);
            }

            return;
          }
        }

        node.innerHTML = html;
      });
      var ELEMENT_NODE = 1;
      var TEXT_NODE = 3;
      var COMMENT_NODE = 8;
      var DOCUMENT_NODE = 9;
      var DOCUMENT_FRAGMENT_NODE = 11;

      var setTextContent = function setTextContent(node, text) {
        if (text) {
          var firstChild = node.firstChild;

          if (firstChild && firstChild === node.lastChild && firstChild.nodeType === TEXT_NODE) {
            firstChild.nodeValue = text;
            return;
          }
        }

        node.textContent = text;
      };

      function unsafeCastStringToDOMTopLevelType(topLevelType) {
        return topLevelType;
      }

      function unsafeCastDOMTopLevelTypeToString(topLevelType) {
        return topLevelType;
      }

      function makePrefixMap(styleProp, eventName) {
        var prefixes = {};
        prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
        prefixes['Webkit' + styleProp] = 'webkit' + eventName;
        prefixes['Moz' + styleProp] = 'moz' + eventName;
        return prefixes;
      }

      var vendorPrefixes = {
        animationend: makePrefixMap('Animation', 'AnimationEnd'),
        animationiteration: makePrefixMap('Animation', 'AnimationIteration'),
        animationstart: makePrefixMap('Animation', 'AnimationStart'),
        transitionend: makePrefixMap('Transition', 'TransitionEnd')
      };
      var prefixedEventNames = {};
      var style = {};

      if (canUseDOM) {
        style = document.createElement('div').style;

        if (!('AnimationEvent' in window)) {
          delete vendorPrefixes.animationend.animation;
          delete vendorPrefixes.animationiteration.animation;
          delete vendorPrefixes.animationstart.animation;
        }

        if (!('TransitionEvent' in window)) {
          delete vendorPrefixes.transitionend.transition;
        }
      }

      function getVendorPrefixedEventName(eventName) {
        if (prefixedEventNames[eventName]) {
          return prefixedEventNames[eventName];
        } else if (!vendorPrefixes[eventName]) {
          return eventName;
        }

        var prefixMap = vendorPrefixes[eventName];

        for (var styleProp in prefixMap) {
          if (prefixMap.hasOwnProperty(styleProp) && styleProp in style) {
            return prefixedEventNames[eventName] = prefixMap[styleProp];
          }
        }

        return eventName;
      }

      var TOP_ABORT = unsafeCastStringToDOMTopLevelType('abort');
      var TOP_ANIMATION_END = unsafeCastStringToDOMTopLevelType(getVendorPrefixedEventName('animationend'));
      var TOP_ANIMATION_ITERATION = unsafeCastStringToDOMTopLevelType(getVendorPrefixedEventName('animationiteration'));
      var TOP_ANIMATION_START = unsafeCastStringToDOMTopLevelType(getVendorPrefixedEventName('animationstart'));
      var TOP_BLUR = unsafeCastStringToDOMTopLevelType('blur');
      var TOP_CAN_PLAY = unsafeCastStringToDOMTopLevelType('canplay');
      var TOP_CAN_PLAY_THROUGH = unsafeCastStringToDOMTopLevelType('canplaythrough');
      var TOP_CANCEL = unsafeCastStringToDOMTopLevelType('cancel');
      var TOP_CHANGE = unsafeCastStringToDOMTopLevelType('change');
      var TOP_CLICK = unsafeCastStringToDOMTopLevelType('click');
      var TOP_CLOSE = unsafeCastStringToDOMTopLevelType('close');
      var TOP_COMPOSITION_END = unsafeCastStringToDOMTopLevelType('compositionend');
      var TOP_COMPOSITION_START = unsafeCastStringToDOMTopLevelType('compositionstart');
      var TOP_COMPOSITION_UPDATE = unsafeCastStringToDOMTopLevelType('compositionupdate');
      var TOP_CONTEXT_MENU = unsafeCastStringToDOMTopLevelType('contextmenu');
      var TOP_COPY = unsafeCastStringToDOMTopLevelType('copy');
      var TOP_CUT = unsafeCastStringToDOMTopLevelType('cut');
      var TOP_DOUBLE_CLICK = unsafeCastStringToDOMTopLevelType('dblclick');
      var TOP_AUX_CLICK = unsafeCastStringToDOMTopLevelType('auxclick');
      var TOP_DRAG = unsafeCastStringToDOMTopLevelType('drag');
      var TOP_DRAG_END = unsafeCastStringToDOMTopLevelType('dragend');
      var TOP_DRAG_ENTER = unsafeCastStringToDOMTopLevelType('dragenter');
      var TOP_DRAG_EXIT = unsafeCastStringToDOMTopLevelType('dragexit');
      var TOP_DRAG_LEAVE = unsafeCastStringToDOMTopLevelType('dragleave');
      var TOP_DRAG_OVER = unsafeCastStringToDOMTopLevelType('dragover');
      var TOP_DRAG_START = unsafeCastStringToDOMTopLevelType('dragstart');
      var TOP_DROP = unsafeCastStringToDOMTopLevelType('drop');
      var TOP_DURATION_CHANGE = unsafeCastStringToDOMTopLevelType('durationchange');
      var TOP_EMPTIED = unsafeCastStringToDOMTopLevelType('emptied');
      var TOP_ENCRYPTED = unsafeCastStringToDOMTopLevelType('encrypted');
      var TOP_ENDED = unsafeCastStringToDOMTopLevelType('ended');
      var TOP_ERROR = unsafeCastStringToDOMTopLevelType('error');
      var TOP_FOCUS = unsafeCastStringToDOMTopLevelType('focus');
      var TOP_GOT_POINTER_CAPTURE = unsafeCastStringToDOMTopLevelType('gotpointercapture');
      var TOP_INPUT = unsafeCastStringToDOMTopLevelType('input');
      var TOP_INVALID = unsafeCastStringToDOMTopLevelType('invalid');
      var TOP_KEY_DOWN = unsafeCastStringToDOMTopLevelType('keydown');
      var TOP_KEY_PRESS = unsafeCastStringToDOMTopLevelType('keypress');
      var TOP_KEY_UP = unsafeCastStringToDOMTopLevelType('keyup');
      var TOP_LOAD = unsafeCastStringToDOMTopLevelType('load');
      var TOP_LOAD_START = unsafeCastStringToDOMTopLevelType('loadstart');
      var TOP_LOADED_DATA = unsafeCastStringToDOMTopLevelType('loadeddata');
      var TOP_LOADED_METADATA = unsafeCastStringToDOMTopLevelType('loadedmetadata');
      var TOP_LOST_POINTER_CAPTURE = unsafeCastStringToDOMTopLevelType('lostpointercapture');
      var TOP_MOUSE_DOWN = unsafeCastStringToDOMTopLevelType('mousedown');
      var TOP_MOUSE_MOVE = unsafeCastStringToDOMTopLevelType('mousemove');
      var TOP_MOUSE_OUT = unsafeCastStringToDOMTopLevelType('mouseout');
      var TOP_MOUSE_OVER = unsafeCastStringToDOMTopLevelType('mouseover');
      var TOP_MOUSE_UP = unsafeCastStringToDOMTopLevelType('mouseup');
      var TOP_PASTE = unsafeCastStringToDOMTopLevelType('paste');
      var TOP_PAUSE = unsafeCastStringToDOMTopLevelType('pause');
      var TOP_PLAY = unsafeCastStringToDOMTopLevelType('play');
      var TOP_PLAYING = unsafeCastStringToDOMTopLevelType('playing');
      var TOP_POINTER_CANCEL = unsafeCastStringToDOMTopLevelType('pointercancel');
      var TOP_POINTER_DOWN = unsafeCastStringToDOMTopLevelType('pointerdown');
      var TOP_POINTER_MOVE = unsafeCastStringToDOMTopLevelType('pointermove');
      var TOP_POINTER_OUT = unsafeCastStringToDOMTopLevelType('pointerout');
      var TOP_POINTER_OVER = unsafeCastStringToDOMTopLevelType('pointerover');
      var TOP_POINTER_UP = unsafeCastStringToDOMTopLevelType('pointerup');
      var TOP_PROGRESS = unsafeCastStringToDOMTopLevelType('progress');
      var TOP_RATE_CHANGE = unsafeCastStringToDOMTopLevelType('ratechange');
      var TOP_RESET = unsafeCastStringToDOMTopLevelType('reset');
      var TOP_SCROLL = unsafeCastStringToDOMTopLevelType('scroll');
      var TOP_SEEKED = unsafeCastStringToDOMTopLevelType('seeked');
      var TOP_SEEKING = unsafeCastStringToDOMTopLevelType('seeking');
      var TOP_SELECTION_CHANGE = unsafeCastStringToDOMTopLevelType('selectionchange');
      var TOP_STALLED = unsafeCastStringToDOMTopLevelType('stalled');
      var TOP_SUBMIT = unsafeCastStringToDOMTopLevelType('submit');
      var TOP_SUSPEND = unsafeCastStringToDOMTopLevelType('suspend');
      var TOP_TEXT_INPUT = unsafeCastStringToDOMTopLevelType('textInput');
      var TOP_TIME_UPDATE = unsafeCastStringToDOMTopLevelType('timeupdate');
      var TOP_TOGGLE = unsafeCastStringToDOMTopLevelType('toggle');
      var TOP_TOUCH_CANCEL = unsafeCastStringToDOMTopLevelType('touchcancel');
      var TOP_TOUCH_END = unsafeCastStringToDOMTopLevelType('touchend');
      var TOP_TOUCH_MOVE = unsafeCastStringToDOMTopLevelType('touchmove');
      var TOP_TOUCH_START = unsafeCastStringToDOMTopLevelType('touchstart');
      var TOP_TRANSITION_END = unsafeCastStringToDOMTopLevelType(getVendorPrefixedEventName('transitionend'));
      var TOP_VOLUME_CHANGE = unsafeCastStringToDOMTopLevelType('volumechange');
      var TOP_WAITING = unsafeCastStringToDOMTopLevelType('waiting');
      var TOP_WHEEL = unsafeCastStringToDOMTopLevelType('wheel');
      var mediaEventTypes = [TOP_ABORT, TOP_CAN_PLAY, TOP_CAN_PLAY_THROUGH, TOP_DURATION_CHANGE, TOP_EMPTIED, TOP_ENCRYPTED, TOP_ENDED, TOP_ERROR, TOP_LOADED_DATA, TOP_LOADED_METADATA, TOP_LOAD_START, TOP_PAUSE, TOP_PLAY, TOP_PLAYING, TOP_PROGRESS, TOP_RATE_CHANGE, TOP_SEEKED, TOP_SEEKING, TOP_STALLED, TOP_SUSPEND, TOP_TIME_UPDATE, TOP_VOLUME_CHANGE, TOP_WAITING];

      function getRawEventName(topLevelType) {
        return unsafeCastDOMTopLevelTypeToString(topLevelType);
      }

      var PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map;
      var elementListenerMap = new PossiblyWeakMap();

      function getListenerMapForElement(element) {
        var listenerMap = elementListenerMap.get(element);

        if (listenerMap === undefined) {
          listenerMap = new Map();
          elementListenerMap.set(element, listenerMap);
        }

        return listenerMap;
      }

      function get(key) {
        return key._reactInternalFiber;
      }

      function has(key) {
        return key._reactInternalFiber !== undefined;
      }

      function set(key, value) {
        key._reactInternalFiber = value;
      }

      var NoEffect = 0;
      var PerformedWork = 1;
      var Placement = 2;
      var Update = 4;
      var PlacementAndUpdate = 6;
      var Deletion = 8;
      var ContentReset = 16;
      var Callback = 32;
      var DidCapture = 64;
      var Ref = 128;
      var Snapshot = 256;
      var Passive = 512;
      var Hydrating = 1024;
      var HydratingAndUpdate = 1028;
      var LifecycleEffectMask = 932;
      var HostEffectMask = 2047;
      var Incomplete = 2048;
      var ShouldCapture = 4096;
      var ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;

      function getNearestMountedFiber(fiber) {
        var node = fiber;
        var nearestMounted = fiber;

        if (!fiber.alternate) {
          var nextNode = node;

          do {
            node = nextNode;

            if ((node.effectTag & (Placement | Hydrating)) !== NoEffect) {
              nearestMounted = node["return"];
            }

            nextNode = node["return"];
          } while (nextNode);
        } else {
          while (node["return"]) {
            node = node["return"];
          }
        }

        if (node.tag === HostRoot) {
          return nearestMounted;
        }

        return null;
      }

      function getSuspenseInstanceFromFiber(fiber) {
        if (fiber.tag === SuspenseComponent) {
          var suspenseState = fiber.memoizedState;

          if (suspenseState === null) {
            var current = fiber.alternate;

            if (current !== null) {
              suspenseState = current.memoizedState;
            }
          }

          if (suspenseState !== null) {
            return suspenseState.dehydrated;
          }
        }

        return null;
      }

      function getContainerFromFiber(fiber) {
        return fiber.tag === HostRoot ? fiber.stateNode.containerInfo : null;
      }

      function isFiberMounted(fiber) {
        return getNearestMountedFiber(fiber) === fiber;
      }

      function isMounted(component) {
        {
          var owner = ReactCurrentOwner.current;

          if (owner !== null && owner.tag === ClassComponent) {
            var ownerFiber = owner;
            var instance = ownerFiber.stateNode;

            if (!instance._warnedAboutRefsInRender) {
              error('%s is accessing isMounted inside its render() function. ' + 'render() should be a pure function of props and state. It should ' + 'never access something that requires stale data from the previous ' + 'render, such as refs. Move this logic to componentDidMount and ' + 'componentDidUpdate instead.', getComponentName(ownerFiber.type) || 'A component');
            }

            instance._warnedAboutRefsInRender = true;
          }
        }
        var fiber = get(component);

        if (!fiber) {
          return false;
        }

        return getNearestMountedFiber(fiber) === fiber;
      }

      function assertIsMounted(fiber) {
        if (!(getNearestMountedFiber(fiber) === fiber)) {
          {
            throw Error("Unable to find node on an unmounted component.");
          }
        }
      }

      function findCurrentFiberUsingSlowPath(fiber) {
        var alternate = fiber.alternate;

        if (!alternate) {
          var nearestMounted = getNearestMountedFiber(fiber);

          if (!(nearestMounted !== null)) {
            {
              throw Error("Unable to find node on an unmounted component.");
            }
          }

          if (nearestMounted !== fiber) {
            return null;
          }

          return fiber;
        }

        var a = fiber;
        var b = alternate;

        while (true) {
          var parentA = a["return"];

          if (parentA === null) {
            break;
          }

          var parentB = parentA.alternate;

          if (parentB === null) {
            var nextParent = parentA["return"];

            if (nextParent !== null) {
              a = b = nextParent;
              continue;
            }

            break;
          }

          if (parentA.child === parentB.child) {
            var child = parentA.child;

            while (child) {
              if (child === a) {
                assertIsMounted(parentA);
                return fiber;
              }

              if (child === b) {
                assertIsMounted(parentA);
                return alternate;
              }

              child = child.sibling;
            }

            {
              {
                throw Error("Unable to find node on an unmounted component.");
              }
            }
          }

          if (a["return"] !== b["return"]) {
            a = parentA;
            b = parentB;
          } else {
            var didFindChild = false;
            var _child = parentA.child;

            while (_child) {
              if (_child === a) {
                didFindChild = true;
                a = parentA;
                b = parentB;
                break;
              }

              if (_child === b) {
                didFindChild = true;
                b = parentA;
                a = parentB;
                break;
              }

              _child = _child.sibling;
            }

            if (!didFindChild) {
              _child = parentB.child;

              while (_child) {
                if (_child === a) {
                  didFindChild = true;
                  a = parentB;
                  b = parentA;
                  break;
                }

                if (_child === b) {
                  didFindChild = true;
                  b = parentB;
                  a = parentA;
                  break;
                }

                _child = _child.sibling;
              }

              if (!didFindChild) {
                {
                  throw Error("Child was not found in either parent set. This indicates a bug in React related to the return pointer. Please file an issue.");
                }
              }
            }
          }

          if (!(a.alternate === b)) {
            {
              throw Error("Return fibers should always be each others' alternates. This error is likely caused by a bug in React. Please file an issue.");
            }
          }
        }

        if (!(a.tag === HostRoot)) {
          {
            throw Error("Unable to find node on an unmounted component.");
          }
        }

        if (a.stateNode.current === a) {
          return fiber;
        }

        return alternate;
      }

      function findCurrentHostFiber(parent) {
        var currentParent = findCurrentFiberUsingSlowPath(parent);

        if (!currentParent) {
          return null;
        }

        var node = currentParent;

        while (true) {
          if (node.tag === HostComponent || node.tag === HostText) {
            return node;
          } else if (node.child) {
            node.child["return"] = node;
            node = node.child;
            continue;
          }

          if (node === currentParent) {
            return null;
          }

          while (!node.sibling) {
            if (!node["return"] || node["return"] === currentParent) {
              return null;
            }

            node = node["return"];
          }

          node.sibling["return"] = node["return"];
          node = node.sibling;
        }

        return null;
      }

      function findCurrentHostFiberWithNoPortals(parent) {
        var currentParent = findCurrentFiberUsingSlowPath(parent);

        if (!currentParent) {
          return null;
        }

        var node = currentParent;

        while (true) {
          if (node.tag === HostComponent || node.tag === HostText || enableFundamentalAPI) {
            return node;
          } else if (node.child && node.tag !== HostPortal) {
            node.child["return"] = node;
            node = node.child;
            continue;
          }

          if (node === currentParent) {
            return null;
          }

          while (!node.sibling) {
            if (!node["return"] || node["return"] === currentParent) {
              return null;
            }

            node = node["return"];
          }

          node.sibling["return"] = node["return"];
          node = node.sibling;
        }

        return null;
      }

      function accumulateInto(current, next) {
        if (!(next != null)) {
          {
            throw Error("accumulateInto(...): Accumulated items must not be null or undefined.");
          }
        }

        if (current == null) {
          return next;
        }

        if (Array.isArray(current)) {
          if (Array.isArray(next)) {
            current.push.apply(current, next);
            return current;
          }

          current.push(next);
          return current;
        }

        if (Array.isArray(next)) {
          return [current].concat(next);
        }

        return [current, next];
      }

      function forEachAccumulated(arr, cb, scope) {
        if (Array.isArray(arr)) {
          arr.forEach(cb, scope);
        } else if (arr) {
          cb.call(scope, arr);
        }
      }

      var eventQueue = null;

      var executeDispatchesAndRelease = function executeDispatchesAndRelease(event) {
        if (event) {
          executeDispatchesInOrder(event);

          if (!event.isPersistent()) {
            event.constructor.release(event);
          }
        }
      };

      var executeDispatchesAndReleaseTopLevel = function executeDispatchesAndReleaseTopLevel(e) {
        return executeDispatchesAndRelease(e);
      };

      function runEventsInBatch(events) {
        if (events !== null) {
          eventQueue = accumulateInto(eventQueue, events);
        }

        var processingEventQueue = eventQueue;
        eventQueue = null;

        if (!processingEventQueue) {
          return;
        }

        forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseTopLevel);

        if (!!eventQueue) {
          {
            throw Error("processEventQueue(): Additional events were enqueued while processing an event queue. Support for this has not yet been implemented.");
          }
        }

        rethrowCaughtError();
      }

      function getEventTarget(nativeEvent) {
        var target = nativeEvent.target || nativeEvent.srcElement || window;

        if (target.correspondingUseElement) {
          target = target.correspondingUseElement;
        }

        return target.nodeType === TEXT_NODE ? target.parentNode : target;
      }

      function isEventSupported(eventNameSuffix) {
        if (!canUseDOM) {
          return false;
        }

        var eventName = 'on' + eventNameSuffix;
        var isSupported = (eventName in document);

        if (!isSupported) {
          var element = document.createElement('div');
          element.setAttribute(eventName, 'return;');
          isSupported = typeof element[eventName] === 'function';
        }

        return isSupported;
      }

      var CALLBACK_BOOKKEEPING_POOL_SIZE = 10;
      var callbackBookkeepingPool = [];

      function releaseTopLevelCallbackBookKeeping(instance) {
        instance.topLevelType = null;
        instance.nativeEvent = null;
        instance.targetInst = null;
        instance.ancestors.length = 0;

        if (callbackBookkeepingPool.length < CALLBACK_BOOKKEEPING_POOL_SIZE) {
          callbackBookkeepingPool.push(instance);
        }
      }

      function getTopLevelCallbackBookKeeping(topLevelType, nativeEvent, targetInst, eventSystemFlags) {
        if (callbackBookkeepingPool.length) {
          var instance = callbackBookkeepingPool.pop();
          instance.topLevelType = topLevelType;
          instance.eventSystemFlags = eventSystemFlags;
          instance.nativeEvent = nativeEvent;
          instance.targetInst = targetInst;
          return instance;
        }

        return {
          topLevelType: topLevelType,
          eventSystemFlags: eventSystemFlags,
          nativeEvent: nativeEvent,
          targetInst: targetInst,
          ancestors: []
        };
      }

      function findRootContainerNode(inst) {
        if (inst.tag === HostRoot) {
          return inst.stateNode.containerInfo;
        }

        while (inst["return"]) {
          inst = inst["return"];
        }

        if (inst.tag !== HostRoot) {
          return null;
        }

        return inst.stateNode.containerInfo;
      }

      function extractPluginEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags) {
        var events = null;

        for (var i = 0; i < plugins.length; i++) {
          var possiblePlugin = plugins[i];

          if (possiblePlugin) {
            var extractedEvents = possiblePlugin.extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags);

            if (extractedEvents) {
              events = accumulateInto(events, extractedEvents);
            }
          }
        }

        return events;
      }

      function runExtractedPluginEventsInBatch(topLevelType, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags) {
        var events = extractPluginEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags);
        runEventsInBatch(events);
      }

      function handleTopLevel(bookKeeping) {
        var targetInst = bookKeeping.targetInst;
        var ancestor = targetInst;

        do {
          if (!ancestor) {
            var ancestors = bookKeeping.ancestors;
            ancestors.push(ancestor);
            break;
          }

          var root = findRootContainerNode(ancestor);

          if (!root) {
            break;
          }

          var tag = ancestor.tag;

          if (tag === HostComponent || tag === HostText) {
            bookKeeping.ancestors.push(ancestor);
          }

          ancestor = getClosestInstanceFromNode(root);
        } while (ancestor);

        for (var i = 0; i < bookKeeping.ancestors.length; i++) {
          targetInst = bookKeeping.ancestors[i];
          var eventTarget = getEventTarget(bookKeeping.nativeEvent);
          var topLevelType = bookKeeping.topLevelType;
          var nativeEvent = bookKeeping.nativeEvent;
          var eventSystemFlags = bookKeeping.eventSystemFlags;

          if (i === 0) {
            eventSystemFlags |= IS_FIRST_ANCESTOR;
          }

          runExtractedPluginEventsInBatch(topLevelType, targetInst, nativeEvent, eventTarget, eventSystemFlags);
        }
      }

      function dispatchEventForLegacyPluginEventSystem(topLevelType, eventSystemFlags, nativeEvent, targetInst) {
        var bookKeeping = getTopLevelCallbackBookKeeping(topLevelType, nativeEvent, targetInst, eventSystemFlags);

        try {
          batchedEventUpdates(handleTopLevel, bookKeeping);
        } finally {
          releaseTopLevelCallbackBookKeeping(bookKeeping);
        }
      }

      function legacyListenToEvent(registrationName, mountAt) {
        var listenerMap = getListenerMapForElement(mountAt);
        var dependencies = registrationNameDependencies[registrationName];

        for (var i = 0; i < dependencies.length; i++) {
          var dependency = dependencies[i];
          legacyListenToTopLevelEvent(dependency, mountAt, listenerMap);
        }
      }

      function legacyListenToTopLevelEvent(topLevelType, mountAt, listenerMap) {
        if (!listenerMap.has(topLevelType)) {
          switch (topLevelType) {
            case TOP_SCROLL:
              trapCapturedEvent(TOP_SCROLL, mountAt);
              break;

            case TOP_FOCUS:
            case TOP_BLUR:
              trapCapturedEvent(TOP_FOCUS, mountAt);
              trapCapturedEvent(TOP_BLUR, mountAt);
              listenerMap.set(TOP_BLUR, null);
              listenerMap.set(TOP_FOCUS, null);
              break;

            case TOP_CANCEL:
            case TOP_CLOSE:
              if (isEventSupported(getRawEventName(topLevelType))) {
                trapCapturedEvent(topLevelType, mountAt);
              }

              break;

            case TOP_INVALID:
            case TOP_SUBMIT:
            case TOP_RESET:
              break;

            default:
              var isMediaEvent = mediaEventTypes.indexOf(topLevelType) !== -1;

              if (!isMediaEvent) {
                trapBubbledEvent(topLevelType, mountAt);
              }

              break;
          }

          listenerMap.set(topLevelType, null);
        }
      }

      function isListeningToAllDependencies(registrationName, mountAt) {
        var listenerMap = getListenerMapForElement(mountAt);
        var dependencies = registrationNameDependencies[registrationName];

        for (var i = 0; i < dependencies.length; i++) {
          var dependency = dependencies[i];

          if (!listenerMap.has(dependency)) {
            return false;
          }
        }

        return true;
      }

      var attemptUserBlockingHydration;

      function setAttemptUserBlockingHydration(fn) {
        attemptUserBlockingHydration = fn;
      }

      var attemptContinuousHydration;

      function setAttemptContinuousHydration(fn) {
        attemptContinuousHydration = fn;
      }

      var attemptHydrationAtCurrentPriority;

      function setAttemptHydrationAtCurrentPriority(fn) {
        attemptHydrationAtCurrentPriority = fn;
      }

      var hasScheduledReplayAttempt = false;
      var queuedDiscreteEvents = [];
      var queuedFocus = null;
      var queuedDrag = null;
      var queuedMouse = null;
      var queuedPointers = new Map();
      var queuedPointerCaptures = new Map();
      var queuedExplicitHydrationTargets = [];

      function hasQueuedDiscreteEvents() {
        return queuedDiscreteEvents.length > 0;
      }

      var discreteReplayableEvents = [TOP_MOUSE_DOWN, TOP_MOUSE_UP, TOP_TOUCH_CANCEL, TOP_TOUCH_END, TOP_TOUCH_START, TOP_AUX_CLICK, TOP_DOUBLE_CLICK, TOP_POINTER_CANCEL, TOP_POINTER_DOWN, TOP_POINTER_UP, TOP_DRAG_END, TOP_DRAG_START, TOP_DROP, TOP_COMPOSITION_END, TOP_COMPOSITION_START, TOP_KEY_DOWN, TOP_KEY_PRESS, TOP_KEY_UP, TOP_INPUT, TOP_TEXT_INPUT, TOP_CLOSE, TOP_CANCEL, TOP_COPY, TOP_CUT, TOP_PASTE, TOP_CLICK, TOP_CHANGE, TOP_CONTEXT_MENU, TOP_RESET, TOP_SUBMIT];
      var continuousReplayableEvents = [TOP_FOCUS, TOP_BLUR, TOP_DRAG_ENTER, TOP_DRAG_LEAVE, TOP_MOUSE_OVER, TOP_MOUSE_OUT, TOP_POINTER_OVER, TOP_POINTER_OUT, TOP_GOT_POINTER_CAPTURE, TOP_LOST_POINTER_CAPTURE];

      function isReplayableDiscreteEvent(eventType) {
        return discreteReplayableEvents.indexOf(eventType) > -1;
      }

      function trapReplayableEventForDocument(topLevelType, document, listenerMap) {
        legacyListenToTopLevelEvent(topLevelType, document, listenerMap);
      }

      function eagerlyTrapReplayableEvents(container, document) {
        var listenerMapForDoc = getListenerMapForElement(document);
        discreteReplayableEvents.forEach(function (topLevelType) {
          trapReplayableEventForDocument(topLevelType, document, listenerMapForDoc);
        });
        continuousReplayableEvents.forEach(function (topLevelType) {
          trapReplayableEventForDocument(topLevelType, document, listenerMapForDoc);
        });
      }

      function createQueuedReplayableEvent(blockedOn, topLevelType, eventSystemFlags, container, nativeEvent) {
        return {
          blockedOn: blockedOn,
          topLevelType: topLevelType,
          eventSystemFlags: eventSystemFlags | IS_REPLAYED,
          nativeEvent: nativeEvent,
          container: container
        };
      }

      function queueDiscreteEvent(blockedOn, topLevelType, eventSystemFlags, container, nativeEvent) {
        var queuedEvent = createQueuedReplayableEvent(blockedOn, topLevelType, eventSystemFlags, container, nativeEvent);
        queuedDiscreteEvents.push(queuedEvent);
      }

      function clearIfContinuousEvent(topLevelType, nativeEvent) {
        switch (topLevelType) {
          case TOP_FOCUS:
          case TOP_BLUR:
            queuedFocus = null;
            break;

          case TOP_DRAG_ENTER:
          case TOP_DRAG_LEAVE:
            queuedDrag = null;
            break;

          case TOP_MOUSE_OVER:
          case TOP_MOUSE_OUT:
            queuedMouse = null;
            break;

          case TOP_POINTER_OVER:
          case TOP_POINTER_OUT:
            {
              var pointerId = nativeEvent.pointerId;
              queuedPointers["delete"](pointerId);
              break;
            }

          case TOP_GOT_POINTER_CAPTURE:
          case TOP_LOST_POINTER_CAPTURE:
            {
              var _pointerId = nativeEvent.pointerId;
              queuedPointerCaptures["delete"](_pointerId);
              break;
            }
        }
      }

      function accumulateOrCreateContinuousQueuedReplayableEvent(existingQueuedEvent, blockedOn, topLevelType, eventSystemFlags, container, nativeEvent) {
        if (existingQueuedEvent === null || existingQueuedEvent.nativeEvent !== nativeEvent) {
          var queuedEvent = createQueuedReplayableEvent(blockedOn, topLevelType, eventSystemFlags, container, nativeEvent);

          if (blockedOn !== null) {
            var _fiber2 = getInstanceFromNode$1(blockedOn);

            if (_fiber2 !== null) {
              attemptContinuousHydration(_fiber2);
            }
          }

          return queuedEvent;
        }

        existingQueuedEvent.eventSystemFlags |= eventSystemFlags;
        return existingQueuedEvent;
      }

      function queueIfContinuousEvent(blockedOn, topLevelType, eventSystemFlags, container, nativeEvent) {
        switch (topLevelType) {
          case TOP_FOCUS:
            {
              var focusEvent = nativeEvent;
              queuedFocus = accumulateOrCreateContinuousQueuedReplayableEvent(queuedFocus, blockedOn, topLevelType, eventSystemFlags, container, focusEvent);
              return true;
            }

          case TOP_DRAG_ENTER:
            {
              var dragEvent = nativeEvent;
              queuedDrag = accumulateOrCreateContinuousQueuedReplayableEvent(queuedDrag, blockedOn, topLevelType, eventSystemFlags, container, dragEvent);
              return true;
            }

          case TOP_MOUSE_OVER:
            {
              var mouseEvent = nativeEvent;
              queuedMouse = accumulateOrCreateContinuousQueuedReplayableEvent(queuedMouse, blockedOn, topLevelType, eventSystemFlags, container, mouseEvent);
              return true;
            }

          case TOP_POINTER_OVER:
            {
              var pointerEvent = nativeEvent;
              var pointerId = pointerEvent.pointerId;
              queuedPointers.set(pointerId, accumulateOrCreateContinuousQueuedReplayableEvent(queuedPointers.get(pointerId) || null, blockedOn, topLevelType, eventSystemFlags, container, pointerEvent));
              return true;
            }

          case TOP_GOT_POINTER_CAPTURE:
            {
              var _pointerEvent = nativeEvent;
              var _pointerId2 = _pointerEvent.pointerId;
              queuedPointerCaptures.set(_pointerId2, accumulateOrCreateContinuousQueuedReplayableEvent(queuedPointerCaptures.get(_pointerId2) || null, blockedOn, topLevelType, eventSystemFlags, container, _pointerEvent));
              return true;
            }
        }

        return false;
      }

      function attemptExplicitHydrationTarget(queuedTarget) {
        var targetInst = getClosestInstanceFromNode(queuedTarget.target);

        if (targetInst !== null) {
          var nearestMounted = getNearestMountedFiber(targetInst);

          if (nearestMounted !== null) {
            var tag = nearestMounted.tag;

            if (tag === SuspenseComponent) {
              var instance = getSuspenseInstanceFromFiber(nearestMounted);

              if (instance !== null) {
                queuedTarget.blockedOn = instance;
                Scheduler.unstable_runWithPriority(queuedTarget.priority, function () {
                  attemptHydrationAtCurrentPriority(nearestMounted);
                });
                return;
              }
            } else if (tag === HostRoot) {
              var root = nearestMounted.stateNode;

              if (root.hydrate) {
                queuedTarget.blockedOn = getContainerFromFiber(nearestMounted);
                return;
              }
            }
          }
        }

        queuedTarget.blockedOn = null;
      }

      function attemptReplayContinuousQueuedEvent(queuedEvent) {
        if (queuedEvent.blockedOn !== null) {
          return false;
        }

        var nextBlockedOn = attemptToDispatchEvent(queuedEvent.topLevelType, queuedEvent.eventSystemFlags, queuedEvent.container, queuedEvent.nativeEvent);

        if (nextBlockedOn !== null) {
          var _fiber3 = getInstanceFromNode$1(nextBlockedOn);

          if (_fiber3 !== null) {
            attemptContinuousHydration(_fiber3);
          }

          queuedEvent.blockedOn = nextBlockedOn;
          return false;
        }

        return true;
      }

      function attemptReplayContinuousQueuedEventInMap(queuedEvent, key, map) {
        if (attemptReplayContinuousQueuedEvent(queuedEvent)) {
          map["delete"](key);
        }
      }

      function replayUnblockedEvents() {
        hasScheduledReplayAttempt = false;

        while (queuedDiscreteEvents.length > 0) {
          var nextDiscreteEvent = queuedDiscreteEvents[0];

          if (nextDiscreteEvent.blockedOn !== null) {
            var _fiber4 = getInstanceFromNode$1(nextDiscreteEvent.blockedOn);

            if (_fiber4 !== null) {
              attemptUserBlockingHydration(_fiber4);
            }

            break;
          }

          var nextBlockedOn = attemptToDispatchEvent(nextDiscreteEvent.topLevelType, nextDiscreteEvent.eventSystemFlags, nextDiscreteEvent.container, nextDiscreteEvent.nativeEvent);

          if (nextBlockedOn !== null) {
            nextDiscreteEvent.blockedOn = nextBlockedOn;
          } else {
            queuedDiscreteEvents.shift();
          }
        }

        if (queuedFocus !== null && attemptReplayContinuousQueuedEvent(queuedFocus)) {
          queuedFocus = null;
        }

        if (queuedDrag !== null && attemptReplayContinuousQueuedEvent(queuedDrag)) {
          queuedDrag = null;
        }

        if (queuedMouse !== null && attemptReplayContinuousQueuedEvent(queuedMouse)) {
          queuedMouse = null;
        }

        queuedPointers.forEach(attemptReplayContinuousQueuedEventInMap);
        queuedPointerCaptures.forEach(attemptReplayContinuousQueuedEventInMap);
      }

      function scheduleCallbackIfUnblocked(queuedEvent, unblocked) {
        if (queuedEvent.blockedOn === unblocked) {
          queuedEvent.blockedOn = null;

          if (!hasScheduledReplayAttempt) {
            hasScheduledReplayAttempt = true;
            Scheduler.unstable_scheduleCallback(Scheduler.unstable_NormalPriority, replayUnblockedEvents);
          }
        }
      }

      function retryIfBlockedOn(unblocked) {
        if (queuedDiscreteEvents.length > 0) {
          scheduleCallbackIfUnblocked(queuedDiscreteEvents[0], unblocked);

          for (var i = 1; i < queuedDiscreteEvents.length; i++) {
            var queuedEvent = queuedDiscreteEvents[i];

            if (queuedEvent.blockedOn === unblocked) {
              queuedEvent.blockedOn = null;
            }
          }
        }

        if (queuedFocus !== null) {
          scheduleCallbackIfUnblocked(queuedFocus, unblocked);
        }

        if (queuedDrag !== null) {
          scheduleCallbackIfUnblocked(queuedDrag, unblocked);
        }

        if (queuedMouse !== null) {
          scheduleCallbackIfUnblocked(queuedMouse, unblocked);
        }

        var unblock = function unblock(queuedEvent) {
          return scheduleCallbackIfUnblocked(queuedEvent, unblocked);
        };

        queuedPointers.forEach(unblock);
        queuedPointerCaptures.forEach(unblock);

        for (var _i = 0; _i < queuedExplicitHydrationTargets.length; _i++) {
          var queuedTarget = queuedExplicitHydrationTargets[_i];

          if (queuedTarget.blockedOn === unblocked) {
            queuedTarget.blockedOn = null;
          }
        }

        while (queuedExplicitHydrationTargets.length > 0) {
          var nextExplicitTarget = queuedExplicitHydrationTargets[0];

          if (nextExplicitTarget.blockedOn !== null) {
            break;
          } else {
            attemptExplicitHydrationTarget(nextExplicitTarget);

            if (nextExplicitTarget.blockedOn === null) {
              queuedExplicitHydrationTargets.shift();
            }
          }
        }
      }

      function addEventBubbleListener(element, eventType, listener) {
        element.addEventListener(eventType, listener, false);
      }

      function addEventCaptureListener(element, eventType, listener) {
        element.addEventListener(eventType, listener, true);
      }

      var simpleEventPluginEventTypes = {};
      var topLevelEventsToDispatchConfig = new Map();
      var eventPriorities = new Map();
      var discreteEventPairsForSimpleEventPlugin = [TOP_BLUR, 'blur', TOP_CANCEL, 'cancel', TOP_CLICK, 'click', TOP_CLOSE, 'close', TOP_CONTEXT_MENU, 'contextMenu', TOP_COPY, 'copy', TOP_CUT, 'cut', TOP_AUX_CLICK, 'auxClick', TOP_DOUBLE_CLICK, 'doubleClick', TOP_DRAG_END, 'dragEnd', TOP_DRAG_START, 'dragStart', TOP_DROP, 'drop', TOP_FOCUS, 'focus', TOP_INPUT, 'input', TOP_INVALID, 'invalid', TOP_KEY_DOWN, 'keyDown', TOP_KEY_PRESS, 'keyPress', TOP_KEY_UP, 'keyUp', TOP_MOUSE_DOWN, 'mouseDown', TOP_MOUSE_UP, 'mouseUp', TOP_PASTE, 'paste', TOP_PAUSE, 'pause', TOP_PLAY, 'play', TOP_POINTER_CANCEL, 'pointerCancel', TOP_POINTER_DOWN, 'pointerDown', TOP_POINTER_UP, 'pointerUp', TOP_RATE_CHANGE, 'rateChange', TOP_RESET, 'reset', TOP_SEEKED, 'seeked', TOP_SUBMIT, 'submit', TOP_TOUCH_CANCEL, 'touchCancel', TOP_TOUCH_END, 'touchEnd', TOP_TOUCH_START, 'touchStart', TOP_VOLUME_CHANGE, 'volumeChange'];
      var otherDiscreteEvents = [TOP_CHANGE, TOP_SELECTION_CHANGE, TOP_TEXT_INPUT, TOP_COMPOSITION_START, TOP_COMPOSITION_END, TOP_COMPOSITION_UPDATE];
      var userBlockingPairsForSimpleEventPlugin = [TOP_DRAG, 'drag', TOP_DRAG_ENTER, 'dragEnter', TOP_DRAG_EXIT, 'dragExit', TOP_DRAG_LEAVE, 'dragLeave', TOP_DRAG_OVER, 'dragOver', TOP_MOUSE_MOVE, 'mouseMove', TOP_MOUSE_OUT, 'mouseOut', TOP_MOUSE_OVER, 'mouseOver', TOP_POINTER_MOVE, 'pointerMove', TOP_POINTER_OUT, 'pointerOut', TOP_POINTER_OVER, 'pointerOver', TOP_SCROLL, 'scroll', TOP_TOGGLE, 'toggle', TOP_TOUCH_MOVE, 'touchMove', TOP_WHEEL, 'wheel'];
      var continuousPairsForSimpleEventPlugin = [TOP_ABORT, 'abort', TOP_ANIMATION_END, 'animationEnd', TOP_ANIMATION_ITERATION, 'animationIteration', TOP_ANIMATION_START, 'animationStart', TOP_CAN_PLAY, 'canPlay', TOP_CAN_PLAY_THROUGH, 'canPlayThrough', TOP_DURATION_CHANGE, 'durationChange', TOP_EMPTIED, 'emptied', TOP_ENCRYPTED, 'encrypted', TOP_ENDED, 'ended', TOP_ERROR, 'error', TOP_GOT_POINTER_CAPTURE, 'gotPointerCapture', TOP_LOAD, 'load', TOP_LOADED_DATA, 'loadedData', TOP_LOADED_METADATA, 'loadedMetadata', TOP_LOAD_START, 'loadStart', TOP_LOST_POINTER_CAPTURE, 'lostPointerCapture', TOP_PLAYING, 'playing', TOP_PROGRESS, 'progress', TOP_SEEKING, 'seeking', TOP_STALLED, 'stalled', TOP_SUSPEND, 'suspend', TOP_TIME_UPDATE, 'timeUpdate', TOP_TRANSITION_END, 'transitionEnd', TOP_WAITING, 'waiting'];

      function processSimpleEventPluginPairsByPriority(eventTypes, priority) {
        for (var i = 0; i < eventTypes.length; i += 2) {
          var topEvent = eventTypes[i];
          var event = eventTypes[i + 1];
          var capitalizedEvent = event[0].toUpperCase() + event.slice(1);
          var onEvent = 'on' + capitalizedEvent;
          var config = {
            phasedRegistrationNames: {
              bubbled: onEvent,
              captured: onEvent + 'Capture'
            },
            dependencies: [topEvent],
            eventPriority: priority
          };
          eventPriorities.set(topEvent, priority);
          topLevelEventsToDispatchConfig.set(topEvent, config);
          simpleEventPluginEventTypes[event] = config;
        }
      }

      function processTopEventPairsByPriority(eventTypes, priority) {
        for (var i = 0; i < eventTypes.length; i++) {
          eventPriorities.set(eventTypes[i], priority);
        }
      }

      processSimpleEventPluginPairsByPriority(discreteEventPairsForSimpleEventPlugin, DiscreteEvent);
      processSimpleEventPluginPairsByPriority(userBlockingPairsForSimpleEventPlugin, UserBlockingEvent);
      processSimpleEventPluginPairsByPriority(continuousPairsForSimpleEventPlugin, ContinuousEvent);
      processTopEventPairsByPriority(otherDiscreteEvents, DiscreteEvent);

      function getEventPriorityForPluginSystem(topLevelType) {
        var priority = eventPriorities.get(topLevelType);
        return priority === undefined ? ContinuousEvent : priority;
      }

      var UserBlockingPriority = Scheduler.unstable_UserBlockingPriority,
          runWithPriority = Scheduler.unstable_runWithPriority;
      var _enabled = true;

      function setEnabled(enabled) {
        _enabled = !!enabled;
      }

      function isEnabled() {
        return _enabled;
      }

      function trapBubbledEvent(topLevelType, element) {
        trapEventForPluginEventSystem(element, topLevelType, false);
      }

      function trapCapturedEvent(topLevelType, element) {
        trapEventForPluginEventSystem(element, topLevelType, true);
      }

      function trapEventForPluginEventSystem(container, topLevelType, capture) {
        var listener;

        switch (getEventPriorityForPluginSystem(topLevelType)) {
          case DiscreteEvent:
            listener = dispatchDiscreteEvent.bind(null, topLevelType, PLUGIN_EVENT_SYSTEM, container);
            break;

          case UserBlockingEvent:
            listener = dispatchUserBlockingUpdate.bind(null, topLevelType, PLUGIN_EVENT_SYSTEM, container);
            break;

          case ContinuousEvent:
          default:
            listener = dispatchEvent.bind(null, topLevelType, PLUGIN_EVENT_SYSTEM, container);
            break;
        }

        var rawEventName = getRawEventName(topLevelType);

        if (capture) {
          addEventCaptureListener(container, rawEventName, listener);
        } else {
          addEventBubbleListener(container, rawEventName, listener);
        }
      }

      function dispatchDiscreteEvent(topLevelType, eventSystemFlags, container, nativeEvent) {
        flushDiscreteUpdatesIfNeeded();
        discreteUpdates(dispatchEvent, topLevelType, eventSystemFlags, container, nativeEvent);
      }

      function dispatchUserBlockingUpdate(topLevelType, eventSystemFlags, container, nativeEvent) {
        runWithPriority(UserBlockingPriority, dispatchEvent.bind(null, topLevelType, eventSystemFlags, container, nativeEvent));
      }

      function dispatchEvent(topLevelType, eventSystemFlags, container, nativeEvent) {
        if (!_enabled) {
          return;
        }

        if (hasQueuedDiscreteEvents() && isReplayableDiscreteEvent(topLevelType)) {
          queueDiscreteEvent(null, topLevelType, eventSystemFlags, container, nativeEvent);
          return;
        }

        var blockedOn = attemptToDispatchEvent(topLevelType, eventSystemFlags, container, nativeEvent);

        if (blockedOn === null) {
          clearIfContinuousEvent(topLevelType, nativeEvent);
          return;
        }

        if (isReplayableDiscreteEvent(topLevelType)) {
          queueDiscreteEvent(blockedOn, topLevelType, eventSystemFlags, container, nativeEvent);
          return;
        }

        if (queueIfContinuousEvent(blockedOn, topLevelType, eventSystemFlags, container, nativeEvent)) {
          return;
        }

        clearIfContinuousEvent(topLevelType, nativeEvent);
        {
          dispatchEventForLegacyPluginEventSystem(topLevelType, eventSystemFlags, nativeEvent, null);
        }
      }

      function attemptToDispatchEvent(topLevelType, eventSystemFlags, container, nativeEvent) {
        var nativeEventTarget = getEventTarget(nativeEvent);
        var targetInst = getClosestInstanceFromNode(nativeEventTarget);

        if (targetInst !== null) {
          var nearestMounted = getNearestMountedFiber(targetInst);

          if (nearestMounted === null) {
            targetInst = null;
          } else {
            var tag = nearestMounted.tag;

            if (tag === SuspenseComponent) {
              var instance = getSuspenseInstanceFromFiber(nearestMounted);

              if (instance !== null) {
                return instance;
              }

              targetInst = null;
            } else if (tag === HostRoot) {
              var root = nearestMounted.stateNode;

              if (root.hydrate) {
                return getContainerFromFiber(nearestMounted);
              }

              targetInst = null;
            } else if (nearestMounted !== targetInst) {
              targetInst = null;
            }
          }
        }

        {
          dispatchEventForLegacyPluginEventSystem(topLevelType, eventSystemFlags, nativeEvent, targetInst);
        }
        return null;
      }

      var shorthandToLonghand = {
        animation: ['animationDelay', 'animationDirection', 'animationDuration', 'animationFillMode', 'animationIterationCount', 'animationName', 'animationPlayState', 'animationTimingFunction'],
        background: ['backgroundAttachment', 'backgroundClip', 'backgroundColor', 'backgroundImage', 'backgroundOrigin', 'backgroundPositionX', 'backgroundPositionY', 'backgroundRepeat', 'backgroundSize'],
        backgroundPosition: ['backgroundPositionX', 'backgroundPositionY'],
        border: ['borderBottomColor', 'borderBottomStyle', 'borderBottomWidth', 'borderImageOutset', 'borderImageRepeat', 'borderImageSlice', 'borderImageSource', 'borderImageWidth', 'borderLeftColor', 'borderLeftStyle', 'borderLeftWidth', 'borderRightColor', 'borderRightStyle', 'borderRightWidth', 'borderTopColor', 'borderTopStyle', 'borderTopWidth'],
        borderBlockEnd: ['borderBlockEndColor', 'borderBlockEndStyle', 'borderBlockEndWidth'],
        borderBlockStart: ['borderBlockStartColor', 'borderBlockStartStyle', 'borderBlockStartWidth'],
        borderBottom: ['borderBottomColor', 'borderBottomStyle', 'borderBottomWidth'],
        borderColor: ['borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor'],
        borderImage: ['borderImageOutset', 'borderImageRepeat', 'borderImageSlice', 'borderImageSource', 'borderImageWidth'],
        borderInlineEnd: ['borderInlineEndColor', 'borderInlineEndStyle', 'borderInlineEndWidth'],
        borderInlineStart: ['borderInlineStartColor', 'borderInlineStartStyle', 'borderInlineStartWidth'],
        borderLeft: ['borderLeftColor', 'borderLeftStyle', 'borderLeftWidth'],
        borderRadius: ['borderBottomLeftRadius', 'borderBottomRightRadius', 'borderTopLeftRadius', 'borderTopRightRadius'],
        borderRight: ['borderRightColor', 'borderRightStyle', 'borderRightWidth'],
        borderStyle: ['borderBottomStyle', 'borderLeftStyle', 'borderRightStyle', 'borderTopStyle'],
        borderTop: ['borderTopColor', 'borderTopStyle', 'borderTopWidth'],
        borderWidth: ['borderBottomWidth', 'borderLeftWidth', 'borderRightWidth', 'borderTopWidth'],
        columnRule: ['columnRuleColor', 'columnRuleStyle', 'columnRuleWidth'],
        columns: ['columnCount', 'columnWidth'],
        flex: ['flexBasis', 'flexGrow', 'flexShrink'],
        flexFlow: ['flexDirection', 'flexWrap'],
        font: ['fontFamily', 'fontFeatureSettings', 'fontKerning', 'fontLanguageOverride', 'fontSize', 'fontSizeAdjust', 'fontStretch', 'fontStyle', 'fontVariant', 'fontVariantAlternates', 'fontVariantCaps', 'fontVariantEastAsian', 'fontVariantLigatures', 'fontVariantNumeric', 'fontVariantPosition', 'fontWeight', 'lineHeight'],
        fontVariant: ['fontVariantAlternates', 'fontVariantCaps', 'fontVariantEastAsian', 'fontVariantLigatures', 'fontVariantNumeric', 'fontVariantPosition'],
        gap: ['columnGap', 'rowGap'],
        grid: ['gridAutoColumns', 'gridAutoFlow', 'gridAutoRows', 'gridTemplateAreas', 'gridTemplateColumns', 'gridTemplateRows'],
        gridArea: ['gridColumnEnd', 'gridColumnStart', 'gridRowEnd', 'gridRowStart'],
        gridColumn: ['gridColumnEnd', 'gridColumnStart'],
        gridColumnGap: ['columnGap'],
        gridGap: ['columnGap', 'rowGap'],
        gridRow: ['gridRowEnd', 'gridRowStart'],
        gridRowGap: ['rowGap'],
        gridTemplate: ['gridTemplateAreas', 'gridTemplateColumns', 'gridTemplateRows'],
        listStyle: ['listStyleImage', 'listStylePosition', 'listStyleType'],
        margin: ['marginBottom', 'marginLeft', 'marginRight', 'marginTop'],
        marker: ['markerEnd', 'markerMid', 'markerStart'],
        mask: ['maskClip', 'maskComposite', 'maskImage', 'maskMode', 'maskOrigin', 'maskPositionX', 'maskPositionY', 'maskRepeat', 'maskSize'],
        maskPosition: ['maskPositionX', 'maskPositionY'],
        outline: ['outlineColor', 'outlineStyle', 'outlineWidth'],
        overflow: ['overflowX', 'overflowY'],
        padding: ['paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop'],
        placeContent: ['alignContent', 'justifyContent'],
        placeItems: ['alignItems', 'justifyItems'],
        placeSelf: ['alignSelf', 'justifySelf'],
        textDecoration: ['textDecorationColor', 'textDecorationLine', 'textDecorationStyle'],
        textEmphasis: ['textEmphasisColor', 'textEmphasisStyle'],
        transition: ['transitionDelay', 'transitionDuration', 'transitionProperty', 'transitionTimingFunction'],
        wordWrap: ['overflowWrap']
      };
      var isUnitlessNumber = {
        animationIterationCount: true,
        borderImageOutset: true,
        borderImageSlice: true,
        borderImageWidth: true,
        boxFlex: true,
        boxFlexGroup: true,
        boxOrdinalGroup: true,
        columnCount: true,
        columns: true,
        flex: true,
        flexGrow: true,
        flexPositive: true,
        flexShrink: true,
        flexNegative: true,
        flexOrder: true,
        gridArea: true,
        gridRow: true,
        gridRowEnd: true,
        gridRowSpan: true,
        gridRowStart: true,
        gridColumn: true,
        gridColumnEnd: true,
        gridColumnSpan: true,
        gridColumnStart: true,
        fontWeight: true,
        lineClamp: true,
        lineHeight: true,
        opacity: true,
        order: true,
        orphans: true,
        tabSize: true,
        widows: true,
        zIndex: true,
        zoom: true,
        fillOpacity: true,
        floodOpacity: true,
        stopOpacity: true,
        strokeDasharray: true,
        strokeDashoffset: true,
        strokeMiterlimit: true,
        strokeOpacity: true,
        strokeWidth: true
      };

      function prefixKey(prefix, key) {
        return prefix + key.charAt(0).toUpperCase() + key.substring(1);
      }

      var prefixes = ['Webkit', 'ms', 'Moz', 'O'];
      Object.keys(isUnitlessNumber).forEach(function (prop) {
        prefixes.forEach(function (prefix) {
          isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
        });
      });

      function dangerousStyleValue(name, value, isCustomProperty) {
        var isEmpty = value == null || typeof value === 'boolean' || value === '';

        if (isEmpty) {
          return '';
        }

        if (!isCustomProperty && typeof value === 'number' && value !== 0 && !(isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name])) {
          return value + 'px';
        }

        return ('' + value).trim();
      }

      var uppercasePattern = /([A-Z])/g;
      var msPattern = /^ms-/;

      function hyphenateStyleName(name) {
        return name.replace(uppercasePattern, '-$1').toLowerCase().replace(msPattern, '-ms-');
      }

      var warnValidStyle = function warnValidStyle() {};

      {
        var badVendoredStyleNamePattern = /^(?:webkit|moz|o)[A-Z]/;
        var msPattern$1 = /^-ms-/;
        var hyphenPattern = /-(.)/g;
        var badStyleValueWithSemicolonPattern = /;\s*$/;
        var warnedStyleNames = {};
        var warnedStyleValues = {};
        var warnedForNaNValue = false;
        var warnedForInfinityValue = false;

        var camelize = function camelize(string) {
          return string.replace(hyphenPattern, function (_, character) {
            return character.toUpperCase();
          });
        };

        var warnHyphenatedStyleName = function warnHyphenatedStyleName(name) {
          if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
            return;
          }

          warnedStyleNames[name] = true;
          error('Unsupported style property %s. Did you mean %s?', name, camelize(name.replace(msPattern$1, 'ms-')));
        };

        var warnBadVendoredStyleName = function warnBadVendoredStyleName(name) {
          if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
            return;
          }

          warnedStyleNames[name] = true;
          error('Unsupported vendor-prefixed style property %s. Did you mean %s?', name, name.charAt(0).toUpperCase() + name.slice(1));
        };

        var warnStyleValueWithSemicolon = function warnStyleValueWithSemicolon(name, value) {
          if (warnedStyleValues.hasOwnProperty(value) && warnedStyleValues[value]) {
            return;
          }

          warnedStyleValues[value] = true;
          error("Style property values shouldn't contain a semicolon. " + 'Try "%s: %s" instead.', name, value.replace(badStyleValueWithSemicolonPattern, ''));
        };

        var warnStyleValueIsNaN = function warnStyleValueIsNaN(name, value) {
          if (warnedForNaNValue) {
            return;
          }

          warnedForNaNValue = true;
          error('`NaN` is an invalid value for the `%s` css style property.', name);
        };

        var warnStyleValueIsInfinity = function warnStyleValueIsInfinity(name, value) {
          if (warnedForInfinityValue) {
            return;
          }

          warnedForInfinityValue = true;
          error('`Infinity` is an invalid value for the `%s` css style property.', name);
        };

        warnValidStyle = function warnValidStyle(name, value) {
          if (name.indexOf('-') > -1) {
            warnHyphenatedStyleName(name);
          } else if (badVendoredStyleNamePattern.test(name)) {
            warnBadVendoredStyleName(name);
          } else if (badStyleValueWithSemicolonPattern.test(value)) {
            warnStyleValueWithSemicolon(name, value);
          }

          if (typeof value === 'number') {
            if (isNaN(value)) {
              warnStyleValueIsNaN(name, value);
            } else if (!isFinite(value)) {
              warnStyleValueIsInfinity(name, value);
            }
          }
        };
      }
      var warnValidStyle$1 = warnValidStyle;

      function createDangerousStringForStyles(styles) {
        {
          var serialized = '';
          var delimiter = '';

          for (var styleName in styles) {
            if (!styles.hasOwnProperty(styleName)) {
              continue;
            }

            var styleValue = styles[styleName];

            if (styleValue != null) {
              var isCustomProperty = styleName.indexOf('--') === 0;
              serialized += delimiter + (isCustomProperty ? styleName : hyphenateStyleName(styleName)) + ':';
              serialized += dangerousStyleValue(styleName, styleValue, isCustomProperty);
              delimiter = ';';
            }
          }

          return serialized || null;
        }
      }

      function setValueForStyles(node, styles) {
        var style = node.style;

        for (var styleName in styles) {
          if (!styles.hasOwnProperty(styleName)) {
            continue;
          }

          var isCustomProperty = styleName.indexOf('--') === 0;
          {
            if (!isCustomProperty) {
              warnValidStyle$1(styleName, styles[styleName]);
            }
          }
          var styleValue = dangerousStyleValue(styleName, styles[styleName], isCustomProperty);

          if (styleName === 'float') {
            styleName = 'cssFloat';
          }

          if (isCustomProperty) {
            style.setProperty(styleName, styleValue);
          } else {
            style[styleName] = styleValue;
          }
        }
      }

      function isValueEmpty(value) {
        return value == null || typeof value === 'boolean' || value === '';
      }

      function expandShorthandMap(styles) {
        var expanded = {};

        for (var key in styles) {
          var longhands = shorthandToLonghand[key] || [key];

          for (var i = 0; i < longhands.length; i++) {
            expanded[longhands[i]] = key;
          }
        }

        return expanded;
      }

      function validateShorthandPropertyCollisionInDev(styleUpdates, nextStyles) {
        {
          if (!nextStyles) {
            return;
          }

          var expandedUpdates = expandShorthandMap(styleUpdates);
          var expandedStyles = expandShorthandMap(nextStyles);
          var warnedAbout = {};

          for (var key in expandedUpdates) {
            var originalKey = expandedUpdates[key];
            var correctOriginalKey = expandedStyles[key];

            if (correctOriginalKey && originalKey !== correctOriginalKey) {
              var warningKey = originalKey + ',' + correctOriginalKey;

              if (warnedAbout[warningKey]) {
                continue;
              }

              warnedAbout[warningKey] = true;
              error('%s a style property during rerender (%s) when a ' + 'conflicting property is set (%s) can lead to styling bugs. To ' + "avoid this, don't mix shorthand and non-shorthand properties " + 'for the same value; instead, replace the shorthand with ' + 'separate values.', isValueEmpty(styleUpdates[originalKey]) ? 'Removing' : 'Updating', originalKey, correctOriginalKey);
            }
          }
        }
      }

      var omittedCloseTags = {
        area: true,
        base: true,
        br: true,
        col: true,
        embed: true,
        hr: true,
        img: true,
        input: true,
        keygen: true,
        link: true,
        meta: true,
        param: true,
        source: true,
        track: true,
        wbr: true
      };

      var voidElementTags = _assign({
        menuitem: true
      }, omittedCloseTags);

      var HTML = '__html';
      var ReactDebugCurrentFrame$3 = null;
      {
        ReactDebugCurrentFrame$3 = ReactSharedInternals.ReactDebugCurrentFrame;
      }

      function assertValidProps(tag, props) {
        if (!props) {
          return;
        }

        if (voidElementTags[tag]) {
          if (!(props.children == null && props.dangerouslySetInnerHTML == null)) {
            {
              throw Error(tag + " is a void element tag and must neither have `children` nor use `dangerouslySetInnerHTML`." + ReactDebugCurrentFrame$3.getStackAddendum());
            }
          }
        }

        if (props.dangerouslySetInnerHTML != null) {
          if (!(props.children == null)) {
            {
              throw Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
            }
          }

          if (!(typeof props.dangerouslySetInnerHTML === 'object' && HTML in props.dangerouslySetInnerHTML)) {
            {
              throw Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://fb.me/react-invariant-dangerously-set-inner-html for more information.");
            }
          }
        }

        {
          if (!props.suppressContentEditableWarning && props.contentEditable && props.children != null) {
            error('A component is `contentEditable` and contains `children` managed by ' + 'React. It is now your responsibility to guarantee that none of ' + 'those nodes are unexpectedly modified or duplicated. This is ' + 'probably not intentional.');
          }
        }

        if (!(props.style == null || typeof props.style === 'object')) {
          {
            throw Error("The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX." + ReactDebugCurrentFrame$3.getStackAddendum());
          }
        }
      }

      function isCustomComponent(tagName, props) {
        if (tagName.indexOf('-') === -1) {
          return typeof props.is === 'string';
        }

        switch (tagName) {
          case 'annotation-xml':
          case 'color-profile':
          case 'font-face':
          case 'font-face-src':
          case 'font-face-uri':
          case 'font-face-format':
          case 'font-face-name':
          case 'missing-glyph':
            return false;

          default:
            return true;
        }
      }

      var possibleStandardNames = {
        accept: 'accept',
        acceptcharset: 'acceptCharset',
        'accept-charset': 'acceptCharset',
        accesskey: 'accessKey',
        action: 'action',
        allowfullscreen: 'allowFullScreen',
        alt: 'alt',
        as: 'as',
        async: 'async',
        autocapitalize: 'autoCapitalize',
        autocomplete: 'autoComplete',
        autocorrect: 'autoCorrect',
        autofocus: 'autoFocus',
        autoplay: 'autoPlay',
        autosave: 'autoSave',
        capture: 'capture',
        cellpadding: 'cellPadding',
        cellspacing: 'cellSpacing',
        challenge: 'challenge',
        charset: 'charSet',
        checked: 'checked',
        children: 'children',
        cite: 'cite',
        "class": 'className',
        classid: 'classID',
        classname: 'className',
        cols: 'cols',
        colspan: 'colSpan',
        content: 'content',
        contenteditable: 'contentEditable',
        contextmenu: 'contextMenu',
        controls: 'controls',
        controlslist: 'controlsList',
        coords: 'coords',
        crossorigin: 'crossOrigin',
        dangerouslysetinnerhtml: 'dangerouslySetInnerHTML',
        data: 'data',
        datetime: 'dateTime',
        "default": 'default',
        defaultchecked: 'defaultChecked',
        defaultvalue: 'defaultValue',
        defer: 'defer',
        dir: 'dir',
        disabled: 'disabled',
        disablepictureinpicture: 'disablePictureInPicture',
        download: 'download',
        draggable: 'draggable',
        enctype: 'encType',
        "for": 'htmlFor',
        form: 'form',
        formmethod: 'formMethod',
        formaction: 'formAction',
        formenctype: 'formEncType',
        formnovalidate: 'formNoValidate',
        formtarget: 'formTarget',
        frameborder: 'frameBorder',
        headers: 'headers',
        height: 'height',
        hidden: 'hidden',
        high: 'high',
        href: 'href',
        hreflang: 'hrefLang',
        htmlfor: 'htmlFor',
        httpequiv: 'httpEquiv',
        'http-equiv': 'httpEquiv',
        icon: 'icon',
        id: 'id',
        innerhtml: 'innerHTML',
        inputmode: 'inputMode',
        integrity: 'integrity',
        is: 'is',
        itemid: 'itemID',
        itemprop: 'itemProp',
        itemref: 'itemRef',
        itemscope: 'itemScope',
        itemtype: 'itemType',
        keyparams: 'keyParams',
        keytype: 'keyType',
        kind: 'kind',
        label: 'label',
        lang: 'lang',
        list: 'list',
        loop: 'loop',
        low: 'low',
        manifest: 'manifest',
        marginwidth: 'marginWidth',
        marginheight: 'marginHeight',
        max: 'max',
        maxlength: 'maxLength',
        media: 'media',
        mediagroup: 'mediaGroup',
        method: 'method',
        min: 'min',
        minlength: 'minLength',
        multiple: 'multiple',
        muted: 'muted',
        name: 'name',
        nomodule: 'noModule',
        nonce: 'nonce',
        novalidate: 'noValidate',
        open: 'open',
        optimum: 'optimum',
        pattern: 'pattern',
        placeholder: 'placeholder',
        playsinline: 'playsInline',
        poster: 'poster',
        preload: 'preload',
        profile: 'profile',
        radiogroup: 'radioGroup',
        readonly: 'readOnly',
        referrerpolicy: 'referrerPolicy',
        rel: 'rel',
        required: 'required',
        reversed: 'reversed',
        role: 'role',
        rows: 'rows',
        rowspan: 'rowSpan',
        sandbox: 'sandbox',
        scope: 'scope',
        scoped: 'scoped',
        scrolling: 'scrolling',
        seamless: 'seamless',
        selected: 'selected',
        shape: 'shape',
        size: 'size',
        sizes: 'sizes',
        span: 'span',
        spellcheck: 'spellCheck',
        src: 'src',
        srcdoc: 'srcDoc',
        srclang: 'srcLang',
        srcset: 'srcSet',
        start: 'start',
        step: 'step',
        style: 'style',
        summary: 'summary',
        tabindex: 'tabIndex',
        target: 'target',
        title: 'title',
        type: 'type',
        usemap: 'useMap',
        value: 'value',
        width: 'width',
        wmode: 'wmode',
        wrap: 'wrap',
        about: 'about',
        accentheight: 'accentHeight',
        'accent-height': 'accentHeight',
        accumulate: 'accumulate',
        additive: 'additive',
        alignmentbaseline: 'alignmentBaseline',
        'alignment-baseline': 'alignmentBaseline',
        allowreorder: 'allowReorder',
        alphabetic: 'alphabetic',
        amplitude: 'amplitude',
        arabicform: 'arabicForm',
        'arabic-form': 'arabicForm',
        ascent: 'ascent',
        attributename: 'attributeName',
        attributetype: 'attributeType',
        autoreverse: 'autoReverse',
        azimuth: 'azimuth',
        basefrequency: 'baseFrequency',
        baselineshift: 'baselineShift',
        'baseline-shift': 'baselineShift',
        baseprofile: 'baseProfile',
        bbox: 'bbox',
        begin: 'begin',
        bias: 'bias',
        by: 'by',
        calcmode: 'calcMode',
        capheight: 'capHeight',
        'cap-height': 'capHeight',
        clip: 'clip',
        clippath: 'clipPath',
        'clip-path': 'clipPath',
        clippathunits: 'clipPathUnits',
        cliprule: 'clipRule',
        'clip-rule': 'clipRule',
        color: 'color',
        colorinterpolation: 'colorInterpolation',
        'color-interpolation': 'colorInterpolation',
        colorinterpolationfilters: 'colorInterpolationFilters',
        'color-interpolation-filters': 'colorInterpolationFilters',
        colorprofile: 'colorProfile',
        'color-profile': 'colorProfile',
        colorrendering: 'colorRendering',
        'color-rendering': 'colorRendering',
        contentscripttype: 'contentScriptType',
        contentstyletype: 'contentStyleType',
        cursor: 'cursor',
        cx: 'cx',
        cy: 'cy',
        d: 'd',
        datatype: 'datatype',
        decelerate: 'decelerate',
        descent: 'descent',
        diffuseconstant: 'diffuseConstant',
        direction: 'direction',
        display: 'display',
        divisor: 'divisor',
        dominantbaseline: 'dominantBaseline',
        'dominant-baseline': 'dominantBaseline',
        dur: 'dur',
        dx: 'dx',
        dy: 'dy',
        edgemode: 'edgeMode',
        elevation: 'elevation',
        enablebackground: 'enableBackground',
        'enable-background': 'enableBackground',
        end: 'end',
        exponent: 'exponent',
        externalresourcesrequired: 'externalResourcesRequired',
        fill: 'fill',
        fillopacity: 'fillOpacity',
        'fill-opacity': 'fillOpacity',
        fillrule: 'fillRule',
        'fill-rule': 'fillRule',
        filter: 'filter',
        filterres: 'filterRes',
        filterunits: 'filterUnits',
        floodopacity: 'floodOpacity',
        'flood-opacity': 'floodOpacity',
        floodcolor: 'floodColor',
        'flood-color': 'floodColor',
        focusable: 'focusable',
        fontfamily: 'fontFamily',
        'font-family': 'fontFamily',
        fontsize: 'fontSize',
        'font-size': 'fontSize',
        fontsizeadjust: 'fontSizeAdjust',
        'font-size-adjust': 'fontSizeAdjust',
        fontstretch: 'fontStretch',
        'font-stretch': 'fontStretch',
        fontstyle: 'fontStyle',
        'font-style': 'fontStyle',
        fontvariant: 'fontVariant',
        'font-variant': 'fontVariant',
        fontweight: 'fontWeight',
        'font-weight': 'fontWeight',
        format: 'format',
        from: 'from',
        fx: 'fx',
        fy: 'fy',
        g1: 'g1',
        g2: 'g2',
        glyphname: 'glyphName',
        'glyph-name': 'glyphName',
        glyphorientationhorizontal: 'glyphOrientationHorizontal',
        'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
        glyphorientationvertical: 'glyphOrientationVertical',
        'glyph-orientation-vertical': 'glyphOrientationVertical',
        glyphref: 'glyphRef',
        gradienttransform: 'gradientTransform',
        gradientunits: 'gradientUnits',
        hanging: 'hanging',
        horizadvx: 'horizAdvX',
        'horiz-adv-x': 'horizAdvX',
        horizoriginx: 'horizOriginX',
        'horiz-origin-x': 'horizOriginX',
        ideographic: 'ideographic',
        imagerendering: 'imageRendering',
        'image-rendering': 'imageRendering',
        in2: 'in2',
        "in": 'in',
        inlist: 'inlist',
        intercept: 'intercept',
        k1: 'k1',
        k2: 'k2',
        k3: 'k3',
        k4: 'k4',
        k: 'k',
        kernelmatrix: 'kernelMatrix',
        kernelunitlength: 'kernelUnitLength',
        kerning: 'kerning',
        keypoints: 'keyPoints',
        keysplines: 'keySplines',
        keytimes: 'keyTimes',
        lengthadjust: 'lengthAdjust',
        letterspacing: 'letterSpacing',
        'letter-spacing': 'letterSpacing',
        lightingcolor: 'lightingColor',
        'lighting-color': 'lightingColor',
        limitingconeangle: 'limitingConeAngle',
        local: 'local',
        markerend: 'markerEnd',
        'marker-end': 'markerEnd',
        markerheight: 'markerHeight',
        markermid: 'markerMid',
        'marker-mid': 'markerMid',
        markerstart: 'markerStart',
        'marker-start': 'markerStart',
        markerunits: 'markerUnits',
        markerwidth: 'markerWidth',
        mask: 'mask',
        maskcontentunits: 'maskContentUnits',
        maskunits: 'maskUnits',
        mathematical: 'mathematical',
        mode: 'mode',
        numoctaves: 'numOctaves',
        offset: 'offset',
        opacity: 'opacity',
        operator: 'operator',
        order: 'order',
        orient: 'orient',
        orientation: 'orientation',
        origin: 'origin',
        overflow: 'overflow',
        overlineposition: 'overlinePosition',
        'overline-position': 'overlinePosition',
        overlinethickness: 'overlineThickness',
        'overline-thickness': 'overlineThickness',
        paintorder: 'paintOrder',
        'paint-order': 'paintOrder',
        panose1: 'panose1',
        'panose-1': 'panose1',
        pathlength: 'pathLength',
        patterncontentunits: 'patternContentUnits',
        patterntransform: 'patternTransform',
        patternunits: 'patternUnits',
        pointerevents: 'pointerEvents',
        'pointer-events': 'pointerEvents',
        points: 'points',
        pointsatx: 'pointsAtX',
        pointsaty: 'pointsAtY',
        pointsatz: 'pointsAtZ',
        prefix: 'prefix',
        preservealpha: 'preserveAlpha',
        preserveaspectratio: 'preserveAspectRatio',
        primitiveunits: 'primitiveUnits',
        property: 'property',
        r: 'r',
        radius: 'radius',
        refx: 'refX',
        refy: 'refY',
        renderingintent: 'renderingIntent',
        'rendering-intent': 'renderingIntent',
        repeatcount: 'repeatCount',
        repeatdur: 'repeatDur',
        requiredextensions: 'requiredExtensions',
        requiredfeatures: 'requiredFeatures',
        resource: 'resource',
        restart: 'restart',
        result: 'result',
        results: 'results',
        rotate: 'rotate',
        rx: 'rx',
        ry: 'ry',
        scale: 'scale',
        security: 'security',
        seed: 'seed',
        shaperendering: 'shapeRendering',
        'shape-rendering': 'shapeRendering',
        slope: 'slope',
        spacing: 'spacing',
        specularconstant: 'specularConstant',
        specularexponent: 'specularExponent',
        speed: 'speed',
        spreadmethod: 'spreadMethod',
        startoffset: 'startOffset',
        stddeviation: 'stdDeviation',
        stemh: 'stemh',
        stemv: 'stemv',
        stitchtiles: 'stitchTiles',
        stopcolor: 'stopColor',
        'stop-color': 'stopColor',
        stopopacity: 'stopOpacity',
        'stop-opacity': 'stopOpacity',
        strikethroughposition: 'strikethroughPosition',
        'strikethrough-position': 'strikethroughPosition',
        strikethroughthickness: 'strikethroughThickness',
        'strikethrough-thickness': 'strikethroughThickness',
        string: 'string',
        stroke: 'stroke',
        strokedasharray: 'strokeDasharray',
        'stroke-dasharray': 'strokeDasharray',
        strokedashoffset: 'strokeDashoffset',
        'stroke-dashoffset': 'strokeDashoffset',
        strokelinecap: 'strokeLinecap',
        'stroke-linecap': 'strokeLinecap',
        strokelinejoin: 'strokeLinejoin',
        'stroke-linejoin': 'strokeLinejoin',
        strokemiterlimit: 'strokeMiterlimit',
        'stroke-miterlimit': 'strokeMiterlimit',
        strokewidth: 'strokeWidth',
        'stroke-width': 'strokeWidth',
        strokeopacity: 'strokeOpacity',
        'stroke-opacity': 'strokeOpacity',
        suppresscontenteditablewarning: 'suppressContentEditableWarning',
        suppresshydrationwarning: 'suppressHydrationWarning',
        surfacescale: 'surfaceScale',
        systemlanguage: 'systemLanguage',
        tablevalues: 'tableValues',
        targetx: 'targetX',
        targety: 'targetY',
        textanchor: 'textAnchor',
        'text-anchor': 'textAnchor',
        textdecoration: 'textDecoration',
        'text-decoration': 'textDecoration',
        textlength: 'textLength',
        textrendering: 'textRendering',
        'text-rendering': 'textRendering',
        to: 'to',
        transform: 'transform',
        "typeof": 'typeof',
        u1: 'u1',
        u2: 'u2',
        underlineposition: 'underlinePosition',
        'underline-position': 'underlinePosition',
        underlinethickness: 'underlineThickness',
        'underline-thickness': 'underlineThickness',
        unicode: 'unicode',
        unicodebidi: 'unicodeBidi',
        'unicode-bidi': 'unicodeBidi',
        unicoderange: 'unicodeRange',
        'unicode-range': 'unicodeRange',
        unitsperem: 'unitsPerEm',
        'units-per-em': 'unitsPerEm',
        unselectable: 'unselectable',
        valphabetic: 'vAlphabetic',
        'v-alphabetic': 'vAlphabetic',
        values: 'values',
        vectoreffect: 'vectorEffect',
        'vector-effect': 'vectorEffect',
        version: 'version',
        vertadvy: 'vertAdvY',
        'vert-adv-y': 'vertAdvY',
        vertoriginx: 'vertOriginX',
        'vert-origin-x': 'vertOriginX',
        vertoriginy: 'vertOriginY',
        'vert-origin-y': 'vertOriginY',
        vhanging: 'vHanging',
        'v-hanging': 'vHanging',
        videographic: 'vIdeographic',
        'v-ideographic': 'vIdeographic',
        viewbox: 'viewBox',
        viewtarget: 'viewTarget',
        visibility: 'visibility',
        vmathematical: 'vMathematical',
        'v-mathematical': 'vMathematical',
        vocab: 'vocab',
        widths: 'widths',
        wordspacing: 'wordSpacing',
        'word-spacing': 'wordSpacing',
        writingmode: 'writingMode',
        'writing-mode': 'writingMode',
        x1: 'x1',
        x2: 'x2',
        x: 'x',
        xchannelselector: 'xChannelSelector',
        xheight: 'xHeight',
        'x-height': 'xHeight',
        xlinkactuate: 'xlinkActuate',
        'xlink:actuate': 'xlinkActuate',
        xlinkarcrole: 'xlinkArcrole',
        'xlink:arcrole': 'xlinkArcrole',
        xlinkhref: 'xlinkHref',
        'xlink:href': 'xlinkHref',
        xlinkrole: 'xlinkRole',
        'xlink:role': 'xlinkRole',
        xlinkshow: 'xlinkShow',
        'xlink:show': 'xlinkShow',
        xlinktitle: 'xlinkTitle',
        'xlink:title': 'xlinkTitle',
        xlinktype: 'xlinkType',
        'xlink:type': 'xlinkType',
        xmlbase: 'xmlBase',
        'xml:base': 'xmlBase',
        xmllang: 'xmlLang',
        'xml:lang': 'xmlLang',
        xmlns: 'xmlns',
        'xml:space': 'xmlSpace',
        xmlnsxlink: 'xmlnsXlink',
        'xmlns:xlink': 'xmlnsXlink',
        xmlspace: 'xmlSpace',
        y1: 'y1',
        y2: 'y2',
        y: 'y',
        ychannelselector: 'yChannelSelector',
        z: 'z',
        zoomandpan: 'zoomAndPan'
      };
      var ariaProperties = {
        'aria-current': 0,
        'aria-details': 0,
        'aria-disabled': 0,
        'aria-hidden': 0,
        'aria-invalid': 0,
        'aria-keyshortcuts': 0,
        'aria-label': 0,
        'aria-roledescription': 0,
        'aria-autocomplete': 0,
        'aria-checked': 0,
        'aria-expanded': 0,
        'aria-haspopup': 0,
        'aria-level': 0,
        'aria-modal': 0,
        'aria-multiline': 0,
        'aria-multiselectable': 0,
        'aria-orientation': 0,
        'aria-placeholder': 0,
        'aria-pressed': 0,
        'aria-readonly': 0,
        'aria-required': 0,
        'aria-selected': 0,
        'aria-sort': 0,
        'aria-valuemax': 0,
        'aria-valuemin': 0,
        'aria-valuenow': 0,
        'aria-valuetext': 0,
        'aria-atomic': 0,
        'aria-busy': 0,
        'aria-live': 0,
        'aria-relevant': 0,
        'aria-dropeffect': 0,
        'aria-grabbed': 0,
        'aria-activedescendant': 0,
        'aria-colcount': 0,
        'aria-colindex': 0,
        'aria-colspan': 0,
        'aria-controls': 0,
        'aria-describedby': 0,
        'aria-errormessage': 0,
        'aria-flowto': 0,
        'aria-labelledby': 0,
        'aria-owns': 0,
        'aria-posinset': 0,
        'aria-rowcount': 0,
        'aria-rowindex': 0,
        'aria-rowspan': 0,
        'aria-setsize': 0
      };
      var warnedProperties = {};
      var rARIA = new RegExp('^(aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$');
      var rARIACamel = new RegExp('^(aria)[A-Z][' + ATTRIBUTE_NAME_CHAR + ']*$');
      var hasOwnProperty$1 = Object.prototype.hasOwnProperty;

      function validateProperty(tagName, name) {
        {
          if (hasOwnProperty$1.call(warnedProperties, name) && warnedProperties[name]) {
            return true;
          }

          if (rARIACamel.test(name)) {
            var ariaName = 'aria-' + name.slice(4).toLowerCase();
            var correctName = ariaProperties.hasOwnProperty(ariaName) ? ariaName : null;

            if (correctName == null) {
              error('Invalid ARIA attribute `%s`. ARIA attributes follow the pattern aria-* and must be lowercase.', name);
              warnedProperties[name] = true;
              return true;
            }

            if (name !== correctName) {
              error('Invalid ARIA attribute `%s`. Did you mean `%s`?', name, correctName);
              warnedProperties[name] = true;
              return true;
            }
          }

          if (rARIA.test(name)) {
            var lowerCasedName = name.toLowerCase();
            var standardName = ariaProperties.hasOwnProperty(lowerCasedName) ? lowerCasedName : null;

            if (standardName == null) {
              warnedProperties[name] = true;
              return false;
            }

            if (name !== standardName) {
              error('Unknown ARIA attribute `%s`. Did you mean `%s`?', name, standardName);
              warnedProperties[name] = true;
              return true;
            }
          }
        }
        return true;
      }

      function warnInvalidARIAProps(type, props) {
        {
          var invalidProps = [];

          for (var key in props) {
            var isValid = validateProperty(type, key);

            if (!isValid) {
              invalidProps.push(key);
            }
          }

          var unknownPropString = invalidProps.map(function (prop) {
            return '`' + prop + '`';
          }).join(', ');

          if (invalidProps.length === 1) {
            error('Invalid aria prop %s on <%s> tag. ' + 'For details, see https://fb.me/invalid-aria-prop', unknownPropString, type);
          } else if (invalidProps.length > 1) {
            error('Invalid aria props %s on <%s> tag. ' + 'For details, see https://fb.me/invalid-aria-prop', unknownPropString, type);
          }
        }
      }

      function validateProperties(type, props) {
        if (isCustomComponent(type, props)) {
          return;
        }

        warnInvalidARIAProps(type, props);
      }

      var didWarnValueNull = false;

      function validateProperties$1(type, props) {
        {
          if (type !== 'input' && type !== 'textarea' && type !== 'select') {
            return;
          }

          if (props != null && props.value === null && !didWarnValueNull) {
            didWarnValueNull = true;

            if (type === 'select' && props.multiple) {
              error('`value` prop on `%s` should not be null. ' + 'Consider using an empty array when `multiple` is set to `true` ' + 'to clear the component or `undefined` for uncontrolled components.', type);
            } else {
              error('`value` prop on `%s` should not be null. ' + 'Consider using an empty string to clear the component or `undefined` ' + 'for uncontrolled components.', type);
            }
          }
        }
      }

      var validateProperty$1 = function validateProperty$1() {};

      {
        var warnedProperties$1 = {};
        var _hasOwnProperty = Object.prototype.hasOwnProperty;
        var EVENT_NAME_REGEX = /^on./;
        var INVALID_EVENT_NAME_REGEX = /^on[^A-Z]/;
        var rARIA$1 = new RegExp('^(aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$');
        var rARIACamel$1 = new RegExp('^(aria)[A-Z][' + ATTRIBUTE_NAME_CHAR + ']*$');

        validateProperty$1 = function validateProperty$1(tagName, name, value, canUseEventSystem) {
          if (_hasOwnProperty.call(warnedProperties$1, name) && warnedProperties$1[name]) {
            return true;
          }

          var lowerCasedName = name.toLowerCase();

          if (lowerCasedName === 'onfocusin' || lowerCasedName === 'onfocusout') {
            error('React uses onFocus and onBlur instead of onFocusIn and onFocusOut. ' + 'All React events are normalized to bubble, so onFocusIn and onFocusOut ' + 'are not needed/supported by React.');
            warnedProperties$1[name] = true;
            return true;
          }

          if (canUseEventSystem) {
            if (registrationNameModules.hasOwnProperty(name)) {
              return true;
            }

            var registrationName = possibleRegistrationNames.hasOwnProperty(lowerCasedName) ? possibleRegistrationNames[lowerCasedName] : null;

            if (registrationName != null) {
              error('Invalid event handler property `%s`. Did you mean `%s`?', name, registrationName);
              warnedProperties$1[name] = true;
              return true;
            }

            if (EVENT_NAME_REGEX.test(name)) {
              error('Unknown event handler property `%s`. It will be ignored.', name);
              warnedProperties$1[name] = true;
              return true;
            }
          } else if (EVENT_NAME_REGEX.test(name)) {
            if (INVALID_EVENT_NAME_REGEX.test(name)) {
              error('Invalid event handler property `%s`. ' + 'React events use the camelCase naming convention, for example `onClick`.', name);
            }

            warnedProperties$1[name] = true;
            return true;
          }

          if (rARIA$1.test(name) || rARIACamel$1.test(name)) {
            return true;
          }

          if (lowerCasedName === 'innerhtml') {
            error('Directly setting property `innerHTML` is not permitted. ' + 'For more information, lookup documentation on `dangerouslySetInnerHTML`.');
            warnedProperties$1[name] = true;
            return true;
          }

          if (lowerCasedName === 'aria') {
            error('The `aria` attribute is reserved for future use in React. ' + 'Pass individual `aria-` attributes instead.');
            warnedProperties$1[name] = true;
            return true;
          }

          if (lowerCasedName === 'is' && value !== null && value !== undefined && typeof value !== 'string') {
            error('Received a `%s` for a string attribute `is`. If this is expected, cast ' + 'the value to a string.', typeof value);
            warnedProperties$1[name] = true;
            return true;
          }

          if (typeof value === 'number' && isNaN(value)) {
            error('Received NaN for the `%s` attribute. If this is expected, cast ' + 'the value to a string.', name);
            warnedProperties$1[name] = true;
            return true;
          }

          var propertyInfo = getPropertyInfo(name);
          var isReserved = propertyInfo !== null && propertyInfo.type === RESERVED;

          if (possibleStandardNames.hasOwnProperty(lowerCasedName)) {
            var standardName = possibleStandardNames[lowerCasedName];

            if (standardName !== name) {
              error('Invalid DOM property `%s`. Did you mean `%s`?', name, standardName);
              warnedProperties$1[name] = true;
              return true;
            }
          } else if (!isReserved && name !== lowerCasedName) {
            error('React does not recognize the `%s` prop on a DOM element. If you ' + 'intentionally want it to appear in the DOM as a custom ' + 'attribute, spell it as lowercase `%s` instead. ' + 'If you accidentally passed it from a parent component, remove ' + 'it from the DOM element.', name, lowerCasedName);
            warnedProperties$1[name] = true;
            return true;
          }

          if (typeof value === 'boolean' && shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)) {
            if (value) {
              error('Received `%s` for a non-boolean attribute `%s`.\n\n' + 'If you want to write it to the DOM, pass a string instead: ' + '%s="%s" or %s={value.toString()}.', value, name, name, value, name);
            } else {
              error('Received `%s` for a non-boolean attribute `%s`.\n\n' + 'If you want to write it to the DOM, pass a string instead: ' + '%s="%s" or %s={value.toString()}.\n\n' + 'If you used to conditionally omit it with %s={condition && value}, ' + 'pass %s={condition ? value : undefined} instead.', value, name, name, value, name, name, name);
            }

            warnedProperties$1[name] = true;
            return true;
          }

          if (isReserved) {
            return true;
          }

          if (shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)) {
            warnedProperties$1[name] = true;
            return false;
          }

          if ((value === 'false' || value === 'true') && propertyInfo !== null && propertyInfo.type === BOOLEAN) {
            error('Received the string `%s` for the boolean attribute `%s`. ' + '%s ' + 'Did you mean %s={%s}?', value, name, value === 'false' ? 'The browser will interpret it as a truthy value.' : 'Although this works, it will not work as expected if you pass the string "false".', name, value);
            warnedProperties$1[name] = true;
            return true;
          }

          return true;
        };
      }

      var warnUnknownProperties = function warnUnknownProperties(type, props, canUseEventSystem) {
        {
          var unknownProps = [];

          for (var key in props) {
            var isValid = validateProperty$1(type, key, props[key], canUseEventSystem);

            if (!isValid) {
              unknownProps.push(key);
            }
          }

          var unknownPropString = unknownProps.map(function (prop) {
            return '`' + prop + '`';
          }).join(', ');

          if (unknownProps.length === 1) {
            error('Invalid value for prop %s on <%s> tag. Either remove it from the element, ' + 'or pass a string or number value to keep it in the DOM. ' + 'For details, see https://fb.me/react-attribute-behavior', unknownPropString, type);
          } else if (unknownProps.length > 1) {
            error('Invalid values for props %s on <%s> tag. Either remove them from the element, ' + 'or pass a string or number value to keep them in the DOM. ' + 'For details, see https://fb.me/react-attribute-behavior', unknownPropString, type);
          }
        }
      };

      function validateProperties$2(type, props, canUseEventSystem) {
        if (isCustomComponent(type, props)) {
          return;
        }

        warnUnknownProperties(type, props, canUseEventSystem);
      }

      var didWarnInvalidHydration = false;
      var DANGEROUSLY_SET_INNER_HTML = 'dangerouslySetInnerHTML';
      var SUPPRESS_CONTENT_EDITABLE_WARNING = 'suppressContentEditableWarning';
      var SUPPRESS_HYDRATION_WARNING = 'suppressHydrationWarning';
      var AUTOFOCUS = 'autoFocus';
      var CHILDREN = 'children';
      var STYLE = 'style';
      var HTML$1 = '__html';
      var HTML_NAMESPACE$1 = Namespaces.html;
      var warnedUnknownTags;
      var suppressHydrationWarning;
      var validatePropertiesInDevelopment;
      var warnForTextDifference;
      var warnForPropDifference;
      var warnForExtraAttributes;
      var warnForInvalidEventListener;
      var canDiffStyleForHydrationWarning;
      var normalizeMarkupForTextOrAttribute;
      var normalizeHTML;
      {
        warnedUnknownTags = {
          time: true,
          dialog: true,
          webview: true
        };

        validatePropertiesInDevelopment = function validatePropertiesInDevelopment(type, props) {
          validateProperties(type, props);
          validateProperties$1(type, props);
          validateProperties$2(type, props, true);
        };

        canDiffStyleForHydrationWarning = canUseDOM && !document.documentMode;
        var NORMALIZE_NEWLINES_REGEX = /\r\n?/g;
        var NORMALIZE_NULL_AND_REPLACEMENT_REGEX = /\u0000|\uFFFD/g;

        normalizeMarkupForTextOrAttribute = function normalizeMarkupForTextOrAttribute(markup) {
          var markupString = typeof markup === 'string' ? markup : '' + markup;
          return markupString.replace(NORMALIZE_NEWLINES_REGEX, '\n').replace(NORMALIZE_NULL_AND_REPLACEMENT_REGEX, '');
        };

        warnForTextDifference = function warnForTextDifference(serverText, clientText) {
          if (didWarnInvalidHydration) {
            return;
          }

          var normalizedClientText = normalizeMarkupForTextOrAttribute(clientText);
          var normalizedServerText = normalizeMarkupForTextOrAttribute(serverText);

          if (normalizedServerText === normalizedClientText) {
            return;
          }

          didWarnInvalidHydration = true;
          error('Text content did not match. Server: "%s" Client: "%s"', normalizedServerText, normalizedClientText);
        };

        warnForPropDifference = function warnForPropDifference(propName, serverValue, clientValue) {
          if (didWarnInvalidHydration) {
            return;
          }

          var normalizedClientValue = normalizeMarkupForTextOrAttribute(clientValue);
          var normalizedServerValue = normalizeMarkupForTextOrAttribute(serverValue);

          if (normalizedServerValue === normalizedClientValue) {
            return;
          }

          didWarnInvalidHydration = true;
          error('Prop `%s` did not match. Server: %s Client: %s', propName, JSON.stringify(normalizedServerValue), JSON.stringify(normalizedClientValue));
        };

        warnForExtraAttributes = function warnForExtraAttributes(attributeNames) {
          if (didWarnInvalidHydration) {
            return;
          }

          didWarnInvalidHydration = true;
          var names = [];
          attributeNames.forEach(function (name) {
            names.push(name);
          });
          error('Extra attributes from the server: %s', names);
        };

        warnForInvalidEventListener = function warnForInvalidEventListener(registrationName, listener) {
          if (listener === false) {
            error('Expected `%s` listener to be a function, instead got `false`.\n\n' + 'If you used to conditionally omit it with %s={condition && value}, ' + 'pass %s={condition ? value : undefined} instead.', registrationName, registrationName, registrationName);
          } else {
            error('Expected `%s` listener to be a function, instead got a value of `%s` type.', registrationName, typeof listener);
          }
        };

        normalizeHTML = function normalizeHTML(parent, html) {
          var testElement = parent.namespaceURI === HTML_NAMESPACE$1 ? parent.ownerDocument.createElement(parent.tagName) : parent.ownerDocument.createElementNS(parent.namespaceURI, parent.tagName);
          testElement.innerHTML = html;
          return testElement.innerHTML;
        };
      }

      function ensureListeningTo(rootContainerElement, registrationName) {
        var isDocumentOrFragment = rootContainerElement.nodeType === DOCUMENT_NODE || rootContainerElement.nodeType === DOCUMENT_FRAGMENT_NODE;
        var doc = isDocumentOrFragment ? rootContainerElement : rootContainerElement.ownerDocument;
        legacyListenToEvent(registrationName, doc);
      }

      function getOwnerDocumentFromRootContainer(rootContainerElement) {
        return rootContainerElement.nodeType === DOCUMENT_NODE ? rootContainerElement : rootContainerElement.ownerDocument;
      }

      function noop() {}

      function trapClickOnNonInteractiveElement(node) {
        node.onclick = noop;
      }

      function setInitialDOMProperties(tag, domElement, rootContainerElement, nextProps, isCustomComponentTag) {
        for (var propKey in nextProps) {
          if (!nextProps.hasOwnProperty(propKey)) {
            continue;
          }

          var nextProp = nextProps[propKey];

          if (propKey === STYLE) {
            {
              if (nextProp) {
                Object.freeze(nextProp);
              }
            }
            setValueForStyles(domElement, nextProp);
          } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
            var nextHtml = nextProp ? nextProp[HTML$1] : undefined;

            if (nextHtml != null) {
              setInnerHTML(domElement, nextHtml);
            }
          } else if (propKey === CHILDREN) {
            if (typeof nextProp === 'string') {
              var canSetTextContent = tag !== 'textarea' || nextProp !== '';

              if (canSetTextContent) {
                setTextContent(domElement, nextProp);
              }
            } else if (typeof nextProp === 'number') {
              setTextContent(domElement, '' + nextProp);
            }
          } else if (propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING) ;else if (propKey === AUTOFOCUS) ;else if (registrationNameModules.hasOwnProperty(propKey)) {
            if (nextProp != null) {
              if (typeof nextProp !== 'function') {
                warnForInvalidEventListener(propKey, nextProp);
              }

              ensureListeningTo(rootContainerElement, propKey);
            }
          } else if (nextProp != null) {
            setValueForProperty(domElement, propKey, nextProp, isCustomComponentTag);
          }
        }
      }

      function updateDOMProperties(domElement, updatePayload, wasCustomComponentTag, isCustomComponentTag) {
        for (var i = 0; i < updatePayload.length; i += 2) {
          var propKey = updatePayload[i];
          var propValue = updatePayload[i + 1];

          if (propKey === STYLE) {
            setValueForStyles(domElement, propValue);
          } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
            setInnerHTML(domElement, propValue);
          } else if (propKey === CHILDREN) {
            setTextContent(domElement, propValue);
          } else {
            setValueForProperty(domElement, propKey, propValue, isCustomComponentTag);
          }
        }
      }

      function createElement(type, props, rootContainerElement, parentNamespace) {
        var isCustomComponentTag;
        var ownerDocument = getOwnerDocumentFromRootContainer(rootContainerElement);
        var domElement;
        var namespaceURI = parentNamespace;

        if (namespaceURI === HTML_NAMESPACE$1) {
          namespaceURI = getIntrinsicNamespace(type);
        }

        if (namespaceURI === HTML_NAMESPACE$1) {
          {
            isCustomComponentTag = isCustomComponent(type, props);

            if (!isCustomComponentTag && type !== type.toLowerCase()) {
              error('<%s /> is using incorrect casing. ' + 'Use PascalCase for React components, ' + 'or lowercase for HTML elements.', type);
            }
          }

          if (type === 'script') {
            var div = ownerDocument.createElement('div');
            div.innerHTML = '<script><' + '/script>';
            var firstChild = div.firstChild;
            domElement = div.removeChild(firstChild);
          } else if (typeof props.is === 'string') {
            domElement = ownerDocument.createElement(type, {
              is: props.is
            });
          } else {
            domElement = ownerDocument.createElement(type);

            if (type === 'select') {
              var node = domElement;

              if (props.multiple) {
                node.multiple = true;
              } else if (props.size) {
                node.size = props.size;
              }
            }
          }
        } else {
          domElement = ownerDocument.createElementNS(namespaceURI, type);
        }

        {
          if (namespaceURI === HTML_NAMESPACE$1) {
            if (!isCustomComponentTag && Object.prototype.toString.call(domElement) === '[object HTMLUnknownElement]' && !Object.prototype.hasOwnProperty.call(warnedUnknownTags, type)) {
              warnedUnknownTags[type] = true;
              error('The tag <%s> is unrecognized in this browser. ' + 'If you meant to render a React component, start its name with ' + 'an uppercase letter.', type);
            }
          }
        }
        return domElement;
      }

      function createTextNode(text, rootContainerElement) {
        return getOwnerDocumentFromRootContainer(rootContainerElement).createTextNode(text);
      }

      function setInitialProperties(domElement, tag, rawProps, rootContainerElement) {
        var isCustomComponentTag = isCustomComponent(tag, rawProps);
        {
          validatePropertiesInDevelopment(tag, rawProps);
        }
        var props;

        switch (tag) {
          case 'iframe':
          case 'object':
          case 'embed':
            trapBubbledEvent(TOP_LOAD, domElement);
            props = rawProps;
            break;

          case 'video':
          case 'audio':
            for (var i = 0; i < mediaEventTypes.length; i++) {
              trapBubbledEvent(mediaEventTypes[i], domElement);
            }

            props = rawProps;
            break;

          case 'source':
            trapBubbledEvent(TOP_ERROR, domElement);
            props = rawProps;
            break;

          case 'img':
          case 'image':
          case 'link':
            trapBubbledEvent(TOP_ERROR, domElement);
            trapBubbledEvent(TOP_LOAD, domElement);
            props = rawProps;
            break;

          case 'form':
            trapBubbledEvent(TOP_RESET, domElement);
            trapBubbledEvent(TOP_SUBMIT, domElement);
            props = rawProps;
            break;

          case 'details':
            trapBubbledEvent(TOP_TOGGLE, domElement);
            props = rawProps;
            break;

          case 'input':
            initWrapperState(domElement, rawProps);
            props = getHostProps(domElement, rawProps);
            trapBubbledEvent(TOP_INVALID, domElement);
            ensureListeningTo(rootContainerElement, 'onChange');
            break;

          case 'option':
            validateProps(domElement, rawProps);
            props = getHostProps$1(domElement, rawProps);
            break;

          case 'select':
            initWrapperState$1(domElement, rawProps);
            props = getHostProps$2(domElement, rawProps);
            trapBubbledEvent(TOP_INVALID, domElement);
            ensureListeningTo(rootContainerElement, 'onChange');
            break;

          case 'textarea':
            initWrapperState$2(domElement, rawProps);
            props = getHostProps$3(domElement, rawProps);
            trapBubbledEvent(TOP_INVALID, domElement);
            ensureListeningTo(rootContainerElement, 'onChange');
            break;

          default:
            props = rawProps;
        }

        assertValidProps(tag, props);
        setInitialDOMProperties(tag, domElement, rootContainerElement, props, isCustomComponentTag);

        switch (tag) {
          case 'input':
            track(domElement);
            postMountWrapper(domElement, rawProps, false);
            break;

          case 'textarea':
            track(domElement);
            postMountWrapper$3(domElement);
            break;

          case 'option':
            postMountWrapper$1(domElement, rawProps);
            break;

          case 'select':
            postMountWrapper$2(domElement, rawProps);
            break;

          default:
            if (typeof props.onClick === 'function') {
              trapClickOnNonInteractiveElement(domElement);
            }

            break;
        }
      }

      function diffProperties(domElement, tag, lastRawProps, nextRawProps, rootContainerElement) {
        {
          validatePropertiesInDevelopment(tag, nextRawProps);
        }
        var updatePayload = null;
        var lastProps;
        var nextProps;

        switch (tag) {
          case 'input':
            lastProps = getHostProps(domElement, lastRawProps);
            nextProps = getHostProps(domElement, nextRawProps);
            updatePayload = [];
            break;

          case 'option':
            lastProps = getHostProps$1(domElement, lastRawProps);
            nextProps = getHostProps$1(domElement, nextRawProps);
            updatePayload = [];
            break;

          case 'select':
            lastProps = getHostProps$2(domElement, lastRawProps);
            nextProps = getHostProps$2(domElement, nextRawProps);
            updatePayload = [];
            break;

          case 'textarea':
            lastProps = getHostProps$3(domElement, lastRawProps);
            nextProps = getHostProps$3(domElement, nextRawProps);
            updatePayload = [];
            break;

          default:
            lastProps = lastRawProps;
            nextProps = nextRawProps;

            if (typeof lastProps.onClick !== 'function' && typeof nextProps.onClick === 'function') {
              trapClickOnNonInteractiveElement(domElement);
            }

            break;
        }

        assertValidProps(tag, nextProps);
        var propKey;
        var styleName;
        var styleUpdates = null;

        for (propKey in lastProps) {
          if (nextProps.hasOwnProperty(propKey) || !lastProps.hasOwnProperty(propKey) || lastProps[propKey] == null) {
            continue;
          }

          if (propKey === STYLE) {
            var lastStyle = lastProps[propKey];

            for (styleName in lastStyle) {
              if (lastStyle.hasOwnProperty(styleName)) {
                if (!styleUpdates) {
                  styleUpdates = {};
                }

                styleUpdates[styleName] = '';
              }
            }
          } else if (propKey === DANGEROUSLY_SET_INNER_HTML || propKey === CHILDREN) ;else if (propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING) ;else if (propKey === AUTOFOCUS) ;else if (registrationNameModules.hasOwnProperty(propKey)) {
            if (!updatePayload) {
              updatePayload = [];
            }
          } else {
            (updatePayload = updatePayload || []).push(propKey, null);
          }
        }

        for (propKey in nextProps) {
          var nextProp = nextProps[propKey];
          var lastProp = lastProps != null ? lastProps[propKey] : undefined;

          if (!nextProps.hasOwnProperty(propKey) || nextProp === lastProp || nextProp == null && lastProp == null) {
            continue;
          }

          if (propKey === STYLE) {
            {
              if (nextProp) {
                Object.freeze(nextProp);
              }
            }

            if (lastProp) {
              for (styleName in lastProp) {
                if (lastProp.hasOwnProperty(styleName) && (!nextProp || !nextProp.hasOwnProperty(styleName))) {
                  if (!styleUpdates) {
                    styleUpdates = {};
                  }

                  styleUpdates[styleName] = '';
                }
              }

              for (styleName in nextProp) {
                if (nextProp.hasOwnProperty(styleName) && lastProp[styleName] !== nextProp[styleName]) {
                  if (!styleUpdates) {
                    styleUpdates = {};
                  }

                  styleUpdates[styleName] = nextProp[styleName];
                }
              }
            } else {
              if (!styleUpdates) {
                if (!updatePayload) {
                  updatePayload = [];
                }

                updatePayload.push(propKey, styleUpdates);
              }

              styleUpdates = nextProp;
            }
          } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
            var nextHtml = nextProp ? nextProp[HTML$1] : undefined;
            var lastHtml = lastProp ? lastProp[HTML$1] : undefined;

            if (nextHtml != null) {
              if (lastHtml !== nextHtml) {
                (updatePayload = updatePayload || []).push(propKey, nextHtml);
              }
            }
          } else if (propKey === CHILDREN) {
            if (lastProp !== nextProp && (typeof nextProp === 'string' || typeof nextProp === 'number')) {
              (updatePayload = updatePayload || []).push(propKey, '' + nextProp);
            }
          } else if (propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING) ;else if (registrationNameModules.hasOwnProperty(propKey)) {
            if (nextProp != null) {
              if (typeof nextProp !== 'function') {
                warnForInvalidEventListener(propKey, nextProp);
              }

              ensureListeningTo(rootContainerElement, propKey);
            }

            if (!updatePayload && lastProp !== nextProp) {
              updatePayload = [];
            }
          } else {
            (updatePayload = updatePayload || []).push(propKey, nextProp);
          }
        }

        if (styleUpdates) {
          {
            validateShorthandPropertyCollisionInDev(styleUpdates, nextProps[STYLE]);
          }
          (updatePayload = updatePayload || []).push(STYLE, styleUpdates);
        }

        return updatePayload;
      }

      function updateProperties(domElement, updatePayload, tag, lastRawProps, nextRawProps) {
        if (tag === 'input' && nextRawProps.type === 'radio' && nextRawProps.name != null) {
          updateChecked(domElement, nextRawProps);
        }

        var wasCustomComponentTag = isCustomComponent(tag, lastRawProps);
        var isCustomComponentTag = isCustomComponent(tag, nextRawProps);
        updateDOMProperties(domElement, updatePayload, wasCustomComponentTag, isCustomComponentTag);

        switch (tag) {
          case 'input':
            updateWrapper(domElement, nextRawProps);
            break;

          case 'textarea':
            updateWrapper$1(domElement, nextRawProps);
            break;

          case 'select':
            postUpdateWrapper(domElement, nextRawProps);
            break;
        }
      }

      function getPossibleStandardName(propName) {
        {
          var lowerCasedName = propName.toLowerCase();

          if (!possibleStandardNames.hasOwnProperty(lowerCasedName)) {
            return null;
          }

          return possibleStandardNames[lowerCasedName] || null;
        }
      }

      function diffHydratedProperties(domElement, tag, rawProps, parentNamespace, rootContainerElement) {
        var isCustomComponentTag;
        var extraAttributeNames;
        {
          suppressHydrationWarning = rawProps[SUPPRESS_HYDRATION_WARNING] === true;
          isCustomComponentTag = isCustomComponent(tag, rawProps);
          validatePropertiesInDevelopment(tag, rawProps);
        }

        switch (tag) {
          case 'iframe':
          case 'object':
          case 'embed':
            trapBubbledEvent(TOP_LOAD, domElement);
            break;

          case 'video':
          case 'audio':
            for (var i = 0; i < mediaEventTypes.length; i++) {
              trapBubbledEvent(mediaEventTypes[i], domElement);
            }

            break;

          case 'source':
            trapBubbledEvent(TOP_ERROR, domElement);
            break;

          case 'img':
          case 'image':
          case 'link':
            trapBubbledEvent(TOP_ERROR, domElement);
            trapBubbledEvent(TOP_LOAD, domElement);
            break;

          case 'form':
            trapBubbledEvent(TOP_RESET, domElement);
            trapBubbledEvent(TOP_SUBMIT, domElement);
            break;

          case 'details':
            trapBubbledEvent(TOP_TOGGLE, domElement);
            break;

          case 'input':
            initWrapperState(domElement, rawProps);
            trapBubbledEvent(TOP_INVALID, domElement);
            ensureListeningTo(rootContainerElement, 'onChange');
            break;

          case 'option':
            validateProps(domElement, rawProps);
            break;

          case 'select':
            initWrapperState$1(domElement, rawProps);
            trapBubbledEvent(TOP_INVALID, domElement);
            ensureListeningTo(rootContainerElement, 'onChange');
            break;

          case 'textarea':
            initWrapperState$2(domElement, rawProps);
            trapBubbledEvent(TOP_INVALID, domElement);
            ensureListeningTo(rootContainerElement, 'onChange');
            break;
        }

        assertValidProps(tag, rawProps);
        {
          extraAttributeNames = new Set();
          var attributes = domElement.attributes;

          for (var _i = 0; _i < attributes.length; _i++) {
            var name = attributes[_i].name.toLowerCase();

            switch (name) {
              case 'data-reactroot':
                break;

              case 'value':
                break;

              case 'checked':
                break;

              case 'selected':
                break;

              default:
                extraAttributeNames.add(attributes[_i].name);
            }
          }
        }
        var updatePayload = null;

        for (var propKey in rawProps) {
          if (!rawProps.hasOwnProperty(propKey)) {
            continue;
          }

          var nextProp = rawProps[propKey];

          if (propKey === CHILDREN) {
            if (typeof nextProp === 'string') {
              if (domElement.textContent !== nextProp) {
                if (!suppressHydrationWarning) {
                  warnForTextDifference(domElement.textContent, nextProp);
                }

                updatePayload = [CHILDREN, nextProp];
              }
            } else if (typeof nextProp === 'number') {
              if (domElement.textContent !== '' + nextProp) {
                if (!suppressHydrationWarning) {
                  warnForTextDifference(domElement.textContent, nextProp);
                }

                updatePayload = [CHILDREN, '' + nextProp];
              }
            }
          } else if (registrationNameModules.hasOwnProperty(propKey)) {
            if (nextProp != null) {
              if (typeof nextProp !== 'function') {
                warnForInvalidEventListener(propKey, nextProp);
              }

              ensureListeningTo(rootContainerElement, propKey);
            }
          } else if (typeof isCustomComponentTag === 'boolean') {
            var serverValue = void 0;
            var propertyInfo = getPropertyInfo(propKey);
            if (suppressHydrationWarning) ;else if (propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING || propKey === 'value' || propKey === 'checked' || propKey === 'selected') ;else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
              var serverHTML = domElement.innerHTML;
              var nextHtml = nextProp ? nextProp[HTML$1] : undefined;
              var expectedHTML = normalizeHTML(domElement, nextHtml != null ? nextHtml : '');

              if (expectedHTML !== serverHTML) {
                warnForPropDifference(propKey, serverHTML, expectedHTML);
              }
            } else if (propKey === STYLE) {
              extraAttributeNames["delete"](propKey);

              if (canDiffStyleForHydrationWarning) {
                var expectedStyle = createDangerousStringForStyles(nextProp);
                serverValue = domElement.getAttribute('style');

                if (expectedStyle !== serverValue) {
                  warnForPropDifference(propKey, serverValue, expectedStyle);
                }
              }
            } else if (isCustomComponentTag) {
              extraAttributeNames["delete"](propKey.toLowerCase());
              serverValue = getValueForAttribute(domElement, propKey, nextProp);

              if (nextProp !== serverValue) {
                warnForPropDifference(propKey, serverValue, nextProp);
              }
            } else if (!shouldIgnoreAttribute(propKey, propertyInfo, isCustomComponentTag) && !shouldRemoveAttribute(propKey, nextProp, propertyInfo, isCustomComponentTag)) {
              var isMismatchDueToBadCasing = false;

              if (propertyInfo !== null) {
                extraAttributeNames["delete"](propertyInfo.attributeName);
                serverValue = getValueForProperty(domElement, propKey, nextProp, propertyInfo);
              } else {
                var ownNamespace = parentNamespace;

                if (ownNamespace === HTML_NAMESPACE$1) {
                  ownNamespace = getIntrinsicNamespace(tag);
                }

                if (ownNamespace === HTML_NAMESPACE$1) {
                  extraAttributeNames["delete"](propKey.toLowerCase());
                } else {
                  var standardName = getPossibleStandardName(propKey);

                  if (standardName !== null && standardName !== propKey) {
                    isMismatchDueToBadCasing = true;
                    extraAttributeNames["delete"](standardName);
                  }

                  extraAttributeNames["delete"](propKey);
                }

                serverValue = getValueForAttribute(domElement, propKey, nextProp);
              }

              if (nextProp !== serverValue && !isMismatchDueToBadCasing) {
                warnForPropDifference(propKey, serverValue, nextProp);
              }
            }
          }
        }

        {
          if (extraAttributeNames.size > 0 && !suppressHydrationWarning) {
            warnForExtraAttributes(extraAttributeNames);
          }
        }

        switch (tag) {
          case 'input':
            track(domElement);
            postMountWrapper(domElement, rawProps, true);
            break;

          case 'textarea':
            track(domElement);
            postMountWrapper$3(domElement);
            break;

          case 'select':
          case 'option':
            break;

          default:
            if (typeof rawProps.onClick === 'function') {
              trapClickOnNonInteractiveElement(domElement);
            }

            break;
        }

        return updatePayload;
      }

      function diffHydratedText(textNode, text) {
        var isDifferent = textNode.nodeValue !== text;
        return isDifferent;
      }

      function warnForUnmatchedText(textNode, text) {
        {
          warnForTextDifference(textNode.nodeValue, text);
        }
      }

      function warnForDeletedHydratableElement(parentNode, child) {
        {
          if (didWarnInvalidHydration) {
            return;
          }

          didWarnInvalidHydration = true;
          error('Did not expect server HTML to contain a <%s> in <%s>.', child.nodeName.toLowerCase(), parentNode.nodeName.toLowerCase());
        }
      }

      function warnForDeletedHydratableText(parentNode, child) {
        {
          if (didWarnInvalidHydration) {
            return;
          }

          didWarnInvalidHydration = true;
          error('Did not expect server HTML to contain the text node "%s" in <%s>.', child.nodeValue, parentNode.nodeName.toLowerCase());
        }
      }

      function warnForInsertedHydratedElement(parentNode, tag, props) {
        {
          if (didWarnInvalidHydration) {
            return;
          }

          didWarnInvalidHydration = true;
          error('Expected server HTML to contain a matching <%s> in <%s>.', tag, parentNode.nodeName.toLowerCase());
        }
      }

      function warnForInsertedHydratedText(parentNode, text) {
        {
          if (text === '') {
            return;
          }

          if (didWarnInvalidHydration) {
            return;
          }

          didWarnInvalidHydration = true;
          error('Expected server HTML to contain a matching text node for "%s" in <%s>.', text, parentNode.nodeName.toLowerCase());
        }
      }

      function restoreControlledState$3(domElement, tag, props) {
        switch (tag) {
          case 'input':
            restoreControlledState(domElement, props);
            return;

          case 'textarea':
            restoreControlledState$2(domElement, props);
            return;

          case 'select':
            restoreControlledState$1(domElement, props);
            return;
        }
      }

      function getActiveElement(doc) {
        doc = doc || (typeof document !== 'undefined' ? document : undefined);

        if (typeof doc === 'undefined') {
          return null;
        }

        try {
          return doc.activeElement || doc.body;
        } catch (e) {
          return doc.body;
        }
      }

      function getLeafNode(node) {
        while (node && node.firstChild) {
          node = node.firstChild;
        }

        return node;
      }

      function getSiblingNode(node) {
        while (node) {
          if (node.nextSibling) {
            return node.nextSibling;
          }

          node = node.parentNode;
        }
      }

      function getNodeForCharacterOffset(root, offset) {
        var node = getLeafNode(root);
        var nodeStart = 0;
        var nodeEnd = 0;

        while (node) {
          if (node.nodeType === TEXT_NODE) {
            nodeEnd = nodeStart + node.textContent.length;

            if (nodeStart <= offset && nodeEnd >= offset) {
              return {
                node: node,
                offset: offset - nodeStart
              };
            }

            nodeStart = nodeEnd;
          }

          node = getLeafNode(getSiblingNode(node));
        }
      }

      function getOffsets(outerNode) {
        var ownerDocument = outerNode.ownerDocument;
        var win = ownerDocument && ownerDocument.defaultView || window;
        var selection = win.getSelection && win.getSelection();

        if (!selection || selection.rangeCount === 0) {
          return null;
        }

        var anchorNode = selection.anchorNode,
            anchorOffset = selection.anchorOffset,
            focusNode = selection.focusNode,
            focusOffset = selection.focusOffset;

        try {
          anchorNode.nodeType;
          focusNode.nodeType;
        } catch (e) {
          return null;
        }

        return getModernOffsetsFromPoints(outerNode, anchorNode, anchorOffset, focusNode, focusOffset);
      }

      function getModernOffsetsFromPoints(outerNode, anchorNode, anchorOffset, focusNode, focusOffset) {
        var length = 0;
        var start = -1;
        var end = -1;
        var indexWithinAnchor = 0;
        var indexWithinFocus = 0;
        var node = outerNode;
        var parentNode = null;

        outer: while (true) {
          var next = null;

          while (true) {
            if (node === anchorNode && (anchorOffset === 0 || node.nodeType === TEXT_NODE)) {
              start = length + anchorOffset;
            }

            if (node === focusNode && (focusOffset === 0 || node.nodeType === TEXT_NODE)) {
              end = length + focusOffset;
            }

            if (node.nodeType === TEXT_NODE) {
              length += node.nodeValue.length;
            }

            if ((next = node.firstChild) === null) {
              break;
            }

            parentNode = node;
            node = next;
          }

          while (true) {
            if (node === outerNode) {
              break outer;
            }

            if (parentNode === anchorNode && ++indexWithinAnchor === anchorOffset) {
              start = length;
            }

            if (parentNode === focusNode && ++indexWithinFocus === focusOffset) {
              end = length;
            }

            if ((next = node.nextSibling) !== null) {
              break;
            }

            node = parentNode;
            parentNode = node.parentNode;
          }

          node = next;
        }

        if (start === -1 || end === -1) {
          return null;
        }

        return {
          start: start,
          end: end
        };
      }

      function setOffsets(node, offsets) {
        var doc = node.ownerDocument || document;
        var win = doc && doc.defaultView || window;

        if (!win.getSelection) {
          return;
        }

        var selection = win.getSelection();
        var length = node.textContent.length;
        var start = Math.min(offsets.start, length);
        var end = offsets.end === undefined ? start : Math.min(offsets.end, length);

        if (!selection.extend && start > end) {
          var temp = end;
          end = start;
          start = temp;
        }

        var startMarker = getNodeForCharacterOffset(node, start);
        var endMarker = getNodeForCharacterOffset(node, end);

        if (startMarker && endMarker) {
          if (selection.rangeCount === 1 && selection.anchorNode === startMarker.node && selection.anchorOffset === startMarker.offset && selection.focusNode === endMarker.node && selection.focusOffset === endMarker.offset) {
            return;
          }

          var range = doc.createRange();
          range.setStart(startMarker.node, startMarker.offset);
          selection.removeAllRanges();

          if (start > end) {
            selection.addRange(range);
            selection.extend(endMarker.node, endMarker.offset);
          } else {
            range.setEnd(endMarker.node, endMarker.offset);
            selection.addRange(range);
          }
        }
      }

      function isTextNode(node) {
        return node && node.nodeType === TEXT_NODE;
      }

      function containsNode(outerNode, innerNode) {
        if (!outerNode || !innerNode) {
          return false;
        } else if (outerNode === innerNode) {
          return true;
        } else if (isTextNode(outerNode)) {
          return false;
        } else if (isTextNode(innerNode)) {
          return containsNode(outerNode, innerNode.parentNode);
        } else if ('contains' in outerNode) {
          return outerNode.contains(innerNode);
        } else if (outerNode.compareDocumentPosition) {
          return !!(outerNode.compareDocumentPosition(innerNode) & 16);
        } else {
          return false;
        }
      }

      function isInDocument(node) {
        return node && node.ownerDocument && containsNode(node.ownerDocument.documentElement, node);
      }

      function isSameOriginFrame(iframe) {
        try {
          return typeof iframe.contentWindow.location.href === 'string';
        } catch (err) {
          return false;
        }
      }

      function getActiveElementDeep() {
        var win = window;
        var element = getActiveElement();

        while (element instanceof win.HTMLIFrameElement) {
          if (isSameOriginFrame(element)) {
            win = element.contentWindow;
          } else {
            return element;
          }

          element = getActiveElement(win.document);
        }

        return element;
      }

      function hasSelectionCapabilities(elem) {
        var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
        return nodeName && (nodeName === 'input' && (elem.type === 'text' || elem.type === 'search' || elem.type === 'tel' || elem.type === 'url' || elem.type === 'password') || nodeName === 'textarea' || elem.contentEditable === 'true');
      }

      function getSelectionInformation() {
        var focusedElem = getActiveElementDeep();
        return {
          activeElementDetached: null,
          focusedElem: focusedElem,
          selectionRange: hasSelectionCapabilities(focusedElem) ? getSelection(focusedElem) : null
        };
      }

      function restoreSelection(priorSelectionInformation) {
        var curFocusedElem = getActiveElementDeep();
        var priorFocusedElem = priorSelectionInformation.focusedElem;
        var priorSelectionRange = priorSelectionInformation.selectionRange;

        if (curFocusedElem !== priorFocusedElem && isInDocument(priorFocusedElem)) {
          if (priorSelectionRange !== null && hasSelectionCapabilities(priorFocusedElem)) {
            setSelection(priorFocusedElem, priorSelectionRange);
          }

          var ancestors = [];
          var ancestor = priorFocusedElem;

          while (ancestor = ancestor.parentNode) {
            if (ancestor.nodeType === ELEMENT_NODE) {
              ancestors.push({
                element: ancestor,
                left: ancestor.scrollLeft,
                top: ancestor.scrollTop
              });
            }
          }

          if (typeof priorFocusedElem.focus === 'function') {
            priorFocusedElem.focus();
          }

          for (var i = 0; i < ancestors.length; i++) {
            var info = ancestors[i];
            info.element.scrollLeft = info.left;
            info.element.scrollTop = info.top;
          }
        }
      }

      function getSelection(input) {
        var selection;

        if ('selectionStart' in input) {
          selection = {
            start: input.selectionStart,
            end: input.selectionEnd
          };
        } else {
          selection = getOffsets(input);
        }

        return selection || {
          start: 0,
          end: 0
        };
      }

      function setSelection(input, offsets) {
        var start = offsets.start,
            end = offsets.end;

        if (end === undefined) {
          end = start;
        }

        if ('selectionStart' in input) {
          input.selectionStart = start;
          input.selectionEnd = Math.min(end, input.value.length);
        } else {
          setOffsets(input, offsets);
        }
      }

      var validateDOMNesting = function validateDOMNesting() {};

      var updatedAncestorInfo = function updatedAncestorInfo() {};

      {
        var specialTags = ['address', 'applet', 'area', 'article', 'aside', 'base', 'basefont', 'bgsound', 'blockquote', 'body', 'br', 'button', 'caption', 'center', 'col', 'colgroup', 'dd', 'details', 'dir', 'div', 'dl', 'dt', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'frame', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'iframe', 'img', 'input', 'isindex', 'li', 'link', 'listing', 'main', 'marquee', 'menu', 'menuitem', 'meta', 'nav', 'noembed', 'noframes', 'noscript', 'object', 'ol', 'p', 'param', 'plaintext', 'pre', 'script', 'section', 'select', 'source', 'style', 'summary', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'title', 'tr', 'track', 'ul', 'wbr', 'xmp'];
        var inScopeTags = ['applet', 'caption', 'html', 'table', 'td', 'th', 'marquee', 'object', 'template', 'foreignObject', 'desc', 'title'];
        var buttonScopeTags = inScopeTags.concat(['button']);
        var impliedEndTags = ['dd', 'dt', 'li', 'option', 'optgroup', 'p', 'rp', 'rt'];
        var emptyAncestorInfo = {
          current: null,
          formTag: null,
          aTagInScope: null,
          buttonTagInScope: null,
          nobrTagInScope: null,
          pTagInButtonScope: null,
          listItemTagAutoclosing: null,
          dlItemTagAutoclosing: null
        };

        updatedAncestorInfo = function updatedAncestorInfo(oldInfo, tag) {
          var ancestorInfo = _assign({}, oldInfo || emptyAncestorInfo);

          var info = {
            tag: tag
          };

          if (inScopeTags.indexOf(tag) !== -1) {
            ancestorInfo.aTagInScope = null;
            ancestorInfo.buttonTagInScope = null;
            ancestorInfo.nobrTagInScope = null;
          }

          if (buttonScopeTags.indexOf(tag) !== -1) {
            ancestorInfo.pTagInButtonScope = null;
          }

          if (specialTags.indexOf(tag) !== -1 && tag !== 'address' && tag !== 'div' && tag !== 'p') {
            ancestorInfo.listItemTagAutoclosing = null;
            ancestorInfo.dlItemTagAutoclosing = null;
          }

          ancestorInfo.current = info;

          if (tag === 'form') {
            ancestorInfo.formTag = info;
          }

          if (tag === 'a') {
            ancestorInfo.aTagInScope = info;
          }

          if (tag === 'button') {
            ancestorInfo.buttonTagInScope = info;
          }

          if (tag === 'nobr') {
            ancestorInfo.nobrTagInScope = info;
          }

          if (tag === 'p') {
            ancestorInfo.pTagInButtonScope = info;
          }

          if (tag === 'li') {
            ancestorInfo.listItemTagAutoclosing = info;
          }

          if (tag === 'dd' || tag === 'dt') {
            ancestorInfo.dlItemTagAutoclosing = info;
          }

          return ancestorInfo;
        };

        var isTagValidWithParent = function isTagValidWithParent(tag, parentTag) {
          switch (parentTag) {
            case 'select':
              return tag === 'option' || tag === 'optgroup' || tag === '#text';

            case 'optgroup':
              return tag === 'option' || tag === '#text';

            case 'option':
              return tag === '#text';

            case 'tr':
              return tag === 'th' || tag === 'td' || tag === 'style' || tag === 'script' || tag === 'template';

            case 'tbody':
            case 'thead':
            case 'tfoot':
              return tag === 'tr' || tag === 'style' || tag === 'script' || tag === 'template';

            case 'colgroup':
              return tag === 'col' || tag === 'template';

            case 'table':
              return tag === 'caption' || tag === 'colgroup' || tag === 'tbody' || tag === 'tfoot' || tag === 'thead' || tag === 'style' || tag === 'script' || tag === 'template';

            case 'head':
              return tag === 'base' || tag === 'basefont' || tag === 'bgsound' || tag === 'link' || tag === 'meta' || tag === 'title' || tag === 'noscript' || tag === 'noframes' || tag === 'style' || tag === 'script' || tag === 'template';

            case 'html':
              return tag === 'head' || tag === 'body' || tag === 'frameset';

            case 'frameset':
              return tag === 'frame';

            case '#document':
              return tag === 'html';
          }

          switch (tag) {
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
              return parentTag !== 'h1' && parentTag !== 'h2' && parentTag !== 'h3' && parentTag !== 'h4' && parentTag !== 'h5' && parentTag !== 'h6';

            case 'rp':
            case 'rt':
              return impliedEndTags.indexOf(parentTag) === -1;

            case 'body':
            case 'caption':
            case 'col':
            case 'colgroup':
            case 'frameset':
            case 'frame':
            case 'head':
            case 'html':
            case 'tbody':
            case 'td':
            case 'tfoot':
            case 'th':
            case 'thead':
            case 'tr':
              return parentTag == null;
          }

          return true;
        };

        var findInvalidAncestorForTag = function findInvalidAncestorForTag(tag, ancestorInfo) {
          switch (tag) {
            case 'address':
            case 'article':
            case 'aside':
            case 'blockquote':
            case 'center':
            case 'details':
            case 'dialog':
            case 'dir':
            case 'div':
            case 'dl':
            case 'fieldset':
            case 'figcaption':
            case 'figure':
            case 'footer':
            case 'header':
            case 'hgroup':
            case 'main':
            case 'menu':
            case 'nav':
            case 'ol':
            case 'p':
            case 'section':
            case 'summary':
            case 'ul':
            case 'pre':
            case 'listing':
            case 'table':
            case 'hr':
            case 'xmp':
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
              return ancestorInfo.pTagInButtonScope;

            case 'form':
              return ancestorInfo.formTag || ancestorInfo.pTagInButtonScope;

            case 'li':
              return ancestorInfo.listItemTagAutoclosing;

            case 'dd':
            case 'dt':
              return ancestorInfo.dlItemTagAutoclosing;

            case 'button':
              return ancestorInfo.buttonTagInScope;

            case 'a':
              return ancestorInfo.aTagInScope;

            case 'nobr':
              return ancestorInfo.nobrTagInScope;
          }

          return null;
        };

        var didWarn$1 = {};

        validateDOMNesting = function validateDOMNesting(childTag, childText, ancestorInfo) {
          ancestorInfo = ancestorInfo || emptyAncestorInfo;
          var parentInfo = ancestorInfo.current;
          var parentTag = parentInfo && parentInfo.tag;

          if (childText != null) {
            if (childTag != null) {
              error('validateDOMNesting: when childText is passed, childTag should be null');
            }

            childTag = '#text';
          }

          var invalidParent = isTagValidWithParent(childTag, parentTag) ? null : parentInfo;
          var invalidAncestor = invalidParent ? null : findInvalidAncestorForTag(childTag, ancestorInfo);
          var invalidParentOrAncestor = invalidParent || invalidAncestor;

          if (!invalidParentOrAncestor) {
            return;
          }

          var ancestorTag = invalidParentOrAncestor.tag;
          var addendum = getCurrentFiberStackInDev();
          var warnKey = !!invalidParent + '|' + childTag + '|' + ancestorTag + '|' + addendum;

          if (didWarn$1[warnKey]) {
            return;
          }

          didWarn$1[warnKey] = true;
          var tagDisplayName = childTag;
          var whitespaceInfo = '';

          if (childTag === '#text') {
            if (/\S/.test(childText)) {
              tagDisplayName = 'Text nodes';
            } else {
              tagDisplayName = 'Whitespace text nodes';
              whitespaceInfo = " Make sure you don't have any extra whitespace between tags on " + 'each line of your source code.';
            }
          } else {
            tagDisplayName = '<' + childTag + '>';
          }

          if (invalidParent) {
            var info = '';

            if (ancestorTag === 'table' && childTag === 'tr') {
              info += ' Add a <tbody>, <thead> or <tfoot> to your code to match the DOM tree generated by ' + 'the browser.';
            }

            error('validateDOMNesting(...): %s cannot appear as a child of <%s>.%s%s', tagDisplayName, ancestorTag, whitespaceInfo, info);
          } else {
            error('validateDOMNesting(...): %s cannot appear as a descendant of ' + '<%s>.', tagDisplayName, ancestorTag);
          }
        };
      }
      var SUPPRESS_HYDRATION_WARNING$1;
      {
        SUPPRESS_HYDRATION_WARNING$1 = 'suppressHydrationWarning';
      }
      var SUSPENSE_START_DATA = '$';
      var SUSPENSE_END_DATA = '/$';
      var SUSPENSE_PENDING_START_DATA = '$?';
      var SUSPENSE_FALLBACK_START_DATA = '$!';
      var STYLE$1 = 'style';
      var eventsEnabled = null;
      var selectionInformation = null;

      function shouldAutoFocusHostComponent(type, props) {
        switch (type) {
          case 'button':
          case 'input':
          case 'select':
          case 'textarea':
            return !!props.autoFocus;
        }

        return false;
      }

      function getRootHostContext(rootContainerInstance) {
        var type;
        var namespace;
        var nodeType = rootContainerInstance.nodeType;

        switch (nodeType) {
          case DOCUMENT_NODE:
          case DOCUMENT_FRAGMENT_NODE:
            {
              type = nodeType === DOCUMENT_NODE ? '#document' : '#fragment';
              var root = rootContainerInstance.documentElement;
              namespace = root ? root.namespaceURI : getChildNamespace(null, '');
              break;
            }

          default:
            {
              var container = nodeType === COMMENT_NODE ? rootContainerInstance.parentNode : rootContainerInstance;
              var ownNamespace = container.namespaceURI || null;
              type = container.tagName;
              namespace = getChildNamespace(ownNamespace, type);
              break;
            }
        }

        {
          var validatedTag = type.toLowerCase();
          var ancestorInfo = updatedAncestorInfo(null, validatedTag);
          return {
            namespace: namespace,
            ancestorInfo: ancestorInfo
          };
        }
      }

      function getChildHostContext(parentHostContext, type, rootContainerInstance) {
        {
          var parentHostContextDev = parentHostContext;
          var namespace = getChildNamespace(parentHostContextDev.namespace, type);
          var ancestorInfo = updatedAncestorInfo(parentHostContextDev.ancestorInfo, type);
          return {
            namespace: namespace,
            ancestorInfo: ancestorInfo
          };
        }
      }

      function getPublicInstance(instance) {
        return instance;
      }

      function prepareForCommit(containerInfo) {
        eventsEnabled = isEnabled();
        selectionInformation = getSelectionInformation();
        setEnabled(false);
      }

      function resetAfterCommit(containerInfo) {
        restoreSelection(selectionInformation);
        setEnabled(eventsEnabled);
        eventsEnabled = null;
        selectionInformation = null;
      }

      function createInstance(type, props, rootContainerInstance, hostContext, internalInstanceHandle) {
        var parentNamespace;
        {
          var hostContextDev = hostContext;
          validateDOMNesting(type, null, hostContextDev.ancestorInfo);

          if (typeof props.children === 'string' || typeof props.children === 'number') {
            var string = '' + props.children;
            var ownAncestorInfo = updatedAncestorInfo(hostContextDev.ancestorInfo, type);
            validateDOMNesting(null, string, ownAncestorInfo);
          }

          parentNamespace = hostContextDev.namespace;
        }
        var domElement = createElement(type, props, rootContainerInstance, parentNamespace);
        precacheFiberNode(internalInstanceHandle, domElement);
        updateFiberProps(domElement, props);
        return domElement;
      }

      function appendInitialChild(parentInstance, child) {
        parentInstance.appendChild(child);
      }

      function finalizeInitialChildren(domElement, type, props, rootContainerInstance, hostContext) {
        setInitialProperties(domElement, type, props, rootContainerInstance);
        return shouldAutoFocusHostComponent(type, props);
      }

      function prepareUpdate(domElement, type, oldProps, newProps, rootContainerInstance, hostContext) {
        {
          var hostContextDev = hostContext;

          if (typeof newProps.children !== typeof oldProps.children && (typeof newProps.children === 'string' || typeof newProps.children === 'number')) {
            var string = '' + newProps.children;
            var ownAncestorInfo = updatedAncestorInfo(hostContextDev.ancestorInfo, type);
            validateDOMNesting(null, string, ownAncestorInfo);
          }
        }
        return diffProperties(domElement, type, oldProps, newProps, rootContainerInstance);
      }

      function shouldSetTextContent(type, props) {
        return type === 'textarea' || type === 'option' || type === 'noscript' || typeof props.children === 'string' || typeof props.children === 'number' || typeof props.dangerouslySetInnerHTML === 'object' && props.dangerouslySetInnerHTML !== null && props.dangerouslySetInnerHTML.__html != null;
      }

      function shouldDeprioritizeSubtree(type, props) {
        return !!props.hidden;
      }

      function createTextInstance(text, rootContainerInstance, hostContext, internalInstanceHandle) {
        {
          var hostContextDev = hostContext;
          validateDOMNesting(null, text, hostContextDev.ancestorInfo);
        }
        var textNode = createTextNode(text, rootContainerInstance);
        precacheFiberNode(internalInstanceHandle, textNode);
        return textNode;
      }

      var scheduleTimeout = typeof setTimeout === 'function' ? setTimeout : undefined;
      var cancelTimeout = typeof clearTimeout === 'function' ? clearTimeout : undefined;
      var noTimeout = -1;

      function commitMount(domElement, type, newProps, internalInstanceHandle) {
        if (shouldAutoFocusHostComponent(type, newProps)) {
          domElement.focus();
        }
      }

      function commitUpdate(domElement, updatePayload, type, oldProps, newProps, internalInstanceHandle) {
        updateFiberProps(domElement, newProps);
        updateProperties(domElement, updatePayload, type, oldProps, newProps);
      }

      function resetTextContent(domElement) {
        setTextContent(domElement, '');
      }

      function commitTextUpdate(textInstance, oldText, newText) {
        textInstance.nodeValue = newText;
      }

      function appendChild(parentInstance, child) {
        parentInstance.appendChild(child);
      }

      function appendChildToContainer(container, child) {
        var parentNode;

        if (container.nodeType === COMMENT_NODE) {
          parentNode = container.parentNode;
          parentNode.insertBefore(child, container);
        } else {
          parentNode = container;
          parentNode.appendChild(child);
        }

        var reactRootContainer = container._reactRootContainer;

        if ((reactRootContainer === null || reactRootContainer === undefined) && parentNode.onclick === null) {
          trapClickOnNonInteractiveElement(parentNode);
        }
      }

      function insertBefore(parentInstance, child, beforeChild) {
        parentInstance.insertBefore(child, beforeChild);
      }

      function insertInContainerBefore(container, child, beforeChild) {
        if (container.nodeType === COMMENT_NODE) {
          container.parentNode.insertBefore(child, beforeChild);
        } else {
          container.insertBefore(child, beforeChild);
        }
      }

      function removeChild(parentInstance, child) {
        parentInstance.removeChild(child);
      }

      function removeChildFromContainer(container, child) {
        if (container.nodeType === COMMENT_NODE) {
          container.parentNode.removeChild(child);
        } else {
          container.removeChild(child);
        }
      }

      function hideInstance(instance) {
        instance = instance;
        var style = instance.style;

        if (typeof style.setProperty === 'function') {
          style.setProperty('display', 'none', 'important');
        } else {
          style.display = 'none';
        }
      }

      function hideTextInstance(textInstance) {
        textInstance.nodeValue = '';
      }

      function unhideInstance(instance, props) {
        instance = instance;
        var styleProp = props[STYLE$1];
        var display = styleProp !== undefined && styleProp !== null && styleProp.hasOwnProperty('display') ? styleProp.display : null;
        instance.style.display = dangerousStyleValue('display', display);
      }

      function unhideTextInstance(textInstance, text) {
        textInstance.nodeValue = text;
      }

      function canHydrateInstance(instance, type, props) {
        if (instance.nodeType !== ELEMENT_NODE || type.toLowerCase() !== instance.nodeName.toLowerCase()) {
          return null;
        }

        return instance;
      }

      function canHydrateTextInstance(instance, text) {
        if (text === '' || instance.nodeType !== TEXT_NODE) {
          return null;
        }

        return instance;
      }

      function isSuspenseInstancePending(instance) {
        return instance.data === SUSPENSE_PENDING_START_DATA;
      }

      function isSuspenseInstanceFallback(instance) {
        return instance.data === SUSPENSE_FALLBACK_START_DATA;
      }

      function getNextHydratable(node) {
        for (; node != null; node = node.nextSibling) {
          var nodeType = node.nodeType;

          if (nodeType === ELEMENT_NODE || nodeType === TEXT_NODE) {
            break;
          }
        }

        return node;
      }

      function getNextHydratableSibling(instance) {
        return getNextHydratable(instance.nextSibling);
      }

      function getFirstHydratableChild(parentInstance) {
        return getNextHydratable(parentInstance.firstChild);
      }

      function hydrateInstance(instance, type, props, rootContainerInstance, hostContext, internalInstanceHandle) {
        precacheFiberNode(internalInstanceHandle, instance);
        updateFiberProps(instance, props);
        var parentNamespace;
        {
          var hostContextDev = hostContext;
          parentNamespace = hostContextDev.namespace;
        }
        return diffHydratedProperties(instance, type, props, parentNamespace, rootContainerInstance);
      }

      function hydrateTextInstance(textInstance, text, internalInstanceHandle) {
        precacheFiberNode(internalInstanceHandle, textInstance);
        return diffHydratedText(textInstance, text);
      }

      function getNextHydratableInstanceAfterSuspenseInstance(suspenseInstance) {
        var node = suspenseInstance.nextSibling;
        var depth = 0;

        while (node) {
          if (node.nodeType === COMMENT_NODE) {
            var data = node.data;

            if (data === SUSPENSE_END_DATA) {
              if (depth === 0) {
                return getNextHydratableSibling(node);
              } else {
                depth--;
              }
            } else if (data === SUSPENSE_START_DATA || data === SUSPENSE_FALLBACK_START_DATA || data === SUSPENSE_PENDING_START_DATA) {
              depth++;
            }
          }

          node = node.nextSibling;
        }

        return null;
      }

      function getParentSuspenseInstance(targetInstance) {
        var node = targetInstance.previousSibling;
        var depth = 0;

        while (node) {
          if (node.nodeType === COMMENT_NODE) {
            var data = node.data;

            if (data === SUSPENSE_START_DATA || data === SUSPENSE_FALLBACK_START_DATA || data === SUSPENSE_PENDING_START_DATA) {
              if (depth === 0) {
                return node;
              } else {
                depth--;
              }
            } else if (data === SUSPENSE_END_DATA) {
              depth++;
            }
          }

          node = node.previousSibling;
        }

        return null;
      }

      function commitHydratedContainer(container) {
        retryIfBlockedOn(container);
      }

      function commitHydratedSuspenseInstance(suspenseInstance) {
        retryIfBlockedOn(suspenseInstance);
      }

      function didNotMatchHydratedContainerTextInstance(parentContainer, textInstance, text) {
        {
          warnForUnmatchedText(textInstance, text);
        }
      }

      function didNotMatchHydratedTextInstance(parentType, parentProps, parentInstance, textInstance, text) {
        if (parentProps[SUPPRESS_HYDRATION_WARNING$1] !== true) {
          warnForUnmatchedText(textInstance, text);
        }
      }

      function didNotHydrateContainerInstance(parentContainer, instance) {
        {
          if (instance.nodeType === ELEMENT_NODE) {
            warnForDeletedHydratableElement(parentContainer, instance);
          } else if (instance.nodeType === COMMENT_NODE) ;else {
            warnForDeletedHydratableText(parentContainer, instance);
          }
        }
      }

      function didNotHydrateInstance(parentType, parentProps, parentInstance, instance) {
        if (parentProps[SUPPRESS_HYDRATION_WARNING$1] !== true) {
          if (instance.nodeType === ELEMENT_NODE) {
            warnForDeletedHydratableElement(parentInstance, instance);
          } else if (instance.nodeType === COMMENT_NODE) ;else {
            warnForDeletedHydratableText(parentInstance, instance);
          }
        }
      }

      function didNotFindHydratableContainerInstance(parentContainer, type, props) {
        {
          warnForInsertedHydratedElement(parentContainer, type);
        }
      }

      function didNotFindHydratableContainerTextInstance(parentContainer, text) {
        {
          warnForInsertedHydratedText(parentContainer, text);
        }
      }

      function didNotFindHydratableInstance(parentType, parentProps, parentInstance, type, props) {
        if (parentProps[SUPPRESS_HYDRATION_WARNING$1] !== true) {
          warnForInsertedHydratedElement(parentInstance, type);
        }
      }

      function didNotFindHydratableTextInstance(parentType, parentProps, parentInstance, text) {
        if (parentProps[SUPPRESS_HYDRATION_WARNING$1] !== true) {
          warnForInsertedHydratedText(parentInstance, text);
        }
      }

      var randomKey = Math.random().toString(36).slice(2);
      var internalInstanceKey = '__reactInternalInstance$' + randomKey;
      var internalEventHandlersKey = '__reactEventHandlers$' + randomKey;
      var internalContainerInstanceKey = '__reactContainere$' + randomKey;

      function precacheFiberNode(hostInst, node) {
        node[internalInstanceKey] = hostInst;
      }

      function markContainerAsRoot(hostRoot, node) {
        node[internalContainerInstanceKey] = hostRoot;
      }

      function unmarkContainerAsRoot(node) {
        node[internalContainerInstanceKey] = null;
      }

      function isContainerMarkedAsRoot(node) {
        return !!node[internalContainerInstanceKey];
      }

      function getClosestInstanceFromNode(targetNode) {
        var targetInst = targetNode[internalInstanceKey];

        if (targetInst) {
          return targetInst;
        }

        var parentNode = targetNode.parentNode;

        while (parentNode) {
          targetInst = parentNode[internalContainerInstanceKey] || parentNode[internalInstanceKey];

          if (targetInst) {
            var alternate = targetInst.alternate;

            if (targetInst.child !== null || alternate !== null && alternate.child !== null) {
              var suspenseInstance = getParentSuspenseInstance(targetNode);

              while (suspenseInstance !== null) {
                var targetSuspenseInst = suspenseInstance[internalInstanceKey];

                if (targetSuspenseInst) {
                  return targetSuspenseInst;
                }

                suspenseInstance = getParentSuspenseInstance(suspenseInstance);
              }
            }

            return targetInst;
          }

          targetNode = parentNode;
          parentNode = targetNode.parentNode;
        }

        return null;
      }

      function getInstanceFromNode$1(node) {
        var inst = node[internalInstanceKey] || node[internalContainerInstanceKey];

        if (inst) {
          if (inst.tag === HostComponent || inst.tag === HostText || inst.tag === SuspenseComponent || inst.tag === HostRoot) {
            return inst;
          } else {
            return null;
          }
        }

        return null;
      }

      function getNodeFromInstance$1(inst) {
        if (inst.tag === HostComponent || inst.tag === HostText) {
          return inst.stateNode;
        }

        {
          {
            throw Error("getNodeFromInstance: Invalid argument.");
          }
        }
      }

      function getFiberCurrentPropsFromNode$1(node) {
        return node[internalEventHandlersKey] || null;
      }

      function updateFiberProps(node, props) {
        node[internalEventHandlersKey] = props;
      }

      function getParent(inst) {
        do {
          inst = inst["return"];
        } while (inst && inst.tag !== HostComponent);

        if (inst) {
          return inst;
        }

        return null;
      }

      function getLowestCommonAncestor(instA, instB) {
        var depthA = 0;

        for (var tempA = instA; tempA; tempA = getParent(tempA)) {
          depthA++;
        }

        var depthB = 0;

        for (var tempB = instB; tempB; tempB = getParent(tempB)) {
          depthB++;
        }

        while (depthA - depthB > 0) {
          instA = getParent(instA);
          depthA--;
        }

        while (depthB - depthA > 0) {
          instB = getParent(instB);
          depthB--;
        }

        var depth = depthA;

        while (depth--) {
          if (instA === instB || instA === instB.alternate) {
            return instA;
          }

          instA = getParent(instA);
          instB = getParent(instB);
        }

        return null;
      }

      function traverseTwoPhase(inst, fn, arg) {
        var path = [];

        while (inst) {
          path.push(inst);
          inst = getParent(inst);
        }

        var i;

        for (i = path.length; i-- > 0;) {
          fn(path[i], 'captured', arg);
        }

        for (i = 0; i < path.length; i++) {
          fn(path[i], 'bubbled', arg);
        }
      }

      function traverseEnterLeave(from, to, fn, argFrom, argTo) {
        var common = from && to ? getLowestCommonAncestor(from, to) : null;
        var pathFrom = [];

        while (true) {
          if (!from) {
            break;
          }

          if (from === common) {
            break;
          }

          var alternate = from.alternate;

          if (alternate !== null && alternate === common) {
            break;
          }

          pathFrom.push(from);
          from = getParent(from);
        }

        var pathTo = [];

        while (true) {
          if (!to) {
            break;
          }

          if (to === common) {
            break;
          }

          var _alternate = to.alternate;

          if (_alternate !== null && _alternate === common) {
            break;
          }

          pathTo.push(to);
          to = getParent(to);
        }

        for (var i = 0; i < pathFrom.length; i++) {
          fn(pathFrom[i], 'bubbled', argFrom);
        }

        for (var _i = pathTo.length; _i-- > 0;) {
          fn(pathTo[_i], 'captured', argTo);
        }
      }

      function isInteractive(tag) {
        return tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea';
      }

      function shouldPreventMouseEvent(name, type, props) {
        switch (name) {
          case 'onClick':
          case 'onClickCapture':
          case 'onDoubleClick':
          case 'onDoubleClickCapture':
          case 'onMouseDown':
          case 'onMouseDownCapture':
          case 'onMouseMove':
          case 'onMouseMoveCapture':
          case 'onMouseUp':
          case 'onMouseUpCapture':
          case 'onMouseEnter':
            return !!(props.disabled && isInteractive(type));

          default:
            return false;
        }
      }

      function getListener(inst, registrationName) {
        var listener;
        var stateNode = inst.stateNode;

        if (!stateNode) {
          return null;
        }

        var props = getFiberCurrentPropsFromNode(stateNode);

        if (!props) {
          return null;
        }

        listener = props[registrationName];

        if (shouldPreventMouseEvent(registrationName, inst.type, props)) {
          return null;
        }

        if (!(!listener || typeof listener === 'function')) {
          {
            throw Error("Expected `" + registrationName + "` listener to be a function, instead got a value of `" + typeof listener + "` type.");
          }
        }

        return listener;
      }

      function listenerAtPhase(inst, event, propagationPhase) {
        var registrationName = event.dispatchConfig.phasedRegistrationNames[propagationPhase];
        return getListener(inst, registrationName);
      }

      function accumulateDirectionalDispatches(inst, phase, event) {
        {
          if (!inst) {
            error('Dispatching inst must not be null');
          }
        }
        var listener = listenerAtPhase(inst, event, phase);

        if (listener) {
          event._dispatchListeners = accumulateInto(event._dispatchListeners, listener);
          event._dispatchInstances = accumulateInto(event._dispatchInstances, inst);
        }
      }

      function accumulateTwoPhaseDispatchesSingle(event) {
        if (event && event.dispatchConfig.phasedRegistrationNames) {
          traverseTwoPhase(event._targetInst, accumulateDirectionalDispatches, event);
        }
      }

      function accumulateDispatches(inst, ignoredDirection, event) {
        if (inst && event && event.dispatchConfig.registrationName) {
          var registrationName = event.dispatchConfig.registrationName;
          var listener = getListener(inst, registrationName);

          if (listener) {
            event._dispatchListeners = accumulateInto(event._dispatchListeners, listener);
            event._dispatchInstances = accumulateInto(event._dispatchInstances, inst);
          }
        }
      }

      function accumulateDirectDispatchesSingle(event) {
        if (event && event.dispatchConfig.registrationName) {
          accumulateDispatches(event._targetInst, null, event);
        }
      }

      function accumulateTwoPhaseDispatches(events) {
        forEachAccumulated(events, accumulateTwoPhaseDispatchesSingle);
      }

      function accumulateEnterLeaveDispatches(leave, enter, from, to) {
        traverseEnterLeave(from, to, accumulateDispatches, leave, enter);
      }

      function accumulateDirectDispatches(events) {
        forEachAccumulated(events, accumulateDirectDispatchesSingle);
      }

      var root = null;
      var startText = null;
      var fallbackText = null;

      function initialize(nativeEventTarget) {
        root = nativeEventTarget;
        startText = getText();
        return true;
      }

      function reset() {
        root = null;
        startText = null;
        fallbackText = null;
      }

      function getData() {
        if (fallbackText) {
          return fallbackText;
        }

        var start;
        var startValue = startText;
        var startLength = startValue.length;
        var end;
        var endValue = getText();
        var endLength = endValue.length;

        for (start = 0; start < startLength; start++) {
          if (startValue[start] !== endValue[start]) {
            break;
          }
        }

        var minEnd = startLength - start;

        for (end = 1; end <= minEnd; end++) {
          if (startValue[startLength - end] !== endValue[endLength - end]) {
            break;
          }
        }

        var sliceTail = end > 1 ? 1 - end : undefined;
        fallbackText = endValue.slice(start, sliceTail);
        return fallbackText;
      }

      function getText() {
        if ('value' in root) {
          return root.value;
        }

        return root.textContent;
      }

      var EVENT_POOL_SIZE = 10;
      var EventInterface = {
        type: null,
        target: null,
        currentTarget: function currentTarget() {
          return null;
        },
        eventPhase: null,
        bubbles: null,
        cancelable: null,
        timeStamp: function timeStamp(event) {
          return event.timeStamp || Date.now();
        },
        defaultPrevented: null,
        isTrusted: null
      };

      function functionThatReturnsTrue() {
        return true;
      }

      function functionThatReturnsFalse() {
        return false;
      }

      function SyntheticEvent(dispatchConfig, targetInst, nativeEvent, nativeEventTarget) {
        {
          delete this.nativeEvent;
          delete this.preventDefault;
          delete this.stopPropagation;
          delete this.isDefaultPrevented;
          delete this.isPropagationStopped;
        }
        this.dispatchConfig = dispatchConfig;
        this._targetInst = targetInst;
        this.nativeEvent = nativeEvent;
        var Interface = this.constructor.Interface;

        for (var propName in Interface) {
          if (!Interface.hasOwnProperty(propName)) {
            continue;
          }

          {
            delete this[propName];
          }
          var normalize = Interface[propName];

          if (normalize) {
            this[propName] = normalize(nativeEvent);
          } else {
            if (propName === 'target') {
              this.target = nativeEventTarget;
            } else {
              this[propName] = nativeEvent[propName];
            }
          }
        }

        var defaultPrevented = nativeEvent.defaultPrevented != null ? nativeEvent.defaultPrevented : nativeEvent.returnValue === false;

        if (defaultPrevented) {
          this.isDefaultPrevented = functionThatReturnsTrue;
        } else {
          this.isDefaultPrevented = functionThatReturnsFalse;
        }

        this.isPropagationStopped = functionThatReturnsFalse;
        return this;
      }

      _assign(SyntheticEvent.prototype, {
        preventDefault: function preventDefault() {
          this.defaultPrevented = true;
          var event = this.nativeEvent;

          if (!event) {
            return;
          }

          if (event.preventDefault) {
            event.preventDefault();
          } else if (typeof event.returnValue !== 'unknown') {
            event.returnValue = false;
          }

          this.isDefaultPrevented = functionThatReturnsTrue;
        },
        stopPropagation: function stopPropagation() {
          var event = this.nativeEvent;

          if (!event) {
            return;
          }

          if (event.stopPropagation) {
            event.stopPropagation();
          } else if (typeof event.cancelBubble !== 'unknown') {
            event.cancelBubble = true;
          }

          this.isPropagationStopped = functionThatReturnsTrue;
        },
        persist: function persist() {
          this.isPersistent = functionThatReturnsTrue;
        },
        isPersistent: functionThatReturnsFalse,
        destructor: function destructor() {
          var Interface = this.constructor.Interface;

          for (var propName in Interface) {
            {
              Object.defineProperty(this, propName, getPooledWarningPropertyDefinition(propName, Interface[propName]));
            }
          }

          this.dispatchConfig = null;
          this._targetInst = null;
          this.nativeEvent = null;
          this.isDefaultPrevented = functionThatReturnsFalse;
          this.isPropagationStopped = functionThatReturnsFalse;
          this._dispatchListeners = null;
          this._dispatchInstances = null;
          {
            Object.defineProperty(this, 'nativeEvent', getPooledWarningPropertyDefinition('nativeEvent', null));
            Object.defineProperty(this, 'isDefaultPrevented', getPooledWarningPropertyDefinition('isDefaultPrevented', functionThatReturnsFalse));
            Object.defineProperty(this, 'isPropagationStopped', getPooledWarningPropertyDefinition('isPropagationStopped', functionThatReturnsFalse));
            Object.defineProperty(this, 'preventDefault', getPooledWarningPropertyDefinition('preventDefault', function () {}));
            Object.defineProperty(this, 'stopPropagation', getPooledWarningPropertyDefinition('stopPropagation', function () {}));
          }
        }
      });

      SyntheticEvent.Interface = EventInterface;

      SyntheticEvent.extend = function (Interface) {
        var Super = this;

        var E = function E() {};

        E.prototype = Super.prototype;
        var prototype = new E();

        function Class() {
          return Super.apply(this, arguments);
        }

        _assign(prototype, Class.prototype);

        Class.prototype = prototype;
        Class.prototype.constructor = Class;
        Class.Interface = _assign({}, Super.Interface, Interface);
        Class.extend = Super.extend;
        addEventPoolingTo(Class);
        return Class;
      };

      addEventPoolingTo(SyntheticEvent);

      function getPooledWarningPropertyDefinition(propName, getVal) {
        var isFunction = typeof getVal === 'function';
        return {
          configurable: true,
          set: set,
          get: get
        };

        function set(val) {
          var action = isFunction ? 'setting the method' : 'setting the property';
          warn(action, 'This is effectively a no-op');
          return val;
        }

        function get() {
          var action = isFunction ? 'accessing the method' : 'accessing the property';
          var result = isFunction ? 'This is a no-op function' : 'This is set to null';
          warn(action, result);
          return getVal;
        }

        function warn(action, result) {
          {
            error("This synthetic event is reused for performance reasons. If you're seeing this, " + "you're %s `%s` on a released/nullified synthetic event. %s. " + 'If you must keep the original synthetic event around, use event.persist(). ' + 'See https://fb.me/react-event-pooling for more information.', action, propName, result);
          }
        }
      }

      function getPooledEvent(dispatchConfig, targetInst, nativeEvent, nativeInst) {
        var EventConstructor = this;

        if (EventConstructor.eventPool.length) {
          var instance = EventConstructor.eventPool.pop();
          EventConstructor.call(instance, dispatchConfig, targetInst, nativeEvent, nativeInst);
          return instance;
        }

        return new EventConstructor(dispatchConfig, targetInst, nativeEvent, nativeInst);
      }

      function releasePooledEvent(event) {
        var EventConstructor = this;

        if (!(event instanceof EventConstructor)) {
          {
            throw Error("Trying to release an event instance into a pool of a different type.");
          }
        }

        event.destructor();

        if (EventConstructor.eventPool.length < EVENT_POOL_SIZE) {
          EventConstructor.eventPool.push(event);
        }
      }

      function addEventPoolingTo(EventConstructor) {
        EventConstructor.eventPool = [];
        EventConstructor.getPooled = getPooledEvent;
        EventConstructor.release = releasePooledEvent;
      }

      var SyntheticCompositionEvent = SyntheticEvent.extend({
        data: null
      });
      var SyntheticInputEvent = SyntheticEvent.extend({
        data: null
      });
      var END_KEYCODES = [9, 13, 27, 32];
      var START_KEYCODE = 229;
      var canUseCompositionEvent = canUseDOM && 'CompositionEvent' in window;
      var documentMode = null;

      if (canUseDOM && 'documentMode' in document) {
        documentMode = document.documentMode;
      }

      var canUseTextInputEvent = canUseDOM && 'TextEvent' in window && !documentMode;
      var useFallbackCompositionData = canUseDOM && (!canUseCompositionEvent || documentMode && documentMode > 8 && documentMode <= 11);
      var SPACEBAR_CODE = 32;
      var SPACEBAR_CHAR = String.fromCharCode(SPACEBAR_CODE);
      var eventTypes = {
        beforeInput: {
          phasedRegistrationNames: {
            bubbled: 'onBeforeInput',
            captured: 'onBeforeInputCapture'
          },
          dependencies: [TOP_COMPOSITION_END, TOP_KEY_PRESS, TOP_TEXT_INPUT, TOP_PASTE]
        },
        compositionEnd: {
          phasedRegistrationNames: {
            bubbled: 'onCompositionEnd',
            captured: 'onCompositionEndCapture'
          },
          dependencies: [TOP_BLUR, TOP_COMPOSITION_END, TOP_KEY_DOWN, TOP_KEY_PRESS, TOP_KEY_UP, TOP_MOUSE_DOWN]
        },
        compositionStart: {
          phasedRegistrationNames: {
            bubbled: 'onCompositionStart',
            captured: 'onCompositionStartCapture'
          },
          dependencies: [TOP_BLUR, TOP_COMPOSITION_START, TOP_KEY_DOWN, TOP_KEY_PRESS, TOP_KEY_UP, TOP_MOUSE_DOWN]
        },
        compositionUpdate: {
          phasedRegistrationNames: {
            bubbled: 'onCompositionUpdate',
            captured: 'onCompositionUpdateCapture'
          },
          dependencies: [TOP_BLUR, TOP_COMPOSITION_UPDATE, TOP_KEY_DOWN, TOP_KEY_PRESS, TOP_KEY_UP, TOP_MOUSE_DOWN]
        }
      };
      var hasSpaceKeypress = false;

      function isKeypressCommand(nativeEvent) {
        return (nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) && !(nativeEvent.ctrlKey && nativeEvent.altKey);
      }

      function getCompositionEventType(topLevelType) {
        switch (topLevelType) {
          case TOP_COMPOSITION_START:
            return eventTypes.compositionStart;

          case TOP_COMPOSITION_END:
            return eventTypes.compositionEnd;

          case TOP_COMPOSITION_UPDATE:
            return eventTypes.compositionUpdate;
        }
      }

      function isFallbackCompositionStart(topLevelType, nativeEvent) {
        return topLevelType === TOP_KEY_DOWN && nativeEvent.keyCode === START_KEYCODE;
      }

      function isFallbackCompositionEnd(topLevelType, nativeEvent) {
        switch (topLevelType) {
          case TOP_KEY_UP:
            return END_KEYCODES.indexOf(nativeEvent.keyCode) !== -1;

          case TOP_KEY_DOWN:
            return nativeEvent.keyCode !== START_KEYCODE;

          case TOP_KEY_PRESS:
          case TOP_MOUSE_DOWN:
          case TOP_BLUR:
            return true;

          default:
            return false;
        }
      }

      function getDataFromCustomEvent(nativeEvent) {
        var detail = nativeEvent.detail;

        if (typeof detail === 'object' && 'data' in detail) {
          return detail.data;
        }

        return null;
      }

      function isUsingKoreanIME(nativeEvent) {
        return nativeEvent.locale === 'ko';
      }

      var isComposing = false;

      function extractCompositionEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
        var eventType;
        var fallbackData;

        if (canUseCompositionEvent) {
          eventType = getCompositionEventType(topLevelType);
        } else if (!isComposing) {
          if (isFallbackCompositionStart(topLevelType, nativeEvent)) {
            eventType = eventTypes.compositionStart;
          }
        } else if (isFallbackCompositionEnd(topLevelType, nativeEvent)) {
          eventType = eventTypes.compositionEnd;
        }

        if (!eventType) {
          return null;
        }

        if (useFallbackCompositionData && !isUsingKoreanIME(nativeEvent)) {
          if (!isComposing && eventType === eventTypes.compositionStart) {
            isComposing = initialize(nativeEventTarget);
          } else if (eventType === eventTypes.compositionEnd) {
            if (isComposing) {
              fallbackData = getData();
            }
          }
        }

        var event = SyntheticCompositionEvent.getPooled(eventType, targetInst, nativeEvent, nativeEventTarget);

        if (fallbackData) {
          event.data = fallbackData;
        } else {
          var customData = getDataFromCustomEvent(nativeEvent);

          if (customData !== null) {
            event.data = customData;
          }
        }

        accumulateTwoPhaseDispatches(event);
        return event;
      }

      function getNativeBeforeInputChars(topLevelType, nativeEvent) {
        switch (topLevelType) {
          case TOP_COMPOSITION_END:
            return getDataFromCustomEvent(nativeEvent);

          case TOP_KEY_PRESS:
            var which = nativeEvent.which;

            if (which !== SPACEBAR_CODE) {
              return null;
            }

            hasSpaceKeypress = true;
            return SPACEBAR_CHAR;

          case TOP_TEXT_INPUT:
            var chars = nativeEvent.data;

            if (chars === SPACEBAR_CHAR && hasSpaceKeypress) {
              return null;
            }

            return chars;

          default:
            return null;
        }
      }

      function getFallbackBeforeInputChars(topLevelType, nativeEvent) {
        if (isComposing) {
          if (topLevelType === TOP_COMPOSITION_END || !canUseCompositionEvent && isFallbackCompositionEnd(topLevelType, nativeEvent)) {
            var chars = getData();
            reset();
            isComposing = false;
            return chars;
          }

          return null;
        }

        switch (topLevelType) {
          case TOP_PASTE:
            return null;

          case TOP_KEY_PRESS:
            if (!isKeypressCommand(nativeEvent)) {
              if (nativeEvent["char"] && nativeEvent["char"].length > 1) {
                return nativeEvent["char"];
              } else if (nativeEvent.which) {
                return String.fromCharCode(nativeEvent.which);
              }
            }

            return null;

          case TOP_COMPOSITION_END:
            return useFallbackCompositionData && !isUsingKoreanIME(nativeEvent) ? null : nativeEvent.data;

          default:
            return null;
        }
      }

      function extractBeforeInputEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
        var chars;

        if (canUseTextInputEvent) {
          chars = getNativeBeforeInputChars(topLevelType, nativeEvent);
        } else {
          chars = getFallbackBeforeInputChars(topLevelType, nativeEvent);
        }

        if (!chars) {
          return null;
        }

        var event = SyntheticInputEvent.getPooled(eventTypes.beforeInput, targetInst, nativeEvent, nativeEventTarget);
        event.data = chars;
        accumulateTwoPhaseDispatches(event);
        return event;
      }

      var BeforeInputEventPlugin = {
        eventTypes: eventTypes,
        extractEvents: function extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags) {
          var composition = extractCompositionEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget);
          var beforeInput = extractBeforeInputEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget);

          if (composition === null) {
            return beforeInput;
          }

          if (beforeInput === null) {
            return composition;
          }

          return [composition, beforeInput];
        }
      };
      var supportedInputTypes = {
        color: true,
        date: true,
        datetime: true,
        'datetime-local': true,
        email: true,
        month: true,
        number: true,
        password: true,
        range: true,
        search: true,
        tel: true,
        text: true,
        time: true,
        url: true,
        week: true
      };

      function isTextInputElement(elem) {
        var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();

        if (nodeName === 'input') {
          return !!supportedInputTypes[elem.type];
        }

        if (nodeName === 'textarea') {
          return true;
        }

        return false;
      }

      var eventTypes$1 = {
        change: {
          phasedRegistrationNames: {
            bubbled: 'onChange',
            captured: 'onChangeCapture'
          },
          dependencies: [TOP_BLUR, TOP_CHANGE, TOP_CLICK, TOP_FOCUS, TOP_INPUT, TOP_KEY_DOWN, TOP_KEY_UP, TOP_SELECTION_CHANGE]
        }
      };

      function createAndAccumulateChangeEvent(inst, nativeEvent, target) {
        var event = SyntheticEvent.getPooled(eventTypes$1.change, inst, nativeEvent, target);
        event.type = 'change';
        enqueueStateRestore(target);
        accumulateTwoPhaseDispatches(event);
        return event;
      }

      var activeElement = null;
      var activeElementInst = null;

      function shouldUseChangeEvent(elem) {
        var nodeName = elem.nodeName && elem.nodeName.toLowerCase();
        return nodeName === 'select' || nodeName === 'input' && elem.type === 'file';
      }

      function manualDispatchChangeEvent(nativeEvent) {
        var event = createAndAccumulateChangeEvent(activeElementInst, nativeEvent, getEventTarget(nativeEvent));
        batchedUpdates(runEventInBatch, event);
      }

      function runEventInBatch(event) {
        runEventsInBatch(event);
      }

      function getInstIfValueChanged(targetInst) {
        var targetNode = getNodeFromInstance$1(targetInst);

        if (updateValueIfChanged(targetNode)) {
          return targetInst;
        }
      }

      function getTargetInstForChangeEvent(topLevelType, targetInst) {
        if (topLevelType === TOP_CHANGE) {
          return targetInst;
        }
      }

      var isInputEventSupported = false;

      if (canUseDOM) {
        isInputEventSupported = isEventSupported('input') && (!document.documentMode || document.documentMode > 9);
      }

      function startWatchingForValueChange(target, targetInst) {
        activeElement = target;
        activeElementInst = targetInst;
        activeElement.attachEvent('onpropertychange', handlePropertyChange);
      }

      function stopWatchingForValueChange() {
        if (!activeElement) {
          return;
        }

        activeElement.detachEvent('onpropertychange', handlePropertyChange);
        activeElement = null;
        activeElementInst = null;
      }

      function handlePropertyChange(nativeEvent) {
        if (nativeEvent.propertyName !== 'value') {
          return;
        }

        if (getInstIfValueChanged(activeElementInst)) {
          manualDispatchChangeEvent(nativeEvent);
        }
      }

      function handleEventsForInputEventPolyfill(topLevelType, target, targetInst) {
        if (topLevelType === TOP_FOCUS) {
          stopWatchingForValueChange();
          startWatchingForValueChange(target, targetInst);
        } else if (topLevelType === TOP_BLUR) {
          stopWatchingForValueChange();
        }
      }

      function getTargetInstForInputEventPolyfill(topLevelType, targetInst) {
        if (topLevelType === TOP_SELECTION_CHANGE || topLevelType === TOP_KEY_UP || topLevelType === TOP_KEY_DOWN) {
          return getInstIfValueChanged(activeElementInst);
        }
      }

      function shouldUseClickEvent(elem) {
        var nodeName = elem.nodeName;
        return nodeName && nodeName.toLowerCase() === 'input' && (elem.type === 'checkbox' || elem.type === 'radio');
      }

      function getTargetInstForClickEvent(topLevelType, targetInst) {
        if (topLevelType === TOP_CLICK) {
          return getInstIfValueChanged(targetInst);
        }
      }

      function getTargetInstForInputOrChangeEvent(topLevelType, targetInst) {
        if (topLevelType === TOP_INPUT || topLevelType === TOP_CHANGE) {
          return getInstIfValueChanged(targetInst);
        }
      }

      function handleControlledInputBlur(node) {
        var state = node._wrapperState;

        if (!state || !state.controlled || node.type !== 'number') {
          return;
        }

        {
          setDefaultValue(node, 'number', node.value);
        }
      }

      var ChangeEventPlugin = {
        eventTypes: eventTypes$1,
        _isInputEventSupported: isInputEventSupported,
        extractEvents: function extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags) {
          var targetNode = targetInst ? getNodeFromInstance$1(targetInst) : window;
          var getTargetInstFunc, handleEventFunc;

          if (shouldUseChangeEvent(targetNode)) {
            getTargetInstFunc = getTargetInstForChangeEvent;
          } else if (isTextInputElement(targetNode)) {
            if (isInputEventSupported) {
              getTargetInstFunc = getTargetInstForInputOrChangeEvent;
            } else {
              getTargetInstFunc = getTargetInstForInputEventPolyfill;
              handleEventFunc = handleEventsForInputEventPolyfill;
            }
          } else if (shouldUseClickEvent(targetNode)) {
            getTargetInstFunc = getTargetInstForClickEvent;
          }

          if (getTargetInstFunc) {
            var inst = getTargetInstFunc(topLevelType, targetInst);

            if (inst) {
              var event = createAndAccumulateChangeEvent(inst, nativeEvent, nativeEventTarget);
              return event;
            }
          }

          if (handleEventFunc) {
            handleEventFunc(topLevelType, targetNode, targetInst);
          }

          if (topLevelType === TOP_BLUR) {
            handleControlledInputBlur(targetNode);
          }
        }
      };
      var SyntheticUIEvent = SyntheticEvent.extend({
        view: null,
        detail: null
      });
      var modifierKeyToProp = {
        Alt: 'altKey',
        Control: 'ctrlKey',
        Meta: 'metaKey',
        Shift: 'shiftKey'
      };

      function modifierStateGetter(keyArg) {
        var syntheticEvent = this;
        var nativeEvent = syntheticEvent.nativeEvent;

        if (nativeEvent.getModifierState) {
          return nativeEvent.getModifierState(keyArg);
        }

        var keyProp = modifierKeyToProp[keyArg];
        return keyProp ? !!nativeEvent[keyProp] : false;
      }

      function getEventModifierState(nativeEvent) {
        return modifierStateGetter;
      }

      var previousScreenX = 0;
      var previousScreenY = 0;
      var isMovementXSet = false;
      var isMovementYSet = false;
      var SyntheticMouseEvent = SyntheticUIEvent.extend({
        screenX: null,
        screenY: null,
        clientX: null,
        clientY: null,
        pageX: null,
        pageY: null,
        ctrlKey: null,
        shiftKey: null,
        altKey: null,
        metaKey: null,
        getModifierState: getEventModifierState,
        button: null,
        buttons: null,
        relatedTarget: function relatedTarget(event) {
          return event.relatedTarget || (event.fromElement === event.srcElement ? event.toElement : event.fromElement);
        },
        movementX: function movementX(event) {
          if ('movementX' in event) {
            return event.movementX;
          }

          var screenX = previousScreenX;
          previousScreenX = event.screenX;

          if (!isMovementXSet) {
            isMovementXSet = true;
            return 0;
          }

          return event.type === 'mousemove' ? event.screenX - screenX : 0;
        },
        movementY: function movementY(event) {
          if ('movementY' in event) {
            return event.movementY;
          }

          var screenY = previousScreenY;
          previousScreenY = event.screenY;

          if (!isMovementYSet) {
            isMovementYSet = true;
            return 0;
          }

          return event.type === 'mousemove' ? event.screenY - screenY : 0;
        }
      });
      var SyntheticPointerEvent = SyntheticMouseEvent.extend({
        pointerId: null,
        width: null,
        height: null,
        pressure: null,
        tangentialPressure: null,
        tiltX: null,
        tiltY: null,
        twist: null,
        pointerType: null,
        isPrimary: null
      });
      var eventTypes$2 = {
        mouseEnter: {
          registrationName: 'onMouseEnter',
          dependencies: [TOP_MOUSE_OUT, TOP_MOUSE_OVER]
        },
        mouseLeave: {
          registrationName: 'onMouseLeave',
          dependencies: [TOP_MOUSE_OUT, TOP_MOUSE_OVER]
        },
        pointerEnter: {
          registrationName: 'onPointerEnter',
          dependencies: [TOP_POINTER_OUT, TOP_POINTER_OVER]
        },
        pointerLeave: {
          registrationName: 'onPointerLeave',
          dependencies: [TOP_POINTER_OUT, TOP_POINTER_OVER]
        }
      };
      var EnterLeaveEventPlugin = {
        eventTypes: eventTypes$2,
        extractEvents: function extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags) {
          var isOverEvent = topLevelType === TOP_MOUSE_OVER || topLevelType === TOP_POINTER_OVER;
          var isOutEvent = topLevelType === TOP_MOUSE_OUT || topLevelType === TOP_POINTER_OUT;

          if (isOverEvent && (eventSystemFlags & IS_REPLAYED) === 0 && (nativeEvent.relatedTarget || nativeEvent.fromElement)) {
            return null;
          }

          if (!isOutEvent && !isOverEvent) {
            return null;
          }

          var win;

          if (nativeEventTarget.window === nativeEventTarget) {
            win = nativeEventTarget;
          } else {
            var doc = nativeEventTarget.ownerDocument;

            if (doc) {
              win = doc.defaultView || doc.parentWindow;
            } else {
              win = window;
            }
          }

          var from;
          var to;

          if (isOutEvent) {
            from = targetInst;
            var related = nativeEvent.relatedTarget || nativeEvent.toElement;
            to = related ? getClosestInstanceFromNode(related) : null;

            if (to !== null) {
              var nearestMounted = getNearestMountedFiber(to);

              if (to !== nearestMounted || to.tag !== HostComponent && to.tag !== HostText) {
                to = null;
              }
            }
          } else {
            from = null;
            to = targetInst;
          }

          if (from === to) {
            return null;
          }

          var eventInterface, leaveEventType, enterEventType, eventTypePrefix;

          if (topLevelType === TOP_MOUSE_OUT || topLevelType === TOP_MOUSE_OVER) {
            eventInterface = SyntheticMouseEvent;
            leaveEventType = eventTypes$2.mouseLeave;
            enterEventType = eventTypes$2.mouseEnter;
            eventTypePrefix = 'mouse';
          } else if (topLevelType === TOP_POINTER_OUT || topLevelType === TOP_POINTER_OVER) {
            eventInterface = SyntheticPointerEvent;
            leaveEventType = eventTypes$2.pointerLeave;
            enterEventType = eventTypes$2.pointerEnter;
            eventTypePrefix = 'pointer';
          }

          var fromNode = from == null ? win : getNodeFromInstance$1(from);
          var toNode = to == null ? win : getNodeFromInstance$1(to);
          var leave = eventInterface.getPooled(leaveEventType, from, nativeEvent, nativeEventTarget);
          leave.type = eventTypePrefix + 'leave';
          leave.target = fromNode;
          leave.relatedTarget = toNode;
          var enter = eventInterface.getPooled(enterEventType, to, nativeEvent, nativeEventTarget);
          enter.type = eventTypePrefix + 'enter';
          enter.target = toNode;
          enter.relatedTarget = fromNode;
          accumulateEnterLeaveDispatches(leave, enter, from, to);

          if ((eventSystemFlags & IS_FIRST_ANCESTOR) === 0) {
            return [leave];
          }

          return [leave, enter];
        }
      };

      function is(x, y) {
        return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y;
      }

      var objectIs = typeof Object.is === 'function' ? Object.is : is;
      var hasOwnProperty$2 = Object.prototype.hasOwnProperty;

      function shallowEqual(objA, objB) {
        if (objectIs(objA, objB)) {
          return true;
        }

        if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
          return false;
        }

        var keysA = Object.keys(objA);
        var keysB = Object.keys(objB);

        if (keysA.length !== keysB.length) {
          return false;
        }

        for (var i = 0; i < keysA.length; i++) {
          if (!hasOwnProperty$2.call(objB, keysA[i]) || !objectIs(objA[keysA[i]], objB[keysA[i]])) {
            return false;
          }
        }

        return true;
      }

      var skipSelectionChangeEvent = canUseDOM && 'documentMode' in document && document.documentMode <= 11;
      var eventTypes$3 = {
        select: {
          phasedRegistrationNames: {
            bubbled: 'onSelect',
            captured: 'onSelectCapture'
          },
          dependencies: [TOP_BLUR, TOP_CONTEXT_MENU, TOP_DRAG_END, TOP_FOCUS, TOP_KEY_DOWN, TOP_KEY_UP, TOP_MOUSE_DOWN, TOP_MOUSE_UP, TOP_SELECTION_CHANGE]
        }
      };
      var activeElement$1 = null;
      var activeElementInst$1 = null;
      var lastSelection = null;
      var mouseDown = false;

      function getSelection$1(node) {
        if ('selectionStart' in node && hasSelectionCapabilities(node)) {
          return {
            start: node.selectionStart,
            end: node.selectionEnd
          };
        } else {
          var win = node.ownerDocument && node.ownerDocument.defaultView || window;
          var selection = win.getSelection();
          return {
            anchorNode: selection.anchorNode,
            anchorOffset: selection.anchorOffset,
            focusNode: selection.focusNode,
            focusOffset: selection.focusOffset
          };
        }
      }

      function getEventTargetDocument(eventTarget) {
        return eventTarget.window === eventTarget ? eventTarget.document : eventTarget.nodeType === DOCUMENT_NODE ? eventTarget : eventTarget.ownerDocument;
      }

      function constructSelectEvent(nativeEvent, nativeEventTarget) {
        var doc = getEventTargetDocument(nativeEventTarget);

        if (mouseDown || activeElement$1 == null || activeElement$1 !== getActiveElement(doc)) {
          return null;
        }

        var currentSelection = getSelection$1(activeElement$1);

        if (!lastSelection || !shallowEqual(lastSelection, currentSelection)) {
          lastSelection = currentSelection;
          var syntheticEvent = SyntheticEvent.getPooled(eventTypes$3.select, activeElementInst$1, nativeEvent, nativeEventTarget);
          syntheticEvent.type = 'select';
          syntheticEvent.target = activeElement$1;
          accumulateTwoPhaseDispatches(syntheticEvent);
          return syntheticEvent;
        }

        return null;
      }

      var SelectEventPlugin = {
        eventTypes: eventTypes$3,
        extractEvents: function extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, container) {
          var containerOrDoc = container || getEventTargetDocument(nativeEventTarget);

          if (!containerOrDoc || !isListeningToAllDependencies('onSelect', containerOrDoc)) {
            return null;
          }

          var targetNode = targetInst ? getNodeFromInstance$1(targetInst) : window;

          switch (topLevelType) {
            case TOP_FOCUS:
              if (isTextInputElement(targetNode) || targetNode.contentEditable === 'true') {
                activeElement$1 = targetNode;
                activeElementInst$1 = targetInst;
                lastSelection = null;
              }

              break;

            case TOP_BLUR:
              activeElement$1 = null;
              activeElementInst$1 = null;
              lastSelection = null;
              break;

            case TOP_MOUSE_DOWN:
              mouseDown = true;
              break;

            case TOP_CONTEXT_MENU:
            case TOP_MOUSE_UP:
            case TOP_DRAG_END:
              mouseDown = false;
              return constructSelectEvent(nativeEvent, nativeEventTarget);

            case TOP_SELECTION_CHANGE:
              if (skipSelectionChangeEvent) {
                break;
              }

            case TOP_KEY_DOWN:
            case TOP_KEY_UP:
              return constructSelectEvent(nativeEvent, nativeEventTarget);
          }

          return null;
        }
      };
      var SyntheticAnimationEvent = SyntheticEvent.extend({
        animationName: null,
        elapsedTime: null,
        pseudoElement: null
      });
      var SyntheticClipboardEvent = SyntheticEvent.extend({
        clipboardData: function clipboardData(event) {
          return 'clipboardData' in event ? event.clipboardData : window.clipboardData;
        }
      });
      var SyntheticFocusEvent = SyntheticUIEvent.extend({
        relatedTarget: null
      });

      function getEventCharCode(nativeEvent) {
        var charCode;
        var keyCode = nativeEvent.keyCode;

        if ('charCode' in nativeEvent) {
          charCode = nativeEvent.charCode;

          if (charCode === 0 && keyCode === 13) {
            charCode = 13;
          }
        } else {
          charCode = keyCode;
        }

        if (charCode === 10) {
          charCode = 13;
        }

        if (charCode >= 32 || charCode === 13) {
          return charCode;
        }

        return 0;
      }

      var normalizeKey = {
        Esc: 'Escape',
        Spacebar: ' ',
        Left: 'ArrowLeft',
        Up: 'ArrowUp',
        Right: 'ArrowRight',
        Down: 'ArrowDown',
        Del: 'Delete',
        Win: 'OS',
        Menu: 'ContextMenu',
        Apps: 'ContextMenu',
        Scroll: 'ScrollLock',
        MozPrintableKey: 'Unidentified'
      };
      var translateToKey = {
        '8': 'Backspace',
        '9': 'Tab',
        '12': 'Clear',
        '13': 'Enter',
        '16': 'Shift',
        '17': 'Control',
        '18': 'Alt',
        '19': 'Pause',
        '20': 'CapsLock',
        '27': 'Escape',
        '32': ' ',
        '33': 'PageUp',
        '34': 'PageDown',
        '35': 'End',
        '36': 'Home',
        '37': 'ArrowLeft',
        '38': 'ArrowUp',
        '39': 'ArrowRight',
        '40': 'ArrowDown',
        '45': 'Insert',
        '46': 'Delete',
        '112': 'F1',
        '113': 'F2',
        '114': 'F3',
        '115': 'F4',
        '116': 'F5',
        '117': 'F6',
        '118': 'F7',
        '119': 'F8',
        '120': 'F9',
        '121': 'F10',
        '122': 'F11',
        '123': 'F12',
        '144': 'NumLock',
        '145': 'ScrollLock',
        '224': 'Meta'
      };

      function getEventKey(nativeEvent) {
        if (nativeEvent.key) {
          var key = normalizeKey[nativeEvent.key] || nativeEvent.key;

          if (key !== 'Unidentified') {
            return key;
          }
        }

        if (nativeEvent.type === 'keypress') {
          var charCode = getEventCharCode(nativeEvent);
          return charCode === 13 ? 'Enter' : String.fromCharCode(charCode);
        }

        if (nativeEvent.type === 'keydown' || nativeEvent.type === 'keyup') {
          return translateToKey[nativeEvent.keyCode] || 'Unidentified';
        }

        return '';
      }

      var SyntheticKeyboardEvent = SyntheticUIEvent.extend({
        key: getEventKey,
        location: null,
        ctrlKey: null,
        shiftKey: null,
        altKey: null,
        metaKey: null,
        repeat: null,
        locale: null,
        getModifierState: getEventModifierState,
        charCode: function charCode(event) {
          if (event.type === 'keypress') {
            return getEventCharCode(event);
          }

          return 0;
        },
        keyCode: function keyCode(event) {
          if (event.type === 'keydown' || event.type === 'keyup') {
            return event.keyCode;
          }

          return 0;
        },
        which: function which(event) {
          if (event.type === 'keypress') {
            return getEventCharCode(event);
          }

          if (event.type === 'keydown' || event.type === 'keyup') {
            return event.keyCode;
          }

          return 0;
        }
      });
      var SyntheticDragEvent = SyntheticMouseEvent.extend({
        dataTransfer: null
      });
      var SyntheticTouchEvent = SyntheticUIEvent.extend({
        touches: null,
        targetTouches: null,
        changedTouches: null,
        altKey: null,
        metaKey: null,
        ctrlKey: null,
        shiftKey: null,
        getModifierState: getEventModifierState
      });
      var SyntheticTransitionEvent = SyntheticEvent.extend({
        propertyName: null,
        elapsedTime: null,
        pseudoElement: null
      });
      var SyntheticWheelEvent = SyntheticMouseEvent.extend({
        deltaX: function deltaX(event) {
          return 'deltaX' in event ? event.deltaX : 'wheelDeltaX' in event ? -event.wheelDeltaX : 0;
        },
        deltaY: function deltaY(event) {
          return 'deltaY' in event ? event.deltaY : 'wheelDeltaY' in event ? -event.wheelDeltaY : 'wheelDelta' in event ? -event.wheelDelta : 0;
        },
        deltaZ: null,
        deltaMode: null
      });
      var knownHTMLTopLevelTypes = [TOP_ABORT, TOP_CANCEL, TOP_CAN_PLAY, TOP_CAN_PLAY_THROUGH, TOP_CLOSE, TOP_DURATION_CHANGE, TOP_EMPTIED, TOP_ENCRYPTED, TOP_ENDED, TOP_ERROR, TOP_INPUT, TOP_INVALID, TOP_LOAD, TOP_LOADED_DATA, TOP_LOADED_METADATA, TOP_LOAD_START, TOP_PAUSE, TOP_PLAY, TOP_PLAYING, TOP_PROGRESS, TOP_RATE_CHANGE, TOP_RESET, TOP_SEEKED, TOP_SEEKING, TOP_STALLED, TOP_SUBMIT, TOP_SUSPEND, TOP_TIME_UPDATE, TOP_TOGGLE, TOP_VOLUME_CHANGE, TOP_WAITING];
      var SimpleEventPlugin = {
        eventTypes: simpleEventPluginEventTypes,
        extractEvents: function extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags) {
          var dispatchConfig = topLevelEventsToDispatchConfig.get(topLevelType);

          if (!dispatchConfig) {
            return null;
          }

          var EventConstructor;

          switch (topLevelType) {
            case TOP_KEY_PRESS:
              if (getEventCharCode(nativeEvent) === 0) {
                return null;
              }

            case TOP_KEY_DOWN:
            case TOP_KEY_UP:
              EventConstructor = SyntheticKeyboardEvent;
              break;

            case TOP_BLUR:
            case TOP_FOCUS:
              EventConstructor = SyntheticFocusEvent;
              break;

            case TOP_CLICK:
              if (nativeEvent.button === 2) {
                return null;
              }

            case TOP_AUX_CLICK:
            case TOP_DOUBLE_CLICK:
            case TOP_MOUSE_DOWN:
            case TOP_MOUSE_MOVE:
            case TOP_MOUSE_UP:
            case TOP_MOUSE_OUT:
            case TOP_MOUSE_OVER:
            case TOP_CONTEXT_MENU:
              EventConstructor = SyntheticMouseEvent;
              break;

            case TOP_DRAG:
            case TOP_DRAG_END:
            case TOP_DRAG_ENTER:
            case TOP_DRAG_EXIT:
            case TOP_DRAG_LEAVE:
            case TOP_DRAG_OVER:
            case TOP_DRAG_START:
            case TOP_DROP:
              EventConstructor = SyntheticDragEvent;
              break;

            case TOP_TOUCH_CANCEL:
            case TOP_TOUCH_END:
            case TOP_TOUCH_MOVE:
            case TOP_TOUCH_START:
              EventConstructor = SyntheticTouchEvent;
              break;

            case TOP_ANIMATION_END:
            case TOP_ANIMATION_ITERATION:
            case TOP_ANIMATION_START:
              EventConstructor = SyntheticAnimationEvent;
              break;

            case TOP_TRANSITION_END:
              EventConstructor = SyntheticTransitionEvent;
              break;

            case TOP_SCROLL:
              EventConstructor = SyntheticUIEvent;
              break;

            case TOP_WHEEL:
              EventConstructor = SyntheticWheelEvent;
              break;

            case TOP_COPY:
            case TOP_CUT:
            case TOP_PASTE:
              EventConstructor = SyntheticClipboardEvent;
              break;

            case TOP_GOT_POINTER_CAPTURE:
            case TOP_LOST_POINTER_CAPTURE:
            case TOP_POINTER_CANCEL:
            case TOP_POINTER_DOWN:
            case TOP_POINTER_MOVE:
            case TOP_POINTER_OUT:
            case TOP_POINTER_OVER:
            case TOP_POINTER_UP:
              EventConstructor = SyntheticPointerEvent;
              break;

            default:
              {
                if (knownHTMLTopLevelTypes.indexOf(topLevelType) === -1) {
                  error('SimpleEventPlugin: Unhandled event type, `%s`. This warning ' + 'is likely caused by a bug in React. Please file an issue.', topLevelType);
                }
              }
              EventConstructor = SyntheticEvent;
              break;
          }

          var event = EventConstructor.getPooled(dispatchConfig, targetInst, nativeEvent, nativeEventTarget);
          accumulateTwoPhaseDispatches(event);
          return event;
        }
      };
      var DOMEventPluginOrder = ['ResponderEventPlugin', 'SimpleEventPlugin', 'EnterLeaveEventPlugin', 'ChangeEventPlugin', 'SelectEventPlugin', 'BeforeInputEventPlugin'];
      injectEventPluginOrder(DOMEventPluginOrder);
      setComponentTree(getFiberCurrentPropsFromNode$1, getInstanceFromNode$1, getNodeFromInstance$1);
      injectEventPluginsByName({
        SimpleEventPlugin: SimpleEventPlugin,
        EnterLeaveEventPlugin: EnterLeaveEventPlugin,
        ChangeEventPlugin: ChangeEventPlugin,
        SelectEventPlugin: SelectEventPlugin,
        BeforeInputEventPlugin: BeforeInputEventPlugin
      });
      var reactEmoji = "\u269B";
      var warningEmoji = "\u26D4";
      var supportsUserTiming = typeof performance !== 'undefined' && typeof performance.mark === 'function' && typeof performance.clearMarks === 'function' && typeof performance.measure === 'function' && typeof performance.clearMeasures === 'function';
      var currentFiber = null;
      var currentPhase = null;
      var currentPhaseFiber = null;
      var isCommitting = false;
      var hasScheduledUpdateInCurrentCommit = false;
      var hasScheduledUpdateInCurrentPhase = false;
      var commitCountInCurrentWorkLoop = 0;
      var effectCountInCurrentCommit = 0;
      var labelsInCurrentCommit = new Set();

      var formatMarkName = function formatMarkName(markName) {
        return reactEmoji + " " + markName;
      };

      var formatLabel = function formatLabel(label, warning) {
        var prefix = warning ? warningEmoji + " " : reactEmoji + " ";
        var suffix = warning ? " Warning: " + warning : '';
        return "" + prefix + label + suffix;
      };

      var beginMark = function beginMark(markName) {
        performance.mark(formatMarkName(markName));
      };

      var clearMark = function clearMark(markName) {
        performance.clearMarks(formatMarkName(markName));
      };

      var endMark = function endMark(label, markName, warning) {
        var formattedMarkName = formatMarkName(markName);
        var formattedLabel = formatLabel(label, warning);

        try {
          performance.measure(formattedLabel, formattedMarkName);
        } catch (err) {}

        performance.clearMarks(formattedMarkName);
        performance.clearMeasures(formattedLabel);
      };

      var getFiberMarkName = function getFiberMarkName(label, debugID) {
        return label + " (#" + debugID + ")";
      };

      var getFiberLabel = function getFiberLabel(componentName, isMounted, phase) {
        if (phase === null) {
          return componentName + " [" + (isMounted ? 'update' : 'mount') + "]";
        } else {
          return componentName + "." + phase;
        }
      };

      var beginFiberMark = function beginFiberMark(fiber, phase) {
        var componentName = getComponentName(fiber.type) || 'Unknown';
        var debugID = fiber._debugID;
        var isMounted = fiber.alternate !== null;
        var label = getFiberLabel(componentName, isMounted, phase);

        if (isCommitting && labelsInCurrentCommit.has(label)) {
          return false;
        }

        labelsInCurrentCommit.add(label);
        var markName = getFiberMarkName(label, debugID);
        beginMark(markName);
        return true;
      };

      var clearFiberMark = function clearFiberMark(fiber, phase) {
        var componentName = getComponentName(fiber.type) || 'Unknown';
        var debugID = fiber._debugID;
        var isMounted = fiber.alternate !== null;
        var label = getFiberLabel(componentName, isMounted, phase);
        var markName = getFiberMarkName(label, debugID);
        clearMark(markName);
      };

      var endFiberMark = function endFiberMark(fiber, phase, warning) {
        var componentName = getComponentName(fiber.type) || 'Unknown';
        var debugID = fiber._debugID;
        var isMounted = fiber.alternate !== null;
        var label = getFiberLabel(componentName, isMounted, phase);
        var markName = getFiberMarkName(label, debugID);
        endMark(label, markName, warning);
      };

      var shouldIgnoreFiber = function shouldIgnoreFiber(fiber) {
        switch (fiber.tag) {
          case HostRoot:
          case HostComponent:
          case HostText:
          case HostPortal:
          case Fragment:
          case ContextProvider:
          case ContextConsumer:
          case Mode:
            return true;

          default:
            return false;
        }
      };

      var clearPendingPhaseMeasurement = function clearPendingPhaseMeasurement() {
        if (currentPhase !== null && currentPhaseFiber !== null) {
          clearFiberMark(currentPhaseFiber, currentPhase);
        }

        currentPhaseFiber = null;
        currentPhase = null;
        hasScheduledUpdateInCurrentPhase = false;
      };

      var pauseTimers = function pauseTimers() {
        var fiber = currentFiber;

        while (fiber) {
          if (fiber._debugIsCurrentlyTiming) {
            endFiberMark(fiber, null, null);
          }

          fiber = fiber["return"];
        }
      };

      var resumeTimersRecursively = function resumeTimersRecursively(fiber) {
        if (fiber["return"] !== null) {
          resumeTimersRecursively(fiber["return"]);
        }

        if (fiber._debugIsCurrentlyTiming) {
          beginFiberMark(fiber, null);
        }
      };

      var resumeTimers = function resumeTimers() {
        if (currentFiber !== null) {
          resumeTimersRecursively(currentFiber);
        }
      };

      function recordEffect() {
        {
          effectCountInCurrentCommit++;
        }
      }

      function recordScheduleUpdate() {
        {
          if (isCommitting) {
            hasScheduledUpdateInCurrentCommit = true;
          }

          if (currentPhase !== null && currentPhase !== 'componentWillMount' && currentPhase !== 'componentWillReceiveProps') {
            hasScheduledUpdateInCurrentPhase = true;
          }
        }
      }

      function startWorkTimer(fiber) {
        {
          if (!supportsUserTiming || shouldIgnoreFiber(fiber)) {
            return;
          }

          currentFiber = fiber;

          if (!beginFiberMark(fiber, null)) {
            return;
          }

          fiber._debugIsCurrentlyTiming = true;
        }
      }

      function cancelWorkTimer(fiber) {
        {
          if (!supportsUserTiming || shouldIgnoreFiber(fiber)) {
            return;
          }

          fiber._debugIsCurrentlyTiming = false;
          clearFiberMark(fiber, null);
        }
      }

      function stopWorkTimer(fiber) {
        {
          if (!supportsUserTiming || shouldIgnoreFiber(fiber)) {
            return;
          }

          currentFiber = fiber["return"];

          if (!fiber._debugIsCurrentlyTiming) {
            return;
          }

          fiber._debugIsCurrentlyTiming = false;
          endFiberMark(fiber, null, null);
        }
      }

      function stopFailedWorkTimer(fiber) {
        {
          if (!supportsUserTiming || shouldIgnoreFiber(fiber)) {
            return;
          }

          currentFiber = fiber["return"];

          if (!fiber._debugIsCurrentlyTiming) {
            return;
          }

          fiber._debugIsCurrentlyTiming = false;
          var warning = fiber.tag === SuspenseComponent ? 'Rendering was suspended' : 'An error was thrown inside this error boundary';
          endFiberMark(fiber, null, warning);
        }
      }

      function startPhaseTimer(fiber, phase) {
        {
          if (!supportsUserTiming) {
            return;
          }

          clearPendingPhaseMeasurement();

          if (!beginFiberMark(fiber, phase)) {
            return;
          }

          currentPhaseFiber = fiber;
          currentPhase = phase;
        }
      }

      function stopPhaseTimer() {
        {
          if (!supportsUserTiming) {
            return;
          }

          if (currentPhase !== null && currentPhaseFiber !== null) {
            var warning = hasScheduledUpdateInCurrentPhase ? 'Scheduled a cascading update' : null;
            endFiberMark(currentPhaseFiber, currentPhase, warning);
          }

          currentPhase = null;
          currentPhaseFiber = null;
        }
      }

      function startWorkLoopTimer(nextUnitOfWork) {
        {
          currentFiber = nextUnitOfWork;

          if (!supportsUserTiming) {
            return;
          }

          commitCountInCurrentWorkLoop = 0;
          beginMark('(React Tree Reconciliation)');
          resumeTimers();
        }
      }

      function stopWorkLoopTimer(interruptedBy, didCompleteRoot) {
        {
          if (!supportsUserTiming) {
            return;
          }

          var warning = null;

          if (interruptedBy !== null) {
            if (interruptedBy.tag === HostRoot) {
              warning = 'A top-level update interrupted the previous render';
            } else {
              var componentName = getComponentName(interruptedBy.type) || 'Unknown';
              warning = "An update to " + componentName + " interrupted the previous render";
            }
          } else if (commitCountInCurrentWorkLoop > 1) {
            warning = 'There were cascading updates';
          }

          commitCountInCurrentWorkLoop = 0;
          var label = didCompleteRoot ? '(React Tree Reconciliation: Completed Root)' : '(React Tree Reconciliation: Yielded)';
          pauseTimers();
          endMark(label, '(React Tree Reconciliation)', warning);
        }
      }

      function startCommitTimer() {
        {
          if (!supportsUserTiming) {
            return;
          }

          isCommitting = true;
          hasScheduledUpdateInCurrentCommit = false;
          labelsInCurrentCommit.clear();
          beginMark('(Committing Changes)');
        }
      }

      function stopCommitTimer() {
        {
          if (!supportsUserTiming) {
            return;
          }

          var warning = null;

          if (hasScheduledUpdateInCurrentCommit) {
            warning = 'Lifecycle hook scheduled a cascading update';
          } else if (commitCountInCurrentWorkLoop > 0) {
            warning = 'Caused by a cascading update in earlier commit';
          }

          hasScheduledUpdateInCurrentCommit = false;
          commitCountInCurrentWorkLoop++;
          isCommitting = false;
          labelsInCurrentCommit.clear();
          endMark('(Committing Changes)', '(Committing Changes)', warning);
        }
      }

      function startCommitSnapshotEffectsTimer() {
        {
          if (!supportsUserTiming) {
            return;
          }

          effectCountInCurrentCommit = 0;
          beginMark('(Committing Snapshot Effects)');
        }
      }

      function stopCommitSnapshotEffectsTimer() {
        {
          if (!supportsUserTiming) {
            return;
          }

          var count = effectCountInCurrentCommit;
          effectCountInCurrentCommit = 0;
          endMark("(Committing Snapshot Effects: " + count + " Total)", '(Committing Snapshot Effects)', null);
        }
      }

      function startCommitHostEffectsTimer() {
        {
          if (!supportsUserTiming) {
            return;
          }

          effectCountInCurrentCommit = 0;
          beginMark('(Committing Host Effects)');
        }
      }

      function stopCommitHostEffectsTimer() {
        {
          if (!supportsUserTiming) {
            return;
          }

          var count = effectCountInCurrentCommit;
          effectCountInCurrentCommit = 0;
          endMark("(Committing Host Effects: " + count + " Total)", '(Committing Host Effects)', null);
        }
      }

      function startCommitLifeCyclesTimer() {
        {
          if (!supportsUserTiming) {
            return;
          }

          effectCountInCurrentCommit = 0;
          beginMark('(Calling Lifecycle Methods)');
        }
      }

      function stopCommitLifeCyclesTimer() {
        {
          if (!supportsUserTiming) {
            return;
          }

          var count = effectCountInCurrentCommit;
          effectCountInCurrentCommit = 0;
          endMark("(Calling Lifecycle Methods: " + count + " Total)", '(Calling Lifecycle Methods)', null);
        }
      }

      var valueStack = [];
      var fiberStack;
      {
        fiberStack = [];
      }
      var index = -1;

      function createCursor(defaultValue) {
        return {
          current: defaultValue
        };
      }

      function pop(cursor, fiber) {
        if (index < 0) {
          {
            error('Unexpected pop.');
          }
          return;
        }

        {
          if (fiber !== fiberStack[index]) {
            error('Unexpected Fiber popped.');
          }
        }
        cursor.current = valueStack[index];
        valueStack[index] = null;
        {
          fiberStack[index] = null;
        }
        index--;
      }

      function push(cursor, value, fiber) {
        index++;
        valueStack[index] = cursor.current;
        {
          fiberStack[index] = fiber;
        }
        cursor.current = value;
      }

      var warnedAboutMissingGetChildContext;
      {
        warnedAboutMissingGetChildContext = {};
      }
      var emptyContextObject = {};
      {
        Object.freeze(emptyContextObject);
      }
      var contextStackCursor = createCursor(emptyContextObject);
      var didPerformWorkStackCursor = createCursor(false);
      var previousContext = emptyContextObject;

      function getUnmaskedContext(workInProgress, Component, didPushOwnContextIfProvider) {
        {
          if (didPushOwnContextIfProvider && isContextProvider(Component)) {
            return previousContext;
          }

          return contextStackCursor.current;
        }
      }

      function cacheContext(workInProgress, unmaskedContext, maskedContext) {
        {
          var instance = workInProgress.stateNode;
          instance.__reactInternalMemoizedUnmaskedChildContext = unmaskedContext;
          instance.__reactInternalMemoizedMaskedChildContext = maskedContext;
        }
      }

      function getMaskedContext(workInProgress, unmaskedContext) {
        {
          var type = workInProgress.type;
          var contextTypes = type.contextTypes;

          if (!contextTypes) {
            return emptyContextObject;
          }

          var instance = workInProgress.stateNode;

          if (instance && instance.__reactInternalMemoizedUnmaskedChildContext === unmaskedContext) {
            return instance.__reactInternalMemoizedMaskedChildContext;
          }

          var context = {};

          for (var key in contextTypes) {
            context[key] = unmaskedContext[key];
          }

          {
            var name = getComponentName(type) || 'Unknown';
            checkPropTypes(contextTypes, context, 'context', name, getCurrentFiberStackInDev);
          }

          if (instance) {
            cacheContext(workInProgress, unmaskedContext, context);
          }

          return context;
        }
      }

      function hasContextChanged() {
        {
          return didPerformWorkStackCursor.current;
        }
      }

      function isContextProvider(type) {
        {
          var childContextTypes = type.childContextTypes;
          return childContextTypes !== null && childContextTypes !== undefined;
        }
      }

      function popContext(fiber) {
        {
          pop(didPerformWorkStackCursor, fiber);
          pop(contextStackCursor, fiber);
        }
      }

      function popTopLevelContextObject(fiber) {
        {
          pop(didPerformWorkStackCursor, fiber);
          pop(contextStackCursor, fiber);
        }
      }

      function pushTopLevelContextObject(fiber, context, didChange) {
        {
          if (!(contextStackCursor.current === emptyContextObject)) {
            {
              throw Error("Unexpected context found on stack. This error is likely caused by a bug in React. Please file an issue.");
            }
          }

          push(contextStackCursor, context, fiber);
          push(didPerformWorkStackCursor, didChange, fiber);
        }
      }

      function processChildContext(fiber, type, parentContext) {
        {
          var instance = fiber.stateNode;
          var childContextTypes = type.childContextTypes;

          if (typeof instance.getChildContext !== 'function') {
            {
              var componentName = getComponentName(type) || 'Unknown';

              if (!warnedAboutMissingGetChildContext[componentName]) {
                warnedAboutMissingGetChildContext[componentName] = true;
                error('%s.childContextTypes is specified but there is no getChildContext() method ' + 'on the instance. You can either define getChildContext() on %s or remove ' + 'childContextTypes from it.', componentName, componentName);
              }
            }
            return parentContext;
          }

          var childContext;
          startPhaseTimer(fiber, 'getChildContext');
          childContext = instance.getChildContext();
          stopPhaseTimer();

          for (var contextKey in childContext) {
            if (!(contextKey in childContextTypes)) {
              {
                throw Error((getComponentName(type) || 'Unknown') + ".getChildContext(): key \"" + contextKey + "\" is not defined in childContextTypes.");
              }
            }
          }

          {
            var name = getComponentName(type) || 'Unknown';
            checkPropTypes(childContextTypes, childContext, 'child context', name, getCurrentFiberStackInDev);
          }
          return _assign({}, parentContext, {}, childContext);
        }
      }

      function pushContextProvider(workInProgress) {
        {
          var instance = workInProgress.stateNode;
          var memoizedMergedChildContext = instance && instance.__reactInternalMemoizedMergedChildContext || emptyContextObject;
          previousContext = contextStackCursor.current;
          push(contextStackCursor, memoizedMergedChildContext, workInProgress);
          push(didPerformWorkStackCursor, didPerformWorkStackCursor.current, workInProgress);
          return true;
        }
      }

      function invalidateContextProvider(workInProgress, type, didChange) {
        {
          var instance = workInProgress.stateNode;

          if (!instance) {
            {
              throw Error("Expected to have an instance by this point. This error is likely caused by a bug in React. Please file an issue.");
            }
          }

          if (didChange) {
            var mergedContext = processChildContext(workInProgress, type, previousContext);
            instance.__reactInternalMemoizedMergedChildContext = mergedContext;
            pop(didPerformWorkStackCursor, workInProgress);
            pop(contextStackCursor, workInProgress);
            push(contextStackCursor, mergedContext, workInProgress);
            push(didPerformWorkStackCursor, didChange, workInProgress);
          } else {
            pop(didPerformWorkStackCursor, workInProgress);
            push(didPerformWorkStackCursor, didChange, workInProgress);
          }
        }
      }

      function findCurrentUnmaskedContext(fiber) {
        {
          if (!(isFiberMounted(fiber) && fiber.tag === ClassComponent)) {
            {
              throw Error("Expected subtree parent to be a mounted class component. This error is likely caused by a bug in React. Please file an issue.");
            }
          }

          var node = fiber;

          do {
            switch (node.tag) {
              case HostRoot:
                return node.stateNode.context;

              case ClassComponent:
                {
                  var Component = node.type;

                  if (isContextProvider(Component)) {
                    return node.stateNode.__reactInternalMemoizedMergedChildContext;
                  }

                  break;
                }
            }

            node = node["return"];
          } while (node !== null);

          {
            {
              throw Error("Found unexpected detached subtree parent. This error is likely caused by a bug in React. Please file an issue.");
            }
          }
        }
      }

      var LegacyRoot = 0;
      var BlockingRoot = 1;
      var ConcurrentRoot = 2;
      var Scheduler_runWithPriority = Scheduler.unstable_runWithPriority,
          Scheduler_scheduleCallback = Scheduler.unstable_scheduleCallback,
          Scheduler_cancelCallback = Scheduler.unstable_cancelCallback,
          Scheduler_shouldYield = Scheduler.unstable_shouldYield,
          Scheduler_requestPaint = Scheduler.unstable_requestPaint,
          Scheduler_now = Scheduler.unstable_now,
          Scheduler_getCurrentPriorityLevel = Scheduler.unstable_getCurrentPriorityLevel,
          Scheduler_ImmediatePriority = Scheduler.unstable_ImmediatePriority,
          Scheduler_UserBlockingPriority = Scheduler.unstable_UserBlockingPriority,
          Scheduler_NormalPriority = Scheduler.unstable_NormalPriority,
          Scheduler_LowPriority = Scheduler.unstable_LowPriority,
          Scheduler_IdlePriority = Scheduler.unstable_IdlePriority;
      {
        if (!(tracing$1.__interactionsRef != null && tracing$1.__interactionsRef.current != null)) {
          {
            throw Error("It is not supported to run the profiling version of a renderer (for example, `react-dom/profiling`) without also replacing the `scheduler/tracing` module with `scheduler/tracing-profiling`. Your bundler might have a setting for aliasing both modules. Learn more at http://fb.me/react-profiling");
          }
        }
      }
      var fakeCallbackNode = {};
      var ImmediatePriority = 99;
      var UserBlockingPriority$1 = 98;
      var NormalPriority = 97;
      var LowPriority = 96;
      var IdlePriority = 95;
      var NoPriority = 90;
      var shouldYield = Scheduler_shouldYield;
      var requestPaint = Scheduler_requestPaint !== undefined ? Scheduler_requestPaint : function () {};
      var syncQueue = null;
      var immediateQueueCallbackNode = null;
      var isFlushingSyncQueue = false;
      var initialTimeMs = Scheduler_now();
      var now = initialTimeMs < 10000 ? Scheduler_now : function () {
        return Scheduler_now() - initialTimeMs;
      };

      function getCurrentPriorityLevel() {
        switch (Scheduler_getCurrentPriorityLevel()) {
          case Scheduler_ImmediatePriority:
            return ImmediatePriority;

          case Scheduler_UserBlockingPriority:
            return UserBlockingPriority$1;

          case Scheduler_NormalPriority:
            return NormalPriority;

          case Scheduler_LowPriority:
            return LowPriority;

          case Scheduler_IdlePriority:
            return IdlePriority;

          default:
            {
              {
                throw Error("Unknown priority level.");
              }
            }
        }
      }

      function reactPriorityToSchedulerPriority(reactPriorityLevel) {
        switch (reactPriorityLevel) {
          case ImmediatePriority:
            return Scheduler_ImmediatePriority;

          case UserBlockingPriority$1:
            return Scheduler_UserBlockingPriority;

          case NormalPriority:
            return Scheduler_NormalPriority;

          case LowPriority:
            return Scheduler_LowPriority;

          case IdlePriority:
            return Scheduler_IdlePriority;

          default:
            {
              {
                throw Error("Unknown priority level.");
              }
            }
        }
      }

      function runWithPriority$1(reactPriorityLevel, fn) {
        var priorityLevel = reactPriorityToSchedulerPriority(reactPriorityLevel);
        return Scheduler_runWithPriority(priorityLevel, fn);
      }

      function scheduleCallback(reactPriorityLevel, callback, options) {
        var priorityLevel = reactPriorityToSchedulerPriority(reactPriorityLevel);
        return Scheduler_scheduleCallback(priorityLevel, callback, options);
      }

      function scheduleSyncCallback(callback) {
        if (syncQueue === null) {
          syncQueue = [callback];
          immediateQueueCallbackNode = Scheduler_scheduleCallback(Scheduler_ImmediatePriority, flushSyncCallbackQueueImpl);
        } else {
          syncQueue.push(callback);
        }

        return fakeCallbackNode;
      }

      function cancelCallback(callbackNode) {
        if (callbackNode !== fakeCallbackNode) {
          Scheduler_cancelCallback(callbackNode);
        }
      }

      function flushSyncCallbackQueue() {
        if (immediateQueueCallbackNode !== null) {
          var node = immediateQueueCallbackNode;
          immediateQueueCallbackNode = null;
          Scheduler_cancelCallback(node);
        }

        flushSyncCallbackQueueImpl();
      }

      function flushSyncCallbackQueueImpl() {
        if (!isFlushingSyncQueue && syncQueue !== null) {
          isFlushingSyncQueue = true;
          var i = 0;

          try {
            var _isSync = true;
            var queue = syncQueue;
            runWithPriority$1(ImmediatePriority, function () {
              for (; i < queue.length; i++) {
                var callback = queue[i];

                do {
                  callback = callback(_isSync);
                } while (callback !== null);
              }
            });
            syncQueue = null;
          } catch (error) {
            if (syncQueue !== null) {
              syncQueue = syncQueue.slice(i + 1);
            }

            Scheduler_scheduleCallback(Scheduler_ImmediatePriority, flushSyncCallbackQueue);
            throw error;
          } finally {
            isFlushingSyncQueue = false;
          }
        }
      }

      var NoMode = 0;
      var StrictMode = 1;
      var BlockingMode = 2;
      var ConcurrentMode = 4;
      var ProfileMode = 8;
      var MAX_SIGNED_31_BIT_INT = 1073741823;
      var NoWork = 0;
      var Never = 1;
      var Idle = 2;
      var ContinuousHydration = 3;
      var Sync = MAX_SIGNED_31_BIT_INT;
      var Batched = Sync - 1;
      var UNIT_SIZE = 10;
      var MAGIC_NUMBER_OFFSET = Batched - 1;

      function msToExpirationTime(ms) {
        return MAGIC_NUMBER_OFFSET - (ms / UNIT_SIZE | 0);
      }

      function expirationTimeToMs(expirationTime) {
        return (MAGIC_NUMBER_OFFSET - expirationTime) * UNIT_SIZE;
      }

      function ceiling(num, precision) {
        return ((num / precision | 0) + 1) * precision;
      }

      function computeExpirationBucket(currentTime, expirationInMs, bucketSizeMs) {
        return MAGIC_NUMBER_OFFSET - ceiling(MAGIC_NUMBER_OFFSET - currentTime + expirationInMs / UNIT_SIZE, bucketSizeMs / UNIT_SIZE);
      }

      var LOW_PRIORITY_EXPIRATION = 5000;
      var LOW_PRIORITY_BATCH_SIZE = 250;

      function computeAsyncExpiration(currentTime) {
        return computeExpirationBucket(currentTime, LOW_PRIORITY_EXPIRATION, LOW_PRIORITY_BATCH_SIZE);
      }

      function computeSuspenseExpiration(currentTime, timeoutMs) {
        return computeExpirationBucket(currentTime, timeoutMs, LOW_PRIORITY_BATCH_SIZE);
      }

      var HIGH_PRIORITY_EXPIRATION = 500;
      var HIGH_PRIORITY_BATCH_SIZE = 100;

      function computeInteractiveExpiration(currentTime) {
        return computeExpirationBucket(currentTime, HIGH_PRIORITY_EXPIRATION, HIGH_PRIORITY_BATCH_SIZE);
      }

      function inferPriorityFromExpirationTime(currentTime, expirationTime) {
        if (expirationTime === Sync) {
          return ImmediatePriority;
        }

        if (expirationTime === Never || expirationTime === Idle) {
          return IdlePriority;
        }

        var msUntil = expirationTimeToMs(expirationTime) - expirationTimeToMs(currentTime);

        if (msUntil <= 0) {
          return ImmediatePriority;
        }

        if (msUntil <= HIGH_PRIORITY_EXPIRATION + HIGH_PRIORITY_BATCH_SIZE) {
          return UserBlockingPriority$1;
        }

        if (msUntil <= LOW_PRIORITY_EXPIRATION + LOW_PRIORITY_BATCH_SIZE) {
          return NormalPriority;
        }

        return IdlePriority;
      }

      var ReactStrictModeWarnings = {
        recordUnsafeLifecycleWarnings: function recordUnsafeLifecycleWarnings(fiber, instance) {},
        flushPendingUnsafeLifecycleWarnings: function flushPendingUnsafeLifecycleWarnings() {},
        recordLegacyContextWarning: function recordLegacyContextWarning(fiber, instance) {},
        flushLegacyContextWarning: function flushLegacyContextWarning() {},
        discardPendingWarnings: function discardPendingWarnings() {}
      };
      {
        var findStrictRoot = function findStrictRoot(fiber) {
          var maybeStrictRoot = null;
          var node = fiber;

          while (node !== null) {
            if (node.mode & StrictMode) {
              maybeStrictRoot = node;
            }

            node = node["return"];
          }

          return maybeStrictRoot;
        };

        var setToSortedString = function setToSortedString(set) {
          var array = [];
          set.forEach(function (value) {
            array.push(value);
          });
          return array.sort().join(', ');
        };

        var pendingComponentWillMountWarnings = [];
        var pendingUNSAFE_ComponentWillMountWarnings = [];
        var pendingComponentWillReceivePropsWarnings = [];
        var pendingUNSAFE_ComponentWillReceivePropsWarnings = [];
        var pendingComponentWillUpdateWarnings = [];
        var pendingUNSAFE_ComponentWillUpdateWarnings = [];
        var didWarnAboutUnsafeLifecycles = new Set();

        ReactStrictModeWarnings.recordUnsafeLifecycleWarnings = function (fiber, instance) {
          if (didWarnAboutUnsafeLifecycles.has(fiber.type)) {
            return;
          }

          if (typeof instance.componentWillMount === 'function' && instance.componentWillMount.__suppressDeprecationWarning !== true) {
            pendingComponentWillMountWarnings.push(fiber);
          }

          if (fiber.mode & StrictMode && typeof instance.UNSAFE_componentWillMount === 'function') {
            pendingUNSAFE_ComponentWillMountWarnings.push(fiber);
          }

          if (typeof instance.componentWillReceiveProps === 'function' && instance.componentWillReceiveProps.__suppressDeprecationWarning !== true) {
            pendingComponentWillReceivePropsWarnings.push(fiber);
          }

          if (fiber.mode & StrictMode && typeof instance.UNSAFE_componentWillReceiveProps === 'function') {
            pendingUNSAFE_ComponentWillReceivePropsWarnings.push(fiber);
          }

          if (typeof instance.componentWillUpdate === 'function' && instance.componentWillUpdate.__suppressDeprecationWarning !== true) {
            pendingComponentWillUpdateWarnings.push(fiber);
          }

          if (fiber.mode & StrictMode && typeof instance.UNSAFE_componentWillUpdate === 'function') {
            pendingUNSAFE_ComponentWillUpdateWarnings.push(fiber);
          }
        };

        ReactStrictModeWarnings.flushPendingUnsafeLifecycleWarnings = function () {
          var componentWillMountUniqueNames = new Set();

          if (pendingComponentWillMountWarnings.length > 0) {
            pendingComponentWillMountWarnings.forEach(function (fiber) {
              componentWillMountUniqueNames.add(getComponentName(fiber.type) || 'Component');
              didWarnAboutUnsafeLifecycles.add(fiber.type);
            });
            pendingComponentWillMountWarnings = [];
          }

          var UNSAFE_componentWillMountUniqueNames = new Set();

          if (pendingUNSAFE_ComponentWillMountWarnings.length > 0) {
            pendingUNSAFE_ComponentWillMountWarnings.forEach(function (fiber) {
              UNSAFE_componentWillMountUniqueNames.add(getComponentName(fiber.type) || 'Component');
              didWarnAboutUnsafeLifecycles.add(fiber.type);
            });
            pendingUNSAFE_ComponentWillMountWarnings = [];
          }

          var componentWillReceivePropsUniqueNames = new Set();

          if (pendingComponentWillReceivePropsWarnings.length > 0) {
            pendingComponentWillReceivePropsWarnings.forEach(function (fiber) {
              componentWillReceivePropsUniqueNames.add(getComponentName(fiber.type) || 'Component');
              didWarnAboutUnsafeLifecycles.add(fiber.type);
            });
            pendingComponentWillReceivePropsWarnings = [];
          }

          var UNSAFE_componentWillReceivePropsUniqueNames = new Set();

          if (pendingUNSAFE_ComponentWillReceivePropsWarnings.length > 0) {
            pendingUNSAFE_ComponentWillReceivePropsWarnings.forEach(function (fiber) {
              UNSAFE_componentWillReceivePropsUniqueNames.add(getComponentName(fiber.type) || 'Component');
              didWarnAboutUnsafeLifecycles.add(fiber.type);
            });
            pendingUNSAFE_ComponentWillReceivePropsWarnings = [];
          }

          var componentWillUpdateUniqueNames = new Set();

          if (pendingComponentWillUpdateWarnings.length > 0) {
            pendingComponentWillUpdateWarnings.forEach(function (fiber) {
              componentWillUpdateUniqueNames.add(getComponentName(fiber.type) || 'Component');
              didWarnAboutUnsafeLifecycles.add(fiber.type);
            });
            pendingComponentWillUpdateWarnings = [];
          }

          var UNSAFE_componentWillUpdateUniqueNames = new Set();

          if (pendingUNSAFE_ComponentWillUpdateWarnings.length > 0) {
            pendingUNSAFE_ComponentWillUpdateWarnings.forEach(function (fiber) {
              UNSAFE_componentWillUpdateUniqueNames.add(getComponentName(fiber.type) || 'Component');
              didWarnAboutUnsafeLifecycles.add(fiber.type);
            });
            pendingUNSAFE_ComponentWillUpdateWarnings = [];
          }

          if (UNSAFE_componentWillMountUniqueNames.size > 0) {
            var sortedNames = setToSortedString(UNSAFE_componentWillMountUniqueNames);
            error('Using UNSAFE_componentWillMount in strict mode is not recommended and may indicate bugs in your code. ' + 'See https://fb.me/react-unsafe-component-lifecycles for details.\n\n' + '* Move code with side effects to componentDidMount, and set initial state in the constructor.\n' + '\nPlease update the following components: %s', sortedNames);
          }

          if (UNSAFE_componentWillReceivePropsUniqueNames.size > 0) {
            var _sortedNames = setToSortedString(UNSAFE_componentWillReceivePropsUniqueNames);

            error('Using UNSAFE_componentWillReceiveProps in strict mode is not recommended ' + 'and may indicate bugs in your code. ' + 'See https://fb.me/react-unsafe-component-lifecycles for details.\n\n' + '* Move data fetching code or side effects to componentDidUpdate.\n' + "* If you're updating state whenever props change, " + 'refactor your code to use memoization techniques or move it to ' + 'static getDerivedStateFromProps. Learn more at: https://fb.me/react-derived-state\n' + '\nPlease update the following components: %s', _sortedNames);
          }

          if (UNSAFE_componentWillUpdateUniqueNames.size > 0) {
            var _sortedNames2 = setToSortedString(UNSAFE_componentWillUpdateUniqueNames);

            error('Using UNSAFE_componentWillUpdate in strict mode is not recommended ' + 'and may indicate bugs in your code. ' + 'See https://fb.me/react-unsafe-component-lifecycles for details.\n\n' + '* Move data fetching code or side effects to componentDidUpdate.\n' + '\nPlease update the following components: %s', _sortedNames2);
          }

          if (componentWillMountUniqueNames.size > 0) {
            var _sortedNames3 = setToSortedString(componentWillMountUniqueNames);

            warn('componentWillMount has been renamed, and is not recommended for use. ' + 'See https://fb.me/react-unsafe-component-lifecycles for details.\n\n' + '* Move code with side effects to componentDidMount, and set initial state in the constructor.\n' + '* Rename componentWillMount to UNSAFE_componentWillMount to suppress ' + 'this warning in non-strict mode. In React 17.x, only the UNSAFE_ name will work. ' + 'To rename all deprecated lifecycles to their new names, you can run ' + '`npx react-codemod rename-unsafe-lifecycles` in your project source folder.\n' + '\nPlease update the following components: %s', _sortedNames3);
          }

          if (componentWillReceivePropsUniqueNames.size > 0) {
            var _sortedNames4 = setToSortedString(componentWillReceivePropsUniqueNames);

            warn('componentWillReceiveProps has been renamed, and is not recommended for use. ' + 'See https://fb.me/react-unsafe-component-lifecycles for details.\n\n' + '* Move data fetching code or side effects to componentDidUpdate.\n' + "* If you're updating state whenever props change, refactor your " + 'code to use memoization techniques or move it to ' + 'static getDerivedStateFromProps. Learn more at: https://fb.me/react-derived-state\n' + '* Rename componentWillReceiveProps to UNSAFE_componentWillReceiveProps to suppress ' + 'this warning in non-strict mode. In React 17.x, only the UNSAFE_ name will work. ' + 'To rename all deprecated lifecycles to their new names, you can run ' + '`npx react-codemod rename-unsafe-lifecycles` in your project source folder.\n' + '\nPlease update the following components: %s', _sortedNames4);
          }

          if (componentWillUpdateUniqueNames.size > 0) {
            var _sortedNames5 = setToSortedString(componentWillUpdateUniqueNames);

            warn('componentWillUpdate has been renamed, and is not recommended for use. ' + 'See https://fb.me/react-unsafe-component-lifecycles for details.\n\n' + '* Move data fetching code or side effects to componentDidUpdate.\n' + '* Rename componentWillUpdate to UNSAFE_componentWillUpdate to suppress ' + 'this warning in non-strict mode. In React 17.x, only the UNSAFE_ name will work. ' + 'To rename all deprecated lifecycles to their new names, you can run ' + '`npx react-codemod rename-unsafe-lifecycles` in your project source folder.\n' + '\nPlease update the following components: %s', _sortedNames5);
          }
        };

        var pendingLegacyContextWarning = new Map();
        var didWarnAboutLegacyContext = new Set();

        ReactStrictModeWarnings.recordLegacyContextWarning = function (fiber, instance) {
          var strictRoot = findStrictRoot(fiber);

          if (strictRoot === null) {
            error('Expected to find a StrictMode component in a strict mode tree. ' + 'This error is likely caused by a bug in React. Please file an issue.');
            return;
          }

          if (didWarnAboutLegacyContext.has(fiber.type)) {
            return;
          }

          var warningsForRoot = pendingLegacyContextWarning.get(strictRoot);

          if (fiber.type.contextTypes != null || fiber.type.childContextTypes != null || instance !== null && typeof instance.getChildContext === 'function') {
            if (warningsForRoot === undefined) {
              warningsForRoot = [];
              pendingLegacyContextWarning.set(strictRoot, warningsForRoot);
            }

            warningsForRoot.push(fiber);
          }
        };

        ReactStrictModeWarnings.flushLegacyContextWarning = function () {
          pendingLegacyContextWarning.forEach(function (fiberArray, strictRoot) {
            if (fiberArray.length === 0) {
              return;
            }

            var firstFiber = fiberArray[0];
            var uniqueNames = new Set();
            fiberArray.forEach(function (fiber) {
              uniqueNames.add(getComponentName(fiber.type) || 'Component');
              didWarnAboutLegacyContext.add(fiber.type);
            });
            var sortedNames = setToSortedString(uniqueNames);
            var firstComponentStack = getStackByFiberInDevAndProd(firstFiber);
            error('Legacy context API has been detected within a strict-mode tree.' + '\n\nThe old API will be supported in all 16.x releases, but applications ' + 'using it should migrate to the new version.' + '\n\nPlease update the following components: %s' + '\n\nLearn more about this warning here: https://fb.me/react-legacy-context' + '%s', sortedNames, firstComponentStack);
          });
        };

        ReactStrictModeWarnings.discardPendingWarnings = function () {
          pendingComponentWillMountWarnings = [];
          pendingUNSAFE_ComponentWillMountWarnings = [];
          pendingComponentWillReceivePropsWarnings = [];
          pendingUNSAFE_ComponentWillReceivePropsWarnings = [];
          pendingComponentWillUpdateWarnings = [];
          pendingUNSAFE_ComponentWillUpdateWarnings = [];
          pendingLegacyContextWarning = new Map();
        };
      }
      var resolveFamily = null;
      var failedBoundaries = null;

      var setRefreshHandler = function setRefreshHandler(handler) {
        {
          resolveFamily = handler;
        }
      };

      function resolveFunctionForHotReloading(type) {
        {
          if (resolveFamily === null) {
            return type;
          }

          var family = resolveFamily(type);

          if (family === undefined) {
            return type;
          }

          return family.current;
        }
      }

      function resolveClassForHotReloading(type) {
        return resolveFunctionForHotReloading(type);
      }

      function resolveForwardRefForHotReloading(type) {
        {
          if (resolveFamily === null) {
            return type;
          }

          var family = resolveFamily(type);

          if (family === undefined) {
            if (type !== null && type !== undefined && typeof type.render === 'function') {
              var currentRender = resolveFunctionForHotReloading(type.render);

              if (type.render !== currentRender) {
                var syntheticType = {
                  $$typeof: REACT_FORWARD_REF_TYPE,
                  render: currentRender
                };

                if (type.displayName !== undefined) {
                  syntheticType.displayName = type.displayName;
                }

                return syntheticType;
              }
            }

            return type;
          }

          return family.current;
        }
      }

      function isCompatibleFamilyForHotReloading(fiber, element) {
        {
          if (resolveFamily === null) {
            return false;
          }

          var prevType = fiber.elementType;
          var nextType = element.type;
          var needsCompareFamilies = false;
          var $$typeofNextType = typeof nextType === 'object' && nextType !== null ? nextType.$$typeof : null;

          switch (fiber.tag) {
            case ClassComponent:
              {
                if (typeof nextType === 'function') {
                  needsCompareFamilies = true;
                }

                break;
              }

            case FunctionComponent:
              {
                if (typeof nextType === 'function') {
                  needsCompareFamilies = true;
                } else if ($$typeofNextType === REACT_LAZY_TYPE) {
                  needsCompareFamilies = true;
                }

                break;
              }

            case ForwardRef:
              {
                if ($$typeofNextType === REACT_FORWARD_REF_TYPE) {
                  needsCompareFamilies = true;
                } else if ($$typeofNextType === REACT_LAZY_TYPE) {
                  needsCompareFamilies = true;
                }

                break;
              }

            case MemoComponent:
            case SimpleMemoComponent:
              {
                if ($$typeofNextType === REACT_MEMO_TYPE) {
                  needsCompareFamilies = true;
                } else if ($$typeofNextType === REACT_LAZY_TYPE) {
                  needsCompareFamilies = true;
                }

                break;
              }

            default:
              return false;
          }

          if (needsCompareFamilies) {
            var prevFamily = resolveFamily(prevType);

            if (prevFamily !== undefined && prevFamily === resolveFamily(nextType)) {
              return true;
            }
          }

          return false;
        }
      }

      function markFailedErrorBoundaryForHotReloading(fiber) {
        {
          if (resolveFamily === null) {
            return;
          }

          if (typeof WeakSet !== 'function') {
            return;
          }

          if (failedBoundaries === null) {
            failedBoundaries = new WeakSet();
          }

          failedBoundaries.add(fiber);
        }
      }

      var scheduleRefresh = function scheduleRefresh(root, update) {
        {
          if (resolveFamily === null) {
            return;
          }

          var staleFamilies = update.staleFamilies,
              updatedFamilies = update.updatedFamilies;
          flushPassiveEffects();
          flushSync(function () {
            scheduleFibersWithFamiliesRecursively(root.current, updatedFamilies, staleFamilies);
          });
        }
      };

      var scheduleRoot = function scheduleRoot(root, element) {
        {
          if (root.context !== emptyContextObject) {
            return;
          }

          flushPassiveEffects();
          syncUpdates(function () {
            updateContainer(element, root, null, null);
          });
        }
      };

      function scheduleFibersWithFamiliesRecursively(fiber, updatedFamilies, staleFamilies) {
        {
          var alternate = fiber.alternate,
              child = fiber.child,
              sibling = fiber.sibling,
              tag = fiber.tag,
              type = fiber.type;
          var candidateType = null;

          switch (tag) {
            case FunctionComponent:
            case SimpleMemoComponent:
            case ClassComponent:
              candidateType = type;
              break;

            case ForwardRef:
              candidateType = type.render;
              break;
          }

          if (resolveFamily === null) {
            throw new Error('Expected resolveFamily to be set during hot reload.');
          }

          var needsRender = false;
          var needsRemount = false;

          if (candidateType !== null) {
            var family = resolveFamily(candidateType);

            if (family !== undefined) {
              if (staleFamilies.has(family)) {
                needsRemount = true;
              } else if (updatedFamilies.has(family)) {
                if (tag === ClassComponent) {
                  needsRemount = true;
                } else {
                  needsRender = true;
                }
              }
            }
          }

          if (failedBoundaries !== null) {
            if (failedBoundaries.has(fiber) || alternate !== null && failedBoundaries.has(alternate)) {
              needsRemount = true;
            }
          }

          if (needsRemount) {
            fiber._debugNeedsRemount = true;
          }

          if (needsRemount || needsRender) {
            scheduleWork(fiber, Sync);
          }

          if (child !== null && !needsRemount) {
            scheduleFibersWithFamiliesRecursively(child, updatedFamilies, staleFamilies);
          }

          if (sibling !== null) {
            scheduleFibersWithFamiliesRecursively(sibling, updatedFamilies, staleFamilies);
          }
        }
      }

      var findHostInstancesForRefresh = function findHostInstancesForRefresh(root, families) {
        {
          var hostInstances = new Set();
          var types = new Set(families.map(function (family) {
            return family.current;
          }));
          findHostInstancesForMatchingFibersRecursively(root.current, types, hostInstances);
          return hostInstances;
        }
      };

      function findHostInstancesForMatchingFibersRecursively(fiber, types, hostInstances) {
        {
          var child = fiber.child,
              sibling = fiber.sibling,
              tag = fiber.tag,
              type = fiber.type;
          var candidateType = null;

          switch (tag) {
            case FunctionComponent:
            case SimpleMemoComponent:
            case ClassComponent:
              candidateType = type;
              break;

            case ForwardRef:
              candidateType = type.render;
              break;
          }

          var didMatch = false;

          if (candidateType !== null) {
            if (types.has(candidateType)) {
              didMatch = true;
            }
          }

          if (didMatch) {
            findHostInstancesForFiberShallowly(fiber, hostInstances);
          } else {
            if (child !== null) {
              findHostInstancesForMatchingFibersRecursively(child, types, hostInstances);
            }
          }

          if (sibling !== null) {
            findHostInstancesForMatchingFibersRecursively(sibling, types, hostInstances);
          }
        }
      }

      function findHostInstancesForFiberShallowly(fiber, hostInstances) {
        {
          var foundHostInstances = findChildHostInstancesForFiberShallowly(fiber, hostInstances);

          if (foundHostInstances) {
            return;
          }

          var node = fiber;

          while (true) {
            switch (node.tag) {
              case HostComponent:
                hostInstances.add(node.stateNode);
                return;

              case HostPortal:
                hostInstances.add(node.stateNode.containerInfo);
                return;

              case HostRoot:
                hostInstances.add(node.stateNode.containerInfo);
                return;
            }

            if (node["return"] === null) {
              throw new Error('Expected to reach root first.');
            }

            node = node["return"];
          }
        }
      }

      function findChildHostInstancesForFiberShallowly(fiber, hostInstances) {
        {
          var node = fiber;
          var foundHostInstances = false;

          while (true) {
            if (node.tag === HostComponent) {
              foundHostInstances = true;
              hostInstances.add(node.stateNode);
            } else if (node.child !== null) {
              node.child["return"] = node;
              node = node.child;
              continue;
            }

            if (node === fiber) {
              return foundHostInstances;
            }

            while (node.sibling === null) {
              if (node["return"] === null || node["return"] === fiber) {
                return foundHostInstances;
              }

              node = node["return"];
            }

            node.sibling["return"] = node["return"];
            node = node.sibling;
          }
        }
        return false;
      }

      function resolveDefaultProps(Component, baseProps) {
        if (Component && Component.defaultProps) {
          var props = _assign({}, baseProps);

          var defaultProps = Component.defaultProps;

          for (var propName in defaultProps) {
            if (props[propName] === undefined) {
              props[propName] = defaultProps[propName];
            }
          }

          return props;
        }

        return baseProps;
      }

      function readLazyComponentType(lazyComponent) {
        initializeLazyComponentType(lazyComponent);

        if (lazyComponent._status !== Resolved) {
          throw lazyComponent._result;
        }

        return lazyComponent._result;
      }

      var valueCursor = createCursor(null);
      var rendererSigil;
      {
        rendererSigil = {};
      }
      var currentlyRenderingFiber = null;
      var lastContextDependency = null;
      var lastContextWithAllBitsObserved = null;
      var isDisallowedContextReadInDEV = false;

      function resetContextDependencies() {
        currentlyRenderingFiber = null;
        lastContextDependency = null;
        lastContextWithAllBitsObserved = null;
        {
          isDisallowedContextReadInDEV = false;
        }
      }

      function enterDisallowedContextReadInDEV() {
        {
          isDisallowedContextReadInDEV = true;
        }
      }

      function exitDisallowedContextReadInDEV() {
        {
          isDisallowedContextReadInDEV = false;
        }
      }

      function pushProvider(providerFiber, nextValue) {
        var context = providerFiber.type._context;
        {
          push(valueCursor, context._currentValue, providerFiber);
          context._currentValue = nextValue;
          {
            if (context._currentRenderer !== undefined && context._currentRenderer !== null && context._currentRenderer !== rendererSigil) {
              error('Detected multiple renderers concurrently rendering the ' + 'same context provider. This is currently unsupported.');
            }

            context._currentRenderer = rendererSigil;
          }
        }
      }

      function popProvider(providerFiber) {
        var currentValue = valueCursor.current;
        pop(valueCursor, providerFiber);
        var context = providerFiber.type._context;
        {
          context._currentValue = currentValue;
        }
      }

      function calculateChangedBits(context, newValue, oldValue) {
        if (objectIs(oldValue, newValue)) {
          return 0;
        } else {
          var changedBits = typeof context._calculateChangedBits === 'function' ? context._calculateChangedBits(oldValue, newValue) : MAX_SIGNED_31_BIT_INT;
          {
            if ((changedBits & MAX_SIGNED_31_BIT_INT) !== changedBits) {
              error('calculateChangedBits: Expected the return value to be a ' + '31-bit integer. Instead received: %s', changedBits);
            }
          }
          return changedBits | 0;
        }
      }

      function scheduleWorkOnParentPath(parent, renderExpirationTime) {
        var node = parent;

        while (node !== null) {
          var alternate = node.alternate;

          if (node.childExpirationTime < renderExpirationTime) {
            node.childExpirationTime = renderExpirationTime;

            if (alternate !== null && alternate.childExpirationTime < renderExpirationTime) {
              alternate.childExpirationTime = renderExpirationTime;
            }
          } else if (alternate !== null && alternate.childExpirationTime < renderExpirationTime) {
            alternate.childExpirationTime = renderExpirationTime;
          } else {
            break;
          }

          node = node["return"];
        }
      }

      function propagateContextChange(workInProgress, context, changedBits, renderExpirationTime) {
        var fiber = workInProgress.child;

        if (fiber !== null) {
          fiber["return"] = workInProgress;
        }

        while (fiber !== null) {
          var nextFiber = void 0;
          var list = fiber.dependencies;

          if (list !== null) {
            nextFiber = fiber.child;
            var dependency = list.firstContext;

            while (dependency !== null) {
              if (dependency.context === context && (dependency.observedBits & changedBits) !== 0) {
                if (fiber.tag === ClassComponent) {
                  var update = createUpdate(renderExpirationTime, null);
                  update.tag = ForceUpdate;
                  enqueueUpdate(fiber, update);
                }

                if (fiber.expirationTime < renderExpirationTime) {
                  fiber.expirationTime = renderExpirationTime;
                }

                var alternate = fiber.alternate;

                if (alternate !== null && alternate.expirationTime < renderExpirationTime) {
                  alternate.expirationTime = renderExpirationTime;
                }

                scheduleWorkOnParentPath(fiber["return"], renderExpirationTime);

                if (list.expirationTime < renderExpirationTime) {
                  list.expirationTime = renderExpirationTime;
                }

                break;
              }

              dependency = dependency.next;
            }
          } else if (fiber.tag === ContextProvider) {
            nextFiber = fiber.type === workInProgress.type ? null : fiber.child;
          } else {
            nextFiber = fiber.child;
          }

          if (nextFiber !== null) {
            nextFiber["return"] = fiber;
          } else {
            nextFiber = fiber;

            while (nextFiber !== null) {
              if (nextFiber === workInProgress) {
                nextFiber = null;
                break;
              }

              var sibling = nextFiber.sibling;

              if (sibling !== null) {
                sibling["return"] = nextFiber["return"];
                nextFiber = sibling;
                break;
              }

              nextFiber = nextFiber["return"];
            }
          }

          fiber = nextFiber;
        }
      }

      function prepareToReadContext(workInProgress, renderExpirationTime) {
        currentlyRenderingFiber = workInProgress;
        lastContextDependency = null;
        lastContextWithAllBitsObserved = null;
        var dependencies = workInProgress.dependencies;

        if (dependencies !== null) {
          var firstContext = dependencies.firstContext;

          if (firstContext !== null) {
            if (dependencies.expirationTime >= renderExpirationTime) {
              markWorkInProgressReceivedUpdate();
            }

            dependencies.firstContext = null;
          }
        }
      }

      function _readContext(context, observedBits) {
        {
          if (isDisallowedContextReadInDEV) {
            error('Context can only be read while React is rendering. ' + 'In classes, you can read it in the render method or getDerivedStateFromProps. ' + 'In function components, you can read it directly in the function body, but not ' + 'inside Hooks like useReducer() or useMemo().');
          }
        }
        if (lastContextWithAllBitsObserved === context) ;else if (observedBits === false || observedBits === 0) ;else {
          var resolvedObservedBits;

          if (typeof observedBits !== 'number' || observedBits === MAX_SIGNED_31_BIT_INT) {
            lastContextWithAllBitsObserved = context;
            resolvedObservedBits = MAX_SIGNED_31_BIT_INT;
          } else {
            resolvedObservedBits = observedBits;
          }

          var contextItem = {
            context: context,
            observedBits: resolvedObservedBits,
            next: null
          };

          if (lastContextDependency === null) {
            if (!(currentlyRenderingFiber !== null)) {
              {
                throw Error("Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo().");
              }
            }

            lastContextDependency = contextItem;
            currentlyRenderingFiber.dependencies = {
              expirationTime: NoWork,
              firstContext: contextItem,
              responders: null
            };
          } else {
            lastContextDependency = lastContextDependency.next = contextItem;
          }
        }
        return context._currentValue;
      }

      var UpdateState = 0;
      var ReplaceState = 1;
      var ForceUpdate = 2;
      var CaptureUpdate = 3;
      var hasForceUpdate = false;
      var didWarnUpdateInsideUpdate;
      var currentlyProcessingQueue;
      {
        didWarnUpdateInsideUpdate = false;
        currentlyProcessingQueue = null;
      }

      function initializeUpdateQueue(fiber) {
        var queue = {
          baseState: fiber.memoizedState,
          baseQueue: null,
          shared: {
            pending: null
          },
          effects: null
        };
        fiber.updateQueue = queue;
      }

      function cloneUpdateQueue(current, workInProgress) {
        var queue = workInProgress.updateQueue;
        var currentQueue = current.updateQueue;

        if (queue === currentQueue) {
          var clone = {
            baseState: currentQueue.baseState,
            baseQueue: currentQueue.baseQueue,
            shared: currentQueue.shared,
            effects: currentQueue.effects
          };
          workInProgress.updateQueue = clone;
        }
      }

      function createUpdate(expirationTime, suspenseConfig) {
        var update = {
          expirationTime: expirationTime,
          suspenseConfig: suspenseConfig,
          tag: UpdateState,
          payload: null,
          callback: null,
          next: null
        };
        update.next = update;
        {
          update.priority = getCurrentPriorityLevel();
        }
        return update;
      }

      function enqueueUpdate(fiber, update) {
        var updateQueue = fiber.updateQueue;

        if (updateQueue === null) {
          return;
        }

        var sharedQueue = updateQueue.shared;
        var pending = sharedQueue.pending;

        if (pending === null) {
          update.next = update;
        } else {
          update.next = pending.next;
          pending.next = update;
        }

        sharedQueue.pending = update;
        {
          if (currentlyProcessingQueue === sharedQueue && !didWarnUpdateInsideUpdate) {
            error('An update (setState, replaceState, or forceUpdate) was scheduled ' + 'from inside an update function. Update functions should be pure, ' + 'with zero side-effects. Consider using componentDidUpdate or a ' + 'callback.');
            didWarnUpdateInsideUpdate = true;
          }
        }
      }

      function enqueueCapturedUpdate(workInProgress, update) {
        var current = workInProgress.alternate;

        if (current !== null) {
          cloneUpdateQueue(current, workInProgress);
        }

        var queue = workInProgress.updateQueue;
        var last = queue.baseQueue;

        if (last === null) {
          queue.baseQueue = update.next = update;
          update.next = update;
        } else {
          update.next = last.next;
          last.next = update;
        }
      }

      function getStateFromUpdate(workInProgress, queue, update, prevState, nextProps, instance) {
        switch (update.tag) {
          case ReplaceState:
            {
              var payload = update.payload;

              if (typeof payload === 'function') {
                {
                  enterDisallowedContextReadInDEV();

                  if (workInProgress.mode & StrictMode) {
                    payload.call(instance, prevState, nextProps);
                  }
                }
                var nextState = payload.call(instance, prevState, nextProps);
                {
                  exitDisallowedContextReadInDEV();
                }
                return nextState;
              }

              return payload;
            }

          case CaptureUpdate:
            {
              workInProgress.effectTag = workInProgress.effectTag & ~ShouldCapture | DidCapture;
            }

          case UpdateState:
            {
              var _payload = update.payload;
              var partialState;

              if (typeof _payload === 'function') {
                {
                  enterDisallowedContextReadInDEV();

                  if (workInProgress.mode & StrictMode) {
                    _payload.call(instance, prevState, nextProps);
                  }
                }
                partialState = _payload.call(instance, prevState, nextProps);
                {
                  exitDisallowedContextReadInDEV();
                }
              } else {
                partialState = _payload;
              }

              if (partialState === null || partialState === undefined) {
                return prevState;
              }

              return _assign({}, prevState, partialState);
            }

          case ForceUpdate:
            {
              hasForceUpdate = true;
              return prevState;
            }
        }

        return prevState;
      }

      function processUpdateQueue(workInProgress, props, instance, renderExpirationTime) {
        var queue = workInProgress.updateQueue;
        hasForceUpdate = false;
        {
          currentlyProcessingQueue = queue.shared;
        }
        var baseQueue = queue.baseQueue;
        var pendingQueue = queue.shared.pending;

        if (pendingQueue !== null) {
          if (baseQueue !== null) {
            var baseFirst = baseQueue.next;
            var pendingFirst = pendingQueue.next;
            baseQueue.next = pendingFirst;
            pendingQueue.next = baseFirst;
          }

          baseQueue = pendingQueue;
          queue.shared.pending = null;
          var current = workInProgress.alternate;

          if (current !== null) {
            var currentQueue = current.updateQueue;

            if (currentQueue !== null) {
              currentQueue.baseQueue = pendingQueue;
            }
          }
        }

        if (baseQueue !== null) {
          var first = baseQueue.next;
          var newState = queue.baseState;
          var newExpirationTime = NoWork;
          var newBaseState = null;
          var newBaseQueueFirst = null;
          var newBaseQueueLast = null;

          if (first !== null) {
            var update = first;

            do {
              var updateExpirationTime = update.expirationTime;

              if (updateExpirationTime < renderExpirationTime) {
                var clone = {
                  expirationTime: update.expirationTime,
                  suspenseConfig: update.suspenseConfig,
                  tag: update.tag,
                  payload: update.payload,
                  callback: update.callback,
                  next: null
                };

                if (newBaseQueueLast === null) {
                  newBaseQueueFirst = newBaseQueueLast = clone;
                  newBaseState = newState;
                } else {
                  newBaseQueueLast = newBaseQueueLast.next = clone;
                }

                if (updateExpirationTime > newExpirationTime) {
                  newExpirationTime = updateExpirationTime;
                }
              } else {
                if (newBaseQueueLast !== null) {
                  var _clone = {
                    expirationTime: Sync,
                    suspenseConfig: update.suspenseConfig,
                    tag: update.tag,
                    payload: update.payload,
                    callback: update.callback,
                    next: null
                  };
                  newBaseQueueLast = newBaseQueueLast.next = _clone;
                }

                markRenderEventTimeAndConfig(updateExpirationTime, update.suspenseConfig);
                newState = getStateFromUpdate(workInProgress, queue, update, newState, props, instance);
                var callback = update.callback;

                if (callback !== null) {
                  workInProgress.effectTag |= Callback;
                  var effects = queue.effects;

                  if (effects === null) {
                    queue.effects = [update];
                  } else {
                    effects.push(update);
                  }
                }
              }

              update = update.next;

              if (update === null || update === first) {
                pendingQueue = queue.shared.pending;

                if (pendingQueue === null) {
                  break;
                } else {
                  update = baseQueue.next = pendingQueue.next;
                  pendingQueue.next = first;
                  queue.baseQueue = baseQueue = pendingQueue;
                  queue.shared.pending = null;
                }
              }
            } while (true);
          }

          if (newBaseQueueLast === null) {
            newBaseState = newState;
          } else {
            newBaseQueueLast.next = newBaseQueueFirst;
          }

          queue.baseState = newBaseState;
          queue.baseQueue = newBaseQueueLast;
          markUnprocessedUpdateTime(newExpirationTime);
          workInProgress.expirationTime = newExpirationTime;
          workInProgress.memoizedState = newState;
        }

        {
          currentlyProcessingQueue = null;
        }
      }

      function callCallback(callback, context) {
        if (!(typeof callback === 'function')) {
          {
            throw Error("Invalid argument passed as callback. Expected a function. Instead received: " + callback);
          }
        }

        callback.call(context);
      }

      function resetHasForceUpdateBeforeProcessing() {
        hasForceUpdate = false;
      }

      function checkHasForceUpdateAfterProcessing() {
        return hasForceUpdate;
      }

      function commitUpdateQueue(finishedWork, finishedQueue, instance) {
        var effects = finishedQueue.effects;
        finishedQueue.effects = null;

        if (effects !== null) {
          for (var i = 0; i < effects.length; i++) {
            var effect = effects[i];
            var callback = effect.callback;

            if (callback !== null) {
              effect.callback = null;
              callCallback(callback, instance);
            }
          }
        }
      }

      var ReactCurrentBatchConfig = ReactSharedInternals.ReactCurrentBatchConfig;

      function requestCurrentSuspenseConfig() {
        return ReactCurrentBatchConfig.suspense;
      }

      var fakeInternalInstance = {};
      var isArray = Array.isArray;
      var emptyRefsObject = new React$1.Component().refs;
      var didWarnAboutStateAssignmentForComponent;
      var didWarnAboutUninitializedState;
      var didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate;
      var didWarnAboutLegacyLifecyclesAndDerivedState;
      var didWarnAboutUndefinedDerivedState;
      var warnOnUndefinedDerivedState;
      var warnOnInvalidCallback;
      var didWarnAboutDirectlyAssigningPropsToState;
      var didWarnAboutContextTypeAndContextTypes;
      var didWarnAboutInvalidateContextType;
      {
        didWarnAboutStateAssignmentForComponent = new Set();
        didWarnAboutUninitializedState = new Set();
        didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate = new Set();
        didWarnAboutLegacyLifecyclesAndDerivedState = new Set();
        didWarnAboutDirectlyAssigningPropsToState = new Set();
        didWarnAboutUndefinedDerivedState = new Set();
        didWarnAboutContextTypeAndContextTypes = new Set();
        didWarnAboutInvalidateContextType = new Set();
        var didWarnOnInvalidCallback = new Set();

        warnOnInvalidCallback = function warnOnInvalidCallback(callback, callerName) {
          if (callback === null || typeof callback === 'function') {
            return;
          }

          var key = callerName + "_" + callback;

          if (!didWarnOnInvalidCallback.has(key)) {
            didWarnOnInvalidCallback.add(key);
            error('%s(...): Expected the last optional `callback` argument to be a ' + 'function. Instead received: %s.', callerName, callback);
          }
        };

        warnOnUndefinedDerivedState = function warnOnUndefinedDerivedState(type, partialState) {
          if (partialState === undefined) {
            var componentName = getComponentName(type) || 'Component';

            if (!didWarnAboutUndefinedDerivedState.has(componentName)) {
              didWarnAboutUndefinedDerivedState.add(componentName);
              error('%s.getDerivedStateFromProps(): A valid state object (or null) must be returned. ' + 'You have returned undefined.', componentName);
            }
          }
        };

        Object.defineProperty(fakeInternalInstance, '_processChildContext', {
          enumerable: false,
          value: function value() {
            {
              {
                throw Error("_processChildContext is not available in React 16+. This likely means you have multiple copies of React and are attempting to nest a React 15 tree inside a React 16 tree using unstable_renderSubtreeIntoContainer, which isn't supported. Try to make sure you have only one copy of React (and ideally, switch to ReactDOM.createPortal).");
              }
            }
          }
        });
        Object.freeze(fakeInternalInstance);
      }

      function applyDerivedStateFromProps(workInProgress, ctor, getDerivedStateFromProps, nextProps) {
        var prevState = workInProgress.memoizedState;
        {
          if (workInProgress.mode & StrictMode) {
            getDerivedStateFromProps(nextProps, prevState);
          }
        }
        var partialState = getDerivedStateFromProps(nextProps, prevState);
        {
          warnOnUndefinedDerivedState(ctor, partialState);
        }
        var memoizedState = partialState === null || partialState === undefined ? prevState : _assign({}, prevState, partialState);
        workInProgress.memoizedState = memoizedState;

        if (workInProgress.expirationTime === NoWork) {
          var updateQueue = workInProgress.updateQueue;
          updateQueue.baseState = memoizedState;
        }
      }

      var classComponentUpdater = {
        isMounted: isMounted,
        enqueueSetState: function enqueueSetState(inst, payload, callback) {
          var fiber = get(inst);
          var currentTime = requestCurrentTimeForUpdate();
          var suspenseConfig = requestCurrentSuspenseConfig();
          var expirationTime = computeExpirationForFiber(currentTime, fiber, suspenseConfig);
          var update = createUpdate(expirationTime, suspenseConfig);
          update.payload = payload;

          if (callback !== undefined && callback !== null) {
            {
              warnOnInvalidCallback(callback, 'setState');
            }
            update.callback = callback;
          }

          enqueueUpdate(fiber, update);
          scheduleWork(fiber, expirationTime);
        },
        enqueueReplaceState: function enqueueReplaceState(inst, payload, callback) {
          var fiber = get(inst);
          var currentTime = requestCurrentTimeForUpdate();
          var suspenseConfig = requestCurrentSuspenseConfig();
          var expirationTime = computeExpirationForFiber(currentTime, fiber, suspenseConfig);
          var update = createUpdate(expirationTime, suspenseConfig);
          update.tag = ReplaceState;
          update.payload = payload;

          if (callback !== undefined && callback !== null) {
            {
              warnOnInvalidCallback(callback, 'replaceState');
            }
            update.callback = callback;
          }

          enqueueUpdate(fiber, update);
          scheduleWork(fiber, expirationTime);
        },
        enqueueForceUpdate: function enqueueForceUpdate(inst, callback) {
          var fiber = get(inst);
          var currentTime = requestCurrentTimeForUpdate();
          var suspenseConfig = requestCurrentSuspenseConfig();
          var expirationTime = computeExpirationForFiber(currentTime, fiber, suspenseConfig);
          var update = createUpdate(expirationTime, suspenseConfig);
          update.tag = ForceUpdate;

          if (callback !== undefined && callback !== null) {
            {
              warnOnInvalidCallback(callback, 'forceUpdate');
            }
            update.callback = callback;
          }

          enqueueUpdate(fiber, update);
          scheduleWork(fiber, expirationTime);
        }
      };

      function checkShouldComponentUpdate(workInProgress, ctor, oldProps, newProps, oldState, newState, nextContext) {
        var instance = workInProgress.stateNode;

        if (typeof instance.shouldComponentUpdate === 'function') {
          {
            if (workInProgress.mode & StrictMode) {
              instance.shouldComponentUpdate(newProps, newState, nextContext);
            }
          }
          startPhaseTimer(workInProgress, 'shouldComponentUpdate');
          var shouldUpdate = instance.shouldComponentUpdate(newProps, newState, nextContext);
          stopPhaseTimer();
          {
            if (shouldUpdate === undefined) {
              error('%s.shouldComponentUpdate(): Returned undefined instead of a ' + 'boolean value. Make sure to return true or false.', getComponentName(ctor) || 'Component');
            }
          }
          return shouldUpdate;
        }

        if (ctor.prototype && ctor.prototype.isPureReactComponent) {
          return !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState);
        }

        return true;
      }

      function checkClassInstance(workInProgress, ctor, newProps) {
        var instance = workInProgress.stateNode;
        {
          var name = getComponentName(ctor) || 'Component';
          var renderPresent = instance.render;

          if (!renderPresent) {
            if (ctor.prototype && typeof ctor.prototype.render === 'function') {
              error('%s(...): No `render` method found on the returned component ' + 'instance: did you accidentally return an object from the constructor?', name);
            } else {
              error('%s(...): No `render` method found on the returned component ' + 'instance: you may have forgotten to define `render`.', name);
            }
          }

          if (instance.getInitialState && !instance.getInitialState.isReactClassApproved && !instance.state) {
            error('getInitialState was defined on %s, a plain JavaScript class. ' + 'This is only supported for classes created using React.createClass. ' + 'Did you mean to define a state property instead?', name);
          }

          if (instance.getDefaultProps && !instance.getDefaultProps.isReactClassApproved) {
            error('getDefaultProps was defined on %s, a plain JavaScript class. ' + 'This is only supported for classes created using React.createClass. ' + 'Use a static property to define defaultProps instead.', name);
          }

          if (instance.propTypes) {
            error('propTypes was defined as an instance property on %s. Use a static ' + 'property to define propTypes instead.', name);
          }

          if (instance.contextType) {
            error('contextType was defined as an instance property on %s. Use a static ' + 'property to define contextType instead.', name);
          }

          {
            if (instance.contextTypes) {
              error('contextTypes was defined as an instance property on %s. Use a static ' + 'property to define contextTypes instead.', name);
            }

            if (ctor.contextType && ctor.contextTypes && !didWarnAboutContextTypeAndContextTypes.has(ctor)) {
              didWarnAboutContextTypeAndContextTypes.add(ctor);
              error('%s declares both contextTypes and contextType static properties. ' + 'The legacy contextTypes property will be ignored.', name);
            }
          }

          if (typeof instance.componentShouldUpdate === 'function') {
            error('%s has a method called ' + 'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' + 'The name is phrased as a question because the function is ' + 'expected to return a value.', name);
          }

          if (ctor.prototype && ctor.prototype.isPureReactComponent && typeof instance.shouldComponentUpdate !== 'undefined') {
            error('%s has a method called shouldComponentUpdate(). ' + 'shouldComponentUpdate should not be used when extending React.PureComponent. ' + 'Please extend React.Component if shouldComponentUpdate is used.', getComponentName(ctor) || 'A pure component');
          }

          if (typeof instance.componentDidUnmount === 'function') {
            error('%s has a method called ' + 'componentDidUnmount(). But there is no such lifecycle method. ' + 'Did you mean componentWillUnmount()?', name);
          }

          if (typeof instance.componentDidReceiveProps === 'function') {
            error('%s has a method called ' + 'componentDidReceiveProps(). But there is no such lifecycle method. ' + 'If you meant to update the state in response to changing props, ' + 'use componentWillReceiveProps(). If you meant to fetch data or ' + 'run side-effects or mutations after React has updated the UI, use componentDidUpdate().', name);
          }

          if (typeof instance.componentWillRecieveProps === 'function') {
            error('%s has a method called ' + 'componentWillRecieveProps(). Did you mean componentWillReceiveProps()?', name);
          }

          if (typeof instance.UNSAFE_componentWillRecieveProps === 'function') {
            error('%s has a method called ' + 'UNSAFE_componentWillRecieveProps(). Did you mean UNSAFE_componentWillReceiveProps()?', name);
          }

          var hasMutatedProps = instance.props !== newProps;

          if (instance.props !== undefined && hasMutatedProps) {
            error('%s(...): When calling super() in `%s`, make sure to pass ' + "up the same props that your component's constructor was passed.", name, name);
          }

          if (instance.defaultProps) {
            error('Setting defaultProps as an instance property on %s is not supported and will be ignored.' + ' Instead, define defaultProps as a static property on %s.', name, name);
          }

          if (typeof instance.getSnapshotBeforeUpdate === 'function' && typeof instance.componentDidUpdate !== 'function' && !didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate.has(ctor)) {
            didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate.add(ctor);
            error('%s: getSnapshotBeforeUpdate() should be used with componentDidUpdate(). ' + 'This component defines getSnapshotBeforeUpdate() only.', getComponentName(ctor));
          }

          if (typeof instance.getDerivedStateFromProps === 'function') {
            error('%s: getDerivedStateFromProps() is defined as an instance method ' + 'and will be ignored. Instead, declare it as a static method.', name);
          }

          if (typeof instance.getDerivedStateFromError === 'function') {
            error('%s: getDerivedStateFromError() is defined as an instance method ' + 'and will be ignored. Instead, declare it as a static method.', name);
          }

          if (typeof ctor.getSnapshotBeforeUpdate === 'function') {
            error('%s: getSnapshotBeforeUpdate() is defined as a static method ' + 'and will be ignored. Instead, declare it as an instance method.', name);
          }

          var _state = instance.state;

          if (_state && (typeof _state !== 'object' || isArray(_state))) {
            error('%s.state: must be set to an object or null', name);
          }

          if (typeof instance.getChildContext === 'function' && typeof ctor.childContextTypes !== 'object') {
            error('%s.getChildContext(): childContextTypes must be defined in order to ' + 'use getChildContext().', name);
          }
        }
      }

      function adoptClassInstance(workInProgress, instance) {
        instance.updater = classComponentUpdater;
        workInProgress.stateNode = instance;
        set(instance, workInProgress);
        {
          instance._reactInternalInstance = fakeInternalInstance;
        }
      }

      function constructClassInstance(workInProgress, ctor, props) {
        var isLegacyContextConsumer = false;
        var unmaskedContext = emptyContextObject;
        var context = emptyContextObject;
        var contextType = ctor.contextType;
        {
          if ('contextType' in ctor) {
            var isValid = contextType === null || contextType !== undefined && contextType.$$typeof === REACT_CONTEXT_TYPE && contextType._context === undefined;

            if (!isValid && !didWarnAboutInvalidateContextType.has(ctor)) {
              didWarnAboutInvalidateContextType.add(ctor);
              var addendum = '';

              if (contextType === undefined) {
                addendum = ' However, it is set to undefined. ' + 'This can be caused by a typo or by mixing up named and default imports. ' + 'This can also happen due to a circular dependency, so ' + 'try moving the createContext() call to a separate file.';
              } else if (typeof contextType !== 'object') {
                addendum = ' However, it is set to a ' + typeof contextType + '.';
              } else if (contextType.$$typeof === REACT_PROVIDER_TYPE) {
                addendum = ' Did you accidentally pass the Context.Provider instead?';
              } else if (contextType._context !== undefined) {
                addendum = ' Did you accidentally pass the Context.Consumer instead?';
              } else {
                addendum = ' However, it is set to an object with keys {' + Object.keys(contextType).join(', ') + '}.';
              }

              error('%s defines an invalid contextType. ' + 'contextType should point to the Context object returned by React.createContext().%s', getComponentName(ctor) || 'Component', addendum);
            }
          }
        }

        if (typeof contextType === 'object' && contextType !== null) {
          context = _readContext(contextType);
        } else {
          unmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
          var contextTypes = ctor.contextTypes;
          isLegacyContextConsumer = contextTypes !== null && contextTypes !== undefined;
          context = isLegacyContextConsumer ? getMaskedContext(workInProgress, unmaskedContext) : emptyContextObject;
        }

        {
          if (workInProgress.mode & StrictMode) {
            new ctor(props, context);
          }
        }
        var instance = new ctor(props, context);
        var state = workInProgress.memoizedState = instance.state !== null && instance.state !== undefined ? instance.state : null;
        adoptClassInstance(workInProgress, instance);
        {
          if (typeof ctor.getDerivedStateFromProps === 'function' && state === null) {
            var componentName = getComponentName(ctor) || 'Component';

            if (!didWarnAboutUninitializedState.has(componentName)) {
              didWarnAboutUninitializedState.add(componentName);
              error('`%s` uses `getDerivedStateFromProps` but its initial state is ' + '%s. This is not recommended. Instead, define the initial state by ' + 'assigning an object to `this.state` in the constructor of `%s`. ' + 'This ensures that `getDerivedStateFromProps` arguments have a consistent shape.', componentName, instance.state === null ? 'null' : 'undefined', componentName);
            }
          }

          if (typeof ctor.getDerivedStateFromProps === 'function' || typeof instance.getSnapshotBeforeUpdate === 'function') {
            var foundWillMountName = null;
            var foundWillReceivePropsName = null;
            var foundWillUpdateName = null;

            if (typeof instance.componentWillMount === 'function' && instance.componentWillMount.__suppressDeprecationWarning !== true) {
              foundWillMountName = 'componentWillMount';
            } else if (typeof instance.UNSAFE_componentWillMount === 'function') {
              foundWillMountName = 'UNSAFE_componentWillMount';
            }

            if (typeof instance.componentWillReceiveProps === 'function' && instance.componentWillReceiveProps.__suppressDeprecationWarning !== true) {
              foundWillReceivePropsName = 'componentWillReceiveProps';
            } else if (typeof instance.UNSAFE_componentWillReceiveProps === 'function') {
              foundWillReceivePropsName = 'UNSAFE_componentWillReceiveProps';
            }

            if (typeof instance.componentWillUpdate === 'function' && instance.componentWillUpdate.__suppressDeprecationWarning !== true) {
              foundWillUpdateName = 'componentWillUpdate';
            } else if (typeof instance.UNSAFE_componentWillUpdate === 'function') {
              foundWillUpdateName = 'UNSAFE_componentWillUpdate';
            }

            if (foundWillMountName !== null || foundWillReceivePropsName !== null || foundWillUpdateName !== null) {
              var _componentName = getComponentName(ctor) || 'Component';

              var newApiName = typeof ctor.getDerivedStateFromProps === 'function' ? 'getDerivedStateFromProps()' : 'getSnapshotBeforeUpdate()';

              if (!didWarnAboutLegacyLifecyclesAndDerivedState.has(_componentName)) {
                didWarnAboutLegacyLifecyclesAndDerivedState.add(_componentName);
                error('Unsafe legacy lifecycles will not be called for components using new component APIs.\n\n' + '%s uses %s but also contains the following legacy lifecycles:%s%s%s\n\n' + 'The above lifecycles should be removed. Learn more about this warning here:\n' + 'https://fb.me/react-unsafe-component-lifecycles', _componentName, newApiName, foundWillMountName !== null ? "\n  " + foundWillMountName : '', foundWillReceivePropsName !== null ? "\n  " + foundWillReceivePropsName : '', foundWillUpdateName !== null ? "\n  " + foundWillUpdateName : '');
              }
            }
          }
        }

        if (isLegacyContextConsumer) {
          cacheContext(workInProgress, unmaskedContext, context);
        }

        return instance;
      }

      function callComponentWillMount(workInProgress, instance) {
        startPhaseTimer(workInProgress, 'componentWillMount');
        var oldState = instance.state;

        if (typeof instance.componentWillMount === 'function') {
          instance.componentWillMount();
        }

        if (typeof instance.UNSAFE_componentWillMount === 'function') {
          instance.UNSAFE_componentWillMount();
        }

        stopPhaseTimer();

        if (oldState !== instance.state) {
          {
            error('%s.componentWillMount(): Assigning directly to this.state is ' + "deprecated (except inside a component's " + 'constructor). Use setState instead.', getComponentName(workInProgress.type) || 'Component');
          }
          classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
        }
      }

      function callComponentWillReceiveProps(workInProgress, instance, newProps, nextContext) {
        var oldState = instance.state;
        startPhaseTimer(workInProgress, 'componentWillReceiveProps');

        if (typeof instance.componentWillReceiveProps === 'function') {
          instance.componentWillReceiveProps(newProps, nextContext);
        }

        if (typeof instance.UNSAFE_componentWillReceiveProps === 'function') {
          instance.UNSAFE_componentWillReceiveProps(newProps, nextContext);
        }

        stopPhaseTimer();

        if (instance.state !== oldState) {
          {
            var componentName = getComponentName(workInProgress.type) || 'Component';

            if (!didWarnAboutStateAssignmentForComponent.has(componentName)) {
              didWarnAboutStateAssignmentForComponent.add(componentName);
              error('%s.componentWillReceiveProps(): Assigning directly to ' + "this.state is deprecated (except inside a component's " + 'constructor). Use setState instead.', componentName);
            }
          }
          classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
        }
      }

      function mountClassInstance(workInProgress, ctor, newProps, renderExpirationTime) {
        {
          checkClassInstance(workInProgress, ctor, newProps);
        }
        var instance = workInProgress.stateNode;
        instance.props = newProps;
        instance.state = workInProgress.memoizedState;
        instance.refs = emptyRefsObject;
        initializeUpdateQueue(workInProgress);
        var contextType = ctor.contextType;

        if (typeof contextType === 'object' && contextType !== null) {
          instance.context = _readContext(contextType);
        } else {
          var unmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
          instance.context = getMaskedContext(workInProgress, unmaskedContext);
        }

        {
          if (instance.state === newProps) {
            var componentName = getComponentName(ctor) || 'Component';

            if (!didWarnAboutDirectlyAssigningPropsToState.has(componentName)) {
              didWarnAboutDirectlyAssigningPropsToState.add(componentName);
              error('%s: It is not recommended to assign props directly to state ' + "because updates to props won't be reflected in state. " + 'In most cases, it is better to use props directly.', componentName);
            }
          }

          if (workInProgress.mode & StrictMode) {
            ReactStrictModeWarnings.recordLegacyContextWarning(workInProgress, instance);
          }

          {
            ReactStrictModeWarnings.recordUnsafeLifecycleWarnings(workInProgress, instance);
          }
        }
        processUpdateQueue(workInProgress, newProps, instance, renderExpirationTime);
        instance.state = workInProgress.memoizedState;
        var getDerivedStateFromProps = ctor.getDerivedStateFromProps;

        if (typeof getDerivedStateFromProps === 'function') {
          applyDerivedStateFromProps(workInProgress, ctor, getDerivedStateFromProps, newProps);
          instance.state = workInProgress.memoizedState;
        }

        if (typeof ctor.getDerivedStateFromProps !== 'function' && typeof instance.getSnapshotBeforeUpdate !== 'function' && (typeof instance.UNSAFE_componentWillMount === 'function' || typeof instance.componentWillMount === 'function')) {
          callComponentWillMount(workInProgress, instance);
          processUpdateQueue(workInProgress, newProps, instance, renderExpirationTime);
          instance.state = workInProgress.memoizedState;
        }

        if (typeof instance.componentDidMount === 'function') {
          workInProgress.effectTag |= Update;
        }
      }

      function resumeMountClassInstance(workInProgress, ctor, newProps, renderExpirationTime) {
        var instance = workInProgress.stateNode;
        var oldProps = workInProgress.memoizedProps;
        instance.props = oldProps;
        var oldContext = instance.context;
        var contextType = ctor.contextType;
        var nextContext = emptyContextObject;

        if (typeof contextType === 'object' && contextType !== null) {
          nextContext = _readContext(contextType);
        } else {
          var nextLegacyUnmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
          nextContext = getMaskedContext(workInProgress, nextLegacyUnmaskedContext);
        }

        var getDerivedStateFromProps = ctor.getDerivedStateFromProps;
        var hasNewLifecycles = typeof getDerivedStateFromProps === 'function' || typeof instance.getSnapshotBeforeUpdate === 'function';

        if (!hasNewLifecycles && (typeof instance.UNSAFE_componentWillReceiveProps === 'function' || typeof instance.componentWillReceiveProps === 'function')) {
          if (oldProps !== newProps || oldContext !== nextContext) {
            callComponentWillReceiveProps(workInProgress, instance, newProps, nextContext);
          }
        }

        resetHasForceUpdateBeforeProcessing();
        var oldState = workInProgress.memoizedState;
        var newState = instance.state = oldState;
        processUpdateQueue(workInProgress, newProps, instance, renderExpirationTime);
        newState = workInProgress.memoizedState;

        if (oldProps === newProps && oldState === newState && !hasContextChanged() && !checkHasForceUpdateAfterProcessing()) {
          if (typeof instance.componentDidMount === 'function') {
            workInProgress.effectTag |= Update;
          }

          return false;
        }

        if (typeof getDerivedStateFromProps === 'function') {
          applyDerivedStateFromProps(workInProgress, ctor, getDerivedStateFromProps, newProps);
          newState = workInProgress.memoizedState;
        }

        var shouldUpdate = checkHasForceUpdateAfterProcessing() || checkShouldComponentUpdate(workInProgress, ctor, oldProps, newProps, oldState, newState, nextContext);

        if (shouldUpdate) {
          if (!hasNewLifecycles && (typeof instance.UNSAFE_componentWillMount === 'function' || typeof instance.componentWillMount === 'function')) {
            startPhaseTimer(workInProgress, 'componentWillMount');

            if (typeof instance.componentWillMount === 'function') {
              instance.componentWillMount();
            }

            if (typeof instance.UNSAFE_componentWillMount === 'function') {
              instance.UNSAFE_componentWillMount();
            }

            stopPhaseTimer();
          }

          if (typeof instance.componentDidMount === 'function') {
            workInProgress.effectTag |= Update;
          }
        } else {
          if (typeof instance.componentDidMount === 'function') {
            workInProgress.effectTag |= Update;
          }

          workInProgress.memoizedProps = newProps;
          workInProgress.memoizedState = newState;
        }

        instance.props = newProps;
        instance.state = newState;
        instance.context = nextContext;
        return shouldUpdate;
      }

      function updateClassInstance(current, workInProgress, ctor, newProps, renderExpirationTime) {
        var instance = workInProgress.stateNode;
        cloneUpdateQueue(current, workInProgress);
        var oldProps = workInProgress.memoizedProps;
        instance.props = workInProgress.type === workInProgress.elementType ? oldProps : resolveDefaultProps(workInProgress.type, oldProps);
        var oldContext = instance.context;
        var contextType = ctor.contextType;
        var nextContext = emptyContextObject;

        if (typeof contextType === 'object' && contextType !== null) {
          nextContext = _readContext(contextType);
        } else {
          var nextUnmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
          nextContext = getMaskedContext(workInProgress, nextUnmaskedContext);
        }

        var getDerivedStateFromProps = ctor.getDerivedStateFromProps;
        var hasNewLifecycles = typeof getDerivedStateFromProps === 'function' || typeof instance.getSnapshotBeforeUpdate === 'function';

        if (!hasNewLifecycles && (typeof instance.UNSAFE_componentWillReceiveProps === 'function' || typeof instance.componentWillReceiveProps === 'function')) {
          if (oldProps !== newProps || oldContext !== nextContext) {
            callComponentWillReceiveProps(workInProgress, instance, newProps, nextContext);
          }
        }

        resetHasForceUpdateBeforeProcessing();
        var oldState = workInProgress.memoizedState;
        var newState = instance.state = oldState;
        processUpdateQueue(workInProgress, newProps, instance, renderExpirationTime);
        newState = workInProgress.memoizedState;

        if (oldProps === newProps && oldState === newState && !hasContextChanged() && !checkHasForceUpdateAfterProcessing()) {
          if (typeof instance.componentDidUpdate === 'function') {
            if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
              workInProgress.effectTag |= Update;
            }
          }

          if (typeof instance.getSnapshotBeforeUpdate === 'function') {
            if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
              workInProgress.effectTag |= Snapshot;
            }
          }

          return false;
        }

        if (typeof getDerivedStateFromProps === 'function') {
          applyDerivedStateFromProps(workInProgress, ctor, getDerivedStateFromProps, newProps);
          newState = workInProgress.memoizedState;
        }

        var shouldUpdate = checkHasForceUpdateAfterProcessing() || checkShouldComponentUpdate(workInProgress, ctor, oldProps, newProps, oldState, newState, nextContext);

        if (shouldUpdate) {
          if (!hasNewLifecycles && (typeof instance.UNSAFE_componentWillUpdate === 'function' || typeof instance.componentWillUpdate === 'function')) {
            startPhaseTimer(workInProgress, 'componentWillUpdate');

            if (typeof instance.componentWillUpdate === 'function') {
              instance.componentWillUpdate(newProps, newState, nextContext);
            }

            if (typeof instance.UNSAFE_componentWillUpdate === 'function') {
              instance.UNSAFE_componentWillUpdate(newProps, newState, nextContext);
            }

            stopPhaseTimer();
          }

          if (typeof instance.componentDidUpdate === 'function') {
            workInProgress.effectTag |= Update;
          }

          if (typeof instance.getSnapshotBeforeUpdate === 'function') {
            workInProgress.effectTag |= Snapshot;
          }
        } else {
          if (typeof instance.componentDidUpdate === 'function') {
            if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
              workInProgress.effectTag |= Update;
            }
          }

          if (typeof instance.getSnapshotBeforeUpdate === 'function') {
            if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
              workInProgress.effectTag |= Snapshot;
            }
          }

          workInProgress.memoizedProps = newProps;
          workInProgress.memoizedState = newState;
        }

        instance.props = newProps;
        instance.state = newState;
        instance.context = nextContext;
        return shouldUpdate;
      }

      var didWarnAboutMaps;
      var didWarnAboutGenerators;
      var didWarnAboutStringRefs;
      var ownerHasKeyUseWarning;
      var ownerHasFunctionTypeWarning;

      var warnForMissingKey = function warnForMissingKey(child) {};

      {
        didWarnAboutMaps = false;
        didWarnAboutGenerators = false;
        didWarnAboutStringRefs = {};
        ownerHasKeyUseWarning = {};
        ownerHasFunctionTypeWarning = {};

        warnForMissingKey = function warnForMissingKey(child) {
          if (child === null || typeof child !== 'object') {
            return;
          }

          if (!child._store || child._store.validated || child.key != null) {
            return;
          }

          if (!(typeof child._store === 'object')) {
            {
              throw Error("React Component in warnForMissingKey should have a _store. This error is likely caused by a bug in React. Please file an issue.");
            }
          }

          child._store.validated = true;
          var currentComponentErrorInfo = 'Each child in a list should have a unique ' + '"key" prop. See https://fb.me/react-warning-keys for ' + 'more information.' + getCurrentFiberStackInDev();

          if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
            return;
          }

          ownerHasKeyUseWarning[currentComponentErrorInfo] = true;
          error('Each child in a list should have a unique ' + '"key" prop. See https://fb.me/react-warning-keys for ' + 'more information.');
        };
      }
      var isArray$1 = Array.isArray;

      function coerceRef(returnFiber, current, element) {
        var mixedRef = element.ref;

        if (mixedRef !== null && typeof mixedRef !== 'function' && typeof mixedRef !== 'object') {
          {
            if ((returnFiber.mode & StrictMode || warnAboutStringRefs) && !(element._owner && element._self && element._owner.stateNode !== element._self)) {
              var componentName = getComponentName(returnFiber.type) || 'Component';

              if (!didWarnAboutStringRefs[componentName]) {
                {
                  error('A string ref, "%s", has been found within a strict mode tree. ' + 'String refs are a source of potential bugs and should be avoided. ' + 'We recommend using useRef() or createRef() instead. ' + 'Learn more about using refs safely here: ' + 'https://fb.me/react-strict-mode-string-ref%s', mixedRef, getStackByFiberInDevAndProd(returnFiber));
                }
                didWarnAboutStringRefs[componentName] = true;
              }
            }
          }

          if (element._owner) {
            var owner = element._owner;
            var inst;

            if (owner) {
              var ownerFiber = owner;

              if (!(ownerFiber.tag === ClassComponent)) {
                {
                  throw Error("Function components cannot have string refs. We recommend using useRef() instead. Learn more about using refs safely here: https://fb.me/react-strict-mode-string-ref");
                }
              }

              inst = ownerFiber.stateNode;
            }

            if (!inst) {
              {
                throw Error("Missing owner for string ref " + mixedRef + ". This error is likely caused by a bug in React. Please file an issue.");
              }
            }

            var stringRef = '' + mixedRef;

            if (current !== null && current.ref !== null && typeof current.ref === 'function' && current.ref._stringRef === stringRef) {
              return current.ref;
            }

            var ref = function ref(value) {
              var refs = inst.refs;

              if (refs === emptyRefsObject) {
                refs = inst.refs = {};
              }

              if (value === null) {
                delete refs[stringRef];
              } else {
                refs[stringRef] = value;
              }
            };

            ref._stringRef = stringRef;
            return ref;
          } else {
            if (!(typeof mixedRef === 'string')) {
              {
                throw Error("Expected ref to be a function, a string, an object returned by React.createRef(), or null.");
              }
            }

            if (!element._owner) {
              {
                throw Error("Element ref was specified as a string (" + mixedRef + ") but no owner was set. This could happen for one of the following reasons:\n1. You may be adding a ref to a function component\n2. You may be adding a ref to a component that was not created inside a component's render method\n3. You have multiple copies of React loaded\nSee https://fb.me/react-refs-must-have-owner for more information.");
              }
            }
          }
        }

        return mixedRef;
      }

      function throwOnInvalidObjectType(returnFiber, newChild) {
        if (returnFiber.type !== 'textarea') {
          var addendum = '';
          {
            addendum = ' If you meant to render a collection of children, use an array ' + 'instead.' + getCurrentFiberStackInDev();
          }
          {
            {
              throw Error("Objects are not valid as a React child (found: " + (Object.prototype.toString.call(newChild) === '[object Object]' ? 'object with keys {' + Object.keys(newChild).join(', ') + '}' : newChild) + ")." + addendum);
            }
          }
        }
      }

      function warnOnFunctionType() {
        {
          var currentComponentErrorInfo = 'Functions are not valid as a React child. This may happen if ' + 'you return a Component instead of <Component /> from render. ' + 'Or maybe you meant to call this function rather than return it.' + getCurrentFiberStackInDev();

          if (ownerHasFunctionTypeWarning[currentComponentErrorInfo]) {
            return;
          }

          ownerHasFunctionTypeWarning[currentComponentErrorInfo] = true;
          error('Functions are not valid as a React child. This may happen if ' + 'you return a Component instead of <Component /> from render. ' + 'Or maybe you meant to call this function rather than return it.');
        }
      }

      function ChildReconciler(shouldTrackSideEffects) {
        function deleteChild(returnFiber, childToDelete) {
          if (!shouldTrackSideEffects) {
            return;
          }

          var last = returnFiber.lastEffect;

          if (last !== null) {
            last.nextEffect = childToDelete;
            returnFiber.lastEffect = childToDelete;
          } else {
            returnFiber.firstEffect = returnFiber.lastEffect = childToDelete;
          }

          childToDelete.nextEffect = null;
          childToDelete.effectTag = Deletion;
        }

        function deleteRemainingChildren(returnFiber, currentFirstChild) {
          if (!shouldTrackSideEffects) {
            return null;
          }

          var childToDelete = currentFirstChild;

          while (childToDelete !== null) {
            deleteChild(returnFiber, childToDelete);
            childToDelete = childToDelete.sibling;
          }

          return null;
        }

        function mapRemainingChildren(returnFiber, currentFirstChild) {
          var existingChildren = new Map();
          var existingChild = currentFirstChild;

          while (existingChild !== null) {
            if (existingChild.key !== null) {
              existingChildren.set(existingChild.key, existingChild);
            } else {
              existingChildren.set(existingChild.index, existingChild);
            }

            existingChild = existingChild.sibling;
          }

          return existingChildren;
        }

        function useFiber(fiber, pendingProps) {
          var clone = createWorkInProgress(fiber, pendingProps);
          clone.index = 0;
          clone.sibling = null;
          return clone;
        }

        function placeChild(newFiber, lastPlacedIndex, newIndex) {
          newFiber.index = newIndex;

          if (!shouldTrackSideEffects) {
            return lastPlacedIndex;
          }

          var current = newFiber.alternate;

          if (current !== null) {
            var oldIndex = current.index;

            if (oldIndex < lastPlacedIndex) {
              newFiber.effectTag = Placement;
              return lastPlacedIndex;
            } else {
              return oldIndex;
            }
          } else {
            newFiber.effectTag = Placement;
            return lastPlacedIndex;
          }
        }

        function placeSingleChild(newFiber) {
          if (shouldTrackSideEffects && newFiber.alternate === null) {
            newFiber.effectTag = Placement;
          }

          return newFiber;
        }

        function updateTextNode(returnFiber, current, textContent, expirationTime) {
          if (current === null || current.tag !== HostText) {
            var created = createFiberFromText(textContent, returnFiber.mode, expirationTime);
            created["return"] = returnFiber;
            return created;
          } else {
            var existing = useFiber(current, textContent);
            existing["return"] = returnFiber;
            return existing;
          }
        }

        function updateElement(returnFiber, current, element, expirationTime) {
          if (current !== null) {
            if (current.elementType === element.type || isCompatibleFamilyForHotReloading(current, element)) {
              var existing = useFiber(current, element.props);
              existing.ref = coerceRef(returnFiber, current, element);
              existing["return"] = returnFiber;
              {
                existing._debugSource = element._source;
                existing._debugOwner = element._owner;
              }
              return existing;
            }
          }

          var created = createFiberFromElement(element, returnFiber.mode, expirationTime);
          created.ref = coerceRef(returnFiber, current, element);
          created["return"] = returnFiber;
          return created;
        }

        function updatePortal(returnFiber, current, portal, expirationTime) {
          if (current === null || current.tag !== HostPortal || current.stateNode.containerInfo !== portal.containerInfo || current.stateNode.implementation !== portal.implementation) {
            var created = createFiberFromPortal(portal, returnFiber.mode, expirationTime);
            created["return"] = returnFiber;
            return created;
          } else {
            var existing = useFiber(current, portal.children || []);
            existing["return"] = returnFiber;
            return existing;
          }
        }

        function updateFragment(returnFiber, current, fragment, expirationTime, key) {
          if (current === null || current.tag !== Fragment) {
            var created = createFiberFromFragment(fragment, returnFiber.mode, expirationTime, key);
            created["return"] = returnFiber;
            return created;
          } else {
            var existing = useFiber(current, fragment);
            existing["return"] = returnFiber;
            return existing;
          }
        }

        function createChild(returnFiber, newChild, expirationTime) {
          if (typeof newChild === 'string' || typeof newChild === 'number') {
            var created = createFiberFromText('' + newChild, returnFiber.mode, expirationTime);
            created["return"] = returnFiber;
            return created;
          }

          if (typeof newChild === 'object' && newChild !== null) {
            switch (newChild.$$typeof) {
              case REACT_ELEMENT_TYPE:
                {
                  var _created = createFiberFromElement(newChild, returnFiber.mode, expirationTime);

                  _created.ref = coerceRef(returnFiber, null, newChild);
                  _created["return"] = returnFiber;
                  return _created;
                }

              case REACT_PORTAL_TYPE:
                {
                  var _created2 = createFiberFromPortal(newChild, returnFiber.mode, expirationTime);

                  _created2["return"] = returnFiber;
                  return _created2;
                }
            }

            if (isArray$1(newChild) || getIteratorFn(newChild)) {
              var _created3 = createFiberFromFragment(newChild, returnFiber.mode, expirationTime, null);

              _created3["return"] = returnFiber;
              return _created3;
            }

            throwOnInvalidObjectType(returnFiber, newChild);
          }

          {
            if (typeof newChild === 'function') {
              warnOnFunctionType();
            }
          }
          return null;
        }

        function updateSlot(returnFiber, oldFiber, newChild, expirationTime) {
          var key = oldFiber !== null ? oldFiber.key : null;

          if (typeof newChild === 'string' || typeof newChild === 'number') {
            if (key !== null) {
              return null;
            }

            return updateTextNode(returnFiber, oldFiber, '' + newChild, expirationTime);
          }

          if (typeof newChild === 'object' && newChild !== null) {
            switch (newChild.$$typeof) {
              case REACT_ELEMENT_TYPE:
                {
                  if (newChild.key === key) {
                    if (newChild.type === REACT_FRAGMENT_TYPE) {
                      return updateFragment(returnFiber, oldFiber, newChild.props.children, expirationTime, key);
                    }

                    return updateElement(returnFiber, oldFiber, newChild, expirationTime);
                  } else {
                    return null;
                  }
                }

              case REACT_PORTAL_TYPE:
                {
                  if (newChild.key === key) {
                    return updatePortal(returnFiber, oldFiber, newChild, expirationTime);
                  } else {
                    return null;
                  }
                }
            }

            if (isArray$1(newChild) || getIteratorFn(newChild)) {
              if (key !== null) {
                return null;
              }

              return updateFragment(returnFiber, oldFiber, newChild, expirationTime, null);
            }

            throwOnInvalidObjectType(returnFiber, newChild);
          }

          {
            if (typeof newChild === 'function') {
              warnOnFunctionType();
            }
          }
          return null;
        }

        function updateFromMap(existingChildren, returnFiber, newIdx, newChild, expirationTime) {
          if (typeof newChild === 'string' || typeof newChild === 'number') {
            var matchedFiber = existingChildren.get(newIdx) || null;
            return updateTextNode(returnFiber, matchedFiber, '' + newChild, expirationTime);
          }

          if (typeof newChild === 'object' && newChild !== null) {
            switch (newChild.$$typeof) {
              case REACT_ELEMENT_TYPE:
                {
                  var _matchedFiber = existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null;

                  if (newChild.type === REACT_FRAGMENT_TYPE) {
                    return updateFragment(returnFiber, _matchedFiber, newChild.props.children, expirationTime, newChild.key);
                  }

                  return updateElement(returnFiber, _matchedFiber, newChild, expirationTime);
                }

              case REACT_PORTAL_TYPE:
                {
                  var _matchedFiber2 = existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null;

                  return updatePortal(returnFiber, _matchedFiber2, newChild, expirationTime);
                }
            }

            if (isArray$1(newChild) || getIteratorFn(newChild)) {
              var _matchedFiber3 = existingChildren.get(newIdx) || null;

              return updateFragment(returnFiber, _matchedFiber3, newChild, expirationTime, null);
            }

            throwOnInvalidObjectType(returnFiber, newChild);
          }

          {
            if (typeof newChild === 'function') {
              warnOnFunctionType();
            }
          }
          return null;
        }

        function warnOnInvalidKey(child, knownKeys) {
          {
            if (typeof child !== 'object' || child === null) {
              return knownKeys;
            }

            switch (child.$$typeof) {
              case REACT_ELEMENT_TYPE:
              case REACT_PORTAL_TYPE:
                warnForMissingKey(child);
                var key = child.key;

                if (typeof key !== 'string') {
                  break;
                }

                if (knownKeys === null) {
                  knownKeys = new Set();
                  knownKeys.add(key);
                  break;
                }

                if (!knownKeys.has(key)) {
                  knownKeys.add(key);
                  break;
                }

                error('Encountered two children with the same key, `%s`. ' + 'Keys should be unique so that components maintain their identity ' + 'across updates. Non-unique keys may cause children to be ' + 'duplicated and/or omitted — the behavior is unsupported and ' + 'could change in a future version.', key);
                break;
            }
          }
          return knownKeys;
        }

        function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, expirationTime) {
          {
            var knownKeys = null;

            for (var i = 0; i < newChildren.length; i++) {
              var child = newChildren[i];
              knownKeys = warnOnInvalidKey(child, knownKeys);
            }
          }
          var resultingFirstChild = null;
          var previousNewFiber = null;
          var oldFiber = currentFirstChild;
          var lastPlacedIndex = 0;
          var newIdx = 0;
          var nextOldFiber = null;

          for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
            if (oldFiber.index > newIdx) {
              nextOldFiber = oldFiber;
              oldFiber = null;
            } else {
              nextOldFiber = oldFiber.sibling;
            }

            var newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], expirationTime);

            if (newFiber === null) {
              if (oldFiber === null) {
                oldFiber = nextOldFiber;
              }

              break;
            }

            if (shouldTrackSideEffects) {
              if (oldFiber && newFiber.alternate === null) {
                deleteChild(returnFiber, oldFiber);
              }
            }

            lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);

            if (previousNewFiber === null) {
              resultingFirstChild = newFiber;
            } else {
              previousNewFiber.sibling = newFiber;
            }

            previousNewFiber = newFiber;
            oldFiber = nextOldFiber;
          }

          if (newIdx === newChildren.length) {
            deleteRemainingChildren(returnFiber, oldFiber);
            return resultingFirstChild;
          }

          if (oldFiber === null) {
            for (; newIdx < newChildren.length; newIdx++) {
              var _newFiber = createChild(returnFiber, newChildren[newIdx], expirationTime);

              if (_newFiber === null) {
                continue;
              }

              lastPlacedIndex = placeChild(_newFiber, lastPlacedIndex, newIdx);

              if (previousNewFiber === null) {
                resultingFirstChild = _newFiber;
              } else {
                previousNewFiber.sibling = _newFiber;
              }

              previousNewFiber = _newFiber;
            }

            return resultingFirstChild;
          }

          var existingChildren = mapRemainingChildren(returnFiber, oldFiber);

          for (; newIdx < newChildren.length; newIdx++) {
            var _newFiber2 = updateFromMap(existingChildren, returnFiber, newIdx, newChildren[newIdx], expirationTime);

            if (_newFiber2 !== null) {
              if (shouldTrackSideEffects) {
                if (_newFiber2.alternate !== null) {
                  existingChildren["delete"](_newFiber2.key === null ? newIdx : _newFiber2.key);
                }
              }

              lastPlacedIndex = placeChild(_newFiber2, lastPlacedIndex, newIdx);

              if (previousNewFiber === null) {
                resultingFirstChild = _newFiber2;
              } else {
                previousNewFiber.sibling = _newFiber2;
              }

              previousNewFiber = _newFiber2;
            }
          }

          if (shouldTrackSideEffects) {
            existingChildren.forEach(function (child) {
              return deleteChild(returnFiber, child);
            });
          }

          return resultingFirstChild;
        }

        function reconcileChildrenIterator(returnFiber, currentFirstChild, newChildrenIterable, expirationTime) {
          var iteratorFn = getIteratorFn(newChildrenIterable);

          if (!(typeof iteratorFn === 'function')) {
            {
              throw Error("An object is not an iterable. This error is likely caused by a bug in React. Please file an issue.");
            }
          }

          {
            if (typeof Symbol === 'function' && newChildrenIterable[Symbol.toStringTag] === 'Generator') {
              if (!didWarnAboutGenerators) {
                error('Using Generators as children is unsupported and will likely yield ' + 'unexpected results because enumerating a generator mutates it. ' + 'You may convert it to an array with `Array.from()` or the ' + '`[...spread]` operator before rendering. Keep in mind ' + 'you might need to polyfill these features for older browsers.');
              }

              didWarnAboutGenerators = true;
            }

            if (newChildrenIterable.entries === iteratorFn) {
              if (!didWarnAboutMaps) {
                error('Using Maps as children is unsupported and will likely yield ' + 'unexpected results. Convert it to a sequence/iterable of keyed ' + 'ReactElements instead.');
              }

              didWarnAboutMaps = true;
            }

            var _newChildren = iteratorFn.call(newChildrenIterable);

            if (_newChildren) {
              var knownKeys = null;

              var _step = _newChildren.next();

              for (; !_step.done; _step = _newChildren.next()) {
                var child = _step.value;
                knownKeys = warnOnInvalidKey(child, knownKeys);
              }
            }
          }
          var newChildren = iteratorFn.call(newChildrenIterable);

          if (!(newChildren != null)) {
            {
              throw Error("An iterable object provided no iterator.");
            }
          }

          var resultingFirstChild = null;
          var previousNewFiber = null;
          var oldFiber = currentFirstChild;
          var lastPlacedIndex = 0;
          var newIdx = 0;
          var nextOldFiber = null;
          var step = newChildren.next();

          for (; oldFiber !== null && !step.done; newIdx++, step = newChildren.next()) {
            if (oldFiber.index > newIdx) {
              nextOldFiber = oldFiber;
              oldFiber = null;
            } else {
              nextOldFiber = oldFiber.sibling;
            }

            var newFiber = updateSlot(returnFiber, oldFiber, step.value, expirationTime);

            if (newFiber === null) {
              if (oldFiber === null) {
                oldFiber = nextOldFiber;
              }

              break;
            }

            if (shouldTrackSideEffects) {
              if (oldFiber && newFiber.alternate === null) {
                deleteChild(returnFiber, oldFiber);
              }
            }

            lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);

            if (previousNewFiber === null) {
              resultingFirstChild = newFiber;
            } else {
              previousNewFiber.sibling = newFiber;
            }

            previousNewFiber = newFiber;
            oldFiber = nextOldFiber;
          }

          if (step.done) {
            deleteRemainingChildren(returnFiber, oldFiber);
            return resultingFirstChild;
          }

          if (oldFiber === null) {
            for (; !step.done; newIdx++, step = newChildren.next()) {
              var _newFiber3 = createChild(returnFiber, step.value, expirationTime);

              if (_newFiber3 === null) {
                continue;
              }

              lastPlacedIndex = placeChild(_newFiber3, lastPlacedIndex, newIdx);

              if (previousNewFiber === null) {
                resultingFirstChild = _newFiber3;
              } else {
                previousNewFiber.sibling = _newFiber3;
              }

              previousNewFiber = _newFiber3;
            }

            return resultingFirstChild;
          }

          var existingChildren = mapRemainingChildren(returnFiber, oldFiber);

          for (; !step.done; newIdx++, step = newChildren.next()) {
            var _newFiber4 = updateFromMap(existingChildren, returnFiber, newIdx, step.value, expirationTime);

            if (_newFiber4 !== null) {
              if (shouldTrackSideEffects) {
                if (_newFiber4.alternate !== null) {
                  existingChildren["delete"](_newFiber4.key === null ? newIdx : _newFiber4.key);
                }
              }

              lastPlacedIndex = placeChild(_newFiber4, lastPlacedIndex, newIdx);

              if (previousNewFiber === null) {
                resultingFirstChild = _newFiber4;
              } else {
                previousNewFiber.sibling = _newFiber4;
              }

              previousNewFiber = _newFiber4;
            }
          }

          if (shouldTrackSideEffects) {
            existingChildren.forEach(function (child) {
              return deleteChild(returnFiber, child);
            });
          }

          return resultingFirstChild;
        }

        function reconcileSingleTextNode(returnFiber, currentFirstChild, textContent, expirationTime) {
          if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
            deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
            var existing = useFiber(currentFirstChild, textContent);
            existing["return"] = returnFiber;
            return existing;
          }

          deleteRemainingChildren(returnFiber, currentFirstChild);
          var created = createFiberFromText(textContent, returnFiber.mode, expirationTime);
          created["return"] = returnFiber;
          return created;
        }

        function reconcileSingleElement(returnFiber, currentFirstChild, element, expirationTime) {
          var key = element.key;
          var child = currentFirstChild;

          while (child !== null) {
            if (child.key === key) {
              switch (child.tag) {
                case Fragment:
                  {
                    if (element.type === REACT_FRAGMENT_TYPE) {
                      deleteRemainingChildren(returnFiber, child.sibling);
                      var existing = useFiber(child, element.props.children);
                      existing["return"] = returnFiber;
                      {
                        existing._debugSource = element._source;
                        existing._debugOwner = element._owner;
                      }
                      return existing;
                    }

                    break;
                  }

                case Block:
                default:
                  {
                    if (child.elementType === element.type || isCompatibleFamilyForHotReloading(child, element)) {
                      deleteRemainingChildren(returnFiber, child.sibling);

                      var _existing3 = useFiber(child, element.props);

                      _existing3.ref = coerceRef(returnFiber, child, element);
                      _existing3["return"] = returnFiber;
                      {
                        _existing3._debugSource = element._source;
                        _existing3._debugOwner = element._owner;
                      }
                      return _existing3;
                    }

                    break;
                  }
              }

              deleteRemainingChildren(returnFiber, child);
              break;
            } else {
              deleteChild(returnFiber, child);
            }

            child = child.sibling;
          }

          if (element.type === REACT_FRAGMENT_TYPE) {
            var created = createFiberFromFragment(element.props.children, returnFiber.mode, expirationTime, element.key);
            created["return"] = returnFiber;
            return created;
          } else {
            var _created4 = createFiberFromElement(element, returnFiber.mode, expirationTime);

            _created4.ref = coerceRef(returnFiber, currentFirstChild, element);
            _created4["return"] = returnFiber;
            return _created4;
          }
        }

        function reconcileSinglePortal(returnFiber, currentFirstChild, portal, expirationTime) {
          var key = portal.key;
          var child = currentFirstChild;

          while (child !== null) {
            if (child.key === key) {
              if (child.tag === HostPortal && child.stateNode.containerInfo === portal.containerInfo && child.stateNode.implementation === portal.implementation) {
                deleteRemainingChildren(returnFiber, child.sibling);
                var existing = useFiber(child, portal.children || []);
                existing["return"] = returnFiber;
                return existing;
              } else {
                deleteRemainingChildren(returnFiber, child);
                break;
              }
            } else {
              deleteChild(returnFiber, child);
            }

            child = child.sibling;
          }

          var created = createFiberFromPortal(portal, returnFiber.mode, expirationTime);
          created["return"] = returnFiber;
          return created;
        }

        function reconcileChildFibers(returnFiber, currentFirstChild, newChild, expirationTime) {
          var isUnkeyedTopLevelFragment = typeof newChild === 'object' && newChild !== null && newChild.type === REACT_FRAGMENT_TYPE && newChild.key === null;

          if (isUnkeyedTopLevelFragment) {
            newChild = newChild.props.children;
          }

          var isObject = typeof newChild === 'object' && newChild !== null;

          if (isObject) {
            switch (newChild.$$typeof) {
              case REACT_ELEMENT_TYPE:
                return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild, expirationTime));

              case REACT_PORTAL_TYPE:
                return placeSingleChild(reconcileSinglePortal(returnFiber, currentFirstChild, newChild, expirationTime));
            }
          }

          if (typeof newChild === 'string' || typeof newChild === 'number') {
            return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFirstChild, '' + newChild, expirationTime));
          }

          if (isArray$1(newChild)) {
            return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, expirationTime);
          }

          if (getIteratorFn(newChild)) {
            return reconcileChildrenIterator(returnFiber, currentFirstChild, newChild, expirationTime);
          }

          if (isObject) {
            throwOnInvalidObjectType(returnFiber, newChild);
          }

          {
            if (typeof newChild === 'function') {
              warnOnFunctionType();
            }
          }

          if (typeof newChild === 'undefined' && !isUnkeyedTopLevelFragment) {
            switch (returnFiber.tag) {
              case ClassComponent:
                {
                  {
                    var instance = returnFiber.stateNode;

                    if (instance.render._isMockFunction) {
                      break;
                    }
                  }
                }

              case FunctionComponent:
                {
                  var Component = returnFiber.type;
                  {
                    {
                      throw Error((Component.displayName || Component.name || 'Component') + "(...): Nothing was returned from render. This usually means a return statement is missing. Or, to render nothing, return null.");
                    }
                  }
                }
            }
          }

          return deleteRemainingChildren(returnFiber, currentFirstChild);
        }

        return reconcileChildFibers;
      }

      var reconcileChildFibers = ChildReconciler(true);
      var mountChildFibers = ChildReconciler(false);

      function cloneChildFibers(current, workInProgress) {
        if (!(current === null || workInProgress.child === current.child)) {
          {
            throw Error("Resuming work not yet implemented.");
          }
        }

        if (workInProgress.child === null) {
          return;
        }

        var currentChild = workInProgress.child;
        var newChild = createWorkInProgress(currentChild, currentChild.pendingProps);
        workInProgress.child = newChild;
        newChild["return"] = workInProgress;

        while (currentChild.sibling !== null) {
          currentChild = currentChild.sibling;
          newChild = newChild.sibling = createWorkInProgress(currentChild, currentChild.pendingProps);
          newChild["return"] = workInProgress;
        }

        newChild.sibling = null;
      }

      function resetChildFibers(workInProgress, renderExpirationTime) {
        var child = workInProgress.child;

        while (child !== null) {
          resetWorkInProgress(child, renderExpirationTime);
          child = child.sibling;
        }
      }

      var NO_CONTEXT = {};
      var contextStackCursor$1 = createCursor(NO_CONTEXT);
      var contextFiberStackCursor = createCursor(NO_CONTEXT);
      var rootInstanceStackCursor = createCursor(NO_CONTEXT);

      function requiredContext(c) {
        if (!(c !== NO_CONTEXT)) {
          {
            throw Error("Expected host context to exist. This error is likely caused by a bug in React. Please file an issue.");
          }
        }

        return c;
      }

      function getRootHostContainer() {
        var rootInstance = requiredContext(rootInstanceStackCursor.current);
        return rootInstance;
      }

      function pushHostContainer(fiber, nextRootInstance) {
        push(rootInstanceStackCursor, nextRootInstance, fiber);
        push(contextFiberStackCursor, fiber, fiber);
        push(contextStackCursor$1, NO_CONTEXT, fiber);
        var nextRootContext = getRootHostContext(nextRootInstance);
        pop(contextStackCursor$1, fiber);
        push(contextStackCursor$1, nextRootContext, fiber);
      }

      function popHostContainer(fiber) {
        pop(contextStackCursor$1, fiber);
        pop(contextFiberStackCursor, fiber);
        pop(rootInstanceStackCursor, fiber);
      }

      function getHostContext() {
        var context = requiredContext(contextStackCursor$1.current);
        return context;
      }

      function pushHostContext(fiber) {
        var rootInstance = requiredContext(rootInstanceStackCursor.current);
        var context = requiredContext(contextStackCursor$1.current);
        var nextContext = getChildHostContext(context, fiber.type);

        if (context === nextContext) {
          return;
        }

        push(contextFiberStackCursor, fiber, fiber);
        push(contextStackCursor$1, nextContext, fiber);
      }

      function popHostContext(fiber) {
        if (contextFiberStackCursor.current !== fiber) {
          return;
        }

        pop(contextStackCursor$1, fiber);
        pop(contextFiberStackCursor, fiber);
      }

      var DefaultSuspenseContext = 0;
      var SubtreeSuspenseContextMask = 1;
      var InvisibleParentSuspenseContext = 1;
      var ForceSuspenseFallback = 2;
      var suspenseStackCursor = createCursor(DefaultSuspenseContext);

      function hasSuspenseContext(parentContext, flag) {
        return (parentContext & flag) !== 0;
      }

      function setDefaultShallowSuspenseContext(parentContext) {
        return parentContext & SubtreeSuspenseContextMask;
      }

      function setShallowSuspenseContext(parentContext, shallowContext) {
        return parentContext & SubtreeSuspenseContextMask | shallowContext;
      }

      function addSubtreeSuspenseContext(parentContext, subtreeContext) {
        return parentContext | subtreeContext;
      }

      function pushSuspenseContext(fiber, newContext) {
        push(suspenseStackCursor, newContext, fiber);
      }

      function popSuspenseContext(fiber) {
        pop(suspenseStackCursor, fiber);
      }

      function shouldCaptureSuspense(workInProgress, hasInvisibleParent) {
        var nextState = workInProgress.memoizedState;

        if (nextState !== null) {
          if (nextState.dehydrated !== null) {
            return true;
          }

          return false;
        }

        var props = workInProgress.memoizedProps;

        if (props.fallback === undefined) {
          return false;
        }

        if (props.unstable_avoidThisFallback !== true) {
          return true;
        }

        if (hasInvisibleParent) {
          return false;
        }

        return true;
      }

      function findFirstSuspended(row) {
        var node = row;

        while (node !== null) {
          if (node.tag === SuspenseComponent) {
            var state = node.memoizedState;

            if (state !== null) {
              var dehydrated = state.dehydrated;

              if (dehydrated === null || isSuspenseInstancePending(dehydrated) || isSuspenseInstanceFallback(dehydrated)) {
                return node;
              }
            }
          } else if (node.tag === SuspenseListComponent && node.memoizedProps.revealOrder !== undefined) {
            var didSuspend = (node.effectTag & DidCapture) !== NoEffect;

            if (didSuspend) {
              return node;
            }
          } else if (node.child !== null) {
            node.child["return"] = node;
            node = node.child;
            continue;
          }

          if (node === row) {
            return null;
          }

          while (node.sibling === null) {
            if (node["return"] === null || node["return"] === row) {
              return null;
            }

            node = node["return"];
          }

          node.sibling["return"] = node["return"];
          node = node.sibling;
        }

        return null;
      }

      function createDeprecatedResponderListener(responder, props) {
        var eventResponderListener = {
          responder: responder,
          props: props
        };
        {
          Object.freeze(eventResponderListener);
        }
        return eventResponderListener;
      }

      var HasEffect = 1;
      var Layout = 2;
      var Passive$1 = 4;
      var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher,
          ReactCurrentBatchConfig$1 = ReactSharedInternals.ReactCurrentBatchConfig;
      var didWarnAboutMismatchedHooksForComponent;
      {
        didWarnAboutMismatchedHooksForComponent = new Set();
      }
      var renderExpirationTime = NoWork;
      var currentlyRenderingFiber$1 = null;
      var currentHook = null;
      var workInProgressHook = null;
      var didScheduleRenderPhaseUpdate = false;
      var RE_RENDER_LIMIT = 25;
      var currentHookNameInDev = null;
      var hookTypesDev = null;
      var hookTypesUpdateIndexDev = -1;
      var ignorePreviousDependencies = false;

      function mountHookTypesDev() {
        {
          var hookName = currentHookNameInDev;

          if (hookTypesDev === null) {
            hookTypesDev = [hookName];
          } else {
            hookTypesDev.push(hookName);
          }
        }
      }

      function updateHookTypesDev() {
        {
          var hookName = currentHookNameInDev;

          if (hookTypesDev !== null) {
            hookTypesUpdateIndexDev++;

            if (hookTypesDev[hookTypesUpdateIndexDev] !== hookName) {
              warnOnHookMismatchInDev(hookName);
            }
          }
        }
      }

      function checkDepsAreArrayDev(deps) {
        {
          if (deps !== undefined && deps !== null && !Array.isArray(deps)) {
            error('%s received a final argument that is not an array (instead, received `%s`). When ' + 'specified, the final argument must be an array.', currentHookNameInDev, typeof deps);
          }
        }
      }

      function warnOnHookMismatchInDev(currentHookName) {
        {
          var componentName = getComponentName(currentlyRenderingFiber$1.type);

          if (!didWarnAboutMismatchedHooksForComponent.has(componentName)) {
            didWarnAboutMismatchedHooksForComponent.add(componentName);

            if (hookTypesDev !== null) {
              var table = '';
              var secondColumnStart = 30;

              for (var i = 0; i <= hookTypesUpdateIndexDev; i++) {
                var oldHookName = hookTypesDev[i];
                var newHookName = i === hookTypesUpdateIndexDev ? currentHookName : oldHookName;
                var row = i + 1 + ". " + oldHookName;

                while (row.length < secondColumnStart) {
                  row += ' ';
                }

                row += newHookName + '\n';
                table += row;
              }

              error('React has detected a change in the order of Hooks called by %s. ' + 'This will lead to bugs and errors if not fixed. ' + 'For more information, read the Rules of Hooks: https://fb.me/rules-of-hooks\n\n' + '   Previous render            Next render\n' + '   ------------------------------------------------------\n' + '%s' + '   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n', componentName, table);
            }
          }
        }
      }

      function throwInvalidHookError() {
        {
          {
            throw Error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://fb.me/react-invalid-hook-call for tips about how to debug and fix this problem.");
          }
        }
      }

      function areHookInputsEqual(nextDeps, prevDeps) {
        {
          if (ignorePreviousDependencies) {
            return false;
          }
        }

        if (prevDeps === null) {
          {
            error('%s received a final argument during this render, but not during ' + 'the previous render. Even though the final argument is optional, ' + 'its type cannot change between renders.', currentHookNameInDev);
          }
          return false;
        }

        {
          if (nextDeps.length !== prevDeps.length) {
            error('The final argument passed to %s changed size between renders. The ' + 'order and size of this array must remain constant.\n\n' + 'Previous: %s\n' + 'Incoming: %s', currentHookNameInDev, "[" + prevDeps.join(', ') + "]", "[" + nextDeps.join(', ') + "]");
          }
        }

        for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
          if (objectIs(nextDeps[i], prevDeps[i])) {
            continue;
          }

          return false;
        }

        return true;
      }

      function renderWithHooks(current, workInProgress, Component, props, secondArg, nextRenderExpirationTime) {
        renderExpirationTime = nextRenderExpirationTime;
        currentlyRenderingFiber$1 = workInProgress;
        {
          hookTypesDev = current !== null ? current._debugHookTypes : null;
          hookTypesUpdateIndexDev = -1;
          ignorePreviousDependencies = current !== null && current.type !== workInProgress.type;
        }
        workInProgress.memoizedState = null;
        workInProgress.updateQueue = null;
        workInProgress.expirationTime = NoWork;
        {
          if (current !== null && current.memoizedState !== null) {
            ReactCurrentDispatcher.current = HooksDispatcherOnUpdateInDEV;
          } else if (hookTypesDev !== null) {
            ReactCurrentDispatcher.current = HooksDispatcherOnMountWithHookTypesInDEV;
          } else {
            ReactCurrentDispatcher.current = HooksDispatcherOnMountInDEV;
          }
        }
        var children = Component(props, secondArg);

        if (workInProgress.expirationTime === renderExpirationTime) {
          var numberOfReRenders = 0;

          do {
            workInProgress.expirationTime = NoWork;

            if (!(numberOfReRenders < RE_RENDER_LIMIT)) {
              {
                throw Error("Too many re-renders. React limits the number of renders to prevent an infinite loop.");
              }
            }

            numberOfReRenders += 1;
            {
              ignorePreviousDependencies = false;
            }
            currentHook = null;
            workInProgressHook = null;
            workInProgress.updateQueue = null;
            {
              hookTypesUpdateIndexDev = -1;
            }
            ReactCurrentDispatcher.current = HooksDispatcherOnRerenderInDEV;
            children = Component(props, secondArg);
          } while (workInProgress.expirationTime === renderExpirationTime);
        }

        ReactCurrentDispatcher.current = ContextOnlyDispatcher;
        {
          workInProgress._debugHookTypes = hookTypesDev;
        }
        var didRenderTooFewHooks = currentHook !== null && currentHook.next !== null;
        renderExpirationTime = NoWork;
        currentlyRenderingFiber$1 = null;
        currentHook = null;
        workInProgressHook = null;
        {
          currentHookNameInDev = null;
          hookTypesDev = null;
          hookTypesUpdateIndexDev = -1;
        }
        didScheduleRenderPhaseUpdate = false;

        if (!!didRenderTooFewHooks) {
          {
            throw Error("Rendered fewer hooks than expected. This may be caused by an accidental early return statement.");
          }
        }

        return children;
      }

      function bailoutHooks(current, workInProgress, expirationTime) {
        workInProgress.updateQueue = current.updateQueue;
        workInProgress.effectTag &= ~(Passive | Update);

        if (current.expirationTime <= expirationTime) {
          current.expirationTime = NoWork;
        }
      }

      function resetHooksAfterThrow() {
        ReactCurrentDispatcher.current = ContextOnlyDispatcher;

        if (didScheduleRenderPhaseUpdate) {
          var hook = currentlyRenderingFiber$1.memoizedState;

          while (hook !== null) {
            var queue = hook.queue;

            if (queue !== null) {
              queue.pending = null;
            }

            hook = hook.next;
          }
        }

        renderExpirationTime = NoWork;
        currentlyRenderingFiber$1 = null;
        currentHook = null;
        workInProgressHook = null;
        {
          hookTypesDev = null;
          hookTypesUpdateIndexDev = -1;
          currentHookNameInDev = null;
        }
        didScheduleRenderPhaseUpdate = false;
      }

      function mountWorkInProgressHook() {
        var hook = {
          memoizedState: null,
          baseState: null,
          baseQueue: null,
          queue: null,
          next: null
        };

        if (workInProgressHook === null) {
          currentlyRenderingFiber$1.memoizedState = workInProgressHook = hook;
        } else {
          workInProgressHook = workInProgressHook.next = hook;
        }

        return workInProgressHook;
      }

      function updateWorkInProgressHook() {
        var nextCurrentHook;

        if (currentHook === null) {
          var current = currentlyRenderingFiber$1.alternate;

          if (current !== null) {
            nextCurrentHook = current.memoizedState;
          } else {
            nextCurrentHook = null;
          }
        } else {
          nextCurrentHook = currentHook.next;
        }

        var nextWorkInProgressHook;

        if (workInProgressHook === null) {
          nextWorkInProgressHook = currentlyRenderingFiber$1.memoizedState;
        } else {
          nextWorkInProgressHook = workInProgressHook.next;
        }

        if (nextWorkInProgressHook !== null) {
          workInProgressHook = nextWorkInProgressHook;
          nextWorkInProgressHook = workInProgressHook.next;
          currentHook = nextCurrentHook;
        } else {
          if (!(nextCurrentHook !== null)) {
            {
              throw Error("Rendered more hooks than during the previous render.");
            }
          }

          currentHook = nextCurrentHook;
          var newHook = {
            memoizedState: currentHook.memoizedState,
            baseState: currentHook.baseState,
            baseQueue: currentHook.baseQueue,
            queue: currentHook.queue,
            next: null
          };

          if (workInProgressHook === null) {
            currentlyRenderingFiber$1.memoizedState = workInProgressHook = newHook;
          } else {
            workInProgressHook = workInProgressHook.next = newHook;
          }
        }

        return workInProgressHook;
      }

      function createFunctionComponentUpdateQueue() {
        return {
          lastEffect: null
        };
      }

      function basicStateReducer(state, action) {
        return typeof action === 'function' ? action(state) : action;
      }

      function mountReducer(reducer, initialArg, init) {
        var hook = mountWorkInProgressHook();
        var initialState;

        if (init !== undefined) {
          initialState = init(initialArg);
        } else {
          initialState = initialArg;
        }

        hook.memoizedState = hook.baseState = initialState;
        var queue = hook.queue = {
          pending: null,
          dispatch: null,
          lastRenderedReducer: reducer,
          lastRenderedState: initialState
        };
        var dispatch = queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber$1, queue);
        return [hook.memoizedState, dispatch];
      }

      function updateReducer(reducer, initialArg, init) {
        var hook = updateWorkInProgressHook();
        var queue = hook.queue;

        if (!(queue !== null)) {
          {
            throw Error("Should have a queue. This is likely a bug in React. Please file an issue.");
          }
        }

        queue.lastRenderedReducer = reducer;
        var current = currentHook;
        var baseQueue = current.baseQueue;
        var pendingQueue = queue.pending;

        if (pendingQueue !== null) {
          if (baseQueue !== null) {
            var baseFirst = baseQueue.next;
            var pendingFirst = pendingQueue.next;
            baseQueue.next = pendingFirst;
            pendingQueue.next = baseFirst;
          }

          current.baseQueue = baseQueue = pendingQueue;
          queue.pending = null;
        }

        if (baseQueue !== null) {
          var first = baseQueue.next;
          var newState = current.baseState;
          var newBaseState = null;
          var newBaseQueueFirst = null;
          var newBaseQueueLast = null;
          var update = first;

          do {
            var updateExpirationTime = update.expirationTime;

            if (updateExpirationTime < renderExpirationTime) {
              var clone = {
                expirationTime: update.expirationTime,
                suspenseConfig: update.suspenseConfig,
                action: update.action,
                eagerReducer: update.eagerReducer,
                eagerState: update.eagerState,
                next: null
              };

              if (newBaseQueueLast === null) {
                newBaseQueueFirst = newBaseQueueLast = clone;
                newBaseState = newState;
              } else {
                newBaseQueueLast = newBaseQueueLast.next = clone;
              }

              if (updateExpirationTime > currentlyRenderingFiber$1.expirationTime) {
                currentlyRenderingFiber$1.expirationTime = updateExpirationTime;
                markUnprocessedUpdateTime(updateExpirationTime);
              }
            } else {
              if (newBaseQueueLast !== null) {
                var _clone = {
                  expirationTime: Sync,
                  suspenseConfig: update.suspenseConfig,
                  action: update.action,
                  eagerReducer: update.eagerReducer,
                  eagerState: update.eagerState,
                  next: null
                };
                newBaseQueueLast = newBaseQueueLast.next = _clone;
              }

              markRenderEventTimeAndConfig(updateExpirationTime, update.suspenseConfig);

              if (update.eagerReducer === reducer) {
                newState = update.eagerState;
              } else {
                var action = update.action;
                newState = reducer(newState, action);
              }
            }

            update = update.next;
          } while (update !== null && update !== first);

          if (newBaseQueueLast === null) {
            newBaseState = newState;
          } else {
            newBaseQueueLast.next = newBaseQueueFirst;
          }

          if (!objectIs(newState, hook.memoizedState)) {
            markWorkInProgressReceivedUpdate();
          }

          hook.memoizedState = newState;
          hook.baseState = newBaseState;
          hook.baseQueue = newBaseQueueLast;
          queue.lastRenderedState = newState;
        }

        var dispatch = queue.dispatch;
        return [hook.memoizedState, dispatch];
      }

      function rerenderReducer(reducer, initialArg, init) {
        var hook = updateWorkInProgressHook();
        var queue = hook.queue;

        if (!(queue !== null)) {
          {
            throw Error("Should have a queue. This is likely a bug in React. Please file an issue.");
          }
        }

        queue.lastRenderedReducer = reducer;
        var dispatch = queue.dispatch;
        var lastRenderPhaseUpdate = queue.pending;
        var newState = hook.memoizedState;

        if (lastRenderPhaseUpdate !== null) {
          queue.pending = null;
          var firstRenderPhaseUpdate = lastRenderPhaseUpdate.next;
          var update = firstRenderPhaseUpdate;

          do {
            var action = update.action;
            newState = reducer(newState, action);
            update = update.next;
          } while (update !== firstRenderPhaseUpdate);

          if (!objectIs(newState, hook.memoizedState)) {
            markWorkInProgressReceivedUpdate();
          }

          hook.memoizedState = newState;

          if (hook.baseQueue === null) {
            hook.baseState = newState;
          }

          queue.lastRenderedState = newState;
        }

        return [newState, dispatch];
      }

      function mountState(initialState) {
        var hook = mountWorkInProgressHook();

        if (typeof initialState === 'function') {
          initialState = initialState();
        }

        hook.memoizedState = hook.baseState = initialState;
        var queue = hook.queue = {
          pending: null,
          dispatch: null,
          lastRenderedReducer: basicStateReducer,
          lastRenderedState: initialState
        };
        var dispatch = queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber$1, queue);
        return [hook.memoizedState, dispatch];
      }

      function updateState(initialState) {
        return updateReducer(basicStateReducer);
      }

      function rerenderState(initialState) {
        return rerenderReducer(basicStateReducer);
      }

      function pushEffect(tag, create, destroy, deps) {
        var effect = {
          tag: tag,
          create: create,
          destroy: destroy,
          deps: deps,
          next: null
        };
        var componentUpdateQueue = currentlyRenderingFiber$1.updateQueue;

        if (componentUpdateQueue === null) {
          componentUpdateQueue = createFunctionComponentUpdateQueue();
          currentlyRenderingFiber$1.updateQueue = componentUpdateQueue;
          componentUpdateQueue.lastEffect = effect.next = effect;
        } else {
          var lastEffect = componentUpdateQueue.lastEffect;

          if (lastEffect === null) {
            componentUpdateQueue.lastEffect = effect.next = effect;
          } else {
            var firstEffect = lastEffect.next;
            lastEffect.next = effect;
            effect.next = firstEffect;
            componentUpdateQueue.lastEffect = effect;
          }
        }

        return effect;
      }

      function mountRef(initialValue) {
        var hook = mountWorkInProgressHook();
        var ref = {
          current: initialValue
        };
        {
          Object.seal(ref);
        }
        hook.memoizedState = ref;
        return ref;
      }

      function updateRef(initialValue) {
        var hook = updateWorkInProgressHook();
        return hook.memoizedState;
      }

      function mountEffectImpl(fiberEffectTag, hookEffectTag, create, deps) {
        var hook = mountWorkInProgressHook();
        var nextDeps = deps === undefined ? null : deps;
        currentlyRenderingFiber$1.effectTag |= fiberEffectTag;
        hook.memoizedState = pushEffect(HasEffect | hookEffectTag, create, undefined, nextDeps);
      }

      function updateEffectImpl(fiberEffectTag, hookEffectTag, create, deps) {
        var hook = updateWorkInProgressHook();
        var nextDeps = deps === undefined ? null : deps;
        var destroy = undefined;

        if (currentHook !== null) {
          var prevEffect = currentHook.memoizedState;
          destroy = prevEffect.destroy;

          if (nextDeps !== null) {
            var prevDeps = prevEffect.deps;

            if (areHookInputsEqual(nextDeps, prevDeps)) {
              pushEffect(hookEffectTag, create, destroy, nextDeps);
              return;
            }
          }
        }

        currentlyRenderingFiber$1.effectTag |= fiberEffectTag;
        hook.memoizedState = pushEffect(HasEffect | hookEffectTag, create, destroy, nextDeps);
      }

      function mountEffect(create, deps) {
        {
          if ('undefined' !== typeof jest) {
            warnIfNotCurrentlyActingEffectsInDEV(currentlyRenderingFiber$1);
          }
        }
        return mountEffectImpl(Update | Passive, Passive$1, create, deps);
      }

      function updateEffect(create, deps) {
        {
          if ('undefined' !== typeof jest) {
            warnIfNotCurrentlyActingEffectsInDEV(currentlyRenderingFiber$1);
          }
        }
        return updateEffectImpl(Update | Passive, Passive$1, create, deps);
      }

      function mountLayoutEffect(create, deps) {
        return mountEffectImpl(Update, Layout, create, deps);
      }

      function updateLayoutEffect(create, deps) {
        return updateEffectImpl(Update, Layout, create, deps);
      }

      function imperativeHandleEffect(create, ref) {
        if (typeof ref === 'function') {
          var refCallback = ref;

          var _inst = create();

          refCallback(_inst);
          return function () {
            refCallback(null);
          };
        } else if (ref !== null && ref !== undefined) {
          var refObject = ref;
          {
            if (!refObject.hasOwnProperty('current')) {
              error('Expected useImperativeHandle() first argument to either be a ' + 'ref callback or React.createRef() object. Instead received: %s.', 'an object with keys {' + Object.keys(refObject).join(', ') + '}');
            }
          }

          var _inst2 = create();

          refObject.current = _inst2;
          return function () {
            refObject.current = null;
          };
        }
      }

      function mountImperativeHandle(ref, create, deps) {
        {
          if (typeof create !== 'function') {
            error('Expected useImperativeHandle() second argument to be a function ' + 'that creates a handle. Instead received: %s.', create !== null ? typeof create : 'null');
          }
        }
        var effectDeps = deps !== null && deps !== undefined ? deps.concat([ref]) : null;
        return mountEffectImpl(Update, Layout, imperativeHandleEffect.bind(null, create, ref), effectDeps);
      }

      function updateImperativeHandle(ref, create, deps) {
        {
          if (typeof create !== 'function') {
            error('Expected useImperativeHandle() second argument to be a function ' + 'that creates a handle. Instead received: %s.', create !== null ? typeof create : 'null');
          }
        }
        var effectDeps = deps !== null && deps !== undefined ? deps.concat([ref]) : null;
        return updateEffectImpl(Update, Layout, imperativeHandleEffect.bind(null, create, ref), effectDeps);
      }

      function mountDebugValue(value, formatterFn) {}

      var updateDebugValue = mountDebugValue;

      function mountCallback(callback, deps) {
        var hook = mountWorkInProgressHook();
        var nextDeps = deps === undefined ? null : deps;
        hook.memoizedState = [callback, nextDeps];
        return callback;
      }

      function updateCallback(callback, deps) {
        var hook = updateWorkInProgressHook();
        var nextDeps = deps === undefined ? null : deps;
        var prevState = hook.memoizedState;

        if (prevState !== null) {
          if (nextDeps !== null) {
            var prevDeps = prevState[1];

            if (areHookInputsEqual(nextDeps, prevDeps)) {
              return prevState[0];
            }
          }
        }

        hook.memoizedState = [callback, nextDeps];
        return callback;
      }

      function mountMemo(nextCreate, deps) {
        var hook = mountWorkInProgressHook();
        var nextDeps = deps === undefined ? null : deps;
        var nextValue = nextCreate();
        hook.memoizedState = [nextValue, nextDeps];
        return nextValue;
      }

      function updateMemo(nextCreate, deps) {
        var hook = updateWorkInProgressHook();
        var nextDeps = deps === undefined ? null : deps;
        var prevState = hook.memoizedState;

        if (prevState !== null) {
          if (nextDeps !== null) {
            var prevDeps = prevState[1];

            if (areHookInputsEqual(nextDeps, prevDeps)) {
              return prevState[0];
            }
          }
        }

        var nextValue = nextCreate();
        hook.memoizedState = [nextValue, nextDeps];
        return nextValue;
      }

      function mountDeferredValue(value, config) {
        var _mountState = mountState(value),
            prevValue = _mountState[0],
            setValue = _mountState[1];

        mountEffect(function () {
          var previousConfig = ReactCurrentBatchConfig$1.suspense;
          ReactCurrentBatchConfig$1.suspense = config === undefined ? null : config;

          try {
            setValue(value);
          } finally {
            ReactCurrentBatchConfig$1.suspense = previousConfig;
          }
        }, [value, config]);
        return prevValue;
      }

      function updateDeferredValue(value, config) {
        var _updateState = updateState(),
            prevValue = _updateState[0],
            setValue = _updateState[1];

        updateEffect(function () {
          var previousConfig = ReactCurrentBatchConfig$1.suspense;
          ReactCurrentBatchConfig$1.suspense = config === undefined ? null : config;

          try {
            setValue(value);
          } finally {
            ReactCurrentBatchConfig$1.suspense = previousConfig;
          }
        }, [value, config]);
        return prevValue;
      }

      function rerenderDeferredValue(value, config) {
        var _rerenderState = rerenderState(),
            prevValue = _rerenderState[0],
            setValue = _rerenderState[1];

        updateEffect(function () {
          var previousConfig = ReactCurrentBatchConfig$1.suspense;
          ReactCurrentBatchConfig$1.suspense = config === undefined ? null : config;

          try {
            setValue(value);
          } finally {
            ReactCurrentBatchConfig$1.suspense = previousConfig;
          }
        }, [value, config]);
        return prevValue;
      }

      function startTransition(setPending, config, callback) {
        var priorityLevel = getCurrentPriorityLevel();
        runWithPriority$1(priorityLevel < UserBlockingPriority$1 ? UserBlockingPriority$1 : priorityLevel, function () {
          setPending(true);
        });
        runWithPriority$1(priorityLevel > NormalPriority ? NormalPriority : priorityLevel, function () {
          var previousConfig = ReactCurrentBatchConfig$1.suspense;
          ReactCurrentBatchConfig$1.suspense = config === undefined ? null : config;

          try {
            setPending(false);
            callback();
          } finally {
            ReactCurrentBatchConfig$1.suspense = previousConfig;
          }
        });
      }

      function mountTransition(config) {
        var _mountState2 = mountState(false),
            isPending = _mountState2[0],
            setPending = _mountState2[1];

        var start = mountCallback(startTransition.bind(null, setPending, config), [setPending, config]);
        return [start, isPending];
      }

      function updateTransition(config) {
        var _updateState2 = updateState(),
            isPending = _updateState2[0],
            setPending = _updateState2[1];

        var start = updateCallback(startTransition.bind(null, setPending, config), [setPending, config]);
        return [start, isPending];
      }

      function rerenderTransition(config) {
        var _rerenderState2 = rerenderState(),
            isPending = _rerenderState2[0],
            setPending = _rerenderState2[1];

        var start = updateCallback(startTransition.bind(null, setPending, config), [setPending, config]);
        return [start, isPending];
      }

      function dispatchAction(fiber, queue, action) {
        {
          if (typeof arguments[3] === 'function') {
            error("State updates from the useState() and useReducer() Hooks don't support the " + 'second callback argument. To execute a side effect after ' + 'rendering, declare it in the component body with useEffect().');
          }
        }
        var currentTime = requestCurrentTimeForUpdate();
        var suspenseConfig = requestCurrentSuspenseConfig();
        var expirationTime = computeExpirationForFiber(currentTime, fiber, suspenseConfig);
        var update = {
          expirationTime: expirationTime,
          suspenseConfig: suspenseConfig,
          action: action,
          eagerReducer: null,
          eagerState: null,
          next: null
        };
        {
          update.priority = getCurrentPriorityLevel();
        }
        var pending = queue.pending;

        if (pending === null) {
          update.next = update;
        } else {
          update.next = pending.next;
          pending.next = update;
        }

        queue.pending = update;
        var alternate = fiber.alternate;

        if (fiber === currentlyRenderingFiber$1 || alternate !== null && alternate === currentlyRenderingFiber$1) {
          didScheduleRenderPhaseUpdate = true;
          update.expirationTime = renderExpirationTime;
          currentlyRenderingFiber$1.expirationTime = renderExpirationTime;
        } else {
          if (fiber.expirationTime === NoWork && (alternate === null || alternate.expirationTime === NoWork)) {
            var lastRenderedReducer = queue.lastRenderedReducer;

            if (lastRenderedReducer !== null) {
              var prevDispatcher;
              {
                prevDispatcher = ReactCurrentDispatcher.current;
                ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
              }

              try {
                var currentState = queue.lastRenderedState;
                var eagerState = lastRenderedReducer(currentState, action);
                update.eagerReducer = lastRenderedReducer;
                update.eagerState = eagerState;

                if (objectIs(eagerState, currentState)) {
                  return;
                }
              } catch (error) {} finally {
                {
                  ReactCurrentDispatcher.current = prevDispatcher;
                }
              }
            }
          }

          {
            if ('undefined' !== typeof jest) {
              warnIfNotScopedWithMatchingAct(fiber);
              warnIfNotCurrentlyActingUpdatesInDev(fiber);
            }
          }
          scheduleWork(fiber, expirationTime);
        }
      }

      var ContextOnlyDispatcher = {
        readContext: _readContext,
        useCallback: throwInvalidHookError,
        useContext: throwInvalidHookError,
        useEffect: throwInvalidHookError,
        useImperativeHandle: throwInvalidHookError,
        useLayoutEffect: throwInvalidHookError,
        useMemo: throwInvalidHookError,
        useReducer: throwInvalidHookError,
        useRef: throwInvalidHookError,
        useState: throwInvalidHookError,
        useDebugValue: throwInvalidHookError,
        useResponder: throwInvalidHookError,
        useDeferredValue: throwInvalidHookError,
        useTransition: throwInvalidHookError
      };
      var HooksDispatcherOnMountInDEV = null;
      var HooksDispatcherOnMountWithHookTypesInDEV = null;
      var HooksDispatcherOnUpdateInDEV = null;
      var HooksDispatcherOnRerenderInDEV = null;
      var InvalidNestedHooksDispatcherOnMountInDEV = null;
      var InvalidNestedHooksDispatcherOnUpdateInDEV = null;
      var InvalidNestedHooksDispatcherOnRerenderInDEV = null;
      {
        var warnInvalidContextAccess = function warnInvalidContextAccess() {
          error('Context can only be read while React is rendering. ' + 'In classes, you can read it in the render method or getDerivedStateFromProps. ' + 'In function components, you can read it directly in the function body, but not ' + 'inside Hooks like useReducer() or useMemo().');
        };

        var warnInvalidHookAccess = function warnInvalidHookAccess() {
          error('Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks. ' + 'You can only call Hooks at the top level of your React function. ' + 'For more information, see ' + 'https://fb.me/rules-of-hooks');
        };

        HooksDispatcherOnMountInDEV = {
          readContext: function readContext(context, observedBits) {
            return _readContext(context, observedBits);
          },
          useCallback: function useCallback(callback, deps) {
            currentHookNameInDev = 'useCallback';
            mountHookTypesDev();
            checkDepsAreArrayDev(deps);
            return mountCallback(callback, deps);
          },
          useContext: function useContext(context, observedBits) {
            currentHookNameInDev = 'useContext';
            mountHookTypesDev();
            return _readContext(context, observedBits);
          },
          useEffect: function useEffect(create, deps) {
            currentHookNameInDev = 'useEffect';
            mountHookTypesDev();
            checkDepsAreArrayDev(deps);
            return mountEffect(create, deps);
          },
          useImperativeHandle: function useImperativeHandle(ref, create, deps) {
            currentHookNameInDev = 'useImperativeHandle';
            mountHookTypesDev();
            checkDepsAreArrayDev(deps);
            return mountImperativeHandle(ref, create, deps);
          },
          useLayoutEffect: function useLayoutEffect(create, deps) {
            currentHookNameInDev = 'useLayoutEffect';
            mountHookTypesDev();
            checkDepsAreArrayDev(deps);
            return mountLayoutEffect(create, deps);
          },
          useMemo: function useMemo(create, deps) {
            currentHookNameInDev = 'useMemo';
            mountHookTypesDev();
            checkDepsAreArrayDev(deps);
            var prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnMountInDEV;

            try {
              return mountMemo(create, deps);
            } finally {
              ReactCurrentDispatcher.current = prevDispatcher;
            }
          },
          useReducer: function useReducer(reducer, initialArg, init) {
            currentHookNameInDev = 'useReducer';
            mountHookTypesDev();
            var prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnMountInDEV;

            try {
              return mountReducer(reducer, initialArg, init);
            } finally {
              ReactCurrentDispatcher.current = prevDispatcher;
            }
          },
          useRef: function useRef(initialValue) {
            currentHookNameInDev = 'useRef';
            mountHookTypesDev();
            return mountRef(initialValue);
          },
          useState: function useState(initialState) {
            currentHookNameInDev = 'useState';
            mountHookTypesDev();
            var prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnMountInDEV;

            try {
              return mountState(initialState);
            } finally {
              ReactCurrentDispatcher.current = prevDispatcher;
            }
          },
          useDebugValue: function useDebugValue(value, formatterFn) {
            currentHookNameInDev = 'useDebugValue';
            mountHookTypesDev();
            return mountDebugValue();
          },
          useResponder: function useResponder(responder, props) {
            currentHookNameInDev = 'useResponder';
            mountHookTypesDev();
            return createDeprecatedResponderListener(responder, props);
          },
          useDeferredValue: function useDeferredValue(value, config) {
            currentHookNameInDev = 'useDeferredValue';
            mountHookTypesDev();
            return mountDeferredValue(value, config);
          },
          useTransition: function useTransition(config) {
            currentHookNameInDev = 'useTransition';
            mountHookTypesDev();
            return mountTransition(config);
          }
        };
        HooksDispatcherOnMountWithHookTypesInDEV = {
          readContext: function readContext(context, observedBits) {
            return _readContext(context, observedBits);
          },
          useCallback: function useCallback(callback, deps) {
            currentHookNameInDev = 'useCallback';
            updateHookTypesDev();
            return mountCallback(callback, deps);
          },
          useContext: function useContext(context, observedBits) {
            currentHookNameInDev = 'useContext';
            updateHookTypesDev();
            return _readContext(context, observedBits);
          },
          useEffect: function useEffect(create, deps) {
            currentHookNameInDev = 'useEffect';
            updateHookTypesDev();
            return mountEffect(create, deps);
          },
          useImperativeHandle: function useImperativeHandle(ref, create, deps) {
            currentHookNameInDev = 'useImperativeHandle';
            updateHookTypesDev();
            return mountImperativeHandle(ref, create, deps);
          },
          useLayoutEffect: function useLayoutEffect(create, deps) {
            currentHookNameInDev = 'useLayoutEffect';
            updateHookTypesDev();
            return mountLayoutEffect(create, deps);
          },
          useMemo: function useMemo(create, deps) {
            currentHookNameInDev = 'useMemo';
            updateHookTypesDev();
            var prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnMountInDEV;

            try {
              return mountMemo(create, deps);
            } finally {
              ReactCurrentDispatcher.current = prevDispatcher;
            }
          },
          useReducer: function useReducer(reducer, initialArg, init) {
            currentHookNameInDev = 'useReducer';
            updateHookTypesDev();
            var prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnMountInDEV;

            try {
              return mountReducer(reducer, initialArg, init);
            } finally {
              ReactCurrentDispatcher.current = prevDispatcher;
            }
          },
          useRef: function useRef(initialValue) {
            currentHookNameInDev = 'useRef';
            updateHookTypesDev();
            return mountRef(initialValue);
          },
          useState: function useState(initialState) {
            currentHookNameInDev = 'useState';
            updateHookTypesDev();
            var prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnMountInDEV;

            try {
              return mountState(initialState);
            } finally {
              ReactCurrentDispatcher.current = prevDispatcher;
            }
          },
          useDebugValue: function useDebugValue(value, formatterFn) {
            currentHookNameInDev = 'useDebugValue';
            updateHookTypesDev();
            return mountDebugValue();
          },
          useResponder: function useResponder(responder, props) {
            currentHookNameInDev = 'useResponder';
            updateHookTypesDev();
            return createDeprecatedResponderListener(responder, props);
          },
          useDeferredValue: function useDeferredValue(value, config) {
            currentHookNameInDev = 'useDeferredValue';
            updateHookTypesDev();
            return mountDeferredValue(value, config);
          },
          useTransition: function useTransition(config) {
            currentHookNameInDev = 'useTransition';
            updateHookTypesDev();
            return mountTransition(config);
          }
        };
        HooksDispatcherOnUpdateInDEV = {
          readContext: function readContext(context, observedBits) {
            return _readContext(context, observedBits);
          },
          useCallback: function useCallback(callback, deps) {
            currentHookNameInDev = 'useCallback';
            updateHookTypesDev();
            return updateCallback(callback, deps);
          },
          useContext: function useContext(context, observedBits) {
            currentHookNameInDev = 'useContext';
            updateHookTypesDev();
            return _readContext(context, observedBits);
          },
          useEffect: function useEffect(create, deps) {
            currentHookNameInDev = 'useEffect';
            updateHookTypesDev();
            return updateEffect(create, deps);
          },
          useImperativeHandle: function useImperativeHandle(ref, create, deps) {
            currentHookNameInDev = 'useImperativeHandle';
            updateHookTypesDev();
            return updateImperativeHandle(ref, create, deps);
          },
          useLayoutEffect: function useLayoutEffect(create, deps) {
            currentHookNameInDev = 'useLayoutEffect';
            updateHookTypesDev();
            return updateLayoutEffect(create, deps);
          },
          useMemo: function useMemo(create, deps) {
            currentHookNameInDev = 'useMemo';
            updateHookTypesDev();
            var prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;

            try {
              return updateMemo(create, deps);
            } finally {
              ReactCurrentDispatcher.current = prevDispatcher;
            }
          },
          useReducer: function useReducer(reducer, initialArg, init) {
            currentHookNameInDev = 'useReducer';
            updateHookTypesDev();
            var prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;

            try {
              return updateReducer(reducer, initialArg, init);
            } finally {
              ReactCurrentDispatcher.current = prevDispatcher;
            }
          },
          useRef: function useRef(initialValue) {
            currentHookNameInDev = 'useRef';
            updateHookTypesDev();
            return updateRef();
          },
          useState: function useState(initialState) {
            currentHookNameInDev = 'useState';
            updateHookTypesDev();
            var prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;

            try {
              return updateState(initialState);
            } finally {
              ReactCurrentDispatcher.current = prevDispatcher;
            }
          },
          useDebugValue: function useDebugValue(value, formatterFn) {
            currentHookNameInDev = 'useDebugValue';
            updateHookTypesDev();
            return updateDebugValue();
          },
          useResponder: function useResponder(responder, props) {
            currentHookNameInDev = 'useResponder';
            updateHookTypesDev();
            return createDeprecatedResponderListener(responder, props);
          },
          useDeferredValue: function useDeferredValue(value, config) {
            currentHookNameInDev = 'useDeferredValue';
            updateHookTypesDev();
            return updateDeferredValue(value, config);
          },
          useTransition: function useTransition(config) {
            currentHookNameInDev = 'useTransition';
            updateHookTypesDev();
            return updateTransition(config);
          }
        };
        HooksDispatcherOnRerenderInDEV = {
          readContext: function readContext(context, observedBits) {
            return _readContext(context, observedBits);
          },
          useCallback: function useCallback(callback, deps) {
            currentHookNameInDev = 'useCallback';
            updateHookTypesDev();
            return updateCallback(callback, deps);
          },
          useContext: function useContext(context, observedBits) {
            currentHookNameInDev = 'useContext';
            updateHookTypesDev();
            return _readContext(context, observedBits);
          },
          useEffect: function useEffect(create, deps) {
            currentHookNameInDev = 'useEffect';
            updateHookTypesDev();
            return updateEffect(create, deps);
          },
          useImperativeHandle: function useImperativeHandle(ref, create, deps) {
            currentHookNameInDev = 'useImperativeHandle';
            updateHookTypesDev();
            return updateImperativeHandle(ref, create, deps);
          },
          useLayoutEffect: function useLayoutEffect(create, deps) {
            currentHookNameInDev = 'useLayoutEffect';
            updateHookTypesDev();
            return updateLayoutEffect(create, deps);
          },
          useMemo: function useMemo(create, deps) {
            currentHookNameInDev = 'useMemo';
            updateHookTypesDev();
            var prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnRerenderInDEV;

            try {
              return updateMemo(create, deps);
            } finally {
              ReactCurrentDispatcher.current = prevDispatcher;
            }
          },
          useReducer: function useReducer(reducer, initialArg, init) {
            currentHookNameInDev = 'useReducer';
            updateHookTypesDev();
            var prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnRerenderInDEV;

            try {
              return rerenderReducer(reducer, initialArg, init);
            } finally {
              ReactCurrentDispatcher.current = prevDispatcher;
            }
          },
          useRef: function useRef(initialValue) {
            currentHookNameInDev = 'useRef';
            updateHookTypesDev();
            return updateRef();
          },
          useState: function useState(initialState) {
            currentHookNameInDev = 'useState';
            updateHookTypesDev();
            var prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnRerenderInDEV;

            try {
              return rerenderState(initialState);
            } finally {
              ReactCurrentDispatcher.current = prevDispatcher;
            }
          },
          useDebugValue: function useDebugValue(value, formatterFn) {
            currentHookNameInDev = 'useDebugValue';
            updateHookTypesDev();
            return updateDebugValue();
          },
          useResponder: function useResponder(responder, props) {
            currentHookNameInDev = 'useResponder';
            updateHookTypesDev();
            return createDeprecatedResponderListener(responder, props);
          },
          useDeferredValue: function useDeferredValue(value, config) {
            currentHookNameInDev = 'useDeferredValue';
            updateHookTypesDev();
            return rerenderDeferredValue(value, config);
          },
          useTransition: function useTransition(config) {
            currentHookNameInDev = 'useTransition';
            updateHookTypesDev();
            return rerenderTransition(config);
          }
        };
        InvalidNestedHooksDispatcherOnMountInDEV = {
          readContext: function readContext(context, observedBits) {
            warnInvalidContextAccess();
            return _readContext(context, observedBits);
          },
          useCallback: function useCallback(callback, deps) {
            currentHookNameInDev = 'useCallback';
            warnInvalidHookAccess();
            mountHookTypesDev();
            return mountCallback(callback, deps);
          },
          useContext: function useContext(context, observedBits) {
            currentHookNameInDev = 'useContext';
            warnInvalidHookAccess();
            mountHookTypesDev();
            return _readContext(context, observedBits);
          },
          useEffect: function useEffect(create, deps) {
            currentHookNameInDev = 'useEffect';
            warnInvalidHookAccess();
            mountHookTypesDev();
            return mountEffect(create, deps);
          },
          useImperativeHandle: function useImperativeHandle(ref, create, deps) {
            currentHookNameInDev = 'useImperativeHandle';
            warnInvalidHookAccess();
            mountHookTypesDev();
            return mountImperativeHandle(ref, create, deps);
          },
          useLayoutEffect: function useLayoutEffect(create, deps) {
            currentHookNameInDev = 'useLayoutEffect';
            warnInvalidHookAccess();
            mountHookTypesDev();
            return mountLayoutEffect(create, deps);
          },
          useMemo: function useMemo(create, deps) {
            currentHookNameInDev = 'useMemo';
            warnInvalidHookAccess();
            mountHookTypesDev();
            var prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnMountInDEV;

            try {
              return mountMemo(create, deps);
            } finally {
              ReactCurrentDispatcher.current = prevDispatcher;
            }
          },
          useReducer: function useReducer(reducer, initialArg, init) {
            currentHookNameInDev = 'useReducer';
            warnInvalidHookAccess();
            mountHookTypesDev();
            var prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnMountInDEV;

            try {
              return mountReducer(reducer, initialArg, init);
            } finally {
              ReactCurrentDispatcher.current = prevDispatcher;
            }
          },
          useRef: function useRef(initialValue) {
            currentHookNameInDev = 'useRef';
            warnInvalidHookAccess();
            mountHookTypesDev();
            return mountRef(initialValue);
          },
          useState: function useState(initialState) {
            currentHookNameInDev = 'useState';
            warnInvalidHookAccess();
            mountHookTypesDev();
            var prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnMountInDEV;

            try {
              return mountState(initialState);
            } finally {
              ReactCurrentDispatcher.current = prevDispatcher;
            }
          },
          useDebugValue: function useDebugValue(value, formatterFn) {
            currentHookNameInDev = 'useDebugValue';
            warnInvalidHookAccess();
            mountHookTypesDev();
            return mountDebugValue();
          },
          useResponder: function useResponder(responder, props) {
            currentHookNameInDev = 'useResponder';
            warnInvalidHookAccess();
            mountHookTypesDev();
            return createDeprecatedResponderListener(responder, props);
          },
          useDeferredValue: function useDeferredValue(value, config) {
            currentHookNameInDev = 'useDeferredValue';
            warnInvalidHookAccess();
            mountHookTypesDev();
            return mountDeferredValue(value, config);
          },
          useTransition: function useTransition(config) {
            currentHookNameInDev = 'useTransition';
            warnInvalidHookAccess();
            mountHookTypesDev();
            return mountTransition(config);
          }
        };
        InvalidNestedHooksDispatcherOnUpdateInDEV = {
          readContext: function readContext(context, observedBits) {
            warnInvalidContextAccess();
            return _readContext(context, observedBits);
          },
          useCallback: function useCallback(callback, deps) {
            currentHookNameInDev = 'useCallback';
            warnInvalidHookAccess();
            updateHookTypesDev();
            return updateCallback(callback, deps);
          },
          useContext: function useContext(context, observedBits) {
            currentHookNameInDev = 'useContext';
            warnInvalidHookAccess();
            updateHookTypesDev();
            return _readContext(context, observedBits);
          },
          useEffect: function useEffect(create, deps) {
            currentHookNameInDev = 'useEffect';
            warnInvalidHookAccess();
            updateHookTypesDev();
            return updateEffect(create, deps);
          },
          useImperativeHandle: function useImperativeHandle(ref, create, deps) {
            currentHookNameInDev = 'useImperativeHandle';
            warnInvalidHookAccess();
            updateHookTypesDev();
            return updateImperativeHandle(ref, create, deps);
          },
          useLayoutEffect: function useLayoutEffect(create, deps) {
            currentHookNameInDev = 'useLayoutEffect';
            warnInvalidHookAccess();
            updateHookTypesDev();
            return updateLayoutEffect(create, deps);
          },
          useMemo: function useMemo(create, deps) {
            currentHookNameInDev = 'useMemo';
            warnInvalidHookAccess();
            updateHookTypesDev();
            var prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;

            try {
              return updateMemo(create, deps);
            } finally {
              ReactCurrentDispatcher.current = prevDispatcher;
            }
          },
          useReducer: function useReducer(reducer, initialArg, init) {
            currentHookNameInDev = 'useReducer';
            warnInvalidHookAccess();
            updateHookTypesDev();
            var prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;

            try {
              return updateReducer(reducer, initialArg, init);
            } finally {
              ReactCurrentDispatcher.current = prevDispatcher;
            }
          },
          useRef: function useRef(initialValue) {
            currentHookNameInDev = 'useRef';
            warnInvalidHookAccess();
            updateHookTypesDev();
            return updateRef();
          },
          useState: function useState(initialState) {
            currentHookNameInDev = 'useState';
            warnInvalidHookAccess();
            updateHookTypesDev();
            var prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;

            try {
              return updateState(initialState);
            } finally {
              ReactCurrentDispatcher.current = prevDispatcher;
            }
          },
          useDebugValue: function useDebugValue(value, formatterFn) {
            currentHookNameInDev = 'useDebugValue';
            warnInvalidHookAccess();
            updateHookTypesDev();
            return updateDebugValue();
          },
          useResponder: function useResponder(responder, props) {
            currentHookNameInDev = 'useResponder';
            warnInvalidHookAccess();
            updateHookTypesDev();
            return createDeprecatedResponderListener(responder, props);
          },
          useDeferredValue: function useDeferredValue(value, config) {
            currentHookNameInDev = 'useDeferredValue';
            warnInvalidHookAccess();
            updateHookTypesDev();
            return updateDeferredValue(value, config);
          },
          useTransition: function useTransition(config) {
            currentHookNameInDev = 'useTransition';
            warnInvalidHookAccess();
            updateHookTypesDev();
            return updateTransition(config);
          }
        };
        InvalidNestedHooksDispatcherOnRerenderInDEV = {
          readContext: function readContext(context, observedBits) {
            warnInvalidContextAccess();
            return _readContext(context, observedBits);
          },
          useCallback: function useCallback(callback, deps) {
            currentHookNameInDev = 'useCallback';
            warnInvalidHookAccess();
            updateHookTypesDev();
            return updateCallback(callback, deps);
          },
          useContext: function useContext(context, observedBits) {
            currentHookNameInDev = 'useContext';
            warnInvalidHookAccess();
            updateHookTypesDev();
            return _readContext(context, observedBits);
          },
          useEffect: function useEffect(create, deps) {
            currentHookNameInDev = 'useEffect';
            warnInvalidHookAccess();
            updateHookTypesDev();
            return updateEffect(create, deps);
          },
          useImperativeHandle: function useImperativeHandle(ref, create, deps) {
            currentHookNameInDev = 'useImperativeHandle';
            warnInvalidHookAccess();
            updateHookTypesDev();
            return updateImperativeHandle(ref, create, deps);
          },
          useLayoutEffect: function useLayoutEffect(create, deps) {
            currentHookNameInDev = 'useLayoutEffect';
            warnInvalidHookAccess();
            updateHookTypesDev();
            return updateLayoutEffect(create, deps);
          },
          useMemo: function useMemo(create, deps) {
            currentHookNameInDev = 'useMemo';
            warnInvalidHookAccess();
            updateHookTypesDev();
            var prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;

            try {
              return updateMemo(create, deps);
            } finally {
              ReactCurrentDispatcher.current = prevDispatcher;
            }
          },
          useReducer: function useReducer(reducer, initialArg, init) {
            currentHookNameInDev = 'useReducer';
            warnInvalidHookAccess();
            updateHookTypesDev();
            var prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;

            try {
              return rerenderReducer(reducer, initialArg, init);
            } finally {
              ReactCurrentDispatcher.current = prevDispatcher;
            }
          },
          useRef: function useRef(initialValue) {
            currentHookNameInDev = 'useRef';
            warnInvalidHookAccess();
            updateHookTypesDev();
            return updateRef();
          },
          useState: function useState(initialState) {
            currentHookNameInDev = 'useState';
            warnInvalidHookAccess();
            updateHookTypesDev();
            var prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;

            try {
              return rerenderState(initialState);
            } finally {
              ReactCurrentDispatcher.current = prevDispatcher;
            }
          },
          useDebugValue: function useDebugValue(value, formatterFn) {
            currentHookNameInDev = 'useDebugValue';
            warnInvalidHookAccess();
            updateHookTypesDev();
            return updateDebugValue();
          },
          useResponder: function useResponder(responder, props) {
            currentHookNameInDev = 'useResponder';
            warnInvalidHookAccess();
            updateHookTypesDev();
            return createDeprecatedResponderListener(responder, props);
          },
          useDeferredValue: function useDeferredValue(value, config) {
            currentHookNameInDev = 'useDeferredValue';
            warnInvalidHookAccess();
            updateHookTypesDev();
            return rerenderDeferredValue(value, config);
          },
          useTransition: function useTransition(config) {
            currentHookNameInDev = 'useTransition';
            warnInvalidHookAccess();
            updateHookTypesDev();
            return rerenderTransition(config);
          }
        };
      }
      var now$1 = Scheduler.unstable_now;
      var commitTime = 0;
      var profilerStartTime = -1;

      function getCommitTime() {
        return commitTime;
      }

      function recordCommitTime() {
        commitTime = now$1();
      }

      function startProfilerTimer(fiber) {
        profilerStartTime = now$1();

        if (fiber.actualStartTime < 0) {
          fiber.actualStartTime = now$1();
        }
      }

      function stopProfilerTimerIfRunning(fiber) {
        profilerStartTime = -1;
      }

      function stopProfilerTimerIfRunningAndRecordDelta(fiber, overrideBaseTime) {
        if (profilerStartTime >= 0) {
          var elapsedTime = now$1() - profilerStartTime;
          fiber.actualDuration += elapsedTime;

          if (overrideBaseTime) {
            fiber.selfBaseDuration = elapsedTime;
          }

          profilerStartTime = -1;
        }
      }

      var hydrationParentFiber = null;
      var nextHydratableInstance = null;
      var isHydrating = false;

      function enterHydrationState(fiber) {
        var parentInstance = fiber.stateNode.containerInfo;
        nextHydratableInstance = getFirstHydratableChild(parentInstance);
        hydrationParentFiber = fiber;
        isHydrating = true;
        return true;
      }

      function deleteHydratableInstance(returnFiber, instance) {
        {
          switch (returnFiber.tag) {
            case HostRoot:
              didNotHydrateContainerInstance(returnFiber.stateNode.containerInfo, instance);
              break;

            case HostComponent:
              didNotHydrateInstance(returnFiber.type, returnFiber.memoizedProps, returnFiber.stateNode, instance);
              break;
          }
        }
        var childToDelete = createFiberFromHostInstanceForDeletion();
        childToDelete.stateNode = instance;
        childToDelete["return"] = returnFiber;
        childToDelete.effectTag = Deletion;

        if (returnFiber.lastEffect !== null) {
          returnFiber.lastEffect.nextEffect = childToDelete;
          returnFiber.lastEffect = childToDelete;
        } else {
          returnFiber.firstEffect = returnFiber.lastEffect = childToDelete;
        }
      }

      function insertNonHydratedInstance(returnFiber, fiber) {
        fiber.effectTag = fiber.effectTag & ~Hydrating | Placement;
        {
          switch (returnFiber.tag) {
            case HostRoot:
              {
                var parentContainer = returnFiber.stateNode.containerInfo;

                switch (fiber.tag) {
                  case HostComponent:
                    var type = fiber.type;
                    didNotFindHydratableContainerInstance(parentContainer, type);
                    break;

                  case HostText:
                    var text = fiber.pendingProps;
                    didNotFindHydratableContainerTextInstance(parentContainer, text);
                    break;
                }

                break;
              }

            case HostComponent:
              {
                var parentType = returnFiber.type;
                var parentProps = returnFiber.memoizedProps;
                var parentInstance = returnFiber.stateNode;

                switch (fiber.tag) {
                  case HostComponent:
                    var _type = fiber.type;
                    didNotFindHydratableInstance(parentType, parentProps, parentInstance, _type);
                    break;

                  case HostText:
                    var _text = fiber.pendingProps;
                    didNotFindHydratableTextInstance(parentType, parentProps, parentInstance, _text);
                    break;
                }

                break;
              }

            default:
              return;
          }
        }
      }

      function tryHydrate(fiber, nextInstance) {
        switch (fiber.tag) {
          case HostComponent:
            {
              var type = fiber.type;
              var instance = canHydrateInstance(nextInstance, type);

              if (instance !== null) {
                fiber.stateNode = instance;
                return true;
              }

              return false;
            }

          case HostText:
            {
              var text = fiber.pendingProps;
              var textInstance = canHydrateTextInstance(nextInstance, text);

              if (textInstance !== null) {
                fiber.stateNode = textInstance;
                return true;
              }

              return false;
            }

          case SuspenseComponent:
            {
              return false;
            }

          default:
            return false;
        }
      }

      function tryToClaimNextHydratableInstance(fiber) {
        if (!isHydrating) {
          return;
        }

        var nextInstance = nextHydratableInstance;

        if (!nextInstance) {
          insertNonHydratedInstance(hydrationParentFiber, fiber);
          isHydrating = false;
          hydrationParentFiber = fiber;
          return;
        }

        var firstAttemptedInstance = nextInstance;

        if (!tryHydrate(fiber, nextInstance)) {
          nextInstance = getNextHydratableSibling(firstAttemptedInstance);

          if (!nextInstance || !tryHydrate(fiber, nextInstance)) {
            insertNonHydratedInstance(hydrationParentFiber, fiber);
            isHydrating = false;
            hydrationParentFiber = fiber;
            return;
          }

          deleteHydratableInstance(hydrationParentFiber, firstAttemptedInstance);
        }

        hydrationParentFiber = fiber;
        nextHydratableInstance = getFirstHydratableChild(nextInstance);
      }

      function prepareToHydrateHostInstance(fiber, rootContainerInstance, hostContext) {
        var instance = fiber.stateNode;
        var updatePayload = hydrateInstance(instance, fiber.type, fiber.memoizedProps, rootContainerInstance, hostContext, fiber);
        fiber.updateQueue = updatePayload;

        if (updatePayload !== null) {
          return true;
        }

        return false;
      }

      function prepareToHydrateHostTextInstance(fiber) {
        var textInstance = fiber.stateNode;
        var textContent = fiber.memoizedProps;
        var shouldUpdate = hydrateTextInstance(textInstance, textContent, fiber);
        {
          if (shouldUpdate) {
            var returnFiber = hydrationParentFiber;

            if (returnFiber !== null) {
              switch (returnFiber.tag) {
                case HostRoot:
                  {
                    var parentContainer = returnFiber.stateNode.containerInfo;
                    didNotMatchHydratedContainerTextInstance(parentContainer, textInstance, textContent);
                    break;
                  }

                case HostComponent:
                  {
                    var parentType = returnFiber.type;
                    var parentProps = returnFiber.memoizedProps;
                    var parentInstance = returnFiber.stateNode;
                    didNotMatchHydratedTextInstance(parentType, parentProps, parentInstance, textInstance, textContent);
                    break;
                  }
              }
            }
          }
        }
        return shouldUpdate;
      }

      function skipPastDehydratedSuspenseInstance(fiber) {
        var suspenseState = fiber.memoizedState;
        var suspenseInstance = suspenseState !== null ? suspenseState.dehydrated : null;

        if (!suspenseInstance) {
          {
            throw Error("Expected to have a hydrated suspense instance. This error is likely caused by a bug in React. Please file an issue.");
          }
        }

        return getNextHydratableInstanceAfterSuspenseInstance(suspenseInstance);
      }

      function popToNextHostParent(fiber) {
        var parent = fiber["return"];

        while (parent !== null && parent.tag !== HostComponent && parent.tag !== HostRoot && parent.tag !== SuspenseComponent) {
          parent = parent["return"];
        }

        hydrationParentFiber = parent;
      }

      function popHydrationState(fiber) {
        if (fiber !== hydrationParentFiber) {
          return false;
        }

        if (!isHydrating) {
          popToNextHostParent(fiber);
          isHydrating = true;
          return false;
        }

        var type = fiber.type;

        if (fiber.tag !== HostComponent || type !== 'head' && type !== 'body' && !shouldSetTextContent(type, fiber.memoizedProps)) {
          var nextInstance = nextHydratableInstance;

          while (nextInstance) {
            deleteHydratableInstance(fiber, nextInstance);
            nextInstance = getNextHydratableSibling(nextInstance);
          }
        }

        popToNextHostParent(fiber);

        if (fiber.tag === SuspenseComponent) {
          nextHydratableInstance = skipPastDehydratedSuspenseInstance(fiber);
        } else {
          nextHydratableInstance = hydrationParentFiber ? getNextHydratableSibling(fiber.stateNode) : null;
        }

        return true;
      }

      function resetHydrationState() {
        hydrationParentFiber = null;
        nextHydratableInstance = null;
        isHydrating = false;
      }

      var ReactCurrentOwner$1 = ReactSharedInternals.ReactCurrentOwner;
      var didReceiveUpdate = false;
      var didWarnAboutBadClass;
      var didWarnAboutModulePatternComponent;
      var didWarnAboutContextTypeOnFunctionComponent;
      var didWarnAboutGetDerivedStateOnFunctionComponent;
      var didWarnAboutFunctionRefs;
      var didWarnAboutReassigningProps;
      var didWarnAboutRevealOrder;
      var didWarnAboutTailOptions;
      {
        didWarnAboutBadClass = {};
        didWarnAboutModulePatternComponent = {};
        didWarnAboutContextTypeOnFunctionComponent = {};
        didWarnAboutGetDerivedStateOnFunctionComponent = {};
        didWarnAboutFunctionRefs = {};
        didWarnAboutReassigningProps = false;
        didWarnAboutRevealOrder = {};
        didWarnAboutTailOptions = {};
      }

      function reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime) {
        if (current === null) {
          workInProgress.child = mountChildFibers(workInProgress, null, nextChildren, renderExpirationTime);
        } else {
          workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren, renderExpirationTime);
        }
      }

      function forceUnmountCurrentAndReconcile(current, workInProgress, nextChildren, renderExpirationTime) {
        workInProgress.child = reconcileChildFibers(workInProgress, current.child, null, renderExpirationTime);
        workInProgress.child = reconcileChildFibers(workInProgress, null, nextChildren, renderExpirationTime);
      }

      function updateForwardRef(current, workInProgress, Component, nextProps, renderExpirationTime) {
        {
          if (workInProgress.type !== workInProgress.elementType) {
            var innerPropTypes = Component.propTypes;

            if (innerPropTypes) {
              checkPropTypes(innerPropTypes, nextProps, 'prop', getComponentName(Component), getCurrentFiberStackInDev);
            }
          }
        }
        var render = Component.render;
        var ref = workInProgress.ref;
        var nextChildren;
        prepareToReadContext(workInProgress, renderExpirationTime);
        {
          ReactCurrentOwner$1.current = workInProgress;
          setIsRendering(true);
          nextChildren = renderWithHooks(current, workInProgress, render, nextProps, ref, renderExpirationTime);

          if (workInProgress.mode & StrictMode) {
            if (workInProgress.memoizedState !== null) {
              nextChildren = renderWithHooks(current, workInProgress, render, nextProps, ref, renderExpirationTime);
            }
          }

          setIsRendering(false);
        }

        if (current !== null && !didReceiveUpdate) {
          bailoutHooks(current, workInProgress, renderExpirationTime);
          return bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime);
        }

        workInProgress.effectTag |= PerformedWork;
        reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime);
        return workInProgress.child;
      }

      function updateMemoComponent(current, workInProgress, Component, nextProps, updateExpirationTime, renderExpirationTime) {
        if (current === null) {
          var type = Component.type;

          if (isSimpleFunctionComponent(type) && Component.compare === null && Component.defaultProps === undefined) {
            var resolvedType = type;
            {
              resolvedType = resolveFunctionForHotReloading(type);
            }
            workInProgress.tag = SimpleMemoComponent;
            workInProgress.type = resolvedType;
            {
              validateFunctionComponentInDev(workInProgress, type);
            }
            return updateSimpleMemoComponent(current, workInProgress, resolvedType, nextProps, updateExpirationTime, renderExpirationTime);
          }

          {
            var innerPropTypes = type.propTypes;

            if (innerPropTypes) {
              checkPropTypes(innerPropTypes, nextProps, 'prop', getComponentName(type), getCurrentFiberStackInDev);
            }
          }
          var child = createFiberFromTypeAndProps(Component.type, null, nextProps, null, workInProgress.mode, renderExpirationTime);
          child.ref = workInProgress.ref;
          child["return"] = workInProgress;
          workInProgress.child = child;
          return child;
        }

        {
          var _type = Component.type;
          var _innerPropTypes = _type.propTypes;

          if (_innerPropTypes) {
            checkPropTypes(_innerPropTypes, nextProps, 'prop', getComponentName(_type), getCurrentFiberStackInDev);
          }
        }
        var currentChild = current.child;

        if (updateExpirationTime < renderExpirationTime) {
          var prevProps = currentChild.memoizedProps;
          var compare = Component.compare;
          compare = compare !== null ? compare : shallowEqual;

          if (compare(prevProps, nextProps) && current.ref === workInProgress.ref) {
            return bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime);
          }
        }

        workInProgress.effectTag |= PerformedWork;
        var newChild = createWorkInProgress(currentChild, nextProps);
        newChild.ref = workInProgress.ref;
        newChild["return"] = workInProgress;
        workInProgress.child = newChild;
        return newChild;
      }

      function updateSimpleMemoComponent(current, workInProgress, Component, nextProps, updateExpirationTime, renderExpirationTime) {
        {
          if (workInProgress.type !== workInProgress.elementType) {
            var outerMemoType = workInProgress.elementType;

            if (outerMemoType.$$typeof === REACT_LAZY_TYPE) {
              outerMemoType = refineResolvedLazyComponent(outerMemoType);
            }

            var outerPropTypes = outerMemoType && outerMemoType.propTypes;

            if (outerPropTypes) {
              checkPropTypes(outerPropTypes, nextProps, 'prop', getComponentName(outerMemoType), getCurrentFiberStackInDev);
            }
          }
        }

        if (current !== null) {
          var prevProps = current.memoizedProps;

          if (shallowEqual(prevProps, nextProps) && current.ref === workInProgress.ref && workInProgress.type === current.type) {
            didReceiveUpdate = false;

            if (updateExpirationTime < renderExpirationTime) {
              workInProgress.expirationTime = current.expirationTime;
              return bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime);
            }
          }
        }

        return updateFunctionComponent(current, workInProgress, Component, nextProps, renderExpirationTime);
      }

      function updateFragment(current, workInProgress, renderExpirationTime) {
        var nextChildren = workInProgress.pendingProps;
        reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime);
        return workInProgress.child;
      }

      function updateMode(current, workInProgress, renderExpirationTime) {
        var nextChildren = workInProgress.pendingProps.children;
        reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime);
        return workInProgress.child;
      }

      function updateProfiler(current, workInProgress, renderExpirationTime) {
        {
          workInProgress.effectTag |= Update;
        }
        var nextProps = workInProgress.pendingProps;
        var nextChildren = nextProps.children;
        reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime);
        return workInProgress.child;
      }

      function markRef(current, workInProgress) {
        var ref = workInProgress.ref;

        if (current === null && ref !== null || current !== null && current.ref !== ref) {
          workInProgress.effectTag |= Ref;
        }
      }

      function updateFunctionComponent(current, workInProgress, Component, nextProps, renderExpirationTime) {
        {
          if (workInProgress.type !== workInProgress.elementType) {
            var innerPropTypes = Component.propTypes;

            if (innerPropTypes) {
              checkPropTypes(innerPropTypes, nextProps, 'prop', getComponentName(Component), getCurrentFiberStackInDev);
            }
          }
        }
        var context;
        {
          var unmaskedContext = getUnmaskedContext(workInProgress, Component, true);
          context = getMaskedContext(workInProgress, unmaskedContext);
        }
        var nextChildren;
        prepareToReadContext(workInProgress, renderExpirationTime);
        {
          ReactCurrentOwner$1.current = workInProgress;
          setIsRendering(true);
          nextChildren = renderWithHooks(current, workInProgress, Component, nextProps, context, renderExpirationTime);

          if (workInProgress.mode & StrictMode) {
            if (workInProgress.memoizedState !== null) {
              nextChildren = renderWithHooks(current, workInProgress, Component, nextProps, context, renderExpirationTime);
            }
          }

          setIsRendering(false);
        }

        if (current !== null && !didReceiveUpdate) {
          bailoutHooks(current, workInProgress, renderExpirationTime);
          return bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime);
        }

        workInProgress.effectTag |= PerformedWork;
        reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime);
        return workInProgress.child;
      }

      function updateClassComponent(current, workInProgress, Component, nextProps, renderExpirationTime) {
        {
          if (workInProgress.type !== workInProgress.elementType) {
            var innerPropTypes = Component.propTypes;

            if (innerPropTypes) {
              checkPropTypes(innerPropTypes, nextProps, 'prop', getComponentName(Component), getCurrentFiberStackInDev);
            }
          }
        }
        var hasContext;

        if (isContextProvider(Component)) {
          hasContext = true;
          pushContextProvider(workInProgress);
        } else {
          hasContext = false;
        }

        prepareToReadContext(workInProgress, renderExpirationTime);
        var instance = workInProgress.stateNode;
        var shouldUpdate;

        if (instance === null) {
          if (current !== null) {
            current.alternate = null;
            workInProgress.alternate = null;
            workInProgress.effectTag |= Placement;
          }

          constructClassInstance(workInProgress, Component, nextProps);
          mountClassInstance(workInProgress, Component, nextProps, renderExpirationTime);
          shouldUpdate = true;
        } else if (current === null) {
          shouldUpdate = resumeMountClassInstance(workInProgress, Component, nextProps, renderExpirationTime);
        } else {
          shouldUpdate = updateClassInstance(current, workInProgress, Component, nextProps, renderExpirationTime);
        }

        var nextUnitOfWork = finishClassComponent(current, workInProgress, Component, shouldUpdate, hasContext, renderExpirationTime);
        {
          var inst = workInProgress.stateNode;

          if (inst.props !== nextProps) {
            if (!didWarnAboutReassigningProps) {
              error('It looks like %s is reassigning its own `this.props` while rendering. ' + 'This is not supported and can lead to confusing bugs.', getComponentName(workInProgress.type) || 'a component');
            }

            didWarnAboutReassigningProps = true;
          }
        }
        return nextUnitOfWork;
      }

      function finishClassComponent(current, workInProgress, Component, shouldUpdate, hasContext, renderExpirationTime) {
        markRef(current, workInProgress);
        var didCaptureError = (workInProgress.effectTag & DidCapture) !== NoEffect;

        if (!shouldUpdate && !didCaptureError) {
          if (hasContext) {
            invalidateContextProvider(workInProgress, Component, false);
          }

          return bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime);
        }

        var instance = workInProgress.stateNode;
        ReactCurrentOwner$1.current = workInProgress;
        var nextChildren;

        if (didCaptureError && typeof Component.getDerivedStateFromError !== 'function') {
          nextChildren = null;
          {
            stopProfilerTimerIfRunning();
          }
        } else {
          {
            setIsRendering(true);
            nextChildren = instance.render();

            if (workInProgress.mode & StrictMode) {
              instance.render();
            }

            setIsRendering(false);
          }
        }

        workInProgress.effectTag |= PerformedWork;

        if (current !== null && didCaptureError) {
          forceUnmountCurrentAndReconcile(current, workInProgress, nextChildren, renderExpirationTime);
        } else {
          reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime);
        }

        workInProgress.memoizedState = instance.state;

        if (hasContext) {
          invalidateContextProvider(workInProgress, Component, true);
        }

        return workInProgress.child;
      }

      function pushHostRootContext(workInProgress) {
        var root = workInProgress.stateNode;

        if (root.pendingContext) {
          pushTopLevelContextObject(workInProgress, root.pendingContext, root.pendingContext !== root.context);
        } else if (root.context) {
          pushTopLevelContextObject(workInProgress, root.context, false);
        }

        pushHostContainer(workInProgress, root.containerInfo);
      }

      function updateHostRoot(current, workInProgress, renderExpirationTime) {
        pushHostRootContext(workInProgress);
        var updateQueue = workInProgress.updateQueue;

        if (!(current !== null && updateQueue !== null)) {
          {
            throw Error("If the root does not have an updateQueue, we should have already bailed out. This error is likely caused by a bug in React. Please file an issue.");
          }
        }

        var nextProps = workInProgress.pendingProps;
        var prevState = workInProgress.memoizedState;
        var prevChildren = prevState !== null ? prevState.element : null;
        cloneUpdateQueue(current, workInProgress);
        processUpdateQueue(workInProgress, nextProps, null, renderExpirationTime);
        var nextState = workInProgress.memoizedState;
        var nextChildren = nextState.element;

        if (nextChildren === prevChildren) {
          resetHydrationState();
          return bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime);
        }

        var root = workInProgress.stateNode;

        if (root.hydrate && enterHydrationState(workInProgress)) {
          var child = mountChildFibers(workInProgress, null, nextChildren, renderExpirationTime);
          workInProgress.child = child;
          var node = child;

          while (node) {
            node.effectTag = node.effectTag & ~Placement | Hydrating;
            node = node.sibling;
          }
        } else {
          reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime);
          resetHydrationState();
        }

        return workInProgress.child;
      }

      function updateHostComponent(current, workInProgress, renderExpirationTime) {
        pushHostContext(workInProgress);

        if (current === null) {
          tryToClaimNextHydratableInstance(workInProgress);
        }

        var type = workInProgress.type;
        var nextProps = workInProgress.pendingProps;
        var prevProps = current !== null ? current.memoizedProps : null;
        var nextChildren = nextProps.children;
        var isDirectTextChild = shouldSetTextContent(type, nextProps);

        if (isDirectTextChild) {
          nextChildren = null;
        } else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
          workInProgress.effectTag |= ContentReset;
        }

        markRef(current, workInProgress);

        if (workInProgress.mode & ConcurrentMode && renderExpirationTime !== Never && shouldDeprioritizeSubtree(type, nextProps)) {
          {
            markSpawnedWork(Never);
          }
          workInProgress.expirationTime = workInProgress.childExpirationTime = Never;
          return null;
        }

        reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime);
        return workInProgress.child;
      }

      function updateHostText(current, workInProgress) {
        if (current === null) {
          tryToClaimNextHydratableInstance(workInProgress);
        }

        return null;
      }

      function mountLazyComponent(_current, workInProgress, elementType, updateExpirationTime, renderExpirationTime) {
        if (_current !== null) {
          _current.alternate = null;
          workInProgress.alternate = null;
          workInProgress.effectTag |= Placement;
        }

        var props = workInProgress.pendingProps;
        cancelWorkTimer(workInProgress);
        var Component = readLazyComponentType(elementType);
        workInProgress.type = Component;
        var resolvedTag = workInProgress.tag = resolveLazyComponentTag(Component);
        startWorkTimer(workInProgress);
        var resolvedProps = resolveDefaultProps(Component, props);
        var child;

        switch (resolvedTag) {
          case FunctionComponent:
            {
              {
                validateFunctionComponentInDev(workInProgress, Component);
                workInProgress.type = Component = resolveFunctionForHotReloading(Component);
              }
              child = updateFunctionComponent(null, workInProgress, Component, resolvedProps, renderExpirationTime);
              return child;
            }

          case ClassComponent:
            {
              {
                workInProgress.type = Component = resolveClassForHotReloading(Component);
              }
              child = updateClassComponent(null, workInProgress, Component, resolvedProps, renderExpirationTime);
              return child;
            }

          case ForwardRef:
            {
              {
                workInProgress.type = Component = resolveForwardRefForHotReloading(Component);
              }
              child = updateForwardRef(null, workInProgress, Component, resolvedProps, renderExpirationTime);
              return child;
            }

          case MemoComponent:
            {
              {
                if (workInProgress.type !== workInProgress.elementType) {
                  var outerPropTypes = Component.propTypes;

                  if (outerPropTypes) {
                    checkPropTypes(outerPropTypes, resolvedProps, 'prop', getComponentName(Component), getCurrentFiberStackInDev);
                  }
                }
              }
              child = updateMemoComponent(null, workInProgress, Component, resolveDefaultProps(Component.type, resolvedProps), updateExpirationTime, renderExpirationTime);
              return child;
            }
        }

        var hint = '';
        {
          if (Component !== null && typeof Component === 'object' && Component.$$typeof === REACT_LAZY_TYPE) {
            hint = ' Did you wrap a component in React.lazy() more than once?';
          }
        }
        {
          {
            throw Error("Element type is invalid. Received a promise that resolves to: " + Component + ". Lazy element type must resolve to a class or function." + hint);
          }
        }
      }

      function mountIncompleteClassComponent(_current, workInProgress, Component, nextProps, renderExpirationTime) {
        if (_current !== null) {
          _current.alternate = null;
          workInProgress.alternate = null;
          workInProgress.effectTag |= Placement;
        }

        workInProgress.tag = ClassComponent;
        var hasContext;

        if (isContextProvider(Component)) {
          hasContext = true;
          pushContextProvider(workInProgress);
        } else {
          hasContext = false;
        }

        prepareToReadContext(workInProgress, renderExpirationTime);
        constructClassInstance(workInProgress, Component, nextProps);
        mountClassInstance(workInProgress, Component, nextProps, renderExpirationTime);
        return finishClassComponent(null, workInProgress, Component, true, hasContext, renderExpirationTime);
      }

      function mountIndeterminateComponent(_current, workInProgress, Component, renderExpirationTime) {
        if (_current !== null) {
          _current.alternate = null;
          workInProgress.alternate = null;
          workInProgress.effectTag |= Placement;
        }

        var props = workInProgress.pendingProps;
        var context;
        {
          var unmaskedContext = getUnmaskedContext(workInProgress, Component, false);
          context = getMaskedContext(workInProgress, unmaskedContext);
        }
        prepareToReadContext(workInProgress, renderExpirationTime);
        var value;
        {
          if (Component.prototype && typeof Component.prototype.render === 'function') {
            var componentName = getComponentName(Component) || 'Unknown';

            if (!didWarnAboutBadClass[componentName]) {
              error("The <%s /> component appears to have a render method, but doesn't extend React.Component. " + 'This is likely to cause errors. Change %s to extend React.Component instead.', componentName, componentName);
              didWarnAboutBadClass[componentName] = true;
            }
          }

          if (workInProgress.mode & StrictMode) {
            ReactStrictModeWarnings.recordLegacyContextWarning(workInProgress, null);
          }

          setIsRendering(true);
          ReactCurrentOwner$1.current = workInProgress;
          value = renderWithHooks(null, workInProgress, Component, props, context, renderExpirationTime);
          setIsRendering(false);
        }
        workInProgress.effectTag |= PerformedWork;

        if (typeof value === 'object' && value !== null && typeof value.render === 'function' && value.$$typeof === undefined) {
          {
            var _componentName = getComponentName(Component) || 'Unknown';

            if (!didWarnAboutModulePatternComponent[_componentName]) {
              error('The <%s /> component appears to be a function component that returns a class instance. ' + 'Change %s to a class that extends React.Component instead. ' + "If you can't use a class try assigning the prototype on the function as a workaround. " + "`%s.prototype = React.Component.prototype`. Don't use an arrow function since it " + 'cannot be called with `new` by React.', _componentName, _componentName, _componentName);
              didWarnAboutModulePatternComponent[_componentName] = true;
            }
          }
          workInProgress.tag = ClassComponent;
          workInProgress.memoizedState = null;
          workInProgress.updateQueue = null;
          var hasContext = false;

          if (isContextProvider(Component)) {
            hasContext = true;
            pushContextProvider(workInProgress);
          } else {
            hasContext = false;
          }

          workInProgress.memoizedState = value.state !== null && value.state !== undefined ? value.state : null;
          initializeUpdateQueue(workInProgress);
          var getDerivedStateFromProps = Component.getDerivedStateFromProps;

          if (typeof getDerivedStateFromProps === 'function') {
            applyDerivedStateFromProps(workInProgress, Component, getDerivedStateFromProps, props);
          }

          adoptClassInstance(workInProgress, value);
          mountClassInstance(workInProgress, Component, props, renderExpirationTime);
          return finishClassComponent(null, workInProgress, Component, true, hasContext, renderExpirationTime);
        } else {
          workInProgress.tag = FunctionComponent;
          {
            if (workInProgress.mode & StrictMode) {
              if (workInProgress.memoizedState !== null) {
                value = renderWithHooks(null, workInProgress, Component, props, context, renderExpirationTime);
              }
            }
          }
          reconcileChildren(null, workInProgress, value, renderExpirationTime);
          {
            validateFunctionComponentInDev(workInProgress, Component);
          }
          return workInProgress.child;
        }
      }

      function validateFunctionComponentInDev(workInProgress, Component) {
        {
          if (Component) {
            if (Component.childContextTypes) {
              error('%s(...): childContextTypes cannot be defined on a function component.', Component.displayName || Component.name || 'Component');
            }
          }

          if (workInProgress.ref !== null) {
            var info = '';
            var ownerName = getCurrentFiberOwnerNameInDevOrNull();

            if (ownerName) {
              info += '\n\nCheck the render method of `' + ownerName + '`.';
            }

            var warningKey = ownerName || workInProgress._debugID || '';
            var debugSource = workInProgress._debugSource;

            if (debugSource) {
              warningKey = debugSource.fileName + ':' + debugSource.lineNumber;
            }

            if (!didWarnAboutFunctionRefs[warningKey]) {
              didWarnAboutFunctionRefs[warningKey] = true;
              error('Function components cannot be given refs. ' + 'Attempts to access this ref will fail. ' + 'Did you mean to use React.forwardRef()?%s', info);
            }
          }

          if (typeof Component.getDerivedStateFromProps === 'function') {
            var _componentName2 = getComponentName(Component) || 'Unknown';

            if (!didWarnAboutGetDerivedStateOnFunctionComponent[_componentName2]) {
              error('%s: Function components do not support getDerivedStateFromProps.', _componentName2);
              didWarnAboutGetDerivedStateOnFunctionComponent[_componentName2] = true;
            }
          }

          if (typeof Component.contextType === 'object' && Component.contextType !== null) {
            var _componentName3 = getComponentName(Component) || 'Unknown';

            if (!didWarnAboutContextTypeOnFunctionComponent[_componentName3]) {
              error('%s: Function components do not support contextType.', _componentName3);
              didWarnAboutContextTypeOnFunctionComponent[_componentName3] = true;
            }
          }
        }
      }

      var SUSPENDED_MARKER = {
        dehydrated: null,
        retryTime: NoWork
      };

      function shouldRemainOnFallback(suspenseContext, current, workInProgress) {
        return hasSuspenseContext(suspenseContext, ForceSuspenseFallback) && (current === null || current.memoizedState !== null);
      }

      function updateSuspenseComponent(current, workInProgress, renderExpirationTime) {
        var mode = workInProgress.mode;
        var nextProps = workInProgress.pendingProps;
        {
          if (shouldSuspend(workInProgress)) {
            workInProgress.effectTag |= DidCapture;
          }
        }
        var suspenseContext = suspenseStackCursor.current;
        var nextDidTimeout = false;
        var didSuspend = (workInProgress.effectTag & DidCapture) !== NoEffect;

        if (didSuspend || shouldRemainOnFallback(suspenseContext, current)) {
          nextDidTimeout = true;
          workInProgress.effectTag &= ~DidCapture;
        } else {
          if (current === null || current.memoizedState !== null) {
            if (nextProps.fallback !== undefined && nextProps.unstable_avoidThisFallback !== true) {
              suspenseContext = addSubtreeSuspenseContext(suspenseContext, InvisibleParentSuspenseContext);
            }
          }
        }

        suspenseContext = setDefaultShallowSuspenseContext(suspenseContext);
        pushSuspenseContext(workInProgress, suspenseContext);

        if (current === null) {
          if (nextProps.fallback !== undefined) {
            tryToClaimNextHydratableInstance(workInProgress);
          }

          if (nextDidTimeout) {
            var nextFallbackChildren = nextProps.fallback;
            var primaryChildFragment = createFiberFromFragment(null, mode, NoWork, null);
            primaryChildFragment["return"] = workInProgress;

            if ((workInProgress.mode & BlockingMode) === NoMode) {
              var progressedState = workInProgress.memoizedState;
              var progressedPrimaryChild = progressedState !== null ? workInProgress.child.child : workInProgress.child;
              primaryChildFragment.child = progressedPrimaryChild;
              var progressedChild = progressedPrimaryChild;

              while (progressedChild !== null) {
                progressedChild["return"] = primaryChildFragment;
                progressedChild = progressedChild.sibling;
              }
            }

            var fallbackChildFragment = createFiberFromFragment(nextFallbackChildren, mode, renderExpirationTime, null);
            fallbackChildFragment["return"] = workInProgress;
            primaryChildFragment.sibling = fallbackChildFragment;
            workInProgress.memoizedState = SUSPENDED_MARKER;
            workInProgress.child = primaryChildFragment;
            return fallbackChildFragment;
          } else {
            var nextPrimaryChildren = nextProps.children;
            workInProgress.memoizedState = null;
            return workInProgress.child = mountChildFibers(workInProgress, null, nextPrimaryChildren, renderExpirationTime);
          }
        } else {
          var prevState = current.memoizedState;

          if (prevState !== null) {
            var currentPrimaryChildFragment = current.child;
            var currentFallbackChildFragment = currentPrimaryChildFragment.sibling;

            if (nextDidTimeout) {
              var _nextFallbackChildren2 = nextProps.fallback;

              var _primaryChildFragment2 = createWorkInProgress(currentPrimaryChildFragment, currentPrimaryChildFragment.pendingProps);

              _primaryChildFragment2["return"] = workInProgress;

              if ((workInProgress.mode & BlockingMode) === NoMode) {
                var _progressedState = workInProgress.memoizedState;

                var _progressedPrimaryChild = _progressedState !== null ? workInProgress.child.child : workInProgress.child;

                if (_progressedPrimaryChild !== currentPrimaryChildFragment.child) {
                  _primaryChildFragment2.child = _progressedPrimaryChild;
                  var _progressedChild2 = _progressedPrimaryChild;

                  while (_progressedChild2 !== null) {
                    _progressedChild2["return"] = _primaryChildFragment2;
                    _progressedChild2 = _progressedChild2.sibling;
                  }
                }
              }

              if (workInProgress.mode & ProfileMode) {
                var _treeBaseDuration = 0;
                var _hiddenChild = _primaryChildFragment2.child;

                while (_hiddenChild !== null) {
                  _treeBaseDuration += _hiddenChild.treeBaseDuration;
                  _hiddenChild = _hiddenChild.sibling;
                }

                _primaryChildFragment2.treeBaseDuration = _treeBaseDuration;
              }

              var _fallbackChildFragment2 = createWorkInProgress(currentFallbackChildFragment, _nextFallbackChildren2);

              _fallbackChildFragment2["return"] = workInProgress;
              _primaryChildFragment2.sibling = _fallbackChildFragment2;
              _primaryChildFragment2.childExpirationTime = NoWork;
              workInProgress.memoizedState = SUSPENDED_MARKER;
              workInProgress.child = _primaryChildFragment2;
              return _fallbackChildFragment2;
            } else {
              var _nextPrimaryChildren = nextProps.children;
              var currentPrimaryChild = currentPrimaryChildFragment.child;
              var primaryChild = reconcileChildFibers(workInProgress, currentPrimaryChild, _nextPrimaryChildren, renderExpirationTime);
              workInProgress.memoizedState = null;
              return workInProgress.child = primaryChild;
            }
          } else {
            var _currentPrimaryChild = current.child;

            if (nextDidTimeout) {
              var _nextFallbackChildren3 = nextProps.fallback;

              var _primaryChildFragment3 = createFiberFromFragment(null, mode, NoWork, null);

              _primaryChildFragment3["return"] = workInProgress;
              _primaryChildFragment3.child = _currentPrimaryChild;

              if (_currentPrimaryChild !== null) {
                _currentPrimaryChild["return"] = _primaryChildFragment3;
              }

              if ((workInProgress.mode & BlockingMode) === NoMode) {
                var _progressedState2 = workInProgress.memoizedState;

                var _progressedPrimaryChild2 = _progressedState2 !== null ? workInProgress.child.child : workInProgress.child;

                _primaryChildFragment3.child = _progressedPrimaryChild2;
                var _progressedChild3 = _progressedPrimaryChild2;

                while (_progressedChild3 !== null) {
                  _progressedChild3["return"] = _primaryChildFragment3;
                  _progressedChild3 = _progressedChild3.sibling;
                }
              }

              if (workInProgress.mode & ProfileMode) {
                var _treeBaseDuration2 = 0;
                var _hiddenChild2 = _primaryChildFragment3.child;

                while (_hiddenChild2 !== null) {
                  _treeBaseDuration2 += _hiddenChild2.treeBaseDuration;
                  _hiddenChild2 = _hiddenChild2.sibling;
                }

                _primaryChildFragment3.treeBaseDuration = _treeBaseDuration2;
              }

              var _fallbackChildFragment3 = createFiberFromFragment(_nextFallbackChildren3, mode, renderExpirationTime, null);

              _fallbackChildFragment3["return"] = workInProgress;
              _primaryChildFragment3.sibling = _fallbackChildFragment3;
              _fallbackChildFragment3.effectTag |= Placement;
              _primaryChildFragment3.childExpirationTime = NoWork;
              workInProgress.memoizedState = SUSPENDED_MARKER;
              workInProgress.child = _primaryChildFragment3;
              return _fallbackChildFragment3;
            } else {
              workInProgress.memoizedState = null;
              var _nextPrimaryChildren2 = nextProps.children;
              return workInProgress.child = reconcileChildFibers(workInProgress, _currentPrimaryChild, _nextPrimaryChildren2, renderExpirationTime);
            }
          }
        }
      }

      function scheduleWorkOnFiber(fiber, renderExpirationTime) {
        if (fiber.expirationTime < renderExpirationTime) {
          fiber.expirationTime = renderExpirationTime;
        }

        var alternate = fiber.alternate;

        if (alternate !== null && alternate.expirationTime < renderExpirationTime) {
          alternate.expirationTime = renderExpirationTime;
        }

        scheduleWorkOnParentPath(fiber["return"], renderExpirationTime);
      }

      function propagateSuspenseContextChange(workInProgress, firstChild, renderExpirationTime) {
        var node = firstChild;

        while (node !== null) {
          if (node.tag === SuspenseComponent) {
            var state = node.memoizedState;

            if (state !== null) {
              scheduleWorkOnFiber(node, renderExpirationTime);
            }
          } else if (node.tag === SuspenseListComponent) {
            scheduleWorkOnFiber(node, renderExpirationTime);
          } else if (node.child !== null) {
            node.child["return"] = node;
            node = node.child;
            continue;
          }

          if (node === workInProgress) {
            return;
          }

          while (node.sibling === null) {
            if (node["return"] === null || node["return"] === workInProgress) {
              return;
            }

            node = node["return"];
          }

          node.sibling["return"] = node["return"];
          node = node.sibling;
        }
      }

      function findLastContentRow(firstChild) {
        var row = firstChild;
        var lastContentRow = null;

        while (row !== null) {
          var currentRow = row.alternate;

          if (currentRow !== null && findFirstSuspended(currentRow) === null) {
            lastContentRow = row;
          }

          row = row.sibling;
        }

        return lastContentRow;
      }

      function validateRevealOrder(revealOrder) {
        {
          if (revealOrder !== undefined && revealOrder !== 'forwards' && revealOrder !== 'backwards' && revealOrder !== 'together' && !didWarnAboutRevealOrder[revealOrder]) {
            didWarnAboutRevealOrder[revealOrder] = true;

            if (typeof revealOrder === 'string') {
              switch (revealOrder.toLowerCase()) {
                case 'together':
                case 'forwards':
                case 'backwards':
                  {
                    error('"%s" is not a valid value for revealOrder on <SuspenseList />. ' + 'Use lowercase "%s" instead.', revealOrder, revealOrder.toLowerCase());
                    break;
                  }

                case 'forward':
                case 'backward':
                  {
                    error('"%s" is not a valid value for revealOrder on <SuspenseList />. ' + 'React uses the -s suffix in the spelling. Use "%ss" instead.', revealOrder, revealOrder.toLowerCase());
                    break;
                  }

                default:
                  error('"%s" is not a supported revealOrder on <SuspenseList />. ' + 'Did you mean "together", "forwards" or "backwards"?', revealOrder);
                  break;
              }
            } else {
              error('%s is not a supported value for revealOrder on <SuspenseList />. ' + 'Did you mean "together", "forwards" or "backwards"?', revealOrder);
            }
          }
        }
      }

      function validateTailOptions(tailMode, revealOrder) {
        {
          if (tailMode !== undefined && !didWarnAboutTailOptions[tailMode]) {
            if (tailMode !== 'collapsed' && tailMode !== 'hidden') {
              didWarnAboutTailOptions[tailMode] = true;
              error('"%s" is not a supported value for tail on <SuspenseList />. ' + 'Did you mean "collapsed" or "hidden"?', tailMode);
            } else if (revealOrder !== 'forwards' && revealOrder !== 'backwards') {
              didWarnAboutTailOptions[tailMode] = true;
              error('<SuspenseList tail="%s" /> is only valid if revealOrder is ' + '"forwards" or "backwards". ' + 'Did you mean to specify revealOrder="forwards"?', tailMode);
            }
          }
        }
      }

      function validateSuspenseListNestedChild(childSlot, index) {
        {
          var isArray = Array.isArray(childSlot);
          var isIterable = !isArray && typeof getIteratorFn(childSlot) === 'function';

          if (isArray || isIterable) {
            var type = isArray ? 'array' : 'iterable';
            error('A nested %s was passed to row #%s in <SuspenseList />. Wrap it in ' + 'an additional SuspenseList to configure its revealOrder: ' + '<SuspenseList revealOrder=...> ... ' + '<SuspenseList revealOrder=...>{%s}</SuspenseList> ... ' + '</SuspenseList>', type, index, type);
            return false;
          }
        }
        return true;
      }

      function validateSuspenseListChildren(children, revealOrder) {
        {
          if ((revealOrder === 'forwards' || revealOrder === 'backwards') && children !== undefined && children !== null && children !== false) {
            if (Array.isArray(children)) {
              for (var i = 0; i < children.length; i++) {
                if (!validateSuspenseListNestedChild(children[i], i)) {
                  return;
                }
              }
            } else {
              var iteratorFn = getIteratorFn(children);

              if (typeof iteratorFn === 'function') {
                var childrenIterator = iteratorFn.call(children);

                if (childrenIterator) {
                  var step = childrenIterator.next();
                  var _i = 0;

                  for (; !step.done; step = childrenIterator.next()) {
                    if (!validateSuspenseListNestedChild(step.value, _i)) {
                      return;
                    }

                    _i++;
                  }
                }
              } else {
                error('A single row was passed to a <SuspenseList revealOrder="%s" />. ' + 'This is not useful since it needs multiple rows. ' + 'Did you mean to pass multiple children or an array?', revealOrder);
              }
            }
          }
        }
      }

      function initSuspenseListRenderState(workInProgress, isBackwards, tail, lastContentRow, tailMode, lastEffectBeforeRendering) {
        var renderState = workInProgress.memoizedState;

        if (renderState === null) {
          workInProgress.memoizedState = {
            isBackwards: isBackwards,
            rendering: null,
            renderingStartTime: 0,
            last: lastContentRow,
            tail: tail,
            tailExpiration: 0,
            tailMode: tailMode,
            lastEffect: lastEffectBeforeRendering
          };
        } else {
          renderState.isBackwards = isBackwards;
          renderState.rendering = null;
          renderState.renderingStartTime = 0;
          renderState.last = lastContentRow;
          renderState.tail = tail;
          renderState.tailExpiration = 0;
          renderState.tailMode = tailMode;
          renderState.lastEffect = lastEffectBeforeRendering;
        }
      }

      function updateSuspenseListComponent(current, workInProgress, renderExpirationTime) {
        var nextProps = workInProgress.pendingProps;
        var revealOrder = nextProps.revealOrder;
        var tailMode = nextProps.tail;
        var newChildren = nextProps.children;
        validateRevealOrder(revealOrder);
        validateTailOptions(tailMode, revealOrder);
        validateSuspenseListChildren(newChildren, revealOrder);
        reconcileChildren(current, workInProgress, newChildren, renderExpirationTime);
        var suspenseContext = suspenseStackCursor.current;
        var shouldForceFallback = hasSuspenseContext(suspenseContext, ForceSuspenseFallback);

        if (shouldForceFallback) {
          suspenseContext = setShallowSuspenseContext(suspenseContext, ForceSuspenseFallback);
          workInProgress.effectTag |= DidCapture;
        } else {
          var didSuspendBefore = current !== null && (current.effectTag & DidCapture) !== NoEffect;

          if (didSuspendBefore) {
            propagateSuspenseContextChange(workInProgress, workInProgress.child, renderExpirationTime);
          }

          suspenseContext = setDefaultShallowSuspenseContext(suspenseContext);
        }

        pushSuspenseContext(workInProgress, suspenseContext);

        if ((workInProgress.mode & BlockingMode) === NoMode) {
          workInProgress.memoizedState = null;
        } else {
          switch (revealOrder) {
            case 'forwards':
              {
                var lastContentRow = findLastContentRow(workInProgress.child);
                var tail;

                if (lastContentRow === null) {
                  tail = workInProgress.child;
                  workInProgress.child = null;
                } else {
                  tail = lastContentRow.sibling;
                  lastContentRow.sibling = null;
                }

                initSuspenseListRenderState(workInProgress, false, tail, lastContentRow, tailMode, workInProgress.lastEffect);
                break;
              }

            case 'backwards':
              {
                var _tail = null;
                var row = workInProgress.child;
                workInProgress.child = null;

                while (row !== null) {
                  var currentRow = row.alternate;

                  if (currentRow !== null && findFirstSuspended(currentRow) === null) {
                    workInProgress.child = row;
                    break;
                  }

                  var nextRow = row.sibling;
                  row.sibling = _tail;
                  _tail = row;
                  row = nextRow;
                }

                initSuspenseListRenderState(workInProgress, true, _tail, null, tailMode, workInProgress.lastEffect);
                break;
              }

            case 'together':
              {
                initSuspenseListRenderState(workInProgress, false, null, null, undefined, workInProgress.lastEffect);
                break;
              }

            default:
              {
                workInProgress.memoizedState = null;
              }
          }
        }

        return workInProgress.child;
      }

      function updatePortalComponent(current, workInProgress, renderExpirationTime) {
        pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
        var nextChildren = workInProgress.pendingProps;

        if (current === null) {
          workInProgress.child = reconcileChildFibers(workInProgress, null, nextChildren, renderExpirationTime);
        } else {
          reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime);
        }

        return workInProgress.child;
      }

      function updateContextProvider(current, workInProgress, renderExpirationTime) {
        var providerType = workInProgress.type;
        var context = providerType._context;
        var newProps = workInProgress.pendingProps;
        var oldProps = workInProgress.memoizedProps;
        var newValue = newProps.value;
        {
          var providerPropTypes = workInProgress.type.propTypes;

          if (providerPropTypes) {
            checkPropTypes(providerPropTypes, newProps, 'prop', 'Context.Provider', getCurrentFiberStackInDev);
          }
        }
        pushProvider(workInProgress, newValue);

        if (oldProps !== null) {
          var oldValue = oldProps.value;
          var changedBits = calculateChangedBits(context, newValue, oldValue);

          if (changedBits === 0) {
            if (oldProps.children === newProps.children && !hasContextChanged()) {
              return bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime);
            }
          } else {
            propagateContextChange(workInProgress, context, changedBits, renderExpirationTime);
          }
        }

        var newChildren = newProps.children;
        reconcileChildren(current, workInProgress, newChildren, renderExpirationTime);
        return workInProgress.child;
      }

      var hasWarnedAboutUsingContextAsConsumer = false;

      function updateContextConsumer(current, workInProgress, renderExpirationTime) {
        var context = workInProgress.type;
        {
          if (context._context === undefined) {
            if (context !== context.Consumer) {
              if (!hasWarnedAboutUsingContextAsConsumer) {
                hasWarnedAboutUsingContextAsConsumer = true;
                error('Rendering <Context> directly is not supported and will be removed in ' + 'a future major release. Did you mean to render <Context.Consumer> instead?');
              }
            }
          } else {
            context = context._context;
          }
        }
        var newProps = workInProgress.pendingProps;
        var render = newProps.children;
        {
          if (typeof render !== 'function') {
            error('A context consumer was rendered with multiple children, or a child ' + "that isn't a function. A context consumer expects a single child " + 'that is a function. If you did pass a function, make sure there ' + 'is no trailing or leading whitespace around it.');
          }
        }
        prepareToReadContext(workInProgress, renderExpirationTime);

        var newValue = _readContext(context, newProps.unstable_observedBits);

        var newChildren;
        {
          ReactCurrentOwner$1.current = workInProgress;
          setIsRendering(true);
          newChildren = render(newValue);
          setIsRendering(false);
        }
        workInProgress.effectTag |= PerformedWork;
        reconcileChildren(current, workInProgress, newChildren, renderExpirationTime);
        return workInProgress.child;
      }

      function markWorkInProgressReceivedUpdate() {
        didReceiveUpdate = true;
      }

      function bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime) {
        cancelWorkTimer(workInProgress);

        if (current !== null) {
          workInProgress.dependencies = current.dependencies;
        }

        {
          stopProfilerTimerIfRunning();
        }
        var updateExpirationTime = workInProgress.expirationTime;

        if (updateExpirationTime !== NoWork) {
          markUnprocessedUpdateTime(updateExpirationTime);
        }

        var childExpirationTime = workInProgress.childExpirationTime;

        if (childExpirationTime < renderExpirationTime) {
          return null;
        } else {
          cloneChildFibers(current, workInProgress);
          return workInProgress.child;
        }
      }

      function remountFiber(current, oldWorkInProgress, newWorkInProgress) {
        {
          var returnFiber = oldWorkInProgress["return"];

          if (returnFiber === null) {
            throw new Error('Cannot swap the root fiber.');
          }

          current.alternate = null;
          oldWorkInProgress.alternate = null;
          newWorkInProgress.index = oldWorkInProgress.index;
          newWorkInProgress.sibling = oldWorkInProgress.sibling;
          newWorkInProgress["return"] = oldWorkInProgress["return"];
          newWorkInProgress.ref = oldWorkInProgress.ref;

          if (oldWorkInProgress === returnFiber.child) {
            returnFiber.child = newWorkInProgress;
          } else {
            var prevSibling = returnFiber.child;

            if (prevSibling === null) {
              throw new Error('Expected parent to have a child.');
            }

            while (prevSibling.sibling !== oldWorkInProgress) {
              prevSibling = prevSibling.sibling;

              if (prevSibling === null) {
                throw new Error('Expected to find the previous sibling.');
              }
            }

            prevSibling.sibling = newWorkInProgress;
          }

          var last = returnFiber.lastEffect;

          if (last !== null) {
            last.nextEffect = current;
            returnFiber.lastEffect = current;
          } else {
            returnFiber.firstEffect = returnFiber.lastEffect = current;
          }

          current.nextEffect = null;
          current.effectTag = Deletion;
          newWorkInProgress.effectTag |= Placement;
          return newWorkInProgress;
        }
      }

      function beginWork(current, workInProgress, renderExpirationTime) {
        var updateExpirationTime = workInProgress.expirationTime;
        {
          if (workInProgress._debugNeedsRemount && current !== null) {
            return remountFiber(current, workInProgress, createFiberFromTypeAndProps(workInProgress.type, workInProgress.key, workInProgress.pendingProps, workInProgress._debugOwner || null, workInProgress.mode, workInProgress.expirationTime));
          }
        }

        if (current !== null) {
          var oldProps = current.memoizedProps;
          var newProps = workInProgress.pendingProps;

          if (oldProps !== newProps || hasContextChanged() || workInProgress.type !== current.type) {
            didReceiveUpdate = true;
          } else if (updateExpirationTime < renderExpirationTime) {
            didReceiveUpdate = false;

            switch (workInProgress.tag) {
              case HostRoot:
                pushHostRootContext(workInProgress);
                resetHydrationState();
                break;

              case HostComponent:
                pushHostContext(workInProgress);

                if (workInProgress.mode & ConcurrentMode && renderExpirationTime !== Never && shouldDeprioritizeSubtree(workInProgress.type, newProps)) {
                  {
                    markSpawnedWork(Never);
                  }
                  workInProgress.expirationTime = workInProgress.childExpirationTime = Never;
                  return null;
                }

                break;

              case ClassComponent:
                {
                  var Component = workInProgress.type;

                  if (isContextProvider(Component)) {
                    pushContextProvider(workInProgress);
                  }

                  break;
                }

              case HostPortal:
                pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
                break;

              case ContextProvider:
                {
                  var newValue = workInProgress.memoizedProps.value;
                  pushProvider(workInProgress, newValue);
                  break;
                }

              case Profiler:
                {
                  var hasChildWork = workInProgress.childExpirationTime >= renderExpirationTime;

                  if (hasChildWork) {
                    workInProgress.effectTag |= Update;
                  }
                }
                break;

              case SuspenseComponent:
                {
                  var state = workInProgress.memoizedState;

                  if (state !== null) {
                    var primaryChildFragment = workInProgress.child;
                    var primaryChildExpirationTime = primaryChildFragment.childExpirationTime;

                    if (primaryChildExpirationTime !== NoWork && primaryChildExpirationTime >= renderExpirationTime) {
                      return updateSuspenseComponent(current, workInProgress, renderExpirationTime);
                    } else {
                      pushSuspenseContext(workInProgress, setDefaultShallowSuspenseContext(suspenseStackCursor.current));
                      var child = bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime);

                      if (child !== null) {
                        return child.sibling;
                      } else {
                        return null;
                      }
                    }
                  } else {
                    pushSuspenseContext(workInProgress, setDefaultShallowSuspenseContext(suspenseStackCursor.current));
                  }

                  break;
                }

              case SuspenseListComponent:
                {
                  var didSuspendBefore = (current.effectTag & DidCapture) !== NoEffect;

                  var _hasChildWork = workInProgress.childExpirationTime >= renderExpirationTime;

                  if (didSuspendBefore) {
                    if (_hasChildWork) {
                      return updateSuspenseListComponent(current, workInProgress, renderExpirationTime);
                    }

                    workInProgress.effectTag |= DidCapture;
                  }

                  var renderState = workInProgress.memoizedState;

                  if (renderState !== null) {
                    renderState.rendering = null;
                    renderState.tail = null;
                  }

                  pushSuspenseContext(workInProgress, suspenseStackCursor.current);

                  if (_hasChildWork) {
                    break;
                  } else {
                    return null;
                  }
                }
            }

            return bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime);
          } else {
            didReceiveUpdate = false;
          }
        } else {
          didReceiveUpdate = false;
        }

        workInProgress.expirationTime = NoWork;

        switch (workInProgress.tag) {
          case IndeterminateComponent:
            {
              return mountIndeterminateComponent(current, workInProgress, workInProgress.type, renderExpirationTime);
            }

          case LazyComponent:
            {
              var elementType = workInProgress.elementType;
              return mountLazyComponent(current, workInProgress, elementType, updateExpirationTime, renderExpirationTime);
            }

          case FunctionComponent:
            {
              var _Component = workInProgress.type;
              var unresolvedProps = workInProgress.pendingProps;
              var resolvedProps = workInProgress.elementType === _Component ? unresolvedProps : resolveDefaultProps(_Component, unresolvedProps);
              return updateFunctionComponent(current, workInProgress, _Component, resolvedProps, renderExpirationTime);
            }

          case ClassComponent:
            {
              var _Component2 = workInProgress.type;
              var _unresolvedProps = workInProgress.pendingProps;

              var _resolvedProps = workInProgress.elementType === _Component2 ? _unresolvedProps : resolveDefaultProps(_Component2, _unresolvedProps);

              return updateClassComponent(current, workInProgress, _Component2, _resolvedProps, renderExpirationTime);
            }

          case HostRoot:
            return updateHostRoot(current, workInProgress, renderExpirationTime);

          case HostComponent:
            return updateHostComponent(current, workInProgress, renderExpirationTime);

          case HostText:
            return updateHostText(current, workInProgress);

          case SuspenseComponent:
            return updateSuspenseComponent(current, workInProgress, renderExpirationTime);

          case HostPortal:
            return updatePortalComponent(current, workInProgress, renderExpirationTime);

          case ForwardRef:
            {
              var type = workInProgress.type;
              var _unresolvedProps2 = workInProgress.pendingProps;

              var _resolvedProps2 = workInProgress.elementType === type ? _unresolvedProps2 : resolveDefaultProps(type, _unresolvedProps2);

              return updateForwardRef(current, workInProgress, type, _resolvedProps2, renderExpirationTime);
            }

          case Fragment:
            return updateFragment(current, workInProgress, renderExpirationTime);

          case Mode:
            return updateMode(current, workInProgress, renderExpirationTime);

          case Profiler:
            return updateProfiler(current, workInProgress, renderExpirationTime);

          case ContextProvider:
            return updateContextProvider(current, workInProgress, renderExpirationTime);

          case ContextConsumer:
            return updateContextConsumer(current, workInProgress, renderExpirationTime);

          case MemoComponent:
            {
              var _type2 = workInProgress.type;
              var _unresolvedProps3 = workInProgress.pendingProps;

              var _resolvedProps3 = resolveDefaultProps(_type2, _unresolvedProps3);

              {
                if (workInProgress.type !== workInProgress.elementType) {
                  var outerPropTypes = _type2.propTypes;

                  if (outerPropTypes) {
                    checkPropTypes(outerPropTypes, _resolvedProps3, 'prop', getComponentName(_type2), getCurrentFiberStackInDev);
                  }
                }
              }
              _resolvedProps3 = resolveDefaultProps(_type2.type, _resolvedProps3);
              return updateMemoComponent(current, workInProgress, _type2, _resolvedProps3, updateExpirationTime, renderExpirationTime);
            }

          case SimpleMemoComponent:
            {
              return updateSimpleMemoComponent(current, workInProgress, workInProgress.type, workInProgress.pendingProps, updateExpirationTime, renderExpirationTime);
            }

          case IncompleteClassComponent:
            {
              var _Component3 = workInProgress.type;
              var _unresolvedProps4 = workInProgress.pendingProps;

              var _resolvedProps4 = workInProgress.elementType === _Component3 ? _unresolvedProps4 : resolveDefaultProps(_Component3, _unresolvedProps4);

              return mountIncompleteClassComponent(current, workInProgress, _Component3, _resolvedProps4, renderExpirationTime);
            }

          case SuspenseListComponent:
            {
              return updateSuspenseListComponent(current, workInProgress, renderExpirationTime);
            }
        }

        {
          {
            throw Error("Unknown unit of work tag (" + workInProgress.tag + "). This error is likely caused by a bug in React. Please file an issue.");
          }
        }
      }

      function markUpdate(workInProgress) {
        workInProgress.effectTag |= Update;
      }

      function markRef$1(workInProgress) {
        workInProgress.effectTag |= Ref;
      }

      var appendAllChildren;
      var updateHostContainer;
      var updateHostComponent$1;
      var updateHostText$1;
      {
        appendAllChildren = function appendAllChildren(parent, workInProgress, needsVisibilityToggle, isHidden) {
          var node = workInProgress.child;

          while (node !== null) {
            if (node.tag === HostComponent || node.tag === HostText) {
              appendInitialChild(parent, node.stateNode);
            } else if (node.tag === HostPortal) ;else if (node.child !== null) {
              node.child["return"] = node;
              node = node.child;
              continue;
            }

            if (node === workInProgress) {
              return;
            }

            while (node.sibling === null) {
              if (node["return"] === null || node["return"] === workInProgress) {
                return;
              }

              node = node["return"];
            }

            node.sibling["return"] = node["return"];
            node = node.sibling;
          }
        };

        updateHostContainer = function updateHostContainer(workInProgress) {};

        updateHostComponent$1 = function updateHostComponent$1(current, workInProgress, type, newProps, rootContainerInstance) {
          var oldProps = current.memoizedProps;

          if (oldProps === newProps) {
            return;
          }

          var instance = workInProgress.stateNode;
          var currentHostContext = getHostContext();
          var updatePayload = prepareUpdate(instance, type, oldProps, newProps, rootContainerInstance, currentHostContext);
          workInProgress.updateQueue = updatePayload;

          if (updatePayload) {
            markUpdate(workInProgress);
          }
        };

        updateHostText$1 = function updateHostText$1(current, workInProgress, oldText, newText) {
          if (oldText !== newText) {
            markUpdate(workInProgress);
          }
        };
      }

      function cutOffTailIfNeeded(renderState, hasRenderedATailFallback) {
        switch (renderState.tailMode) {
          case 'hidden':
            {
              var tailNode = renderState.tail;
              var lastTailNode = null;

              while (tailNode !== null) {
                if (tailNode.alternate !== null) {
                  lastTailNode = tailNode;
                }

                tailNode = tailNode.sibling;
              }

              if (lastTailNode === null) {
                renderState.tail = null;
              } else {
                lastTailNode.sibling = null;
              }

              break;
            }

          case 'collapsed':
            {
              var _tailNode = renderState.tail;
              var _lastTailNode = null;

              while (_tailNode !== null) {
                if (_tailNode.alternate !== null) {
                  _lastTailNode = _tailNode;
                }

                _tailNode = _tailNode.sibling;
              }

              if (_lastTailNode === null) {
                if (!hasRenderedATailFallback && renderState.tail !== null) {
                  renderState.tail.sibling = null;
                } else {
                  renderState.tail = null;
                }
              } else {
                _lastTailNode.sibling = null;
              }

              break;
            }
        }
      }

      function completeWork(current, workInProgress, renderExpirationTime) {
        var newProps = workInProgress.pendingProps;

        switch (workInProgress.tag) {
          case IndeterminateComponent:
          case LazyComponent:
          case SimpleMemoComponent:
          case FunctionComponent:
          case ForwardRef:
          case Fragment:
          case Mode:
          case Profiler:
          case ContextConsumer:
          case MemoComponent:
            return null;

          case ClassComponent:
            {
              var Component = workInProgress.type;

              if (isContextProvider(Component)) {
                popContext(workInProgress);
              }

              return null;
            }

          case HostRoot:
            {
              popHostContainer(workInProgress);
              popTopLevelContextObject(workInProgress);
              var fiberRoot = workInProgress.stateNode;

              if (fiberRoot.pendingContext) {
                fiberRoot.context = fiberRoot.pendingContext;
                fiberRoot.pendingContext = null;
              }

              if (current === null || current.child === null) {
                var wasHydrated = popHydrationState(workInProgress);

                if (wasHydrated) {
                  markUpdate(workInProgress);
                }
              }

              updateHostContainer(workInProgress);
              return null;
            }

          case HostComponent:
            {
              popHostContext(workInProgress);
              var rootContainerInstance = getRootHostContainer();
              var type = workInProgress.type;

              if (current !== null && workInProgress.stateNode != null) {
                updateHostComponent$1(current, workInProgress, type, newProps, rootContainerInstance);

                if (current.ref !== workInProgress.ref) {
                  markRef$1(workInProgress);
                }
              } else {
                if (!newProps) {
                  if (!(workInProgress.stateNode !== null)) {
                    {
                      throw Error("We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue.");
                    }
                  }

                  return null;
                }

                var currentHostContext = getHostContext();

                var _wasHydrated = popHydrationState(workInProgress);

                if (_wasHydrated) {
                  if (prepareToHydrateHostInstance(workInProgress, rootContainerInstance, currentHostContext)) {
                    markUpdate(workInProgress);
                  }
                } else {
                  var instance = createInstance(type, newProps, rootContainerInstance, currentHostContext, workInProgress);
                  appendAllChildren(instance, workInProgress, false, false);
                  workInProgress.stateNode = instance;

                  if (finalizeInitialChildren(instance, type, newProps, rootContainerInstance)) {
                    markUpdate(workInProgress);
                  }
                }

                if (workInProgress.ref !== null) {
                  markRef$1(workInProgress);
                }
              }

              return null;
            }

          case HostText:
            {
              var newText = newProps;

              if (current && workInProgress.stateNode != null) {
                var oldText = current.memoizedProps;
                updateHostText$1(current, workInProgress, oldText, newText);
              } else {
                if (typeof newText !== 'string') {
                  if (!(workInProgress.stateNode !== null)) {
                    {
                      throw Error("We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue.");
                    }
                  }
                }

                var _rootContainerInstance = getRootHostContainer();

                var _currentHostContext = getHostContext();

                var _wasHydrated2 = popHydrationState(workInProgress);

                if (_wasHydrated2) {
                  if (prepareToHydrateHostTextInstance(workInProgress)) {
                    markUpdate(workInProgress);
                  }
                } else {
                  workInProgress.stateNode = createTextInstance(newText, _rootContainerInstance, _currentHostContext, workInProgress);
                }
              }

              return null;
            }

          case SuspenseComponent:
            {
              popSuspenseContext(workInProgress);
              var nextState = workInProgress.memoizedState;

              if ((workInProgress.effectTag & DidCapture) !== NoEffect) {
                workInProgress.expirationTime = renderExpirationTime;
                return workInProgress;
              }

              var nextDidTimeout = nextState !== null;
              var prevDidTimeout = false;

              if (current === null) {
                if (workInProgress.memoizedProps.fallback !== undefined) {
                  popHydrationState(workInProgress);
                }
              } else {
                var prevState = current.memoizedState;
                prevDidTimeout = prevState !== null;

                if (!nextDidTimeout && prevState !== null) {
                  var currentFallbackChild = current.child.sibling;

                  if (currentFallbackChild !== null) {
                    var first = workInProgress.firstEffect;

                    if (first !== null) {
                      workInProgress.firstEffect = currentFallbackChild;
                      currentFallbackChild.nextEffect = first;
                    } else {
                      workInProgress.firstEffect = workInProgress.lastEffect = currentFallbackChild;
                      currentFallbackChild.nextEffect = null;
                    }

                    currentFallbackChild.effectTag = Deletion;
                  }
                }
              }

              if (nextDidTimeout && !prevDidTimeout) {
                if ((workInProgress.mode & BlockingMode) !== NoMode) {
                  var hasInvisibleChildContext = current === null && workInProgress.memoizedProps.unstable_avoidThisFallback !== true;

                  if (hasInvisibleChildContext || hasSuspenseContext(suspenseStackCursor.current, InvisibleParentSuspenseContext)) {
                    renderDidSuspend();
                  } else {
                    renderDidSuspendDelayIfPossible();
                  }
                }
              }

              {
                if (nextDidTimeout || prevDidTimeout) {
                  workInProgress.effectTag |= Update;
                }
              }
              return null;
            }

          case HostPortal:
            popHostContainer(workInProgress);
            updateHostContainer(workInProgress);
            return null;

          case ContextProvider:
            popProvider(workInProgress);
            return null;

          case IncompleteClassComponent:
            {
              var _Component = workInProgress.type;

              if (isContextProvider(_Component)) {
                popContext(workInProgress);
              }

              return null;
            }

          case SuspenseListComponent:
            {
              popSuspenseContext(workInProgress);
              var renderState = workInProgress.memoizedState;

              if (renderState === null) {
                return null;
              }

              var didSuspendAlready = (workInProgress.effectTag & DidCapture) !== NoEffect;
              var renderedTail = renderState.rendering;

              if (renderedTail === null) {
                if (!didSuspendAlready) {
                  var cannotBeSuspended = renderHasNotSuspendedYet() && (current === null || (current.effectTag & DidCapture) === NoEffect);

                  if (!cannotBeSuspended) {
                    var row = workInProgress.child;

                    while (row !== null) {
                      var suspended = findFirstSuspended(row);

                      if (suspended !== null) {
                        didSuspendAlready = true;
                        workInProgress.effectTag |= DidCapture;
                        cutOffTailIfNeeded(renderState, false);
                        var newThennables = suspended.updateQueue;

                        if (newThennables !== null) {
                          workInProgress.updateQueue = newThennables;
                          workInProgress.effectTag |= Update;
                        }

                        if (renderState.lastEffect === null) {
                          workInProgress.firstEffect = null;
                        }

                        workInProgress.lastEffect = renderState.lastEffect;
                        resetChildFibers(workInProgress, renderExpirationTime);
                        pushSuspenseContext(workInProgress, setShallowSuspenseContext(suspenseStackCursor.current, ForceSuspenseFallback));
                        return workInProgress.child;
                      }

                      row = row.sibling;
                    }
                  }
                } else {
                  cutOffTailIfNeeded(renderState, false);
                }
              } else {
                if (!didSuspendAlready) {
                  var _suspended = findFirstSuspended(renderedTail);

                  if (_suspended !== null) {
                    workInProgress.effectTag |= DidCapture;
                    didSuspendAlready = true;
                    var _newThennables = _suspended.updateQueue;

                    if (_newThennables !== null) {
                      workInProgress.updateQueue = _newThennables;
                      workInProgress.effectTag |= Update;
                    }

                    cutOffTailIfNeeded(renderState, true);

                    if (renderState.tail === null && renderState.tailMode === 'hidden' && !renderedTail.alternate) {
                      var lastEffect = workInProgress.lastEffect = renderState.lastEffect;

                      if (lastEffect !== null) {
                        lastEffect.nextEffect = null;
                      }

                      return null;
                    }
                  } else if (now() * 2 - renderState.renderingStartTime > renderState.tailExpiration && renderExpirationTime > Never) {
                    workInProgress.effectTag |= DidCapture;
                    didSuspendAlready = true;
                    cutOffTailIfNeeded(renderState, false);
                    var nextPriority = renderExpirationTime - 1;
                    workInProgress.expirationTime = workInProgress.childExpirationTime = nextPriority;
                    {
                      markSpawnedWork(nextPriority);
                    }
                  }
                }

                if (renderState.isBackwards) {
                  renderedTail.sibling = workInProgress.child;
                  workInProgress.child = renderedTail;
                } else {
                  var previousSibling = renderState.last;

                  if (previousSibling !== null) {
                    previousSibling.sibling = renderedTail;
                  } else {
                    workInProgress.child = renderedTail;
                  }

                  renderState.last = renderedTail;
                }
              }

              if (renderState.tail !== null) {
                if (renderState.tailExpiration === 0) {
                  var TAIL_EXPIRATION_TIMEOUT_MS = 500;
                  renderState.tailExpiration = now() + TAIL_EXPIRATION_TIMEOUT_MS;
                }

                var next = renderState.tail;
                renderState.rendering = next;
                renderState.tail = next.sibling;
                renderState.lastEffect = workInProgress.lastEffect;
                renderState.renderingStartTime = now();
                next.sibling = null;
                var suspenseContext = suspenseStackCursor.current;

                if (didSuspendAlready) {
                  suspenseContext = setShallowSuspenseContext(suspenseContext, ForceSuspenseFallback);
                } else {
                  suspenseContext = setDefaultShallowSuspenseContext(suspenseContext);
                }

                pushSuspenseContext(workInProgress, suspenseContext);
                return next;
              }

              return null;
            }
        }

        {
          {
            throw Error("Unknown unit of work tag (" + workInProgress.tag + "). This error is likely caused by a bug in React. Please file an issue.");
          }
        }
      }

      function unwindWork(workInProgress, renderExpirationTime) {
        switch (workInProgress.tag) {
          case ClassComponent:
            {
              var Component = workInProgress.type;

              if (isContextProvider(Component)) {
                popContext(workInProgress);
              }

              var effectTag = workInProgress.effectTag;

              if (effectTag & ShouldCapture) {
                workInProgress.effectTag = effectTag & ~ShouldCapture | DidCapture;
                return workInProgress;
              }

              return null;
            }

          case HostRoot:
            {
              popHostContainer(workInProgress);
              popTopLevelContextObject(workInProgress);
              var _effectTag = workInProgress.effectTag;

              if (!((_effectTag & DidCapture) === NoEffect)) {
                {
                  throw Error("The root failed to unmount after an error. This is likely a bug in React. Please file an issue.");
                }
              }

              workInProgress.effectTag = _effectTag & ~ShouldCapture | DidCapture;
              return workInProgress;
            }

          case HostComponent:
            {
              popHostContext(workInProgress);
              return null;
            }

          case SuspenseComponent:
            {
              popSuspenseContext(workInProgress);
              var _effectTag2 = workInProgress.effectTag;

              if (_effectTag2 & ShouldCapture) {
                workInProgress.effectTag = _effectTag2 & ~ShouldCapture | DidCapture;
                return workInProgress;
              }

              return null;
            }

          case SuspenseListComponent:
            {
              popSuspenseContext(workInProgress);
              return null;
            }

          case HostPortal:
            popHostContainer(workInProgress);
            return null;

          case ContextProvider:
            popProvider(workInProgress);
            return null;

          default:
            return null;
        }
      }

      function unwindInterruptedWork(interruptedWork) {
        switch (interruptedWork.tag) {
          case ClassComponent:
            {
              var childContextTypes = interruptedWork.type.childContextTypes;

              if (childContextTypes !== null && childContextTypes !== undefined) {
                popContext(interruptedWork);
              }

              break;
            }

          case HostRoot:
            {
              popHostContainer(interruptedWork);
              popTopLevelContextObject(interruptedWork);
              break;
            }

          case HostComponent:
            {
              popHostContext(interruptedWork);
              break;
            }

          case HostPortal:
            popHostContainer(interruptedWork);
            break;

          case SuspenseComponent:
            popSuspenseContext(interruptedWork);
            break;

          case SuspenseListComponent:
            popSuspenseContext(interruptedWork);
            break;

          case ContextProvider:
            popProvider(interruptedWork);
            break;
        }
      }

      function createCapturedValue(value, source) {
        return {
          value: value,
          source: source,
          stack: getStackByFiberInDevAndProd(source)
        };
      }

      function logCapturedError(capturedError) {
        var error = capturedError.error;
        {
          var componentName = capturedError.componentName,
              componentStack = capturedError.componentStack,
              errorBoundaryName = capturedError.errorBoundaryName,
              errorBoundaryFound = capturedError.errorBoundaryFound,
              willRetry = capturedError.willRetry;

          if (error != null && error._suppressLogging) {
            if (errorBoundaryFound && willRetry) {
              return;
            }

            console['error'](error);
          }

          var componentNameMessage = componentName ? "The above error occurred in the <" + componentName + "> component:" : 'The above error occurred in one of your React components:';
          var errorBoundaryMessage;

          if (errorBoundaryFound && errorBoundaryName) {
            if (willRetry) {
              errorBoundaryMessage = "React will try to recreate this component tree from scratch " + ("using the error boundary you provided, " + errorBoundaryName + ".");
            } else {
              errorBoundaryMessage = "This error was initially handled by the error boundary " + errorBoundaryName + ".\n" + "Recreating the tree from scratch failed so React will unmount the tree.";
            }
          } else {
            errorBoundaryMessage = 'Consider adding an error boundary to your tree to customize error handling behavior.\n' + 'Visit https://fb.me/react-error-boundaries to learn more about error boundaries.';
          }

          var combinedMessage = "" + componentNameMessage + componentStack + "\n\n" + ("" + errorBoundaryMessage);
          console['error'](combinedMessage);
        }
      }

      var didWarnAboutUndefinedSnapshotBeforeUpdate = null;
      {
        didWarnAboutUndefinedSnapshotBeforeUpdate = new Set();
      }
      var PossiblyWeakSet = typeof WeakSet === 'function' ? WeakSet : Set;

      function logError(boundary, errorInfo) {
        var source = errorInfo.source;
        var stack = errorInfo.stack;

        if (stack === null && source !== null) {
          stack = getStackByFiberInDevAndProd(source);
        }

        var capturedError = {
          componentName: source !== null ? getComponentName(source.type) : null,
          componentStack: stack !== null ? stack : '',
          error: errorInfo.value,
          errorBoundary: null,
          errorBoundaryName: null,
          errorBoundaryFound: false,
          willRetry: false
        };

        if (boundary !== null && boundary.tag === ClassComponent) {
          capturedError.errorBoundary = boundary.stateNode;
          capturedError.errorBoundaryName = getComponentName(boundary.type);
          capturedError.errorBoundaryFound = true;
          capturedError.willRetry = true;
        }

        try {
          logCapturedError(capturedError);
        } catch (e) {
          setTimeout(function () {
            throw e;
          });
        }
      }

      var callComponentWillUnmountWithTimer = function callComponentWillUnmountWithTimer(current, instance) {
        startPhaseTimer(current, 'componentWillUnmount');
        instance.props = current.memoizedProps;
        instance.state = current.memoizedState;
        instance.componentWillUnmount();
        stopPhaseTimer();
      };

      function safelyCallComponentWillUnmount(current, instance) {
        {
          invokeGuardedCallback(null, callComponentWillUnmountWithTimer, null, current, instance);

          if (hasCaughtError()) {
            var unmountError = clearCaughtError();
            captureCommitPhaseError(current, unmountError);
          }
        }
      }

      function safelyDetachRef(current) {
        var ref = current.ref;

        if (ref !== null) {
          if (typeof ref === 'function') {
            {
              invokeGuardedCallback(null, ref, null, null);

              if (hasCaughtError()) {
                var refError = clearCaughtError();
                captureCommitPhaseError(current, refError);
              }
            }
          } else {
            ref.current = null;
          }
        }
      }

      function safelyCallDestroy(current, destroy) {
        {
          invokeGuardedCallback(null, destroy, null);

          if (hasCaughtError()) {
            var error = clearCaughtError();
            captureCommitPhaseError(current, error);
          }
        }
      }

      function commitBeforeMutationLifeCycles(current, finishedWork) {
        switch (finishedWork.tag) {
          case FunctionComponent:
          case ForwardRef:
          case SimpleMemoComponent:
          case Block:
            {
              return;
            }

          case ClassComponent:
            {
              if (finishedWork.effectTag & Snapshot) {
                if (current !== null) {
                  var prevProps = current.memoizedProps;
                  var prevState = current.memoizedState;
                  startPhaseTimer(finishedWork, 'getSnapshotBeforeUpdate');
                  var instance = finishedWork.stateNode;
                  {
                    if (finishedWork.type === finishedWork.elementType && !didWarnAboutReassigningProps) {
                      if (instance.props !== finishedWork.memoizedProps) {
                        error('Expected %s props to match memoized props before ' + 'getSnapshotBeforeUpdate. ' + 'This might either be because of a bug in React, or because ' + 'a component reassigns its own `this.props`. ' + 'Please file an issue.', getComponentName(finishedWork.type) || 'instance');
                      }

                      if (instance.state !== finishedWork.memoizedState) {
                        error('Expected %s state to match memoized state before ' + 'getSnapshotBeforeUpdate. ' + 'This might either be because of a bug in React, or because ' + 'a component reassigns its own `this.props`. ' + 'Please file an issue.', getComponentName(finishedWork.type) || 'instance');
                      }
                    }
                  }
                  var snapshot = instance.getSnapshotBeforeUpdate(finishedWork.elementType === finishedWork.type ? prevProps : resolveDefaultProps(finishedWork.type, prevProps), prevState);
                  {
                    var didWarnSet = didWarnAboutUndefinedSnapshotBeforeUpdate;

                    if (snapshot === undefined && !didWarnSet.has(finishedWork.type)) {
                      didWarnSet.add(finishedWork.type);
                      error('%s.getSnapshotBeforeUpdate(): A snapshot value (or null) ' + 'must be returned. You have returned undefined.', getComponentName(finishedWork.type));
                    }
                  }
                  instance.__reactInternalSnapshotBeforeUpdate = snapshot;
                  stopPhaseTimer();
                }
              }

              return;
            }

          case HostRoot:
          case HostComponent:
          case HostText:
          case HostPortal:
          case IncompleteClassComponent:
            return;
        }

        {
          {
            throw Error("This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue.");
          }
        }
      }

      function commitHookEffectListUnmount(tag, finishedWork) {
        var updateQueue = finishedWork.updateQueue;
        var lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;

        if (lastEffect !== null) {
          var firstEffect = lastEffect.next;
          var effect = firstEffect;

          do {
            if ((effect.tag & tag) === tag) {
              var destroy = effect.destroy;
              effect.destroy = undefined;

              if (destroy !== undefined) {
                destroy();
              }
            }

            effect = effect.next;
          } while (effect !== firstEffect);
        }
      }

      function commitHookEffectListMount(tag, finishedWork) {
        var updateQueue = finishedWork.updateQueue;
        var lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;

        if (lastEffect !== null) {
          var firstEffect = lastEffect.next;
          var effect = firstEffect;

          do {
            if ((effect.tag & tag) === tag) {
              var create = effect.create;
              effect.destroy = create();
              {
                var destroy = effect.destroy;

                if (destroy !== undefined && typeof destroy !== 'function') {
                  var addendum = void 0;

                  if (destroy === null) {
                    addendum = ' You returned null. If your effect does not require clean ' + 'up, return undefined (or nothing).';
                  } else if (typeof destroy.then === 'function') {
                    addendum = '\n\nIt looks like you wrote useEffect(async () => ...) or returned a Promise. ' + 'Instead, write the async function inside your effect ' + 'and call it immediately:\n\n' + 'useEffect(() => {\n' + '  async function fetchData() {\n' + '    // You can await here\n' + '    const response = await MyAPI.getData(someId);\n' + '    // ...\n' + '  }\n' + '  fetchData();\n' + "}, [someId]); // Or [] if effect doesn't need props or state\n\n" + 'Learn more about data fetching with Hooks: https://fb.me/react-hooks-data-fetching';
                  } else {
                    addendum = ' You returned: ' + destroy;
                  }

                  error('An effect function must not return anything besides a function, ' + 'which is used for clean-up.%s%s', addendum, getStackByFiberInDevAndProd(finishedWork));
                }
              }
            }

            effect = effect.next;
          } while (effect !== firstEffect);
        }
      }

      function commitPassiveHookEffects(finishedWork) {
        if ((finishedWork.effectTag & Passive) !== NoEffect) {
          switch (finishedWork.tag) {
            case FunctionComponent:
            case ForwardRef:
            case SimpleMemoComponent:
            case Block:
              {
                commitHookEffectListUnmount(Passive$1 | HasEffect, finishedWork);
                commitHookEffectListMount(Passive$1 | HasEffect, finishedWork);
                break;
              }
          }
        }
      }

      function commitLifeCycles(finishedRoot, current, finishedWork, committedExpirationTime) {
        switch (finishedWork.tag) {
          case FunctionComponent:
          case ForwardRef:
          case SimpleMemoComponent:
          case Block:
            {
              commitHookEffectListMount(Layout | HasEffect, finishedWork);
              return;
            }

          case ClassComponent:
            {
              var instance = finishedWork.stateNode;

              if (finishedWork.effectTag & Update) {
                if (current === null) {
                  startPhaseTimer(finishedWork, 'componentDidMount');
                  {
                    if (finishedWork.type === finishedWork.elementType && !didWarnAboutReassigningProps) {
                      if (instance.props !== finishedWork.memoizedProps) {
                        error('Expected %s props to match memoized props before ' + 'componentDidMount. ' + 'This might either be because of a bug in React, or because ' + 'a component reassigns its own `this.props`. ' + 'Please file an issue.', getComponentName(finishedWork.type) || 'instance');
                      }

                      if (instance.state !== finishedWork.memoizedState) {
                        error('Expected %s state to match memoized state before ' + 'componentDidMount. ' + 'This might either be because of a bug in React, or because ' + 'a component reassigns its own `this.props`. ' + 'Please file an issue.', getComponentName(finishedWork.type) || 'instance');
                      }
                    }
                  }
                  instance.componentDidMount();
                  stopPhaseTimer();
                } else {
                  var prevProps = finishedWork.elementType === finishedWork.type ? current.memoizedProps : resolveDefaultProps(finishedWork.type, current.memoizedProps);
                  var prevState = current.memoizedState;
                  startPhaseTimer(finishedWork, 'componentDidUpdate');
                  {
                    if (finishedWork.type === finishedWork.elementType && !didWarnAboutReassigningProps) {
                      if (instance.props !== finishedWork.memoizedProps) {
                        error('Expected %s props to match memoized props before ' + 'componentDidUpdate. ' + 'This might either be because of a bug in React, or because ' + 'a component reassigns its own `this.props`. ' + 'Please file an issue.', getComponentName(finishedWork.type) || 'instance');
                      }

                      if (instance.state !== finishedWork.memoizedState) {
                        error('Expected %s state to match memoized state before ' + 'componentDidUpdate. ' + 'This might either be because of a bug in React, or because ' + 'a component reassigns its own `this.props`. ' + 'Please file an issue.', getComponentName(finishedWork.type) || 'instance');
                      }
                    }
                  }
                  instance.componentDidUpdate(prevProps, prevState, instance.__reactInternalSnapshotBeforeUpdate);
                  stopPhaseTimer();
                }
              }

              var updateQueue = finishedWork.updateQueue;

              if (updateQueue !== null) {
                {
                  if (finishedWork.type === finishedWork.elementType && !didWarnAboutReassigningProps) {
                    if (instance.props !== finishedWork.memoizedProps) {
                      error('Expected %s props to match memoized props before ' + 'processing the update queue. ' + 'This might either be because of a bug in React, or because ' + 'a component reassigns its own `this.props`. ' + 'Please file an issue.', getComponentName(finishedWork.type) || 'instance');
                    }

                    if (instance.state !== finishedWork.memoizedState) {
                      error('Expected %s state to match memoized state before ' + 'processing the update queue. ' + 'This might either be because of a bug in React, or because ' + 'a component reassigns its own `this.props`. ' + 'Please file an issue.', getComponentName(finishedWork.type) || 'instance');
                    }
                  }
                }
                commitUpdateQueue(finishedWork, updateQueue, instance);
              }

              return;
            }

          case HostRoot:
            {
              var _updateQueue = finishedWork.updateQueue;

              if (_updateQueue !== null) {
                var _instance = null;

                if (finishedWork.child !== null) {
                  switch (finishedWork.child.tag) {
                    case HostComponent:
                      _instance = getPublicInstance(finishedWork.child.stateNode);
                      break;

                    case ClassComponent:
                      _instance = finishedWork.child.stateNode;
                      break;
                  }
                }

                commitUpdateQueue(finishedWork, _updateQueue, _instance);
              }

              return;
            }

          case HostComponent:
            {
              var _instance2 = finishedWork.stateNode;

              if (current === null && finishedWork.effectTag & Update) {
                var type = finishedWork.type;
                var props = finishedWork.memoizedProps;
                commitMount(_instance2, type, props);
              }

              return;
            }

          case HostText:
            {
              return;
            }

          case HostPortal:
            {
              return;
            }

          case Profiler:
            {
              {
                var onRender = finishedWork.memoizedProps.onRender;

                if (typeof onRender === 'function') {
                  {
                    onRender(finishedWork.memoizedProps.id, current === null ? 'mount' : 'update', finishedWork.actualDuration, finishedWork.treeBaseDuration, finishedWork.actualStartTime, getCommitTime(), finishedRoot.memoizedInteractions);
                  }
                }
              }
              return;
            }

          case SuspenseComponent:
            {
              commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
              return;
            }

          case SuspenseListComponent:
          case IncompleteClassComponent:
          case FundamentalComponent:
          case ScopeComponent:
            return;
        }

        {
          {
            throw Error("This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue.");
          }
        }
      }

      function hideOrUnhideAllChildren(finishedWork, isHidden) {
        {
          var node = finishedWork;

          while (true) {
            if (node.tag === HostComponent) {
              var instance = node.stateNode;

              if (isHidden) {
                hideInstance(instance);
              } else {
                unhideInstance(node.stateNode, node.memoizedProps);
              }
            } else if (node.tag === HostText) {
              var _instance3 = node.stateNode;

              if (isHidden) {
                hideTextInstance(_instance3);
              } else {
                unhideTextInstance(_instance3, node.memoizedProps);
              }
            } else if (node.tag === SuspenseComponent && node.memoizedState !== null && node.memoizedState.dehydrated === null) {
              var fallbackChildFragment = node.child.sibling;
              fallbackChildFragment["return"] = node;
              node = fallbackChildFragment;
              continue;
            } else if (node.child !== null) {
              node.child["return"] = node;
              node = node.child;
              continue;
            }

            if (node === finishedWork) {
              return;
            }

            while (node.sibling === null) {
              if (node["return"] === null || node["return"] === finishedWork) {
                return;
              }

              node = node["return"];
            }

            node.sibling["return"] = node["return"];
            node = node.sibling;
          }
        }
      }

      function commitAttachRef(finishedWork) {
        var ref = finishedWork.ref;

        if (ref !== null) {
          var instance = finishedWork.stateNode;
          var instanceToUse;

          switch (finishedWork.tag) {
            case HostComponent:
              instanceToUse = getPublicInstance(instance);
              break;

            default:
              instanceToUse = instance;
          }

          if (typeof ref === 'function') {
            ref(instanceToUse);
          } else {
            {
              if (!ref.hasOwnProperty('current')) {
                error('Unexpected ref object provided for %s. ' + 'Use either a ref-setter function or React.createRef().%s', getComponentName(finishedWork.type), getStackByFiberInDevAndProd(finishedWork));
              }
            }
            ref.current = instanceToUse;
          }
        }
      }

      function commitDetachRef(current) {
        var currentRef = current.ref;

        if (currentRef !== null) {
          if (typeof currentRef === 'function') {
            currentRef(null);
          } else {
            currentRef.current = null;
          }
        }
      }

      function commitUnmount(finishedRoot, current, renderPriorityLevel) {
        onCommitUnmount(current);

        switch (current.tag) {
          case FunctionComponent:
          case ForwardRef:
          case MemoComponent:
          case SimpleMemoComponent:
          case Block:
            {
              var updateQueue = current.updateQueue;

              if (updateQueue !== null) {
                var lastEffect = updateQueue.lastEffect;

                if (lastEffect !== null) {
                  var firstEffect = lastEffect.next;
                  {
                    var priorityLevel = renderPriorityLevel > NormalPriority ? NormalPriority : renderPriorityLevel;
                    runWithPriority$1(priorityLevel, function () {
                      var effect = firstEffect;

                      do {
                        var _destroy = effect.destroy;

                        if (_destroy !== undefined) {
                          safelyCallDestroy(current, _destroy);
                        }

                        effect = effect.next;
                      } while (effect !== firstEffect);
                    });
                  }
                }
              }

              return;
            }

          case ClassComponent:
            {
              safelyDetachRef(current);
              var instance = current.stateNode;

              if (typeof instance.componentWillUnmount === 'function') {
                safelyCallComponentWillUnmount(current, instance);
              }

              return;
            }

          case HostComponent:
            {
              safelyDetachRef(current);
              return;
            }

          case HostPortal:
            {
              {
                unmountHostComponents(finishedRoot, current, renderPriorityLevel);
              }
              return;
            }

          case FundamentalComponent:
            {
              return;
            }

          case DehydratedFragment:
            {
              return;
            }

          case ScopeComponent:
            {
              return;
            }
        }
      }

      function commitNestedUnmounts(finishedRoot, root, renderPriorityLevel) {
        var node = root;

        while (true) {
          commitUnmount(finishedRoot, node, renderPriorityLevel);

          if (node.child !== null && node.tag !== HostPortal) {
            node.child["return"] = node;
            node = node.child;
            continue;
          }

          if (node === root) {
            return;
          }

          while (node.sibling === null) {
            if (node["return"] === null || node["return"] === root) {
              return;
            }

            node = node["return"];
          }

          node.sibling["return"] = node["return"];
          node = node.sibling;
        }
      }

      function detachFiber(current) {
        var alternate = current.alternate;
        current["return"] = null;
        current.child = null;
        current.memoizedState = null;
        current.updateQueue = null;
        current.dependencies = null;
        current.alternate = null;
        current.firstEffect = null;
        current.lastEffect = null;
        current.pendingProps = null;
        current.memoizedProps = null;
        current.stateNode = null;

        if (alternate !== null) {
          detachFiber(alternate);
        }
      }

      function getHostParentFiber(fiber) {
        var parent = fiber["return"];

        while (parent !== null) {
          if (isHostParent(parent)) {
            return parent;
          }

          parent = parent["return"];
        }

        {
          {
            throw Error("Expected to find a host parent. This error is likely caused by a bug in React. Please file an issue.");
          }
        }
      }

      function isHostParent(fiber) {
        return fiber.tag === HostComponent || fiber.tag === HostRoot || fiber.tag === HostPortal;
      }

      function getHostSibling(fiber) {
        var node = fiber;

        siblings: while (true) {
          while (node.sibling === null) {
            if (node["return"] === null || isHostParent(node["return"])) {
              return null;
            }

            node = node["return"];
          }

          node.sibling["return"] = node["return"];
          node = node.sibling;

          while (node.tag !== HostComponent && node.tag !== HostText && node.tag !== DehydratedFragment) {
            if (node.effectTag & Placement) {
              continue siblings;
            }

            if (node.child === null || node.tag === HostPortal) {
              continue siblings;
            } else {
              node.child["return"] = node;
              node = node.child;
            }
          }

          if (!(node.effectTag & Placement)) {
            return node.stateNode;
          }
        }
      }

      function commitPlacement(finishedWork) {
        var parentFiber = getHostParentFiber(finishedWork);
        var parent;
        var isContainer;
        var parentStateNode = parentFiber.stateNode;

        switch (parentFiber.tag) {
          case HostComponent:
            parent = parentStateNode;
            isContainer = false;
            break;

          case HostRoot:
            parent = parentStateNode.containerInfo;
            isContainer = true;
            break;

          case HostPortal:
            parent = parentStateNode.containerInfo;
            isContainer = true;
            break;

          case FundamentalComponent:
          default:
            {
              {
                throw Error("Invalid host parent fiber. This error is likely caused by a bug in React. Please file an issue.");
              }
            }
        }

        if (parentFiber.effectTag & ContentReset) {
          resetTextContent(parent);
          parentFiber.effectTag &= ~ContentReset;
        }

        var before = getHostSibling(finishedWork);

        if (isContainer) {
          insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
        } else {
          insertOrAppendPlacementNode(finishedWork, before, parent);
        }
      }

      function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
        var tag = node.tag;
        var isHost = tag === HostComponent || tag === HostText;

        if (isHost || enableFundamentalAPI) {
          var stateNode = isHost ? node.stateNode : node.stateNode.instance;

          if (before) {
            insertInContainerBefore(parent, stateNode, before);
          } else {
            appendChildToContainer(parent, stateNode);
          }
        } else if (tag === HostPortal) ;else {
          var child = node.child;

          if (child !== null) {
            insertOrAppendPlacementNodeIntoContainer(child, before, parent);
            var sibling = child.sibling;

            while (sibling !== null) {
              insertOrAppendPlacementNodeIntoContainer(sibling, before, parent);
              sibling = sibling.sibling;
            }
          }
        }
      }

      function insertOrAppendPlacementNode(node, before, parent) {
        var tag = node.tag;
        var isHost = tag === HostComponent || tag === HostText;

        if (isHost || enableFundamentalAPI) {
          var stateNode = isHost ? node.stateNode : node.stateNode.instance;

          if (before) {
            insertBefore(parent, stateNode, before);
          } else {
            appendChild(parent, stateNode);
          }
        } else if (tag === HostPortal) ;else {
          var child = node.child;

          if (child !== null) {
            insertOrAppendPlacementNode(child, before, parent);
            var sibling = child.sibling;

            while (sibling !== null) {
              insertOrAppendPlacementNode(sibling, before, parent);
              sibling = sibling.sibling;
            }
          }
        }
      }

      function unmountHostComponents(finishedRoot, current, renderPriorityLevel) {
        var node = current;
        var currentParentIsValid = false;
        var currentParent;
        var currentParentIsContainer;

        while (true) {
          if (!currentParentIsValid) {
            var parent = node["return"];

            findParent: while (true) {
              if (!(parent !== null)) {
                {
                  throw Error("Expected to find a host parent. This error is likely caused by a bug in React. Please file an issue.");
                }
              }

              var parentStateNode = parent.stateNode;

              switch (parent.tag) {
                case HostComponent:
                  currentParent = parentStateNode;
                  currentParentIsContainer = false;
                  break findParent;

                case HostRoot:
                  currentParent = parentStateNode.containerInfo;
                  currentParentIsContainer = true;
                  break findParent;

                case HostPortal:
                  currentParent = parentStateNode.containerInfo;
                  currentParentIsContainer = true;
                  break findParent;
              }

              parent = parent["return"];
            }

            currentParentIsValid = true;
          }

          if (node.tag === HostComponent || node.tag === HostText) {
            commitNestedUnmounts(finishedRoot, node, renderPriorityLevel);

            if (currentParentIsContainer) {
              removeChildFromContainer(currentParent, node.stateNode);
            } else {
              removeChild(currentParent, node.stateNode);
            }
          } else if (node.tag === HostPortal) {
            if (node.child !== null) {
              currentParent = node.stateNode.containerInfo;
              currentParentIsContainer = true;
              node.child["return"] = node;
              node = node.child;
              continue;
            }
          } else {
            commitUnmount(finishedRoot, node, renderPriorityLevel);

            if (node.child !== null) {
              node.child["return"] = node;
              node = node.child;
              continue;
            }
          }

          if (node === current) {
            return;
          }

          while (node.sibling === null) {
            if (node["return"] === null || node["return"] === current) {
              return;
            }

            node = node["return"];

            if (node.tag === HostPortal) {
              currentParentIsValid = false;
            }
          }

          node.sibling["return"] = node["return"];
          node = node.sibling;
        }
      }

      function commitDeletion(finishedRoot, current, renderPriorityLevel) {
        {
          unmountHostComponents(finishedRoot, current, renderPriorityLevel);
        }
        detachFiber(current);
      }

      function commitWork(current, finishedWork) {
        switch (finishedWork.tag) {
          case FunctionComponent:
          case ForwardRef:
          case MemoComponent:
          case SimpleMemoComponent:
          case Block:
            {
              commitHookEffectListUnmount(Layout | HasEffect, finishedWork);
              return;
            }

          case ClassComponent:
            {
              return;
            }

          case HostComponent:
            {
              var instance = finishedWork.stateNode;

              if (instance != null) {
                var newProps = finishedWork.memoizedProps;
                var oldProps = current !== null ? current.memoizedProps : newProps;
                var type = finishedWork.type;
                var updatePayload = finishedWork.updateQueue;
                finishedWork.updateQueue = null;

                if (updatePayload !== null) {
                  commitUpdate(instance, updatePayload, type, oldProps, newProps);
                }
              }

              return;
            }

          case HostText:
            {
              if (!(finishedWork.stateNode !== null)) {
                {
                  throw Error("This should have a text node initialized. This error is likely caused by a bug in React. Please file an issue.");
                }
              }

              var textInstance = finishedWork.stateNode;
              var newText = finishedWork.memoizedProps;
              var oldText = current !== null ? current.memoizedProps : newText;
              commitTextUpdate(textInstance, oldText, newText);
              return;
            }

          case HostRoot:
            {
              {
                var _root = finishedWork.stateNode;

                if (_root.hydrate) {
                  _root.hydrate = false;
                  commitHydratedContainer(_root.containerInfo);
                }
              }
              return;
            }

          case Profiler:
            {
              return;
            }

          case SuspenseComponent:
            {
              commitSuspenseComponent(finishedWork);
              attachSuspenseRetryListeners(finishedWork);
              return;
            }

          case SuspenseListComponent:
            {
              attachSuspenseRetryListeners(finishedWork);
              return;
            }

          case IncompleteClassComponent:
            {
              return;
            }
        }

        {
          {
            throw Error("This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue.");
          }
        }
      }

      function commitSuspenseComponent(finishedWork) {
        var newState = finishedWork.memoizedState;
        var newDidTimeout;
        var primaryChildParent = finishedWork;

        if (newState === null) {
          newDidTimeout = false;
        } else {
          newDidTimeout = true;
          primaryChildParent = finishedWork.child;
          markCommitTimeOfFallback();
        }

        if (primaryChildParent !== null) {
          hideOrUnhideAllChildren(primaryChildParent, newDidTimeout);
        }
      }

      function commitSuspenseHydrationCallbacks(finishedRoot, finishedWork) {
        var newState = finishedWork.memoizedState;

        if (newState === null) {
          var current = finishedWork.alternate;

          if (current !== null) {
            var prevState = current.memoizedState;

            if (prevState !== null) {
              var suspenseInstance = prevState.dehydrated;

              if (suspenseInstance !== null) {
                commitHydratedSuspenseInstance(suspenseInstance);
              }
            }
          }
        }
      }

      function attachSuspenseRetryListeners(finishedWork) {
        var thenables = finishedWork.updateQueue;

        if (thenables !== null) {
          finishedWork.updateQueue = null;
          var retryCache = finishedWork.stateNode;

          if (retryCache === null) {
            retryCache = finishedWork.stateNode = new PossiblyWeakSet();
          }

          thenables.forEach(function (thenable) {
            var retry = resolveRetryThenable.bind(null, finishedWork, thenable);

            if (!retryCache.has(thenable)) {
              {
                if (thenable.__reactDoNotTraceInteractions !== true) {
                  retry = tracing$1.unstable_wrap(retry);
                }
              }
              retryCache.add(thenable);
              thenable.then(retry, retry);
            }
          });
        }
      }

      function commitResetTextContent(current) {
        resetTextContent(current.stateNode);
      }

      var PossiblyWeakMap$1 = typeof WeakMap === 'function' ? WeakMap : Map;

      function createRootErrorUpdate(fiber, errorInfo, expirationTime) {
        var update = createUpdate(expirationTime, null);
        update.tag = CaptureUpdate;
        update.payload = {
          element: null
        };
        var error = errorInfo.value;

        update.callback = function () {
          onUncaughtError(error);
          logError(fiber, errorInfo);
        };

        return update;
      }

      function createClassErrorUpdate(fiber, errorInfo, expirationTime) {
        var update = createUpdate(expirationTime, null);
        update.tag = CaptureUpdate;
        var getDerivedStateFromError = fiber.type.getDerivedStateFromError;

        if (typeof getDerivedStateFromError === 'function') {
          var error$1 = errorInfo.value;

          update.payload = function () {
            logError(fiber, errorInfo);
            return getDerivedStateFromError(error$1);
          };
        }

        var inst = fiber.stateNode;

        if (inst !== null && typeof inst.componentDidCatch === 'function') {
          update.callback = function callback() {
            {
              markFailedErrorBoundaryForHotReloading(fiber);
            }

            if (typeof getDerivedStateFromError !== 'function') {
              markLegacyErrorBoundaryAsFailed(this);
              logError(fiber, errorInfo);
            }

            var error$1 = errorInfo.value;
            var stack = errorInfo.stack;
            this.componentDidCatch(error$1, {
              componentStack: stack !== null ? stack : ''
            });
            {
              if (typeof getDerivedStateFromError !== 'function') {
                if (fiber.expirationTime !== Sync) {
                  error('%s: Error boundaries should implement getDerivedStateFromError(). ' + 'In that method, return a state update to display an error message or fallback UI.', getComponentName(fiber.type) || 'Unknown');
                }
              }
            }
          };
        } else {
          update.callback = function () {
            markFailedErrorBoundaryForHotReloading(fiber);
          };
        }

        return update;
      }

      function attachPingListener(root, renderExpirationTime, thenable) {
        var pingCache = root.pingCache;
        var threadIDs;

        if (pingCache === null) {
          pingCache = root.pingCache = new PossiblyWeakMap$1();
          threadIDs = new Set();
          pingCache.set(thenable, threadIDs);
        } else {
          threadIDs = pingCache.get(thenable);

          if (threadIDs === undefined) {
            threadIDs = new Set();
            pingCache.set(thenable, threadIDs);
          }
        }

        if (!threadIDs.has(renderExpirationTime)) {
          threadIDs.add(renderExpirationTime);
          var ping = pingSuspendedRoot.bind(null, root, thenable, renderExpirationTime);
          thenable.then(ping, ping);
        }
      }

      function throwException(root, returnFiber, sourceFiber, value, renderExpirationTime) {
        sourceFiber.effectTag |= Incomplete;
        sourceFiber.firstEffect = sourceFiber.lastEffect = null;

        if (value !== null && typeof value === 'object' && typeof value.then === 'function') {
          var thenable = value;

          if ((sourceFiber.mode & BlockingMode) === NoMode) {
            var currentSource = sourceFiber.alternate;

            if (currentSource) {
              sourceFiber.updateQueue = currentSource.updateQueue;
              sourceFiber.memoizedState = currentSource.memoizedState;
              sourceFiber.expirationTime = currentSource.expirationTime;
            } else {
              sourceFiber.updateQueue = null;
              sourceFiber.memoizedState = null;
            }
          }

          var hasInvisibleParentBoundary = hasSuspenseContext(suspenseStackCursor.current, InvisibleParentSuspenseContext);
          var _workInProgress = returnFiber;

          do {
            if (_workInProgress.tag === SuspenseComponent && shouldCaptureSuspense(_workInProgress, hasInvisibleParentBoundary)) {
              var thenables = _workInProgress.updateQueue;

              if (thenables === null) {
                var updateQueue = new Set();
                updateQueue.add(thenable);
                _workInProgress.updateQueue = updateQueue;
              } else {
                thenables.add(thenable);
              }

              if ((_workInProgress.mode & BlockingMode) === NoMode) {
                _workInProgress.effectTag |= DidCapture;
                sourceFiber.effectTag &= ~(LifecycleEffectMask | Incomplete);

                if (sourceFiber.tag === ClassComponent) {
                  var currentSourceFiber = sourceFiber.alternate;

                  if (currentSourceFiber === null) {
                    sourceFiber.tag = IncompleteClassComponent;
                  } else {
                    var update = createUpdate(Sync, null);
                    update.tag = ForceUpdate;
                    enqueueUpdate(sourceFiber, update);
                  }
                }

                sourceFiber.expirationTime = Sync;
                return;
              }

              attachPingListener(root, renderExpirationTime, thenable);
              _workInProgress.effectTag |= ShouldCapture;
              _workInProgress.expirationTime = renderExpirationTime;
              return;
            }

            _workInProgress = _workInProgress["return"];
          } while (_workInProgress !== null);

          value = new Error((getComponentName(sourceFiber.type) || 'A React component') + ' suspended while rendering, but no fallback UI was specified.\n' + '\n' + 'Add a <Suspense fallback=...> component higher in the tree to ' + 'provide a loading indicator or placeholder to display.' + getStackByFiberInDevAndProd(sourceFiber));
        }

        renderDidError();
        value = createCapturedValue(value, sourceFiber);
        var workInProgress = returnFiber;

        do {
          switch (workInProgress.tag) {
            case HostRoot:
              {
                var _errorInfo = value;
                workInProgress.effectTag |= ShouldCapture;
                workInProgress.expirationTime = renderExpirationTime;

                var _update = createRootErrorUpdate(workInProgress, _errorInfo, renderExpirationTime);

                enqueueCapturedUpdate(workInProgress, _update);
                return;
              }

            case ClassComponent:
              var errorInfo = value;
              var ctor = workInProgress.type;
              var instance = workInProgress.stateNode;

              if ((workInProgress.effectTag & DidCapture) === NoEffect && (typeof ctor.getDerivedStateFromError === 'function' || instance !== null && typeof instance.componentDidCatch === 'function' && !isAlreadyFailedLegacyErrorBoundary(instance))) {
                workInProgress.effectTag |= ShouldCapture;
                workInProgress.expirationTime = renderExpirationTime;

                var _update2 = createClassErrorUpdate(workInProgress, errorInfo, renderExpirationTime);

                enqueueCapturedUpdate(workInProgress, _update2);
                return;
              }

              break;
          }

          workInProgress = workInProgress["return"];
        } while (workInProgress !== null);
      }

      var ceil = Math.ceil;
      var ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher,
          ReactCurrentOwner$2 = ReactSharedInternals.ReactCurrentOwner,
          IsSomeRendererActing = ReactSharedInternals.IsSomeRendererActing;
      var NoContext = 0;
      var BatchedContext = 1;
      var EventContext = 2;
      var DiscreteEventContext = 4;
      var LegacyUnbatchedContext = 8;
      var RenderContext = 16;
      var CommitContext = 32;
      var RootIncomplete = 0;
      var RootFatalErrored = 1;
      var RootErrored = 2;
      var RootSuspended = 3;
      var RootSuspendedWithDelay = 4;
      var RootCompleted = 5;
      var executionContext = NoContext;
      var workInProgressRoot = null;
      var workInProgress = null;
      var renderExpirationTime$1 = NoWork;
      var workInProgressRootExitStatus = RootIncomplete;
      var workInProgressRootFatalError = null;
      var workInProgressRootLatestProcessedExpirationTime = Sync;
      var workInProgressRootLatestSuspenseTimeout = Sync;
      var workInProgressRootCanSuspendUsingConfig = null;
      var workInProgressRootNextUnprocessedUpdateTime = NoWork;
      var workInProgressRootHasPendingPing = false;
      var globalMostRecentFallbackTime = 0;
      var FALLBACK_THROTTLE_MS = 500;
      var nextEffect = null;
      var hasUncaughtError = false;
      var firstUncaughtError = null;
      var legacyErrorBoundariesThatAlreadyFailed = null;
      var rootDoesHavePassiveEffects = false;
      var rootWithPendingPassiveEffects = null;
      var pendingPassiveEffectsRenderPriority = NoPriority;
      var pendingPassiveEffectsExpirationTime = NoWork;
      var rootsWithPendingDiscreteUpdates = null;
      var NESTED_UPDATE_LIMIT = 50;
      var nestedUpdateCount = 0;
      var rootWithNestedUpdates = null;
      var NESTED_PASSIVE_UPDATE_LIMIT = 50;
      var nestedPassiveUpdateCount = 0;
      var interruptedBy = null;
      var spawnedWorkDuringRender = null;
      var currentEventTime = NoWork;

      function requestCurrentTimeForUpdate() {
        if ((executionContext & (RenderContext | CommitContext)) !== NoContext) {
          return msToExpirationTime(now());
        }

        if (currentEventTime !== NoWork) {
          return currentEventTime;
        }

        currentEventTime = msToExpirationTime(now());
        return currentEventTime;
      }

      function getCurrentTime() {
        return msToExpirationTime(now());
      }

      function computeExpirationForFiber(currentTime, fiber, suspenseConfig) {
        var mode = fiber.mode;

        if ((mode & BlockingMode) === NoMode) {
          return Sync;
        }

        var priorityLevel = getCurrentPriorityLevel();

        if ((mode & ConcurrentMode) === NoMode) {
          return priorityLevel === ImmediatePriority ? Sync : Batched;
        }

        if ((executionContext & RenderContext) !== NoContext) {
          return renderExpirationTime$1;
        }

        var expirationTime;

        if (suspenseConfig !== null) {
          expirationTime = computeSuspenseExpiration(currentTime, suspenseConfig.timeoutMs | 0 || LOW_PRIORITY_EXPIRATION);
        } else {
          switch (priorityLevel) {
            case ImmediatePriority:
              expirationTime = Sync;
              break;

            case UserBlockingPriority$1:
              expirationTime = computeInteractiveExpiration(currentTime);
              break;

            case NormalPriority:
            case LowPriority:
              expirationTime = computeAsyncExpiration(currentTime);
              break;

            case IdlePriority:
              expirationTime = Idle;
              break;

            default:
              {
                {
                  throw Error("Expected a valid priority level");
                }
              }
          }
        }

        if (workInProgressRoot !== null && expirationTime === renderExpirationTime$1) {
          expirationTime -= 1;
        }

        return expirationTime;
      }

      function scheduleUpdateOnFiber(fiber, expirationTime) {
        checkForNestedUpdates();
        warnAboutRenderPhaseUpdatesInDEV(fiber);
        var root = markUpdateTimeFromFiberToRoot(fiber, expirationTime);

        if (root === null) {
          warnAboutUpdateOnUnmountedFiberInDEV(fiber);
          return;
        }

        checkForInterruption(fiber, expirationTime);
        recordScheduleUpdate();
        var priorityLevel = getCurrentPriorityLevel();

        if (expirationTime === Sync) {
          if ((executionContext & LegacyUnbatchedContext) !== NoContext && (executionContext & (RenderContext | CommitContext)) === NoContext) {
            schedulePendingInteractions(root, expirationTime);
            performSyncWorkOnRoot(root);
          } else {
            ensureRootIsScheduled(root);
            schedulePendingInteractions(root, expirationTime);

            if (executionContext === NoContext) {
              flushSyncCallbackQueue();
            }
          }
        } else {
          ensureRootIsScheduled(root);
          schedulePendingInteractions(root, expirationTime);
        }

        if ((executionContext & DiscreteEventContext) !== NoContext && (priorityLevel === UserBlockingPriority$1 || priorityLevel === ImmediatePriority)) {
          if (rootsWithPendingDiscreteUpdates === null) {
            rootsWithPendingDiscreteUpdates = new Map([[root, expirationTime]]);
          } else {
            var lastDiscreteTime = rootsWithPendingDiscreteUpdates.get(root);

            if (lastDiscreteTime === undefined || lastDiscreteTime > expirationTime) {
              rootsWithPendingDiscreteUpdates.set(root, expirationTime);
            }
          }
        }
      }

      var scheduleWork = scheduleUpdateOnFiber;

      function markUpdateTimeFromFiberToRoot(fiber, expirationTime) {
        if (fiber.expirationTime < expirationTime) {
          fiber.expirationTime = expirationTime;
        }

        var alternate = fiber.alternate;

        if (alternate !== null && alternate.expirationTime < expirationTime) {
          alternate.expirationTime = expirationTime;
        }

        var node = fiber["return"];
        var root = null;

        if (node === null && fiber.tag === HostRoot) {
          root = fiber.stateNode;
        } else {
          while (node !== null) {
            alternate = node.alternate;

            if (node.childExpirationTime < expirationTime) {
              node.childExpirationTime = expirationTime;

              if (alternate !== null && alternate.childExpirationTime < expirationTime) {
                alternate.childExpirationTime = expirationTime;
              }
            } else if (alternate !== null && alternate.childExpirationTime < expirationTime) {
              alternate.childExpirationTime = expirationTime;
            }

            if (node["return"] === null && node.tag === HostRoot) {
              root = node.stateNode;
              break;
            }

            node = node["return"];
          }
        }

        if (root !== null) {
          if (workInProgressRoot === root) {
            markUnprocessedUpdateTime(expirationTime);

            if (workInProgressRootExitStatus === RootSuspendedWithDelay) {
              markRootSuspendedAtTime(root, renderExpirationTime$1);
            }
          }

          markRootUpdatedAtTime(root, expirationTime);
        }

        return root;
      }

      function getNextRootExpirationTimeToWorkOn(root) {
        var lastExpiredTime = root.lastExpiredTime;

        if (lastExpiredTime !== NoWork) {
          return lastExpiredTime;
        }

        var firstPendingTime = root.firstPendingTime;

        if (!isRootSuspendedAtTime(root, firstPendingTime)) {
          return firstPendingTime;
        }

        var lastPingedTime = root.lastPingedTime;
        var nextKnownPendingLevel = root.nextKnownPendingLevel;
        var nextLevel = lastPingedTime > nextKnownPendingLevel ? lastPingedTime : nextKnownPendingLevel;

        if (nextLevel <= Idle && firstPendingTime !== nextLevel) {
          return NoWork;
        }

        return nextLevel;
      }

      function ensureRootIsScheduled(root) {
        var lastExpiredTime = root.lastExpiredTime;

        if (lastExpiredTime !== NoWork) {
          root.callbackExpirationTime = Sync;
          root.callbackPriority = ImmediatePriority;
          root.callbackNode = scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
          return;
        }

        var expirationTime = getNextRootExpirationTimeToWorkOn(root);
        var existingCallbackNode = root.callbackNode;

        if (expirationTime === NoWork) {
          if (existingCallbackNode !== null) {
            root.callbackNode = null;
            root.callbackExpirationTime = NoWork;
            root.callbackPriority = NoPriority;
          }

          return;
        }

        var currentTime = requestCurrentTimeForUpdate();
        var priorityLevel = inferPriorityFromExpirationTime(currentTime, expirationTime);

        if (existingCallbackNode !== null) {
          var existingCallbackPriority = root.callbackPriority;
          var existingCallbackExpirationTime = root.callbackExpirationTime;

          if (existingCallbackExpirationTime === expirationTime && existingCallbackPriority >= priorityLevel) {
            return;
          }

          cancelCallback(existingCallbackNode);
        }

        root.callbackExpirationTime = expirationTime;
        root.callbackPriority = priorityLevel;
        var callbackNode;

        if (expirationTime === Sync) {
          callbackNode = scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
        } else {
          callbackNode = scheduleCallback(priorityLevel, performConcurrentWorkOnRoot.bind(null, root), {
            timeout: expirationTimeToMs(expirationTime) - now()
          });
        }

        root.callbackNode = callbackNode;
      }

      function performConcurrentWorkOnRoot(root, didTimeout) {
        currentEventTime = NoWork;

        if (didTimeout) {
          var currentTime = requestCurrentTimeForUpdate();
          markRootExpiredAtTime(root, currentTime);
          ensureRootIsScheduled(root);
          return null;
        }

        var expirationTime = getNextRootExpirationTimeToWorkOn(root);

        if (expirationTime !== NoWork) {
          var originalCallbackNode = root.callbackNode;

          if (!((executionContext & (RenderContext | CommitContext)) === NoContext)) {
            {
              throw Error("Should not already be working.");
            }
          }

          flushPassiveEffects();

          if (root !== workInProgressRoot || expirationTime !== renderExpirationTime$1) {
            prepareFreshStack(root, expirationTime);
            startWorkOnPendingInteractions(root, expirationTime);
          }

          if (workInProgress !== null) {
            var prevExecutionContext = executionContext;
            executionContext |= RenderContext;
            var prevDispatcher = pushDispatcher();
            var prevInteractions = pushInteractions(root);
            startWorkLoopTimer(workInProgress);

            do {
              try {
                workLoopConcurrent();
                break;
              } catch (thrownValue) {
                handleError(root, thrownValue);
              }
            } while (true);

            resetContextDependencies();
            executionContext = prevExecutionContext;
            popDispatcher(prevDispatcher);
            {
              popInteractions(prevInteractions);
            }

            if (workInProgressRootExitStatus === RootFatalErrored) {
              var fatalError = workInProgressRootFatalError;
              stopInterruptedWorkLoopTimer();
              prepareFreshStack(root, expirationTime);
              markRootSuspendedAtTime(root, expirationTime);
              ensureRootIsScheduled(root);
              throw fatalError;
            }

            if (workInProgress !== null) {
              stopInterruptedWorkLoopTimer();
            } else {
              stopFinishedWorkLoopTimer();
              var finishedWork = root.finishedWork = root.current.alternate;
              root.finishedExpirationTime = expirationTime;
              finishConcurrentRender(root, finishedWork, workInProgressRootExitStatus, expirationTime);
            }

            ensureRootIsScheduled(root);

            if (root.callbackNode === originalCallbackNode) {
              return performConcurrentWorkOnRoot.bind(null, root);
            }
          }
        }

        return null;
      }

      function finishConcurrentRender(root, finishedWork, exitStatus, expirationTime) {
        workInProgressRoot = null;

        switch (exitStatus) {
          case RootIncomplete:
          case RootFatalErrored:
            {
              {
                {
                  throw Error("Root did not complete. This is a bug in React.");
                }
              }
            }

          case RootErrored:
            {
              markRootExpiredAtTime(root, expirationTime > Idle ? Idle : expirationTime);
              break;
            }

          case RootSuspended:
            {
              markRootSuspendedAtTime(root, expirationTime);
              var lastSuspendedTime = root.lastSuspendedTime;

              if (expirationTime === lastSuspendedTime) {
                root.nextKnownPendingLevel = getRemainingExpirationTime(finishedWork);
              }

              var hasNotProcessedNewUpdates = workInProgressRootLatestProcessedExpirationTime === Sync;

              if (hasNotProcessedNewUpdates && !IsThisRendererActing.current) {
                var msUntilTimeout = globalMostRecentFallbackTime + FALLBACK_THROTTLE_MS - now();

                if (msUntilTimeout > 10) {
                  if (workInProgressRootHasPendingPing) {
                    var lastPingedTime = root.lastPingedTime;

                    if (lastPingedTime === NoWork || lastPingedTime >= expirationTime) {
                      root.lastPingedTime = expirationTime;
                      prepareFreshStack(root, expirationTime);
                      break;
                    }
                  }

                  var nextTime = getNextRootExpirationTimeToWorkOn(root);

                  if (nextTime !== NoWork && nextTime !== expirationTime) {
                    break;
                  }

                  if (lastSuspendedTime !== NoWork && lastSuspendedTime !== expirationTime) {
                    root.lastPingedTime = lastSuspendedTime;
                    break;
                  }

                  root.timeoutHandle = scheduleTimeout(commitRoot.bind(null, root), msUntilTimeout);
                  break;
                }
              }

              commitRoot(root);
              break;
            }

          case RootSuspendedWithDelay:
            {
              markRootSuspendedAtTime(root, expirationTime);
              var _lastSuspendedTime = root.lastSuspendedTime;

              if (expirationTime === _lastSuspendedTime) {
                root.nextKnownPendingLevel = getRemainingExpirationTime(finishedWork);
              }

              if (!IsThisRendererActing.current) {
                if (workInProgressRootHasPendingPing) {
                  var _lastPingedTime = root.lastPingedTime;

                  if (_lastPingedTime === NoWork || _lastPingedTime >= expirationTime) {
                    root.lastPingedTime = expirationTime;
                    prepareFreshStack(root, expirationTime);
                    break;
                  }
                }

                var _nextTime = getNextRootExpirationTimeToWorkOn(root);

                if (_nextTime !== NoWork && _nextTime !== expirationTime) {
                  break;
                }

                if (_lastSuspendedTime !== NoWork && _lastSuspendedTime !== expirationTime) {
                  root.lastPingedTime = _lastSuspendedTime;
                  break;
                }

                var _msUntilTimeout;

                if (workInProgressRootLatestSuspenseTimeout !== Sync) {
                  _msUntilTimeout = expirationTimeToMs(workInProgressRootLatestSuspenseTimeout) - now();
                } else if (workInProgressRootLatestProcessedExpirationTime === Sync) {
                  _msUntilTimeout = 0;
                } else {
                  var eventTimeMs = inferTimeFromExpirationTime(workInProgressRootLatestProcessedExpirationTime);
                  var currentTimeMs = now();
                  var timeUntilExpirationMs = expirationTimeToMs(expirationTime) - currentTimeMs;
                  var timeElapsed = currentTimeMs - eventTimeMs;

                  if (timeElapsed < 0) {
                    timeElapsed = 0;
                  }

                  _msUntilTimeout = jnd(timeElapsed) - timeElapsed;

                  if (timeUntilExpirationMs < _msUntilTimeout) {
                    _msUntilTimeout = timeUntilExpirationMs;
                  }
                }

                if (_msUntilTimeout > 10) {
                  root.timeoutHandle = scheduleTimeout(commitRoot.bind(null, root), _msUntilTimeout);
                  break;
                }
              }

              commitRoot(root);
              break;
            }

          case RootCompleted:
            {
              if (!IsThisRendererActing.current && workInProgressRootLatestProcessedExpirationTime !== Sync && workInProgressRootCanSuspendUsingConfig !== null) {
                var _msUntilTimeout2 = computeMsUntilSuspenseLoadingDelay(workInProgressRootLatestProcessedExpirationTime, expirationTime, workInProgressRootCanSuspendUsingConfig);

                if (_msUntilTimeout2 > 10) {
                  markRootSuspendedAtTime(root, expirationTime);
                  root.timeoutHandle = scheduleTimeout(commitRoot.bind(null, root), _msUntilTimeout2);
                  break;
                }
              }

              commitRoot(root);
              break;
            }

          default:
            {
              {
                {
                  throw Error("Unknown root exit status.");
                }
              }
            }
        }
      }

      function performSyncWorkOnRoot(root) {
        var lastExpiredTime = root.lastExpiredTime;
        var expirationTime = lastExpiredTime !== NoWork ? lastExpiredTime : Sync;

        if (!((executionContext & (RenderContext | CommitContext)) === NoContext)) {
          {
            throw Error("Should not already be working.");
          }
        }

        flushPassiveEffects();

        if (root !== workInProgressRoot || expirationTime !== renderExpirationTime$1) {
          prepareFreshStack(root, expirationTime);
          startWorkOnPendingInteractions(root, expirationTime);
        }

        if (workInProgress !== null) {
          var prevExecutionContext = executionContext;
          executionContext |= RenderContext;
          var prevDispatcher = pushDispatcher();
          var prevInteractions = pushInteractions(root);
          startWorkLoopTimer(workInProgress);

          do {
            try {
              workLoopSync();
              break;
            } catch (thrownValue) {
              handleError(root, thrownValue);
            }
          } while (true);

          resetContextDependencies();
          executionContext = prevExecutionContext;
          popDispatcher(prevDispatcher);
          {
            popInteractions(prevInteractions);
          }

          if (workInProgressRootExitStatus === RootFatalErrored) {
            var fatalError = workInProgressRootFatalError;
            stopInterruptedWorkLoopTimer();
            prepareFreshStack(root, expirationTime);
            markRootSuspendedAtTime(root, expirationTime);
            ensureRootIsScheduled(root);
            throw fatalError;
          }

          if (workInProgress !== null) {
            {
              {
                throw Error("Cannot commit an incomplete root. This error is likely caused by a bug in React. Please file an issue.");
              }
            }
          } else {
            stopFinishedWorkLoopTimer();
            root.finishedWork = root.current.alternate;
            root.finishedExpirationTime = expirationTime;
            finishSyncRender(root);
          }

          ensureRootIsScheduled(root);
        }

        return null;
      }

      function finishSyncRender(root) {
        workInProgressRoot = null;
        commitRoot(root);
      }

      function flushDiscreteUpdates() {
        if ((executionContext & (BatchedContext | RenderContext | CommitContext)) !== NoContext) {
          {
            if ((executionContext & RenderContext) !== NoContext) {
              error('unstable_flushDiscreteUpdates: Cannot flush updates when React is ' + 'already rendering.');
            }
          }
          return;
        }

        flushPendingDiscreteUpdates();
        flushPassiveEffects();
      }

      function syncUpdates(fn, a, b, c) {
        return runWithPriority$1(ImmediatePriority, fn.bind(null, a, b, c));
      }

      function flushPendingDiscreteUpdates() {
        if (rootsWithPendingDiscreteUpdates !== null) {
          var roots = rootsWithPendingDiscreteUpdates;
          rootsWithPendingDiscreteUpdates = null;
          roots.forEach(function (expirationTime, root) {
            markRootExpiredAtTime(root, expirationTime);
            ensureRootIsScheduled(root);
          });
          flushSyncCallbackQueue();
        }
      }

      function batchedUpdates$1(fn, a) {
        var prevExecutionContext = executionContext;
        executionContext |= BatchedContext;

        try {
          return fn(a);
        } finally {
          executionContext = prevExecutionContext;

          if (executionContext === NoContext) {
            flushSyncCallbackQueue();
          }
        }
      }

      function batchedEventUpdates$1(fn, a) {
        var prevExecutionContext = executionContext;
        executionContext |= EventContext;

        try {
          return fn(a);
        } finally {
          executionContext = prevExecutionContext;

          if (executionContext === NoContext) {
            flushSyncCallbackQueue();
          }
        }
      }

      function discreteUpdates$1(fn, a, b, c, d) {
        var prevExecutionContext = executionContext;
        executionContext |= DiscreteEventContext;

        try {
          return runWithPriority$1(UserBlockingPriority$1, fn.bind(null, a, b, c, d));
        } finally {
          executionContext = prevExecutionContext;

          if (executionContext === NoContext) {
            flushSyncCallbackQueue();
          }
        }
      }

      function unbatchedUpdates(fn, a) {
        var prevExecutionContext = executionContext;
        executionContext &= ~BatchedContext;
        executionContext |= LegacyUnbatchedContext;

        try {
          return fn(a);
        } finally {
          executionContext = prevExecutionContext;

          if (executionContext === NoContext) {
            flushSyncCallbackQueue();
          }
        }
      }

      function flushSync(fn, a) {
        if ((executionContext & (RenderContext | CommitContext)) !== NoContext) {
          {
            {
              throw Error("flushSync was called from inside a lifecycle method. It cannot be called when React is already rendering.");
            }
          }
        }

        var prevExecutionContext = executionContext;
        executionContext |= BatchedContext;

        try {
          return runWithPriority$1(ImmediatePriority, fn.bind(null, a));
        } finally {
          executionContext = prevExecutionContext;
          flushSyncCallbackQueue();
        }
      }

      function prepareFreshStack(root, expirationTime) {
        root.finishedWork = null;
        root.finishedExpirationTime = NoWork;
        var timeoutHandle = root.timeoutHandle;

        if (timeoutHandle !== noTimeout) {
          root.timeoutHandle = noTimeout;
          cancelTimeout(timeoutHandle);
        }

        if (workInProgress !== null) {
          var interruptedWork = workInProgress["return"];

          while (interruptedWork !== null) {
            unwindInterruptedWork(interruptedWork);
            interruptedWork = interruptedWork["return"];
          }
        }

        workInProgressRoot = root;
        workInProgress = createWorkInProgress(root.current, null);
        renderExpirationTime$1 = expirationTime;
        workInProgressRootExitStatus = RootIncomplete;
        workInProgressRootFatalError = null;
        workInProgressRootLatestProcessedExpirationTime = Sync;
        workInProgressRootLatestSuspenseTimeout = Sync;
        workInProgressRootCanSuspendUsingConfig = null;
        workInProgressRootNextUnprocessedUpdateTime = NoWork;
        workInProgressRootHasPendingPing = false;
        {
          spawnedWorkDuringRender = null;
        }
        {
          ReactStrictModeWarnings.discardPendingWarnings();
        }
      }

      function handleError(root, thrownValue) {
        do {
          try {
            resetContextDependencies();
            resetHooksAfterThrow();
            resetCurrentFiber();

            if (workInProgress === null || workInProgress["return"] === null) {
              workInProgressRootExitStatus = RootFatalErrored;
              workInProgressRootFatalError = thrownValue;
              workInProgress = null;
              return null;
            }

            if (enableProfilerTimer && workInProgress.mode & ProfileMode) {
              stopProfilerTimerIfRunningAndRecordDelta(workInProgress, true);
            }

            throwException(root, workInProgress["return"], workInProgress, thrownValue, renderExpirationTime$1);
            workInProgress = completeUnitOfWork(workInProgress);
          } catch (yetAnotherThrownValue) {
            thrownValue = yetAnotherThrownValue;
            continue;
          }

          return;
        } while (true);
      }

      function pushDispatcher(root) {
        var prevDispatcher = ReactCurrentDispatcher$1.current;
        ReactCurrentDispatcher$1.current = ContextOnlyDispatcher;

        if (prevDispatcher === null) {
          return ContextOnlyDispatcher;
        } else {
          return prevDispatcher;
        }
      }

      function popDispatcher(prevDispatcher) {
        ReactCurrentDispatcher$1.current = prevDispatcher;
      }

      function pushInteractions(root) {
        {
          var prevInteractions = tracing$1.__interactionsRef.current;
          tracing$1.__interactionsRef.current = root.memoizedInteractions;
          return prevInteractions;
        }
      }

      function popInteractions(prevInteractions) {
        {
          tracing$1.__interactionsRef.current = prevInteractions;
        }
      }

      function markCommitTimeOfFallback() {
        globalMostRecentFallbackTime = now();
      }

      function markRenderEventTimeAndConfig(expirationTime, suspenseConfig) {
        if (expirationTime < workInProgressRootLatestProcessedExpirationTime && expirationTime > Idle) {
          workInProgressRootLatestProcessedExpirationTime = expirationTime;
        }

        if (suspenseConfig !== null) {
          if (expirationTime < workInProgressRootLatestSuspenseTimeout && expirationTime > Idle) {
            workInProgressRootLatestSuspenseTimeout = expirationTime;
            workInProgressRootCanSuspendUsingConfig = suspenseConfig;
          }
        }
      }

      function markUnprocessedUpdateTime(expirationTime) {
        if (expirationTime > workInProgressRootNextUnprocessedUpdateTime) {
          workInProgressRootNextUnprocessedUpdateTime = expirationTime;
        }
      }

      function renderDidSuspend() {
        if (workInProgressRootExitStatus === RootIncomplete) {
          workInProgressRootExitStatus = RootSuspended;
        }
      }

      function renderDidSuspendDelayIfPossible() {
        if (workInProgressRootExitStatus === RootIncomplete || workInProgressRootExitStatus === RootSuspended) {
          workInProgressRootExitStatus = RootSuspendedWithDelay;
        }

        if (workInProgressRootNextUnprocessedUpdateTime !== NoWork && workInProgressRoot !== null) {
          markRootSuspendedAtTime(workInProgressRoot, renderExpirationTime$1);
          markRootUpdatedAtTime(workInProgressRoot, workInProgressRootNextUnprocessedUpdateTime);
        }
      }

      function renderDidError() {
        if (workInProgressRootExitStatus !== RootCompleted) {
          workInProgressRootExitStatus = RootErrored;
        }
      }

      function renderHasNotSuspendedYet() {
        return workInProgressRootExitStatus === RootIncomplete;
      }

      function inferTimeFromExpirationTime(expirationTime) {
        var earliestExpirationTimeMs = expirationTimeToMs(expirationTime);
        return earliestExpirationTimeMs - LOW_PRIORITY_EXPIRATION;
      }

      function inferTimeFromExpirationTimeWithSuspenseConfig(expirationTime, suspenseConfig) {
        var earliestExpirationTimeMs = expirationTimeToMs(expirationTime);
        return earliestExpirationTimeMs - (suspenseConfig.timeoutMs | 0 || LOW_PRIORITY_EXPIRATION);
      }

      function workLoopSync() {
        while (workInProgress !== null) {
          workInProgress = performUnitOfWork(workInProgress);
        }
      }

      function workLoopConcurrent() {
        while (workInProgress !== null && !shouldYield()) {
          workInProgress = performUnitOfWork(workInProgress);
        }
      }

      function performUnitOfWork(unitOfWork) {
        var current = unitOfWork.alternate;
        startWorkTimer(unitOfWork);
        setCurrentFiber(unitOfWork);
        var next;

        if ((unitOfWork.mode & ProfileMode) !== NoMode) {
          startProfilerTimer(unitOfWork);
          next = beginWork$1(current, unitOfWork, renderExpirationTime$1);
          stopProfilerTimerIfRunningAndRecordDelta(unitOfWork, true);
        } else {
          next = beginWork$1(current, unitOfWork, renderExpirationTime$1);
        }

        resetCurrentFiber();
        unitOfWork.memoizedProps = unitOfWork.pendingProps;

        if (next === null) {
          next = completeUnitOfWork(unitOfWork);
        }

        ReactCurrentOwner$2.current = null;
        return next;
      }

      function completeUnitOfWork(unitOfWork) {
        workInProgress = unitOfWork;

        do {
          var current = workInProgress.alternate;
          var returnFiber = workInProgress["return"];

          if ((workInProgress.effectTag & Incomplete) === NoEffect) {
            setCurrentFiber(workInProgress);
            var next = void 0;

            if ((workInProgress.mode & ProfileMode) === NoMode) {
              next = completeWork(current, workInProgress, renderExpirationTime$1);
            } else {
              startProfilerTimer(workInProgress);
              next = completeWork(current, workInProgress, renderExpirationTime$1);
              stopProfilerTimerIfRunningAndRecordDelta(workInProgress, false);
            }

            stopWorkTimer(workInProgress);
            resetCurrentFiber();
            resetChildExpirationTime(workInProgress);

            if (next !== null) {
              return next;
            }

            if (returnFiber !== null && (returnFiber.effectTag & Incomplete) === NoEffect) {
              if (returnFiber.firstEffect === null) {
                returnFiber.firstEffect = workInProgress.firstEffect;
              }

              if (workInProgress.lastEffect !== null) {
                if (returnFiber.lastEffect !== null) {
                  returnFiber.lastEffect.nextEffect = workInProgress.firstEffect;
                }

                returnFiber.lastEffect = workInProgress.lastEffect;
              }

              var effectTag = workInProgress.effectTag;

              if (effectTag > PerformedWork) {
                if (returnFiber.lastEffect !== null) {
                  returnFiber.lastEffect.nextEffect = workInProgress;
                } else {
                  returnFiber.firstEffect = workInProgress;
                }

                returnFiber.lastEffect = workInProgress;
              }
            }
          } else {
            var _next = unwindWork(workInProgress);

            if ((workInProgress.mode & ProfileMode) !== NoMode) {
              stopProfilerTimerIfRunningAndRecordDelta(workInProgress, false);
              var actualDuration = workInProgress.actualDuration;
              var child = workInProgress.child;

              while (child !== null) {
                actualDuration += child.actualDuration;
                child = child.sibling;
              }

              workInProgress.actualDuration = actualDuration;
            }

            if (_next !== null) {
              stopFailedWorkTimer(workInProgress);
              _next.effectTag &= HostEffectMask;
              return _next;
            }

            stopWorkTimer(workInProgress);

            if (returnFiber !== null) {
              returnFiber.firstEffect = returnFiber.lastEffect = null;
              returnFiber.effectTag |= Incomplete;
            }
          }

          var siblingFiber = workInProgress.sibling;

          if (siblingFiber !== null) {
            return siblingFiber;
          }

          workInProgress = returnFiber;
        } while (workInProgress !== null);

        if (workInProgressRootExitStatus === RootIncomplete) {
          workInProgressRootExitStatus = RootCompleted;
        }

        return null;
      }

      function getRemainingExpirationTime(fiber) {
        var updateExpirationTime = fiber.expirationTime;
        var childExpirationTime = fiber.childExpirationTime;
        return updateExpirationTime > childExpirationTime ? updateExpirationTime : childExpirationTime;
      }

      function resetChildExpirationTime(completedWork) {
        if (renderExpirationTime$1 !== Never && completedWork.childExpirationTime === Never) {
          return;
        }

        var newChildExpirationTime = NoWork;

        if ((completedWork.mode & ProfileMode) !== NoMode) {
          var actualDuration = completedWork.actualDuration;
          var treeBaseDuration = completedWork.selfBaseDuration;
          var shouldBubbleActualDurations = completedWork.alternate === null || completedWork.child !== completedWork.alternate.child;
          var child = completedWork.child;

          while (child !== null) {
            var childUpdateExpirationTime = child.expirationTime;
            var childChildExpirationTime = child.childExpirationTime;

            if (childUpdateExpirationTime > newChildExpirationTime) {
              newChildExpirationTime = childUpdateExpirationTime;
            }

            if (childChildExpirationTime > newChildExpirationTime) {
              newChildExpirationTime = childChildExpirationTime;
            }

            if (shouldBubbleActualDurations) {
              actualDuration += child.actualDuration;
            }

            treeBaseDuration += child.treeBaseDuration;
            child = child.sibling;
          }

          completedWork.actualDuration = actualDuration;
          completedWork.treeBaseDuration = treeBaseDuration;
        } else {
          var _child = completedWork.child;

          while (_child !== null) {
            var _childUpdateExpirationTime = _child.expirationTime;
            var _childChildExpirationTime = _child.childExpirationTime;

            if (_childUpdateExpirationTime > newChildExpirationTime) {
              newChildExpirationTime = _childUpdateExpirationTime;
            }

            if (_childChildExpirationTime > newChildExpirationTime) {
              newChildExpirationTime = _childChildExpirationTime;
            }

            _child = _child.sibling;
          }
        }

        completedWork.childExpirationTime = newChildExpirationTime;
      }

      function commitRoot(root) {
        var renderPriorityLevel = getCurrentPriorityLevel();
        runWithPriority$1(ImmediatePriority, commitRootImpl.bind(null, root, renderPriorityLevel));
        return null;
      }

      function commitRootImpl(root, renderPriorityLevel) {
        do {
          flushPassiveEffects();
        } while (rootWithPendingPassiveEffects !== null);

        flushRenderPhaseStrictModeWarningsInDEV();

        if (!((executionContext & (RenderContext | CommitContext)) === NoContext)) {
          {
            throw Error("Should not already be working.");
          }
        }

        var finishedWork = root.finishedWork;
        var expirationTime = root.finishedExpirationTime;

        if (finishedWork === null) {
          return null;
        }

        root.finishedWork = null;
        root.finishedExpirationTime = NoWork;

        if (!(finishedWork !== root.current)) {
          {
            throw Error("Cannot commit the same tree as before. This error is likely caused by a bug in React. Please file an issue.");
          }
        }

        root.callbackNode = null;
        root.callbackExpirationTime = NoWork;
        root.callbackPriority = NoPriority;
        root.nextKnownPendingLevel = NoWork;
        startCommitTimer();
        var remainingExpirationTimeBeforeCommit = getRemainingExpirationTime(finishedWork);
        markRootFinishedAtTime(root, expirationTime, remainingExpirationTimeBeforeCommit);

        if (root === workInProgressRoot) {
          workInProgressRoot = null;
          workInProgress = null;
          renderExpirationTime$1 = NoWork;
        }

        var firstEffect;

        if (finishedWork.effectTag > PerformedWork) {
          if (finishedWork.lastEffect !== null) {
            finishedWork.lastEffect.nextEffect = finishedWork;
            firstEffect = finishedWork.firstEffect;
          } else {
            firstEffect = finishedWork;
          }
        } else {
          firstEffect = finishedWork.firstEffect;
        }

        if (firstEffect !== null) {
          var prevExecutionContext = executionContext;
          executionContext |= CommitContext;
          var prevInteractions = pushInteractions(root);
          ReactCurrentOwner$2.current = null;
          startCommitSnapshotEffectsTimer();
          prepareForCommit();
          nextEffect = firstEffect;

          do {
            {
              invokeGuardedCallback(null, commitBeforeMutationEffects, null);

              if (hasCaughtError()) {
                if (!(nextEffect !== null)) {
                  {
                    throw Error("Should be working on an effect.");
                  }
                }

                var error = clearCaughtError();
                captureCommitPhaseError(nextEffect, error);
                nextEffect = nextEffect.nextEffect;
              }
            }
          } while (nextEffect !== null);

          stopCommitSnapshotEffectsTimer();
          {
            recordCommitTime();
          }
          startCommitHostEffectsTimer();
          nextEffect = firstEffect;

          do {
            {
              invokeGuardedCallback(null, commitMutationEffects, null, root, renderPriorityLevel);

              if (hasCaughtError()) {
                if (!(nextEffect !== null)) {
                  {
                    throw Error("Should be working on an effect.");
                  }
                }

                var _error = clearCaughtError();

                captureCommitPhaseError(nextEffect, _error);
                nextEffect = nextEffect.nextEffect;
              }
            }
          } while (nextEffect !== null);

          stopCommitHostEffectsTimer();
          resetAfterCommit();
          root.current = finishedWork;
          startCommitLifeCyclesTimer();
          nextEffect = firstEffect;

          do {
            {
              invokeGuardedCallback(null, commitLayoutEffects, null, root, expirationTime);

              if (hasCaughtError()) {
                if (!(nextEffect !== null)) {
                  {
                    throw Error("Should be working on an effect.");
                  }
                }

                var _error2 = clearCaughtError();

                captureCommitPhaseError(nextEffect, _error2);
                nextEffect = nextEffect.nextEffect;
              }
            }
          } while (nextEffect !== null);

          stopCommitLifeCyclesTimer();
          nextEffect = null;
          requestPaint();
          {
            popInteractions(prevInteractions);
          }
          executionContext = prevExecutionContext;
        } else {
          root.current = finishedWork;
          startCommitSnapshotEffectsTimer();
          stopCommitSnapshotEffectsTimer();
          {
            recordCommitTime();
          }
          startCommitHostEffectsTimer();
          stopCommitHostEffectsTimer();
          startCommitLifeCyclesTimer();
          stopCommitLifeCyclesTimer();
        }

        stopCommitTimer();
        var rootDidHavePassiveEffects = rootDoesHavePassiveEffects;

        if (rootDoesHavePassiveEffects) {
          rootDoesHavePassiveEffects = false;
          rootWithPendingPassiveEffects = root;
          pendingPassiveEffectsExpirationTime = expirationTime;
          pendingPassiveEffectsRenderPriority = renderPriorityLevel;
        } else {
          nextEffect = firstEffect;

          while (nextEffect !== null) {
            var nextNextEffect = nextEffect.nextEffect;
            nextEffect.nextEffect = null;
            nextEffect = nextNextEffect;
          }
        }

        var remainingExpirationTime = root.firstPendingTime;

        if (remainingExpirationTime !== NoWork) {
          {
            if (spawnedWorkDuringRender !== null) {
              var expirationTimes = spawnedWorkDuringRender;
              spawnedWorkDuringRender = null;

              for (var i = 0; i < expirationTimes.length; i++) {
                scheduleInteractions(root, expirationTimes[i], root.memoizedInteractions);
              }
            }

            schedulePendingInteractions(root, remainingExpirationTime);
          }
        } else {
          legacyErrorBoundariesThatAlreadyFailed = null;
        }

        {
          if (!rootDidHavePassiveEffects) {
            finishPendingInteractions(root, expirationTime);
          }
        }

        if (remainingExpirationTime === Sync) {
          if (root === rootWithNestedUpdates) {
            nestedUpdateCount++;
          } else {
            nestedUpdateCount = 0;
            rootWithNestedUpdates = root;
          }
        } else {
          nestedUpdateCount = 0;
        }

        onCommitRoot(finishedWork.stateNode, expirationTime);
        ensureRootIsScheduled(root);

        if (hasUncaughtError) {
          hasUncaughtError = false;
          var _error3 = firstUncaughtError;
          firstUncaughtError = null;
          throw _error3;
        }

        if ((executionContext & LegacyUnbatchedContext) !== NoContext) {
          return null;
        }

        flushSyncCallbackQueue();
        return null;
      }

      function commitBeforeMutationEffects() {
        while (nextEffect !== null) {
          var effectTag = nextEffect.effectTag;

          if ((effectTag & Snapshot) !== NoEffect) {
            setCurrentFiber(nextEffect);
            recordEffect();
            var current = nextEffect.alternate;
            commitBeforeMutationLifeCycles(current, nextEffect);
            resetCurrentFiber();
          }

          if ((effectTag & Passive) !== NoEffect) {
            if (!rootDoesHavePassiveEffects) {
              rootDoesHavePassiveEffects = true;
              scheduleCallback(NormalPriority, function () {
                flushPassiveEffects();
                return null;
              });
            }
          }

          nextEffect = nextEffect.nextEffect;
        }
      }

      function commitMutationEffects(root, renderPriorityLevel) {
        while (nextEffect !== null) {
          setCurrentFiber(nextEffect);
          var effectTag = nextEffect.effectTag;

          if (effectTag & ContentReset) {
            commitResetTextContent(nextEffect);
          }

          if (effectTag & Ref) {
            var current = nextEffect.alternate;

            if (current !== null) {
              commitDetachRef(current);
            }
          }

          var primaryEffectTag = effectTag & (Placement | Update | Deletion | Hydrating);

          switch (primaryEffectTag) {
            case Placement:
              {
                commitPlacement(nextEffect);
                nextEffect.effectTag &= ~Placement;
                break;
              }

            case PlacementAndUpdate:
              {
                commitPlacement(nextEffect);
                nextEffect.effectTag &= ~Placement;
                var _current = nextEffect.alternate;
                commitWork(_current, nextEffect);
                break;
              }

            case Hydrating:
              {
                nextEffect.effectTag &= ~Hydrating;
                break;
              }

            case HydratingAndUpdate:
              {
                nextEffect.effectTag &= ~Hydrating;
                var _current2 = nextEffect.alternate;
                commitWork(_current2, nextEffect);
                break;
              }

            case Update:
              {
                var _current3 = nextEffect.alternate;
                commitWork(_current3, nextEffect);
                break;
              }

            case Deletion:
              {
                commitDeletion(root, nextEffect, renderPriorityLevel);
                break;
              }
          }

          recordEffect();
          resetCurrentFiber();
          nextEffect = nextEffect.nextEffect;
        }
      }

      function commitLayoutEffects(root, committedExpirationTime) {
        while (nextEffect !== null) {
          setCurrentFiber(nextEffect);
          var effectTag = nextEffect.effectTag;

          if (effectTag & (Update | Callback)) {
            recordEffect();
            var current = nextEffect.alternate;
            commitLifeCycles(root, current, nextEffect);
          }

          if (effectTag & Ref) {
            recordEffect();
            commitAttachRef(nextEffect);
          }

          resetCurrentFiber();
          nextEffect = nextEffect.nextEffect;
        }
      }

      function flushPassiveEffects() {
        if (pendingPassiveEffectsRenderPriority !== NoPriority) {
          var priorityLevel = pendingPassiveEffectsRenderPriority > NormalPriority ? NormalPriority : pendingPassiveEffectsRenderPriority;
          pendingPassiveEffectsRenderPriority = NoPriority;
          return runWithPriority$1(priorityLevel, flushPassiveEffectsImpl);
        }
      }

      function flushPassiveEffectsImpl() {
        if (rootWithPendingPassiveEffects === null) {
          return false;
        }

        var root = rootWithPendingPassiveEffects;
        var expirationTime = pendingPassiveEffectsExpirationTime;
        rootWithPendingPassiveEffects = null;
        pendingPassiveEffectsExpirationTime = NoWork;

        if (!((executionContext & (RenderContext | CommitContext)) === NoContext)) {
          {
            throw Error("Cannot flush passive effects while already rendering.");
          }
        }

        var prevExecutionContext = executionContext;
        executionContext |= CommitContext;
        var prevInteractions = pushInteractions(root);
        {
          var _effect2 = root.current.firstEffect;

          while (_effect2 !== null) {
            {
              setCurrentFiber(_effect2);
              invokeGuardedCallback(null, commitPassiveHookEffects, null, _effect2);

              if (hasCaughtError()) {
                if (!(_effect2 !== null)) {
                  {
                    throw Error("Should be working on an effect.");
                  }
                }

                var _error5 = clearCaughtError();

                captureCommitPhaseError(_effect2, _error5);
              }

              resetCurrentFiber();
            }
            var nextNextEffect = _effect2.nextEffect;
            _effect2.nextEffect = null;
            _effect2 = nextNextEffect;
          }
        }
        {
          popInteractions(prevInteractions);
          finishPendingInteractions(root, expirationTime);
        }
        executionContext = prevExecutionContext;
        flushSyncCallbackQueue();
        nestedPassiveUpdateCount = rootWithPendingPassiveEffects === null ? 0 : nestedPassiveUpdateCount + 1;
        return true;
      }

      function isAlreadyFailedLegacyErrorBoundary(instance) {
        return legacyErrorBoundariesThatAlreadyFailed !== null && legacyErrorBoundariesThatAlreadyFailed.has(instance);
      }

      function markLegacyErrorBoundaryAsFailed(instance) {
        if (legacyErrorBoundariesThatAlreadyFailed === null) {
          legacyErrorBoundariesThatAlreadyFailed = new Set([instance]);
        } else {
          legacyErrorBoundariesThatAlreadyFailed.add(instance);
        }
      }

      function prepareToThrowUncaughtError(error) {
        if (!hasUncaughtError) {
          hasUncaughtError = true;
          firstUncaughtError = error;
        }
      }

      var onUncaughtError = prepareToThrowUncaughtError;

      function captureCommitPhaseErrorOnRoot(rootFiber, sourceFiber, error) {
        var errorInfo = createCapturedValue(error, sourceFiber);
        var update = createRootErrorUpdate(rootFiber, errorInfo, Sync);
        enqueueUpdate(rootFiber, update);
        var root = markUpdateTimeFromFiberToRoot(rootFiber, Sync);

        if (root !== null) {
          ensureRootIsScheduled(root);
          schedulePendingInteractions(root, Sync);
        }
      }

      function captureCommitPhaseError(sourceFiber, error) {
        if (sourceFiber.tag === HostRoot) {
          captureCommitPhaseErrorOnRoot(sourceFiber, sourceFiber, error);
          return;
        }

        var fiber = sourceFiber["return"];

        while (fiber !== null) {
          if (fiber.tag === HostRoot) {
            captureCommitPhaseErrorOnRoot(fiber, sourceFiber, error);
            return;
          } else if (fiber.tag === ClassComponent) {
            var ctor = fiber.type;
            var instance = fiber.stateNode;

            if (typeof ctor.getDerivedStateFromError === 'function' || typeof instance.componentDidCatch === 'function' && !isAlreadyFailedLegacyErrorBoundary(instance)) {
              var errorInfo = createCapturedValue(error, sourceFiber);
              var update = createClassErrorUpdate(fiber, errorInfo, Sync);
              enqueueUpdate(fiber, update);
              var root = markUpdateTimeFromFiberToRoot(fiber, Sync);

              if (root !== null) {
                ensureRootIsScheduled(root);
                schedulePendingInteractions(root, Sync);
              }

              return;
            }
          }

          fiber = fiber["return"];
        }
      }

      function pingSuspendedRoot(root, thenable, suspendedTime) {
        var pingCache = root.pingCache;

        if (pingCache !== null) {
          pingCache["delete"](thenable);
        }

        if (workInProgressRoot === root && renderExpirationTime$1 === suspendedTime) {
          if (workInProgressRootExitStatus === RootSuspendedWithDelay || workInProgressRootExitStatus === RootSuspended && workInProgressRootLatestProcessedExpirationTime === Sync && now() - globalMostRecentFallbackTime < FALLBACK_THROTTLE_MS) {
            prepareFreshStack(root, renderExpirationTime$1);
          } else {
            workInProgressRootHasPendingPing = true;
          }

          return;
        }

        if (!isRootSuspendedAtTime(root, suspendedTime)) {
          return;
        }

        var lastPingedTime = root.lastPingedTime;

        if (lastPingedTime !== NoWork && lastPingedTime < suspendedTime) {
          return;
        }

        root.lastPingedTime = suspendedTime;
        ensureRootIsScheduled(root);
        schedulePendingInteractions(root, suspendedTime);
      }

      function retryTimedOutBoundary(boundaryFiber, retryTime) {
        if (retryTime === NoWork) {
          var suspenseConfig = null;
          var currentTime = requestCurrentTimeForUpdate();
          retryTime = computeExpirationForFiber(currentTime, boundaryFiber, suspenseConfig);
        }

        var root = markUpdateTimeFromFiberToRoot(boundaryFiber, retryTime);

        if (root !== null) {
          ensureRootIsScheduled(root);
          schedulePendingInteractions(root, retryTime);
        }
      }

      function resolveRetryThenable(boundaryFiber, thenable) {
        var retryTime = NoWork;
        var retryCache;
        {
          retryCache = boundaryFiber.stateNode;
        }

        if (retryCache !== null) {
          retryCache["delete"](thenable);
        }

        retryTimedOutBoundary(boundaryFiber, retryTime);
      }

      function jnd(timeElapsed) {
        return timeElapsed < 120 ? 120 : timeElapsed < 480 ? 480 : timeElapsed < 1080 ? 1080 : timeElapsed < 1920 ? 1920 : timeElapsed < 3000 ? 3000 : timeElapsed < 4320 ? 4320 : ceil(timeElapsed / 1960) * 1960;
      }

      function computeMsUntilSuspenseLoadingDelay(mostRecentEventTime, committedExpirationTime, suspenseConfig) {
        var busyMinDurationMs = suspenseConfig.busyMinDurationMs | 0;

        if (busyMinDurationMs <= 0) {
          return 0;
        }

        var busyDelayMs = suspenseConfig.busyDelayMs | 0;
        var currentTimeMs = now();
        var eventTimeMs = inferTimeFromExpirationTimeWithSuspenseConfig(mostRecentEventTime, suspenseConfig);
        var timeElapsed = currentTimeMs - eventTimeMs;

        if (timeElapsed <= busyDelayMs) {
          return 0;
        }

        var msUntilTimeout = busyDelayMs + busyMinDurationMs - timeElapsed;
        return msUntilTimeout;
      }

      function checkForNestedUpdates() {
        if (nestedUpdateCount > NESTED_UPDATE_LIMIT) {
          nestedUpdateCount = 0;
          rootWithNestedUpdates = null;
          {
            {
              throw Error("Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.");
            }
          }
        }

        {
          if (nestedPassiveUpdateCount > NESTED_PASSIVE_UPDATE_LIMIT) {
            nestedPassiveUpdateCount = 0;
            error('Maximum update depth exceeded. This can happen when a component ' + "calls setState inside useEffect, but useEffect either doesn't " + 'have a dependency array, or one of the dependencies changes on ' + 'every render.');
          }
        }
      }

      function flushRenderPhaseStrictModeWarningsInDEV() {
        {
          ReactStrictModeWarnings.flushLegacyContextWarning();
          {
            ReactStrictModeWarnings.flushPendingUnsafeLifecycleWarnings();
          }
        }
      }

      function stopFinishedWorkLoopTimer() {
        var didCompleteRoot = true;
        stopWorkLoopTimer(interruptedBy, didCompleteRoot);
        interruptedBy = null;
      }

      function stopInterruptedWorkLoopTimer() {
        var didCompleteRoot = false;
        stopWorkLoopTimer(interruptedBy, didCompleteRoot);
        interruptedBy = null;
      }

      function checkForInterruption(fiberThatReceivedUpdate, updateExpirationTime) {
        if (workInProgressRoot !== null && updateExpirationTime > renderExpirationTime$1) {
          interruptedBy = fiberThatReceivedUpdate;
        }
      }

      var didWarnStateUpdateForUnmountedComponent = null;

      function warnAboutUpdateOnUnmountedFiberInDEV(fiber) {
        {
          var tag = fiber.tag;

          if (tag !== HostRoot && tag !== ClassComponent && tag !== FunctionComponent && tag !== ForwardRef && tag !== MemoComponent && tag !== SimpleMemoComponent && tag !== Block) {
            return;
          }

          var componentName = getComponentName(fiber.type) || 'ReactComponent';

          if (didWarnStateUpdateForUnmountedComponent !== null) {
            if (didWarnStateUpdateForUnmountedComponent.has(componentName)) {
              return;
            }

            didWarnStateUpdateForUnmountedComponent.add(componentName);
          } else {
            didWarnStateUpdateForUnmountedComponent = new Set([componentName]);
          }

          error("Can't perform a React state update on an unmounted component. This " + 'is a no-op, but it indicates a memory leak in your application. To ' + 'fix, cancel all subscriptions and asynchronous tasks in %s.%s', tag === ClassComponent ? 'the componentWillUnmount method' : 'a useEffect cleanup function', getStackByFiberInDevAndProd(fiber));
        }
      }

      var beginWork$1;
      {
        var dummyFiber = null;

        beginWork$1 = function beginWork$1(current, unitOfWork, expirationTime) {
          var originalWorkInProgressCopy = assignFiberPropertiesInDEV(dummyFiber, unitOfWork);

          try {
            return beginWork(current, unitOfWork, expirationTime);
          } catch (originalError) {
            if (originalError !== null && typeof originalError === 'object' && typeof originalError.then === 'function') {
              throw originalError;
            }

            resetContextDependencies();
            resetHooksAfterThrow();
            unwindInterruptedWork(unitOfWork);
            assignFiberPropertiesInDEV(unitOfWork, originalWorkInProgressCopy);

            if (unitOfWork.mode & ProfileMode) {
              startProfilerTimer(unitOfWork);
            }

            invokeGuardedCallback(null, beginWork, null, current, unitOfWork, expirationTime);

            if (hasCaughtError()) {
              var replayError = clearCaughtError();
              throw replayError;
            } else {
              throw originalError;
            }
          }
        };
      }
      var didWarnAboutUpdateInRender = false;
      var didWarnAboutUpdateInRenderForAnotherComponent;
      {
        didWarnAboutUpdateInRenderForAnotherComponent = new Set();
      }

      function warnAboutRenderPhaseUpdatesInDEV(fiber) {
        {
          if (isRendering && (executionContext & RenderContext) !== NoContext) {
            switch (fiber.tag) {
              case FunctionComponent:
              case ForwardRef:
              case SimpleMemoComponent:
                {
                  var renderingComponentName = workInProgress && getComponentName(workInProgress.type) || 'Unknown';
                  var dedupeKey = renderingComponentName;

                  if (!didWarnAboutUpdateInRenderForAnotherComponent.has(dedupeKey)) {
                    didWarnAboutUpdateInRenderForAnotherComponent.add(dedupeKey);
                    var setStateComponentName = getComponentName(fiber.type) || 'Unknown';
                    error('Cannot update a component (`%s`) while rendering a ' + 'different component (`%s`). To locate the bad setState() call inside `%s`, ' + 'follow the stack trace as described in https://fb.me/setstate-in-render', setStateComponentName, renderingComponentName, renderingComponentName);
                  }

                  break;
                }

              case ClassComponent:
                {
                  if (!didWarnAboutUpdateInRender) {
                    error('Cannot update during an existing state transition (such as ' + 'within `render`). Render methods should be a pure ' + 'function of props and state.');
                    didWarnAboutUpdateInRender = true;
                  }

                  break;
                }
            }
          }
        }
      }

      var IsThisRendererActing = {
        current: false
      };

      function warnIfNotScopedWithMatchingAct(fiber) {
        {
          if (IsSomeRendererActing.current === true && IsThisRendererActing.current !== true) {
            error("It looks like you're using the wrong act() around your test interactions.\n" + 'Be sure to use the matching version of act() corresponding to your renderer:\n\n' + '// for react-dom:\n' + "import {act} from 'react-dom/test-utils';\n" + '// ...\n' + 'act(() => ...);\n\n' + '// for react-test-renderer:\n' + "import TestRenderer from 'react-test-renderer';\n" + 'const {act} = TestRenderer;\n' + '// ...\n' + 'act(() => ...);' + '%s', getStackByFiberInDevAndProd(fiber));
          }
        }
      }

      function warnIfNotCurrentlyActingEffectsInDEV(fiber) {
        {
          if ((fiber.mode & StrictMode) !== NoMode && IsSomeRendererActing.current === false && IsThisRendererActing.current === false) {
            error('An update to %s ran an effect, but was not wrapped in act(...).\n\n' + 'When testing, code that causes React state updates should be ' + 'wrapped into act(...):\n\n' + 'act(() => {\n' + '  /* fire events that update state */\n' + '});\n' + '/* assert on the output */\n\n' + "This ensures that you're testing the behavior the user would see " + 'in the browser.' + ' Learn more at https://fb.me/react-wrap-tests-with-act' + '%s', getComponentName(fiber.type), getStackByFiberInDevAndProd(fiber));
          }
        }
      }

      function warnIfNotCurrentlyActingUpdatesInDEV(fiber) {
        {
          if (executionContext === NoContext && IsSomeRendererActing.current === false && IsThisRendererActing.current === false) {
            error('An update to %s inside a test was not wrapped in act(...).\n\n' + 'When testing, code that causes React state updates should be ' + 'wrapped into act(...):\n\n' + 'act(() => {\n' + '  /* fire events that update state */\n' + '});\n' + '/* assert on the output */\n\n' + "This ensures that you're testing the behavior the user would see " + 'in the browser.' + ' Learn more at https://fb.me/react-wrap-tests-with-act' + '%s', getComponentName(fiber.type), getStackByFiberInDevAndProd(fiber));
          }
        }
      }

      var warnIfNotCurrentlyActingUpdatesInDev = warnIfNotCurrentlyActingUpdatesInDEV;
      var didWarnAboutUnmockedScheduler = false;

      function warnIfUnmockedScheduler(fiber) {
        {
          if (didWarnAboutUnmockedScheduler === false && Scheduler.unstable_flushAllWithoutAsserting === undefined) {
            if (fiber.mode & BlockingMode || fiber.mode & ConcurrentMode) {
              didWarnAboutUnmockedScheduler = true;
              error('In Concurrent or Sync modes, the "scheduler" module needs to be mocked ' + 'to guarantee consistent behaviour across tests and browsers. ' + 'For example, with jest: \n' + "jest.mock('scheduler', () => require('scheduler/unstable_mock'));\n\n" + 'For more info, visit https://fb.me/react-mock-scheduler');
            }
          }
        }
      }

      function computeThreadID(root, expirationTime) {
        return expirationTime * 1000 + root.interactionThreadID;
      }

      function markSpawnedWork(expirationTime) {
        if (spawnedWorkDuringRender === null) {
          spawnedWorkDuringRender = [expirationTime];
        } else {
          spawnedWorkDuringRender.push(expirationTime);
        }
      }

      function scheduleInteractions(root, expirationTime, interactions) {
        if (interactions.size > 0) {
          var pendingInteractionMap = root.pendingInteractionMap;
          var pendingInteractions = pendingInteractionMap.get(expirationTime);

          if (pendingInteractions != null) {
            interactions.forEach(function (interaction) {
              if (!pendingInteractions.has(interaction)) {
                interaction.__count++;
              }

              pendingInteractions.add(interaction);
            });
          } else {
            pendingInteractionMap.set(expirationTime, new Set(interactions));
            interactions.forEach(function (interaction) {
              interaction.__count++;
            });
          }

          var subscriber = tracing$1.__subscriberRef.current;

          if (subscriber !== null) {
            var threadID = computeThreadID(root, expirationTime);
            subscriber.onWorkScheduled(interactions, threadID);
          }
        }
      }

      function schedulePendingInteractions(root, expirationTime) {
        scheduleInteractions(root, expirationTime, tracing$1.__interactionsRef.current);
      }

      function startWorkOnPendingInteractions(root, expirationTime) {
        var interactions = new Set();
        root.pendingInteractionMap.forEach(function (scheduledInteractions, scheduledExpirationTime) {
          if (scheduledExpirationTime >= expirationTime) {
            scheduledInteractions.forEach(function (interaction) {
              return interactions.add(interaction);
            });
          }
        });
        root.memoizedInteractions = interactions;

        if (interactions.size > 0) {
          var subscriber = tracing$1.__subscriberRef.current;

          if (subscriber !== null) {
            var threadID = computeThreadID(root, expirationTime);

            try {
              subscriber.onWorkStarted(interactions, threadID);
            } catch (error) {
              scheduleCallback(ImmediatePriority, function () {
                throw error;
              });
            }
          }
        }
      }

      function finishPendingInteractions(root, committedExpirationTime) {
        var earliestRemainingTimeAfterCommit = root.firstPendingTime;
        var subscriber;

        try {
          subscriber = tracing$1.__subscriberRef.current;

          if (subscriber !== null && root.memoizedInteractions.size > 0) {
            var threadID = computeThreadID(root, committedExpirationTime);
            subscriber.onWorkStopped(root.memoizedInteractions, threadID);
          }
        } catch (error) {
          scheduleCallback(ImmediatePriority, function () {
            throw error;
          });
        } finally {
          var pendingInteractionMap = root.pendingInteractionMap;
          pendingInteractionMap.forEach(function (scheduledInteractions, scheduledExpirationTime) {
            if (scheduledExpirationTime > earliestRemainingTimeAfterCommit) {
              pendingInteractionMap["delete"](scheduledExpirationTime);
              scheduledInteractions.forEach(function (interaction) {
                interaction.__count--;

                if (subscriber !== null && interaction.__count === 0) {
                  try {
                    subscriber.onInteractionScheduledWorkCompleted(interaction);
                  } catch (error) {
                    scheduleCallback(ImmediatePriority, function () {
                      throw error;
                    });
                  }
                }
              });
            }
          });
        }
      }

      var onScheduleFiberRoot = null;
      var onCommitFiberRoot = null;
      var onCommitFiberUnmount = null;
      var hasLoggedError = false;
      var isDevToolsPresent = typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined';

      function injectInternals(internals) {
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined') {
          return false;
        }

        var hook = __REACT_DEVTOOLS_GLOBAL_HOOK__;

        if (hook.isDisabled) {
          return true;
        }

        if (!hook.supportsFiber) {
          {
            error('The installed version of React DevTools is too old and will not work ' + 'with the current version of React. Please update React DevTools. ' + 'https://fb.me/react-devtools');
          }
          return true;
        }

        try {
          var rendererID = hook.inject(internals);

          if (true) {
            if (typeof hook.onScheduleFiberRoot === 'function') {
              onScheduleFiberRoot = function onScheduleFiberRoot(root, children) {
                try {
                  hook.onScheduleFiberRoot(rendererID, root, children);
                } catch (err) {
                  if (true && !hasLoggedError) {
                    hasLoggedError = true;
                    error('React instrumentation encountered an error: %s', err);
                  }
                }
              };
            }
          }

          onCommitFiberRoot = function onCommitFiberRoot(root, expirationTime) {
            try {
              var didError = (root.current.effectTag & DidCapture) === DidCapture;

              if (enableProfilerTimer) {
                var currentTime = getCurrentTime();
                var priorityLevel = inferPriorityFromExpirationTime(currentTime, expirationTime);
                hook.onCommitFiberRoot(rendererID, root, priorityLevel, didError);
              } else {
                hook.onCommitFiberRoot(rendererID, root, undefined, didError);
              }
            } catch (err) {
              if (true) {
                if (!hasLoggedError) {
                  hasLoggedError = true;
                  error('React instrumentation encountered an error: %s', err);
                }
              }
            }
          };

          onCommitFiberUnmount = function onCommitFiberUnmount(fiber) {
            try {
              hook.onCommitFiberUnmount(rendererID, fiber);
            } catch (err) {
              if (true) {
                if (!hasLoggedError) {
                  hasLoggedError = true;
                  error('React instrumentation encountered an error: %s', err);
                }
              }
            }
          };
        } catch (err) {
          {
            error('React instrumentation encountered an error: %s.', err);
          }
        }

        return true;
      }

      function onScheduleRoot(root, children) {
        if (typeof onScheduleFiberRoot === 'function') {
          onScheduleFiberRoot(root, children);
        }
      }

      function onCommitRoot(root, expirationTime) {
        if (typeof onCommitFiberRoot === 'function') {
          onCommitFiberRoot(root, expirationTime);
        }
      }

      function onCommitUnmount(fiber) {
        if (typeof onCommitFiberUnmount === 'function') {
          onCommitFiberUnmount(fiber);
        }
      }

      var hasBadMapPolyfill;
      {
        hasBadMapPolyfill = false;

        try {
          var nonExtensibleObject = Object.preventExtensions({});
          var testMap = new Map([[nonExtensibleObject, null]]);
          var testSet = new Set([nonExtensibleObject]);
          testMap.set(0, 0);
          testSet.add(0);
        } catch (e) {
          hasBadMapPolyfill = true;
        }
      }
      var debugCounter = 1;

      function FiberNode(tag, pendingProps, key, mode) {
        this.tag = tag;
        this.key = key;
        this.elementType = null;
        this.type = null;
        this.stateNode = null;
        this["return"] = null;
        this.child = null;
        this.sibling = null;
        this.index = 0;
        this.ref = null;
        this.pendingProps = pendingProps;
        this.memoizedProps = null;
        this.updateQueue = null;
        this.memoizedState = null;
        this.dependencies = null;
        this.mode = mode;
        this.effectTag = NoEffect;
        this.nextEffect = null;
        this.firstEffect = null;
        this.lastEffect = null;
        this.expirationTime = NoWork;
        this.childExpirationTime = NoWork;
        this.alternate = null;
        {
          this.actualDuration = Number.NaN;
          this.actualStartTime = Number.NaN;
          this.selfBaseDuration = Number.NaN;
          this.treeBaseDuration = Number.NaN;
          this.actualDuration = 0;
          this.actualStartTime = -1;
          this.selfBaseDuration = 0;
          this.treeBaseDuration = 0;
        }
        {
          this._debugID = debugCounter++;
          this._debugIsCurrentlyTiming = false;
        }
        {
          this._debugSource = null;
          this._debugOwner = null;
          this._debugNeedsRemount = false;
          this._debugHookTypes = null;

          if (!hasBadMapPolyfill && typeof Object.preventExtensions === 'function') {
            Object.preventExtensions(this);
          }
        }
      }

      var createFiber = function createFiber(tag, pendingProps, key, mode) {
        return new FiberNode(tag, pendingProps, key, mode);
      };

      function shouldConstruct(Component) {
        var prototype = Component.prototype;
        return !!(prototype && prototype.isReactComponent);
      }

      function isSimpleFunctionComponent(type) {
        return typeof type === 'function' && !shouldConstruct(type) && type.defaultProps === undefined;
      }

      function resolveLazyComponentTag(Component) {
        if (typeof Component === 'function') {
          return shouldConstruct(Component) ? ClassComponent : FunctionComponent;
        } else if (Component !== undefined && Component !== null) {
          var $$typeof = Component.$$typeof;

          if ($$typeof === REACT_FORWARD_REF_TYPE) {
            return ForwardRef;
          }

          if ($$typeof === REACT_MEMO_TYPE) {
            return MemoComponent;
          }
        }

        return IndeterminateComponent;
      }

      function createWorkInProgress(current, pendingProps) {
        var workInProgress = current.alternate;

        if (workInProgress === null) {
          workInProgress = createFiber(current.tag, pendingProps, current.key, current.mode);
          workInProgress.elementType = current.elementType;
          workInProgress.type = current.type;
          workInProgress.stateNode = current.stateNode;
          {
            {
              workInProgress._debugID = current._debugID;
            }
            workInProgress._debugSource = current._debugSource;
            workInProgress._debugOwner = current._debugOwner;
            workInProgress._debugHookTypes = current._debugHookTypes;
          }
          workInProgress.alternate = current;
          current.alternate = workInProgress;
        } else {
          workInProgress.pendingProps = pendingProps;
          workInProgress.effectTag = NoEffect;
          workInProgress.nextEffect = null;
          workInProgress.firstEffect = null;
          workInProgress.lastEffect = null;
          {
            workInProgress.actualDuration = 0;
            workInProgress.actualStartTime = -1;
          }
        }

        workInProgress.childExpirationTime = current.childExpirationTime;
        workInProgress.expirationTime = current.expirationTime;
        workInProgress.child = current.child;
        workInProgress.memoizedProps = current.memoizedProps;
        workInProgress.memoizedState = current.memoizedState;
        workInProgress.updateQueue = current.updateQueue;
        var currentDependencies = current.dependencies;
        workInProgress.dependencies = currentDependencies === null ? null : {
          expirationTime: currentDependencies.expirationTime,
          firstContext: currentDependencies.firstContext,
          responders: currentDependencies.responders
        };
        workInProgress.sibling = current.sibling;
        workInProgress.index = current.index;
        workInProgress.ref = current.ref;
        {
          workInProgress.selfBaseDuration = current.selfBaseDuration;
          workInProgress.treeBaseDuration = current.treeBaseDuration;
        }
        {
          workInProgress._debugNeedsRemount = current._debugNeedsRemount;

          switch (workInProgress.tag) {
            case IndeterminateComponent:
            case FunctionComponent:
            case SimpleMemoComponent:
              workInProgress.type = resolveFunctionForHotReloading(current.type);
              break;

            case ClassComponent:
              workInProgress.type = resolveClassForHotReloading(current.type);
              break;

            case ForwardRef:
              workInProgress.type = resolveForwardRefForHotReloading(current.type);
              break;
          }
        }
        return workInProgress;
      }

      function resetWorkInProgress(workInProgress, renderExpirationTime) {
        workInProgress.effectTag &= Placement;
        workInProgress.nextEffect = null;
        workInProgress.firstEffect = null;
        workInProgress.lastEffect = null;
        var current = workInProgress.alternate;

        if (current === null) {
          workInProgress.childExpirationTime = NoWork;
          workInProgress.expirationTime = renderExpirationTime;
          workInProgress.child = null;
          workInProgress.memoizedProps = null;
          workInProgress.memoizedState = null;
          workInProgress.updateQueue = null;
          workInProgress.dependencies = null;
          {
            workInProgress.selfBaseDuration = 0;
            workInProgress.treeBaseDuration = 0;
          }
        } else {
          workInProgress.childExpirationTime = current.childExpirationTime;
          workInProgress.expirationTime = current.expirationTime;
          workInProgress.child = current.child;
          workInProgress.memoizedProps = current.memoizedProps;
          workInProgress.memoizedState = current.memoizedState;
          workInProgress.updateQueue = current.updateQueue;
          var currentDependencies = current.dependencies;
          workInProgress.dependencies = currentDependencies === null ? null : {
            expirationTime: currentDependencies.expirationTime,
            firstContext: currentDependencies.firstContext,
            responders: currentDependencies.responders
          };
          {
            workInProgress.selfBaseDuration = current.selfBaseDuration;
            workInProgress.treeBaseDuration = current.treeBaseDuration;
          }
        }

        return workInProgress;
      }

      function createHostRootFiber(tag) {
        var mode;

        if (tag === ConcurrentRoot) {
          mode = ConcurrentMode | BlockingMode | StrictMode;
        } else if (tag === BlockingRoot) {
          mode = BlockingMode | StrictMode;
        } else {
          mode = NoMode;
        }

        if (isDevToolsPresent) {
          mode |= ProfileMode;
        }

        return createFiber(HostRoot, null, null, mode);
      }

      function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, expirationTime) {
        var fiber;
        var fiberTag = IndeterminateComponent;
        var resolvedType = type;

        if (typeof type === 'function') {
          if (shouldConstruct(type)) {
            fiberTag = ClassComponent;
            {
              resolvedType = resolveClassForHotReloading(resolvedType);
            }
          } else {
            {
              resolvedType = resolveFunctionForHotReloading(resolvedType);
            }
          }
        } else if (typeof type === 'string') {
          fiberTag = HostComponent;
        } else {
          getTag: switch (type) {
            case REACT_FRAGMENT_TYPE:
              return createFiberFromFragment(pendingProps.children, mode, expirationTime, key);

            case REACT_CONCURRENT_MODE_TYPE:
              fiberTag = Mode;
              mode |= ConcurrentMode | BlockingMode | StrictMode;
              break;

            case REACT_STRICT_MODE_TYPE:
              fiberTag = Mode;
              mode |= StrictMode;
              break;

            case REACT_PROFILER_TYPE:
              return createFiberFromProfiler(pendingProps, mode, expirationTime, key);

            case REACT_SUSPENSE_TYPE:
              return createFiberFromSuspense(pendingProps, mode, expirationTime, key);

            case REACT_SUSPENSE_LIST_TYPE:
              return createFiberFromSuspenseList(pendingProps, mode, expirationTime, key);

            default:
              {
                if (typeof type === 'object' && type !== null) {
                  switch (type.$$typeof) {
                    case REACT_PROVIDER_TYPE:
                      fiberTag = ContextProvider;
                      break getTag;

                    case REACT_CONTEXT_TYPE:
                      fiberTag = ContextConsumer;
                      break getTag;

                    case REACT_FORWARD_REF_TYPE:
                      fiberTag = ForwardRef;
                      {
                        resolvedType = resolveForwardRefForHotReloading(resolvedType);
                      }
                      break getTag;

                    case REACT_MEMO_TYPE:
                      fiberTag = MemoComponent;
                      break getTag;

                    case REACT_LAZY_TYPE:
                      fiberTag = LazyComponent;
                      resolvedType = null;
                      break getTag;

                    case REACT_BLOCK_TYPE:
                      fiberTag = Block;
                      break getTag;
                  }
                }

                var info = '';
                {
                  if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
                    info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and " + 'named imports.';
                  }

                  var ownerName = owner ? getComponentName(owner.type) : null;

                  if (ownerName) {
                    info += '\n\nCheck the render method of `' + ownerName + '`.';
                  }
                }
                {
                  {
                    throw Error("Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: " + (type == null ? type : typeof type) + "." + info);
                  }
                }
              }
          }
        }

        fiber = createFiber(fiberTag, pendingProps, key, mode);
        fiber.elementType = type;
        fiber.type = resolvedType;
        fiber.expirationTime = expirationTime;
        return fiber;
      }

      function createFiberFromElement(element, mode, expirationTime) {
        var owner = null;
        {
          owner = element._owner;
        }
        var type = element.type;
        var key = element.key;
        var pendingProps = element.props;
        var fiber = createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, expirationTime);
        {
          fiber._debugSource = element._source;
          fiber._debugOwner = element._owner;
        }
        return fiber;
      }

      function createFiberFromFragment(elements, mode, expirationTime, key) {
        var fiber = createFiber(Fragment, elements, key, mode);
        fiber.expirationTime = expirationTime;
        return fiber;
      }

      function createFiberFromProfiler(pendingProps, mode, expirationTime, key) {
        {
          if (typeof pendingProps.id !== 'string' || typeof pendingProps.onRender !== 'function') {
            error('Profiler must specify an "id" string and "onRender" function as props');
          }
        }
        var fiber = createFiber(Profiler, pendingProps, key, mode | ProfileMode);
        fiber.elementType = REACT_PROFILER_TYPE;
        fiber.type = REACT_PROFILER_TYPE;
        fiber.expirationTime = expirationTime;
        return fiber;
      }

      function createFiberFromSuspense(pendingProps, mode, expirationTime, key) {
        var fiber = createFiber(SuspenseComponent, pendingProps, key, mode);
        fiber.type = REACT_SUSPENSE_TYPE;
        fiber.elementType = REACT_SUSPENSE_TYPE;
        fiber.expirationTime = expirationTime;
        return fiber;
      }

      function createFiberFromSuspenseList(pendingProps, mode, expirationTime, key) {
        var fiber = createFiber(SuspenseListComponent, pendingProps, key, mode);
        {
          fiber.type = REACT_SUSPENSE_LIST_TYPE;
        }
        fiber.elementType = REACT_SUSPENSE_LIST_TYPE;
        fiber.expirationTime = expirationTime;
        return fiber;
      }

      function createFiberFromText(content, mode, expirationTime) {
        var fiber = createFiber(HostText, content, null, mode);
        fiber.expirationTime = expirationTime;
        return fiber;
      }

      function createFiberFromHostInstanceForDeletion() {
        var fiber = createFiber(HostComponent, null, null, NoMode);
        fiber.elementType = 'DELETED';
        fiber.type = 'DELETED';
        return fiber;
      }

      function createFiberFromPortal(portal, mode, expirationTime) {
        var pendingProps = portal.children !== null ? portal.children : [];
        var fiber = createFiber(HostPortal, pendingProps, portal.key, mode);
        fiber.expirationTime = expirationTime;
        fiber.stateNode = {
          containerInfo: portal.containerInfo,
          pendingChildren: null,
          implementation: portal.implementation
        };
        return fiber;
      }

      function assignFiberPropertiesInDEV(target, source) {
        if (target === null) {
          target = createFiber(IndeterminateComponent, null, null, NoMode);
        }

        target.tag = source.tag;
        target.key = source.key;
        target.elementType = source.elementType;
        target.type = source.type;
        target.stateNode = source.stateNode;
        target["return"] = source["return"];
        target.child = source.child;
        target.sibling = source.sibling;
        target.index = source.index;
        target.ref = source.ref;
        target.pendingProps = source.pendingProps;
        target.memoizedProps = source.memoizedProps;
        target.updateQueue = source.updateQueue;
        target.memoizedState = source.memoizedState;
        target.dependencies = source.dependencies;
        target.mode = source.mode;
        target.effectTag = source.effectTag;
        target.nextEffect = source.nextEffect;
        target.firstEffect = source.firstEffect;
        target.lastEffect = source.lastEffect;
        target.expirationTime = source.expirationTime;
        target.childExpirationTime = source.childExpirationTime;
        target.alternate = source.alternate;
        {
          target.actualDuration = source.actualDuration;
          target.actualStartTime = source.actualStartTime;
          target.selfBaseDuration = source.selfBaseDuration;
          target.treeBaseDuration = source.treeBaseDuration;
        }
        {
          target._debugID = source._debugID;
        }
        target._debugSource = source._debugSource;
        target._debugOwner = source._debugOwner;
        target._debugIsCurrentlyTiming = source._debugIsCurrentlyTiming;
        target._debugNeedsRemount = source._debugNeedsRemount;
        target._debugHookTypes = source._debugHookTypes;
        return target;
      }

      function FiberRootNode(containerInfo, tag, hydrate) {
        this.tag = tag;
        this.current = null;
        this.containerInfo = containerInfo;
        this.pendingChildren = null;
        this.pingCache = null;
        this.finishedExpirationTime = NoWork;
        this.finishedWork = null;
        this.timeoutHandle = noTimeout;
        this.context = null;
        this.pendingContext = null;
        this.hydrate = hydrate;
        this.callbackNode = null;
        this.callbackPriority = NoPriority;
        this.firstPendingTime = NoWork;
        this.firstSuspendedTime = NoWork;
        this.lastSuspendedTime = NoWork;
        this.nextKnownPendingLevel = NoWork;
        this.lastPingedTime = NoWork;
        this.lastExpiredTime = NoWork;
        {
          this.interactionThreadID = tracing$1.unstable_getThreadID();
          this.memoizedInteractions = new Set();
          this.pendingInteractionMap = new Map();
        }
      }

      function createFiberRoot(containerInfo, tag, hydrate, hydrationCallbacks) {
        var root = new FiberRootNode(containerInfo, tag, hydrate);
        var uninitializedFiber = createHostRootFiber(tag);
        root.current = uninitializedFiber;
        uninitializedFiber.stateNode = root;
        initializeUpdateQueue(uninitializedFiber);
        return root;
      }

      function isRootSuspendedAtTime(root, expirationTime) {
        var firstSuspendedTime = root.firstSuspendedTime;
        var lastSuspendedTime = root.lastSuspendedTime;
        return firstSuspendedTime !== NoWork && firstSuspendedTime >= expirationTime && lastSuspendedTime <= expirationTime;
      }

      function markRootSuspendedAtTime(root, expirationTime) {
        var firstSuspendedTime = root.firstSuspendedTime;
        var lastSuspendedTime = root.lastSuspendedTime;

        if (firstSuspendedTime < expirationTime) {
          root.firstSuspendedTime = expirationTime;
        }

        if (lastSuspendedTime > expirationTime || firstSuspendedTime === NoWork) {
          root.lastSuspendedTime = expirationTime;
        }

        if (expirationTime <= root.lastPingedTime) {
          root.lastPingedTime = NoWork;
        }

        if (expirationTime <= root.lastExpiredTime) {
          root.lastExpiredTime = NoWork;
        }
      }

      function markRootUpdatedAtTime(root, expirationTime) {
        var firstPendingTime = root.firstPendingTime;

        if (expirationTime > firstPendingTime) {
          root.firstPendingTime = expirationTime;
        }

        var firstSuspendedTime = root.firstSuspendedTime;

        if (firstSuspendedTime !== NoWork) {
          if (expirationTime >= firstSuspendedTime) {
            root.firstSuspendedTime = root.lastSuspendedTime = root.nextKnownPendingLevel = NoWork;
          } else if (expirationTime >= root.lastSuspendedTime) {
            root.lastSuspendedTime = expirationTime + 1;
          }

          if (expirationTime > root.nextKnownPendingLevel) {
            root.nextKnownPendingLevel = expirationTime;
          }
        }
      }

      function markRootFinishedAtTime(root, finishedExpirationTime, remainingExpirationTime) {
        root.firstPendingTime = remainingExpirationTime;

        if (finishedExpirationTime <= root.lastSuspendedTime) {
          root.firstSuspendedTime = root.lastSuspendedTime = root.nextKnownPendingLevel = NoWork;
        } else if (finishedExpirationTime <= root.firstSuspendedTime) {
          root.firstSuspendedTime = finishedExpirationTime - 1;
        }

        if (finishedExpirationTime <= root.lastPingedTime) {
          root.lastPingedTime = NoWork;
        }

        if (finishedExpirationTime <= root.lastExpiredTime) {
          root.lastExpiredTime = NoWork;
        }
      }

      function markRootExpiredAtTime(root, expirationTime) {
        var lastExpiredTime = root.lastExpiredTime;

        if (lastExpiredTime === NoWork || lastExpiredTime > expirationTime) {
          root.lastExpiredTime = expirationTime;
        }
      }

      var didWarnAboutNestedUpdates;
      var didWarnAboutFindNodeInStrictMode;
      {
        didWarnAboutNestedUpdates = false;
        didWarnAboutFindNodeInStrictMode = {};
      }

      function getContextForSubtree(parentComponent) {
        if (!parentComponent) {
          return emptyContextObject;
        }

        var fiber = get(parentComponent);
        var parentContext = findCurrentUnmaskedContext(fiber);

        if (fiber.tag === ClassComponent) {
          var Component = fiber.type;

          if (isContextProvider(Component)) {
            return processChildContext(fiber, Component, parentContext);
          }
        }

        return parentContext;
      }

      function findHostInstanceWithWarning(component, methodName) {
        {
          var fiber = get(component);

          if (fiber === undefined) {
            if (typeof component.render === 'function') {
              {
                {
                  throw Error("Unable to find node on an unmounted component.");
                }
              }
            } else {
              {
                {
                  throw Error("Argument appears to not be a ReactComponent. Keys: " + Object.keys(component));
                }
              }
            }
          }

          var hostFiber = findCurrentHostFiber(fiber);

          if (hostFiber === null) {
            return null;
          }

          if (hostFiber.mode & StrictMode) {
            var componentName = getComponentName(fiber.type) || 'Component';

            if (!didWarnAboutFindNodeInStrictMode[componentName]) {
              didWarnAboutFindNodeInStrictMode[componentName] = true;

              if (fiber.mode & StrictMode) {
                error('%s is deprecated in StrictMode. ' + '%s was passed an instance of %s which is inside StrictMode. ' + 'Instead, add a ref directly to the element you want to reference. ' + 'Learn more about using refs safely here: ' + 'https://fb.me/react-strict-mode-find-node%s', methodName, methodName, componentName, getStackByFiberInDevAndProd(hostFiber));
              } else {
                error('%s is deprecated in StrictMode. ' + '%s was passed an instance of %s which renders StrictMode children. ' + 'Instead, add a ref directly to the element you want to reference. ' + 'Learn more about using refs safely here: ' + 'https://fb.me/react-strict-mode-find-node%s', methodName, methodName, componentName, getStackByFiberInDevAndProd(hostFiber));
              }
            }
          }

          return hostFiber.stateNode;
        }
      }

      function createContainer(containerInfo, tag, hydrate, hydrationCallbacks) {
        return createFiberRoot(containerInfo, tag, hydrate);
      }

      function updateContainer(element, container, parentComponent, callback) {
        {
          onScheduleRoot(container, element);
        }
        var current$1 = container.current;
        var currentTime = requestCurrentTimeForUpdate();
        {
          if ('undefined' !== typeof jest) {
            warnIfUnmockedScheduler(current$1);
            warnIfNotScopedWithMatchingAct(current$1);
          }
        }
        var suspenseConfig = requestCurrentSuspenseConfig();
        var expirationTime = computeExpirationForFiber(currentTime, current$1, suspenseConfig);
        var context = getContextForSubtree(parentComponent);

        if (container.context === null) {
          container.context = context;
        } else {
          container.pendingContext = context;
        }

        {
          if (isRendering && current !== null && !didWarnAboutNestedUpdates) {
            didWarnAboutNestedUpdates = true;
            error('Render methods should be a pure function of props and state; ' + 'triggering nested component updates from render is not allowed. ' + 'If necessary, trigger nested updates in componentDidUpdate.\n\n' + 'Check the render method of %s.', getComponentName(current.type) || 'Unknown');
          }
        }
        var update = createUpdate(expirationTime, suspenseConfig);
        update.payload = {
          element: element
        };
        callback = callback === undefined ? null : callback;

        if (callback !== null) {
          {
            if (typeof callback !== 'function') {
              error('render(...): Expected the last optional `callback` argument to be a ' + 'function. Instead received: %s.', callback);
            }
          }
          update.callback = callback;
        }

        enqueueUpdate(current$1, update);
        scheduleWork(current$1, expirationTime);
        return expirationTime;
      }

      function getPublicRootInstance(container) {
        var containerFiber = container.current;

        if (!containerFiber.child) {
          return null;
        }

        switch (containerFiber.child.tag) {
          case HostComponent:
            return getPublicInstance(containerFiber.child.stateNode);

          default:
            return containerFiber.child.stateNode;
        }
      }

      function markRetryTimeImpl(fiber, retryTime) {
        var suspenseState = fiber.memoizedState;

        if (suspenseState !== null && suspenseState.dehydrated !== null) {
          if (suspenseState.retryTime < retryTime) {
            suspenseState.retryTime = retryTime;
          }
        }
      }

      function markRetryTimeIfNotHydrated(fiber, retryTime) {
        markRetryTimeImpl(fiber, retryTime);
        var alternate = fiber.alternate;

        if (alternate) {
          markRetryTimeImpl(alternate, retryTime);
        }
      }

      function attemptUserBlockingHydration$1(fiber) {
        if (fiber.tag !== SuspenseComponent) {
          return;
        }

        var expTime = computeInteractiveExpiration(requestCurrentTimeForUpdate());
        scheduleWork(fiber, expTime);
        markRetryTimeIfNotHydrated(fiber, expTime);
      }

      function attemptContinuousHydration$1(fiber) {
        if (fiber.tag !== SuspenseComponent) {
          return;
        }

        scheduleWork(fiber, ContinuousHydration);
        markRetryTimeIfNotHydrated(fiber, ContinuousHydration);
      }

      function attemptHydrationAtCurrentPriority$1(fiber) {
        if (fiber.tag !== SuspenseComponent) {
          return;
        }

        var currentTime = requestCurrentTimeForUpdate();
        var expTime = computeExpirationForFiber(currentTime, fiber, null);
        scheduleWork(fiber, expTime);
        markRetryTimeIfNotHydrated(fiber, expTime);
      }

      function findHostInstanceWithNoPortals(fiber) {
        var hostFiber = findCurrentHostFiberWithNoPortals(fiber);

        if (hostFiber === null) {
          return null;
        }

        if (hostFiber.tag === FundamentalComponent) {
          return hostFiber.stateNode.instance;
        }

        return hostFiber.stateNode;
      }

      var shouldSuspendImpl = function shouldSuspendImpl(fiber) {
        return false;
      };

      function shouldSuspend(fiber) {
        return shouldSuspendImpl(fiber);
      }

      var overrideHookState = null;
      var overrideProps = null;
      var scheduleUpdate = null;
      var setSuspenseHandler = null;
      {
        var copyWithSetImpl = function copyWithSetImpl(obj, path, idx, value) {
          if (idx >= path.length) {
            return value;
          }

          var key = path[idx];
          var updated = Array.isArray(obj) ? obj.slice() : _assign({}, obj);
          updated[key] = copyWithSetImpl(obj[key], path, idx + 1, value);
          return updated;
        };

        var copyWithSet = function copyWithSet(obj, path, value) {
          return copyWithSetImpl(obj, path, 0, value);
        };

        overrideHookState = function overrideHookState(fiber, id, path, value) {
          var currentHook = fiber.memoizedState;

          while (currentHook !== null && id > 0) {
            currentHook = currentHook.next;
            id--;
          }

          if (currentHook !== null) {
            var newState = copyWithSet(currentHook.memoizedState, path, value);
            currentHook.memoizedState = newState;
            currentHook.baseState = newState;
            fiber.memoizedProps = _assign({}, fiber.memoizedProps);
            scheduleWork(fiber, Sync);
          }
        };

        overrideProps = function overrideProps(fiber, path, value) {
          fiber.pendingProps = copyWithSet(fiber.memoizedProps, path, value);

          if (fiber.alternate) {
            fiber.alternate.pendingProps = fiber.pendingProps;
          }

          scheduleWork(fiber, Sync);
        };

        scheduleUpdate = function scheduleUpdate(fiber) {
          scheduleWork(fiber, Sync);
        };

        setSuspenseHandler = function setSuspenseHandler(newShouldSuspendImpl) {
          shouldSuspendImpl = newShouldSuspendImpl;
        };
      }

      function injectIntoDevTools(devToolsConfig) {
        var _findFiberByHostInstance = devToolsConfig.findFiberByHostInstance;
        var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
        return injectInternals(_assign({}, devToolsConfig, {
          overrideHookState: overrideHookState,
          overrideProps: overrideProps,
          setSuspenseHandler: setSuspenseHandler,
          scheduleUpdate: scheduleUpdate,
          currentDispatcherRef: ReactCurrentDispatcher,
          findHostInstanceByFiber: function findHostInstanceByFiber(fiber) {
            var hostFiber = findCurrentHostFiber(fiber);

            if (hostFiber === null) {
              return null;
            }

            return hostFiber.stateNode;
          },
          findFiberByHostInstance: function findFiberByHostInstance(instance) {
            if (!_findFiberByHostInstance) {
              return null;
            }

            return _findFiberByHostInstance(instance);
          },
          findHostInstancesForRefresh: findHostInstancesForRefresh,
          scheduleRefresh: scheduleRefresh,
          scheduleRoot: scheduleRoot,
          setRefreshHandler: setRefreshHandler,
          getCurrentFiber: function getCurrentFiber() {
            return current;
          }
        }));
      }

      function ReactDOMRoot(container, options) {
        this._internalRoot = createRootImpl(container, ConcurrentRoot, options);
      }

      function ReactDOMBlockingRoot(container, tag, options) {
        this._internalRoot = createRootImpl(container, tag, options);
      }

      ReactDOMRoot.prototype.render = ReactDOMBlockingRoot.prototype.render = function (children) {
        var root = this._internalRoot;
        {
          if (typeof arguments[1] === 'function') {
            error('render(...): does not support the second callback argument. ' + 'To execute a side effect after rendering, declare it in a component body with useEffect().');
          }

          var container = root.containerInfo;

          if (container.nodeType !== COMMENT_NODE) {
            var hostInstance = findHostInstanceWithNoPortals(root.current);

            if (hostInstance) {
              if (hostInstance.parentNode !== container) {
                error('render(...): It looks like the React-rendered content of the ' + 'root container was removed without using React. This is not ' + 'supported and will cause errors. Instead, call ' + "root.unmount() to empty a root's container.");
              }
            }
          }
        }
        updateContainer(children, root, null, null);
      };

      ReactDOMRoot.prototype.unmount = ReactDOMBlockingRoot.prototype.unmount = function () {
        {
          if (typeof arguments[0] === 'function') {
            error('unmount(...): does not support a callback argument. ' + 'To execute a side effect after rendering, declare it in a component body with useEffect().');
          }
        }
        var root = this._internalRoot;
        var container = root.containerInfo;
        updateContainer(null, root, null, function () {
          unmarkContainerAsRoot(container);
        });
      };

      function createRootImpl(container, tag, options) {
        var hydrate = options != null && options.hydrate === true;
        var root = createContainer(container, tag, hydrate);
        markContainerAsRoot(root.current, container);

        if (hydrate && tag !== LegacyRoot) {
          var doc = container.nodeType === DOCUMENT_NODE ? container : container.ownerDocument;
          eagerlyTrapReplayableEvents(container, doc);
        }

        return root;
      }

      function createLegacyRoot(container, options) {
        return new ReactDOMBlockingRoot(container, LegacyRoot, options);
      }

      function isValidContainer(node) {
        return !!(node && (node.nodeType === ELEMENT_NODE || node.nodeType === DOCUMENT_NODE || node.nodeType === DOCUMENT_FRAGMENT_NODE || node.nodeType === COMMENT_NODE && node.nodeValue === ' react-mount-point-unstable '));
      }

      var ReactCurrentOwner$3 = ReactSharedInternals.ReactCurrentOwner;
      var topLevelUpdateWarnings;
      var warnedAboutHydrateAPI = false;
      {
        topLevelUpdateWarnings = function topLevelUpdateWarnings(container) {
          if (container._reactRootContainer && container.nodeType !== COMMENT_NODE) {
            var hostInstance = findHostInstanceWithNoPortals(container._reactRootContainer._internalRoot.current);

            if (hostInstance) {
              if (hostInstance.parentNode !== container) {
                error('render(...): It looks like the React-rendered content of this ' + 'container was removed without using React. This is not ' + 'supported and will cause errors. Instead, call ' + 'ReactDOM.unmountComponentAtNode to empty a container.');
              }
            }
          }

          var isRootRenderedBySomeReact = !!container._reactRootContainer;
          var rootEl = getReactRootElementInContainer(container);
          var hasNonRootReactChild = !!(rootEl && getInstanceFromNode$1(rootEl));

          if (hasNonRootReactChild && !isRootRenderedBySomeReact) {
            error('render(...): Replacing React-rendered children with a new root ' + 'component. If you intended to update the children of this node, ' + 'you should instead have the existing children update their state ' + 'and render the new components instead of calling ReactDOM.render.');
          }

          if (container.nodeType === ELEMENT_NODE && container.tagName && container.tagName.toUpperCase() === 'BODY') {
            error('render(): Rendering components directly into document.body is ' + 'discouraged, since its children are often manipulated by third-party ' + 'scripts and browser extensions. This may lead to subtle ' + 'reconciliation issues. Try rendering into a container element created ' + 'for your app.');
          }
        };
      }

      function getReactRootElementInContainer(container) {
        if (!container) {
          return null;
        }

        if (container.nodeType === DOCUMENT_NODE) {
          return container.documentElement;
        } else {
          return container.firstChild;
        }
      }

      function shouldHydrateDueToLegacyHeuristic(container) {
        var rootElement = getReactRootElementInContainer(container);
        return !!(rootElement && rootElement.nodeType === ELEMENT_NODE && rootElement.hasAttribute(ROOT_ATTRIBUTE_NAME));
      }

      function legacyCreateRootFromDOMContainer(container, forceHydrate) {
        var shouldHydrate = forceHydrate || shouldHydrateDueToLegacyHeuristic(container);

        if (!shouldHydrate) {
          var warned = false;
          var rootSibling;

          while (rootSibling = container.lastChild) {
            {
              if (!warned && rootSibling.nodeType === ELEMENT_NODE && rootSibling.hasAttribute(ROOT_ATTRIBUTE_NAME)) {
                warned = true;
                error('render(): Target node has markup rendered by React, but there ' + 'are unrelated nodes as well. This is most commonly caused by ' + 'white-space inserted around server-rendered markup.');
              }
            }
            container.removeChild(rootSibling);
          }
        }

        {
          if (shouldHydrate && !forceHydrate && !warnedAboutHydrateAPI) {
            warnedAboutHydrateAPI = true;
            warn('render(): Calling ReactDOM.render() to hydrate server-rendered markup ' + 'will stop working in React v17. Replace the ReactDOM.render() call ' + 'with ReactDOM.hydrate() if you want React to attach to the server HTML.');
          }
        }
        return createLegacyRoot(container, shouldHydrate ? {
          hydrate: true
        } : undefined);
      }

      function warnOnInvalidCallback$1(callback, callerName) {
        {
          if (callback !== null && typeof callback !== 'function') {
            error('%s(...): Expected the last optional `callback` argument to be a ' + 'function. Instead received: %s.', callerName, callback);
          }
        }
      }

      function legacyRenderSubtreeIntoContainer(parentComponent, children, container, forceHydrate, callback) {
        {
          topLevelUpdateWarnings(container);
          warnOnInvalidCallback$1(callback === undefined ? null : callback, 'render');
        }
        var root = container._reactRootContainer;
        var fiberRoot;

        if (!root) {
          root = container._reactRootContainer = legacyCreateRootFromDOMContainer(container, forceHydrate);
          fiberRoot = root._internalRoot;

          if (typeof callback === 'function') {
            var originalCallback = callback;

            callback = function callback() {
              var instance = getPublicRootInstance(fiberRoot);
              originalCallback.call(instance);
            };
          }

          unbatchedUpdates(function () {
            updateContainer(children, fiberRoot, parentComponent, callback);
          });
        } else {
          fiberRoot = root._internalRoot;

          if (typeof callback === 'function') {
            var _originalCallback = callback;

            callback = function callback() {
              var instance = getPublicRootInstance(fiberRoot);

              _originalCallback.call(instance);
            };
          }

          updateContainer(children, fiberRoot, parentComponent, callback);
        }

        return getPublicRootInstance(fiberRoot);
      }

      function findDOMNode(componentOrElement) {
        {
          var owner = ReactCurrentOwner$3.current;

          if (owner !== null && owner.stateNode !== null) {
            var warnedAboutRefsInRender = owner.stateNode._warnedAboutRefsInRender;

            if (!warnedAboutRefsInRender) {
              error('%s is accessing findDOMNode inside its render(). ' + 'render() should be a pure function of props and state. It should ' + 'never access something that requires stale data from the previous ' + 'render, such as refs. Move this logic to componentDidMount and ' + 'componentDidUpdate instead.', getComponentName(owner.type) || 'A component');
            }

            owner.stateNode._warnedAboutRefsInRender = true;
          }
        }

        if (componentOrElement == null) {
          return null;
        }

        if (componentOrElement.nodeType === ELEMENT_NODE) {
          return componentOrElement;
        }

        {
          return findHostInstanceWithWarning(componentOrElement, 'findDOMNode');
        }
      }

      function hydrate(element, container, callback) {
        if (!isValidContainer(container)) {
          {
            throw Error("Target container is not a DOM element.");
          }
        }

        {
          var isModernRoot = isContainerMarkedAsRoot(container) && container._reactRootContainer === undefined;

          if (isModernRoot) {
            error('You are calling ReactDOM.hydrate() on a container that was previously ' + 'passed to ReactDOM.createRoot(). This is not supported. ' + 'Did you mean to call createRoot(container, {hydrate: true}).render(element)?');
          }
        }
        return legacyRenderSubtreeIntoContainer(null, element, container, true, callback);
      }

      function render(element, container, callback) {
        if (!isValidContainer(container)) {
          {
            throw Error("Target container is not a DOM element.");
          }
        }

        {
          var isModernRoot = isContainerMarkedAsRoot(container) && container._reactRootContainer === undefined;

          if (isModernRoot) {
            error('You are calling ReactDOM.render() on a container that was previously ' + 'passed to ReactDOM.createRoot(). This is not supported. ' + 'Did you mean to call root.render(element)?');
          }
        }
        return legacyRenderSubtreeIntoContainer(null, element, container, false, callback);
      }

      function unstable_renderSubtreeIntoContainer(parentComponent, element, containerNode, callback) {
        if (!isValidContainer(containerNode)) {
          {
            throw Error("Target container is not a DOM element.");
          }
        }

        if (!(parentComponent != null && has(parentComponent))) {
          {
            throw Error("parentComponent must be a valid React Component");
          }
        }

        return legacyRenderSubtreeIntoContainer(parentComponent, element, containerNode, false, callback);
      }

      function unmountComponentAtNode(container) {
        if (!isValidContainer(container)) {
          {
            throw Error("unmountComponentAtNode(...): Target container is not a DOM element.");
          }
        }

        {
          var isModernRoot = isContainerMarkedAsRoot(container) && container._reactRootContainer === undefined;

          if (isModernRoot) {
            error('You are calling ReactDOM.unmountComponentAtNode() on a container that was previously ' + 'passed to ReactDOM.createRoot(). This is not supported. Did you mean to call root.unmount()?');
          }
        }

        if (container._reactRootContainer) {
          {
            var rootEl = getReactRootElementInContainer(container);
            var renderedByDifferentReact = rootEl && !getInstanceFromNode$1(rootEl);

            if (renderedByDifferentReact) {
              error("unmountComponentAtNode(): The node you're attempting to unmount " + 'was rendered by another copy of React.');
            }
          }
          unbatchedUpdates(function () {
            legacyRenderSubtreeIntoContainer(null, null, container, false, function () {
              container._reactRootContainer = null;
              unmarkContainerAsRoot(container);
            });
          });
          return true;
        } else {
          {
            var _rootEl = getReactRootElementInContainer(container);

            var hasNonRootReactChild = !!(_rootEl && getInstanceFromNode$1(_rootEl));
            var isContainerReactRoot = container.nodeType === ELEMENT_NODE && isValidContainer(container.parentNode) && !!container.parentNode._reactRootContainer;

            if (hasNonRootReactChild) {
              error("unmountComponentAtNode(): The node you're attempting to unmount " + 'was rendered by React and is not a top-level container. %s', isContainerReactRoot ? 'You may have accidentally passed in a React root node instead ' + 'of its container.' : 'Instead, have the parent component update its state and ' + 'rerender in order to remove this component.');
            }
          }
          return false;
        }
      }

      function createPortal(children, containerInfo, implementation) {
        var key = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
        return {
          $$typeof: REACT_PORTAL_TYPE,
          key: key == null ? null : '' + key,
          children: children,
          containerInfo: containerInfo,
          implementation: implementation
        };
      }

      var ReactVersion = '16.14.0';
      setAttemptUserBlockingHydration(attemptUserBlockingHydration$1);
      setAttemptContinuousHydration(attemptContinuousHydration$1);
      setAttemptHydrationAtCurrentPriority(attemptHydrationAtCurrentPriority$1);
      var didWarnAboutUnstableCreatePortal = false;
      {
        if (typeof Map !== 'function' || Map.prototype == null || typeof Map.prototype.forEach !== 'function' || typeof Set !== 'function' || Set.prototype == null || typeof Set.prototype.clear !== 'function' || typeof Set.prototype.forEach !== 'function') {
          error('React depends on Map and Set built-in types. Make sure that you load a ' + 'polyfill in older browsers. https://fb.me/react-polyfills');
        }
      }
      setRestoreImplementation(restoreControlledState$3);
      setBatchingImplementation(batchedUpdates$1, discreteUpdates$1, flushDiscreteUpdates, batchedEventUpdates$1);

      function createPortal$1(children, container) {
        var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        if (!isValidContainer(container)) {
          {
            throw Error("Target container is not a DOM element.");
          }
        }

        return createPortal(children, container, null, key);
      }

      function renderSubtreeIntoContainer(parentComponent, element, containerNode, callback) {
        return unstable_renderSubtreeIntoContainer(parentComponent, element, containerNode, callback);
      }

      function unstable_createPortal(children, container) {
        var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        {
          if (!didWarnAboutUnstableCreatePortal) {
            didWarnAboutUnstableCreatePortal = true;
            warn('The ReactDOM.unstable_createPortal() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactDOM.createPortal() instead. It has the exact same API, ' + 'but without the "unstable_" prefix.');
          }
        }
        return createPortal$1(children, container, key);
      }

      var Internals = {
        Events: [getInstanceFromNode$1, getNodeFromInstance$1, getFiberCurrentPropsFromNode$1, injectEventPluginsByName, eventNameDispatchConfigs, accumulateTwoPhaseDispatches, accumulateDirectDispatches, enqueueStateRestore, restoreStateIfNeeded, dispatchEvent, runEventsInBatch, flushPassiveEffects, IsThisRendererActing]
      };
      var foundDevTools = injectIntoDevTools({
        findFiberByHostInstance: getClosestInstanceFromNode,
        bundleType: 1,
        version: ReactVersion,
        rendererPackageName: 'react-dom'
      });
      {
        if (!foundDevTools && canUseDOM && window.top === window.self) {
          if (navigator.userAgent.indexOf('Chrome') > -1 && navigator.userAgent.indexOf('Edge') === -1 || navigator.userAgent.indexOf('Firefox') > -1) {
            var protocol = window.location.protocol;

            if (/^(https?|file):$/.test(protocol)) {
              console.info('%cDownload the React DevTools ' + 'for a better development experience: ' + 'https://fb.me/react-devtools' + (protocol === 'file:' ? '\nYou might need to use a local HTTP server (instead of file://): ' + 'https://fb.me/react-devtools-faq' : ''), 'font-weight:bold');
            }
          }
        }
      }
      exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Internals;
      exports.createPortal = createPortal$1;
      exports.findDOMNode = findDOMNode;
      exports.flushSync = flushSync;
      exports.hydrate = hydrate;
      exports.render = render;
      exports.unmountComponentAtNode = unmountComponentAtNode;
      exports.unstable_batchedUpdates = batchedUpdates$1;
      exports.unstable_createPortal = unstable_createPortal;
      exports.unstable_renderSubtreeIntoContainer = renderSubtreeIntoContainer;
      exports.version = ReactVersion;
    })();
  }
});

var reactDom = createCommonjsModule(function (module) {

  function checkDCE() {
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined' || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== 'function') {
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      throw new Error('^_^');
    }

    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
    } catch (err) {
      console.error(err);
    }
  }

  if (process.env.NODE_ENV === 'production') {
    checkDCE();
    module.exports = reactDom_production_min;
  } else {
    module.exports = reactDom_development;
  }
});

var BlockEmbed = Quill["import"]("blots/block/embed");
var Poll = /*#__PURE__*/function (_BlockEmbed) {
  _inheritsLoose(Poll, _BlockEmbed);

  Poll.create = function create(value) {
    var _extends2;

    var id = v4();

    var node = _BlockEmbed.create.call(this, value);

    var refs = Poll.refs;
    node.setAttribute("data-id", id);
    Poll.data = value;
    Poll.refs = _extends({}, refs, (_extends2 = {}, _extends2[id] = React.createRef(), _extends2));
    return node;
  };

  Poll.value = function value(domNode) {
    var id = domNode.getAttribute("data-id");
    var ref = Poll.refs[id];
    return ref && ref.current && ref.current.getData();
  };

  function Poll(domNode) {
    var _this;

    _this = _BlockEmbed.call(this, domNode) || this;
    _this.id = domNode.getAttribute("data-id");
    _this.data = Poll.data;
    return _this;
  }

  var _proto = Poll.prototype;

  _proto.attach = function attach() {
    _BlockEmbed.prototype.attach.call(this);

    this.scroll.emitter.emit("blot-mount", this);
  };

  _proto.renderPortal = function renderPortal(id) {
    var _Quill$find = Quill.find(this.scroll.domNode.parentNode),
        options = _Quill$find.options;

    var ref = Poll.refs[id];
    return reactDom.createPortal( /*#__PURE__*/React.createElement(PollComponent, {
      type: Poll.blotName,
      node: this.data,
      ref: ref,
      readOnly: options.readOnly
    }), this.domNode);
  };

  _proto.detach = function detach() {
    _BlockEmbed.prototype.detach.call(this);

    this.scroll.emitter.emit("blot-unmount", this);
  };

  return Poll;
}(BlockEmbed);
Poll.blotName = "poll";
Poll.tagName = "div";
Poll.className = "ql-custom";
Poll.ref = {};

var PollComponent = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(PollComponent, _React$Component);

  function PollComponent() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto2 = PollComponent.prototype;

  _proto2.getData = function getData() {
    return "data";
  };

  _proto2.render = function render() {
    return /*#__PURE__*/React.createElement("div", null, "Poll Component");
  };

  return PollComponent;
}(React.Component);

Quill.register({
  "modules/autoformat": Autoformat,
  "formats/mention": Mention,
  "formats/poll": Poll
});
function register(toRegister) {
  Quill.register(toRegister);
}
var MODULES = {
  toolbar: [["bold", "italic", "underline", "strike"], [{
    align: []
  }], [{
    list: "ordered"
  }, {
    list: "bullet"
  }], [{
    indent: "-1"
  }, {
    indent: "+1"
  }], [{
    size: ["small", false, "large", "huge"]
  }], [{
    header: [1, 2, 3, 4, 5, 6, false]
  }], ["link", "image", "video"], [{
    color: []
  }, {
    background: []
  }], ["clean"]],
  clipboard: {
    matchVisual: false
  }
};
var FORMATS = ["bold", "italic", "underline", "strike", "align", "list", "indent", "size", "header", "link", "image", "video", "color", "background", "clean", "mention", "poll"];
var AUTOFORMAT = {};
var Editor = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(Editor, _React$Component);

  function Editor(props) {
    var _this;

    _this = _React$Component.call(this, props) || this;
    _this.onMount = _this.onMount.bind(_assertThisInitialized(_this));
    _this.onUnmount = _this.onUnmount.bind(_assertThisInitialized(_this));
    _this.onContentChange = _this.onContentChange.bind(_assertThisInitialized(_this));
    _this.editor = null;
    _this.editorContainer = React.createRef();
    _this.state = {
      embedBlots: []
    };
    return _this;
  }

  var _proto = Editor.prototype;

  _proto.componentDidMount = function componentDidMount() {
    var _this2 = this;

    var _this$props = this.props,
        readOnly = _this$props.readOnly,
        modules = _this$props.modules,
        formats = _this$props.formats,
        autoformat = _this$props.autoformat,
        defaultContent = _this$props.defaultContent;
    this.editor = new Quill(this.editorContainer.current, {
      theme: "bubble",
      readOnly: readOnly,
      modules: _extends({}, MODULES, modules, {
        autoformat: _extends({}, AUTOFORMAT, autoformat)
      }),
      formats: [].concat(FORMATS, formats)
    });
    this.editor.on("text-change", this.onContentChange);
    var blots = [];
    this.editor.scroll.emitter.on("blot-mount", function (blot) {
      blots.push(blot);
      defer(function () {
        if (blots.length > 0) {
          _this2.onMount.apply(_this2, blots);

          blots = [];
        }
      });
    });
    this.editor.scroll.emitter.on("blot-unmount", this.onUnmount);
    this.editor.setContents(defaultContent);
  };

  _proto.onMount = function onMount() {
    for (var _len = arguments.length, blots = new Array(_len), _key = 0; _key < _len; _key++) {
      blots[_key] = arguments[_key];
    }

    var embeds = blots.reduce(function (memo, blot) {
      memo[blot.id] = blot;
      return memo;
    }, _extends({}, this.state.embedBlots));
    this.setState({
      embedBlots: embeds
    });
  };

  _proto.onUnmount = function onUnmount(unmountedBlot) {
    var _this$state$embedBlot = this.state.embedBlots,
        _unmountedBlot$id = unmountedBlot.id,
        embedBlots = _objectWithoutPropertiesLoose(_this$state$embedBlot, [_unmountedBlot$id].map(_toPropertyKey));

    this.setState({
      embedBlots: embedBlots
    });
  };

  _proto.onContentChange = function onContentChange(delta, oldDelta, source) {
    var onContentChange = this.props.onContentChange;
    onContentChange(this.editor.getContents());
  };

  _proto.render = function render() {
    var spellCheck = this.props.spellCheck;
    return /*#__PURE__*/React.createElement("div", {
      spellCheck: spellCheck,
      ref: this.editorContainer
    }, map(this.state.embedBlots, function (blot) {
      return blot.renderPortal(blot.id);
    }));
  };

  return Editor;
}(React.Component);

var ContentSkeleton = React.memo(function (_ref) {
  var _defaultContent = _ref._defaultContent,
      _onContentChange = _ref._onContentChange,
      _modules = _ref._modules,
      _formats = _ref._formats,
      _autoformat = _ref._autoformat,
      _readOnly = _ref._readOnly,
      _spellCheck = _ref._spellCheck;
  return React.createElement(Editor, {
    defaultContent: _defaultContent,
    onContentChange: _onContentChange,
    modules: _modules,
    formats: _formats,
    autoformat: _autoformat,
    readOnly: _readOnly,
    spellCheck: _spellCheck
  });
});

var _excluded = ["forwardedRef", "modules", "formats", "autoformat", "readOnly", "spellCheck"];
function UseContent(Component) {
  var WithContent = /*#__PURE__*/function (_React$Component) {
    _inheritsLoose(WithContent, _React$Component);

    function WithContent(props) {
      var _this;

      _this = _React$Component.call(this, props) || this;
      _this.onContentChange = _this.onContentChange.bind(_assertThisInitialized(_this));
      _this.empty = _this.empty.bind(_assertThisInitialized(_this));
      var defaultContent = _this.props.defaultContent;

      var _defaultContent = defaultContent !== undefined ? defaultContent : _this.empty();

      _this.state = {
        defaultContent: _defaultContent
      };
      return _this;
    }

    var _proto = WithContent.prototype;

    _proto.onContentChange = function onContentChange(content) {
      var onContentChange = this.props.onContentChange;
      if (onContentChange !== undefined) onContentChange(content);
    };

    _proto.empty = function empty() {
      return {
        ops: []
      };
    };

    _proto.render = function render() {
      var _this$props = this.props,
          forwardedRef = _this$props.forwardedRef,
          modules = _this$props.modules,
          formats = _this$props.formats,
          autoformat = _this$props.autoformat,
          readOnly = _this$props.readOnly,
          spellCheck = _this$props.spellCheck,
          rest = _objectWithoutPropertiesLoose(_this$props, _excluded);

      var defaultContent = this.state.defaultContent;
      return React.createElement(Component, Object.assign({}, rest, {
        ref: forwardedRef,
        _contentManager: this,
        _defaultContent: defaultContent,
        _onContentChange: this.onContentChange,
        _modules: modules !== undefined ? modules : {},
        _formats: formats !== undefined ? formats : [],
        _autoformat: autoformat !== undefined ? autoformat : {},
        _readOnly: readOnly !== undefined ? readOnly : false,
        _spellCheck: spellCheck !== undefined ? spellCheck : false
      }));
    };

    return WithContent;
  }(React.Component);

  return React.forwardRef(function (props, ref) {
    return React.createElement(WithContent, Object.assign({}, props, {
      forwardedRef: ref
    }));
  });
}

var Content = UseContent(ContentSkeleton);

export { Content, ContentSkeleton, Editor, register };
//# sourceMappingURL=index.modern.js.map
