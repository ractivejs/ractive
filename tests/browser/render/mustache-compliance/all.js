import { onWarn, initModule } from '../../../helpers/test-config';
import { test } from 'qunit';

// MUSTACHE SPEC COMPLIANCE TESTS
// ==============================
//
// These are included to aid development; Ractive will never be able to pass
// every test in the suite because it's doing something fundamentally different
// to other mustache implementations.
//
// Unpassable tests are marked as such.
//
// Some tests technically fail in IE8. This is because IE8 is shit. The library
// works fine, but IE8 gets all confused about whitespace when doing innerHTML.
// For the sake of sanity, these tests are also marked.
//
// TODO update tests from source

export default function() {
	initModule( 'render/mustache-compliance/all.js' );

	const testModules = [
		{
			name: 'Comments',
			tests: [
				{
					name: 'Inline',
					data: {},
					expected: '1234567890',
					template: '12345{{! Comment Block! }}67890',
					desc: 'Comment blocks should be removed from the template.'
				},
				{
					name: 'Multiline',
					data: {},
					expected: '1234567890\n',
					template: '12345{{!\n  This is a\n  multi-line comment...\n}}67890\n',
					desc: 'Multiline comments should be permitted.'
				},
				{
					name: 'Standalone',
					data: {},
					expected: 'Begin.\nEnd.\n',
					template: 'Begin.\n{{! Comment Block! }}\nEnd.\n',
					desc: 'All standalone comment lines should be removed.'
				},
				{
					name: 'Indented Standalone',
					data: {},
					expected: 'Begin.\nEnd.\n',
					template: 'Begin.\n  {{! Indented Comment Block! }}\nEnd.\n',
					desc: 'All standalone comment lines should be removed.'
				},
				{
					name: 'Standalone Line Endings',
					data: {},
					expected: '|\r\n|',
					template: '|\r\n{{! Standalone Comment }}\r\n|',
					desc: `"\\r\\n" should be considered a newline for standalone tags.`
				},
				{
					name: 'Standalone Without Previous Line',
					data: {},
					expected: '!',
					template: `  {{! I'm Still Standalone }}\n!`,
					desc: 'Standalone tags should not require a newline to precede them.'
				},
				{
					name: 'Standalone Without Newline',
					data: {},
					expected: '!\n',
					template: `!\n  {{! I'm Still Standalone }}`,
					desc: 'Standalone tags should not require a newline to follow them.'
				},
				{
					name: 'Multiline Standalone',
					data: {},
					expected: 'Begin.\nEnd.\n',
					template: `Begin.\n{{!\nSomething's going on here...\n}}\nEnd.\n`,
					desc: 'All standalone comment lines should be removed.'
				},
				{
					name: 'Indented Multiline Standalone',
					data: {},
					expected: 'Begin.\nEnd.\n',
					template: `Begin.\n  {{!\n	Something's going on here...\n  }}\nEnd.\n`,
					desc: 'All standalone comment lines should be removed.'
				},
				{
					name: 'Indented Inline',
					data: {},
					expected: '  12 \n',
					template: '  12 {{! 3 4 }}\n',
					desc: 'Inline comments should not strip whitespace'
				},
				{
					name: 'Surrounding Whitespace',
					data: {},
					expected: '12345  67890',
					template: '12345 {{! Comment Block! }} 67890',
					desc: 'Comment removal should preserve surrounding whitespace.'
				}
			]
		},

		{
			name: 'Delimiters',
			tests: [
				{
					name: 'Pair Behavior',
					data: {
						text: 'Hey!'
					},
					expected: '(Hey!)',
					template: '{{=<% %>=}}(<%text%>)',
					desc: 'The equals sign (used on both sides) should permit delimiter changes.'
				},
				{
					name: 'Special Characters',
					data: {
						text: 'It worked!'
					},
					expected: '(It worked!)',
					template: '({{=[ ]=}}[text])',
					desc: 'Characters with special meaning regexen should be valid delimiters.'
				},
				{
					name: 'Sections',
					data: {
						section: true,
						data: 'I got interpolated.'
					},
					expected: '[\n  I got interpolated.\n  |data|\n\n  {{data}}\n  I got interpolated.\n]\n',
					template: '[\n{{#section}}\n  {{data}}\n  |data|\n{{/section}}\n\n{{= | | =}}\n|#section|\n  {{data}}\n  |data|\n|/section|\n]\n',
					desc: 'Delimiters set outside sections should persist.',
					oldIe: true
				},
				{
					name: 'Inverted Sections',
					data: {
						section: false,
						data: 'I got interpolated.'
					},
					expected: '[\n  I got interpolated.\n  |data|\n\n  {{data}}\n  I got interpolated.\n]\n',
					template: '[\n{{^section}}\n  {{data}}\n  |data|\n{{/section}}\n\n{{= | | =}}\n|^section|\n  {{data}}\n  |data|\n|/section|\n]\n',
					desc: 'Delimiters set outside inverted sections should persist.',
					oldIe: true
				},
				{
					name: 'Partial Inheritence',
					data: {
						value: 'yes'
					},
					expected: '[ .yes. ]\n[ .yes. ]\n',
					template: '[ {{>include}} ]\n{{= | | =}}\n[ |>include| ]\n',
					desc: 'Delimiters set in a parent template should not affect a partial.',
					partials: {
						include: '.{{value}}.'
					},
					oldIe: true
				},
				{
					name: 'Post-Partial Behavior',
					data: {
						value: 'yes'
					},
					expected: '[ .yes.  .yes. ]\n[ .yes.  .|value|. ]\n',
					template: '[ {{>include}} ]\n[ .{{value}}.  .|value|. ]\n',
					desc: 'Delimiters set in a partial should not affect the parent template.',
					partials: {
						// Note: the original test looked like this:
						//     include: `.{{value}}. {{= | | =}} .|value|.`
						// This breaks in Ractive because the | is assumed to be part of the
						// expression
						include: '.{{value}}. {{= <% %> =}} .<%value%>.'
					},
					oldIe: true
				},
				{
					name: 'Surrounding Whitespace',
					data: {},
					expected: '|  |',
					template: '| {{=@ @=}} |',
					desc: 'Surrounding whitespace should be left untouched.'
				},
				{
					name: 'Outlying Whitespace (Inline)',
					data: {},
					expected: ' | \n',
					template: ' | {{=@ @=}}\n',
					desc: 'Whitespace should be left untouched.'
				},
				{
					name: 'Standalone Tag',
					data: {},
					expected: 'Begin.\nEnd.\n',
					template: 'Begin.\n{{=@ @=}}\nEnd.\n',
					desc: 'Standalone lines should be removed from the template.'
				},
				{
					name: 'Indented Standalone Tag',
					data: {},
					expected: 'Begin.\nEnd.\n',
					template: 'Begin.\n  {{=@ @=}}\nEnd.\n',
					desc: 'Indented standalone lines should be removed from the template.'
				},
				{
					name: 'Standalone Line Endings',
					data: {},
					expected: '|\r\n|',
					template: '|\r\n{{= @ @ =}}\r\n|',
					desc: `"\\r\\n" should be considered a newline for standalone tags.`
				},
				{
					name: 'Standalone Without Previous Line',
					data: {},
					expected: '=',
					template: '  {{=@ @=}}\n=',
					desc: 'Standalone tags should not require a newline to precede them.'
				},
				{
					name: 'Standalone Without Newline',
					data: {},
					expected: '=\n',
					template: '=\n  {{=@ @=}}',
					desc: 'Standalone tags should not require a newline to follow them.'
				},
				{
					name: 'Pair with Padding',
					data: {},
					expected: '||',
					template: '|{{= @   @ =}}|',
					desc: 'Superfluous in-tag whitespace should be ignored.'
				}
			]
		},

		{
			name: 'Interpolation',
			tests: [
				{
					name: 'No Interpolation',
					data: {},
					expected: 'Hello from {Mustache}!\n',
					template: 'Hello from {Mustache}!\n',
					desc: 'Mustache-free templates should render as-is.'
				},
				{
					name: 'Basic Interpolation',
					data: {
						subject: 'world'
					},
					expected: 'Hello, world!\n',
					template: 'Hello, {{subject}}!\n',
					desc: 'Unadorned tags should interpolate content into the template.'
				},
				{
					name: 'HTML Escaping',
					data: {
						forbidden: `& " < >`
					},
					expected: 'These characters should be HTML escaped: &amp; &quot; &lt; &gt;\n',
					template: 'These characters should be HTML escaped: {{forbidden}}\n',
					desc: 'Basic interpolation should be HTML escaped.'
				},
				{
					name: 'Triple Mustache',
					data: {
						forbidden: `& " < >`
					},
					expected: `These characters should not be HTML escaped: & " < >\n`,
					template: 'These characters should not be HTML escaped: {{{forbidden}}}\n',
					desc: 'Triple mustaches should interpolate without HTML escaping.'
				},
				{
					name: 'Ampersand',
					data: {
						forbidden: `& " < >`
					},
					expected: `These characters should not be HTML escaped: & " < >\n`,
					template: 'These characters should not be HTML escaped: {{&forbidden}}\n',
					desc: 'Ampersand should interpolate without HTML escaping.'
				},
				{
					name: 'Basic Integer Interpolation',
					data: {
						mph: 85
					},
					expected: `\"85 miles an hour!\"`,
					template: `\"{{mph}} miles an hour!\"`,
					desc: 'Integers should interpolate seamlessly.'
				},
				{
					name: 'Triple Mustache Integer Interpolation',
					data: {
						mph: 85
					},
					expected: `\"85 miles an hour!\"`,
					template: `\"{{{mph}}} miles an hour!\"`,
					desc: 'Integers should interpolate seamlessly.'
				},
				{
					name: 'Ampersand Integer Interpolation',
					data: {
						mph: 85
					},
					expected: `\"85 miles an hour!\"`,
					template: `\"{{&mph}} miles an hour!\"`,
					desc: 'Integers should interpolate seamlessly.'
				},
				{
					name: 'Basic Decimal Interpolation',
					data: {
						power: 1.21
					},
					expected: `\"1.21 jiggawatts!\"`,
					template: `\"{{power}} jiggawatts!\"`,
					desc: 'Decimals should interpolate seamlessly with proper significance.'
				},
				{
					name: 'Triple Mustache Decimal Interpolation',
					data: {
						power: 1.21
					},
					expected: `\"1.21 jiggawatts!\"`,
					template: `\"{{{power}}} jiggawatts!\"`,
					desc: 'Decimals should interpolate seamlessly with proper significance.'
				},
				{
					name: 'Ampersand Decimal Interpolation',
					data: {
						power: 1.21
					},
					expected: `\"1.21 jiggawatts!\"`,
					template: `\"{{&power}} jiggawatts!\"`,
					desc: 'Decimals should interpolate seamlessly with proper significance.'
				},
				{
					name: 'Basic Context Miss Interpolation',
					data: {},
					expected: 'I () be seen!',
					template: 'I ({{cannot}}) be seen!',
					desc: 'Failed context lookups should default to empty strings.'
				},
				{
					name: 'Triple Mustache Context Miss Interpolation',
					data: {},
					expected: 'I () be seen!',
					template: 'I ({{{cannot}}}) be seen!',
					desc: 'Failed context lookups should default to empty strings.'
				},
				{
					name: 'Ampersand Context Miss Interpolation',
					data: {},
					expected: 'I () be seen!',
					template: 'I ({{&cannot}}) be seen!',
					desc: 'Failed context lookups should default to empty strings.'
				},
				{
					name: 'Dotted Names - Basic Interpolation',
					data: {
						person: {
							name: 'Joe'
						}
					},
					expected: `\"Joe\" == \"Joe\"`,
					template: `\"{{person.name}}\" == \"{{#person}}{{name}}{{/person}}\"`,
					desc: 'Dotted names should be considered a form of shorthand for sections.'
				},
				{
					name: 'Dotted Names - Triple Mustache Interpolation',
					data: {
						person: {
							name: 'Joe'
						}
					},
					expected: `\"Joe\" == \"Joe\"`,
					template: `\"{{{person.name}}}\" == \"{{#person}}{{{name}}}{{/person}}\"`,
					desc: 'Dotted names should be considered a form of shorthand for sections.'
				},
				{
					name: 'Dotted Names - Ampersand Interpolation',
					data: {
						person: {
							name: 'Joe'
						}
					},
					expected: `\"Joe\" == \"Joe\"`,
					template: `\"{{&person.name}}\" == \"{{#person}}{{&name}}{{/person}}\"`,
					desc: 'Dotted names should be considered a form of shorthand for sections.'
				},
				{
					name: 'Dotted Names - Arbitrary Depth',
					data: {
						a: {
							b: {
								c: {
									d: {
										e: {
											name: 'Phil'
										}
									}
								}
							}
						}
					},
					expected: `\"Phil\" == \"Phil\"`,
					template: `\"{{a.b.c.d.e.name}}\" == \"Phil\"`,
					desc: 'Dotted names should be functional to any level of nesting.'
				},
				{
					name: 'Dotted Names - Broken Chains',
					data: {
						a: {}
					},
					expected: `"" == ""`,
					template: `"{{a.b.c}}" == ""`,
					desc: `Any falsey value prior to the last part of the name should yield ''.`
				},
				{
					name: 'Dotted Names - Broken Chain Resolution',
					data: {
						a: {
							b: {}
						},
						c: {
							name: 'Jim'
						}
					},
					expected: `\"\" == \"\"`,
					template: `\"{{a.b.c.name}}\" == \"\"`,
					desc: 'Each part of a dotted name should resolve only against its parent.'
				},
				{
					name: 'Dotted Names - Initial Resolution',
					data: {
						a: {
							b: {
								c: {
									d: {
										e: {
											name: 'Phil'
										}
									}
								}
							}
						},
						b: {
							c: {
								d: {
									e: {
										name: 'Wrong'
									}
								}
							}
						}
					},
					expected: `\"Phil\" == \"Phil\"`,
					template: `\"{{#a}}{{b.c.d.e.name}}{{/a}}\" == \"Phil\"`,
					desc: 'The first part of a dotted name should resolve as any other name.'
				},
				{
					name: 'Interpolation - Surrounding Whitespace',
					data: {
						string: `---`
					},
					expected: '| --- |',
					template: '| {{string}} |',
					desc: 'Interpolation should not alter surrounding whitespace.'
				},
				{
					name: 'Triple Mustache - Surrounding Whitespace',
					data: {
						string: `---`
					},
					expected: '| --- |',
					template: '| {{{string}}} |',
					desc: 'Interpolation should not alter surrounding whitespace.'
				},
				{
					name: 'Ampersand - Surrounding Whitespace',
					data: {
						string: `---`
					},
					expected: '| --- |',
					template: '| {{&string}} |',
					desc: 'Interpolation should not alter surrounding whitespace.'
				},
				{
					name: 'Interpolation - Standalone',
					data: {
						string: `---`
					},
					expected: '  ---\n',
					template: '  {{string}}\n',
					desc: 'Standalone interpolation should not alter surrounding whitespace.'
				},
				{
					name: 'Triple Mustache - Standalone',
					data: {
						string: `---`
					},
					expected: '  ---\n',
					template: '  {{{string}}}\n',
					desc: 'Standalone interpolation should not alter surrounding whitespace.'
				},
				{
					name: 'Ampersand - Standalone',
					data: {
						string: `---`
					},
					expected: '  ---\n',
					template: '  {{&string}}\n',
					desc: 'Standalone interpolation should not alter surrounding whitespace.'
				},
				{
					name: 'Interpolation With Padding',
					data: {
						string: `---`
					},
					expected: '|---|',
					template: '|{{ string }}|',
					desc: 'Superfluous in-tag whitespace should be ignored.'
				},
				{
					name: 'Triple Mustache With Padding',
					data: {
						string: `---`
					},
					expected: '|---|',
					template: '|{{{ string }}}|',
					desc: 'Superfluous in-tag whitespace should be ignored.'
				},
				{
					name: 'Ampersand With Padding',
					data: {
						string: `---`
					},
					expected: '|---|',
					template: '|{{& string }}|',
					desc: 'Superfluous in-tag whitespace should be ignored.'
				}
			]
		},

		{
			name: 'Inverted',
			tests: [
				{
					name: 'Falsey',
					data: {
						boolean: false
					},
					expected: `\"This should be rendered.\"`,
					template: `\"{{^boolean}}This should be rendered.{{/boolean}}\"`,
					desc: 'Falsey sections should have their contents rendered.'
				},
				{
					name: 'Truthy',
					data: {
						boolean: true
					},
					expected: `\"\"`,
					template: `\"{{^boolean}}This should not be rendered.{{/boolean}}\"`,
					desc: 'Truthy sections should have their contents omitted.'
				},
				{
					name: 'Context',
					data: {
						context: {
							name: 'Joe'
						}
					},
					expected: `\"\"`,
					template: `\"{{^context}}Hi {{name}}.{{/context}}\"`,
					desc: 'Objects and hashes should behave like truthy values.'
				},
				{
					name: 'List',
					data: {
						list: [
							{
								n: 1
							},
							{
								n: 2
							},
							{
								n: 3
							}
						]
					},
					expected: `\"\"`,
					template: `\"{{^list}}{{n}}{{/list}}\"`,
					desc: 'Lists should behave like truthy values.'
				},
				{
					name: 'Empty List',
					data: {
						list: []
					},
					expected: `\"Yay lists!\"`,
					template: `\"{{^list}}Yay lists!{{/list}}\"`,
					desc: 'Empty lists should behave like falsey values.'
				},
				{
					name: 'Doubled',
					data: {
						two: `second`,
						bool: false
					},
					expected: '* first\n* second\n* third\n',
					template: '{{^bool}}\n* first\n{{/bool}}\n* {{two}}\n{{^bool}}\n* third\n{{/bool}}\n',
					desc: `Multiple inverted sections per template should be permitted.`,
					oldIe: true
				},
				{
					name: 'Nested (Falsey)',
					data: {
						bool: false
					},
					expected: '| A B C D E |',
					template: '| A {{^bool}}B {{^bool}}C{{/bool}} D{{/bool}} E |',
					desc: 'Nested falsey sections should have their contents rendered.'
				},
				{
					name: 'Nested (Truthy)',
					data: {
						bool: true
					},
					expected: '| A  E |',
					template: '| A {{^bool}}B {{^bool}}C{{/bool}} D{{/bool}} E |',
					desc: 'Nested truthy sections should be omitted.'
				},
				{
					name: 'Context Misses',
					data: {},
					expected: `[Cannot find key 'missing'!]`,
					template: `[{{^missing}}Cannot find key 'missing'!{{/missing}}]`,
					desc: 'Failed context lookups should be considered falsey.'
				},
				{
					name: 'Dotted Names - Truthy',
					data: {
						a: {
							b: {
								c: true
							}
						}
					},
					expected: `\"\" == \"\"`,
					template: `\"{{^a.b.c}}Not Here{{/a.b.c}}\" == \"\"`,
					desc: 'Dotted names should be valid for Inverted Section tags.'
				},
				{
					name: 'Dotted Names - Falsey',
					data: {
						a: {
							b: {
								c: false
							}
						}
					},
					expected: `\"Not Here\" == \"Not Here\"`,
					template: `\"{{^a.b.c}}Not Here{{/a.b.c}}\" == \"Not Here\"`,
					desc: 'Dotted names should be valid for Inverted Section tags.'
				},
				{
					name: 'Dotted Names - Broken Chains',
					data: {
						a: {}
					},
					expected: `\"Not Here\" == \"Not Here\"`,
					template: `\"{{^a.b.c}}Not Here{{/a.b.c}}\" == \"Not Here\"`,
					desc: 'Dotted names that cannot be resolved should be considered falsey.'
				},
				{
					name: 'Surrounding Whitespace',
					data: {
						boolean: false
					},
					expected: ' | \t|\t | \n',
					template: ' | {{^boolean}}\t|\t{{/boolean}} | \n',
					desc: 'Inverted sections should not alter surrounding whitespace.'
				},
				{
					name: 'Internal Whitespace',
					data: {
						boolean: false
					},
					expected: ' |  \n  | \n',
					template: ' | {{^boolean}} {{! Important Whitespace }}\n {{/boolean}} | \n',
					desc: 'Inverted should not alter internal whitespace.'
				},
				{
					name: 'Indented Inline Sections',
					data: {
						boolean: false
					},
					expected: ' NO\n WAY\n',
					template: ' {{^boolean}}NO{{/boolean}}\n {{^boolean}}WAY{{/boolean}}\n',
					desc: 'Single-line sections should not alter surrounding whitespace.'
				},
				{
					name: 'Standalone Lines',
					data: {
						boolean: false
					},
					expected: '| This Is\n|\n| A Line\n',
					template: '| This Is\n{{^boolean}}\n|\n{{/boolean}}\n| A Line\n',
					desc: `Standalone lines should be removed from the template.`,
					oldIe: true
				},
				{
					name: 'Standalone Indented Lines',
					data: {
						boolean: false
					},
					expected: '| This Is\n|\n| A Line\n',
					template: '| This Is\n  {{^boolean}}\n|\n  {{/boolean}}\n| A Line\n',
					desc: `Standalone indented lines should be removed from the template.`,
					oldIe: true
				},
				{
					name: 'Standalone Line Endings',
					data: {
						boolean: false
					},
					expected: '|\r\n|',
					template: '|\r\n{{^boolean}}\r\n{{/boolean}}\r\n|',
					desc: `\"\\r\\n\" should be considered a newline for standalone tags.`,
					unpassable: true
				},
				{
					name: 'Standalone Without Previous Line',
					data: {
						boolean: false
					},
					expected: '^\n/',
					template: '  {{^boolean}}\n^{{/boolean}}\n/',
					desc: `Standalone tags should not require a newline to precede them.`,
					oldIe: true
				},
				{
					name: 'Standalone Without Newline',
					data: {
						boolean: false
					},
					expected: '^\n/\n',
					template: '^{{^boolean}}\n/\n  {{/boolean}}',
					desc: `Standalone tags should not require a newline to follow them.`,
					oldIe: true
				},
				{
					name: 'Padding',
					data: {
						boolean: false
					},
					expected: '|=|',
					template: '|{{^ boolean }}={{/ boolean }}|',
					desc: 'Superfluous in-tag whitespace should be ignored.'
				}
			]
		},

		{
			name: 'Partials',
			tests: [
				{
					name: 'Basic Behavior',
					data: {},
					expected: `\"from partial\"`,
					template: `\"{{>text}}\"`,
					desc: `The greater-than operator should expand to the named partial.`,
					partials: {
						text: `from partial`
					}
				},
				{
					name: 'Failed Lookup',
					data: {},
					expected: `\"\"`,
					template: `\"{{>text}}\"`,
					desc: `The empty string should be used when the named partial is not found.`,
					partials: {}
				},
				{
					name: 'Context',
					data: {
						text: `content`
					},
					expected: `\"*content*\"`,
					template: `\"{{>partial}}\"`,
					desc: `The greater-than operator should operate within the current context.`,
					partials: {
						partial: `*{{text}}*`
					}
				},
				{
					name: 'Recursion',
					data: {
						content: `X`,
						nodes: [
							{
								content: `Y`,
								nodes: []
							}
						]
					},
					expected: 'X(Y())',
					template: '{{>node}}',
					desc: `The greater-than operator should properly recurse.`,
					partials: {
						node: `{{content}}({{#nodes}}{{>node}}{{/nodes}})`
					}
				},
				{
					name: 'Surrounding Whitespace',
					data: {},
					expected: '| \t|\t |',
					template: '| {{>partial}} |',
					desc: `The greater-than operator should not alter surrounding whitespace.`,
					partials: {
						partial: `\t|\t`
					}
				},
				{
					name: 'Inline Indentation',
					data: {
						data: `|`
					},
					expected: '  |  >\n>\n',
					template: '  {{data}}  {{> partial}}\n',
					desc: `Whitespace should be left untouched.`,
					partials: {
						partial: `>\n>`
					}
				},
				{
					name: 'Standalone Line Endings',
					data: {},
					expected: '|\r\n>|',
					template: '|\r\n{{>partial}}\r\n|',
					desc: `\"\\r\\n\" should be considered a newline for standalone tags.`,
					partials: {
						partial: `>`
					},
					oldIe: true,
					unpassable: true
				},
				{
					name: 'Standalone Without Previous Line',
					data: {},
					expected: '  >\n  >>',
					template: '  {{>partial}}\n>',
					desc: `Standalone tags should not require a newline to precede them.`,
					partials: {
						partial: `>\n>`
					},
					unpassable: true
				},
				{
					name: 'Standalone Without Newline',
					data: {},
					expected: '>\n  >\n  >',
					template: '>\n  {{>partial}}',
					desc: `Standalone tags should not require a newline to follow them.`,
					partials: {
						partial: `>\n>`
					},
					unpassable: true
				},
				{
					name: 'Standalone Indentation',
					data: {
						content: `<\n->`
					},
					expected: '\\\n |\n <\n->\n |\n/\n',
					template: '\\\n {{>partial}}\n/\n',
					desc: `Each line of the partial should be indented before rendering.`,
					partials: {
						partial: `|\n{{{content}}}\n|\n`
					},
					unpassable: true
				},
				{
					name: 'Padding Whitespace',
					data: {
						boolean: true
					},
					expected: '|[]|',
					template: '|{{> partial }}|',
					desc: `Superfluous in-tag whitespace should be ignored.`,
					partials: {
						partial: `[]`
					}
				}
			]
		},

		{
			name: 'Sections',
			tests: [
				{
					name: 'Truthy',
					data: {
						boolean: true
					},
					expected: `\"This should be rendered.\"`,
					template: `\"{{#boolean}}This should be rendered.{{/boolean}}\"`,
					desc: 'Truthy sections should have their contents rendered.'
				},
				{
					name: 'Falsey',
					data: {
						boolean: false
					},
					expected: `\"\"`,
					template: `\"{{#boolean}}This should not be rendered.{{/boolean}}\"`,
					desc: 'Falsey sections should have their contents omitted.'
				},
				{
					name: 'Context',
					data: {
						context: {
							name: 'Joe'
						}
					},
					expected: `\"Hi Joe.\"`,
					template: `\"{{#context}}Hi {{name}}.{{/context}}\"`,
					desc: 'Objects and hashes should be pushed onto the context stack.'
				},
				{
					name: 'Deeply Nested Contexts',
					data: {
						a: {
							one: 1
						},
						b: {
							two: 2
						},
						c: {
							three: 3
						},
						d: {
							four: 4
						},
						e: {
							five: 5
						}
					},
					expected: '1\n121\n12321\n1234321\n123454321\n1234321\n12321\n121\n1\n',
					template: '{{#a}}\n{{one}}\n{{#b}}\n{{one}}{{two}}{{one}}\n{{#c}}\n{{one}}{{two}}{{three}}{{two}}{{one}}\n{{#d}}\n{{one}}{{two}}{{three}}{{four}}{{three}}{{two}}{{one}}\n{{#e}}\n{{one}}{{two}}{{three}}{{four}}{{five}}{{four}}{{three}}{{two}}{{one}}\n{{/e}}\n{{one}}{{two}}{{three}}{{four}}{{three}}{{two}}{{one}}\n{{/d}}\n{{one}}{{two}}{{three}}{{two}}{{one}}\n{{/c}}\n{{one}}{{two}}{{one}}\n{{/b}}\n{{one}}\n{{/a}}\n',
					desc: `All elements on the context stack should be accessible.`,
					oldIe: true
				},
				{
					name: 'List',
					data: {
						list: [
							{
								item: 1
							},
							{
								item: 2
							},
							{
								item: 3
							}
						]
					},
					expected: `\"123\"`,
					template: `\"{{#list}}{{item}}{{/list}}\"`,
					desc: 'Lists should be iterated; list items should visit the context stack.'
				},
				{
					name: 'Empty List',
					data: {
						list: []
					},
					expected: `\"\"`,
					template: `\"{{#list}}Yay lists!{{/list}}\"`,
					desc: 'Empty lists should behave like falsey values.'
				},
				{
					name: 'Doubled',
					data: {
						two: `second`,
						bool: true
					},
					expected: '* first\n* second\n* third\n',
					template: '{{#bool}}\n* first\n{{/bool}}\n* {{two}}\n{{#bool}}\n* third\n{{/bool}}\n',
					desc: `Multiple sections per template should be permitted.`,
					oldIe: true
				},
				{
					name: 'Nested (Truthy)',
					data: {
						bool: true
					},
					expected: '| A B C D E |',
					template: '| A {{#bool}}B {{#bool}}C{{/bool}} D{{/bool}} E |',
					desc: 'Nested truthy sections should have their contents rendered.'
				},
				{
					name: 'Nested (Falsey)',
					data: {
						bool: false
					},
					expected: '| A  E |',
					template: '| A {{#bool}}B {{#bool}}C{{/bool}} D{{/bool}} E |',
					desc: 'Nested falsey sections should be omitted.'
				},
				{
					name: 'Context Misses',
					data: {},
					expected: '[]',
					template: `[{{#missing}}Found key 'missing'!{{/missing}}]`,
					desc: 'Failed context lookups should be considered falsey.'
				},
				{
					name: 'Implicit Iterator - String',
					data: {
						list: [
							'a',
							'b',
							'c',
							'd',
							'e'
						]
					},
					expected: `\"(a)(b)(c)(d)(e)\"`,
					template: `\"{{#list}}({{.}}){{/list}}\"`,
					desc: 'Implicit iterators should directly interpolate strings.'
				},
				{
					name: 'Implicit Iterator - Integer',
					data: {
						list: [
							1,
							2,
							3,
							4,
							5
						]
					},
					expected: `\"(1)(2)(3)(4)(5)\"`,
					template: `\"{{#list}}({{.}}){{/list}}\"`,
					desc: 'Implicit iterators should cast integers to strings and interpolate.'
				},
				{
					name: 'Implicit Iterator - Decimal',
					data: {
						list: [
							1.1,
							2.2,
							3.3,
							4.4,
							5.5
						]
					},
					expected: `"(1.1)(2.2)(3.3)(4.4)(5.5)"`,
					template: `"{{#list}}({{.}}){{/list}}"`,
					desc: 'Implicit iterators should cast decimals to strings and interpolate.'
				},
				{
					name: 'Dotted Names - Truthy',
					data: {
						a: {
							b: {
								c: true
							}
						}
					},
					expected: `\"Here\" == \"Here\"`,
					template: `\"{{#a.b.c}}Here{{/a.b.c}}\" == \"Here\"`,
					desc: 'Dotted names should be valid for Section tags.'
				},
				{
					name: 'Dotted Names - Falsey',
					data: {
						a: {
							b: {
								c: false
							}
						}
					},
					expected: `\"\" == \"\"`,
					template: `\"{{#a.b.c}}Here{{/a.b.c}}\" == \"\"`,
					desc: 'Dotted names should be valid for Section tags.'
				},
				{
					name: 'Dotted Names - Broken Chains',
					data: {
						a: {}
					},
					expected: `\"\" == \"\"`,
					template: `\"{{#a.b.c}}Here{{/a.b.c}}\" == \"\"`,
					desc: 'Dotted names that cannot be resolved should be considered falsey.'
				},
				{
					name: 'Surrounding Whitespace',
					data: {
						boolean: true
					},
					expected: ' | \t|\t | \n',
					template: ' | {{#boolean}}\t|\t{{/boolean}} | \n',
					desc: 'Sections should not alter surrounding whitespace.'
				},
				{
					name: 'Internal Whitespace',
					data: {
						boolean: true
					},
					expected: ' |  \n  | \n',
					template: ' | {{#boolean}} {{! Important Whitespace }}\n {{/boolean}} | \n',
					desc: 'Sections should not alter internal whitespace.'
				},
				{
					name: 'Indented Inline Sections',
					data: {
						boolean: true
					},
					expected: ' YES\n GOOD\n',
					template: ' {{#boolean}}YES{{/boolean}}\n {{#boolean}}GOOD{{/boolean}}\n',
					desc: 'Single-line sections should not alter surrounding whitespace.'
				},
				{
					name: 'Standalone Lines',
					data: {
						boolean: true
					},
					expected: '| This Is\n|\n| A Line\n',
					template: '| This Is\n{{#boolean}}\n|\n{{/boolean}}\n| A Line\n',
					desc: `Standalone lines should be removed from the template.`,
					oldIe: true
				},
				{
					name: 'Indented Standalone Lines',
					data: {
						boolean: true
					},
					expected: '| This Is\n|\n| A Line\n',
					template: '| This Is\n  {{#boolean}}\n|\n  {{/boolean}}\n| A Line\n',
					desc: `Indented standalone lines should be removed from the template.`,
					oldIe: true
				},
				{
					name: 'Standalone Line Endings',
					data: {
						boolean: true
					},
					expected: '|\r\n|',
					template: '|\r\n{{#boolean}}\r\n{{/boolean}}\r\n|',
					desc: `\"\\r\\n\" should be considered a newline for standalone tags.`,
					unpassable: true
				},
				{
					name: 'Standalone Without Previous Line',
					data: {
						boolean: true
					},
					expected: '#\n/',
					template: '  {{#boolean}}\n#{{/boolean}}\n/',
					desc: `Standalone tags should not require a newline to precede them.`,
					oldIe: true
				},
				{
					name: 'Standalone Without Newline',
					data: {
						boolean: true
					},
					expected: ':\n/\n',
					template: ':{{#boolean}}\n/\n  {{/boolean}}',
					desc: `Standalone tags should not require a newline to follow them.`,
					oldIe: true
				},
				{
					name: 'Padding',
					data: {
						boolean: true
					},
					expected: '|=|',
					template: '|{{# boolean }}={{/ boolean }}|',
					desc: 'Superfluous in-tag whitespace should be ignored.'
				}
			]
		}
	];

	const isOldIe = /MSIE [6-8]/.test( navigator.userAgent );

	testModules.forEach( theModule => {
		theModule.tests.forEach( theTest => {
			if ( theTest.unpassable || ( isOldIe && theTest.oldIe ) ) return;

			test( `[${theModule.name}] ${theTest.name}`, t => {
				onWarn( msg => {
					t.ok( /Could not find template/.test( msg ) ); // only warning that should appear
				});

				new Ractive({
					el: fixture,
					template: theTest.template,
					data: theTest.data,
					partials: theTest.partials,
					preserveWhitespace: true
				});

				t.htmlEqual( fixture.innerHTML, theTest.expected, theTest.desc + '\n' + theTest.template + '\n' );
			});
		});
	});
}
