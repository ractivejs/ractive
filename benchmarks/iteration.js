suite('Iteration', () => {

	const messageArray = Array.apply(null, Array(1000)).map((v, i) => ({ message: `Hello ${i}`, number: i }));
	const messageObject = Array.apply(null, Array(1000)).reduce((c, v, i) => (c[i] = { message: `Hello ${i}` }, c), {});
	const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	const boxArray = Array.apply(null, Array(1000)).map((v, i) => ({
		top: Math.floor(Math.random() * h),
		left: Math.floor(Math.random() * w),
		r: Math.floor(Math.random() * 255),
		g: Math.floor(Math.random() * 255),
		b: Math.floor(Math.random() * 255),
		message: `Hello ${i}`
	}));

	benchmark('Hash', function () {

		this.ractive = new Ractive({
			el: '#fixture',
			template: '{{#each messages }}{{message}}{{/each}}',
			data: { messages: messageObject }
		});

	}, {
		onCycle() {
			this.ractive.teardown();
		}
	});

	benchmark('Array', function () {

		this.ractive = new Ractive({
			el: '#fixture',
			template: '{{#each messages }}{{message}}{{/each}}',
			data: { messages: messageArray }
		});

	}, {
		onCycle() {
			this.ractive.teardown();
		}
	});

	benchmark('Partial', function () {

		this.ractive = new Ractive({
			el: '#fixture',
			template: '{{#each messages }}{{>message}}{{/each}}',
			data: { messages: messageArray }
		});

	}, {
		setup() {
			Ractive.partials.message = Ractive.parse('{{message}}');
		},
		onCycle() {
			this.ractive.teardown();
		},
		teardown() {
			delete Ractive.partials.message;
		}
	});

	benchmark('Implicit component mapping', function () {

		this.ractive = new Ractive({
			el: '#fixture',
			template: '{{#each messages }}<message/>{{/each}}',
			data: { messages: messageArray }
		});

	}, {
		setup() {
			Ractive.components.message = Ractive.extend({ template: '{{message}}' });
		},
		onCycle() {
			this.ractive.teardown();
		},
		teardown() {
			delete Ractive.components.message;
		}
	});

	benchmark('Explicit component mapping', function () {

		this.ractive = new Ractive({
			el: '#fixture',
			template: '{{#each messages }}<message message="{{message}}"/>{{/each}}',
			data: { messages: messageArray }
		});

	}, {
		setup() {
			Ractive.components.message = Ractive.extend({ template: '{{message}}' });
		},
		onCycle() {
			this.ractive.teardown();
		},
		teardown() {
			delete Ractive.components.message;
		}
	});

	benchmark('Styled boxes', function () {

		this.ractive = new Ractive({
			el: '#fixture',
			data: { boxes: boxArray },
			template: '{{#boxes}}<div class="box" style="background:rgb({{r}},{{g}},{{b}}); top: {{top}}px; left: {{left}}px;">{{message}}</div>{{/boxes}}'
		});

	}, {
		setup() {
			this.style = document.createElement('style');
			this.style.innerHTML = `
				.box {
					width: 100px;
					height: 100px;
					padding: 5px 0;
					color: #fff;
					font: 10px/10px Arial;
					text-align: center;
					background: red;
					position: absolute;
				}
			`;
			document.head.appendChild(this.style);
		},
		onCycle() {
			this.ractive.teardown();
		},
		teardown() {
			this.style.remove();
		}
	});
});
