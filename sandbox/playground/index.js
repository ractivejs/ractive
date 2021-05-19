(function (Ractive$1) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var Ractive__default = /*#__PURE__*/_interopDefaultLegacy(Ractive$1);

  var win = typeof window !== 'undefined' ? window : null;

  function globalRegister(name, registry, constructor) {
    if (win && win.Ractive && typeof win.Ractive[registry] === 'object') {
      var script = document.currentScript;
      if (!script) {
        script = document.querySelectorAll('script');
        script = script[script.length - 1];
      }

      if (script) {
        var aliases = script.getAttribute('data-alias');
        if (aliases) {
          aliases = aliases.split('&');
          aliases = aliases.reduce(function (a, c) {
            var ref = c.split('=');
            var k = ref[0];
            var v = ref[1];
            a[k] = v;
            return a;
          }, {});
        }

        Ractive[registry][(aliases && aliases[name]) || name] = constructor;
      }
    }
  }

  var AppBar = /*@__PURE__*/(function (Ractive) {
    function AppBar(opts) { Ractive.call(this, opts); }

    if ( Ractive ) { AppBar.__proto__ = Ractive; }
    AppBar.prototype = Object.create( Ractive && Ractive.prototype );
    AppBar.prototype.constructor = AppBar;

    var prototypeAccessors = { waiting: { configurable: true } };

    prototypeAccessors.waiting.get = function () { return this.get('waiting'); };
    prototypeAccessors.waiting.set = function (show) { this.add('waiting', show ? 1 : -1); };
    AppBar.prototype.wait = function wait (show) { this.waiting = show; };

    Object.defineProperties( AppBar.prototype, prototypeAccessors );

    return AppBar;
  }(Ractive__default['default']));

  Ractive__default['default'].extendWith(AppBar, {
    template: {v:4,t:[{t:7,e:"div",m:[{t:13,n:"class",f:"rappbar",g:1},{t:16,r:"extra-attributes"}],f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rappbar-left",g:1},{t:4,f:[{t:16,r:"._leftAttrs"}],n:50,r:"._leftAttrs"}],f:[{t:4,f:[{t:16,r:"._leftP"}],n:50,r:"._leftP"}]}," ",{t:7,e:"div",m:[{t:13,n:"class",f:"rappbar-center",g:1},{t:4,f:[{t:16,r:"._centerAttrs"}],n:50,r:"._centerAttrs"}],f:[{t:4,f:[{t:16,r:"._centerP"}],n:50,r:"._centerP"}]}," ",{t:7,e:"div",m:[{t:13,n:"class",f:"rappbar-right",g:1},{t:4,f:[{t:16,r:"._rightAttrs"}],n:50,r:"._rightAttrs"}],f:[{t:4,f:[{t:16,r:"._rightP"}],n:50,r:"._rightP"}]}," ",{t:7,e:"div",m:[{t:13,n:"class",f:"rappbar-wait",g:1},{n:"class-waiting",t:13,f:[{t:2,r:"waiting"}]}]}]}]},
    css: function(data) { return [(function(data) {
     var primary = Object.assign({}, data('raui.primary'), data('raui.appbar.primary'));
     return "\n   .rappbar {\n     display: flex;\n     padding: 0.7em;\n     background-color: " + (primary.fga || '#07e') + ";\n     color: " + (primary.bg || '#fff') + ";\n     position: relative;\n     justify-content: space-between;\n     align-items: center;\n   }\n \n   .rappbar.alt {\n     background-color: " + (primary.fg || '#222') + ";\n   }\n \n   .rappbar-left {\n     display: flex;\n     justify-content: flex-start;\n     align-items: center;\n   }\n \n   .rappbar-right {\n     display: flex;\n     justify-content: flex-end;\n   }\n \n   .rappbar-center {\n     flex-shrink: 1;\n   }\n \n   .rappbar-wait {\n     position: absolute;\n     bottom: 0;\n     left: 0;\n     width: 100%;\n     height: 0.75em;\n     opacity: 0;\n     transition: opacity 0.3s ease-in-out;\n     background: linear-gradient(to left, " + (data('raui.appbar.wait.color1') || 'rgba(255, 255, 255, 0.7)') + ", " + (data('raui.appbar.wait.color2') || 'rgba(0, 0, 0, 0.1)') + ", " + (data('raui.appbar.wait.color1') || 'rgba(255, 255, 255, 0.7)') + ");\n     background-size: 600% 600%;\n     animation: rappbar-roll 10s linear infinite;\n     animation-play-state: paused;\n   }\n \n   .rappbar-wait.waiting {\n     opacity: 1;\n     animation-play-state: running;\n   }\n \n   @keyframes rappbar-roll {\n     0% { background-position: 0% 50%; }\n     50% { background-position: 100% 50%; }\n     100% { background-position: 0% 50%; }\n   }\n   " + (data('raui.themes') || []).map(function (t) {
       var theme = Object.assign({}, primary, data(("raui." + t)), data(("raui.appbar." + t)));
       return (".rappbar." + t + " {\n       background-color: " + (theme.fga || '#07e') + ";\n       color: " + (theme.bg || primary.bg || '#fff') + ";\n     }\n     .rappbar." + t + ".alt {\n       background-color: " + (theme.fg || '#222') + "\n     }\n     ");
     });
  }).call(this, data)].join(' '); },
    cssId: 'appbar',
    attributes: ['waiting'],
    noCssTransform: true,
    data: function data() { return { waiting: 0 }; },
    on: {
      config: function config() {
        var this$1 = this;

        var tpl = this.partials.content;
        if (tpl) {
          tpl.filter(function (e) { return e.e === 'left' || e.e === 'right' || e.e === 'center'; }).forEach(function (e) {
            this$1.set(("_" + (e.e) + "P"), e.f);
            if (e.m) { this$1.set(("_" + (e.e) + "Attrs"), e.m); }
          });
        }
      }
    }
  });

  globalRegister('RMAppBar', 'components', AppBar);

  function plugin$7(opts) {
    if ( opts === void 0 ) { opts = {}; }

    return function(ref) {
      var instance = ref.instance;

      instance.components[opts.name || 'app-bar'] = AppBar;
    }
  }

  function expand(t, params) {
    var p = t.processParams(params, { duration: 200, easing: 'easeInOut' });
    return new Promise(function (ok) {
      // defer execution to allow for grid stuff
      requestAnimationFrame(function () {
        t.setStyle('overflow', 'hidden');
        var axis = p.axis === 'x' ? 'width' : 'height';
        if (t.isIntro || p.intro) {
          var val = t.getStyle(axis);
          t.setStyle(axis, 0);
          t.setStyle('opacity', 0);
          ok(t.animateStyle(axis, val, p)
            .then(function () { return t.animateStyle('opacity', 1, p); })
            .then(function () {
              t.setStyle(axis, '');
              t.setStyle('overflow', '');
            }));
        } else {
          t.setStyle(axis, t.getStyle(axis));
          t.setStyle('opacity', 1);
          ok(t.animateStyle('opacity', 0, p)
            .then(function () { return t.animateStyle(axis, 0, p); }));
        }
      });
    });
  }

  function plugin$6(opts) {
    if ( opts === void 0 ) { opts = {}; }

    return function(ref) {
      var instance = ref.instance;

      instance.transitions[opts.name || 'expand'] = expand;
    }
  }

  globalRegister('expand', 'transitions', expand);

  function clickout(node, fire) {
    var registered = false, torndown = false;
    function handler(ev) {
      var n = ev.target;
      while (n) {
        if (n === node) { return; }
        if (!n.parentNode && n !== document) { return; }
        n = n.parentNode;
      }
      fire(ev);
    }


    setTimeout(function () {
      registered = true;
      if (!torndown) {
        document.body.addEventListener('click', handler, { capture: true });
        document.body.addEventListener('touchstop', handler, { capture: true });
      }
    });
    

    return {
      teardown: function teardown() {
        torndown = true;
        if (registered) {
          document.body.removeEventListener('click', handler, { capture: true });
          document.body.removeEventListener('touchstop', handler, { capture: true });
        }
      }
    }
  }

  function plugin$5(opts) {
    if ( opts === void 0 ) { opts = {}; }

    return function(ref) {
      var instance = ref.instance;

      instance.events[opts.name || 'clickout'] = clickout;
    }
  }

  function findRef(items, ref) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].ref === ref) { return [items[i]]; }
      else if (items[i].items) {
        var res = findRef(items[i].items, ref);
        if (res) {
          res.unshift(items[i]);
          return res;
        }
      }
    }
  }

  var Menu = /*@__PURE__*/(function (Ractive) {
    function Menu(opts) {
      Ractive.call(this, opts);
      this.refs = {};
    }

    if ( Ractive ) { Menu.__proto__ = Ractive; }
    Menu.prototype = Object.create( Ractive && Ractive.prototype );
    Menu.prototype.constructor = Menu;

    Menu.prototype.addItem = function addItem (item, idx) {
      if (typeof idx === 'number') {
        this.splice('items', idx, 0, item);
      } else {
        this.push('items', item);
      }

      return new Handle$1(this, null, item);
    };

    Menu.prototype.visibleItems = function visibleItems (items) {
      var this$1 = this;

      return items.filter(function (i) { return i.condition !== false && (typeof i.condition !== 'string' || this$1.get(i.condition) !== false); }).length;
    };

    Menu.prototype.getHandle = function getHandle (what) {
      var this$1 = this;

      var ctx;
      if (typeof what === 'string') {
        if (this.refs[what]) {
          ctx = this.refs[what].ctx;
        } else {
          var el = this.find(what);
          if (el) { ctx = this.getContext(el); }
          else {
            var path = findRef(this.get('items'), what);
            if (path) {
              return path.reduce(function (a, c) {
                return new Handle$1(this$1, a, c);
              }, null);
            }
          }
        }
      } else if (what && what.parentNode) {
        ctx = this.getContext(what);
      } else if (what && what.decorators) {
        ctx = what;
      }

      if (ctx) {
        var path$1 = [ctx.get()];
        var str = '../../';
        while (ctx.resolve(str) !== '') {
          path$1.unshift(ctx.get(str));
          str += '../../';
        }

        return path$1.reduce(function (a, c) {
          return new Handle$1(this$1, a, c);
        }, null);
      }
    };

    Menu.prototype.popAllIn = function popAllIn (path) {
      if (!path) { path = ''; }
      var item = this.get(path);
      if (item && item.items) {
        for (var i = 0; i < item.items.length; i++) {
          this.popAllIn(((path ? (path + ".") : '') + "items." + i));
        }
      }
      if (item.open && item.popout) { this.set(((path ? (path + ".") : '') + "open"), false); }
    };

    Menu.prototype.popSiblingsIn = function popSiblingsIn (ctx) {
      var me = ctx.resolve();
      var items = ctx.get('../');
      if (items) {
        for (var i = 0; i < items.length; i++) {
          if (me === ctx.resolve(("../" + i))) { continue; }
          if (items[i].open && items[i].popout) {
            ctx.toggle(("../" + i + ".open"));
          }
        }
      }
    };

    Menu.prototype._actioned = function _actioned () {
      this.fire('action');
      this.popAllIn();
    };

    Menu.prototype._itemRendered = function _itemRendered (ctx) {
      var this$1 = this;

      setTimeout(function () { return this$1.fire('item', ctx, this$1.getHandle(ctx)); });
      return '';
    };

    // TODO: handle active fn with context param
    Menu.prototype.childActive = function childActive (path) {
      var item = this.get(path);
      if (item && item.items) {
        for (var i = 0; i < item.items.length; i++) {
          if (this.get((path + ".items." + i + ".active")) === true || (typeof item.items[i].active === 'function' && item.items[i].active()) || (this.get((path + ".items." + i + ".activeRef")) && this.get(item.items[i].activeRef)) || this.childActive((path + ".items." + i))) { return true; }
        }
      }
    };

    return Menu;
  }(Ractive__default['default']));

  // TODO: api handles, active elements, and ids
  Ractive__default['default'].extendWith(Menu, {
    template: {v:4,t:[{t:7,e:"div",m:[{t:13,n:"class",f:"rmenu-wrapper",g:1},{t:16,r:"extra-attributes"},{n:"class-rmenu-vertical",t:13,f:[{t:2,x:{r:["~/horizontal"],s:"!_0"}}]},{n:"class-rmenu-horizontal",t:13,f:[{t:2,r:"~/horizontal"}]}],f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rmenu",g:1}],f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rmenu-inner",g:1}],f:[{t:8,r:"items"}]}]}]}],e:{"!_0":function (_0){return(!_0);},"_0||_1":function (_0,_1){return(_0||_1);},"_0&&(_1||_2===\"section\")":function (_0,_1,_2){return(_0&&(_1||_2==="section"));},"_0?_3.active(_1.getHandle((_2))):_3.active()":function (_0,_1,_2,_3){return(_0?_3.active(_1.getHandle((_2))):_3.active());},"typeof _0===\"function\"":function (_0){return(typeof _0==="function");},"typeof _0===\"boolean\"":function (_0){return(typeof _0==="boolean");},"_0.childActive(_1)":function (_0,_1){return(_0.childActive(_1));},"_0!=null":function (_0){return(_0!=null);},"[_0.action(),_1._actioned()]":function (_0,_1){return([_0.action(),_1._actioned()]);},"[_0._actioned()]":function (_0){return([_0._actioned()]);},"[_0&&_1.popSiblingsIn((_2)),(_2).toggle(\".open\"),false]":function (_0,_1,_2){return([_0&&_1.popSiblingsIn((_2)),(_2).toggle(".open"),false]);},"_0||(_1&&_2[_1])":function (_0,_1,_2){return(_0||(_1&&_2[_1]));},"[{axis:\"x\"}]":function (){return([{axis:"x"}]);},"_2&&_0&&_1.visibleItems(_2)":function (_0,_1,_2){return(_2&&_0&&_1.visibleItems(_2));},"[_0.popAllIn(_1),false]":function (_0,_1){return([_0.popAllIn(_1),false]);},"!_0||_0===\"item\"":function (_0){return(!_0||_0==="item");},"_0===\"section\"":function (_0){return(_0==="section");},"_0===\"container\"":function (_0){return(_0==="container");},"(!_0||_0===\"item\")&&_1":function (_0,_1){return((!_0||_0==="item")&&_1);},"[_0.popAllIn(_1)]":function (_0,_1){return([_0.popAllIn(_1)]);},"[_0]":function (_0){return([_0]);},"typeof _0===\"string\"":function (_0){return(typeof _0==="string");},"_0||\"item\"":function (_0){return(_0||"item");},"_0._itemRendered((_1))":function (_0,_1){return(_0._itemRendered((_1)));},"_1===undefined||(typeof _1===\"boolean\"&&_1)||(typeof _1===\"string\"&&_0[_1])||(typeof _1===\"function\"&&_2.condition())":function (_0,_1,_2){return(_1===undefined||(typeof _1==="boolean"&&_1)||(typeof _1==="string"&&_0[_1])||(typeof _1==="function"&&_2.condition()));}},p:{container:[{t:4,f:[{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rmenu-container-pad",g:1}],f:[{t:3,r:".content"}]}],n:50,r:".pad"},{t:4,f:[{t:3,r:".content"}],n:51,l:1}],n:50,r:".content"},{t:4,f:[{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rmenu-container-pad",g:1}],f:[{t:16,r:".contentPartial"}]}],n:50,r:".pad"},{t:4,f:[{t:16,r:".contentPartial"}],n:51,l:1}],n:50,r:".contentPartial",l:1}],section:[{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rmenu-main",g:1}],f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rmenu-title",g:1}],f:[{t:4,f:[{t:2,r:".title"}],n:50,r:".title"},{t:4,f:[{t:16,r:".titlePartial"}],n:50,r:".titlePartial",l:1}]}]}],n:50,x:{r:[".title",".titlePartial"],s:"_0||_1"}}," ",{t:8,r:"children"}],children:[{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rmenu-items",g:1},{t:4,f:[{n:"expand",t:72,v:"t0"}],n:50,x:{r:[".popout"],s:"!_0"}},{t:4,f:[{n:"pop",t:72,v:"t0"}],n:51,l:1},{n:"class-rmenu-shrink",t:13,f:[{t:2,r:".shrink"}]}],f:[{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rmenu-popitems",g:1}],f:[{t:8,r:"items"}]}],n:50,r:".popout"},{t:4,f:[{t:8,r:"items"}],n:51,l:1}]}],n:50,x:{r:[".items.length",".open",".type"],s:"_0&&(_1||_2===\"section\")"}}],item:[{t:7,e:"div",m:[{t:13,n:"class",f:"rmenu-main",g:1},{t:4,f:[{n:"class-rmenu-active",t:13,f:[{t:2,rx:{r:"~/",m:[{t:30,n:".activeRef"}]}}]}],n:50,r:".activeRef"},{t:4,f:[{n:"class-rmenu-active",t:13,f:[{t:2,x:{r:[".active.length","@this","@context","."],s:"_0?_3.active(_1.getHandle((_2))):_3.active()"}}]}],n:50,x:{r:[".active"],s:"typeof _0===\"function\""},l:1},{t:4,f:[{n:"class-rmenu-active",t:13,f:[{t:2,r:".active"}]}],n:50,x:{r:[".active"],s:"typeof _0===\"boolean\""},l:1},{t:4,f:[{n:"class-rmenu-active",t:13,f:[{t:2,x:{r:["@this","@keypath"],s:"_0.childActive(_1)"}}]}],n:50,r:".popout",l:1},{t:4,f:[{n:"class-rmenu-disabled",t:13,f:[{t:2,r:".disabled"}]}],n:50,x:{r:[".disabled"],s:"_0!=null"}},{t:4,f:[{n:"class-rmenu-disabled",t:13,f:[{t:2,rx:{r:"~/",m:[{t:30,n:".disabledRef"}]}}]}],n:50,r:".disabledRef",l:1}],f:[{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"menu-left",g:1}],f:[{t:3,r:".left"}]}],n:50,r:".left"},{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rmenu-left",g:1}],f:[{t:16,r:".leftPartial"}]}],n:50,r:".leftPartial",l:1}," ",{t:7,e:"div",m:[{t:13,n:"class",f:"rmenu-title",g:1},{t:4,f:[{t:4,f:[{n:["click"],t:70,f:{r:[".","@this"],s:"[_0.action(),_1._actioned()]"}}],n:50,x:{r:[".action"],s:"typeof _0===\"function\""}},{t:4,f:[{t:16,r:".actionPartial"},{n:["click"],t:70,f:{r:["@this"],s:"[_0._actioned()]"}}],n:50,r:".actionPartial",l:1},{t:4,f:[{n:["click"],t:70,f:{r:[".popout","@this","@context"],s:"[_0&&_1.popSiblingsIn((_2)),(_2).toggle(\".open\"),false]"}}],n:50,r:".items.length",l:1}],n:51,x:{r:[".disabled",".disabledRef","~/"],s:"_0||(_1&&_2[_1])"}}],f:[{t:4,f:[{t:3,r:".title"}],n:50,r:".title"},{t:4,f:[{t:16,r:".titlePartial"}],n:50,r:".titlePartial",l:1}]}," ",{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"menu-right",g:1}],f:[{t:3,r:".right"}]}],n:50,r:".right"},{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rmenu-right",g:1}],f:[{t:16,r:".rightPartial"}]}],n:50,r:".rightPartial",l:1}," ",{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rmenu-expand",g:1},{n:["click"],t:70,f:{r:[".popout","@this","@context"],s:"[_0&&_1.popSiblingsIn((_2)),(_2).toggle(\".open\"),false]"}},{n:"expand",t:72,f:{r:[],s:"[{axis:\"x\"}]"},v:"t0"}]}],n:50,x:{r:[".items.length","@this",".items"],s:"_2&&_0&&_1.visibleItems(_2)"}}]}," ",{t:8,r:"children"}],items:[{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rmenu-popout-close",g:1},{n:["click"],t:70,f:{r:["@this","@keypath"],s:"[_0.popAllIn(_1),false]"}}],f:["❌ Close"]}],n:50,r:".shrink"}," ",{t:4,f:[{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rmenu-entry",g:1},{t:4,f:[{n:"class-rmenu-item",t:13}],n:50,x:{r:[".type"],s:"!_0||_0===\"item\""}},{t:4,f:[{n:"class-rmenu-section",t:13}],n:50,x:{r:[".type"],s:"_0===\"section\""},l:1},{t:4,f:[{n:"class-rmenu-container",t:13}],n:50,x:{r:[".type"],s:"_0===\"container\""},l:1},{n:"class-rmenu-expanded",t:13,f:[{t:2,r:".open"}]},{n:"class-rmenu-popout",t:13,f:[{t:2,x:{r:[".type",".popout"],s:"(!_0||_0===\"item\")&&_1"}}]},{t:4,f:[{n:"pop",t:72,v:"t0"},{t:4,f:[{n:["clickout"],t:70,f:{r:["@this","@keypath"],s:"[_0.popAllIn(_1)]"}}],n:50,r:".open"}," "],n:50,r:".popout"},{t:4,f:[{n:"expand",t:72,v:"t0"}],n:50,x:{r:["~/noExpand"],s:"!_0"},l:1},{t:4,f:[{t:8,r:".refPartial"}],n:50,r:".refPartial"},{t:4,f:[{n:"ref",t:71,f:{r:[".ref"],s:"[_0]"}}],n:50,x:{r:[".ref"],s:"typeof _0===\"string\""},l:1},{t:4,f:[{t:16,r:".extra"}],n:50,r:".extra"}],f:[{t:8,x:{r:[".type"],s:"_0||\"item\""}}," ",{t:4,f:[{t:2,x:{r:["@this","@context"],s:"_0._itemRendered((_1))"}}],n:50,x:{r:[".type"],s:"!_0||_0===\"item\""}}]}],n:50,x:{r:["~/",".condition","."],s:"_1===undefined||(typeof _1===\"boolean\"&&_1)||(typeof _1===\"string\"&&_0[_1])||(typeof _1===\"function\"&&_2.condition())"}}],n:52,r:".items"}]}},
    css: function(data) { return [(function(data) {
     var primary = Object.assign({}, data('raui.primary'), data('raui.menu.primary'));
     primary.popout = Object.assign({}, data('raui.menu.popout'), data('raui.menu.primary.popout'));
     var base = "\n   .rmenu-wrapper {\n     position: relative;\n     z-index: 1;\n   }\n   .rmenu-wrapper.rmenu-vertical {\n     min-height: 100%;\n   }\n   .rmenu {\n     " + (data('raui.menu.font') ? ("font-family: " + (data('raui.menu.font')) + ";") : '') + "\n     color: " + (primary.bg || '#fff') + ";\n     background-color: " + (primary.fg || '#222') + ";\n     position: absolute;\n     top: 0;\n     bottom: 0;\n     left: 0;\n     right: 0;\n   }\n   .rmenu-wrapper.alt > .rmenu {\n     color: " + (primary.fga || '#222') + ";\n     background-color: " + (primary.bg || '#fff') + ";\n   }\n   .rmenu-inner {\n     width: 100%;\n     height: 100%;\n     overflow-y: auto;\n   }\n   .rmenu-item {\n     border-top: 1px solid transparent;\n     border-bottom: 1px solid transparent;\n     transition: border 0.2s ease-in-out;\n   }\n   .rmenu-item:hover > .rmenu-main {\n     background-color: " + (primary.fga || '#07e') + ";\n     color: " + (primary.bg || '#fff') + ";\n   }\n   .rmenu-disabled {\n     opacity: 0.5;\n     cursor: not-allowed;\n   }\n   .rmenu-popout {\n     border: none;\n   }\n   .rmenu-expanded {\n     border-top: 0.0625em solid " + (primary.bc || '#ccc') + ";\n     border-bottom: 0.0625em solid " + (primary.bc || '#ccc') + ";\n   }\n   .rmenu-popout.rmenu-expanded {\n     border: none;\n   }\n   .rmenu-popout .rmenu-popout.rmenu-expanded {\n     background-color: " + (primary.popout.bga || primary.bg || '#fff') + ";\n     color: " + (primary.popout.fg || primary.fg || '#222') + ";\n   }\n   .rmenu-popitems {\n     height: 100%;\n     overflow-y: auto;\n   }\n   .rmenu-main {\n     width: 100%;\n     height: 100%;\n     box-sizing: border-box;\n     user-select: none;\n     transition: 0.3s ease-in-out;\n     transition-property: color, background-color;\n     display: flex;\n     align-items: center;\n     min-height: 1em;\n   }\n   .rmenu-main.rmenu-active, .rmenu-item:hover > .rmenu-main.rmenu-active {\n     color: " + (primary.fga || '#07e') + ";\n     background-color: " + (primary.bg || '#fff') + ";\n   }\n   .rmenu-popout .rmenu-entry .rmenu-main.rmenu-active, .rmenu-popout .rmenu-item:hover > .rmenu-main.rmenu-active {\n     color: " + (primary.popout.bg || primary.bg || '#fff') + ";\n     background-color: " + (primary.popout.fga || primary.fga || '#07e') + ";\n   }\n   .rmenu-wrapper.alt .rmenu-main.rmenu.active {\n     color: " + (primary.bg || '#fff') + ";\n     background-color: " + (primary.fg || '#222') + ";\n   }\n   .rmenu-popout .rmenu-items .rmenu-item:hover > .rmenu-main {\n     background-color: " + (primary.popout.bga || '#f4f4f4') + ";\n     color: " + (primary.popout.fg || '#222') + ";\n   }\n \n   .rmenu-items {\n     display: block;\n   }\n   .rmenu-right {\n     padding-right: 0.4em;  \n   }\n   .rmenu-left {\n     padding-left: 0.4em;\n   }\n   .rmenu-expand {\n     width: 1.5em;\n     height: 1.5em;\n     padding-left: 0.5em;\n     cursor: pointer;\n     position: relative;\n   }\n   .rmenu-expand:before {\n     position: absolute;\n     display: inline-block;\n     top: 0.35em;\n     content: ' ';\n     transform: rotate(45deg);\n     transition: transform 0.2s ease-in-out, top 0.2s ease-in-out, left 0.2s ease-in-out;\n     box-sizing: border-box;\n     border-width: 0.25em;\n     border-style: solid;\n     border-left-color: transparent;\n     border-top-color: transparent;\n   }\n   .rmenu-expanded > .rmenu-main > .rmenu-expand:before {\n     transform: rotate(-135deg);\n     top: 0.65em;\n   }\n \n   .rmenu-popout > .rmenu-items {\n     position: absolute;\n     left: 0;\n     top: 0;\n     width: 100%;\n     height: 100%;\n     background-color: " + (primary.popout.bg || primary.bg || '#fff') + ";\n     color: " + (primary.popout.fg || primary.fg || '#222') + ";\n     box-sizing: border-box;\n     border-right: 1px solid " + (primary.popout.bc || primary.bc || '#ccc') + ";\n     z-index: -1;\n     transition: box-shadow 0.2s ease-in-out;\n   }\n   .rmenu-popout.rmenu-expanded > .rmenu-items {\n     left: 100%;\n     z-index: initial;\n     box-shadow: 0.2em 0 0.2em rgba(0, 0, 0, 0.2);\n   }\n   .rmenu-popout.rmenu-expanded > .rmenu-items .rmenu-popout.rmenu-expanded > .rmenu-items {\n     left: calc(100% + 1px);\n   }\n \n   .rmenu-popout > .rmenu-items.rmenu-shrink {\n     left: 100%;\n     z-index: 1;\n   }\n   .rmenu-popout.rmenu-expanded > .rmenu-items.rmenu-shrink,\n   .rmenu-popout.rmenu-expanded > .rmenu-items .rmenu-popout.rmenu-expanded > .rmenu-items.rmenu-shrink {\n     left: 0;\n   }\n \n   .rmenu-popout > .rmenu-main > .rmenu-expand:before {\n     transform: rotate(-45deg);\n     top: 0.4em;\n   }\n \n   .rmenu-popout.rmenu-expanded > .rmenu-main > .rmenu-expand:before {\n     transform: rotate(135deg);\n     left: 0.75em;\n   }\n \n   .rmenu-popout > .rmenu-items .rmenu-popout > .rmenu-items {\n     height: 100%;\n     width: calc(100% + 1px);\n     top: 0px;\n   }\n   .rmenu-popout > .rmenu-items .rmenu-popout > .rmenu-items.rmenu-shrink {\n     height: 100%;\n   }\n \n   .rmenu-popout-close {\n     color:  " + (primary.popout.fga || primary.fga || '#07e') + ";\n     display: block;\n     padding: 0.5em;\n     cursor: pointer;\n   }\n \n   .rmenu-title {\n     white-space: nowrap;\n     overflow: hidden;\n     text-overflow: ellipsis;\n     cursor: pointer;\n     padding: 0.5em;\n     flex-grow: 1;\n   }\n   .rmenu-disabled > .rmenu-title {\n     cursor: not-allowed;\n   }\n   .rmenu-item h1, .rmenu-item h2, .rmenu-item h3, .rmenu-item h4 {\n     margin: 0;\n   }\n \n   .rmenu-section {\n     padding: 0 0 0.75em 0;\n   }\n   .rmenu-section > .rmenu-main {\n     cursor: default;\n     font-size: 0.75em;\n     opacity: 0.7;\n     margin-bottom: 0.25em;\n   }\n   .rmenu-section > .rmenu-main .rmenu-title {\n     cursor: default;\n   }\n   .rmenu-popout .rmenu-section:first-child > .rmenu-main {\n     padding-top: 0;\n   }\n   .rmenu-popout .rmenu-section > .rmenu-main > .rmenu-title {\n     font-size: 1.5em;\n     text-align: center;\n     padding: 0.75em;\n     opacity: 1;\n     font-weight: bold;\n     color: " + (primary.popout.fg || primary.fg || '#222') + ";\n     background-color: " + (primary.popout.bga || primary.bga || '#f4f4f4') + ";\n     border-bottom: 1px solid " + (primary.popout.bc || primary.bc || '#ccc') + ";\n     border-top: 1px solid " + (primary.popout.bc || primary.bc || '#ccc') + ";\n   }\n \n   .rmenu-container {\n     box-sizing: border-box;\n   }\n \n   .rmenu-container-pad {\n     padding: 0.3em 0.3em 0.8em 0.3em;\n   }\n   ";
     // TODO: other themes
     return base;
  }).call(this, data)].join(' '); },
    cssId: 'menu',
    noCssTransform: true,
    noIntro: true,
    nestedTransitions: false,
    on: {
      construct: construct$2,
      config: function config() {
        if ( this._items ) { this.set('items', (this.get('items') || []).concat(this._items), { shuffle: true }); }
      }
    },
    attributes: ['noExpand'],
    use: [plugin$6(), plugin$5()],
    decorators: {
      ref: function ref(node, name) {
        var r = this;
        var nm = name;
        if (!r.refs) { r.refs = {}; }

        var handle = {
          update: function update(name) {
            if (r.refs[nm] === handle) { delete r.refs[nm]; }
            nm = name;
            r.refs[nm] = handle;
          },
          teardown: function teardown() {
            if (r.refs[nm] === handle) { delete r.refs[nm]; }
          }
        };

        handle.ctx = r.getContext(node);

        r.refs[nm] = handle;

        return handle;
      }
    },
    transitions: {
      pop: function pop(t, params) {
        var p = t.processParams(params, { duration: 200, easing: 'easeInOut' });
        var ctx = this.getContext(t.node);
        var shrink = ctx.get('.shrink');

        if (t.isIntro) {
          var rect = t.node.getBoundingClientRect();
          function findParent() {
            var n = t.node.parentNode;
            while (n && n.classList) {
              if (n.classList.contains('rmenu')) { return n; }
              else if (n.parentNode.classList.contains('rmenu-popout')) { return n; }
              n = n.parentNode;
            }
          }
          if (rect.left + rect.width > window.innerWidth) {
            setTimeout(function () { return ctx.set('.shrink', true); });
            shrink = true;
            findParent().style.overflowX = 'hidden';
          } else if (shrink) {
            setTimeout(function () { return ctx.set('.shrink', false); });
            findParent().style.overflowX = '';
            shrink = false;
          } else {
            findParent().style.overflowX = '';
          }
        } else {
          setTimeout(function () { return ctx.set('shrink', false); });
        }

        if (t.isIntro) {
          if (shrink) {
            t.setStyle('left', '100%');
            return t.animateStyle('left', 0, p);
          } else {
            t.setStyle('left', 0);
            t.setStyle('z-index', -1);
            return t.animateStyle('left', '100%', p);
          }
        } else {
          if (shrink) {
            t.setStyle('left', 0);
            return t.animateStyle('left', '100%', p);
          } else {
            t.setStyle('left', '100%');
            t.setStyle('z-index', -1);
            return t.animateStyle('left', 0, p);
          }
        }
      }
    }
  });

  var justSpace = /^\s*$/;
  function construct$2() {
    var cmp = this.component;
    if ( !cmp ) { return; }

    var tpl = cmp.template.f || [];
    var attrs = cmp.template.m ? cmp.template.m.slice() : [];
    var t = cmp.template;
    cmp.template = { e: t.e, f: t.f, t: t.t, m: attrs };

    function item(el) {
      if (el.e !== 'item' && el.e !== 'section' && el.e !== 'container') { return; }

      var res = {};
      var as = [];
      var title;

      if (el.e !== 'item') { res.type = el.e; }

      el.m && el.m.forEach(function (a) {
        if (a.n === 'title') {
          if (typeof a.f === 'string') { res.title = a.f; }
          else { res.titlePartial = { t: a.f }; }
        } else if (a.t === 70 && a.n[0] === 'action') { // events
          res.actionPartial = { t: [{ n: ['click'], f: a.f, t: a.t }] };
        } else if (a.n === 'guard' && a.f && a.f.length === 1 && a.f[0].t === 2) {
          var cnd = "_cnd" + (attrs.length);
          res.condition = cnd;
          attrs.push({ t: 13, n: cnd, f: a.f });
        } else if (a.n === 'ref') {
          if (typeof a.f === 'string') {
            res.ref = a.f;
          } else if (a.f && a.f.length === 1 && a.f[0].t === 2) {
            var cnd$1 = "_cnd" + (attrs.length);
            attrs.push({ t: 13, n: cnd$1, f: a.f });
            res.refPartials = { t:[{ t: 71, n: 'ref', f: { r: cnd$1, s: '[_0]' } }] };
          }
        } else if (a.n === 'active') {
          if (a.f && a.f.length === 1 && a.f[0].t === 2) {
            var cnd$2 = "_cnd" + (attrs.length);
            res.activeRef = cnd$2;
            attrs.push({ t: 13, n: cnd$2, f: a.f });
          }
        } else if (a.n === 'open') {
          res.open = true;
        } else if (a.n === 'popout') {
          res.popout = true;
        } else if (el.e === 'container' && a.n === 'pad') {
          res.pad = true;
        } else if (a.n === 'disabled') {
          if (a.f && a.f.length === 1 && a.f[0].t === 2) {
            var cnd$3 = "_cnd" + (attrs.length);
            res.disabledRef = cnd$3;
            attrs.push({ t: 13, n: cnd$3, f: a.f });
          } else if (a.f === 0) {
            res.disabled = true;
          }
        } else {
          as.push(a);
        }
      });

      if (as.length) { res.extra = { t: as }; }

      if (el.e === 'container') {
        res.contentPartial = { t: el.f };
        res.extra = as;
        return res;
      }

      el.f && el.f.forEach(function (e) {
        if (e.e === 'title') {
          if (e.f.length === 1 && typeof e.f[0] === 'string') { res.title = e.f[0]; }
          else { res.titlePartial = { t: e.f }; }
        }
        else if (e.e === 'item' || e.e === 'section' || e.e === 'container') {
          var i = item(e);
          if (i) { (res.items || (res.items = [])).push(i); }
        }
        else if (e.e === 'left') {
          res.leftPartial = { t: e.f };
        }
        else if (e.e === 'right') {
          res.rightPartial = { t: e.f };
        }
        else if (typeof e !== 'string' || !justSpace.test(e)) {
          if (!title) { title = []; }
          title.push(e);
        }
      });

      if (!res.titlePartial && title) { res.titlePartial = { t: title }; }
      title = null;

      return res;
    }

    var list = [];
    tpl.forEach(function (e) {
      var i = item(e);
      if (i) { list.push(i); }
    });

    this._items = list;
  }

  var Handle$1 = function Handle(menu, parent, item) {
    this.menu = menu;
    this.parent = parent;
    this.item = item;
  };

  var prototypeAccessors = { keypath: { configurable: true },action: { configurable: true },active: { configurable: true },disabled: { configurable: true },items: { configurable: true },ref: { configurable: true } };

  prototypeAccessors.keypath.get = function () {
    if (this.removed) { return; }
    if (!this.parent) { return ("items." + (this.menu.get('items').indexOf(this.item))); }
    var path = this.parent.keypath + '.items';
    var parent = this.menu.get(path);
    return (path + "." + (parent.indexOf(this.item)));
  };

  prototypeAccessors.action.get = function () {
    if (this.removed) { return; }
    return this.item.action;
  };

  prototypeAccessors.action.set = function (v) {
    return this.set('.action', v);
  };

  prototypeAccessors.active.get = function () {
    if (this.removed) { return; }
    var item = this.item;
    if (item.activeRef) { return this.menu.get(item.activeRef); }
    else if (typeof item.active === 'function') { return item.active(); }
    else { return item.active; }
  };

  prototypeAccessors.active.set = function (v) {
    if (this.removed) { return; }
    var item = this.item;
    if (item.activeRef) { return this.menu.set(item.activeRef, v); }
    else { return this.set(".active", v); }
  };

  prototypeAccessors.disabled.get = function () {
    if (this.removed) { return; }
    return this.get('.disabled');
  };

  prototypeAccessors.disabled.set = function (v) {
    if (this.removed) { return; }
    return this.set('.disabled', v);
  };

  prototypeAccessors.items.get = function () {
      var this$1 = this;

    if (this.item.items) {
      return this.item.items.map(function (item) { return new Handle$1(this$1.menu, this$1, item); });
    } else {
      return [];
    }
  };

  prototypeAccessors.ref.get = function () {
    if (this.removed) { return; }
    return this.item.ref;
  };

   prototypeAccessors.ref.set = function (v) {
     return this.set('.ref', v);
   };

  Handle$1.prototype.addItem = function addItem (item, idx) {
    if (this.removed) { return false; }
    var items = (this.keypath) + ".items";
    if (typeof idx === 'number') {
      this.menu.splice(items, idx, 0, item);
    } else {
      this.menu.push(items, item);
    }
    return new Handle$1(this.menu, this, item);
  };

  Handle$1.prototype.open = function open () {
    if (this.removed) { return false; }
    this.menu.set(((this.keypath) + ".open"), true);
  };

  Handle$1.prototype.close = function close () {
    if (this.removed) { return false; }
    this.menu.set(((this.keypath) + ".open"), false);
  };

  Handle$1.prototype.remove = function remove () {
    if (this.removed) { return false; }
    var parentPath = (this.parent ? this.parent.keypath + '.' : '') + "items";
    var parent = this.menu.get(parentPath);
    this.menu.splice(parentPath, parent.indexOf(this.item), 1);
    this.removed = true;
    return true;
  };

  Handle$1.prototype.get = function get (keypath) {
    if (this.removed) { return false; }
    if (!keypath) { return this.menu.get(this.keypath); }
    var key = keypath.replace(/^[\.\/]*/, '');
    return this.menu.get(((this.keypath) + "." + key));
  };

  Handle$1.prototype.set = function set (keypath, value) {
    if (this.removed) { return false; }
    var key = keypath.replace(/^[\.\/]*/, '');
    return this.menu.set(((this.keypath) + "." + key), value);
  };

  Object.defineProperties( Handle$1.prototype, prototypeAccessors );

  function plugin$4(opts) {
    if ( opts === void 0 ) { opts = {}; }

    return function(ref) {
      var instance = ref.instance;

      instance.components[opts.name || 'menu'] = Menu;
    }
  }

  globalRegister('RMMenu', 'components', Menu);

  // based on ractive-event-tap
  var abs = Math.abs;

  function makeSwipe(opts) {
    var init = Object.assign({}, { distance: 150, flick: 200, threshold: 0.2 }, opts);
    return function setup(ref) {
      var Ractive = ref.Ractive;
      var instance = ref.instance;

      instance.events[opts.name || ("swipe" + (opts.direction || ''))] = function swipe(node, fire, options) {
        if ( options === void 0 ) { options = {}; }

        var handler;
        var opts = Object.assign({}, { direction: 'right' }, init, options);
        opts.fire = fire;
        if (handler = node.__r_swipes__) {
          handler.subscribe(opts);
        } else {
          handler = new Handler(Ractive.getContext(node));
          node.__r_swipes__ = handler;
          handler.subscribe(opts);
        }

        return { teardown: function teardown() { handler.unsubscribe(fire); } };
      };
    }
  }

  var left = makeSwipe({ direction: 'left' });
  var right = makeSwipe({ direction: 'right' });
  makeSwipe({ direction: 'up' });
  makeSwipe({ direction: 'down' });

  var Handler = function Handler(context) {
    this.context = context;
    this.node = context.node;
    this.fires = [];

    this.bind();
  };

  Handler.prototype.subscribe = function subscribe (opts) {
    this.fires.push(opts);
    this.hasBinding = !!this.fires.find(function (f) { return f.bindPx || f.bind; });
    this.hasBounds = !!this.fires.find(function (f) { return f.maxX != null || f.maxY != null || f.minX != null || f.minY != null; });
  };

  Handler.prototype.unsubscribe = function unsubscribe (fire) {
    this.fires = this.fires.filter(function (f) { return f.fire !== fire; });
    if (!this.fires.length) { this.teardown(); }
    this.hasBinding = !!this.fires.find(function (f) { return f.bindPx || f.bind; });
    this.hasBounds = !!this.fires.find(function (f) { return f.maxX != null || f.maxY != null || f.minX != null || f.minY != null; });
  };

  Handler.prototype.bind = function bind () {
    // listen for mouse/pointer events...
    if ('ontouchstart' in window) {
      this.context.listen('mousedown', handleMousedown);
      this.context.listen('dragstart', handleDragstart);

      // ...and touch events
      this.context.listen('touchstart', handleTouchstart, { passive: false });
    } else if (window.PointerEvent || window.navigator.pointerEnabled) {
      this.context.listen('pointerdown', handleMousedown, { passive: false });
    } else if (window.navigator.msPointerEnabled) {
      this.context.listen('MSPointerDown', handleMousedown);
    } else {
      this.context.listen('mousedown', handleMousedown);
      this.context.listen('dragstart', handleDragstart);

      // ...and touch events
      this.context.listen('touchstart', handleTouchstart, { passive: false });
    }
  };

  Handler.prototype.fire = function fire (event, startx, starty, endx, endy, duration) {
      var this$1 = this;

    var node = this.node;
    var fired;

    this.fires.forEach(function (f) {
      if (!f.active) { f.active = true; return; }

      var distx = duration < f.flick ? endx - startx + ((f.flick / duration) * (endx - startx)) : endx - startx;
      var disty = duration < f.flick ? endy - starty + ((f.flick / duration) * (endy - starty)) : endy - starty;
      var threshold = abs(f.threshold <= 0 ? Math.max(distx, disty) : f.threshold < 1 ? f.direction === 'right' || f.direction === 'left' ? f.threshold * distx : f.threshold * disty : f.threshold);
      var dist = f.bindPx;
      var pct = f.bind;

      if (distx > 0 && f.direction === 'right' && distx >= f.distance && abs(disty) <= threshold) {
        f.fire({ node: node, event: event });
        fired = true;
      } else if (distx < 0 && f.direction === 'left' && -distx >= f.distance && abs(disty) <= threshold) {
        f.fire({ node: node, event: event });
        fired = true;
      }

      if (disty > 0 && f.direction === 'down' && disty >= f.distance && abs(distx) <= threshold) {
        f.fire({ node: node, event: event });
        fired = true;
      } else if (disty < 0 && f.direction === 'up' && -disty >= f.distance && abs(distx) <= threshold) {
        f.fire({ node: node, event: event });
        fired = true;
      }

      if (dist) { this$1.context.set(dist, 0); }
      if (pct) { this$1.context.set(pct, 0); }
    });

    return fired;
  };

  Handler.prototype.checkBounds = function checkBounds (startx, starty) {
    var rect = this.node.getBoundingClientRect();
    var x = startx - rect.x, y = starty - rect.y;

    this.fires.forEach(function (f) {
      var maxX = f.maxX;
        var maxY = f.maxY;
        var minX = f.minX;
        var minY = f.minY;
      if (maxX > 0 && x > maxX) { f.active = false; return; }
      if (maxX < 0 && x > rect.width + maxX) { f.active = false; return; }
      if (maxY > 0 && y > maxY) { f.active = false; return; }
      if (maxY < 0 && y > rect.height + maxY) { f.active = false; return; }
      if (minX > 0 && x < minX) { f.active = false; return; }
      if (minX < 0 && x < rect.width + minX) { f.active = false; return; }
      if (minY > 0 && y < minY) { f.active = false; return; }
      if (minY < 0 && y < rect.width + minY) { f.active = false; return; }
      f.active = true;
    });

    return !!this.fires.find(function (f) { return f.active; });
  };

  Handler.prototype.updateBindings = function updateBindings (startx, starty, endx, endy) {
      var this$1 = this;

    this.fires.forEach(function (f) {
      if (!f.active) { return; }

      if (!f.bindPx && !f.bind) { return; }

      var dist = f.bindPx;
      var pct = f.bind;
      var distx = endx - startx;
      var disty = endy - starty;
      var threshold = abs(f.threshold <= 0 ? Math.max(distx, disty) : f.threshold < 1 ? f.direction === 'right' || f.direction === 'left' ? f.threshold * distx : f.threshold * disty : f.threshold);

      if (dist) {
        if (f.direction === 'left') { this$1.context.set(dist, distx < 0 && abs(disty) <= threshold ? -distx : 0); }
        else if (f.direction === 'right') { this$1.context.set(dist, distx > 0 && abs(disty) <= threshold ? distx : 0); }
        else if (f.direction === 'up') { this$1.context.set(dist, disty < 0 && abs(distx) <= threshold ? -disty : 0); }
        else if (f.direction === 'down') { this$1.context.set(dist, disty > 0 && abs(distx) <= threshold ? disty : 0); }
      }

      if (pct) {
        if (f.direction === 'left') { this$1.context.set(pct, distx < 0 && abs(disty) <= threshold ? (-distx / f.distance) * 100 : 0); }
        else if (f.direction === 'right') { this$1.context.set(pct, distx > 0 && abs(disty) <= threshold ? (distx / f.distance) * 100 : 0); }
        else if (f.direction === 'up') { this$1.context.set(pct, disty < 0 && abs(distx) <= threshold ? (-disty / f.distance) * 100 : 0); }
        else if (f.direction === 'down') { this$1.context.set(pct, disty > 0 && abs(distx) <= threshold ? (disty / f.distance) * 100 : 0); }
      }
    });
  };

  Handler.prototype.mousedown = function mousedown (event) {
      var this$1 = this;

    if (this.preventMousedownEvents) {
      return;
    }

    if (event.which !== undefined && event.which !== 1) {
      return;
    }

    var start = new Date();
    var x = event.clientX;
    var y = event.clientY;

    if (this.hasBounds && !this.checkBounds(x, y)) { return; }
   
    // This will be null for mouse events.
    var pointerId = event.pointerId;

    var handleMouseup = function (event) {
      this$1.fire(event, x, y, event.clientX, event.clientY, new Date() - start) && event.cancelable !== false && event.preventDefault();
      cancel();
    };

    var handleMousemove = function (event) {
      if (event.pointerId != pointerId) {
        return;
      }

      if (this$1.hasBinding) {
        this$1.updateBindings(x, y, event.clientX, event.clientY);
      }  
    };

    var cancel = function () {
      this$1.node.removeEventListener('MSPointerUp', handleMouseup, false);
      document.removeEventListener('MSPointerMove', handleMousemove, false);
      document.removeEventListener('MSPointerCancel', cancel, false);
      document.removeEventListener('pointerup', handleMouseup, false);
      document.removeEventListener('pointermove', handleMousemove, false);
      document.removeEventListener('pointercancel', cancel, false);
      document.removeEventListener('mouseup', handleMouseup, false);
      document.removeEventListener('click', handleMouseup, false);
      document.removeEventListener('mousemove', handleMousemove, false);
    };

    if (window.PointerEvent || window.navigator.pointerEnabled) {
      document.addEventListener('pointerup', handleMouseup, false);
      document.addEventListener('pointermove', handleMousemove, false);
      document.addEventListener('pointercancel', cancel, false);
    } else if (window.navigator.msPointerEnabled) {
      document.addEventListener('MSPointerUp', handleMouseup, false);
      document.addEventListener('MSPointerMove', handleMousemove, false);
      document.addEventListener('MSPointerCancel', cancel, false);
    } else {
      document.addEventListener('mouseup', handleMouseup, false);
      document.addEventListener('click', handleMouseup, false);
      document.addEventListener('mousemove', handleMousemove, false);
    }
  };

  Handler.prototype.touchdown = function touchdown (event) {
      var this$1 = this;

    var touch = event.touches[0];

    var start = new Date();
    var x = touch.clientX;
    var y = touch.clientY;

    if (this.hasBounds && !this.checkBounds(x, y)) { return; }
      
    var finger = touch.identifier;

    var handleTouchup = function (event) {
      var touch = event.changedTouches[0];

      if (touch.identifier !== finger) {
        cancel();
        return;
      }

      // for the benefit of mobile Firefox and old Android browsers, we need this absurd hack.
      this$1.preventMousedownEvents = true;
      clearTimeout(this$1.preventMousedownTimeout);

      this$1.preventMousedownTimeout = setTimeout(function () {
        this$1.preventMousedownEvents = false;
      }, 400);

      this$1.fire(event, x, y, touch.clientX, touch.clientY, new Date() - start) && event.cancelable !== false && event.preventDefault();
      cancel();
    };

    var handleTouchmove = function (event) {
      if (event.touches.length !== 1 || event.touches[0].identifier !== finger) {
        cancel();
      }

      var touch = event.touches[0];

      if (event.cancelable) {
        var distX = touch.clientX - x;
        var distY = touch.clientY - y;
        if (abs(distX) > abs(distY)) {
          if (distX > 0 && this$1.fires.find(function (f) { return f.direction === 'right'; })) { event.preventDefault(); }
          if (distX < 0 && this$1.fires.find(function (f) { return f.direction === 'left'; })) { event.preventDefault(); }
        }
      }

      if (this$1.hasBinding) {
        this$1.updateBindings(x, y, touch.clientX, touch.clientY);
      }  
    };

    var cancel = function () {
      this$1.node.removeEventListener('touchend', handleTouchup, false);
      window.removeEventListener('touchmove', handleTouchmove, { passive: false, capture: false });
      window.removeEventListener('touchcancel', cancel, false);
    };

    this.node.addEventListener('touchend', handleTouchup, false);
    window.addEventListener('touchmove', handleTouchmove, { passive: false, capture: false });
    window.addEventListener('touchcancel', cancel, false);
  };

  Handler.prototype.teardown = function teardown () {
    var ctx = this.context;

    ctx.unlisten('pointerdown', handleMousedown);
    ctx.unlisten('MSPointerDown', handleMousedown);
    ctx.unlisten('mousedown', handleMousedown);
    ctx.unlisten('touchstart', handleTouchstart);
    ctx.unlisten('dragstart', handleDragstart);

    delete this.node.__r_swipes__;
  };
  function handleMousedown(event) {
    return this.__r_swipes__.mousedown(event);
  }

  function handleTouchstart(event) {
    return this.__r_swipes__.touchdown(event);
  }

  function handleDragstart(event) {
    event.preventDefault();
  }

  var Shell = /*@__PURE__*/(function (Ractive) {
    function Shell(opts) { Ractive.call(this, opts); }

    if ( Ractive ) { Shell.__proto__ = Ractive; }
    Shell.prototype = Object.create( Ractive && Ractive.prototype );
    Shell.prototype.constructor = Shell;

    Shell.prototype.adaptSize = function adaptSize (reinit) {
      if (reinit) {
        if (this._media) { this._media.cancel(); }
        initMediaListener(this);
      } else {
        this._media && this._media.fn();
      }
    };

    Shell.prototype.sizeInPx = function sizeInPx (size) {
      if (!this.sizer) { return 160; }
      this.sizer.style.width = typeof size === 'number' ? (size + "px") : size;
      return this.sizer.clientWidth;
    };

    Shell.prototype.relativeSize = function relativeSize (size, rel) {
      if ( rel === void 0 ) { rel = '1em'; }

      if (!this.sizer) { return 10; }
      return this.sizeInPx(size) / this.sizeInPx(rel);
    };

    return Shell;
  }(Ractive__default['default']));

  Ractive__default['default'].extendWith(Shell, {
    template: {v:4,t:[{t:7,e:"div",m:[{t:13,n:"class",f:"rshell",g:1},{t:16,r:"extra-attributes"},{n:"tracked",t:71,f:{r:[],s:"[\"outer\"]"}},{n:"class-rshell-left-popped",t:13,f:[{t:2,r:".leftPop"}]},{n:"class-rshell-right-popped",t:13,f:[{t:2,r:".rightPop"}]},{n:"class-rshell-top-popped",t:13,f:[{t:2,r:".topPop"}]},{n:"class-rshell-bottom-popped",t:13,f:[{t:2,r:".bottomPop"}]}],f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rshell-sizer",g:1},{n:"tracked",t:71,f:{r:[],s:"[\"sizer\"]"}}]}," ",{t:7,e:"div",m:[{t:13,n:"class",f:"rshell-main",g:1}],f:[{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rshell-top",g:1},{n:"class-rshell-overflow",t:13,f:[{t:2,r:"~/topOverflow"}]},{t:4,f:[{t:16,r:"._topA"}],n:50,r:"._topA"}],f:[{t:16,r:"._top"}]}],n:50,r:"._top"}," ",{t:7,e:"div",m:[{t:13,n:"class",f:"rshell-middle",g:1},{n:"class-rshell-has-left",t:13,f:[{t:2,x:{r:["._left","._leftOver",".leftOver"],s:"_0&&!_1&&!_2"}}]},{n:"class-rshell-has-right",t:13,f:[{t:2,x:{r:["._right","._rightOver",".rightOver"],s:"_0&&!_1&&!_2"}}]},{n:"class-rshell-left-hidden",t:13,f:[{t:2,r:".leftHidden"}]},{n:"class-rshell-right-hidden",t:13,f:[{t:2,r:".rightHidden"}]}],f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rshell-modal",g:1},{n:"class-rshell-blocked",t:13,f:[{t:2,x:{r:[".blocked",".blockableLeft",".leftPull",".blockableRight",".rightPull"],s:"_0||(_1&&_2)||(_3&&_4)"}}]},{n:["click"],t:70,f:{r:["@this",".leftOver","._leftOver",".leftHidden",".rightOver","._rightOver",".rightHidden"],s:"[_0.set({leftHidden:_1||_2?true:_3,rightHidden:_4||_5?true:_6})]"}},{t:4,f:[{n:["swipeleft"],t:70,a:{r:[],s:"[{bind:\".leftPush\"}]"},f:{r:["@this"],s:"[_0.set(\"leftHidden\",true)]"}},{n:["swiperight"],t:70,a:{r:[],s:"[{bind:\".rightPush\"}]"},f:{r:["@this"],s:"[_0.set(\"rightHidden\",true)]"}}],n:50,rx:{r:"~/",m:[{r:[],s:"\"side-swipe\""}]}},{t:4,f:[{n:"style-transition",f:"none",t:13},{n:"style-opacity",f:[{t:2,x:{r:[".leftPull",".rightPull"],s:"Math.min(_0||_1,100)/200"}}],t:13}],n:50,x:{r:[".leftPull",".rightPull"],s:"_0||_1"}}]}," ",{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rshell-left",g:1},{n:"tracked",t:71,f:{r:[],s:"[\"left\"]"}},{t:4,f:[{t:16,r:"._leftA"}],n:50,r:"._leftA"},{t:4,f:[{n:["swipeleft"],t:70,a:{r:[],s:"[{bind:\".leftPush\"}]"},f:{r:["@this"],s:"[_0.set(\"leftHidden\",true)]"}}],n:50,rx:{r:"~/",m:[{r:[],s:"\"side-swipe\""}]}},{t:4,f:[{n:"style-transition",f:"none",t:13},{n:"style-transform",f:["translate(-",{t:2,x:{r:[".leftPull"],s:"100-(_0>100?100:_0)"}},"%)"],t:13}],n:50,r:".leftPull"},{t:4,f:[{n:"style-transition",f:"none",t:13},{n:"style-transform",f:["translate(-",{t:2,x:{r:[".leftPush"],s:"_0>100?100:_0"}},"%)"],t:13}],n:50,r:".leftPush"},{n:"class-rshell-overflow",t:13,f:[{t:2,r:"~/leftOverflow"}]}],f:[{t:16,r:"._left"}]}],n:50,r:"._left"}," ",{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rshell-center",g:1},{n:"tracked",t:71,f:{r:[],s:"[\"center\"]"}},{t:4,f:[{t:16,r:"._centerA"}],n:50,r:"._centerA"},{t:4,f:[" ",{t:4,f:[{n:["swiperight"],t:70,a:{r:[],s:"[{maxX:80,bind:\".leftPull\"}]"},f:{r:["@this"],s:"[_0.set(\"leftHidden\",false)]"}}],n:50,x:{r:["._left",".leftHidden"],s:"_0&&_1"}}," ",{t:4,f:[{n:["swipeleft"],t:70,a:{r:[],s:"[{minX:-80,bind:\".rightPull\"}]"},f:{r:["@this"],s:"[_0.set(\"rightHidden\",false)]"}}],n:50,x:{r:["._right",".rightHidden"],s:"_0&&_1"}}," "],n:50,rx:{r:"~/",m:[{r:[],s:"\"side-swipe\""}]}},{n:"class-rshell-overflow",t:13,f:[{t:2,r:"~/centerOverflow"}]}],f:[{t:16,r:"._center"}]}],n:50,r:"._center"}," ",{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rshell-right",g:1},{n:"tracked",t:71,f:{r:[],s:"[\"right\"]"}},{t:4,f:[{t:16,r:"._rightA"}],n:50,r:"._rightA"},{t:4,f:[{n:["swiperight"],t:70,a:{r:[],s:"[{bind:\".rightPush\"}]"},f:{r:["@this"],s:"[_0.set(\"rightHidden\",true)]"}}],n:50,rx:{r:"~/",m:[{r:[],s:"\"side-swipe\""}]}},{t:4,f:[{n:"style-transition",f:"none",t:13},{n:"style-transform",f:["translate(",{t:2,x:{r:[".rightPull"],s:"100-(_0>100?100:_0)"}},"%)"],t:13}],n:50,r:".rightPull"},{t:4,f:[{n:"style-transition",f:"none",t:13},{n:"style-transform",f:["translate(",{t:2,x:{r:[".rightPush"],s:"_0>100?100:_0"}},"%)"],t:13}],n:50,r:".rightPush"},{n:"class-rshell-overflow",t:13,f:[{t:2,r:"~/rightOverflow"}]}],f:[{t:16,r:"._right"}]}],n:50,r:"._right"}]}," ",{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rshell-bottom",g:1},{t:4,f:[{t:16,r:"._bottomA"}],n:50,r:"._bottomA"},{n:"class-rshell-overflow",t:13,f:[{t:2,r:"~/bottomOverflow"}]}],f:[{t:16,r:"._bottom"}]}],n:50,r:"._bottom"}]}," ",{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rshell-left-pop",g:1},{t:4,f:[{t:16,r:"._leftPopA"}],n:50,r:"._leftPopA"}],f:[{t:16,r:"._leftPop"}]}],n:50,r:"._leftPop"}," ",{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rshell-right-pop",g:1},{t:4,f:[{t:16,r:"._rightPopA"}],n:50,r:"._rightPopA"}],f:[{t:16,r:"._rightPop"}]}],n:50,r:"._rightPop"}," ",{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rshell-bottom-pop",g:1},{t:4,f:[{t:16,r:"._bottomPopA"}],n:50,r:"._bottomPopA"}],f:[{t:16,r:"._bottomPop"}]}],n:50,r:"._bottomPop"}," ",{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rshell-top-pop",g:1},{t:4,f:[{t:16,r:"._topPopA"}],n:50,r:"._topPopA"}],f:[{t:16,r:"._topPop"}]}],n:50,r:"._topPop"}]}],e:{"[\"outer\"]":function (){return(["outer"]);},"[\"sizer\"]":function (){return(["sizer"]);},"_0&&!_1&&!_2":function (_0,_1,_2){return(_0&&!_1&&!_2);},"_0||(_1&&_2)||(_3&&_4)":function (_0,_1,_2,_3,_4){return(_0||(_1&&_2)||(_3&&_4));},"[_0.set({leftHidden:_1||_2?true:_3,rightHidden:_4||_5?true:_6})]":function (_0,_1,_2,_3,_4,_5,_6){return([_0.set({leftHidden:_1||_2?true:_3,rightHidden:_4||_5?true:_6})]);},"[{bind:\".leftPush\"}]":function (){return([{bind:".leftPush"}]);},"[_0.set(\"leftHidden\",true)]":function (_0){return([_0.set("leftHidden",true)]);},"[{bind:\".rightPush\"}]":function (){return([{bind:".rightPush"}]);},"[_0.set(\"rightHidden\",true)]":function (_0){return([_0.set("rightHidden",true)]);},"\"side-swipe\"":function (){return("side-swipe");},"Math.min(_0||_1,100)/200":function (_0,_1){return(Math.min(_0||_1,100)/200);},"_0||_1":function (_0,_1){return(_0||_1);},"[\"left\"]":function (){return(["left"]);},"100-(_0>100?100:_0)":function (_0){return(100-(_0>100?100:_0));},"_0>100?100:_0":function (_0){return(_0>100?100:_0);},"[\"center\"]":function (){return(["center"]);},"[{maxX:80,bind:\".leftPull\"}]":function (){return([{maxX:80,bind:".leftPull"}]);},"[_0.set(\"leftHidden\",false)]":function (_0){return([_0.set("leftHidden",false)]);},"_0&&_1":function (_0,_1){return(_0&&_1);},"[{minX:-80,bind:\".rightPull\"}]":function (){return([{minX:-80,bind:".rightPull"}]);},"[_0.set(\"rightHidden\",false)]":function (_0){return([_0.set("rightHidden",false)]);},"[\"right\"]":function (){return(["right"]);}}}, css: function(data) { return [(function(data) {
     var left = data('raui.shell.left.width') || data('raui.menu.width') || '18em';
     var right = data('raui.shell.right.width') || data('raui.menu.width') || '18em';
     var primary = Object.assign({}, data('raui.primary'), data('raui.shell.primary'));
     return ("\n   .rshell {\n     width: 100%;\n     height: 100%;\n     position: absolute;\n     overflow: hidden;\n   }\n   .rshell-sizer {\n     position: absolute;\n   }\n   .rshell-modal {\n     position: absolute;\n     top: 0;\n     left: 0;\n     bottom: 0;\n     right: 0;\n     opacity: 0;\n     background-color: #000;\n     z-index: -1;\n     transition: opacity " + (data('raui.shell.slide.ms') || 400) + "ms ease-in-out, z-index 0s linear " + (data('raui.shell.slide.ms') || 400) + "ms;\n   }\n   .rshell-modal.rshell-blocked {\n     opacity: 0.5;\n     z-index: 3;\n     transition: opacity " + (data('raui.shell.slide.ms') || 400) + "ms ease-in-out, z-index 0s linear;\n   }\n   .rshell-main {\n     width: 100%;\n     height: 100%;\n     box-sizing: border-box;\n     display: flex;\n     flex-direction: column;\n     overflow: hidden;\n     z-index: 1;\n     background-color: " + (primary.bg || 'inherit') + ";\n   }\n \n   .rshell-middle {\n     flex-grow: 1;\n     position: relative;\n   }\n \n   .rshell-left, .rshell-right {\n     position: absolute;\n     top: 0;\n     box-sizing: border-box;\n     height: 100%;\n     overflow: auto;\n     z-index: 4;\n     background-color: " + (primary.bg || 'inherit') + ";\n     transition: transform " + (data('raui.shell.slide.ms') || 400) + "ms ease-in-out;\n   }\n   .rshell-left {\n     left: 0;\n     width: " + left + ";\n   }\n   .rshell-right {\n     right: 0;\n     width: " + right + ";\n   }\n   .rshell-left-hidden > .rshell-left {\n     transform: translateX(-100%);\n   }\n   .rshell-right-hidden > .rshell-right {\n     transform: translateX(100%);\n   }\n   .rshell-has-right > .rshell-right,\n   .rshell-has-left > .rshell-left {\n     z-index: 2;\n   }\n   .rshell-left-popped > .rshell-main > .rshell-middle > .rshell-left,\n   .rshell-left-popped > .rshell-main > .rshell-middle > .rshell-right,\n   .rshell-top-popped > .rshell-main > .rshell-middle > .rshell-left,\n   .rshell-top-popped > .rshell-main > .rshell-middle > .rshell-right,\n   .rshell-bottom-popped > .rshell-main > .rshell-middle > .rshell-left,\n   .rshell-bottom-popped > .rshell-main > .rshell-middle > .rshell-right,\n   .rshell-right-popped > .rshell-main > .rshell-middle > .rshell-left,\n   .rshell-right-popped > .rshell-main > .rshell-middle > .rshell-right {\n     z-index: 2;\n   }\n \n   .rshell-left-pop, .rshell-right-pop, .rshell-top-pop, .rshell-bottom-pop {\n     z-index: 5;\n     transition: transform " + (data('raui.shell.slide.ms') || 400) + "ms ease-in-out;\n     position: absolute;\n   }\n   .rshell-left-pop, .rshell-right-pop {\n     top: 0;\n     bottom: 0;\n     max-width: 100%;\n     overflow: auto;\n   }\n   .rshell-top-pop, .rshell-bottom-pop {\n     left: 0;\n     right: 0;\n     max-height: 100%;\n     overflow: auto;\n   }\n \n   .rshell-left-pop {\n     transform: translateX(-100%);\n   }\n   .rshell-right-pop {\n     transform: translateX(100%);\n     right: 0;\n   }\n   .rshell-top-pop {\n     top: 0;\n     transform: translateY(-100%);\n   }\n   .rshell-bottom-pop {\n     bottom: 0;\n     transform: translateY(100%);\n   }\n \n   .rshell-left-popped > .rshell-left-pop,\n   .rshell-right-popped > .rshell-right-pop,\n   .rshell-top-popped > .rshell-top-pop,\n   .rshell-bottom-popped > .rshell-bottom-pop {\n     transform: none;\n   }\n \n   .rshell-center {\n     position: absolute;\n     top: 0;\n     left: 0;\n     z-index: 1;\n     box-sizing: border-box;\n     height: 100%;\n     width: 100%;\n     flex-grow: 1;\n     overflow: auto;\n   }\n   .rshell-has-left > .rshell-center {\n     width: calc(100% - " + left + ");\n     left: " + left + ";\n   }\n   .rshell-has-right > .rshell-center {\n     width: calc(100% - " + right + ");\n     left: 0;\n   }\n   .rshell-has-left.rshell-has-right > .rshell-center {\n     width: calc(100% - " + left + " - " + right + ");\n     left: " + left + ";\n   }\n   .rshell-has-left.rshell-left-hidden > .rshell-center {\n     width: 100%;\n     left: 0;\n   }\n   .rshell-has-right.rshell-right-hidden > .rshell-center {\n     width: 100%;\n   }\n   .rshell-has-left.rshell-has-right.rshell-left-hidden > .rshell-center {\n     width: calc(100% - " + right + ");\n     left: 0;\n   }\n   .rshell-has-left.rshell-has-right.rshell-right-hidden > .rshell-center {\n     width: calc(100% - " + left + ");\n     left: " + left + ";\n   }\n   .rshell-has-left.rshell-has-right.rshell-left-hidden.rshell-right-hidden > .rshell-center {\n     width: 100%;\n     left: 0;\n   }\n \n   .rshell-overflow {\n     overflow: visible;\n   }\n   ");
     // TODO: other themes
  }).call(this, data)].join(' '); },
    attributes: ['adaptive', 'side-swipe'],
    use: [ left, right ],
    decorators: {
      tracked: function tracked(node, name) {
        this[name] = node;
        return { teardown: function teardown() { this[name] = undefined; } };
      }
    },
    cssId: 'rshell',
    noCssTransform: true,
    computed: {
      blockableLeft: function blockableLeft() {
        return this.get('_left') && (this.get('leftOver') || this.get('_leftOver'));
      },
      blockableRight: function blockableRight() {
        return this.get('_right') && (this.get('rightOver') || this.get('_rightOver'));
      },
      blocked: function blocked() {
        return (this.get('blockableLeft') && !(this.get('leftHidden')) || (this.get('blockableRight') && !this.get('rightHidden'))) || this.get('leftPop') || this.get('rightPop') || this.get('topPop') || this.get('bottomPop');
      }
    },
    on: {
      construct: construct$1,
      config: function config() {
        if (this._items) { this.set(this._items); }
      },
      init: function init() {
        var this$1 = this;

        if (this.get('@style.shell.sides.initialTimeout') && (this.get('rightOver') || this.get('leftOver'))) {
          setTimeout(function () {
            if (this$1.get('rightOver')) { this$1.set('rightHidden', true); }
            if (this$1.get('leftOver')) { this$1.set('leftHidden', true); }
          }, this.get('@style.shell.sides.initialTimeout') || 1500);
        } else {
            if (this.get('rightOver')) { this.set('rightHidden', true); }
            if (this.get('leftOver')) { this.set('leftHidden', true); }
        }
      },
      complete: function complete() {
        initMediaListener(this);
      },
      unrender: function unrender() {
        if (this._media) { this._media.cancel(); }
      }
    },
    observe: {
      'leftHidden rightHidden': {
        handler: function handler(v, o, k) {
          var this$1 = this;

          if (~k.indexOf('left') && !this.get('leftOver') && !this.get('_leftOver') || ~k.indexOf('right') && !this.get('rightOver') && !this.get('_rightOver')) {
            setTimeout(function () {
              this$1._media && this$1._media.listener && this$1._media.listener.silence();
              this$1._media && this$1._media.observer && this$1._media.observer.silence();
              this$1.fire('resize');
              this$1._media && this$1._media.listener && this$1._media.listener.resume();
              this$1._media && this$1._media.observer && this$1._media.observer.resume();
            }, (this.get('shell.slide.ms') || 400) + 10);
          }
        },
        defer: true,
        init: false
      }
    }
  });

  var parts = ['top', 'bottom', 'center', 'left', 'right', 'left-pop', 'right-pop', 'top-pop', 'bottom-pop'];
  var skipAttrs = ['hidden', 'primary', 'over', 'popped', 'overflow', 'forced'];
  function construct$1() {
    var cmp = this.component;
    if ( !cmp ) { return; }

    var tpl = cmp.template.f || [];
    var attrs = cmp.template.m ? cmp.template.m.slice() : [];
    var t = cmp.template;
    cmp.template = { e: t.e, f: t.f, t: t.t, m: attrs };

    var items = {};

    tpl.forEach(function (e) {
      if (~parts.indexOf(e.e)) {
        var name = e.e === 'left-pop' ? 'leftPop' : e.e === 'right-pop' ? 'rightPop' : e.e === 'top-pop' ? 'topPop' : e.e === 'bottom-pop' ? 'bottomPop' : e.e;
        items[("_" + name)] = { t: e.f };
        if (e.m) {
          var as = e.m.filter(function (a) { return !~skipAttrs.indexOf(a.n); });

          if (as.length) {
            items[("_" + name + "A")] = { t: as };
          }

          if (as.length !== e.m.length) {
            var a = e.m.find(function (a) { return a.n === 'hidden'; });
            if (a) { attrs.push({ t: 13, n: (name + "Hidden"), f: a.f }); }
            a = e.m.find(function (a) { return a.n === 'over'; });
            if (a) { attrs.push({ t: 13, n: (name + "Over"), f: a.f }); }
            a = e.m.find(function (a) { return a.n === 'primary'; });
            if (a) { attrs.push({ t: 13, n: ("_" + name + "Primary"), f: a.f }); }
            if (~e.e.indexOf('-pop')) {
              a = e.m.find(function (a) { return a.n === 'popped'; });
              if (a) { attrs.push({ t: 13, n: name, f: a.f }); }
            }
            a = e.m.find(function (a) { return a.n === 'overflow'; });
            if (a) { attrs.push({ t: 13, n: (name + "Overflow"), f: a.f }); }
            a = (e.e === 'left' || e.e === 'right') && e.m.find(function (a) { return a.n === 'forced'; });
            if (a) { attrs.push({ t: 13, n: ("_" + name + "Over"), f: a.f }); }
          }
        }
      }
    });

    this._items = items;
  }

  function initMediaListener(r) {
    if (typeof window === 'undefined') { return; }
    if (!r.left && !r.right) { return; }
    if (r._media) { return r._media.fn; }
    var inited = 0;
    var tm;

    var media = {
      fn: function fn() {
        var outer = r.relativeSize('100%');
        if (media.last === outer) { return; }
        else { media.last = outer; }

        var sizes = {
          left:  !r.get('leftOver') && r.left && r.left.clientWidth || 0,
          right: !r.get('rightOver') && r.right && r.right.clientWidth || 0
        };
        if (sizes.left) { sizes.left = r.relativeSize(sizes.left); }
        if (sizes.right) { sizes.right = r.relativeSize(sizes.right); }

        var primary = r.get('_rightPrimary') ? 'right' : 'left';
        var secondary = primary === 'right' ? 'left' : 'right';
        var medium = r.relativeSize(r.get('@style.break.medium') || '60rem', '1rem');

        var overs = { _leftOver: false, _rightOver: false };
        var hides = { leftHidden: r.get('leftOver'), rightHidden: r.get('rightOver') };

        if (!inited) {
          overs.leftHidden = false;
          overs.rightHidden = false;
        }

        var w = outer - sizes.left - sizes.right;
        if (w <= medium) {
          w += sizes[secondary];
          hides[(secondary + "Hidden")] = true;
          overs[("_" + secondary + "Over")] = true;
          if (w <= medium) {
            hides[(primary + "Hidden")] = true;
            overs[("_" + primary + "Over")] = true;
          }
        }

        r.set(overs);

        if (!inited) {
          inited = 1;
          setTimeout(function () {
            inited = 2;
            r.set(hides);
          }, r.get('@style.shell.sides.initialTimeout') || 1500);
        } else if (inited === 2) {
          r.set(hides);
        }

        if (tm) { clearTimeout(tm); }
        tm = setTimeout(function () {
          if (media.listener) { media.listener.silence(); }
          r.fire('resize');
          if (media.listener) { media.listener.resume(); }
          tm = 0;
        }, (r.get('shell.slide.ms') || 400) + 100);
      },
      cancel: function cancel() {
        r._media = null;
        window.removeEventListener('resize', media.fn);
        if (media.observer) { media.observer.cancel(); }
        if (media.listener) { media.listener.cancel(); }
      }
    };

    window.addEventListener('resize', media.fn);
    media.observer = r.observe('@style leftOver rightOver _leftPrimary _rightPrimary', media.fn, { init: false });
    if (r.get('adaptive')) { media.listener = r.root.on('*.resize', media.fn); }

    r._media = media;

    r._media.fn();
  }

  function plugin$3(opts) {
    if ( opts === void 0 ) { opts = {}; }

    return function(ref) {
      var instance = ref.instance;

      instance.components[opts.name || 'shell'] = Shell;
    }
  }

  globalRegister('RMShell', 'components', Shell);

  var Split = /*@__PURE__*/(function (Ractive) {
    function Split(opts) { Ractive.call(this, opts); }

    if ( Ractive ) { Split.__proto__ = Ractive; }
    Split.prototype = Object.create( Ractive && Ractive.prototype );
    Split.prototype.constructor = Split;

    Split.prototype._adjustSizes = function _adjustSizes () {
      var this$1 = this;

      this._sizing = true;
      var splits = this.get('splits');
      var count = 0;
      var used = 0;

      splits.forEach(function (s) {
        var size = s.sizePath ? +this$1.get(s.sizePath) : s.size;
        if (s.curSize === undefined) {
          if (s.min) {
            s.curSize = 0;
            s.lastSize = Math.floor(100 / splits.length);
          } else {
            s.curSize = size;
            used += size;
            count++;
          }
        } else if (s.min && s.curSize) {
          s.lastSize = s.curSize;
          s.curSize = 0;
        } else if (!s.min && !s.curSize && s.lastSize) {
          used += s.lastSize;
          s.curSize = s.lastSize;
          s.lastSize = false;
        } else if (size && !s.min && s.lastSet && s.lastSet !== size) {
          s.curSize = size;
          s.lastSize = false;
          used += size;
        } else if (s.curSize) {
          used += s.curSize;
          count++;
        } else if (!s.curSize && !s.min) {
          s.curSize = 0.1;
          count++;
        }
      });

      var offset = (100 - used) / (count || 1);

      var sets = {};
      splits.forEach(function (s, i) {
        setTimeout(function () {
          var sizing = this$1._sizing;
          this$1._sizing = true;
          this$1.set(s.sizePath ? s.sizePath : ("splits." + i + ".size"), s.curSize);
          this$1._sizing = sizing;
        });
        sets[("splits." + i + ".curSize")] = (s.lastSize === false || s.min) ? s.curSize : s.curSize + offset;
        sets[("splits." + i + ".lastSet")] = sets[("splits." + i + ".curSize")];
        if (!s.lastSize) { s.lastSize = null; }
      });

      this.set(sets);
      setTimeout(function () { return this$1.fire('resize'); }, 320);
      this._sizing = false;
    };

    Split.prototype.maximize = function maximize (idx) {
      if (this.get(("splits." + idx + ".min"))) { this.toggle(("splits." + idx + ".min")); }
      else { this.toggle(("splits." + (idx + 1) + ".min")); }
      this._adjustSizes();
    };

    Split.prototype.minimize = function minimize (idx) {
      if (this.get(("splits." + (idx + 1) + ".min"))) { this.toggle(("splits." + (idx + 1) + ".min")); }
      else { this.toggle(("splits." + idx + ".min")); }
      this._adjustSizes();
    };

    return Split;
  }(Ractive__default['default']));

  Ractive__default['default'].extendWith(Split, {
    template: {v:4,t:[{t:7,e:"div",m:[{t:13,n:"class",f:"rsplit",g:1},{n:"class-rsplit-vertical",t:13,f:[{t:2,r:"vertical"}]},{n:"class-rsplit-horizontal",t:13,f:[{t:2,x:{r:["vertical"],s:"!_0"}}]},{n:"class-rsplit-draggable",t:13,f:[{t:2,r:"draggable"}]},{t:16,r:"extra-attributes"}],f:[{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rsplit-split",g:1},{t:4,f:[{n:"style-transition",f:"width 0.3s ease-in-out, height 0.3s ease-in-out",t:13}],n:51,r:"~/dragging"},{t:4,f:[{n:"style-width",f:["calc(",{t:2,r:".curSize"},"% - ",{t:2,x:{r:["@style.split.handle.width","@last"],s:"_1*(_0||14)/(_1+1)"}},"px)"],t:13}],n:50,r:"~/vertical"},{t:4,f:[{n:"style-height",f:["calc(",{t:2,r:".curSize"},"% - ",{t:2,x:{r:["@style.split.handle.width","@last"],s:"_1*(_0||14)/(_1+1)"}},"px)"],t:13}],n:51,l:1},{t:4,f:[{t:16,r:".attrs"}],n:50,r:".attrs"}],f:[{t:16,r:".content"},{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rsplit-block",g:1}]}],n:50,x:{r:["~/draggable","~/dragging"],s:"_0&&_1"}}]}," ",{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rsplit-sep",g:1},{t:4,f:[{n:"sizeHandle",t:71,f:{r:["~/vertical","@index"],s:"[_0,_1]"}}],n:50,x:{r:[".",".draggable","~/draggable"],s:"\"draggable\" in _0?_1:_2"}}],f:[{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rsplit-sep-max",g:1},{n:["click"],t:70,f:{r:["@this","@index"],s:"[_0.maximize(_1)]"}}],f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rsplit-sep-max-btn",g:1}]}]}],n:50,x:{r:[".",".maximizable","~/maximizable",".min","@index","../"],s:"\"maximizable\" in _0?_1:_2&&(_3||!_5[_4+1].min)"}}," ",{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rsplit-sep-min",g:1},{n:["click"],t:70,f:{r:["@this","@index"],s:"[_0.minimize(_1)]"}}],f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rsplit-sep-min-btn",g:1}]}]}],n:50,x:{r:[".",".minimizable","~/minimizable",".min"],s:"\"minimizable\" in _0?_1:_2&&!_3"}}]}],n:50,x:{r:["@index","@last"],s:"_0!==_1"}}],n:52,r:"splits"}]}],e:{"!_0":function (_0){return(!_0);},"_1*(_0||14)/(_1+1)":function (_0,_1){return(_1*(_0||14)/(_1+1));},"_0&&_1":function (_0,_1){return(_0&&_1);},"[_0,_1]":function (_0,_1){return([_0,_1]);},"\"draggable\" in _0?_1:_2":function (_0,_1,_2){return("draggable" in _0?_1:_2);},"[_0.maximize(_1)]":function (_0,_1){return([_0.maximize(_1)]);},"\"maximizable\" in _0?_1:_2&&(_3||!_5[_4+1].min)":function (_0,_1,_2,_3,_4,_5){return("maximizable" in _0?_1:_2&&(_3||!_5[_4+1].min));},"[_0.minimize(_1)]":function (_0,_1){return([_0.minimize(_1)]);},"\"minimizable\" in _0?_1:_2&&!_3":function (_0,_1,_2,_3){return("minimizable" in _0?_1:_2&&!_3);},"_0!==_1":function (_0,_1){return(_0!==_1);}}}, css: function(data) { return [" .rsplit { position: absolute; width: 100%; height: 100%; flex-grow: 1; display: flex; } .rsplit.rsplit-vertical { flex-direction: row; } .rsplit.rsplit-horizontal { flex-direction: column; } .rsplit > .rsplit-split { display: inline-block; overflow: auto; position: relative; } .rsplit.rsplit-vertical > .rsplit-split { height: 100%; } .rsplit.rsplit-horizontal > .rsplit-split { width: 100%; } .rsplit-block { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 999; } .rsplit.rsplit-draggable.rsplit-vertical > .rsplit-sep { cursor: ew-resize; } .rsplit.rsplit-draggable.rsplit-horizontal > .rsplit-sep { cursor: ns-resize; } .rsplit > .rsplit-sep { display: flex; justify-content: center; overflow: hidden; touch-action: none; flex-shrink: 0; } .rsplit.rsplit-vertical > .rsplit-sep { flex-direction: column; } .rsplit > .rsplit-sep .rsplit-sep-max, .rsplit > .rsplit-sep .rsplit-sep-min { text-align: center; display: inline-block; position: relative; cursor: pointer; } .rsplit.rsplit-horizontal > .rsplit-sep .rsplit-sep-max, .rsplit.rsplit-horizontal > .rsplit-sep .rsplit-sep-min { width: 3em; height: 100%; margin: 0 1em; } .rsplit.rsplit-vertical > .rsplit-sep .rsplit-sep-max, .rsplit.rsplit-vertical > .rsplit-sep .rsplit-sep-min { width: 100%; height: 1em; padding: 1em 0; margin: 0.5em 0; } .rsplit > .rsplit-sep .rsplit-sep-max-btn, .rsplit > .rsplit-sep .rsplit-sep-min-btn { display: inline-block; border-style: solid; position: relative; width: 0; height: 0; box-sizing: border-box; }", (function(data) {
     var handle = Object.assign({
       bg: 'rgba(0, 0, 0, 0.1)',
       fg: 'rgba(0, 0, 0, 0.4)',
       width: 14
     }, data('raui.split.handle'));
   
     return ("\n   .rsplit > .rsplit-sep {\n     background-color: " + (handle.bg) + ";\n     color: " + (handle.fg) + ";\n   }\n \n   .rsplit.rsplit-vertical > .rsplit-sep {\n     width: " + (handle.width) + "px;\n     height: 100%;\n   }\n \n   .rsplit.rsplit-horizontal > .rsplit-sep {\n     height: " + (handle.width) + "px;\n     width: 100%;\n   }\n \n   .rsplit > .rsplit-sep {\n     font-size: " + (handle.width) + "px;\n   }\n \n   .rsplit > .rsplit-sep .rsplit-sep-max-btn,\n   .rsplit > .rsplit-sep .rsplit-sep-min-btn {\n     border-width: " + (handle.width / 2) + "px;\n   }\n \n   .rsplit.rsplit-horizontal > .rsplit-sep .rsplit-sep-max-btn {\n     top: " + (handle.width / 4) + "px;\n     border-right-color: transparent;\n     border-bottom-color: transparent;\n     border-left-color: transparent;\n   }\n \n   .rsplit.rsplit-horizontal > .rsplit-sep .rsplit-sep-min-btn {\n     bottom: " + (handle.width / 4) + "px;\n     border-top-color: transparent;\n     border-right-color: transparent;\n     border-left-color: transparent;\n   }\n \n   .rsplit.rsplit-vertical > .rsplit-sep .rsplit-sep-max-btn {\n     left: " + (handle.width / 4) + "px;\n     border-top-color: transparent;\n     border-right-color: transparent;\n     border-bottom-color: transparent;\n   }\n \n   .rsplit.rsplit-vertical > .rsplit-sep .rsplit-sep-min-btn {\n     right: " + (handle.width / 4) + "px;\n     border-top-color: transparent;\n     border-bottom-color: transparent;\n     border-left-color: transparent;\n   }\n   ");
  }).call(this, data)].join(' '); },
    cssId: 'split',
    noCssTransform: true,
    attributes: ['vertical', 'draggable', 'maximizable', 'minimizable'],
    data: function data() {
      return {
        draggable: true,
        maximizable: true,
        minimizable: true
      }
    },
    decorators: {
      sizeHandle: sizeHandle
    },
    on: {
      construct: function construct() {
        var this$1 = this;

        var cmp = this.component;
        if ( !cmp ) { return; }

        var tpl = cmp.template.f || [];
        var attrs = cmp.template.m ? cmp.template.m.slice() : [];
        var t = cmp.template;
        cmp.template = { e: t.e, f: t.f, t: t.t, m: attrs };

        var id = 0;
        function map(attr, partial) {
          if (attr && attr.f && attr.f.length === 1 && attr.f[0].t === 2) {
            var n = "_a" + (id++);
            attrs.push({ t: 13, n: n, f: attr.f });
            return partial ? { t: [{ t: 2, r: ("~/" + n) }] } : { t: 2, r: ("~/" + n) };
          }
          return attr && attr.f;
        }

        var splits = tpl.filter(function (e) { return e.e; });

        this._mappedSizes = [];
        this._splits = splits.map(function (e, i) {
          var attrs = (e.m || []).slice();
          var el = { e: e.e, f: e.f, t: e.t, m: attrs.filter(function (a) { return a.n !== 'size' && a.n !== 'minimize'; }) };

          var res = {
            content: el.e === 'pane' ? el.f : [el]
          };

          if (el.e === 'pane') {
            if (el.m) { res.attrs = el.m.slice(); }
          }

          var size = attrs.find(function (a) { return a.n === 'size'; });
          if (size) {
            if (size.f && typeof size.f === 'string') { res.size = +size.f; }
            else {
              res.sizePath = map(size).r;
              this$1._mappedSizes.push(res.sizePath);
            }
          }

          if (attrs.find(function (a) { return a.n === 'minimize'; })) { res.min = true; }

          return res;
        });

        var remain = 100 - this._splits.reduce(function (a, c) { return a + (c.min ? 0 : (c.size || 0)); }, 0);
        var unsized = this._splits.reduce(function (a, c) { return a + ('size' in c ? 0 : 1); }, 0);
        this._splits.forEach(function (s) {
          if (!('size' in s)) { s.size = remain / unsized; }
          if (s.min) {
            s.lastSize = s.size;
            s.curSize = 0;
          } else {
            s.curSize = s.size;
          }
        });
      },
      config: function config() {
        if (this._splits) { this.set('splits', this._splits); }
      },
      init: function init() {
        var this$1 = this;

        this.observe(this._mappedSizes.concat('splits.*.size').join(' '), function () {
          if (this$1._sizing || this$1._tm) { return; }
          this$1._tm = setTimeout(function () {
            this$1._adjustSizes();
            this$1._tm = null;
          });
        });
      }
    }
  });

  function sizeHandle(node, vertical, startIdx) {
    var ctx = this.getContext(node);
    var startSplit = ctx.get(("../" + startIdx));
    var endSplit = ctx.get(("../" + (startIdx + 1)));
    var root = node.parentNode;

    var pos, initStart, initEnd, available;
    var vert = vertical;
    var posKey = vert ? 'screenX' : 'screenY';

    var tm;

    function start(ev) {
      if (ev.target !== node && ev.target.parentNode !== node) { return; }
      ctx.ractive._sizing = true;
      ctx.set('~/dragging', true);
      available = vert ? root.clientWidth : root.clientHeight;

      document.addEventListener('touchmove', move, true);
      document.addEventListener('mousemove', move, true);
      document.addEventListener('mouseup', end, true);
      document.addEventListener('touchend', end, true);

      initStart = startSplit.curSize;
      initEnd = endSplit.curSize;

      if (posKey in ev) {
        pos = ev[posKey];
      } else {
        pos = ev.touches[0][posKey];
      }

      ev.preventDefault();
    }

    function move(ev) {
      var obj;

      var cur = posKey in ev ? ev[posKey] : ev.touches[0][posKey];
      var dist = cur - pos;

      var moved, s, e;
      moved = (Math.abs(dist) / available) * 100;

      if (dist < 0) {
        s = initStart - moved;
        e = initEnd + moved;
      } else {
        s = initStart + moved;
        e = initEnd - moved;
      }

      if (s < startSplit.min || 0) {
        e -= startSplit.min - s;
        s += startSplit.min - s;
      }

      if (e < endSplit.min || 0) {
        s -= endSplit.min - e;
        e += endSplit.min - e;
      }

      if (s < 0) {
        s = 0;
        e = initStart + initEnd;
      }
      if (e < 0) {
        s = initStart + initEnd;
        e = 0;
      }

      ctx.set(( obj = {}, obj[startSplit.sizePath ? ("~/" + (startSplit.sizePath)) : ("../" + startIdx + ".size")] = s, obj[endSplit.sizePath ? ("~/" + (endSplit.sizePath)) : ("../" + (startIdx + 1) + ".size")] = e, obj[("../" + startIdx + ".curSize")] = s, obj[("../" + startIdx + ".lastSet")] = s, obj[("../" + startIdx + ".min")] = false, obj[("../" + (startIdx + 1) + ".curSize")] = e, obj[("../" + (startIdx + 1) + ".lastSet")] = e, obj[("../" + (startIdx + 1) + ".min")] = false, obj ));

      if (!tm) {
        setTimeout(function () {
          ctx.ractive.fire('resize');
          tm = null;
        }, 300);
      }
    }

    function end() {
      ctx.ractive._sizing = false;
      ctx.set('~/dragging', false);
      document.removeEventListener('touchmove', move, true);
      document.removeEventListener('mousemove', move, true);
      document.removeEventListener('mouseup', end, true);
      document.removeEventListener('touchend', end, true);
      if (tm) { clearTimeout(tm); }
      ctx.ractive.fire('resize');
    }

    ctx.listen('mousedown', start);
    ctx.listen('touchstart', start);

    return {
      teardown: function teardown() {
        ctx.unlisten('mousedown', start);
        ctx.unlisten('touchstart', start);
        end();
      },
      update: function update(vertical) {
        vert = vertical;
        posKey = vertical ? 'screenX' : 'screenY';
      }
    };
  }

  function plugin$2(opts) {
    if ( opts === void 0 ) { opts = {}; }

    return function(ref) {
      var instance = ref.instance;

      instance.components[opts.name || 'split'] = Split;
    }
  }

  globalRegister('RMSplit', 'components', Split);

  function scrolled(node, opts) {
    if ( opts === void 0 ) { opts = {}; }

    var bind = typeof opts === 'string' ? opts : opts.bind;
    if (typeof bind !== 'string') { return { teardown: function teardown() {} }; }

    var allow = opts.allow || 2;

    var ctx = this.getContext(node);
    var pending = false;

    function watch() {
      pending = false;
      var str = '';
      if (node.scrollHeight > node.clientHeight) { str += 'vscroll'; }
      if (node.scrollWidth > node.clientWidth) { str += (str ? ' ' : '') + 'hscroll'; }

      if (node.scrollTop <= allow) { str += ' top'; }
      if (node.scrollTop >= node.scrollHeight - node.clientHeight - allow) { str += ' bottom'; }
      if (!~str.indexOf('top') && !~str.indexOf('bottom')) { str += ' vmiddle'; }

      if (node.scrollLeft <= allow) { str += ' left'; }
      if (node.scrollLeft >= node.scrollWidth - node.clientWidth - allow) { str += ' right'; }
      else if (!~str.indexOf('left') && !~str.indexOf('right')) { str += ' hmiddle'; }

      ctx.set(bind, str);
    }

    node.addEventListener('scroll', watch, { passive: true });

    requestAnimationFrame(watch);

    return {
      refresh: function refresh() {
        if (pending) { return; }
        pending = true;
        requestAnimationFrame(watch);
      },
      teardown: function teardown() {
        node.removeEventListener('scroll', watch);
        ctx.set(bind, '');
      }
    }
  }

  /** @param { HTMLElement } node  */
  function sized(node, attrs) {
    var ctx = attrs.context || this.getContext(node);
    var start = {
      position: node.style.position,
      overflowY: node.style.overflowY
    };

    if (node.style.position === '' || node.style.position === 'static') { node.style.position = 'relative'; }

    var obj = document.createElement('object');
    obj.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
    obj.setAttribute('tabindex', '-1');
    obj.type = 'text/html';

    var refresh = function () {
      if (attrs.offsetWidth) { ctx.set(attrs.offsetWidth, node.offsetWidth); }
      if (attrs.offsetHeight) { ctx.set(attrs.offsetHeight, node.offsetHeight); }
      if (attrs.clientWidth) { ctx.set(attrs.clientWidth, node.clientWidth); }
      if (attrs.clientHeight) { ctx.set(attrs.clientHeight, node.clientHeight); }
      if (attrs.diffWidth) { ctx.set(attrs.diffWidth, node.offsetWidth - node.clientWidth); }
      if (attrs.diffHeight) { ctx.set(attrs.diffHeight, node.offsetHeight - node.clientHeight); }
    };

    obj.onload = function () {
      obj.contentDocument.defaultView.addEventListener('resize', refresh);
      refresh();
    };
    
    if (/Trident/.test(navigator.userAgent)) {
      node.appendChild(obj);
      obj.data = 'about:blank';
    } else {
      obj.data = 'about:blank';
      node.appendChild(obj);
    }

    return {
      refresh: refresh,
      teardown: function teardown() {
        node.removeChild(obj);
        node.style.position = start.position;
        node.style.overflowY = start.overflowY;
      }
    }
  }

  var Tabs = /*@__PURE__*/(function (Ractive) {
    function Tabs(opts) {
      Ractive.call(this, opts);
    }

    if ( Ractive ) { Tabs.__proto__ = Ractive; }
    Tabs.prototype = Object.create( Ractive && Ractive.prototype );
    Tabs.prototype.constructor = Tabs;

    var prototypeAccessors = { selection: { configurable: true },visibleSelection: { configurable: true } };

    Tabs.prototype.addTab = function addTab (tab, idx) {
      if (!tab.template) { tab.template = []; }

      if (typeof idx === 'number') {
        this.splice('tabs', idx, 0, tab);
      } else {
        this.push('tabs', tab);
      }

      var res = new Handle(this, tab);

      if (tab.select) { this.select(res.index); }

      return res;
    };

    Tabs.prototype.getTab = function getTab (id) {
      var tabs = this.get('tabs');
      var tab = tabs.find(function (t) { return t.id === id; });
      if (tab) { return new Handle(this, tab); }
      else if (id in tabs && typeof tabs[id] === 'object') { return new Handle(this, tabs[id]); }
    };

    Tabs.prototype.updateIndicator = function updateIndicator () {
      if (!this.rendered || !this._tabs) { return; }
      var ctx = this.getContext(this.find('.rtabs-tab-window'));
      if (ctx.decorators.scrolled) { ctx.decorators.scrolled.refresh(); }
      if (this.get('@style.raui.tabs.boxy')) { return; }
      var node = this._tabs[this.get('selected')];
      if (!node || !node.offsetParent) { return; }

      if (node) {
        var start = this.get('selectedLeft');
        if (start === undefined) {
          this.set({
            selectedLeft: node.offsetLeft,
            selectedRight: node.offsetParent.clientWidth - (node.offsetLeft + node.offsetWidth)
          });
        } else {
          var max = node.offsetParent.clientWidth;
          var left = node.offsetLeft, width = node.clientWidth, right = max - left - width;

          this.set({
            direction: left < start ? 'left' : 'right',
            selectedLeft: left,
            selectedRight: right
          });
        }
      } else {
        this.set({
          selectedLeft: 0,
          selectedRight: this.find('.tabs').offsetWidth
        });
      }
    };

    Tabs.prototype.checkSelection = function checkSelection (ctx, idx) {
      if (this.get('selected') !== idx) { select.call(this, ctx, idx); }
    };

    Tabs.prototype.select = function select (idx) {
      if (idx < 0 || idx >= (this.get('tabs.length') || 0) || this._hidden(idx)) { return false; }
      this.fire('select', {}, idx);
      return true;
    };

    Tabs.prototype._hidden = function _hidden (idx) {
      var hidden = this.get(("tabs." + idx + ".hidden"));
      if (typeof hidden === 'string') { hidden = this.get(hidden); }
      return hidden;
    };

    Tabs.prototype.stopHorizontalScroll = function stopHorizontalScroll (node) {
      if (node.scrollLeft) { node.scrollLeft = 0; }
    };

    Tabs.prototype._scrollsRight = function _scrollsRight (scroll) {
      if (/hscroll.*(hmiddle|left)/.test(scroll) && !/right/.test(scroll)) { return true; }
    };

    Tabs.prototype._scrollsUp = function _scrollsUp (scroll) {
      if (/vscroll.*(vmiddle|bottom)/.test(scroll) && !/top/.test(scroll)) { return true; }
    };

    Tabs.prototype._scrollsLeft = function _scrollsLeft (scroll) {
      if (/hscroll.*(hmiddle|right)/.test(scroll) && !/left/.test(scroll)) { return true; }
    };

    Tabs.prototype._scrollsDown = function _scrollsDown (scroll) {
      if (/vscroll.*(vmiddle|top)/.test(scroll) && !/bottom/.test(scroll)) { return true; }
    };

    prototypeAccessors.selection.get = function () {
      return this.get('selected');
    };

    prototypeAccessors.visibleSelection.get = function () {
      var idx = 0;
      var tabs = this.get('tabs');
      var active = this.get('selected');
      for (var i = 0; i < tabs.length; i++) {
        var tab = tabs[i];
        if (active === i) { return idx; }
        var hidden = tab.hidden;
        if (typeof hidden === 'string') { hidden = this.get(hidden); }
        if (!hidden) { idx++; }
      }
      return idx;
    };

    Object.defineProperties( Tabs.prototype, prototypeAccessors );

    return Tabs;
  }(Ractive__default['default']));

  var tabAttrs = ['closable', 'disabled', 'title', 'right', 'button', 'no-pad', 'hidden', 'id', 'load'];

  // TODO: api handles
  Ractive__default['default'].extendWith(Tabs, {
    template: {v:4,t:[{t:7,e:"div",m:[{t:13,n:"class",f:"rtabs",g:1},{t:16,r:"extra-attributes"},{n:"class-rtabs-flat",t:13,f:[{t:2,r:"~/flat"}]},{n:"class-rtabs-margin",t:13,f:[{t:2,r:"~/margin"}]},{n:"class-rtabs-fill",t:13,f:[{t:2,r:"~/fill"}]},{n:"sized",t:71,f:{r:[],s:"[{clientWidth:\"~/clientWidth\"}]"}}],f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rtabs-tab-window-wrapper",g:1},{n:"class-rtabs-scroll-right",t:13,f:[{t:2,x:{r:["@this","~/scrollStatus"],s:"_0._scrollsRight(_1)"}}]},{n:"class-rtabs-scroll-left",t:13,f:[{t:2,x:{r:["@this","~/scrollStatus"],s:"_0._scrollsLeft(_1)"}}]}],f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rtabs-tab-window",g:1},{t:4,f:[{n:"class-rtabs-going-left",t:13}],n:50,x:{r:[".direction"],s:"_0===\"left\""}},{t:4,f:[{n:"class-rtabs-going-right",t:13}],n:51,l:1},{t:4,f:[{n:"scrolled",t:71,f:{r:[],s:"[\"~/scrollStatus\"]"}}],n:51,r:"@style.raui.tabs.noscrollindicators"}],f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rtabs-tabs",g:1}],f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rtabs-left",g:1},{n:"class-rtabs-center",t:13,f:[{t:2,r:"~/center"}]}],f:[{t:4,f:[{t:4,f:[{t:8,r:"tab"}],n:50,x:{r:[".right","@this","@index"],s:"!_0&&!_1._hidden(_2)"}}],n:52,r:".tabs"}]}," ",{t:7,e:"div",m:[{t:13,n:"class",f:"rtabs-right",g:1}],f:[{t:4,f:[{t:4,f:[{t:8,r:"tab"}],n:50,x:{r:[".right","@this","@index"],s:"_0&&!_1._hidden(_2)"}}],n:52,r:".tabs"}]}," ",{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rtabs-indicator",g:1},{n:"style-left",f:[{t:2,r:".selectedLeft"},"px"],t:13},{t:4,f:[{n:"style-right",f:[{t:2,r:".selectedRight"},"px"],t:13}],n:50,x:{r:[".selectedRight"],s:"_0!==undefined"}}]}],n:51,r:"@style.raui.tabs.boxy"}]}]}]}," ",{t:7,e:"div",m:[{t:13,n:"class",f:"rtabs-content-wrapper",g:1}],f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rtabs-content-window",g:1},{t:4,f:[{n:"class-rtabs-trans-fade",t:13}],n:50,x:{r:[".transition"],s:"_0===\"fade\""}},{t:4,f:[{n:"class-rtabs-trans-slide",t:13}],n:50,x:{r:[".transition"],s:"_0===\"slide\""},l:1},{n:["scroll"],t:70,f:{r:["@this","@node"],s:"[_0.stopHorizontalScroll(_1)]"}},{n:"class-rtab-scroll-right",t:13,f:[{t:2,x:{r:["@this","selected","tabs"],s:"_0._scrollsRight(_2[_1]&&_2[_1].scrollStatus)"}}]},{n:"class-rtab-scroll-left",t:13,f:[{t:2,x:{r:["@this","selected","tabs"],s:"_0._scrollsLeft(_2[_1]&&_2[_1].scrollStatus)"}}]},{n:"class-rtab-scroll-top",t:13,f:[{t:2,x:{r:["@this","selected","tabs"],s:"_0._scrollsUp(_2[_1]&&_2[_1].scrollStatus)"}}]},{n:"class-rtab-scroll-bottom",t:13,f:[{t:2,x:{r:["@this","selected","tabs"],s:"_0._scrollsDown(_2[_1]&&_2[_1].scrollStatus)"}}]}],f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rtabs-contents",g:1},{n:"style-opacity",f:[{t:2,r:"~/opacity"}],t:13},{n:"style-left",f:[{t:2,x:{r:[".selectedContent"],s:"_0*-100"}},"%"],t:13},{n:"class-rtabs-pad",t:13,f:[{t:2,r:"~/pad"}]}],f:[{t:4,f:[{t:8,r:"tab-content"}],n:52,r:".tabs"}]}]}]}]}],e:{"[{clientWidth:\"~/clientWidth\"}]":function (){return([{clientWidth:"~/clientWidth"}]);},"_0._scrollsRight(_1)":function (_0,_1){return(_0._scrollsRight(_1));},"_0._scrollsLeft(_1)":function (_0,_1){return(_0._scrollsLeft(_1));},"_0===\"left\"":function (_0){return(_0==="left");},"[\"~/scrollStatus\"]":function (){return(["~/scrollStatus"]);},"!_0&&!_1._hidden(_2)":function (_0,_1,_2){return(!_0&&!_1._hidden(_2));},"_0&&!_1._hidden(_2)":function (_0,_1,_2){return(_0&&!_1._hidden(_2));},"_0!==undefined":function (_0){return(_0!==undefined);},"_0===\"fade\"":function (_0){return(_0==="fade");},"_0===\"slide\"":function (_0){return(_0==="slide");},"[_0.stopHorizontalScroll(_1)]":function (_0,_1){return([_0.stopHorizontalScroll(_1)]);},"_0._scrollsRight(_2[_1]&&_2[_1].scrollStatus)":function (_0,_1,_2){return(_0._scrollsRight(_2[_1]&&_2[_1].scrollStatus));},"_0._scrollsLeft(_2[_1]&&_2[_1].scrollStatus)":function (_0,_1,_2){return(_0._scrollsLeft(_2[_1]&&_2[_1].scrollStatus));},"_0._scrollsUp(_2[_1]&&_2[_1].scrollStatus)":function (_0,_1,_2){return(_0._scrollsUp(_2[_1]&&_2[_1].scrollStatus));},"_0._scrollsDown(_2[_1]&&_2[_1].scrollStatus)":function (_0,_1,_2){return(_0._scrollsDown(_2[_1]&&_2[_1].scrollStatus));},"_0*-100":function (_0){return(_0*-100);},"_0===_1":function (_0,_1){return(_0===_1);},"_0===\"dynamic\"":function (_0){return(_0==="dynamic");},"_0!==_1":function (_0,_1){return(_0!==_1);},"_0===false":function (_0){return(_0===false);},"[_0.checkSelection((_1),_2)]":function (_0,_1,_2){return([_0.checkSelection((_1),_2)]);},"[\".scrollStatus\"]":function (){return([".scrollStatus"]);},"[\"content\",_0]":function (_0){return(["content",_0]);},"(_3===\"always\"&&_0===_1)||(_3&&_2)||!_3":function (_0,_1,_2,_3){return((_3==="always"&&_0===_1)||(_3&&_2)||!_3);},"!_0":function (_0){return(!_0);},"_0===_1&&!_2":function (_0,_1,_2){return(_0===_1&&!_2);},"typeof _1===\"string\"?_0.get(_1):_1":function (_0,_1){return(typeof _1==="string"?_0.get(_1):_1);},"[[\"select\",_0]]":function (_0){return([["select",_0]]);},"[_0.button()]":function (_0){return([_0.button()]);},"typeof _0===\"function\"":function (_0){return(typeof _0==="function");},"[\"tab\",_0]":function (_0){return(["tab",_0]);},"typeof _0===\"string\"":function (_0){return(typeof _0==="string");},"[[\"close\",_0]]":function (_0){return([["close",_0]]);},"_0&&!_1":function (_0,_1){return(_0&&!_1);}},p:{"tab-content":[{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rtabs-tab-content",g:1},{n:"class-rtabs-selected-content",t:13,f:[{t:2,x:{r:["~/selectedContent","@index"],s:"_0===_1"}}]},{n:"class-rtabs-dyna",t:13,f:[{t:2,x:{r:["~/height"],s:"_0===\"dynamic\""}}]},{n:"class-rtabs-not-selected",t:13,f:[{t:2,x:{r:["~/selectedContent","@index"],s:"_0!==_1"}}]},{t:4,f:[{t:16,r:".extra"}],n:50,r:".extra"},{t:4,f:[{n:"class-rtabs-no-pad",t:13}],n:50,x:{r:[".pad"],s:"_0===false"}},{t:4,f:[{n:"class-rtabs-no-pad",t:13,f:[{t:2,rx:{r:"~/",m:[{t:30,n:".padRef"}]}}]}],n:50,r:".padRef",l:1},{n:["focusin"],t:70,f:{r:["@this","@context","@index"],s:"[_0.checkSelection((_1),_2)]"}},{t:4,f:[{n:"scrolled",t:71,f:{r:[],s:"[\".scrollStatus\"]"}}],n:51,r:"@style.raui.tabs.noscrollindicators"},{n:"registered",t:71,f:{r:["@index"],s:"[\"content\",_0]"}}],f:[{t:4,f:[{t:16,r:".template"}],n:50,x:{r:["~/selectedContent","@index",".load","~/defer"],s:"(_3===\"always\"&&_0===_1)||(_3&&_2)||!_3"}}]}],n:50,x:{r:[".button"],s:"!_0"}},{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rtabs-placeholder",g:1}]}],n:51,l:1}],tab:[{t:7,e:"div",m:[{t:13,n:"class",f:"rtabs-tab",g:1},{n:"class-rtabs-selected",t:13,f:[{t:2,x:{r:["~/selected","@index",".button"],s:"_0===_1&&!_2"}}]},{t:4,f:[{n:"class-rtabs-disabled",t:13}],n:50,x:{r:["@this",".disabled"],s:"typeof _1===\"string\"?_0.get(_1):_1"}},{t:4,f:[{n:["click"],t:70,f:{r:["@index"],s:"[[\"select\",_0]]"}}],n:50,x:{r:[".button"],s:"!_0"},l:1},{t:4,f:[{n:["click"],t:70,f:{r:["."],s:"[_0.button()]"}}],n:50,x:{r:[".button"],s:"typeof _0===\"function\""},l:1},{n:"registered",t:71,f:{r:["@index"],s:"[\"tab\",_0]"}},{t:4,f:[{t:16,r:".extraTab"}],n:50,r:".extraTab"},{n:"data-tab-index",f:[{t:2,r:"@index"}],t:13}],f:[{t:4,f:[{t:2,r:"title"}],n:50,x:{r:[".title"],s:"typeof _0===\"string\""}},{t:4,f:[{t:16,r:".title"}],n:50,r:".title",l:1}," ",{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"rtabs-close",g:1},{n:["click"],t:70,f:{r:["@index"],s:"[[\"close\",_0]]"}}],f:["×"]}],n:50,x:{r:[".closable",".button"],s:"_0&&!_1"}}]}]}},
    cssId: 'rtab',
    noCssTransform: true,
    css: function(data) { return [(function(data) {
     var primary = Object.assign({}, data('raui.primary'), data('raui.tabs.primary'));
     primary.selected = Object.assign({}, data('raui.tabs.selected'), data('raui.tabs.primary.selected'));
     primary.indicator = Object.assign({}, data('raui.tabs.indicator'), data('raui.tabs.primary.indicator'));
     var themes = (data('raui.themes') || []).slice();
     (data('raui.tabs.themes') || []).forEach(function (t) {
       if (!~themes.indexOf(t)) { themes.push(t); }
     });
     var boxy = data('raui.tabs.boxy') || data('raui.tabs.primary.boxy');
     var bottom = ((data('raui.tabs.bottom') || 1) * 0.0625) + "em";
   
     return "\n   .rtabs {\n     position: relative;\n     display: flex;\n     flex-direction: column;\n     width: 100%;\n   }\n \n   .rtabs-tab-window {\n     overflow-y: hidden;\n     overflow-x: auto;\n     " + (!boxy ? ("box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),\n       0 1px 5px 0 rgba(0, 0, 0, 0.12),\n       0 3px 1px -2px rgba(0, 0, 0, 0.2);\n     color: " + (primary.fg || '#222') + ";\n     background-color: " + (primary.bg || '#fff') + ";") :
       ("border-color: " + (primary.bc || '#ccc') + ";\n     border-style: solid;\n     border-width: 1px 1px 0 1px;\n     color: " + (primary.fg || '#222') + ";\n     background-color: " + (primary.bga || '#f4f4f4') + ";\n     ")) + "\n     position: relative;\n     flex-shrink: 0;\n   }\n   .alt > div > .rtabs-tab-window {\n     color: " + (primary.bg || '#fff') + ";\n     background-color: " + (primary.fga || '#07e') + ";\n   }" + (boxy ? ("\n   .alt > div > .rtabs-tab-window .rtabs-tab {\n     color: " + (primary.bg || '#fff') + ";\n     background-color: " + (primary.fga || '#07e') + ";\n   }") : '') + "\n \n   .rtabs-tab-window-wrapper {\n     position: relative;\n     z-index: 10;\n   }\n \n   .rtabs-tab-window-wrapper:before,\n   .rtabs-tab-window-wrapper:after {\n     content: '';\n     position: absolute;\n     top: 0;\n     height: 100%;\n     width: " + (primary.indicator.size || '1em') + ";\n     opacity: 0;\n     z-index: 999;\n     pointer-events: none;\n   }\n   .rtabs-tab-window-wrapper:before {\n     background: linear-gradient(to right, " + (primary.indicator.highlight || primary.indicator.color || primary.fga || '#07e') + ", transparent);\n     left: 0;\n   }\n   .rtabs-tab-window-wrapper:after {\n     background: linear-gradient(to left, " + (primary.indicator.highlight || primary.indicator.color || primary.fga || '#07e') + ", transparent);\n     right: 0;\n   }\n   .rtabs-tab-window-wrapper.rtabs-scroll-right:after,\n   .rtabs-tab-window-wrapper.rtabs-scroll-left:before {\n     opacity: 0.5;\n   }\n \n   .rtabs-flat > div > .rtabs-tab-window {\n     box-shadow: none;\n     border-width: 0;\n   }\n   " + (!boxy ? (".rtabs-flat > div > .rtabs-tab-window:after {\n     content: '';\n     height: 0.15em;\n     position: absolute;\n     bottom: 0px;\n     width: 100%;\n     display: block;\n     background-color: " + (primary.bga || '#f4f4f4') + ";\n   }\n   .rtabs-flat.alt > div > .rtabs-tab-window:after {\n     background-color: " + (primary.fga || '#07e') + ";\n   }") : ("\n   .rtabs-flat > div > .rtabs-tab-window {\n     background-color: " + (primary.bg || '#fff') + ";\n   }\n   .alt.rtabs-flat > div > .rtabs-tab-window {\n     background-color: " + (primary.fga || '#07e') + ";\n   }\n   .rtabs-flat > div > .rtabs-tab-window .rtabs-tab {\n     border-top-width: 1px;\n   }")) + "\n \n   .rtabs-center.rtabs-left {\n     text-align: center;\n   }" + (boxy ? "\n   .rtabs-center > .rtabs-tab:first-child {\n     border-left-width: 1px;\n   }" : '') + "\n \n   .rtabs-pad {\n     padding: 1em;\n   }\n \n   .rtabs-fill {\n     flex-grow: 1;\n     height: 100%;\n   }\n \n   .rtabs-tabs {\n     display: table;\n     position: relative;\n     min-width: 100%;\n     white-space: nowrap;" + (boxy ? ("\n     border-style: solid;\n     border-width: 0 0 " + bottom + " 0;\n     border-color: " + (primary.bc || '#ccc') + ";\n     line-height: 1.5em;") : '') + "\n   }\n \n   .rtabs-tab {\n     display: inline-block;\n     padding: 0.5em 1em;\n     height: 1.5em;\n     transition: opacity 0.2s ease-in-out;\n     user-select: none;\n     cursor: pointer;" + (!boxy ? "\n     opacity: 0.9;" : ("\n     border-color: " + (primary.bc || '#ccc') + ";\n     border-style: solid;\n     border-width: 0 1px " + bottom + " 0;\n     margin-bottom: -" + bottom + ";\n     color: " + (primary.fg || '#222') + ";\n     background-color: " + (primary.bga || '#f4f4f4') + ";\n     ")) + "\n   }\n   .rtabs-tab:hover {\n     opacity: 1;\n   }\n \n   .rtabs-selected" + (boxy ? ",\n   .alt > div > .rtabs-tab-window .rtabs-selected" : '') + " {\n     opacity: 1;" + (boxy ? ("\n     font-weight: bold;\n     border-bottom-color: " + (primary.bg || '#fff') + ";\n     background-color: " + (primary.selected.bg || primary.bg || '#fff') + ";\n     color: " + (primary.selected.fg || primary.fg || '#222') + ";") : '') + "\n   }\n \n   .rtabs-disabled {\n     opacity: 0.4;\n   }\n \n   .rtabs-right {\n     text-align: right;\n     display: table-cell;\n   }\n \n   .rtabs-left {\n     text-align: left;\n     display: table-cell;\n   }\n \n   .rtabs-close {\n     display: inline-block;\n     margin-right: -0.5em;\n     font-weight: 700;\n     opacity: 0.3;\n     transition: opacity: 0.2s ease-in-out;\n   }\n \n   .rtabs-close:hover {\n     opacity: 1;\n   }\n \n   .rtabs-indicator {\n     position: absolute;\n     bottom: 0;\n     height: 0.15em;\n     background-color: " + (primary.indicator.color || primary.fga || '#07e') + ";\n     z-index: 2;\n   }\n \n   .alt > div > .rtabs-tab-window .rtabs-indicator {\n     background-color: " + (primary.bg || '#fff') + ";\n   }\n \n   .rtabs-going-left .rtabs-indicator {\n     transition: left 0.2s ease-in-out, right 0.2s ease-in-out 0.1s;\n   }\n   .rtabs-going-right .rtabs-indicator {\n     transition: left 0.2s ease-in-out 0.1s, right 0.2s ease-in-out;\n   }\n \n   .rtabs-content-wrapper {\n     width: 100%;\n     box-sizing: border-box;\n     display: flex;\n     flex-direction: column;\n     flex-grow: 2;\n     overflow: hidden;\n   }\n \n   .rtabs-content-window {\n     width: 100%;\n     display: flex;\n     flex-grow: 1;\n     overflow-y: auto;\n     overflow-x: hidden;\n     position: relative;\n   }\n \n   .rtabs {\n     color: " + (primary.fg || '#222') + ";\n     background-color: " + (primary.bg || '#fff') + ";\n   }\n   \n   .rtabs-contents {\n     list-style: none;\n     padding: 0;\n     margin: 0;\n     position: relative;\n     left: 0;\n     display: flex;\n     flex-wrap: nowrap;\n     white-space: nowrap;\n     width: 100%;\n   }\n   .rtabs-trans-slide > .rtabs-contents {\n     transition: left 0.2s ease-in-out;\n   }\n   .rtabs-trans-fade > .rtabs-contents {\n     transition: opacity 0.15s ease;\n     opacity: 1;\n     white-space: nowrap;\n   }\n \n   .rtabs-fill > div > div > .rtabs-contents {\n     display: flex;\n   }\n \n   .rtabs-tab-content {\n     position: relative;\n     width: 100%;\n     overflow: auto;\n     vertical-align: top;\n     white-space: initial;\n     transition: opacity 0.1s ease-in-out;\n     flex-shrink: 0;\n     white-space: initial;\n     display: flex;\n     flex-direction: column;\n     flex-grow: 1;\n   }\n \n   .rtabs-content-window:before,\n   .rtabs-content-window:after {\n     content: '';\n     display: block;\n     position: absolute;\n     z-index: 999;\n     height: " + (primary.indicator.size || '1em') + ";\n     width: 100%;\n     opacity: 0;\n     pointer-events: none;\n   }\n   .rtabs-content-window:before {\n     top: 0;\n     background: linear-gradient(to bottom, " + (primary.indicator.highlight || primary.indicator.color || primary.fga || '#07e') + ", transparent);\n   }\n   .rtabs-content-window:after {\n     bottom: 0;\n     background: linear-gradient(to top, " + (primary.indicator.highlight || primary.indicator.color || primary.fga || '#07e') + ", transparent);\n   }\n   .rtabs-content-window.rtab-scroll-top:before,\n   .rtabs-content-window.rtab-scroll-bottom:after {\n     opacity: 0.5;\n   }\n \n   .rtabs-placeholder {\n     display: inline-block;\n     width: 100%;\n     height: 1px;\n     flex-shrink: 0;\n   }\n   .rtabs-dyna.rtabs-not-selected {\n     height: 1px;\n     opacity: 0;\n     overflow: hidden;\n   }\n   .rtabs-pad > .rtabs-tab-content {\n     padding: 1em;\n     box-sizing: border-box;\n   }\n   .rtabs-pad > .rtabs-tab-content.rtabs-no-pad {\n     padding: 0;\n   }\n   .rtabs > .rtabs-tab-content.rtabs-pad {\n     padding: 1em;\n     box-sizing: border-box;\n   }\n   " + themes.map(function (t) {
       var theme = Object.assign({}, data('raui.primary'), data('raui.tabs.primary'), data(("raui." + t)), data(("raui.tabs." + t)));
       theme.selected = Object.assign({}, data('raui.tabs.selected'), data('raui.tabs.primary.selected'), data(("raui.tabs." + t + ".selected")));
       theme.indicator = Object.assign({}, data('raui.tabs.indicator'), data('raui.tabs.primary.indicator'), data(("raui.tabs." + t + ".indicator")));
       var boxy = 'boxy' in theme ? theme.boxy : data('raui.tabs.boxy');
   
       return (".rtabs." + t + " > div > .rtabs-tab-window {\n     " + (!boxy ? ("box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),\n       0 1px 5px 0 rgba(0, 0, 0, 0.12),\n       0 3px 1px -2px rgba(0, 0, 0, 0.2);\n     color: " + (theme.fg || '#222') + ";\n     background-color: " + (theme.bg || '#fff') + ";") :
       ("border-color: " + (theme.bc || '#ccc') + ";\n     color: " + (theme.fg || '#222') + ";\n     background-color: " + (theme.bga || '#f4f4f4') + ";\n     ")) + "\n   }\n   .rtabs." + t + " > .rtabs-tab-window-wrapper:before {\n     background: linear-gradient(to right, " + (theme.indicator.highlight || theme.indicator.color || theme.fga || '#07e') + ", transparent);\n   }\n   .rtabs." + t + " > .rtabs-tab-window-wrapper:after {\n     background: linear-gradient(to left, " + (theme.indicator.highlight || theme.indicator.color || theme.fga || '#07e') + ", transparent);\n   }\n   .rtabs." + t + " > .rtabs-content-wrapper > .rtabs-content-window:before {\n     background: linear-gradient(to bottom, " + (theme.indicator.highlight || theme.indicator.color || theme.fga || '#07e') + ", transparent);\n   }\n   .rtabs." + t + " > .rtabs-content-wrapper > .rtabs-content-window:after {\n     background: linear-gradient(to top, " + (theme.indicator.highlight || theme.indicator.color || theme.fga || '#07e') + ", transparent);\n   }\n   .rtabs." + t + ".alt > div > .rtabs-tab-window {\n     color: " + (theme.bg || '#fff') + ";\n     background-color: " + (theme.fga || '#07e') + ";\n   }" + (boxy ? ("\n   .rtabs." + t + ".alt > div > .rtabs-tab-window .rtabs-tab {\n     color: " + (theme.bg || '#fff') + ";\n     background-color: " + (theme.fga || '#07e') + ";\n   }") : '') + "\n \n   " + (!boxy ? (".rtabs-flat." + t + " > div > .rtabs-tab-window:after {\n     background-color: " + (theme.bga || '#f4f4f4') + ";\n   }\n   .rtabs-flat.alt." + t + " > div > .rtabs-tab-window:after {\n     background-color: " + (theme.fga || '#07e') + ";\n   }") : ("\n   .rtabs-flat." + t + " > div > .rtabs-tab-window {\n     background-color: " + (theme.bg || '#fff') + ";\n   }\n   .alt.rtabs-flat." + t + " > div > .rtabs-tab-window {\n     background-color: " + (theme.fga || '#07e') + ";\n   }")) + "\n \n   " + (boxy ? (".rtabs." + t + " > div > .rtabs-tab-window .rtabs-tabs {\n     border-color: " + (theme.bc || '#ccc') + ";\n   }") : '') + "\n \n   .rtabs." + t + " > div > .rtabs-tab-window > .rtabs-tab {\n     cursor: pointer;" + (!boxy ? '' : ("\n     border-color: " + (theme.bc || '#ccc') + ";\n     color: " + (theme.fg || '#222') + ";\n     background-color: " + (theme.bga || '#f4f4f4') + ";\n     ")) + "\n   }\n \n   .rtabs." + t + " > div > .rtabs-tab-window .rtabs-selected" + (boxy ? (",\n   .rtabs." + t + ".alt > div > .rtabs-tab-window .rtabs-selected") : '') + " {" + (boxy ? ("\n     border-bottom-color: " + (them.bg || '#fff') + ";\n     background-color: " + (theme.selected.bg || theme.bg || '#fff') + ";" + (theme.indicator ? ("\n     background-image: linear-gradient(to bottom, " + (theme.indicator.color || theme.fga || '#07e') + ", " + (theme.bg || '#fff') + " 3px);") : '') + "\n     color: " + (theme.selected.fg || theme.fg || '#222') + ";") : '') + "\n   }\n \n   .rtabs." + t + " > div > .rtabs-tab-window .rtabs-indicator {\n     background-color: " + (theme.indicator.color || theme.fga || '#07e') + ";\n   }\n \n   .rtabs." + t + ".alt > div > .rtabs-tab-window .rtabs-indicator {\n     background-color: " + (theme.bg || '#fff') + ";\n   }\n \n   .rtabs." + t + " {\n     color: " + (theme.fg || '#222') + ";\n     background-color: " + (theme.bg || '#fff') + ";\n   }\n   ");
     }).join('\n');
  }).call(this, data)].join(' '); },
    attributes: ['transition', 'flat', 'pad', 'center', 'height', 'fill', 'defer', 'selected'],
    data: function data() {
      return {
        tabs: [],
        rightTabs: [],
        selected: -1,
        selectedContent: -1,
        opacity: 1,
        scrollStatus: ''
      }
    },
    on: {
      construct: construct,
      config: function config() {
        var this$1 = this;

        if (this._ctabs) { this.set('tabs', (this.get('tabs') || []).concat(this._ctabs), { shuffle: true }); }
        this._ctabs = 0;
        var tabs = this.get('tabs');
        var xs = this.indicatorObservers = [];
        tabs.forEach(function (t) {
          if (typeof t.hidden === 'string') { xs.push(this$1.observe(t.hidden, function () { return setTimeout(function () { return this$1.updateIndicator(); }); }, { init: false, defer: true })); }
        });
        xs.push(this.observe('tabs.*.hidden', function () { return setTimeout(function () { return this$1.updateIndicator(); }); }, { init: false, defer: true }));

        this.once('render', function () {
          var sel = this$1.get('selected');
          if (sel === -1) { this$1.select(0); }
          else { this$1.set('selectedContent', sel); }
        });
      },
      select: select,
      close: close,
      teardown: function teardown() {
        this.indicatorObservers.forEach(function (o) { return o.cancel(); });
      }
    },
    observe: {
      selected: {
        handler: function handler(v) {
          var this$1 = this;

          var hidden = this._hidden(v);
          this.get('tabs');
          if (hidden) { setTimeout(function () {
            var trans = this$1.get('transition');
            this$1.set('transition', '');
            var tabs = this$1.get('tabs');
            for (var i = 0; i < tabs.length; i++) {
              var t = tabs[i];
              var h = t.hidden;
              if (typeof h === 'string') { h = this$1.get(h); }
              if (!h) {
                this$1.select(i);
                break;
              }
            }
            this$1.set('transition', trans);
          }); }
        },
        init: false
      },
      clientWidth: function clientWidth() {
        this.updateIndicator();
      }
    },
    decorators: {
      registered: function registered(node, where, idx) {
        var me = this;
        var ctx = this.getContext(node);

        if (!this._tabs) { this._tabs = []; }
        if (!this._contents) { this._contents = []; }

        this['_' + where + 's'][idx] = node;
        if (where === 'tab') { this.updateIndicator(); }
        else if (ctx.decorators.scrolled) { ctx.decorators.scrolled.refresh(); }

        return {
          teardown: function teardown() {},
          invalidate: function invalidate() {
            if (where === 'tab') { me.updateIndicator(); }
            else if (ctx.decorators.scrolled) { ctx.decorators.scrolled.refresh(); }
          },
          update: function update(idx) {
            me['_' + where + 's'][idx] = node;
            if (where === 'tab') { setTimeout(function () { return me.updateIndicator(); }); }
            else if (ctx.decorators.scrolled) { setTimeout(function () { return ctx.decorators.scrolled.refresh(); }); }
          }
        };
      },
      scrolled: scrolled, sized: sized
    }
  });

  function construct() {
    var cmp = this.component;
    if ( !cmp ) { return; }

    var tpl = cmp.template.f || [];
    var attrs = cmp.template.m ? cmp.template.m.slice() : [];
    var t = cmp.template;
    cmp.template = { e: t.e, f: t.f, t: t.t, m: attrs };

    var tabs = tpl.filter(function (n) { return n.e === 'tab'; }).map(function (t) {
      var tab = {
        template: { t: t.f.filter(function (n) { return n.e !== 'title'; }) }
      };
      var extra = [];
      var extraTab = [];

      t.m && t.m.forEach(function (a) {
        if (a.t === 13 && ~tabAttrs.indexOf(a.n)) {
          if (a.n === 'disabled' && a.f && a.f.length === 1 && a.f[0].t === 2) {
            var cnd = "_cnd" + (attrs.length);
            tab.disabled = cnd;
            attrs.push({ t: 13, n: cnd, f: a.f });
          } else if (a.n === 'no-pad') {
            if (!a.f) { tab.pad = false; }
            else if (a.f.length === 1 && a.f[0].t === 2) {
              var cnd$1 = "_cnd" + (attrs.length);
              tab.padRef = cnd$1;
              attrs.push({ t: 13, n: cnd$1, f: a.f });
            }
          } else if (a.n === 'hidden' && a.f && a.f.length === 1 && a.f[0].t === 2) {
            var cnd$2 = "_cnd" + (attrs.length);
            tab.hidden = cnd$2;
            attrs.push({ t: 13, n: cnd$2, f: a.f });
          } else {
            tab[a.n] = a.f === 0 ? true : typeof a.f === 'string' ? a.f : { t: a.f };
          }
        }
        else if (a.t === 70) { extraTab.push(a); }
        else { extra.push(a); }
      });

      var tmp;
      tmp = t.f.find(function (n) { return n.e === 'title'; });
      if (tmp) {
        tab.title = tmp.f;
        if (tmp.m) {
          extraTab.push.apply(extraTab, tmp.m);
        }
      }

      if (extra.length) { tab.extra = { t: extra }; }
      if (extraTab.length) { tab.extraTab = { t: extraTab }; }

      return tab;
    });

    this._ctabs = tabs;
  }

  function select(ctx, idx) {
    var this$1 = this;
    var obj;

    if (idx < -1 || idx >= this.get('tabs.length')) { return; }
    var current = this.get('selected');
    var trans = this.get('transition');

    if (this._fadetm) {
      this.set('opacity', 1);
      clearTimeout(this._fadetm);
      this._fadetm = 0;
    }

    if (this._contents) {
      var el = this._contents[idx];
      if (el) {
        var ctx$1 = this.getContext(el);
        if (ctx$1.decorators.scrolled) { ctx$1.decorators.scrolled.refresh(); }
      }
    }
    if (current !== idx) {
      if (this.rendered) {
        var cur = this.getContext(this.find('.rtabs-selected'));
        var window = this.find('.rtabs-content-window');
        if (~current) { this.set(("scroll." + (cur.get('@index'))), window.scrollTop); }
        if (cur.hasListener('leave')) { cur.raise('leave'); }
        if (trans === 'fade') {
          this.set({
            opacity: 0,
            selected: idx
          });
          this.updateIndicator();
          var ctx$2 = this.getContext(this.find('.rtabs-selected'));

          this._fadetm = setTimeout(function () {
            var obj;

            this$1._fadetm = 0;
            this$1.set(( obj = {
              selectedContent: idx
            }, obj[("tabs." + idx + ".load")] = true, obj.opacity = 1, obj ));
            if (ctx$2.hasListener('enter')) { ctx$2.raise('enter'); }
            if (window && ~current) { window.scrollTop = this$1.get(("scroll." + idx)) || 0; }
          }, 150);
        } else if (trans === 'slide') {
          this.set('selected', idx);
          this.set(("tabs." + idx + ".load"), true);
          this.set('selectedContent', idx);
          this.updateIndicator();
          var ctx$3 = this.getContext(this.find('.rtabs-selected'));
          if (ctx$3.hasListener('enter')) { ctx$3.raise('enter'); }
          if (window && ~current) { window.scrollTop = this.get(("scroll." + idx)) || 0; }
        } else {
          this.set(( obj = {
            selected: idx
          }, obj[("tabs." + idx + ".load")] = true, obj.selectedContent = idx, obj ));
          this.updateIndicator();
          var ctx$4 = this.getContext(this.find('.rtabs-selected'));
          if (ctx$4.hasListener('enter')) { ctx$4.raise('enter'); }
          if (window) { window.scrollTop = this.get(("scroll." + idx)) || 0; }
        }

        if (~current && window && window.scrollLeft) { window.scrollLeft = 0; }
      } else {
        this.set({
          selected: idx,
          selectedContent: idx
        });
      }
    }
  }

  function close(ctx, idx) {
    var tab = this.getContext(this._tabs[idx]);
    var ok = true;

    if (typeof tab.onclose === 'function') {
      ok = tab.onclose.call(undefined) !== false;
    }

    if (ok && tab.element.events.find(function (e) { return e.events.find(function (e) { return e.name === 'close'; }); })) {
      ok = tab.raise('close') !== false;
    }

    if (ok) { this.splice('tabs', idx, 1); }

    return false;
  }

  var Handle = function Handle(tabs, item) {
    this.tabs = tabs;
    this.item = item;
  };

  var prototypeAccessors$1 = { keypath: { configurable: true },id: { configurable: true },index: { configurable: true },title: { configurable: true },template: { configurable: true },hidden: { configurable: true },right: { configurable: true },pad: { configurable: true },disabled: { configurable: true },button: { configurable: true },closable: { configurable: true },load: { configurable: true } };

  prototypeAccessors$1.keypath.get = function () {
    if (this.removed) { return; }
    return ("tabs." + (this.index));
  };

  prototypeAccessors$1.id.get = function () { return this.get('id'); };
  prototypeAccessors$1.id.set = function (v) { this.set('id', v); };
  prototypeAccessors$1.index.get = function () { return this.tabs.get('tabs').indexOf(this.item); };

  prototypeAccessors$1.title.get = function () { return this.get('title'); };
  prototypeAccessors$1.title.set = function (v) { this.set('title', v); };

  prototypeAccessors$1.template.get = function () { return this.get('template'); };
  prototypeAccessors$1.template.set = function (v) { return this.set('template', v); };

  prototypeAccessors$1.hidden.get = function () { return this.get('hidden'); };
  prototypeAccessors$1.hidden.set = function (v) { return this.set('hidden', v); };

  prototypeAccessors$1.right.get = function () { return this.get('right'); };
  prototypeAccessors$1.right.set = function (v) { return this.set('right', v); };

  prototypeAccessors$1.pad.get = function () { return this.get('pad'); };
  prototypeAccessors$1.pad.set = function (v) { return this.set('pad', v); };

  prototypeAccessors$1.disabled.get = function () { return this.get('disabled'); };
  prototypeAccessors$1.disabled.set = function (v) { return this.set('disabled', v); };

  prototypeAccessors$1.button.get = function () { return this.get('button'); };
  prototypeAccessors$1.button.set = function (v) { return this.set('button', v); };

  prototypeAccessors$1.closable.get = function () { return this.get('closable'); };
  prototypeAccessors$1.closable.set = function (v) { return this.set('closable', v); };

  prototypeAccessors$1.load.get = function () { return this.get('load'); };
  prototypeAccessors$1.load.set = function (v) { return this.set('load', v); };

  Handle.prototype.select = function select () {
    if (this.removed) { return; }
    this.tabs.select(this.index);
  };

  Handle.prototype.remove = function remove () {
    if (this.removed) { return false; }
    this.tabs.splice('tabs', this.index, 1);
    this.removed = true;
    return true;
  };

  Handle.prototype.get = function get (keypath) {
    if (this.removed) { return false; }
    if (!keypath) { return this.tabs.get(this.keypath); }
    var key = keypath.replace(/^[\.\/]*/, '');
    return this.tabs.get(((this.keypath) + "." + key));
  };

  Handle.prototype.set = function set (keypath, value) {
    if (this.removed) { return false; }
    var key = keypath.replace(/^[\.\/]*/, '');
    return this.tabs.set(((this.keypath) + "." + key), value);
  };

  Object.defineProperties( Handle.prototype, prototypeAccessors$1 );

  function plugin$1(opts) {
    if ( opts === void 0 ) { opts = {}; }

    return function(ref) {
      var instance = ref.instance;

      instance.components[opts.name || 'tabs'] = Tabs;
    }
  }

  globalRegister('RMTabs', 'components', Tabs);

  function init$1(initOpts) {
    if ( initOpts === void 0 ) { initOpts = {}; }

    CodeMirror = initOpts.CodeMirror || window.CodeMirror;
    if (!CodeMirror) { throw new Error('CodeMirror must be provided or available globally.'); }

    if (!CodeMirror.inputStyles.password) {
      function PasswordInput(cm) {
        CodeMirror.inputStyles.textarea.call(this, cm);
      }
      var proto = PasswordInput.prototype = Object.create(CodeMirror.inputStyles.textarea.prototype);
      proto.constructor = PasswordInput;
      proto.createField = function() {
        var div = document.createElement('div');
        div.setAttribute('style', "overflow: hidden; position: relative; width: 3px; height: 0px;");
        var input = document.createElement('input');
        input.setAttribute('type', 'password');
        input.setAttribute('style', 'position: absolute; padding: 0; width: 1000px; height: 1em; outline: none; display: inline-block;');
        div.appendChild(input);
        this.wrapper = div;
        this.textarea = input;
      };
      CodeMirror.inputStyles.password = PasswordInput;
    }

    var defaultOpts = {};
    for (var k in initOpts) {
      if (k in CodeMirror.defaults) { defaultOpts[k] = initOpts[k]; }
    }

    function codemirror(node, options) {
      var ctx = this.getContext(node);
      if (typeof options === 'string') { options = { bind: options }; }
      var opts = Object.assign({}, defaultOpts, options);
      var editor, observer, lock;

      var cmOpts = {};
      for (var k in opts) { if (k in CodeMirror.defaults) { cmOpts[k] = opts[k]; } }

      if (node.nodeName.toLowerCase() === 'textarea') {
        editor = CodeMirror.fromTextArea(node, cmOpts);
      } else {
        editor = new CodeMirror(node, cmOpts);
      }

      editor.on('change', function () {
        if (observer && !lock) {
          lock = true;
          ctx.set(opts.bind, editor.getValue());
          if (ctx.hasListener('change')) {
            ctx.raise('change');
          }
          lock =false;
        }
      });

      function resize() {
        if (editor) {
          editor.display.wrapper.style.height = '20px';
          editor.display.wrapper.style.height = (editor.display.wrapper.parentNode.clientHeight) + "px";
          editor.refresh();
        }
      }
      var listener = ctx.get('@.root').on('*.resize', resize);
      window.addEventListener('resize', resize);

      function bind() {
        var cur = editor.getCursor();

        if (observer) {
          observer.cancel();
          observer = null;
        }

        if (opts.bind) {
          observer = ctx.observe(opts.bind, function (v) {
            if (!lock) {
              lock = true;
              if (editor.getValue() !== v) {
                var cur = editor.getCursor();
                editor.setValue(typeof v === 'string' ? v : '');
                editor.setCursor(cur);
              }
              lock = false;
            }
          });
        }

        // sync up the codemirror options
        for (var k in opts) {
          if (k in CodeMirror.defaults && editor.getOption(k) !== opts[k]) { editor.setOption(k, opts[k]); }
        }

        editor.setCursor(cur);
      }

      setTimeout(resize, 300);

      bind();

      return {
        editor: editor,
        resize: resize,
        focus: function focus() { editor.focus(); },
        teardown: function teardown() {
          if (observer) { observer.cancel(); }
          if (editor.toTextEditor) { editor.toTextEditor(); }
          editor = null;
          listener.cancel();
          window.removeEventListener('resize', resize);
        },
        update: function update(options) {
          if (typeof options === 'string') { options = { bind: options }; }
          opts = Object.assign({}, defaultOpts, options);
              
          bind();
        }
      };
    }

    function plugin(ref) {
      var instance = ref.instance;

      instance.decorators[initOpts.name || 'codemirror'] = codemirror;
    }

    plugin.plugin = plugin;
    plugin.codemirror = codemirror;

    return plugin;
  }

  function keys(opts) {
    if ( opts === void 0 ) { opts = {}; }

    function KeyEvent(node, fire) {
      var arguments$1 = arguments;

      var options = Object.assign({}, { keys: opts.keys }, arguments[arguments.length - 1]);
      if (arguments.length > 2) {
        options.keys = [];
        for (var i = 2; i < arguments.length; i++) {
          if (typeof arguments$1[i] === 'number') { options.keys.push(arguments$1[i]); }
        }
      }

      var ctx = Ractive__default['default'].getContext(node);

      var listener = ctx.listen('keydown', function (ev) {
        if (~options.keys.indexOf(ev.which)) {
          fire({ event: ev });
          if (options.prevent !== false) { ev.preventDefault(); }
        }
      });

      return {
        teardown: function teardown() {
          listener.cancel();
        }
      }
    }

    function plugin(ref) {
      var instance = ref.instance;

      instance.events[opts.name || 'keys'] = KeyEvent;
    }

    plugin.event = KeyEvent;

    return plugin;
  }

  globalRegister('RMKeyEvent', 'events', keys().event);

  function button(data) {
    var primary = Object.assign({}, data('raui.primary'), data('raui.button.primary'), { disabled: Object.assign({}, data('raui.primary.disabled'), data('raui.button.primary.disabled')) });
    var themes = (data('raui.themes') || []).slice();
    (data('raui.button.themes') || []).forEach(function (t) {
      if (!~themes.indexOf(t)) { themes.push(t); }
    });

    return "\n    button, .btn {\n      text-decoration: none;\n      text-align: center;\n      letter-spacing: 0.5px;\n      cursor: pointer;\n      user-select: none;\n      border: none;\n      border-radius: " + (primary.radius || '0.2em') + ";\n      padding: 0 1.25rem;\n      box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),\n        0 1px 5px 0 rgba(0, 0, 0, 0.12),\n        0 3px 1px -2px rgba(0, 0, 0, 0.2);\n      transition: 0.2s ease-in-out;\n      transition-property: box-shadow, opacity, background-color;\n      font-size: 1em;\n      line-height: 1.5em;\n      background-color: " + (primary.fga || '#07e') + ";\n      color: " + (primary.bg || '#fff') + ";\n      vertical-align: middle;\n      min-height: 2.25em;\n      outline: 0;\n      margin: 0.25em;\n      position: relative;\n      overflow: hidden;\n      -webkit-tap-highlight-color: transparent;\n      font-family: inherit;\n    }\n    button.alt, .btn.alt {\n      background-color: " + (primary.fg || '#222') + ";\n    }\n\n    button[disabled], .btn.disabled {\n      opacity: 0.7;\n      cursor: not-allowed;\n    }\n\n    button.round {\n      width: 2.2em;\n      height: 2.2em;\n      border-radius: 100%;\n      line-height: 2.2em;\n      text-align: center;\n      padding: 0;\n    }\n\n    button.flat, .btn.flat {\n      background-color: transparent;\n      color: " + (primary.fg || '#222') + ";\n      box-shadow: none;\n    }\n    button.flat.alt, .btn.flat.alt {\n      color: " + (primary.fga || '#07e') + ";\n    }\n\n    button:hover, .btn:hover {\n      opacity: 0.9;\n      box-shadow: 0 3px 3px 0 rgba(0,0,0,0.14),\n      0 1px 7px 0 rgba(0,0,0,0.12),\n      0 3px 1px -1px rgba(0,0,0,0.2);\n    }\n\n    button[disabled]:hover, .btn.disabled:hover {\n      opacity: 0.7;\n    }\n\n    button.flat:hover, .btn.flat:hover {\n      box-shadow: none;\n    }\n\n    button:after {\n      content: ' ';\n      position: absolute;\n      top: 0;\n      left: 0;\n      height: 100%;\n      width: 100%;\n      background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 2em, transparent 2.1em);\n      opacity: 0;\n      transform: scale(5, 5);\n      transition: opacity 1s ease-out, transform 0.5s ease-in;\n    }\n\n    button.flat:after {\n      background: radial-gradient(circle, rgba(0, 0, 0, 0.2) 1.5em, transparent 1.6em);\n    }\n\n    button.round:after {\n      background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0.75em, transparent 0.76em);\n    }\n\n    button.round.flat:after {\n      background: radial-gradient(circle, rgba(0, 0, 0, 0.2) 0.75em, transparent 0.76em);\n    }\n\n    button:before {\n      content: ' ';\n      position: absolute;\n      height: 100%;\n      width: 100%;\n      background-color: rgba(0, 0, 0, 0.075);\n      opacity: 0;\n      top: 0;\n      left: 0;\n      transition: opacity 0.4s ease-in-out;\n    }\n    button:focus:before {\n      opacity: 1;\n    }\n    button.flat:hover:before {\n      opacity: 0.5;\n    }\n    \n    button:active:after {\n      transform: scale(1, 1);\n      opacity: 1;\n      transition: none;\n    }\n  " + themes.map(function (t) {
      var theme = Object.assign({}, primary, data(("raui." + t)), data(("raui.button." + t)), { disabled: Object.assign({}, primary.disabled, data(("raui." + t + ".disabled")), data(("raui.button." + t + ".disabled")))});
      return (".btn." + t + ", button." + t + " {\n      background-color: " + (theme.fga || '#07e') + ";\n      color: " + (theme.bg || '#fff') + ";\n    }\n    button." + t + ".alt, .btn." + t + ".alt {\n      background-color: " + (theme.fg || '#222') + ";\n    }\n    .btn.flat." + t + ", button.flat." + t + " {\n      background-color: " + (theme.bg || '#fff') + ";\n      color: " + (theme.fg || '#222') + ";\n    }\n    button.flat." + t + ".alt, .btn.flat." + t + ".alt {\n      color: " + (theme.fga || '#07e') + ";\n    }\n    ");
    }).join('');
  }

  function plugin() {
    return function(ref) {
      var instance = ref.instance;
      var Ractive = ref.Ractive;

      if (instance === Ractive || Ractive.isInstance(instance)) {
        Ractive.addCSS('raui-button', button);
      } else {
        var css = instance.css;
        instance.css = function(data) {
          var res = typeof css === 'string' ? css : typeof css === 'function' ? css(data) : '';
          return res + button(data);
        };
      }
    };
  }

  function reducePromiseFunctions(fnList, init) {
    if (!fnList || !fnList.length) { return Promise.resolve(init); }
    var fns = fnList.slice();
    var res = init;

    return new Promise(function (done, fail) {
      function step() {
        var fn = fns.shift();
        if (!fn) { done(res); }
        else {
          Promise.resolve(
            Promise.resolve(fn(res)).then(function (r) {
              res = r;
              step();
            }, fail)
          );
        }
      }
      step();
    });
  }

  // https://gist.github.com/mathiasbynens/1243213
  function escape(string) {
    return string.replace(/[^]/g, function (char) {
      var code = char.charCodeAt();

      if (code < 256) { return char; }

      var escape = code.toString(16);
      var long = escape.length > 2;
      return ("\\" + (long ? 'u' : 'x') + (('0000' + escape).slice(long ? -4 : -2)));
    });
  }

  var ident = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
  function safeKey(string) {
    if (ident.test(string)) { return string; }
    else { return JSON.stringify(string); }
  }

  function stringify(tpl, opts) {
    var result;

    if (tpl.e) {
      var str = '{';
      var i = 0;
      for (var k in tpl) {
        if (i++ > 0) { str += ','; }
        if (k === 'e') {
          str += 'e:{';
          var i$1 = 0;
          for (var k$1 in tpl.e) {
            if (i$1++ > 0) { str += ','; }
            str += (JSON.stringify(k$1)) + ":" + (tpl.e[k$1].toString());
          }
          str += '}';
        } else {
          str += (safeKey(k)) + ":" + (toString(tpl[k], opts));
        }
      }
      result = str + '}';
    } else {
      result = toString(tpl, opts);
    }

    if (opts && opts.escapeUnicode) { result = escape(result); }

    return result;
  }

  function toString(thing, opts) {
    if (Array.isArray(thing)) {
      return '[' + thing.map(function (v) { return toString(v, opts); }).join(',') + ']';
    } else if (typeof thing === 'object') {
      var str = '{';
      var trail = false;
      for (var k in thing) {
        if (thing[k] === undefined) { continue; }
        if (trail) { str += ','; }
        str += safeKey(k) + ':' + stringify(thing[k], opts);
        trail = true;
      }
      str += '}';
      return str;
    } else {
      return JSON.stringify(thing);
    }
  }

  function build$1(string, opts, readFile) {
    var rootOpts = Object.create(opts);
    rootOpts.interpolate = Object.assign({}, opts.interpolate, {
      script: false,
      style: false,
      template: false
    });
    var tpl = opts.Ractive.parse(string, rootOpts);
    var partials = {};
    var script = [];
    var style = [];

    var promises = [];

    // walk the template finding any script, style, or link tags to process them as appropriate
    var i = tpl.t.length;
    while (i--) {
      var item = tpl.t[i];
      // top-level elements
      if (item.t === 7) {
        if (item.e === 'script') {
          var type = getAttr('type', item);
          var id = getAttr('id', item) || getAttr('name', item);
          var src = getAttr('src', item);

          if (id && (type === 'text/ractive' || type === 'text/html')) {
            if (!src) {
              partials[id] = item.f[0];
            } else {
              promises.push(readFile(src).then(function (str) { return (partials[id] = str); }));
            }
          } else if (!type || type === 'text/javascript' || type === 'application/javascript') {
            var rel = getAttr('rel', item);
            var cssFn = (void 0);

            if (rel === 'css') {
              var name = getAttr('data-name', item) || 'data';
              cssFn = { name: name, type: 'fn' };
              style.unshift(cssFn);
            }

            if (!src) {
              if (cssFn) {
                cssFn.body = item.f.join('');
              } else {
                script.unshift(item.f);
              }
            } else {
              if (cssFn) {
                promises.push(readFile(src).then(function (str) { return (cssFn.body = str); }));
              } else {
                script.unshift(("script!" + src));
                promises.push(
                  readFile(src).then(function (str) { return script.splice(script.indexOf(("script!" + src)), 1, str); })
                );
              }
            }
          }

          i = drop(i, tpl.t);
        } else if (item.e === 'template') {
          var id$1 = getAttr('id', item) || getAttr('name', item);
          if (id$1) {
            partials[id$1] = item.f ? item.f[0] : '';
          }

          i = drop(i, tpl.t);
        } else if (item.e === 'style') {
          var rel$1 = getAttr('rel', item);

          if (rel$1 === 'ractive') {
            style.unshift({ type: 'tpl', body: item.f[0] });
          } else {
            style.unshift({ type: 'css', body: item.f[0] || '' });
          }

          i = drop(i, tpl.t);
        } else if (item.e === 'link') {
          var href = getAttr('href', item);
          var type$1 = getAttr('type', item);
          var rel$2 = getAttr('rel', item);

          if (
            href &&
            (type$1 === 'component' ||
              ((!type$1 || type$1 === 'text/css' || type$1 === 'text/css+ractive') &&
                (rel$2 === 'ractive' || rel$2 === 'component')))
          ) {
            var css = { type: type$1 === 'text/css+ractive' ? 'tpl' : 'css' };
            style.unshift(css);
            promises.push(readFile(href).then(function (str) { return (css.body = str); }));
            // only links that are consumed are removed
            i = drop(i, tpl.t);
          }
        }
      }
    }

    return Promise.all(promises).then(function () {
      script = dedent(script.join(''));

      if (!script && opts.autoExport)
        { script = "" + (tpl ? "export const template = $TEMPLATE;\n" : '') + (style.length ? "export const css = $CSS;\n" : ''); }

      for (var k in partials) {
        if (!tpl.p) { tpl.p = {}; }

        // just in case, don't overwrite any existing partial and skip empty partials
        if (tpl.p[k] || !partials[k]) { continue; }

        var t = opts.Ractive.parse(partials[k], opts);

        // copy any expressions
        if (t.e) {
          if (!tpl.e) { tpl.e = {}; }
          for (var e in t.e) { tpl.e[e] = t.e[e]; }
        }

        // copy any partials
        if (t.p) {
          for (var p in t.p) {
            if (!tpl.p[p]) { tpl.p[p] = t.p[p]; }
          }
        }

        tpl.p[k] = t.t;
      }

      return Promise.all([
        compileCss(style, opts),
        reducePromiseFunctions(opts.partialProcessors, partials),
        reducePromiseFunctions(opts.templateProcessors, tpl)
      ]).then(function (list) {
        script = script.replace(/\$TEMPLATE/g, stringify(list[2], opts));
        script = script.replace(/\$CSS/g, list[0]);
        script = script.replace(/\$PARTIALS\['([-a-zA-Z0-9_\/]+)'\]/g, function (m, n) { return stringify({ v: list[2].v, t: list[2].p[n] || '' }, opts); }
        );
        script = script.replace(/\$PARTIALS/g, stringify(list[2].p || {}, opts));

        return reducePromiseFunctions(opts.scriptProcessors, script);
      });
    });
  }

  function dedent(string) {
    var lines = string.split(/\r\n|\r|\n/);
    var strip = /^\s*/.exec(lines[lines.length - 1]);
    if (!strip) { return string; }
    strip = strip[0];
    return lines.map(function (l) { return l.replace(strip, ''); }).join('\n');
  }

  var blank = /^\s*$/;
  function drop(i, tpl) {
    tpl.splice(i, 1);
    while (blank.test(tpl[i])) { tpl.splice(i, 1); }
    var restart = i--;
    while (blank.test(tpl[i])) {
      tpl.splice(i, 1);
      restart--;
    }
    return restart;
  }

  function getAttr(name, node) {
    if (node.m) {
      var i = node.m.length;
      while (i--) {
        var a = node.m[i];
        // plain attribute with a matching name
        if (a.t === 13 && a.n === name && typeof a.f === 'string') { return a.f; }
      }
    }
  }

  function compileCss(styles, opts) {
    if (!styles.length || !styles.join('')) { return Promise.resolve('""'); }

    var promises = [];

    styles.forEach(function (style) {
      if (style.type === 'tpl') {
        var styleOpts = Object.create(opts);
        styleOpts.textOnlyMode = true;
        style.compiled = "(function () { return this.Ractive({ template: " + (stringify(
          opts.Ractive.parse(style.body, styleOpts),
          opts
        )) + ", data: this.cssData }).fragment.toString(false); }).call(this)";
      } else if (style.type === 'fn') {
        var indent = /^\s/.exec(style.body);
        if (indent) { indent = indent[0]; }
        else { indent = '  '; }
        style.compiled = "(function(" + (style.name || 'data') + ") {\n" + (style.body
          .split(/\r\n|\r|\n/)
          .map(function (l) { return indent + l; })
          .join('\n')) + "\n}).call(this, data)";
      } else {
        promises.push(
          reducePromiseFunctions(opts.styleProcessors, style.body).then(
            function (css) { return (style.compiled = css.replace(/\s+/g, ' ')); }
          )
        );
      }
    });

    return Promise.all(promises).then(function () {
      var fn = styles.find(function (style) { return style.type === 'tpl' || style.type === 'fn'; });

      if (!fn) { return JSON.stringify(styles.map(function (style) { return style.compiled; }).join(' ')); }

      return ("function(data) { return [" + (styles
        .map(function (style) { return (style.type === 'css' ? JSON.stringify(style.compiled) : style.compiled); })
        .join(', ')) + "].join(' '); }");
    });
  }

  var ractives = {};
  function getRactive(version) {
    if (!ractives[version]) {
      var main = Ractive.noConflict();
      var script = document.createElement('script');
      script.src = "//cdn.jsdelivr.net/npm/ractive@" + version;
      document.querySelector('head').appendChild(script);
      var ok;
      var promise = new Promise(function (cb) {
        ok = cb;
      });

      function done() {
        ractives[version] = Ractive.noConflict();
        Ractive = main;
        ok(ractives[version]);
      }

      script.onload = done;
      script.onreadystatechange = function() {
        if (this.readyState === 'complete') { done(); }
      };

      return promise;
    }
    else { return Promise.resolve(ractives[version]); }
  }

  var filter = /\.ractive\.html$/;
  var RollupPlugin = {
    name: 'ractive-bin',
    transform: function transform(code, id) {
      if (!filter.test(id)) { return null; }
      return getRactive(app.get('unit.h.r') || window.Ractive).then(function (Ractive) {
        return build$1(code, { Ractive: Ractive, autoExport: true }, function () { return Promise.reject('nope, lol'); }).then(function (res) {
          return { code: res, map: { mappings: '' } };
        });
      });
    }
  };

  var CDN = '//cdn.jsdelivr.net/npm';
  var ext = /\.[a-zA-Z0-9]$/;

  var cache = {};

  function getScript(app, id) {
    if (!app.get('other.cacheBust') && cache[id]) {
      if (cache[id] === 404) { return Promise.reject(("Module " + id + " not found")); }
      else { return cache[id]; }
    }
    console.info(("fetching npm module " + id));
    var bust = app.get('other.cacheBust') ? ("?" + (Date.now())) : '';
    return fetch((CDN + "/" + id + bust)).then(function (r) {
      if (r.status > 299) {
        if (!ext.test(id)) { return fetch((CDN + "/" + id + ".js" + bust)).then(function (r) {
          if (r.status > 299) { throw new Error(("Module " + id + " not found")); }
          else { return r.text(); }
        }); }
        else { throw new Error(("Module " + id + " not found")); }
      } else { return r.text(); }
    }).then(function (t) {
      cache[id] = t;
      return t;
    }, function (e) {
      cache[id] = 404;
      throw e;
    });
  }

  function cdnResolve(app) {
    return {
      name: 'cdn-resolve',
      resolveId: function resolveId(target, unit) {
        if (!unit) { return ("/" + target); }
        if (target[0] !== '.' && target[0] !== '/') {
          return target;
        }
        else {
          var start = unit.split('/');
          start.pop();
          var tgt = target.split('/');
          if (tgt[0] === '.') { tgt.shift(); }
          while (start.length && tgt[0] === '..') {
            start.pop();
            tgt.shift();
          }
          return ("" + (start.concat(tgt).join('/')));
        }
      },
      load: function load(id) {
        if (id[0] === '/') {
          var name = id.slice(1);
          var files = app.get('unit.fs');
          var file = files.find(function (f) { return f.name === name || (!ext.test(name) && f.name === (name + ".js")); });
          if (file) { return file.content; }
        }
        if (id[0] !== '/' && id[0] !== '.' && id[0] !== '\0') { return getScript(app, id); }
        if (id === '\0commonjsHelpers') { return "\n  export var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};\n  export function commonjsRequire () {\n  throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');\n  }\n  export function unwrapExports (x) {\n  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;\n  }\n  export function createCommonjsModule(fn, module) {\n  return module = { exports: {} }, fn(module, module.exports), module.exports;\n  }"; }
        if (id === '/bar.js') { return "module.exports = 'something';"; }
        return '';
      }
    }
  }

  var outOpts = {
    format: 'iife',
    globals: {}
  };

  function build(app, entry) {
    var opts = {
      input: entry,
      plugins: [cdnResolve(app), RollupPlugin, RollupPluginCommonJS()],
      external: (app.get('unit.gs') || []).map(function (o) { return o.key; }).concat(['ractive'])
    };

    return rollup.rollup(opts).then(function (bundle) {
      outOpts.globals = Object.assign({}, { ractive: 'Ractive' });
      (app.get('unit.gs') || []).forEach(function (o) { return outOpts.globals[o.key] = o.value; });

      return bundle.generate(outOpts).then(function (res) {
        return res.code;
      });
    }, function (e) {
      var err = JSON.stringify((e.message ? ((e.message) + "\n\n") : '') + e.stack);
      err = err.substr(1, err.length - 2);
      return ("const div = document.createElement('div');\ndiv.innerHTML = `<h1>Error building script:</h1><code><pre style=\"white-space: pre-wrap; word-break: break-all;\">" + err + "</pre></code>`;\ndiv.setAttribute('style', 'position: absolute; top: 0; bottom: 0; left: 0; right: 0; padding: 2em; border: 1px solid red; color: red; background-color: rgba(255, 0, 0, 0.1); box-sizing: border-box; overflow: auto;');\ndocument.body.appendChild(div);\ndocument.body.style.margin = 0;\ndocument.body.style.padding = 0;\n");
    });
  }

  var outputFrame = document.createElement('iframe');
  outputFrame.className = 'output';

  var consoleRedirect = "\n<" + ('') + "script>(function() {\nvar csl = console.log, csw = console.warn; cse = console.error; csi = console.info || console.log;\nfunction proxy(fn, type) {\n  return function() {\n    var args = Array.prototype.slice.call(arguments);\n    try {\n      window.parent.postMessage({ log: args.map(a => {\n        if (!a) return a === undefined ? 'undefined' : JSON.stringify(a);\n        else if (typeof a === 'string' || typeof a === 'number' || typeof a === 'boolean') return a;\n        else if (typeof a === 'function') return a.toString();\n        else if (a.stack) return a.stack;\n        else if (typeof a === 'object') return JSON.stringify(a, null, '  ');\n        else return '???';\n      }), type: type }, '*');\n    } catch (e) {\n      window.parent.postMessage({ log: ['Failed to proxy message from output console.', e.message], type: 'error' }, '*');\n    }\n    fn.apply(console, args);\n  };\n}\n\nconsole.log = proxy(csl, 'log');\nconsole.warn = proxy(csw, 'warn');\nconsole.error = proxy(cse, 'error');\nconsole.info = proxy(csi, 'info');\nvar result = proxy(csl, 'result');\n\nwindow.addEventListener('message', function(ev) {\n  if (ev.data.eval) {\n    try {\n      result(eval(ev.data.eval));\n    } catch (e) {\n      console.error(e.stack);\n    }\n  } else if (ev.data.reload) {\n    window.location.reload();\n  }\n});\n\nwindow.onerror = function(message, source, line, col, err) { console.error(message, err); }\n})();\n//# sourceURL=util.js\n<" + ('') + "/script>";

  function play(ctx, opts) {
    var this$1 = this;

    var unit = (opts && opts.init) ? {} : this.get('unit');
    var render;

    if (!unit.m) {
      var tpl = unit.t;
      if (!tpl && !unit.s && !unit.c) { tpl = "<style>html { height: 100%; } body { display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ccc; padding: 2em; margin: 0; height: 100%; box-sizing: border-box; text-align: center; }</style><h1>Output</h1><h3>Click the play button in the upper-left corner to run</h3>"; }
      var scripts = ((unit.h || {}).s || []).map(function(s) { return ("\n\t\t<" + ('') + "script src=\"" + s + "\"><" + ('') + "/script>"); }).join('');
      if (unit.h && unit.h.r) { scripts = "\n\t\t<" + ('') + "script src=\"//cdn.jsdelivr.net/npm/ractive@" + (unit.h.r) + "/ractive.js" + (this.get('other.cacheBust') ? ("?" + (+new Date())) : '') + "\"><" + ('') + "/script>" + scripts; }
      scripts += consoleRedirect;
      var ev = unit.e ? ("<" + ('') + "script>" + (unit.e) + "\n//# sourceURL=eval.js\n<" + ('') + "/script>\n") : '';
      if (ev) { delete unit.e; }
      var html = Promise.resolve(("<!DOCTYPE html>\n  <html>\n  <head>\n  <title>Ractive Playground Output</title>\n  <style>" + (unit.c || '') + "\n  /*# sourceURL=style.css */\n  </style>" + scripts + "\n  </head>\n  <body>\n  " + ((tpl || '').replace(/\n/g, '\n\t\t')) + "\n  <" + ('') + "script>" + (unit.s || '') + "\n  //# sourceURL=script.js\n  <" + ('') + "/script>\n  " + ev + "\n  </body>\n  </html>"));

      render = html;
    } else if (unit.m === 1) {
      var files = this.get('unit.fs');
      var entry = this.get('unit.ef') || 'index.ractive.html';
      var index = files.find(function (f) { return f.name === entry; });
      if (index) {
        render = build(this, entry).then(function (src) {
          return ("<!DOCTYPE html>\n<html>\n<head>\n<title>Ractive Playground Output</title>\n" + consoleRedirect + "\n" + (unit.h && unit.h.r ? ("<" + ('') + "script src=\"//cdn.jsdelivr.net/npm/ractive@" + (unit.h.r) + "/ractive.js" + (this$1.get('other.cacheBust') ? ("?" + (+new Date())) : '') + "\"><" + ('') + "/script>\n") : '') + "\n" + (unit.h && unit.h.s ? unit.h.s.map(function (s) { return ("<" + ('') + "script src=\"" + s + "\"><" + ('') + "/script>"); }).join('\n') : '') + "\n</head>\n<body>\n<" + ('') + "script>" + src + "\n//# sourceURL=script.js\n<" + ('') + "/script>\n</body>\n</html>");
        });
      }
    }

    if (render && render.then) {
      render.then(function (html) {
        if (outputFrame.contentWindow) {
          { outputFrame.contentWindow.location = 'about:blank'; }

          function load() {
            outputFrame.removeEventListener('load', load);
            var doc = outputFrame.contentDocument;
            doc.open();
            doc.write(html);
            doc.close();
          }
          outputFrame.addEventListener('load', load);

          var tab = document.querySelector('[data-output-tab]');
          if ((!opts || !opts.init) && tab) {
            Ractive.getContext(tab).ractive.select(+tab.getAttribute('data-output-tab'));
          }
        }
      });
    }
  }

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
  }

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = freeGlobal || freeSelf || Function('return this')();

  /**
   * Gets the timestamp of the number of milliseconds that have elapsed since
   * the Unix epoch (1 January 1970 00:00:00 UTC).
   *
   * @static
   * @memberOf _
   * @since 2.4.0
   * @category Date
   * @returns {number} Returns the timestamp.
   * @example
   *
   * _.defer(function(stamp) {
   *   console.log(_.now() - stamp);
   * }, _.now());
   * // => Logs the number of milliseconds it took for the deferred invocation.
   */
  var now = function() {
    return root.Date.now();
  };

  /** Used to match a single whitespace character. */
  var reWhitespace = /\s/;

  /**
   * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
   * character of `string`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {number} Returns the index of the last non-whitespace character.
   */
  function trimmedEndIndex(string) {
    var index = string.length;

    while (index-- && reWhitespace.test(string.charAt(index))) {}
    return index;
  }

  /** Used to match leading whitespace. */
  var reTrimStart = /^\s+/;

  /**
   * The base implementation of `_.trim`.
   *
   * @private
   * @param {string} string The string to trim.
   * @returns {string} Returns the trimmed string.
   */
  function baseTrim(string) {
    return string
      ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, '')
      : string;
  }

  /** Built-in value references. */
  var Symbol = root.Symbol;

  /** Used for built-in method references. */
  var objectProto$1 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto$1.hasOwnProperty;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString$1 = objectProto$1.toString;

  /** Built-in value references. */
  var symToStringTag$1 = Symbol ? Symbol.toStringTag : undefined;

  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag$1),
        tag = value[symToStringTag$1];

    try {
      value[symToStringTag$1] = undefined;
      var unmasked = true;
    } catch (e) {}

    var result = nativeObjectToString$1.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag$1] = tag;
      } else {
        delete value[symToStringTag$1];
      }
    }
    return result;
  }

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString = objectProto.toString;

  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */
  function objectToString(value) {
    return nativeObjectToString.call(value);
  }

  /** `Object#toString` result references. */
  var nullTag = '[object Null]',
      undefinedTag = '[object Undefined]';

  /** Built-in value references. */
  var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return (symToStringTag && symToStringTag in Object(value))
      ? getRawTag(value)
      : objectToString(value);
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return value != null && typeof value == 'object';
  }

  /** `Object#toString` result references. */
  var symbolTag = '[object Symbol]';

  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
  function isSymbol(value) {
    return typeof value == 'symbol' ||
      (isObjectLike(value) && baseGetTag(value) == symbolTag);
  }

  /** Used as references for various `Number` constants. */
  var NAN = 0 / 0;

  /** Used to detect bad signed hexadecimal string values. */
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

  /** Used to detect binary string values. */
  var reIsBinary = /^0b[01]+$/i;

  /** Used to detect octal string values. */
  var reIsOctal = /^0o[0-7]+$/i;

  /** Built-in method references without a dependency on `root`. */
  var freeParseInt = parseInt;

  /**
   * Converts `value` to a number.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to process.
   * @returns {number} Returns the number.
   * @example
   *
   * _.toNumber(3.2);
   * // => 3.2
   *
   * _.toNumber(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toNumber(Infinity);
   * // => Infinity
   *
   * _.toNumber('3.2');
   * // => 3.2
   */
  function toNumber(value) {
    if (typeof value == 'number') {
      return value;
    }
    if (isSymbol(value)) {
      return NAN;
    }
    if (isObject(value)) {
      var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
      value = isObject(other) ? (other + '') : other;
    }
    if (typeof value != 'string') {
      return value === 0 ? value : +value;
    }
    value = baseTrim(value);
    var isBinary = reIsBinary.test(value);
    return (isBinary || reIsOctal.test(value))
      ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
      : (reIsBadHex.test(value) ? NAN : +value);
  }

  /** Error message constants. */
  var FUNC_ERROR_TEXT = 'Expected a function';

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax = Math.max,
      nativeMin = Math.min;

  /**
   * Creates a debounced function that delays invoking `func` until after `wait`
   * milliseconds have elapsed since the last time the debounced function was
   * invoked. The debounced function comes with a `cancel` method to cancel
   * delayed `func` invocations and a `flush` method to immediately invoke them.
   * Provide `options` to indicate whether `func` should be invoked on the
   * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
   * with the last arguments provided to the debounced function. Subsequent
   * calls to the debounced function return the result of the last `func`
   * invocation.
   *
   * **Note:** If `leading` and `trailing` options are `true`, `func` is
   * invoked on the trailing edge of the timeout only if the debounced function
   * is invoked more than once during the `wait` timeout.
   *
   * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
   * until to the next tick, similar to `setTimeout` with a timeout of `0`.
   *
   * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
   * for details over the differences between `_.debounce` and `_.throttle`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to debounce.
   * @param {number} [wait=0] The number of milliseconds to delay.
   * @param {Object} [options={}] The options object.
   * @param {boolean} [options.leading=false]
   *  Specify invoking on the leading edge of the timeout.
   * @param {number} [options.maxWait]
   *  The maximum time `func` is allowed to be delayed before it's invoked.
   * @param {boolean} [options.trailing=true]
   *  Specify invoking on the trailing edge of the timeout.
   * @returns {Function} Returns the new debounced function.
   * @example
   *
   * // Avoid costly calculations while the window size is in flux.
   * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
   *
   * // Invoke `sendMail` when clicked, debouncing subsequent calls.
   * jQuery(element).on('click', _.debounce(sendMail, 300, {
   *   'leading': true,
   *   'trailing': false
   * }));
   *
   * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
   * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
   * var source = new EventSource('/stream');
   * jQuery(source).on('message', debounced);
   *
   * // Cancel the trailing debounced invocation.
   * jQuery(window).on('popstate', debounced.cancel);
   */
  function debounce(func, wait, options) {
    var lastArgs,
        lastThis,
        maxWait,
        result,
        timerId,
        lastCallTime,
        lastInvokeTime = 0,
        leading = false,
        maxing = false,
        trailing = true;

    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    wait = toNumber(wait) || 0;
    if (isObject(options)) {
      leading = !!options.leading;
      maxing = 'maxWait' in options;
      maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }

    function invokeFunc(time) {
      var args = lastArgs,
          thisArg = lastThis;

      lastArgs = lastThis = undefined;
      lastInvokeTime = time;
      result = func.apply(thisArg, args);
      return result;
    }

    function leadingEdge(time) {
      // Reset any `maxWait` timer.
      lastInvokeTime = time;
      // Start the timer for the trailing edge.
      timerId = setTimeout(timerExpired, wait);
      // Invoke the leading edge.
      return leading ? invokeFunc(time) : result;
    }

    function remainingWait(time) {
      var timeSinceLastCall = time - lastCallTime,
          timeSinceLastInvoke = time - lastInvokeTime,
          timeWaiting = wait - timeSinceLastCall;

      return maxing
        ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
        : timeWaiting;
    }

    function shouldInvoke(time) {
      var timeSinceLastCall = time - lastCallTime,
          timeSinceLastInvoke = time - lastInvokeTime;

      // Either this is the first call, activity has stopped and we're at the
      // trailing edge, the system time has gone backwards and we're treating
      // it as the trailing edge, or we've hit the `maxWait` limit.
      return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
        (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
    }

    function timerExpired() {
      var time = now();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      // Restart the timer.
      timerId = setTimeout(timerExpired, remainingWait(time));
    }

    function trailingEdge(time) {
      timerId = undefined;

      // Only invoke if we have `lastArgs` which means `func` has been
      // debounced at least once.
      if (trailing && lastArgs) {
        return invokeFunc(time);
      }
      lastArgs = lastThis = undefined;
      return result;
    }

    function cancel() {
      if (timerId !== undefined) {
        clearTimeout(timerId);
      }
      lastInvokeTime = 0;
      lastArgs = lastCallTime = lastThis = timerId = undefined;
    }

    function flush() {
      return timerId === undefined ? result : trailingEdge(now());
    }

    function debounced() {
      var time = now(),
          isInvoking = shouldInvoke(time);

      lastArgs = arguments;
      lastThis = this;
      lastCallTime = time;

      if (isInvoking) {
        if (timerId === undefined) {
          return leadingEdge(lastCallTime);
        }
        if (maxing) {
          // Handle invocations in a tight loop.
          clearTimeout(timerId);
          timerId = setTimeout(timerExpired, wait);
          return invokeFunc(lastCallTime);
        }
      }
      if (timerId === undefined) {
        timerId = setTimeout(timerExpired, wait);
      }
      return result;
    }
    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced;
  }

  function settings(app) {
    if (window.localStorage) {
      var start = window.localStorage.getItem(("ractive-playground-settings" + (app.env ? ("[" + (app.env) + "]") : '')));

      if (start) { app.set('settings', JSON.parse(start)); }
      else { app.set('settings.editor', { autoTag: true, autoBracket: true, highlightActive: true, wrap: true }, { deep: true }); }

      app.observe('settings', debounce(function(value) {
          window.localStorage.setItem(("ractive-playground-settings" + (app.env ? ("[" + (app.env) + "]") : '')), JSON.stringify(value));
      }, 3000), { init: false });

      app.set('other.mobile', app.get('settings.editor.mobile'));
    } else {
      app.set('settings.editor', { autoTag: true, autoBracket: true, highlightActive: true, wrap: true }, { deep: true });
    }
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var lzString = createCommonjsModule(function (module) {
  // Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
  // This work is free. You can redistribute it and/or modify it
  // under the terms of the WTFPL, Version 2
  // For more information see LICENSE.txt or http://www.wtfpl.net/
  //
  // For more information, the home page:
  // http://pieroxy.net/blog/pages/lz-string/testing.html
  //
  // LZ-based compression algorithm, version 1.4.4
  var LZString = (function() {

  // private property
  var f = String.fromCharCode;
  var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
  var baseReverseDic = {};

  function getBaseValue(alphabet, character) {
    if (!baseReverseDic[alphabet]) {
      baseReverseDic[alphabet] = {};
      for (var i=0 ; i<alphabet.length ; i++) {
        baseReverseDic[alphabet][alphabet.charAt(i)] = i;
      }
    }
    return baseReverseDic[alphabet][character];
  }

  var LZString = {
    compressToBase64 : function (input) {
      if (input == null) { return ""; }
      var res = LZString._compress(input, 6, function(a){return keyStrBase64.charAt(a);});
      switch (res.length % 4) { // To produce valid Base64
      default: // When could this happen ?
      case 0 : return res;
      case 1 : return res+"===";
      case 2 : return res+"==";
      case 3 : return res+"=";
      }
    },

    decompressFromBase64 : function (input) {
      if (input == null) { return ""; }
      if (input == "") { return null; }
      return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrBase64, input.charAt(index)); });
    },

    compressToUTF16 : function (input) {
      if (input == null) { return ""; }
      return LZString._compress(input, 15, function(a){return f(a+32);}) + " ";
    },

    decompressFromUTF16: function (compressed) {
      if (compressed == null) { return ""; }
      if (compressed == "") { return null; }
      return LZString._decompress(compressed.length, 16384, function(index) { return compressed.charCodeAt(index) - 32; });
    },

    //compress into uint8array (UCS-2 big endian format)
    compressToUint8Array: function (uncompressed) {
      var compressed = LZString.compress(uncompressed);
      var buf=new Uint8Array(compressed.length*2); // 2 bytes per character

      for (var i=0, TotalLen=compressed.length; i<TotalLen; i++) {
        var current_value = compressed.charCodeAt(i);
        buf[i*2] = current_value >>> 8;
        buf[i*2+1] = current_value % 256;
      }
      return buf;
    },

    //decompress from uint8array (UCS-2 big endian format)
    decompressFromUint8Array:function (compressed) {
      if (compressed===null || compressed===undefined){
          return LZString.decompress(compressed);
      } else {
          var buf=new Array(compressed.length/2); // 2 bytes per character
          for (var i=0, TotalLen=buf.length; i<TotalLen; i++) {
            buf[i]=compressed[i*2]*256+compressed[i*2+1];
          }

          var result = [];
          buf.forEach(function (c) {
            result.push(f(c));
          });
          return LZString.decompress(result.join(''));

      }

    },


    //compress into a string that is already URI encoded
    compressToEncodedURIComponent: function (input) {
      if (input == null) { return ""; }
      return LZString._compress(input, 6, function(a){return keyStrUriSafe.charAt(a);});
    },

    //decompress from an output of compressToEncodedURIComponent
    decompressFromEncodedURIComponent:function (input) {
      if (input == null) { return ""; }
      if (input == "") { return null; }
      input = input.replace(/ /g, "+");
      return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrUriSafe, input.charAt(index)); });
    },

    compress: function (uncompressed) {
      return LZString._compress(uncompressed, 16, function(a){return f(a);});
    },
    _compress: function (uncompressed, bitsPerChar, getCharFromInt) {
      if (uncompressed == null) { return ""; }
      var i, value,
          context_dictionary= {},
          context_dictionaryToCreate= {},
          context_c="",
          context_wc="",
          context_w="",
          context_enlargeIn= 2, // Compensate for the first entry which should not count
          context_dictSize= 3,
          context_numBits= 2,
          context_data=[],
          context_data_val=0,
          context_data_position=0,
          ii;

      for (ii = 0; ii < uncompressed.length; ii += 1) {
        context_c = uncompressed.charAt(ii);
        if (!Object.prototype.hasOwnProperty.call(context_dictionary,context_c)) {
          context_dictionary[context_c] = context_dictSize++;
          context_dictionaryToCreate[context_c] = true;
        }

        context_wc = context_w + context_c;
        if (Object.prototype.hasOwnProperty.call(context_dictionary,context_wc)) {
          context_w = context_wc;
        } else {
          if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
            if (context_w.charCodeAt(0)<256) {
              for (i=0 ; i<context_numBits ; i++) {
                context_data_val = (context_data_val << 1);
                if (context_data_position == bitsPerChar-1) {
                  context_data_position = 0;
                  context_data.push(getCharFromInt(context_data_val));
                  context_data_val = 0;
                } else {
                  context_data_position++;
                }
              }
              value = context_w.charCodeAt(0);
              for (i=0 ; i<8 ; i++) {
                context_data_val = (context_data_val << 1) | (value&1);
                if (context_data_position == bitsPerChar-1) {
                  context_data_position = 0;
                  context_data.push(getCharFromInt(context_data_val));
                  context_data_val = 0;
                } else {
                  context_data_position++;
                }
                value = value >> 1;
              }
            } else {
              value = 1;
              for (i=0 ; i<context_numBits ; i++) {
                context_data_val = (context_data_val << 1) | value;
                if (context_data_position ==bitsPerChar-1) {
                  context_data_position = 0;
                  context_data.push(getCharFromInt(context_data_val));
                  context_data_val = 0;
                } else {
                  context_data_position++;
                }
                value = 0;
              }
              value = context_w.charCodeAt(0);
              for (i=0 ; i<16 ; i++) {
                context_data_val = (context_data_val << 1) | (value&1);
                if (context_data_position == bitsPerChar-1) {
                  context_data_position = 0;
                  context_data.push(getCharFromInt(context_data_val));
                  context_data_val = 0;
                } else {
                  context_data_position++;
                }
                value = value >> 1;
              }
            }
            context_enlargeIn--;
            if (context_enlargeIn == 0) {
              context_enlargeIn = Math.pow(2, context_numBits);
              context_numBits++;
            }
            delete context_dictionaryToCreate[context_w];
          } else {
            value = context_dictionary[context_w];
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }


          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          // Add wc to the dictionary.
          context_dictionary[context_wc] = context_dictSize++;
          context_w = String(context_c);
        }
      }

      // Output the code for w.
      if (context_w !== "") {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
          if (context_w.charCodeAt(0)<256) {
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<8 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          } else {
            value = 1;
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1) | value;
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = 0;
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<16 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }


        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
      }

      // Mark the end of the stream
      value = 2;
      for (i=0 ; i<context_numBits ; i++) {
        context_data_val = (context_data_val << 1) | (value&1);
        if (context_data_position == bitsPerChar-1) {
          context_data_position = 0;
          context_data.push(getCharFromInt(context_data_val));
          context_data_val = 0;
        } else {
          context_data_position++;
        }
        value = value >> 1;
      }

      // Flush the last char
      while (true) {
        context_data_val = (context_data_val << 1);
        if (context_data_position == bitsPerChar-1) {
          context_data.push(getCharFromInt(context_data_val));
          break;
        }
        else { context_data_position++; }
      }
      return context_data.join('');
    },

    decompress: function (compressed) {
      if (compressed == null) { return ""; }
      if (compressed == "") { return null; }
      return LZString._decompress(compressed.length, 32768, function(index) { return compressed.charCodeAt(index); });
    },

    _decompress: function (length, resetValue, getNextValue) {
      var dictionary = [],
          enlargeIn = 4,
          dictSize = 4,
          numBits = 3,
          entry = "",
          result = [],
          i,
          w,
          bits, resb, maxpower, power,
          c,
          data = {val:getNextValue(0), position:resetValue, index:1};

      for (i = 0; i < 3; i += 1) {
        dictionary[i] = i;
      }

      bits = 0;
      maxpower = Math.pow(2,2);
      power=1;
      while (power!=maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position == 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb>0 ? 1 : 0) * power;
        power <<= 1;
      }

      switch (bits) {
        case 0:
            bits = 0;
            maxpower = Math.pow(2,8);
            power=1;
            while (power!=maxpower) {
              resb = data.val & data.position;
              data.position >>= 1;
              if (data.position == 0) {
                data.position = resetValue;
                data.val = getNextValue(data.index++);
              }
              bits |= (resb>0 ? 1 : 0) * power;
              power <<= 1;
            }
          c = f(bits);
          break;
        case 1:
            bits = 0;
            maxpower = Math.pow(2,16);
            power=1;
            while (power!=maxpower) {
              resb = data.val & data.position;
              data.position >>= 1;
              if (data.position == 0) {
                data.position = resetValue;
                data.val = getNextValue(data.index++);
              }
              bits |= (resb>0 ? 1 : 0) * power;
              power <<= 1;
            }
          c = f(bits);
          break;
        case 2:
          return "";
      }
      dictionary[3] = c;
      w = c;
      result.push(c);
      while (true) {
        if (data.index > length) {
          return "";
        }

        bits = 0;
        maxpower = Math.pow(2,numBits);
        power=1;
        while (power!=maxpower) {
          resb = data.val & data.position;
          data.position >>= 1;
          if (data.position == 0) {
            data.position = resetValue;
            data.val = getNextValue(data.index++);
          }
          bits |= (resb>0 ? 1 : 0) * power;
          power <<= 1;
        }

        switch (c = bits) {
          case 0:
            bits = 0;
            maxpower = Math.pow(2,8);
            power=1;
            while (power!=maxpower) {
              resb = data.val & data.position;
              data.position >>= 1;
              if (data.position == 0) {
                data.position = resetValue;
                data.val = getNextValue(data.index++);
              }
              bits |= (resb>0 ? 1 : 0) * power;
              power <<= 1;
            }

            dictionary[dictSize++] = f(bits);
            c = dictSize-1;
            enlargeIn--;
            break;
          case 1:
            bits = 0;
            maxpower = Math.pow(2,16);
            power=1;
            while (power!=maxpower) {
              resb = data.val & data.position;
              data.position >>= 1;
              if (data.position == 0) {
                data.position = resetValue;
                data.val = getNextValue(data.index++);
              }
              bits |= (resb>0 ? 1 : 0) * power;
              power <<= 1;
            }
            dictionary[dictSize++] = f(bits);
            c = dictSize-1;
            enlargeIn--;
            break;
          case 2:
            return result.join('');
        }

        if (enlargeIn == 0) {
          enlargeIn = Math.pow(2, numBits);
          numBits++;
        }

        if (dictionary[c]) {
          entry = dictionary[c];
        } else {
          if (c === dictSize) {
            entry = w + w.charAt(0);
          } else {
            return null;
          }
        }
        result.push(entry);

        // Add w+entry[0] to the dictionary.
        dictionary[dictSize++] = w + entry.charAt(0);
        enlargeIn--;

        w = entry;

        if (enlargeIn == 0) {
          enlargeIn = Math.pow(2, numBits);
          numBits++;
        }

      }
    }
  };
    return LZString;
  })();

  if( module != null ) {
    module.exports = LZString;
  }
  });

  function unit(app) {
    app.observe('unit', debounce(function(value) {
      var str = JSON.stringify(value);
      var compressed = lzString.compressToEncodedURIComponent(str);
      this.set('compressed', compressed);

      var l = window.location;
      var url = l.protocol + '//' + l.host + l.pathname + l.search + '#' + compressed;

      if (!this.get('settings.skipUrlUpdate')) {
        window.location.replace(url);
      }

      this.set({ 'other.url': url, 'other.encoded': compressed });
    }, 3000, app), { init: false });

    if (window.location.hash) {
      try {
        var unit = JSON.parse(lzString.decompressFromEncodedURIComponent(window.location.hash.slice(1)));
        if (unit) {
          app.set('unit', unit);
        }
      } catch (e) {
        console.error('Failed to load hashed content', e);
      }
    }

    app.on('pasted-content', function (ctx, content) {
      try {
        var unit = JSON.parse(lzString.decompressFromEncodedURIComponent(content));
        if (unit) {
          app.set('unit', unit);
        }
        app.set('other.template', null);
      } catch (e) {
        console.error('Failed to load pasted content', e);
      }
    });

    app.on('encode-text', function (ctx, txt) {
      try {
        app.set('other.helpDecode', lzString.compressToEncodedURIComponent(txt));
      } catch (e) {}
    });

    app.on('decode-text', function (ctx, txt) {
      try {
        app.set('other.helpEncode', lzString.decompressFromEncodedURIComponent(txt));
      } catch (e) {}
    });
  }

  function ipc(app) {
    window.addEventListener('message', function(event) {
      if (event.data.log) { // aparently firefox doesn't isTrusted the same way chrome does
        var csl = app.find('.console .messages');
        var scroll = csl.scrollTop + csl.clientHeight >= csl.scrollHeight - 5;
        var idx = (app.get('messages') || []).length - 1;
        var last = app.get(("messages." + idx)) || {};
        var message = event.data.log.join('\n');

        if (last && last.message === message && last.type === event.data.type) {
          if (typeof last.count !== 'number') { app.set(("messages." + idx + ".count"), 2); }
          else { app.add(("messages." + idx + ".count")); }
        } else {
          app.push('messages', { type: event.data.type, message: message });
          if (scroll) {
            csl.scrollTop = csl.scrollHeight - csl.clientHeight;
          }
        }

        var content = document.querySelector('[data-console-tab]');
        if (content) {
          var ctx = Ractive.getContext(content);
          if (content.getAttribute('data-console-tab') != ctx.get('~/selected')) {
            var tab = ctx.ractive.find(("[data-tab-index=\"" + (content.getAttribute('data-console-tab')) + "\"]"));

            if (!tab.tm) { tab.tm = { count: 0 }; }

            if (!tab.tm.count) { tab.tm.color = getComputedStyle(tab).backgroundColor; }
            tab.tm.count++;

            tab.style.transitionProperty = 'none';
            tab.style.backgroundColor = '#ee6';
            
            setTimeout(function () {
              tab.style.transitionDuration = '1s';
              tab.style.transitionDelay = '0.1s';
              tab.style.transitionProperty = 'background-color';
              tab.style.backgroundColor = tab.tm.color;

              setTimeout(function () {
                tab.tm.count--;
                if (!tab.tm.count) {
                  tab.style.transitionProperty = '';
                  tab.style.transitionDuration = '';
                  tab.style.transitionDelay = '';
                }
              }, 1000);
            }, 100);
          }
        }
      }
      
      if (event.data.eval && !event.data.code) {
        app.set('eval.str', lzString.decompressFromEncodedURIComponent(event.data.eval));
        app.eval();
      } else if (event.data.code) {
        app.fire('pasted-content', {}, event.data.code);
        if (event.data.eval) { app.set('unit.e', lzString.decompressFromEncodedURIComponent(event.data.eval)); }
        if (event.data.run || event.data.eval) {
          app.fire('play');
        }
      }

      if (event.data.tab) { app.tab(event.data.tab); }
      if (event.data.file) { app.file(event.data.file); }
    }, false);
  }

  // simple debug helper
  var el;
  document.addEventListener('click', function (ev) { return el = ev.target; }, { capture: true });
  document.addEventListener('focus', function (ev) { return el = ev.target; }, { capture: true });

  Object.defineProperty(globalThis, 'R', {
    value: new Proxy(function () { return ({}); }, {
      apply: function apply(_obj, _e, args) {
        if (args.length) {
          var ctx;
          if (typeof args[0] === 'object' && args[0] instanceof Node) { ctx = Ractive.getContext(args.shift()); }
          else { ctx = Ractive.getContext(el); }
          if (!ctx) { return; }
          if (typeof args[0] === 'string') {
            if (args.length === 1) { return ctx.get(args[0]); }
            else if (args.length === 2) { return ctx.set(args[0], args[1]); }
          } else if (typeof args[0] === 'object') {
            return ctx.set(args[0]);
          }
          return ctx;
        } else {
          return Ractive.getContext(el).get();
        }
      },
      get: function get(_obj, prop) {
        var ctx = Ractive.getContext(el);
        if (!ctx) { return; }
        if (!(prop in ctx) && prop in ctx.ractive) {
          var val = ctx.ractive[prop];
          if (typeof val === 'function') { return val.bind(ctx.ractive); }
          return val;
        } else {
          return ctx[prop];
        }
      },
    }),
  });

  function init(template, css) {
    var params = window.location.search.slice(1).split('&').map(function (p) { return p.split('='); }).reduce(function (a, c) {
      a[c[0]] = c.length === 1 || c[1];
      return a;
    }, {});

    Ractive__default['default'].DEBUG = /minified/.test(function() { /* minified */ });
    Ractive__default['default'].styleSet('raui.primary.fga', params.fga ? ("#" + (params.fga)) : '#00818a');
    Ractive__default['default'].styleSet('raui.primary.fg', params.fg ? ("#" + (params.fg)) : '#222');
    Ractive__default['default'].styleSet('raui.primary.bg', params.bg ? ("#" + (params.bg)) : '#fff');
    Ractive__default['default'].styleSet('raui.menu.primary.fga', params.fg ? ("#" + (params.fg)) : '#222');

    if (params.hidemenu) { Ractive__default['default'].styleSet('shell.sides.initialTimeout', 1); }

    Ractive__default['default'].styleSet({
      'raui.tabs.menu': {
        bg: '#222',
        fg: '#fff',
        fga: '#fff'
      },
      'raui.tabs.themes': ['menu']
    });

    var App = /*@__PURE__*/(function (Ractive) {
      function App(opts) { Ractive.call(this, opts); }

      if ( Ractive ) App.__proto__ = Ractive;
      App.prototype = Object.create( Ractive && Ractive.prototype );
      App.prototype.constructor = App;

      App.prototype.eval = function eval$1 (ev) {
        var str = this.get('eval.str');
        outputFrame.contentWindow.postMessage({ eval: str }, '*');
        this.set('eval.str', '');
        if (str !== this.get('eval.list.0')) { this.unshift('eval.list', str); }
        this.set('eval.idx', -1);
      };

      App.prototype.evalUp = function evalUp (ev) {
        var idx = this.get('eval.idx') || 0;
        var list = this.get('eval.list');
        if (list && idx + 1 < list.length) {
          this.add('eval.idx');
          this.set('eval.str', list[idx + 1]);
          if (this.consoleInput) {
            this.consoleInput.decorators.codemirror.editor.setCursor({ line: 0, ch: list[idx + 1].length });
          }
        }
      };

      App.prototype.evalDown = function evalDown (ev) {
        var idx = this.get('eval.idx') || -1;
        var list = this.get('eval.list');
        if (list && idx - 1 >= 0) {
          this.subtract('eval.idx');
          this.set('eval.str', list[idx - 1]);
          if (this.consoleInput) {
            this.consoleInput.decorators.codemirror.editor.setCursor({ line: 0, ch: list[idx - 1].length });
          }
        } else if (list && idx < 1) {
          this.set('eval.str', '');
          this.set('eval.idx', -1);
        }
      };

      return App;
    }(Ractive__default['default']));
    Ractive__default['default'].extendWith(App, {
      template: template, css: css,
      cssId: 'app',
      noCssTransform: true,
      use: [plugin$7(), plugin$4(), plugin$3(), plugin$2(), plugin$1(), init$1({ lineNumbers: true }).plugin, keys(), plugin()],
      decorators: {
        output: function output(node) {
          node.appendChild(outputFrame);

          node.style.position = 'relative';
          node.style.width = '100%';
          node.style.height = '100%';

          return {
            teardown: function teardown() {
              node.removeChild(outputFrame);
            }
          }
        }
      },
      data: function data() {
        return {
          pickLayout: function pickLayout() {
            this.set('other.inCode', false);
            this.get('settings.layout');
            return 'l-' + (this.get('unit.m') || 0) + '-' + (this.get('settings.layout') || (this.params && this.params.layout) || this.get('layout') || 'medium');
          },
          inCode: function inCode() {
            this.get('settings.layout'); this.get('unit.m'); this.get('layout');
            var tab = document.querySelector('[data-script-tab]');
            var inCode = this.get('other.inCode');
            var files = this.get('unit.fs');
            return files && (!tab || (inCode && tab));
          },
          templates: {
            'Simple Entry Component': 'N4IgFiBcoE5SAbAhgFwKYGcUgL4BoQBbKARgIDMMoBtUAOyULXgEs6ATNADwDoYkAxihYA3NDzApCCEAQEB7OuiXwAPGBIA+ABJoECeXgAEwYAyZGAPpaMByAEqDhY2zhwBCVQHoNmgDp0AaoYAjAsAA4o-nRGRgp0WEYAguHhRgC8Ro5CouLcyuwAFMABsbHohOHI6JBGACQAKgCiALIACgAySc14pWUCGBi1dQDCAMpjvTH9gwCS7LW2SKm2fTgAlADcAX3xictpmQDubOzyRzwHGUZ0aEfJqcV95UgwAOZoKIsARvLsAJ6raYbbZ0bwhMKRaJBLD-BBoaKxDQmOLyAwwWoAYgADNiABwkPFITZGHBBLyw+HRXAAXQIaHIrA43D4TlyEikMhwQA',
            'Simple Entry JS': 'N4IgFiBcoE5SAbAhgFwKYGcUgL4BoQBbKARgIDMMoBtUAOyULXgEs6ATNADwDoArKgQDGAezrpx8UXSwACAIIAHRbIC8sgEpIhKFgDc0PbhPYAKYAB06FlOkKLk6SLIAGAHjAkAfAAk0CBBE8WWBgBiZZAB9I2QByLR19NFicHABCNwB6Ty8XPCtZWSEMDGcXTxCikUCYZwBiAAYGgA4SZqQAblkcPIKikoBJdmdYpGVYqxwASg6rK2k5MZV1AHc2dhEVniW1WTo0FYVlcz6UJBgAczQUEYAjEXYATwm6aY7cAF0CNHJWDm5+FQcEA',
            'Split Entry Component': 'N4IgFiBcoE5SAbAhgFwKYGcUgL4BoQBbKARgIDMMoBtUAOyULXgEs6ATNADwDoArKgQDGAezrpxrQgAcRMFAAJgC9DOTo8CoRgwKcC8jBGEFAch4B6Np14wkQlCwBuaHmBSEEpgNwAdOv6idFgKAILS0goAvAoASvaOLjzcEuwAFMD+vijaGJqq0upoeP4KWjoAkuyQZkgRpv44AJR+AXRBIXWRMQDu1iI9PF3RCnRoPWERGaUqSDAA5mgoNaYARiLsAJ4NdM3euHj0jMyQINbcPHYOzq7uniDCYhLYpwA8YCQAfAASaAgIIk0wGADCYCgAPuCzPFri5TDgcABCV4WD6fLJ0V5YTYINDouhlD5KLQiAEwGoAYgADFSABwkWlIbx6fwo7G4z64AC6BDQ5FYHAuAlwQA',
            'Basic App Template': 'N4IgFiBcoE5SAbAhgFwKYGcUgL4BoQBbKARgIDMMoBtUAOyULXgEs6ATNADwDoArKgQDGAezrpxrQgAcRMFAAIAgtOkLyMEYQUByHgHoV0nQG4AOnQui6WBUlUKAvAoDubdiJc97a53TQuyqoAFMAWCgooSDAA5mgokLoARiLsAJ46FjgAlCa4ePSMzJAgRjwwSEIoLABuaDxgKIQIIMJiEtglADxgJAB8ABJoCAgieArAwAxMCgA+s7oASpXVdTo4OACEXfq9fRZdSQCuKChiCmIAtEIILEIA1o5mIAACPEwoYKnB2c-7dBEAMK3B4KACyaE2B30x1OYn+BywaQQaH+EV6EwUolGMESAGIAAwEgAcJGJSBMChw0KRKL6+UKTHgZQErRA1g6Ulk8kx6BkyHQ4yEGAwVPUmm0ekMqnKK1q9UazVMFgs3G5ik45CQRwQihuSBFQTU3Ak7FFyyq8om4SxYiwMCOVTkwRE0hQGGymIwR2kaBgLrdHsp1IBChtHy+7B+1tDEWsGBEKJ4oxiwR0EdSmx0uRtIZDFgtq3qJrQHAA6ixPsEjOMwpYUMKMOM+dIBWg8DbGwBJdiJHQ+TJ0HJ5HAAXQIaHIrA43H4VBwQA',
          }
        }
      },
      computed: {
        fileMode: function fileMode() {
          var idx = this.get('other.selectedFile');
          var file = this.get(("unit.fs." + idx));
          if (file && file.name) {
            var ext = file.name.match(/((?:\.[^\.]+)+)$/);
            if (ext) {
              ext = ext[0];
              switch (ext) {
                case '.js': return 'javascript';
                case '.css': return 'css';
                case '.ractive.html': return { base: 'text/html', name: 'handlebars' };
                case '.html': return 'html';
              }
            }
          }
          return 'text';
        }
      },
      on: {
        render: function render() {
          this.shell = this.findComponent('shell');
          this.menu = this.findComponent('menu');
          this.menuTabs.select(1);
        },
        play: play,
        select: function select(ctx, idx) {
          this.set('other.selectedFile', idx);
        }
      },
      observe: {
        'other.mobile': {
          handler: function handler(v) {
            this.get('settings.editor').mobile = v;
            if (window.localStorage) {
              window.localStorage.setItem('ractive-playground-settings', JSON.stringify(this.get('settings')));
            }
          },
          init: false
        },
        'unit.m': function unit_m(v) {
          var this$1 = this;

          if (!v) {
            this.set('unit.fs', undefined);
          }

          if (v === 1) {
            var unit = this.get('unit');
            if (!unit.fs || !unit.fs.length) {
              var script = unit.s ? unit.s : "const App = Ractive.extend({\n  template: $TEMPLATE,\n  css: $CSS,\n  cssId: 'app'\n});\n\nconst app = window.app = new App({\n  target: 'body'\n});";
              var tpl = unit.t ? unit.t : "<h1>Hello, {{name || 'Ractive'}}!</h1>";
              this.set('unit.fs', [{
                name: 'index.ractive.html',
                content: (tpl + "\n\n<" + ('') + "script>\n" + (script.replace(/^(.)/gm, '  $1')) + "\n<" + ('') + "/script>\n\n<style>\n" + (this.get('unit.c').replace(/^(.)/gm, '  $1') || '  h1 { color: #00818a; }') + "\n</style>\n")
              }]);
              this.set('unit.ef', 'index.ractive.html');
            }
            this.set('other.selectedFile', 0);
            setTimeout(function () { return this$1.menuTabs && this$1.menuTabs.select(0); });
          }
        }
      },
      tab: function tab(tab$1) {
        var attr = "data-" + tab$1 + "-tab";
        var node = document.querySelector(("[" + attr + "]"));
        if (node) {
          var tabs = this.getContext(node).ractive;
          tabs.select(+node.getAttribute(attr));
          setTimeout(function () { return tabs.updateIndicator(); }, 100);
        }
      },
      file: function file(name) {
        var files = this.get('unit.fs');
        if (files) {
          var idx = files.findIndex(function (f) { return f.name === name; });
          if (idx) { this.set('other.selectedFile', idx); }
        }
      }
    });

    var app = window.app = new App({
      data: {
        unit: { t: '', s: '', c: '' },
        eval: ''
      },
      on: {
        render: {
          once: true,
          handler: function handler() {
          var this$1 = this;
   setTimeout(function () { return this$1.fire('play', null, { init: params.env !== 'docs' }); }, 1); }
        }
      },
      params: params,
      env: params.env
    });

    app.set('other.hidemenu', params.hidemenu);

    function autoLayout() {
      if (window.innerWidth > 1599) { app.set('~/layout', "huge"); }
      else if (window.innerWidth > 1200) { app.set('~/layout', "large"); }
      else if (window.innerWidth > 800) { app.set('~/layout', "medium"); }
      else { app.set('~/layout', "small"); }
    }
    window.addEventListener('resize', autoLayout);
    autoLayout();

    setTimeout(function () { return unit(app); }, 14);
    settings(app);
    ipc(app);

    app.render(document.body);

    if (params.tab) { app.tab(params.tab); }
    if (params.file) { app.file(params.file); }
  }

  init({v:4,t:[{t:7,e:"shell",f:[{t:7,e:"right",m:[{n:"hidden",t:13,f:[{t:2,r:"menu.hidden"}]},{n:"over",t:13,f:[{t:2,r:"other.hidemenu"}]}],f:[{t:7,e:"menu",f:[{t:7,e:"container",m:[{t:13,n:"style",f:"height: 100%;",g:1}],f:[{t:7,e:"tabs",m:[{t:13,n:"class",f:"menu",g:1},{n:"fill",f:0,t:13},{n:"pad",f:0,t:13},{n:"transition",f:"slide",t:13,g:1},{n:["init"],t:70,f:{r:["@this","$1"],s:"[_0.set(\"@.menuTabs\",_1)]"}},{n:"height",f:"dynamic",t:13,g:1}],f:[{t:7,e:"tab",m:[{t:13,n:"class",f:"files-tab",g:1},{n:"hidden",f:[{t:2,x:{r:["~/unit.fs"],s:"!_0"}}],t:13},{n:"no-pad",f:0,t:13},{n:"title",f:"Files",t:13,g:1}],f:[{t:7,e:"ul",m:[{t:13,n:"style",f:"margin-bottom: 2em;",g:1},{t:13,n:"class",f:"files",g:1}],f:[{t:4,f:[{t:7,e:"li",m:[{n:"class-renaming",t:13,f:[{t:2,x:{r:[".rename"],s:"_0!=null"}}]},{n:"class-selected",t:13,f:[{t:2,x:{r:["~/other.selectedFile","@index"],s:"_0===_1"}}]},{n:["click"],t:70,f:{r:["@index"],s:"[[\"select\",_0]]"}},{n:["keys"],t:70,a:{r:[],s:"[10,13]"},f:{r:[".rename","@this","@index","@context"],s:"[(_3).set(\".name\",_0),_1.toggle((\"other.rename.\"+(_2))),_1.set(\"other.selectedFile\",_2),(_3).set(\".rename\",undefined)]"}},{n:["keys"],t:70,a:{r:[],s:"[27]"},f:{r:["@this","@index","@context"],s:"[_0.toggle((\"other.rename.\"+(_1))),(_2).set(\".rename\",undefined)]"}},{n:["dblclick"],t:70,f:{r:["@context",".rename",".name","@this","@index","@node"],s:"[(_0).set(\".rename\",_1!=null?undefined:_2),_3.toggle((\"other.rename.\"+(_4))),_5.querySelector(\"input\")&&_5.querySelector(\"input\").focus()]"}}],f:[{t:4,f:[{t:7,e:"input",m:[{n:"value",f:[{t:2,r:".rename"}],t:13}]}],n:50,rx:{r:"other.rename",m:[{t:30,n:"@index"}]}},{t:4,f:[{t:7,e:"div",f:[{t:2,r:".name"}]},{t:7,e:"div",m:[{t:13,n:"class",f:"remove",g:1},{n:["click"],t:70,f:{r:["@context","@index"],s:"[(_0).splice(\"../\",_1,1)]"}}],f:["×"]}],n:51,l:1}]}],n:52,r:"~/unit.fs"}]}," ",{t:7,e:"div",m:[{t:13,n:"style",f:"text-align: center;",g:1}],f:[{t:7,e:"button",m:[{t:13,n:"style",f:"margin: 0.5em;",g:1},{n:["click"],t:70,f:{r:["unit.fs.length","@this","@node.parentNode.parentNode"],s:"[_1.set((\"other.rename.\"+(_0)),true),_1.push(\"unit.fs\",{name:\"New File\",content:\"\",rename:\"New File\"}),_2.querySelector(\"input\").focus()]"}}],f:["+ New File"]}]}]}," ",{t:7,e:"tab",m:[{t:13,n:"style",f:"padding: 0.2em;",g:1},{n:"title",f:"Build",t:13,g:1},{n:"no-pad",f:0,t:13}],f:[{t:7,e:"label",f:["Playground Mode ",{t:7,e:"select",m:[{n:"value",f:[{t:2,r:"~/unit.m"}],t:13}],f:[{t:7,e:"option",m:[{n:"value",f:[{t:2,x:{r:[],s:"undefined"}}],t:13}],f:["Simple"]}," ",{t:7,e:"option",m:[{n:"value",f:[{t:2,x:{r:[],s:"1"}}],t:13}],f:["Entry File"]}]}]}," ",{t:7,e:"label",f:["Ractive.js ",{t:7,e:"select",m:[{n:"value",f:[{t:2,r:"~/unit.h.r"}],t:13}],f:[{t:7,e:"option",m:[{n:"value",f:[{t:2,x:{r:[],s:"null"}}],t:13}],f:["(None)"]}," ",{t:7,e:"option",m:[{n:"value",f:"latest",t:13},{n:"selected",f:0,t:13}],f:["Latest"]}," ",{t:7,e:"option",m:[{n:"value",f:"edge",t:13}],f:["Edge"]}," ",{t:7,e:"option",m:[{n:"value",f:"1.3",t:13}],f:["1.3"]}," ",{t:7,e:"option",m:[{n:"value",f:"1.2",t:13}],f:["1.2"]}," ",{t:7,e:"option",m:[{n:"value",f:"1.1",t:13}],f:["1.1"]}," ",{t:7,e:"option",m:[{n:"value",f:"1.0",t:13}],f:["1.0"]}," ",{t:7,e:"option",m:[{n:"value",f:"0.10",t:13}],f:["0.10"]}," ",{t:7,e:"option",m:[{n:"value",f:"0.9",t:13}],f:["0.9"]}," ",{t:7,e:"option",m:[{n:"value",f:"0.8",t:13}],f:["0.8"]}," ",{t:7,e:"option",m:[{n:"value",f:"0.7",t:13}],f:["0.7"]}," ",{t:7,e:"option",m:[{n:"value",f:"0.6",t:13}],f:["0.6"]}]}]}," ",{t:7,e:"label",m:[{t:13,n:"style",f:"margin-bottom: 2em;",g:1},{t:13,n:"class",f:"check",g:1}],f:[{t:7,e:"input",m:[{n:"type",f:"checkbox",t:13},{n:"checked",f:[{t:2,r:"other.cacheBust"}],t:13}]}," Bust cache?"]}," ",{t:7,e:"h3",f:["Extra HTML Scripts"]}," ",{t:7,e:"ul",m:[{t:13,n:"class",f:"scripts",g:1}],f:[{t:4,f:[{t:7,e:"li",f:[{t:7,e:"input",m:[{n:"value",f:[{t:2,r:"."}],t:13}]},{t:7,e:"div",m:[{t:13,n:"class",f:"remove",g:1},{n:["click"],t:70,f:{r:["@context","@index"],s:"[(_0).splice(\"../\",_1,1)]"}}],f:["×"]}]}],n:52,r:"~/unit.h.s"},{t:4,f:[{t:7,e:"li",f:["(None)"]}],n:51,l:1}]}," ",{t:7,e:"div",m:[{t:13,n:"style",f:"margin-bottom: 2em; text-align: center;",g:1}],f:[{t:7,e:"button",m:[{n:["click"],t:70,f:{r:["@this"],s:"[_0.push(\"unit.h.s\",\"//cdn.jsdelivr.net/npm/\")]"}}],f:["+ Add HTML Script"]}]}," ",{t:4,f:[{t:7,e:"h3",f:["Rollup Settings"]}," ",{t:7,e:"label",f:["Entry File",{t:7,e:"br"},{t:7,e:"input",m:[{n:"value",f:[{t:2,r:"~/unit.ef"}],t:13}]}]}," Globals ",{t:7,e:"ul",m:[{t:13,n:"class",f:"globals",g:1}],f:[{t:7,e:"li",f:["ractive: Ractive"]}," ",{t:4,f:[{t:7,e:"li",f:[{t:7,e:"input",m:[{n:"value",f:[{t:2,r:".key"}],t:13},{n:"placeholder",f:"module",t:13}]},":",{t:7,e:"input",m:[{n:"value",f:[{t:2,r:".value"}],t:13},{n:"placeholder",f:"global var",t:13}]},{t:7,e:"div",m:[{t:13,n:"class",f:"remove",g:1},{n:["click"],t:70,f:{r:["@context","@index"],s:"[(_0).splice(\"../\",_1,1)]"}}],f:["×"]}]}],n:52,r:"~/unit.gs"}]}," ",{t:7,e:"div",m:[{t:13,n:"style",f:"margin-bottom: 2em; text-align: center;",g:1}],f:[{t:7,e:"button",m:[{n:["click"],t:70,f:{r:["@this"],s:"[_0.push(\"unit.gs\",{})]"}}],f:["+ Add Global"]}]}],n:50,r:"~/unit.m"}]}," ",{t:7,e:"tab",m:[{n:"title",f:"Editor",t:13,g:1}],f:[{t:7,e:"label",f:["Playground Layout ",{t:7,e:"select",m:[{n:"value",f:[{t:2,r:"~/settings.layout"}],t:13}],f:[{t:7,e:"option",m:[{n:"value",f:[{t:2,x:{r:[],s:"null"}}],t:13}],f:["(Default)"]}," ",{t:7,e:"option",m:[{n:"value",f:"small",t:13}],f:["Small"]}," ",{t:7,e:"option",m:[{n:"value",f:"medium",t:13}],f:["Medium"]}," ",{t:7,e:"option",m:[{n:"value",f:"large",t:13}],f:["Large"]}," ",{t:7,e:"option",m:[{n:"value",f:"huge",t:13}],f:["Huge"]}]}]}," ",{t:7,e:"label",m:[{t:13,n:"style",f:"margin-bottom: 2em;",g:1}],f:["Load Template ",{t:7,e:"select",m:[{n:"value",f:[{t:2,r:"other.template"}],t:13},{n:["change"],t:70,f:{r:["@this","@node.value"],s:"[_1&&_0.fire(\"pasted-content\",{},_1)]"}}],f:[{t:7,e:"option",m:[{n:"value",f:[{t:2,x:{r:[],s:"null"}}],t:13}],f:["(Select One)"]}," ",{t:4,f:[{t:7,e:"option",m:[{n:"value",f:[{t:2,r:"v"}],t:13}],f:[{t:2,r:"k"}]}],n:52,z:[{n:"v",x:{r:"."}},{n:"k",x:{r:"@key"}}],r:"~/templates"}]}]}," ",{t:7,e:"label",f:["Editor Key Mode ",{t:7,e:"select",m:[{n:"value",f:[{t:2,r:"settings.editor.keymode"}],t:13}],f:[{t:7,e:"option",m:[{n:"value",f:"default",t:13}],f:["(Default)"]}," ",{t:7,e:"option",m:[{n:"value",f:"vim",t:13}],f:["VIM"]}," ",{t:7,e:"option",m:[{n:"value",f:"emacs",t:13}],f:["EMACS (RSI)"]}," ",{t:7,e:"option",m:[{n:"value",f:"sublime",t:13}],f:["Sublime"]}]}]}," ",{t:7,e:"label",m:[{t:13,n:"class",f:"check",g:1}],f:[{t:7,e:"input",m:[{n:"type",f:"checkbox",t:13},{n:"checked",f:[{t:2,r:"~/settings.editor.autoTag"}],t:13}]}," Auto-close tags?"]}," ",{t:7,e:"label",m:[{t:13,n:"class",f:"check",g:1}],f:[{t:7,e:"input",m:[{n:"type",f:"checkbox",t:13},{n:"checked",f:[{t:2,r:"~/settings.editor.autoBracket"}],t:13}]}," Auto-close brackets?"]}," ",{t:7,e:"label",f:["Tab size ",{t:7,e:"input",m:[{n:"type",f:"number",t:13},{n:"value",f:[{t:2,r:"~/settings.editor.tabSize"}],t:13}]}]}," ",{t:7,e:"label",m:[{t:13,n:"class",f:"check",g:1}],f:[{t:7,e:"input",m:[{n:"type",f:"checkbox",t:13},{n:"checked",f:[{t:2,r:"other.mobile"}],t:13}]}," Mobile-friendly input?"]}," ",{t:7,e:"label",f:["Editor Theme ",{t:7,e:"select",m:[{n:"value",f:[{t:2,r:"settings.editor.theme"}],t:13}],f:[{t:7,e:"option",m:[{n:"value",f:"default",t:13}],f:["(Default)"]}," ",{t:7,e:"option",m:[{n:"value",f:"eclipse",t:13}],f:["Eclipse"]}," ",{t:7,e:"option",m:[{n:"value",f:"idea",t:13}],f:["Idea"]}," ",{t:7,e:"option",m:[{n:"value",f:"material",t:13}],f:["Material"]}," ",{t:7,e:"option",m:[{n:"value",f:"monokai",t:13}],f:["Monokai"]}," ",{t:7,e:"option",m:[{n:"value",f:"rubyblue",t:13}],f:["Rubyblue"]}," ",{t:7,e:"option",m:[{n:"value",f:"solarized dark",t:13}],f:["Solarized: Dark"]}," ",{t:7,e:"option",m:[{n:"value",f:"solarized light",t:13}],f:["Solarized: Light"]}]}]}," ",{t:7,e:"label",m:[{t:13,n:"class",f:"check",g:1}],f:[{t:7,e:"input",m:[{n:"type",f:"checkbox",t:13},{n:"checked",f:[{t:2,r:"settings.editor.wrap"}],t:13}]}," Soft wrap?"]}," ",{t:7,e:"label",m:[{t:13,n:"style",f:"margin-bottom: 2em;",g:1},{t:13,n:"class",f:"check",g:1}],f:[{t:7,e:"input",m:[{n:"type",f:"checkbox",t:13},{n:"checked",f:[{t:2,r:"settings.editor.highlightActive"}],t:13}]}," Highlight active line?"]}]}," ",{t:7,e:"tab",m:[{n:"title",f:"URL",t:13,g:1},{n:"no-pad",f:0,t:13}],f:[{t:7,e:"div",m:[{t:13,n:"class",f:"content-menu",g:1}],f:[{t:4,f:[{t:7,e:"label",m:[{t:13,n:"class",f:"menuarea",g:1}],f:["Content",{t:7,e:"textarea",m:[{t:73,v:"t",f:"false"},{n:"value",f:[{t:2,r:"other.encoded"}],t:13},{n:["change"],t:70,f:{r:["@node.value"],s:"[[\"pasted-content\",_0]]"}}]}]}," ",{t:7,e:"label",m:[{t:13,n:"class",f:"check",g:1}],f:[{t:7,e:"input",m:[{n:"type",f:"checkbox",t:13},{n:"checked",f:[{t:2,r:"~/settings.skipUrlUpdate"}],t:13}]}," Skip URL update?"]}," ",{t:7,e:"label",m:[{t:13,n:"class",f:"menuarea",g:1}],f:["URL",{t:7,e:"textarea",m:[{n:"readonly",f:0,t:13},{t:73,v:"t",f:"false"},{n:"value",f:[{t:2,r:"other.url"}],t:13}]}]}],n:51,r:"~/other.encoder"}," ",{t:4,f:[{t:7,e:"label",m:[{t:13,n:"class",f:"menuarea",g:1}],f:["Decoded",{t:7,e:"textarea",m:[{t:73,v:"t",f:"false"},{n:"value",f:[{t:2,r:"other.helpEncode"}],t:13},{n:["change"],t:70,f:{r:["@node.value"],s:"[[\"encode-text\",_0]]"}}]}]}," ",{t:7,e:"label",m:[{t:13,n:"class",f:"menuarea",g:1}],f:["Encoded",{t:7,e:"textarea",m:[{t:73,v:"t",f:"false"},{n:"value",f:[{t:2,r:"other.helpDecode"}],t:13},{n:["change"],t:70,f:{r:["@node.value"],s:"[[\"decode-text\",_0]]"}}]}]}],n:50,r:"~/other.encoder"}," ",{t:7,e:"div",m:[{t:13,n:"style",f:"text-align: center;",g:1}],f:[{t:7,e:"button",m:[{n:["click"],t:70,f:{r:["@this"],s:"[_0.toggle(\"other.encoder\")]"}}],f:[{t:2,x:{r:["~/other.encoder"],s:"_0?\"URL\":\"Encoder\""}}]}]}]}]}]}]}]}]}," ",{t:7,e:"center",f:[{t:7,e:"div",m:[{t:13,n:"class",f:"main-wrapper",g:1}],f:[{t:7,e:"app-bar",m:[{t:13,n:"style",f:"padding: 0.5em;",g:1}],f:[{t:7,e:"right",f:[{t:7,e:"div",m:[{t:13,n:"class",f:"hamburger",g:1},{n:["click"],t:70,f:{r:["@this"],s:"[_0.toggle(\"menu.hidden\")]"}}],f:["☰"]}]}," ",{t:7,e:"center",f:[{t:4,f:[{t:2,rx:{r:"unit.fs",m:[{t:30,n:"other.selectedFile"},"name"]}}],n:50,x:{r:["~/inCode"],s:"_0()"}},{t:4,f:["Ractive.js Playground"],n:51,l:1}]}," ",{t:7,e:"left",f:[{t:7,e:"div",m:[{t:13,n:"style",f:"cursor: pointer;",g:1},{t:13,n:"class",f:"play-button",g:1},{n:["click"],t:70,f:"play"}],f:["▶"]}]}]}," ",{t:8,x:{r:["pickLayout"],s:"_0()"}}]}]}]}],e:{"1":function (){return(1);},"[_0.set(\"@.menuTabs\",_1)]":function (_0,_1){return([_0.set("@.menuTabs",_1)]);},"!_0":function (_0){return(!_0);},"_0!=null":function (_0){return(_0!=null);},"_0===_1":function (_0,_1){return(_0===_1);},"[[\"select\",_0]]":function (_0){return([["select",_0]]);},"[10,13]":function (){return([10,13]);},"[(_3).set(\".name\",_0),_1.toggle((\"other.rename.\"+(_2))),_1.set(\"other.selectedFile\",_2),(_3).set(\".rename\",undefined)]":function (_0,_1,_2,_3){return([(_3).set(".name",_0),_1.toggle(("other.rename."+(_2))),_1.set("other.selectedFile",_2),(_3).set(".rename",undefined)]);},"[27]":function (){return([27]);},"[_0.toggle((\"other.rename.\"+(_1))),(_2).set(\".rename\",undefined)]":function (_0,_1,_2){return([_0.toggle(("other.rename."+(_1))),(_2).set(".rename",undefined)]);},"[(_0).set(\".rename\",_1!=null?undefined:_2),_3.toggle((\"other.rename.\"+(_4))),_5.querySelector(\"input\")&&_5.querySelector(\"input\").focus()]":function (_0,_1,_2,_3,_4,_5){return([(_0).set(".rename",_1!=null?undefined:_2),_3.toggle(("other.rename."+(_4))),_5.querySelector("input")&&_5.querySelector("input").focus()]);},"[(_0).splice(\"../\",_1,1)]":function (_0,_1){return([(_0).splice("../",_1,1)]);},"[_1.set((\"other.rename.\"+(_0)),true),_1.push(\"unit.fs\",{name:\"New File\",content:\"\",rename:\"New File\"}),_2.querySelector(\"input\").focus()]":function (_0,_1,_2){return([_1.set(("other.rename."+(_0)),true),_1.push("unit.fs",{name:"New File",content:"",rename:"New File"}),_2.querySelector("input").focus()]);},"undefined":function (){return(undefined);},"null":function (){return(null);},"[_0.push(\"unit.h.s\",\"//cdn.jsdelivr.net/npm/\")]":function (_0){return([_0.push("unit.h.s","//cdn.jsdelivr.net/npm/")]);},"[_0.push(\"unit.gs\",{})]":function (_0){return([_0.push("unit.gs",{})]);},"[_1&&_0.fire(\"pasted-content\",{},_1)]":function (_0,_1){return([_1&&_0.fire("pasted-content",{},_1)]);},"[[\"pasted-content\",_0]]":function (_0){return([["pasted-content",_0]]);},"[[\"encode-text\",_0]]":function (_0){return([["encode-text",_0]]);},"[[\"decode-text\",_0]]":function (_0){return([["decode-text",_0]]);},"[_0.toggle(\"other.encoder\")]":function (_0){return([_0.toggle("other.encoder")]);},"_0?\"URL\":\"Encoder\"":function (_0){return(_0?"URL":"Encoder");},"[_0.toggle(\"menu.hidden\")]":function (_0){return([_0.toggle("menu.hidden")]);},"_0()":function (_0){return(_0());},"_0?(\"message-\"+(_0)):\"\"":function (_0){return(_0?("message-"+(_0)):"");},"_0>99?\"∞\":_0":function (_0){return(_0>99?"∞":_0);},"[(_0).toggle(\"__state.show\")]":function (_0){return([(_0).toggle("__state.show")]);},"_0.substring(0,_0.indexOf(\"\\n\"))":function (_0){return(_0.substring(0,_0.indexOf("\n")));},"~_0.indexOf(\"\\n\")":function (_0){return(~_0.indexOf("\n"));},"[{lineNumbers:false,bind:\"~/eval.str\",mode:\"javascript\",inputStyle:_0?\"password\":\"contenteditable\"}]":function (_0){return([{lineNumbers:false,bind:"~/eval.str",mode:"javascript",inputStyle:_0?"password":"contenteditable"}]);},"[_0.eval(_1)]":function (_0,_1){return([_0.eval(_1)]);},"[38]":function (){return([38]);},"[_0.evalUp(_1)]":function (_0,_1){return([_0.evalUp(_1)]);},"[40]":function (){return([40]);},"[_0.evalDown(_1)]":function (_0,_1){return([_0.evalDown(_1)]);},"_0.set(\"@.consoleInput\",(_1))&&\"\"":function (_0,_1){return(_0.set("@.consoleInput",(_1))&&"");},"[_0.set(\"messages\",[])]":function (_0){return([_0.set("messages",[])]);},"[{theme:_0,keyMap:_1||\"default\",styleActiveLine:_2,lineWrapping:_3,bind:(\"unit.fs.\"+(_4)+\".content\"),mode:_5,inputStyle:_6?\"password\":\"contenteditable\",tabSize:_7||2,autoCloseTags:_8,autoCloseBrackets:_9,lint:true,lintOnChange:true}]":function (_0,_1,_2,_3,_4,_5,_6,_7,_8,_9){return([{theme:_0,keyMap:_1||"default",styleActiveLine:_2,lineWrapping:_3,bind:("unit.fs."+(_4)+".content"),mode:_5,inputStyle:_6?"password":"contenteditable",tabSize:_7||2,autoCloseTags:_8,autoCloseBrackets:_9,lint:true,lintOnChange:true}]);},"[{theme:_0,keyMap:_1||\"default\",styleActiveLine:_2,lineWrapping:_3,bind:\"~/unit.c\",mode:\"css\",inputStyle:_4?\"password\":\"contenteditable\",tabSize:_5||2,autoCloseTags:_6,autoCloseBrackets:_7,lint:true,lintOnChange:true}]":function (_0,_1,_2,_3,_4,_5,_6,_7){return([{theme:_0,keyMap:_1||"default",styleActiveLine:_2,lineWrapping:_3,bind:"~/unit.c",mode:"css",inputStyle:_4?"password":"contenteditable",tabSize:_5||2,autoCloseTags:_6,autoCloseBrackets:_7,lint:true,lintOnChange:true}]);},"[{theme:_0,keyMap:_1||\"default\",styleActiveLine:_2,lineWrapping:_3,bind:\"~/unit.s\",mode:\"javascript\",inputStyle:_4?\"password\":\"contenteditable\",tabSize:_5||2,autoCloseTags:_6,autoCloseBrackets:_7,lint:true,lintOnChange:true}]":function (_0,_1,_2,_3,_4,_5,_6,_7){return([{theme:_0,keyMap:_1||"default",styleActiveLine:_2,lineWrapping:_3,bind:"~/unit.s",mode:"javascript",inputStyle:_4?"password":"contenteditable",tabSize:_5||2,autoCloseTags:_6,autoCloseBrackets:_7,lint:true,lintOnChange:true}]);},"[{theme:_0,keyMap:_1||\"default\",styleActiveLine:_2,lineWrapping:_3,bind:\"~/unit.t\",mode:{name:\"handlebars\",base:\"text/html\"},inputStyle:_4?\"password\":\"contenteditable\",tabSize:_5||2,autoCloseTags:_6,autoCloseBrackets:_7,lint:true,lintOnChange:true}]":function (_0,_1,_2,_3,_4,_5,_6,_7){return([{theme:_0,keyMap:_1||"default",styleActiveLine:_2,lineWrapping:_3,bind:"~/unit.t",mode:{name:"handlebars",base:"text/html"},inputStyle:_4?"password":"contenteditable",tabSize:_5||2,autoCloseTags:_6,autoCloseBrackets:_7,lint:true,lintOnChange:true}]);},"[_0.getContext(\".code.editor\").decorators.codemirror.resize(),_0.set(\"other.inCode\",true)]":function (_0){return([_0.getContext(".code.editor").decorators.codemirror.resize(),_0.set("other.inCode",true)]);},"[_0.set(\"other.inCode\",false)]":function (_0){return([_0.set("other.inCode",false)]);},"[_0.getContext(\".eval .input\").decorators.codemirror.resize()]":function (_0){return([_0.getContext(".eval .input").decorators.codemirror.resize()]);},"\"console\"":function (){return("console");},"[_0.getContext(\".html.editor\").decorators.codemirror.resize()]":function (_0){return([_0.getContext(".html.editor").decorators.codemirror.resize()]);},"[_0.getContext(\".script.editor\").decorators.codemirror.resize()]":function (_0){return([_0.getContext(".script.editor").decorators.codemirror.resize()]);},"[_0.getContext(\".css.editor\").decorators.codemirror.resize()]":function (_0){return([_0.getContext(".css.editor").decorators.codemirror.resize()]);}},p:{console:[{t:7,e:"div",m:[{t:13,n:"class",f:"console",g:1}],f:[{t:7,e:"div",m:[{t:13,n:"class",f:"messages",g:1}],f:[{t:7,e:"ul",f:[{t:4,f:[{t:4,f:[{t:19,f:[{t:7,e:"li",m:[{n:"class",f:["message ",{t:2,x:{r:[".type"],s:"_0?(\"message-\"+(_0)):\"\""}}],t:13}],f:[{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"message-counter",g:1},{n:"title",f:[{t:2,r:"message.count"}],t:13}],f:[{t:2,x:{r:["message.count"],s:"_0>99?\"∞\":_0"}}]}],n:50,r:"message.count"}," ",{t:7,e:"button",m:[{n:["click"],t:70,f:{r:["@context"],s:"[(_0).toggle(\"__state.show\")]"}}],f:["..."]}," ",{t:7,e:"pre",f:[{t:7,e:"code",f:[{t:4,f:[{t:2,r:".message"}],n:50,r:"__state.show"},{t:4,f:[{t:2,x:{r:[".message"],s:"_0.substring(0,_0.indexOf(\"\\n\"))"}}],n:51,l:1}]}]}]}],n:54,z:[{n:"__state",x:{r:"@local"}}]}],n:50,x:{r:["message.message"],s:"~_0.indexOf(\"\\n\")"}},{t:4,f:[{t:7,e:"li",m:[{n:"class",f:["message ",{t:2,x:{r:[".type"],s:"_0?(\"message-\"+(_0)):\"\""}}],t:13}],f:[{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"message-counter",g:1},{n:"title",f:[{t:2,r:".count"}],t:13}],f:[{t:2,x:{r:[".count"],s:"_0>99?\"∞\":_0"}}]}],n:50,r:".count"}," ",{t:7,e:"pre",f:[{t:7,e:"code",f:[{t:2,r:".message"}]}]}]}],n:51,l:1}],n:52,z:[{n:"message",x:{r:"."}}],r:"messages"}]}]}," ",{t:7,e:"div",m:[{t:13,n:"class",f:"eval",g:1}],f:[{t:7,e:"div",m:[{t:13,n:"class",f:"prompt",g:1}],f:[">"]}," ",{t:7,e:"div",m:[{t:13,n:"class",f:"input",g:1},{n:"codemirror",t:71,f:{r:["~/settings.editor.mobile"],s:"[{lineNumbers:false,bind:\"~/eval.str\",mode:\"javascript\",inputStyle:_0?\"password\":\"contenteditable\"}]"}},{n:["keys"],t:70,a:{r:[],s:"[10,13]"},f:{r:["@this","@event"],s:"[_0.eval(_1)]"}},{n:["keys"],t:70,a:{r:[],s:"[38]"},f:{r:["@this","@event"],s:"[_0.evalUp(_1)]"}},{n:["keys"],t:70,a:{r:[],s:"[40]"},f:{r:["@this","@event"],s:"[_0.evalDown(_1)]"}}],f:[{t:2,x:{r:["@this","@context"],s:"_0.set(\"@.consoleInput\",(_1))&&\"\""},s:1}]}," ",{t:7,e:"div",m:[{t:13,n:"style",f:"cursor: pointer;",g:1},{t:13,n:"class",f:"clear",g:1},{n:["click"],t:70,f:{r:["@this"],s:"[_0.set(\"messages\",[])]"}},{n:"title",f:"Clear console",t:13,g:1}],f:["∅"]}]}]}],"file-editor":[{t:7,e:"div",m:[{t:13,n:"class",f:"code editor",g:1},{n:"codemirror",t:71,f:{r:["~/settings.editor.theme","~/settings.editor.keymode","~/settings.editor.highlightActive","~/settings.editor.wrap","~/other.selectedFile","fileMode","~/settings.editor.mobile","~/settings.editor.tabSize","~/settings.editor.autoTag","~/settings.editor.autoBracket"],s:"[{theme:_0,keyMap:_1||\"default\",styleActiveLine:_2,lineWrapping:_3,bind:(\"unit.fs.\"+(_4)+\".content\"),mode:_5,inputStyle:_6?\"password\":\"contenteditable\",tabSize:_7||2,autoCloseTags:_8,autoCloseBrackets:_9,lint:true,lintOnChange:true}]"}}]}],css:[{t:7,e:"div",m:[{t:13,n:"class",f:"css editor",g:1},{n:"codemirror",t:71,f:{r:["~/settings.editor.theme","~/settings.editor.keymode","~/settings.editor.highlightActive","~/settings.editor.wrap","~/settings.editor.mobile","~/settings.editor.tabSize","~/settings.editor.autoTag","~/settings.editor.autoBracket"],s:"[{theme:_0,keyMap:_1||\"default\",styleActiveLine:_2,lineWrapping:_3,bind:\"~/unit.c\",mode:\"css\",inputStyle:_4?\"password\":\"contenteditable\",tabSize:_5||2,autoCloseTags:_6,autoCloseBrackets:_7,lint:true,lintOnChange:true}]"}}]}],script:[{t:7,e:"div",m:[{t:13,n:"class",f:"script editor",g:1},{n:"codemirror",t:71,f:{r:["~/settings.editor.theme","~/settings.editor.keymode","~/settings.editor.highlightActive","~/settings.editor.wrap","~/settings.editor.mobile","~/settings.editor.tabSize","~/settings.editor.autoTag","~/settings.editor.autoBracket"],s:"[{theme:_0,keyMap:_1||\"default\",styleActiveLine:_2,lineWrapping:_3,bind:\"~/unit.s\",mode:\"javascript\",inputStyle:_4?\"password\":\"contenteditable\",tabSize:_5||2,autoCloseTags:_6,autoCloseBrackets:_7,lint:true,lintOnChange:true}]"}}]}],html:[{t:7,e:"div",m:[{t:13,n:"class",f:"html editor",g:1},{n:"codemirror",t:71,f:{r:["~/settings.editor.theme","~/settings.editor.keymode","~/settings.editor.highlightActive","~/settings.editor.wrap","~/settings.editor.mobile","~/settings.editor.tabSize","~/settings.editor.autoTag","~/settings.editor.autoBracket"],s:"[{theme:_0,keyMap:_1||\"default\",styleActiveLine:_2,lineWrapping:_3,bind:\"~/unit.t\",mode:{name:\"handlebars\",base:\"text/html\"},inputStyle:_4?\"password\":\"contenteditable\",tabSize:_5||2,autoCloseTags:_6,autoCloseBrackets:_7,lint:true,lintOnChange:true}]"}}]}],"l-1-small":[{t:7,e:"div",m:[{t:13,n:"class",f:"main",g:1}],f:[{t:7,e:"tabs",m:[{n:"flat",f:0,t:13},{n:"fill",f:0,t:13},{n:"height",f:"dynamic",t:13,g:1},{n:"transition",f:"fade",t:13,g:1},{n:"data-script-tab",f:"0",t:13,g:1},{n:"data-output-tab",f:"1",t:13,g:1},{n:"data-console-tab",f:"2",t:13,g:1}],f:[{t:7,e:"tab",m:[{n:"title",f:"Code",t:13,g:1},{n:["enter"],t:70,f:{r:["@this"],s:"[_0.getContext(\".code.editor\").decorators.codemirror.resize(),_0.set(\"other.inCode\",true)]"}},{n:["leave"],t:70,f:{r:["@this"],s:"[_0.set(\"other.inCode\",false)]"}}],f:[{t:7,e:"div",m:[{t:13,n:"class",f:"file-editor-wrapper",g:1}],f:[{t:8,r:"file-editor"}]}]}," ",{t:7,e:"tab",m:[{n:"title",f:"Output",t:13,g:1}],f:[{t:7,e:"div",m:[{n:"output",t:71}]}]}," ",{t:7,e:"tab",m:[{n:"title",f:"Console",t:13,g:1},{n:["enter"],t:70,f:{r:["@this"],s:"[_0.getContext(\".eval .input\").decorators.codemirror.resize()]"}}],f:[{t:8,x:{r:[],s:"\"console\""}}]}]}]}],"l-0-small":[{t:7,e:"div",m:[{t:13,n:"class",f:"main",g:1}],f:[{t:7,e:"tabs",m:[{n:"flat",f:0,t:13},{n:"fill",f:0,t:13},{n:"height",f:"dynamic",t:13,g:1},{n:"transition",f:"fade",t:13,g:1},{n:"data-html-tab",f:"0",t:13,g:1},{n:"data-script-tab",f:"1",t:13,g:1},{n:"data-css-tab",f:"2",t:13,g:1},{n:"data-output-tab",f:"3",t:13,g:1},{n:"data-console-tab",f:"4",t:13,g:1}],f:[{t:7,e:"tab",m:[{n:"title",f:"HTML",t:13,g:1},{n:["enter"],t:70,f:{r:["@this"],s:"[_0.getContext(\".html.editor\").decorators.codemirror.resize()]"}}],f:[{t:8,r:"html"}]}," ",{t:7,e:"tab",m:[{n:"title",f:"Script",t:13,g:1},{n:["enter"],t:70,f:{r:["@this"],s:"[_0.getContext(\".script.editor\").decorators.codemirror.resize()]"}}],f:[{t:8,r:"script"}]}," ",{t:7,e:"tab",m:[{n:"title",f:"CSS",t:13,g:1},{n:["enter"],t:70,f:{r:["@this"],s:"[_0.getContext(\".css.editor\").decorators.codemirror.resize()]"}}],f:[{t:8,r:"css"}]}," ",{t:7,e:"tab",m:[{n:"title",f:"Output",t:13,g:1}],f:[{t:7,e:"div",m:[{n:"output",t:71}]}]}," ",{t:7,e:"tab",m:[{n:"title",f:"Console",t:13,g:1},{n:["enter"],t:70,f:{r:["@this"],s:"[_0.getContext(\".eval .input\").decorators.codemirror.resize()]"}}],f:[{t:8,x:{r:[],s:"\"console\""}}]}]}]}],"l-1-medium":[{t:7,e:"div",m:[{t:13,n:"class",f:"main",g:1}],f:[{t:7,e:"split",f:[{t:7,e:"div",m:[{t:13,n:"class",f:"file-editor-wrapper",g:1}],f:[{t:8,r:"file-editor"}]}," ",{t:7,e:"tabs",m:[{n:"flat",f:0,t:13},{n:"fill",f:0,t:13},{n:"height",f:"dynamic",t:13,g:1},{n:"transition",f:"fade",t:13,g:1},{n:"data-output-tab",f:"0",t:13,g:1},{n:"data-console-tab",f:"1",t:13,g:1}],f:[{t:7,e:"tab",m:[{n:"title",f:"Output",t:13,g:1}],f:[{t:7,e:"div",m:[{n:"output",t:71}]}]}," ",{t:7,e:"tab",m:[{n:"title",f:"Console",t:13,g:1},{n:["enter"],t:70,f:{r:["@this"],s:"[_0.getContext(\".eval .input\").decorators.codemirror.resize()]"}}],f:[{t:8,x:{r:[],s:"\"console\""}}]}]}]}]}],"l-0-medium":[{t:7,e:"div",m:[{t:13,n:"class",f:"main",g:1}],f:[{t:7,e:"split",f:[{t:7,e:"tabs",m:[{n:"flat",f:0,t:13},{n:"fill",f:0,t:13},{n:"height",f:"dynamic",t:13,g:1},{n:"transition",f:"fade",t:13,g:1},{n:"data-html-tab",f:"0",t:13,g:1},{n:"data-script-tab",f:"1",t:13,g:1},{n:"data-css-tab",f:"2",t:13,g:1}],f:[{t:7,e:"tab",m:[{n:"title",f:"HTML",t:13,g:1},{n:["enter"],t:70,f:{r:["@this"],s:"[_0.getContext(\".html.editor\").decorators.codemirror.resize()]"}}],f:[{t:8,r:"html"}]}," ",{t:7,e:"tab",m:[{n:"title",f:"Script",t:13,g:1},{n:["enter"],t:70,f:{r:["@this"],s:"[_0.getContext(\".script.editor\").decorators.codemirror.resize()]"}}],f:[{t:8,r:"script"}]}," ",{t:7,e:"tab",m:[{n:"title",f:"CSS",t:13,g:1},{n:["enter"],t:70,f:{r:["@this"],s:"[_0.getContext(\".css.editor\").decorators.codemirror.resize()]"}}],f:[{t:8,r:"css"}]}]}," ",{t:7,e:"tabs",m:[{n:"flat",f:0,t:13},{n:"fill",f:0,t:13},{n:"height",f:"dynamic",t:13,g:1},{n:"transition",f:"fade",t:13,g:1},{n:"data-output-tab",f:"0",t:13,g:1},{n:"data-console-tab",f:"1",t:13,g:1}],f:[{t:7,e:"tab",m:[{n:"title",f:"Output",t:13,g:1}],f:[{t:7,e:"div",m:[{n:"output",t:71}]}]}," ",{t:7,e:"tab",m:[{n:"title",f:"Console",t:13,g:1},{n:["enter"],t:70,f:{r:["@this"],s:"[_0.getContext(\".eval .input\").decorators.codemirror.resize()]"}}],f:[{t:8,x:{r:[],s:"\"console\""}}]}]}]}]}],"l-1-large":[{t:7,e:"div",m:[{t:13,n:"class",f:"main",g:1}],f:[{t:7,e:"split",f:[{t:7,e:"div",m:[{t:13,n:"class",f:"file-editor-wrapper",g:1}],f:[{t:8,r:"file-editor"}]}," ",{t:7,e:"split",m:[{n:"vertical",f:0,t:13}],f:[{t:7,e:"div",m:[{n:"output",t:71}]}," ",{t:7,e:"div",m:[{t:13,n:"class",f:"console-wrapper",g:1}],f:[{t:8,x:{r:[],s:"\"console\""}}]}]}]}]}],"l-0-large":[{t:7,e:"div",m:[{t:13,n:"class",f:"main",g:1}],f:[{t:7,e:"split",f:[{t:7,e:"split",m:[{n:"vertical",f:0,t:13}],f:[{t:7,e:"tabs",m:[{n:"flat",f:0,t:13},{n:"fill",f:0,t:13},{n:"height",f:"dynamic",t:13,g:1},{n:"transition",f:"fade",t:13,g:1}],f:[{t:7,e:"tab",m:[{n:"title",f:"HTML",t:13,g:1}],f:[{t:8,r:"html"}]}]}," ",{t:7,e:"tabs",m:[{n:"flat",f:0,t:13},{n:"fill",f:0,t:13},{n:"height",f:"dynamic",t:13,g:1},{n:"transition",f:"fade",t:13,g:1},{n:"data-script-tab",f:"0",t:13,g:1},{n:"data-css-tab",f:"1",t:13,g:1}],f:[{t:7,e:"tab",m:[{n:"title",f:"Script",t:13,g:1},{n:["enter"],t:70,f:{r:["@this"],s:"[_0.getContext(\".script.editor\").decorators.codemirror.resize()]"}}],f:[{t:8,r:"script"}]}," ",{t:7,e:"tab",m:[{n:"title",f:"CSS",t:13,g:1},{n:["enter"],t:70,f:{r:["@this"],s:"[_0.getContext(\".css.editor\").decorators.codemirror.resize()]"}}],f:[{t:8,r:"css"}]}]}]}," ",{t:7,e:"split",m:[{n:"vertical",f:0,t:13}],f:[{t:7,e:"div",m:[{n:"output",t:71}]}," ",{t:7,e:"div",m:[{t:13,n:"class",f:"console-wrapper",g:1}],f:[{t:8,x:{r:[],s:"\"console\""}}]}]}]}]}],"l-1-huge":[{t:7,e:"div",m:[{t:13,n:"class",f:"main",g:1}],f:[{t:7,e:"split",f:[{t:7,e:"div",m:[{t:13,n:"class",f:"file-editor-wrapper",g:1}],f:[{t:8,r:"file-editor"}]}," ",{t:7,e:"split",m:[{n:"vertical",f:0,t:13}],f:[{t:7,e:"div",m:[{n:"output",t:71}]}," ",{t:7,e:"div",m:[{t:13,n:"class",f:"console-wrapper",g:1}],f:[{t:8,x:{r:[],s:"\"console\""}}]}]}]}]}],"l-0-huge":[{t:7,e:"div",m:[{t:13,n:"class",f:"main",g:1}],f:[{t:7,e:"split",f:[{t:7,e:"split",m:[{n:"vertical",f:0,t:13}],f:[{t:7,e:"tabs",m:[{n:"flat",f:0,t:13},{n:"fill",f:0,t:13},{n:"height",f:"dynamic",t:13,g:1},{n:"transition",f:"fade",t:13,g:1}],f:[{t:7,e:"tab",m:[{n:"title",f:"HTML",t:13,g:1}],f:[{t:8,r:"html"}]}]}," ",{t:7,e:"tabs",m:[{n:"flat",f:0,t:13},{n:"fill",f:0,t:13},{n:"height",f:"dynamic",t:13,g:1},{n:"transition",f:"fade",t:13,g:1}],f:[{t:7,e:"tab",m:[{n:"title",f:"Script",t:13,g:1}],f:[{t:8,r:"script"}]}]}," ",{t:7,e:"tabs",m:[{n:"flat",f:0,t:13},{n:"fill",f:0,t:13},{n:"height",f:"dynamic",t:13,g:1},{n:"transition",f:"fade",t:13,g:1}],f:[{t:7,e:"tab",m:[{n:"title",f:"CSS",t:13,g:1}],f:[{t:8,r:"css"}]}]}]}," ",{t:7,e:"split",m:[{n:"vertical",f:0,t:13}],f:[{t:7,e:"div",m:[{n:"output",t:71}]}," ",{t:7,e:"div",m:[{t:13,n:"class",f:"console-wrapper",g:1}],f:[{t:8,x:{r:[],s:"\"console\""}}]}]}]}]}]}}, function(data) { return [(function(data) {
     return ("\n   .editor {\n     height: 100%;\n     overflow: hidden;\n     flex-grow: 1;\n   }\n \n   .main-wrapper {\n     display: flex;\n     flex-direction: column;\n     position: absolute;\n     top: 0;\n     bottom: 0;\n     width: 100%;\n     height: 100%;\n   }\n \n   .main {\n     flex-grow: 1;\n     position: relative;\n     display: flex;\n     height: 100%;\n   }\n \n   .file-editor-wrapper {\n     height: 100%;\n     display: flex;\n     flex-direction: column;\n   }\n \n   .file-editor-wrapper div {\n     flex-grow: 1;\n   }\n \n   .rmenu h3 {\n     font-size: 1.2em;\n     margin: 0.2em;\n   }\n \n   .rmenu label {\n     display: flex;\n     flex-direction: column;\n     margin-bottom: 1em;\n   }\n \n   .rmenu select {\n     border: none;\n     display: block;\n     width: 100%;\n     background-color: #fff;\n     color: #222;\n     padding: 0.5em;\n     box-sizing: border-box;\n     font-size: 1em;\n   }\n \n   .rmenu .check {\n     display: block;\n     margin-bottom: 0.5em;\n   }\n \n   .rmenu .check input {\n     width: 1em;\n     height: 1em;\n     vertical-align: middle;\n   }\n \n   .rmenu input {\n     padding: 0.5em;\n   }\n \n   .files-tab {\n     display: flex;\n     flex-direction: column;\n   }\n \n   .rmenu ul.files, .rmenu ul.scripts, .rmenu ul.globals {\n     padding: 0;\n     margin: 0;\n     list-style: none;\n     flex-grow: 1;\n   }\n \n   .rmenu ul.files li, .rmenu ul.scripts li, .rmenu ul.globals li {\n     padding: 0.2em 0.5em;\n     margin: 0;\n     display: flex;\n     align-items: center;\n   }\n \n   .rmenu ul.files li {\n     cursor: pointer;\n   }\n \n   .rmenu ul.files div.remove, .rmenu ul.scripts div.remove, .rmenu ul.globals div.remove {\n     width: 1em;\n     text-align: center;\n     font-size: 1.2em;\n     cursor: pointer;\n   }\n \n   .rmenu ul.files .selected {\n     color: " + (data('raui.primary.fga') || '#00818a') + ";\n     background-color: #fff;\n   }\n \n   .rmenu ul.files div:first-of-type {\n     flex-grow: 1;\n   }\n \n   .rmenu ul.files .renaming {\n     padding: 0;\n   }\n \n   .rmenu ul.files input {\n     width: 100%;\n     box-sizing: border-box;\n     flex-grow: 1;\n   }\n \n   .rmenu ul.scripts input, .rmenu ul.globals input {\n     flex-grow: 1;\n     background-color: #fff;\n     border: none;\n   }\n   .rmenu ul.globals input {\n     width: 45%;\n   }\n \n   .content-menu {\n     display: flex;\n     flex-direction: column;\n     padding: 0.5em;\n     box-sizing: border-box;\n     height: 100%;\n   }\n \n   .rmenu .menuarea {\n     display: flex;\n     flex-direction: column;\n     margin-bottom: 1em;\n     flex-grow: 1;\n   }\n   .menuarea textarea {\n     flex-grow: 1;\n   }\n \n   .play-button {\n     cursor: pointer;\n     line-height: 1em;\n     height: 1em;\n     font-size: 1.5em;\n     width: 1.5em;\n     text-align: center;\n     user-select: none;\n   }\n   .hamburger {\n     width: 2em;\n     text-align: center;\n     user-select: none;\n     cursor: pointer;\n   }\n \n   .output {\n     border: none;\n     position: absolute;\n     top: 0;\n     left: 0;\n     width: 100%;\n     height: 100%;\n   }\n \n   /* console */\n   .console {\n     display: flex;\n     flex-direction: column;\n     flex-grow: 1;\n     height: 100%;\n     overflow: hidden;\n   }\n \n   .console-wrapper {\n     display: flex;\n     flex-direction: column;\n     height: 100%;\n     width: 100%;\n   }\n \n   [data-console-tab] {\n     transition-duration: 0.5s;\n     transition-timing-function: ease-out;\n     transition-property: background-color;\n   }\n \n   .console .eval {\n     height: 1.65em;\n     display: flex;\n     flex-shrink: 2;\n   }\n \n   .console .prompt {\n     text-align: center;\n     width: 1.2em;\n     color: " + (data('raui.primary.fga') || '#00818a') + ";\n     user-select: none;\n   }\n \n   .console .eval .input {\n     flex-grow: 1;\n   }\n \n   .console .clear {\n     width: 1.5em;\n     cursor: pointer;\n     user-select: none;\n   }\n \n   .console .messages {\n     flex-grow: 1;\n     overflow: auto;\n     flex-shrink: 2;\n     height: 100%;\n   }\n \n   .console ul {\n     list-style: none;\n     margin: 0;\n     padding: 0;\n   }\n \n   .console li {\n     margin: 0;\n     padding: 0;\n   }\n \n   .console li.message {\n     padding: 0.25em 0.5em;\n     border-bottom: 1px solid #ccc;\n     position: relative;\n   }\n   .console li.message-warn {\n     background-color: #ffd;\n   }\n   .console li.message-error {\n     background-color: #fde;\n   }\n   .console li.message-info {\n     background-color: #e8f2ff;\n   }\n   .console li.message-result {\n     font-style: oblique;\n     color: #666;\n   }\n   .console li.message pre {\n     max-width: 100%;\n     overflow-x: hidden;\n     padding: 0;\n     margin: 0;\n     white-space: pre-wrap;\n   }\n \n   .console .message button {\n     float: right;\n     margin: 0 0.2em;\n     height: 1.2em;\n     line-height: 0;\n     padding: 0.2em 0.5em;\n     box-sizing: border-box;\n     vertical-align: top;\n     background-color: #eee;\n     border: 1px solid #000;\n     border-radius: 0.5em;\n     outline: none;\n     min-height: 0;\n     box-shadow: none;\n     font-size: 0.9em;\n     color: #222;\n   }\n \n   .message-counter {\n     float: right;\n     color: #fff;\n     background-color: " + (data('raui.primary.fga') || '#00818a') + ";\n     width: 1.5em;\n     height: 1em;\n     text-align: center;\n     line-height: 1em;\n     border-radius: 1em;\n   }");
  }).call(this, data)].join(' '); });

}(Ractive));
