import { test } from 'qunit';
import { hasUsableConsole, onWarn } from 'test-config';

test( 'initialize with no options ok', t => {
	const ractive = new Ractive();
	t.ok( ractive );
});

if ( hasUsableConsole ) {
	test ( 'functions that conflict with default properties are ignored and trigger warning', t => {
		let warned;
		onWarn( message => warned = message );

		let ractive = new Ractive({
			noIntro () {
				return true;
			}
		});

		t.ok( /noIntro/.test( warned ) );
		t.equal( ractive.noIntro, false );
	});
}
