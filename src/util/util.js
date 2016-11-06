/**************************************/
/* Required to run in uncompiled mode */
/**************************************/
var goog = {};
goog.provide = function(){};
goog.require = function(){};

goog.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {};
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  /** @override */
  childCtor.prototype.constructor = childCtor;
};

/**
 * @param {!Object} me Should always be "this".
 * @param {*=} opt_methodName The method name if calling a super method.
 * @param {...*} var_args The rest of the arguments.
 * @return {*} The return value of the superclass method.
 * @suppress {es5Strict} This method can not be used in strict mode, but
 *     all Closure Library consumers must depend on this file.
 */
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if (caller.superClass_) {
    // This is a constructor. Call the superclass constructor.
    return caller.superClass_.constructor.apply(
        me, Array.prototype.slice.call(arguments, 1));
  }

  var args = arguments.length > 2 ?
      Array.prototype.slice.call(arguments, 2) : util.emptyArray_;
  var foundCaller = false;
  for (var ctor = me.constructor;
       ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = true;
    } else if (foundCaller) {
      return ctor.prototype[opt_methodName].apply(me, args);
    }
  }

  // If we did not find the caller in the prototype chain,
  // then one of two things happened:
  // 1) The caller is an instance method.
  // 2) This method was not called by the right caller.
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
    throw Error(
        'goog.base called from a method of one name ' +
        'to a method of a different name');
  }
};


/**
 * Reference to the global context.  In most cases this will be 'window'.
 */
goog.global = this;


/**
 * Allow for aliasing within scope functions.  This function exists for
 * uncompiled code - in compiled code the calls will be inlined and the aliases
 * applied.  In uncompiled code the function is simply run since the aliases as
 * written are valid JavaScript.
 * @param {function()} fn Function to call.  This function can contain aliases
 *     to namespaces (e.g. "var dom = goog.dom") or classes
 *     (e.g. "var Timer = goog.Timer").
 */
goog.scope = function(fn) {
  fn.call(goog.global);
};
/////////////////////////////////////////

goog.provide('util');

util = {};

util.getCgiParams = function() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
      function(m,key,value) {
        vars[key] = value;
      });
  return vars;
}

util.getCgiParam = function(param) {
  return util.getCgiParams()[param];
}

util.degToRad = function(degrees) {
  return degrees * Math.PI / 180;
};

util.unimplemented = function() {
  throw new Error("Unsupported Operation");
};

util.emptyImplementation = function(){};

util.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    // Prepend the bound arguments to the current arguments.
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs);
  };
};


/**
 * @param {?function(T, ...)} fn
 * @param {T} thisObj
 * @param {...*} var_args
 * @return {!Function}
 * @template T
 */
util.bind = function(fn, thisObj, var_args) {
  var args = Array.prototype.slice.call(arguments, 2);
  return function() {
    // Prepend the bound arguments to the current arguments.
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(thisObj, newArgs);
  };
};

util.emptyArray_ = [];

util.requiredPaths_ = [];
util.require = function(path) {
  if (util.requiredPaths_.indexOf(path) != -1) {
    return;
  }
  util.requiredPaths_.push(path);
  document.write('<script src="/' + path + '"></script>')
};

util.useCss = function(path) {
  if (util.requiredPaths_.indexOf(path) != -1) {
    return;
  }
  util.requiredPaths_.push(path);
  document.write(
      '<link rel="stylesheet" type="text/css" href="/' + path + '">');
};

util.renderSoy = function(element, template, params) {
  element.innerHTML = template(params);
};

util.assert = function(bool, message) {
  if (!bool) {
    throw new Error(message);
  }
};

util.assertNotNull = function(ref, message) {
  if (ref === null || ref === undefined) {
    throw new Error(message);
  }
};

util.assertNull = function(ref, message) {
  if (ref !== null) {
    throw new Error(message);
  }
};

util.assertEquals = function(a, b, message) {
  if (a != b) {
    throw new Error(message);
  }
};

/*********************/
/*    util.style     */
/*********************/
util.style = {};

util.style.getRgbValues = function(rgbString) {
  var parts = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  return {
    red: parseInt(parts[1], 10),
    green: parseInt(parts[2], 10),
    blue: parseInt(parts[3], 10)
  };
};

util.style.toRgbString = function(color) {
  return 'rgb(' + color.red + ', ' + color.green + ', ' + color.blue + ')';
};



/********************/
/*     util.dom     */
/********************/
util.dom = {};

util.dom.getClosest = function(element, selector) {
  while (!util.dom.matches(element, selector) && element.parentElement) {
    element = element.parentElement;
  }
  if (!util.dom.matches(element, selector)) {
    return null;
  }
  return element;
};

util.dom.isChild = function(element, parent) {
  while (element != parent && element.parentElement) {
    element = element.parentElement;
  }
  return element == parent;
};

util.dom.find = function(selector, opt_parent) {
  return util.array.getOnlyElement(
      util.dom.findAll(selector, opt_parent));
};

util.dom.findAll = function(selector, opt_parent) {
  var parent = opt_parent || document;
  return Array.prototype.slice.apply(
      parent.querySelectorAll(selector));
};

