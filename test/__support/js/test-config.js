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

const consoleWarn = console.warn;
const consoleLog = console.log;

export const hasUsableConsole = typeof consoleWarn === 'function';

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

			console.warn = consoleWarn;
			console.log = consoleLog;
		}
	});
}

export function onWarn ( fn ) {
	console.warn = fn;
}

export function onLog ( fn ) {
	console.log = fn;
}
