const tests = [
  {
    name: 'get deeply nested keypath',
    setup: () => {
      window.ractive = new Ractive({});
    },
    beforeEach: () => {
      window.ractive.set('a', {
        b: { c: { d: { e: { f: { g: { h: 42 } } } } } }
      });
    },
    test: () => {
      const h = window.ractive.get('a.b.c.d.e.f.g.h');
    }
  },

  {
    name: 'set deeply nested keypath, with pattern observers',
    setup: () => {
      window.ractive = new Ractive({});

      window.ractive.observe('a.b.c.*.e.f.g.h', () => {
        // do nothing
      });
    },
    test: () => {
      window.ractive.set('a', {
        b: { c: { d: { e: { f: { g: { h: {} } } } } } }
      });
    }
  }
];
