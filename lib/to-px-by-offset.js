
//transfer css property to px unit, by comparing offset-x property.

function toPxByOffset(el, styleName, offsetName) {
	var s = "" + el.style[styleName];
	if (s.match(/^(\d+)px$/)) return parseInt(s);

	var n = el[offsetName];
	el.style[styleName] = n + "px";
	n -= (el[offsetName] - n);
	el.style[styleName] = n + "px";
	return n;
}

// module

module.exports = exports = toPxByOffset;

exports.width = function (el) { return toPxByOffset(el, "width", "offsetWidth"); }
exports.left = function (el) { return toPxByOffset(el, "left", "offsetLeft"); }
exports.height = function (el) { return toPxByOffset(el, "height", "offsetHeight"); }
exports.top = function (el) { return toPxByOffset(el, "top", "offsetTop"); }