util.dom.hasClass = function(element, cssClass) {
  return element.classList.contains(cssClass);
};

util.dom.addClass = function(element, cssClass) {
  element.classList.add(cssClass);
};

util.dom.removeClass = function(element, cssClass) {
  element.classList.remove(cssClass);
};

// n.b. This will only work for nodes that have parents.
util.dom.matches = function(element, selector) {
  if (!element.parentElement) {
    throw new Error('Cannot invoke util.dom.matches ' +
        'on a node with no parent.');
  }
  return util.dom.findAll(selector, element.parentElement).
      indexOf(element) != -1;
};

util.dom.getData = function(element, key) {
  return element.dataset[key];
};

util.dom.getIntData = function(element, key) {
  return parseInt(util.dom.getData(element, key), 10);
};

util.dom.hide = function(element) {
  element.style.display = 'none';
};


/********************/
/*      util.fn     */
/********************/
util.fn = {};

util.fn.addClass = function(cssClass) {
  return function(element) {
    element.classList.add(cssClass);
  }
};

util.fn.removeClass = function(cssClass) {
  return function(element) {
    element.classList.remove(cssClass);
  }
};

util.fn.pluck = function(attr) {
  return function(obj) {
    return obj[attr];
  }
};

util.fn.equals = function(ref) {
  return function(test) {
    return test === ref;
  }
};

util.fn.outputEquals = function(f, ref) {
  return function(test) {
    return f(test) === ref;
  }
};

util.fn.pluckEquals = function(attr, ref) {
  return function(obj) {
    return obj[attr] === ref;
  }
};

util.fn.not = function(f) {
  return function() {
    return !f.apply(this, arguments);
  };
};

util.fn.greaterThan = function(ref) {
  return function(test) {
    return test > ref;
  }
};

util.fn.constant = function(ref) {
  return function() {
    return ref;
  };
};

util.fn.goTo = function(url) {
  return function() {
    window.location.href = url;
  };
};

util.fn.noOp = function(){};


/**********************/
/*     util.array     */
/**********************/
util.array = {};

util.array.pushAll = function(arr, addee) {
  Array.prototype.push.apply(arr, addee);
};

util.array.removeAll = function(arr, removee) {
  for (var i = 0, length = removee.length; i < removee.length; i++) {
    util.array.remove(arr, removee[i]);
  }
};

util.array.apply = function(arr, fnString, arg1, arg2, arg3) {
  for (var i = 0, elm; elm = arr[i]; i++) {
    elm[fnString](arg1, arg2, arg3);
  }
};

util.array.remove = function(arr, removee){
  var index;
  while((index = arr.indexOf(removee)) != -1){
      arr.splice(index, 1);
  }
  return arr;
};

util.array.flatten = function(arr) {
  var flattenedThis = [];
  for (var i = 0; arr[i]; i++) {
    if (arr[i].flatten) {
      arr.pushAll(arr[i].flatten());
    } else {
      flattenedThis.push(arr[i]);
    }
  }
};

util.array.average = function(arr) {
  var sum = 0;
  var length = arr.length;
  for (var i = 0; i < length; i++) {
    sum += arr[i];
  }
  return sum / (length);
};

util.array.pluck = function(arr, key) {
  var pluckedArray = [];
  arr.forEach(function(value) {
    pluckedArray.push(value[key]);
  });
  return pluckedArray;
};


/**
 * @param {Array.<*>} arr
 * @param {Function} f
 * @param {*=} opt_ctx
 */
util.array.forEach = function(arr, f, opt_ctx) {
  var l = arr.length;
  var arr2 = arr;
  for (var i = 0; i < l; i++) {
    f.call(opt_ctx, arr2[i], i, arr);
  }
};


util.array.map = function(arr, f, opt_ctx) {
  var l = arr.length;
  var arr2 = arr;
  var out = [];
  for (var i = 0; i < l; i++) {
    out.push(f.call(opt_ctx, arr2[i], i, arr))
  }
  return out;
};

util.array.getOnlyElement = function(arr) {
  util.assertEquals(1, arr.length,
      'Array must have only one element.  Length: ' + arr.length);
  return arr[0];
};


/**********************/
/*    util.object     */
/**********************/
util.object = {};

/**
 * @param {Object.<string, *>} obj
 * @param {Function} f
 * @param {*=} opt_ctx
 */
util.object.forEach = function(obj, f, opt_ctx) {
  for (var key in obj) {
    f.call(opt_ctx, obj[key], key, obj);
  }
};

util.object.toArray = function(obj, f, opt_ctx) {
  var arr = [];
  util.object.forEach(obj, function(elm,  key, origObj) {
    arr.push(f.call(opt_ctx, elm, key, origObj));
  }, opt_ctx);
  return arr;
};

util.object.shallowClone = function(obj) {
  var res = {};
  for (var key in obj) {
    res[key] = obj[key];
  }
  return res;
};


/***************/
/*  util.math  */
/***************/
util.math = {
  ROOT_2: Math.sqrt(2)
};

util.math.sqr = function(x) {
  return x*x;
};

util.math.random = function(min, max) {
  return Math.random() * (max - min) + min;
};

util.math.clamp = function(value, min, max) {
  return Math.min(Math.max(value, min), max);
};

