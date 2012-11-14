Anglebars.js
============
the bastard lovechild of [Angular.js](http://angularjs.org/) and [handlebars](http://handlebarsjs.com/)
-------------------------------------------------------------------------------------------------------



[Angular.js](http://angularjs.org/) is awesome. If you haven't tried it yet, you definitely should. There's something rather magical about watching pages updating with new data, or respond to user input, without you telling them to. But it's 76kb minified - for many simple apps, it's overkill.

At the other end of the spectrum are templating engines like [Handlebars](http://handlebarsjs.com/) or [Hogan](http://twitter.github.com/hogan.js/) or other variations on the [Mustache](http://mustache.github.com/) theme. These are simple to use and understand, but they're often not well suited to complex dynamic views, because a change in the model necessitates a complete re-render - which is expensive and a nuisance when it comes to event handling.

**Anglebars.js** is half way in between. It's like a normal templating engine, but with added *magic*.


Usage
-----

Add the anglebars.js file somewhere on your page. Then:

    <div id='anglebars'></div>

    <script>
        var anglebars = new Anglebars({
        	el: 'anglebars',
        	template: '<p>{{helloworld}}</p>',
        	data: {
        		helloworld: 'Hello world!'
        	}
        });
    </script>

If, later, you decide to change the greeting:

    anglebars.set( 'helloworld', 'Greetings, my good fellow!' );


Neato features
--------------

As of version 0.1.0, Anglebars supports most of the mustache specification, excepting partials. That includes things like sections:

    {{#scores.length}}
    <p>The scores so far:</p>
    <ul>
        {{#scores}}<li>{{user}}: <strong>{{score}}</strong></li>{{/scores}}
    </ul>
    {{#scores.length}}

    {{^scores}}
    <p>No scores yet!</p>
    {{/scores}}

Take a look at the [examples](http://rich-harris.github.com/Anglebars/examples/) to see more of what can be done, including two-way data binding and other voodoo.

One feature that's not in the mustache spec is formatters. This is an idea (and not the only one) pinched from the excellent [knockout.js](http://knockoutjs.com/):

    var anglebars = new Anglebars({
    	el: 'anglebars',
    	template: '<p>The following text will appear in capitals: {{sometext | uppercase}}</p>',
    	formatters: {
    		uppercase: function ( input ) {
    			return input.toUpperCase();
    		}
    	}
    });


Caveats, feedback
-----------------

Like I said, this is version 0.1.0. It comes with no guarantees. But if you end up using the library, or just like the idea, do drop me a line at [@rich_harris](http://twitter.com/rich_harris).


License
-------

Released under the [WTFPL license](http://en.wikipedia.org/wiki/WTFPL).