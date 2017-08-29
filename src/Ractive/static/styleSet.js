import { applyCSS } from '../../global/css';
import transformCSS from '../config/custom/css/transform';
import { evalCSS } from '../config/custom/css/css';
import { build, set } from '../../shared/set';
import runloop from '../../global/runloop';

export default function setCSSData ( keypath, value, options ) {
	const opts = typeof keypath === 'object' ? value : options;
	const model = this._cssModel;

	model.locked = true;
	const promise = set( build( { viewmodel: model }, keypath, value, true ), opts );
	model.locked = false;

	const cascade = runloop.start();
	this.extensions.forEach( e => {
		const model = e._cssModel;
		model.mark();
		model.downstreamChanged( '', 1 );
	});
	runloop.end();

	applyChanges( this, !opts || opts.apply !== false );

	return promise.then( () => cascade );
}

export function applyChanges ( component, apply ) {
	const local = recomputeCSS( component );
	const child = component.extensions.map( e => applyChanges( e, false ) ).
	  reduce( ( a, c ) => c || a, false );

	if ( apply && ( local || child ) ) {
		const def = component._cssDef;
		if ( !def || ( def && def.applied ) ) applyCSS( true );
	}

	return local || child;
}

function recomputeCSS ( component ) {
	const css = component._css;

	if ( typeof css !== 'function' ) return;

	const def = component._cssDef;
	const result = evalCSS( component, css );
	const styles = def.transform ? transformCSS( result, def.id ) : result;

	if ( def.styles === styles ) return;

	def.styles = styles;

	return true;
}
