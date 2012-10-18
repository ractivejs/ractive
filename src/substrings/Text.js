Anglebars.substrings.Text = function ( model ) {
	this.text = model.text;
};

Anglebars.substrings.Text.prototype = {
	toString: function () {
		return this.text;
	}
};

