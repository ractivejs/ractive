// NOTE: This just adds Object.freeze presence. Nothing can be done.
if (!Object.freeze) {
	Object.freeze = function (obj) {
		return obj;
	};
}
