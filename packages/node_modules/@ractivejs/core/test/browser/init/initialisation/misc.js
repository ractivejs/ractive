import { hasUsableConsole, onWarn, initModule } from '../../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'init/initialisation/misc.js' );

	test( 'initialize with no options ok', t => {
		const ractive = new Ractive();
		t.ok( ractive );
	});

	if ( hasUsableConsole ) {
		test( 'functions that conflict with default properties are ignored and trigger warning', t => {
			let warned;
			onWarn( message => warned = message );

			const ractive = new Ractive({
				noIntro () {
					return true;
				}
			});

			t.ok( /noIntro/.test( warned ) );
			t.equal( ractive.noIntro, false );
		});
	}
}
