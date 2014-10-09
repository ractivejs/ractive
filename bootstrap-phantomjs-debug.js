/*
from http://phantomjs.org/troubleshooting.html

1. start on command line with remote-debugger-port option:

$ractive> node_modules/grunt-contrib-qunit/node_modules/grunt-lib-phantomjs/node_modules/phantomjs/lib/phantom/bin/phantomjs --remote-debugger-port=9000 bootstrap-phantomjs-debug.js

2. navigate to debugging port in web browser (localhost:9000)
3. get first web inspector for phantom context (click about:blank)
4. from the web browser console execute __run(), which will hit first debugger point
5. navigate to debugging port in a second web browser tab (go to localhost:9000 again, you'll see the target file listed)
6. get second web inspector (click on link in #5)
7. return to the first web inspector tab and click continue on debugger
8. navigate back to second tab and you should find debugger waiting

For many issues:
9. Make sure break on exceptions is selected (blue pause)
10. Run (F8)
11. Open console and look for errors

*/

//set your page here
var url = 'tmp-build/test/tests/css.html',
    page = require('webpage').create();


page.onLoadFinished = function(status) {
    console.log('status', status)
    //phantom.exit(); ignored by debug anyway
};

page.open(url, function(status) {
      debugger; // pause here in first web browser tab for steps 5 & 6
	  page.evaluateAsync(function() {
	    debugger; // step 7 will wait here in the second web browser tab
	  });
});
