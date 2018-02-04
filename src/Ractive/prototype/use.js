export default function use ( ...plugins ) {
	plugins.forEach( p => {
		p({
			proto: this,
			Ractive: this.constructor.Ractive,
			instance: this
		});
	});
	return this;
}
