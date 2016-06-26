# Ractive General Overview

There are three major sections in the Ractive source to handle each of data, the DOM and virtual DOM, and parsing template strings to Ractive's template AST. Each of those sections mostly lives in its own folder in the `src` tree: `model`, `view`, and `parse`, respectively. This document aims to give a general overview of what each section does so that you can hopefully find what you need to fix a bug, add a feature, or just understand how something works internally.

__Note:__ This project is the brainchild of an Englishman and has contributors from all over the world, so there is an ecclectic mix of primarily the Queen's English, a fair amount of 'Murican English, and a bit of other here and there. Things like `adaptor`, `behaviour`, and `dependant` may have more than one spelling here and there, but we try to stick to the Queen's to the extent that we are able :smile:.

## Data and Models

Ractive wraps any data given to it into a tree-like hierarchy of `Model`. Any data that is rendered into a template will be bound to a `Model`. Access to read and write data in Ractive is handled through the model hierarchy based on keypaths, which are, generally, a list of object properties that one would need to follow to reach a leaf of the data tree starting from the root. Each key along the keypath has its own corresponding model.

Models allow entities that depend upon them to register themeselves to receive change notifications when the model value changes. This is how Ractive keeps track of exactly which parts of the view need to be updated when values change.

Read more about models in the [model overview](model/).

## Virtual DOM

Every piece of DOM that Ractive can manage has a corresponding class in the virtual DOM to handle the DOM node, which generally end up being either Elements or Text Nodes. View items are grouped together as Fragments of view, which may then be owned by other fragments or items. At the root of every ractive instance is a Fragment instance that contains its entire virtual DOM tree. Each Ractive template construct has at least one analog in the virtual DOM. The bulk of Ractive's view functionality is implemented in the Section, Interpolator, and Element items, with there being a number of specialized element classes to handle special types of HTML element.

All virtual DOM items go through roughly the same lifecycle: creation, binding, rendering, bubbling, updating, unrendering, and unbinding. Creation is basically just the constructor call and almost always is immediately followed by binding. Binding is the point at which the item resolves and registers with its data references. Rendering is the point at which the item inserts an actual DOM node into the DOM. Bubbling and updating are the two halves of the update process, which is discussed in the next section. Unrendering is the point at which the item should no longer be present in the DOM, and it often occurs at the same point as unbinding, which is the point at which the item unregisters with the viewmodel and is effectively destroyed.

There a number of other members, such as events and decorators, and processes, such as change propagation, which are described in detail in the [view overview](view/).

## Parsing

Ractive's parser is responsible for taking the (mostly :wink:) human-friendly mustachioed HTML of templates and turning it into an AST that can be turned into vDOM at runtime. Ractive's parser is somewhat unique among its peers in that it handles reading not only the mustache templates, but a fair amount of ES5 and ES6 syntax for expressions.

Each item expressable in Ractive-flavored mustache has its own parsing function that may also be comprised of other parsing functions. Each bit of ES syntax that Ractive understands for expressions also has its own parsing function. The parser starts at the beginning of the template string and starts applying each parsing function in precedence order. Each function will then consume as much of the template as needed to return an item, like an element, a section, a partial, a bit of text, or an interpolator. It may also return nothing. Most items can also contain children, including items of the same type as themselves, and will thus recurse by trying to parse their content.

There is more information about Ractive's parsing in the [parser overview](parse/).

