
// create-assign @ npm, a combination of Object.create() and Object.assign().

// simply polyfill Object.assign(), from https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (!Object.assign) {
	Object.assign = function (target, varArgs) {
		if (target === null || target === undefined) {
			throw new TypeError('Cannot convert undefined or null to object');
		}

		var to = Object(target);
		for (var index = 1; index < arguments.length; index++) {
			var nextSource = arguments[index];
			if (nextSource !== null && nextSource !== undefined) {
				for (var nextKey in nextSource) {
					// Avoid bugs when hasOwnProperty is shadowed
					if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
						to[nextKey] = nextSource[nextKey];
					}
				}
			}
		}
		return to;
	}
}

//derive object
module.exports = function (proto, properties /*, properties2, ...*/) {
	return Object.assign.apply(Object, [Object.create(proto)].concat(Array.prototype.slice.call(arguments, 1)));
}
