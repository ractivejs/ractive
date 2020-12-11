const setup = function () {
  const items = new Array(1000);

  for (let i = 0, l = items.length; i < l; i++) {
    items[i] = 'hello';
  }
  window.items = items;
};

const tests = [
  {
    name: 'subscribe events',
    setup,
    test: () => {
      window.ractive = new Ractive({
        el: 'body',
        template: `
					<ul>
					{{#each items }}
						<li on-click='foo()'>{{this}} world</li>
					{{/each}}
					</ul>`,
        data: {
          items: window.items
        },
        foo() {}
      });

      const nodes = window.ractive.findAll('li');

      for (let i = 0, l = nodes.length; i < l; i++) {
        nodes[i].dispatchEvent(
          new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          })
        );
      }
    }
  }
];
