# changelog

## 0.2.1

* `sander.copydir()` no longer fails with empty directories

## 0.2.0

* Now using [graceful-fs](https://github.com/isaacs/node-graceful-fs), to prevent EMFILE errors from ruining your day
* Intermediate directories are created by `sander.link()`, `sander.rename()` and their synchronous equivalents
