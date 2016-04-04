/*eslint no-console:0 */
import { module } from 'qunit';

export let beforeEachCallbacks = [];
export let afterEachCallbacks = [];

export function beforeEach ( fn ) {
	beforeEachCallbacks.push( fn );
}

export function afterEach ( fn ) {
	afterEachCallbacks.push( fn );
}

function call ( fn ) {
	fn();
}

let consoleWarn;
let consoleLog;

export const hasUsableConsole = typeof console !== 'undefined' && typeof console.warn === 'function';

if ( hasUsableConsole ) {
	consoleWarn = console.warn;
	consoleLog = console.log;
}

export function initModule ( id ) {
	const before = beforeEachCallbacks;
	const after = afterEachCallbacks;

	beforeEachCallbacks = [];
	afterEachCallbacks = [];

	module( id, {
		beforeEach () {
			before.forEach( call );
		},
		afterEach () {
			after.forEach( call );

			// TODO this shouldn't really be necessary...
			if ( fixture.__ractive_instances__ ) {
				fixture.__ractive_instances__.forEach( ractive => {
					ractive.transitionsEnabled = false;
					ractive.teardown();
				});

				fixture.__ractive_instances__ = null;
			}

			if ( hasUsableConsole ) {
				console.warn = consoleWarn;
				console.log = consoleLog;
			}
		}
	});
}

export function onWarn ( fn ) {
	if ( !hasUsableConsole ) {
		return;
	}

	console.warn = fn;
}

export function onLog ( fn ) {
	if ( !hasUsableConsole ) {
		return;
	}

	console.log = fn;
}
