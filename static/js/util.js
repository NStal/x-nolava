// Generated by CoffeeScript 1.10.0
(function() {
  Static.InterpolationStep = function(object, target, attributes, limit, useNorm, destination) {
    var attr, diffArray, i, index, item, j, k, l, len, len1, len2, len3, len4, m, norm, total;
    if (useNorm == null) {
      useNorm = false;
    }
    if (destination == null) {
      destination = {};
    }
    diffArray = [];
    for (i = 0, len = attributes.length; i < len; i++) {
      item = attributes[i];
      console.assert(typeof target[item] === "number");
      console.assert(typeof object[item] === "number");
      diffArray.push(target[item] - object[item]);
    }
    if (useNorm) {
      total = 0;
      for (j = 0, len1 = diffArray.length; j < len1; j++) {
        item = diffArray[j];
        total += item * item;
      }
      norm = Math.sqrt(total);
      if (norm === 0) {
        norm = 0.00001;
      }
      for (index = k = 0, len2 = diffArray.length; k < len2; index = ++k) {
        item = diffArray[index];
        diffArray[index] = item / norm * limit;
      }
    } else {
      for (index = l = 0, len3 = diffArray.length; l < len3; index = ++l) {
        item = diffArray[index];
        if (Math.abs(item) > limit) {
          diffArray[index] = Math.abs(item) / item * limit;
        }
      }
    }
    for (index = m = 0, len4 = attributes.length; m < len4; index = ++m) {
      attr = attributes[index];
      destination[attr] = diffArray[index];
    }
    return destination;
  };

  Static.Interpolation = function(object, target, attributes, limit, useNorm, destination) {
    var i, index, item, len;
    if (useNorm == null) {
      useNorm = false;
    }
    if (destination == null) {
      destination = {};
    }
    destination = Static.InterpolationStep(object, target, attributes, limit, useNorm, destination);
    for (index = i = 0, len = attributes.length; i < len; index = ++i) {
      item = attributes[index];
      destination[item] += object[item];
      if ((destination[item] - target[item]) * (object[item] - target[item]) < 0) {
        destination[item] = target[item];
      }
    }
    return destination;
  };

}).call(this);
