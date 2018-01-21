export default function use ( ...plugins ) {
	plugins.forEach( p => {
		p({
			proto: this.prototype,
			Ractive: this.Ractive,
			instance: this
		});
	});
	return this;
}
