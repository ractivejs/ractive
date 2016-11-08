# Getting Started

Welcome! These pages aim to provide all the information you need to master Ractive.

## Download

Ractive is available in several places:

```
// unpkg
https://unpkg.com/ractive

// CDNjs
https://cdnjs.com/libraries/ractive

// npm
$ npm install --save-dev ractive

// Bower
$ bower install --save ractive
```

## Usage

Using Ractive is very simple. Create a new instance using `new Ractive({...})` with the desired options. 

```js
var ractive = new Ractive({
    el: 'container',
    template: '<p>{{greeting}}, {{recipient}}</p>',
    data: {
        greeting: 'Hello',
        recipient: 'world'
    }
});
```

While there are _no required options_, `el`, `template` and `data` are the most common. They specify _what element_ to attach an instance with _this markup_ having _this data_. Check out [Initialization Options]() to learn more about the available options.

If you get stuck at any point, visit the [Get Support]() page for places to find help.

## Philosophy

Ractive takes care of your UI and your application state. But if you're building a complex app, you'll likely have other things. Routing, history management, server communication, data validation, realtime communication, user authentication, and all the other fun stuff that goes into a web app.

Ractive doesn't have an opinion about these things, unlike mega-frameworks like Angular and Ember. You're encouraged to build your app from small, loosely coupled modules. It means you're not locked-in writing code The Right Way™ for a particular framework. Should you want to, you can easily swap out a module for another.