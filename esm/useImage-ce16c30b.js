import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { useState } from 'react';

// returns a Promisized version of Image() api
var imagePromiseFactory = (function (_ref) {
  var _ref$decode = _ref.decode,
      decode = _ref$decode === void 0 ? true : _ref$decode,
      _ref$crossOrigin = _ref.crossOrigin,
      crossOrigin = _ref$crossOrigin === void 0 ? '' : _ref$crossOrigin,
      loadTimeout = _ref.loadTimeout;
  return function (src, isLastSrc) {
    return new Promise(function (resolve, reject) {
      var i = new Image();
      var timer;
      if (crossOrigin) i.crossOrigin = crossOrigin;

      i.onload = function () {
        clearTimeout(timer);
        decode && i.decode ? i.decode().then(resolve)["catch"](reject) : resolve();
      };

      i.onerror = reject;
      i.src = src;

      if (loadTimeout && !isLastSrc) {
        timer = setTimeout(function () {
          i.src = '';
          reject();
        }, loadTimeout);
      }
    });
  };
});

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var removeBlankArrayElements = function removeBlankArrayElements(a) {
  return a.filter(function (x) {
    return x;
  });
};

var stringToArray = function stringToArray(x) {
  return Array.isArray(x) ? x : [x];
};

var cache = {}; // sequential map.find for promises

var promiseFind = function promiseFind(arr, promiseFactory) {
  var srcLength = arr.length;
  var done = false;
  return new Promise(function (resolve, reject) {
    var queueNext = function queueNext(src, isLastSrc) {
      return promiseFactory(src, isLastSrc).then(function () {
        done = true;
        resolve(src);
      });
    };

    arr.reduce(function (p, src, index) {
      // ensure we aren't done before enquing the next source
      return p["catch"](function () {
        // index + 1 because we start operation from second item of array 
        var isLasutSrc = index + 1 === srcLength - 1;
        if (!done) return queueNext(src, isLasutSrc);
      });
    }, queueNext(arr.shift(), srcLength === 1))["catch"](reject);
  });
};

function useImage(_ref) {
  var srcList = _ref.srcList,
      imgPromise = _ref.imgPromise,
      _ref$useSuspense = _ref.useSuspense,
      useSuspense = _ref$useSuspense === void 0 ? true : _ref$useSuspense,
      loadTimeout = _ref.loadTimeout;
  var imgLoadPromise = imgPromise != null ? imgPromise : imagePromiseFactory({
    decode: true,
    loadTimeout: loadTimeout
  });

  var _useState = useState(true),
      setIsLoading = _useState[1];

  var sourceList = removeBlankArrayElements(stringToArray(srcList));
  var sourceKey = sourceList.join('');

  if (!cache[sourceKey]) {
    // create promise to loop through sources and try to load one
    cache[sourceKey] = {
      promise: promiseFind(sourceList, imgLoadPromise),
      cache: 'pending',
      error: null
    };
  } // when promise resolves/reject, update cache & state


  cache[sourceKey].promise // if a source was found, update cache
  // when not using suspense, update state to force a rerender
  .then(function (src) {
    cache[sourceKey] = _objectSpread(_objectSpread({}, cache[sourceKey]), {}, {
      cache: 'resolved',
      src: src
    });
    if (!useSuspense) setIsLoading(false);
  }) // if no source was found, or if another error occured, update cache
  // when not using suspense, update state to force a rerender
  ["catch"](function (error) {
    cache[sourceKey] = _objectSpread(_objectSpread({}, cache[sourceKey]), {}, {
      cache: 'rejected',
      error: error
    });
    if (!useSuspense) setIsLoading(false);
  });

  if (cache[sourceKey].cache === 'resolved') {
    return {
      src: cache[sourceKey].src,
      isLoading: false,
      error: null
    };
  }

  if (cache[sourceKey].cache === 'rejected') {
    if (useSuspense) throw cache[sourceKey].error;
    return {
      isLoading: false,
      error: cache[sourceKey].error,
      src: undefined
    };
  } // cache[sourceKey].cache === 'pending')


  if (useSuspense) throw cache[sourceKey].promise;
  return {
    isLoading: true,
    src: undefined,
    error: null
  };
}

export { imagePromiseFactory as i, useImage as u };
//# sourceMappingURL=useImage-ce16c30b.js.map
