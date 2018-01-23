// This is the handler for DOM events that would lead to a change in the model
// (i.e. change, sometimes, input, and occasionally click and keyup)
export default function handleDomEvent () {
	this._ractive.binding.handleChange();
}
