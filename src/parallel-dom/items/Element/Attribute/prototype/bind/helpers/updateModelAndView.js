// Blurring an input should update the model, but we should also update the
// view in case any validation rules were applied (e.g. via an observer)
var getOptions = { evaluateWrapped: true };

export default function updateModelAndView () {
	var value;

	updateModel.call( this );

	value = get( this._ractive.root, this._ractive.binding.keypath, getOptions );
	this.value = value == undefined ? '' : value;
}
