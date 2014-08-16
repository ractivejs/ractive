function EventObject ( options ) {
	this.node = options.node;
	this.original = options.original;
	this.index = options.index;
	this.keypath = options.keypath;
	this.context = options.context;
	this.component = options.component;
}

EventObject.prototype.stopBubble = function () {
	this._bubble = false;
}

export default EventObject
