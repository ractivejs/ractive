if (!Function.prototype.bind) {
	Function.prototype.bind = function (thisArg, ...args) {
		if (typeof this !== 'function')
			throw new TypeError('Bind must be called on a function');

		const target = this;

		const BoundFunctionParent = function () { };
		BoundFunctionParent.prototype = this.prototype || BoundFunctionParent.prototype;

		const boundFunction = function (...callArgs) {
			const isCalledAsConstructor = this instanceof BoundFunctionParent;
			return target.apply(isCalledAsConstructor ? this : thisArg, [...args, ...callArgs]);
		};
		boundFunction.prototype = new BoundFunctionParent();

		return boundFunction;
	};
}
