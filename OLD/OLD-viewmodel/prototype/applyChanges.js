export default function Viewmodel$applyChanges () {
	this._changeHash = {};
	this.root.flush();
	return this._changeHash;
}
