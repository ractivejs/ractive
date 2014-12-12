var path = require( 'path' ),
	fs = require( 'graceful-fs' ),
	Promise = require( 'es6-promise' ).Promise,
	mkdirp = require( 'mkdirp' ),
	rimraf = require( 'rimraf' ),

	sander = exports,

	standardMethods,
	fileDescriptorMethods,
	specialMethods;

standardMethods = 'chmod chown createReadStream createWriteStream lchmod lchown lstat readdir readFile readlink realpath rmdir stat truncate unlink utimes unwatchFile watch watchFile'.split( ' ' );
fileDescriptorMethods = 'close fchmod fchown fstat fsync ftruncate futimes read'.split( ' ' );

specialMethods = 'createReadStream createWriteStream unwatchFile watch watchFile'.split( ' ' );

standardMethods.forEach( function ( methodName ) {
	[ true, false ].forEach( function ( isSync ) {
		var qualifiedMethodName, method, isSpecial;

		isSpecial = ~specialMethods.indexOf( methodName );

		if ( isSpecial && !isSync ) {
			return;
		}

		qualifiedMethodName = ( isSync && !isSpecial ) ? methodName + 'Sync' : methodName;

		method = function () {
			var buildingPath = true,
				pathargs = [],
				args = [ null ],
				resolvedPath,
				len = arguments.length,
				i;

			for ( i = 0; i < len; i += 1 ) {
				if ( buildingPath && typeof arguments[i] === 'string' ) {
					pathargs[i] = arguments[i];
				} else {
					buildingPath = false;
					args.push( arguments[i] );
				}
			}

			args[0] = resolvedPath = resolve( pathargs );

			if ( isSync ) {
				return fs[ qualifiedMethodName ].apply( fs, args );
			}

			return new Promise( function ( fulfil, reject ) {
				var callback = function ( err, result ) {
					if ( err ) {
						reject( err );
					} else {
						fulfil( result );
					}
				};

				args.push( callback );
				fs[ methodName ].apply( fs, args );
			});
		};

		sander[ qualifiedMethodName ] = method;
	});
});

fileDescriptorMethods.forEach( function ( methodName ) {
	[ true, false ].forEach( function ( isSync ) {
		var qualifiedMethodName, method;

		qualifiedMethodName = isSync ? methodName + 'Sync' : methodName;

		method = function () {
			var args, i;

			if ( isSync ) {
				return fs[ qualifiedMethodName ].apply( fs, arguments );
			}

			args = [];
			i = arguments.length;
			while ( i-- ) {
				args[i] = arguments[i];
			}

			return new Promise( function ( fulfil, reject ) {
				var callback = function ( err, result ) {
					if ( err ) {
						reject( err );
					} else {
						fulfil( result );
					}
				};

				args.push( callback );
				fs[ qualifiedMethodName ].apply( fs, args );
			});
		};

		sander[ qualifiedMethodName ] = method;
	});
});

// sander.rename, sander.renameSync, sander.link, sander.linkSync
[ 'rename', 'link' ].forEach( function ( methodName ) {
	[ true, false ].forEach( function ( isSync ) {
		var qualifiedMethodName, method;

		qualifiedMethodName = isSync ? methodName + 'Sync' : methodName;

		method = function () {
			var src = resolve( arguments );

			return {
				to: function () {
					var dest = resolve( arguments );

					if ( isSync ) {
						mkdirp.sync( path.dirname( dest ) );
						return fs[ qualifiedMethodName ]( src, dest );
					}

					return new Promise( function ( fulfil, reject ) {
						mkdirp( path.dirname( dest ), function ( err ) {
							if ( err ) {
								reject( err );
							} else {
								fs[ qualifiedMethodName ]( src, dest, function ( err, result ) {
									if ( err ) {
										reject( err );
									} else {
										fulfil();
									}
								});
							}
						});

					});
				}
			};
		};

		sander[ qualifiedMethodName ] = method;
	});
});

// sander.symlink, sander.symlinkSync
[ true, false ].forEach( function ( isSync ) {
	var qualifiedMethodName, method;

	qualifiedMethodName = isSync ? 'symlinkSync' : 'symlink';

	method = function () {
		var src = resolve( arguments );

		return {
			to: function () {
				var pathargs, options, dest;

				if ( typeof arguments[ arguments.length - 1 ] === 'object' ) {
					options = arguments[ arguments.length - 1 ];

					pathargs = [];
					i = arguments.length - 1;
					while ( i-- ) {
						pathargs[i] = arguments[i];
					}
				} else {
					options = {};
					pathargs = arguments;
				}

				dest = resolve( pathargs );

				if ( isSync ) {
					return fs.symlinkSync( src, dest, options.type );
				}

				return new Promise( function ( fulfil, reject ) {
					fs.symlink( src, dest, options.type, function ( err, result ) {
						if ( err ) {
							reject( err );
						} else {
							fulfil();
						}
					});
				});
			}
		};
	};

	sander[ qualifiedMethodName ] = method;
});

// sander.open, sander.openSync
[ true, false ].forEach( function ( isSync ) {
	var qualifiedMethodName, method;

	qualifiedMethodName = isSync ? 'openSync' : 'open';

	method = function () {
		var pathargs, options, flags, src, alreadyExists;

		if ( typeof arguments[ arguments.length - 1 ] === 'object' ) {
			options = arguments[ arguments.length - 1 ];
			flags = arguments[ arguments.length - 2 ];

			pathargs = [];
			i = arguments.length - 2;
			while ( i-- ) {
				pathargs[i] = arguments[i];
			}
		} else {
			options = {};
			flags = arguments.length - 1;

			pathargs = [];
			i = arguments.length - 1;
			while ( i-- ) {
				pathargs[i] = arguments[i];
			}
		}

		src = resolve( pathargs );

		shouldCreateDirs = /^[wa]/.test( flags );
		exclusive = /^.x/.test( flags );

		if ( exclusive ) {
			// if the file exists already, ABORT ABORT ABORT
			try {
				fs.statSync( src );
				alreadyExists = true;
			} catch ( err ) {
				if ( err.code !== 'ENOENT' ) {
					throw err;
				}
			}

			if ( alreadyExists ) {
				// attempt the operation = that way, we get the intended error message
				fs.openSync( src, flags, options.mode );
			}
		}

		if ( isSync ) {
			if ( shouldCreateDirs ) {
				mkdirp.sync( path.dirname( src ) );
			}

			return fs.openSync( src, flags, options.mode );
		}

		return new Promise( function ( fulfil, reject ) {
			if ( shouldCreateDirs ) {
				mkdirp( path.dirname( src ), function ( err, result ) {
					if ( err ) {
						reject( err );
					} else {
						open();
					}
				});
			} else {
				open();
			}

			function open () {
				fs.open( src, flags, options.mode, function ( err, fd ) {
					if ( err ) {
						reject( err );
					} else {
						fulfil( fd );
					}
				});
			}
		});
	};

	sander[ qualifiedMethodName ] = method;
});

// sander.mkdir and sander.mkdirSync
[ true, false ].forEach( function ( isSync ) {
	var qualifiedMethodName, method;

	qualifiedMethodName = isSync ? 'mkdirSync' : 'mkdir';

	method = function () {
		var dir = resolve( arguments );

		if ( isSync ) {
			return mkdirp.sync( dir );
		}

		return new Promise( function ( fulfil, reject ) {
			mkdirp( dir, function ( err ) {
				if ( err ) {
					reject( err );
				} else {
					fulfil();
				}
			});
		});
	};

	sander[ qualifiedMethodName ] = method;
});

// sander.writeFile and sander.writeFileSync
[ true, false ].forEach( function ( isSync ) {
	var qualifiedMethodName, method;

	qualifiedMethodName = isSync ? 'writeFileSync' : 'writeFile';

	method = function () {
		var data, pathargs = [], i, dest;

		i = arguments.length;
		data = arguments[ --i ];

		while ( i-- ) {
			pathargs[i] = arguments[i];
		}

		dest = resolve( pathargs );

		if ( isSync ) {
			mkdirp.sync( path.dirname( dest ) );
			return fs.writeFileSync( dest, data );
		}

		return new Promise( function ( fulfil, reject ) {
			mkdirp( path.dirname( dest ), function ( err ) {
				if ( err ) {
					reject( err );
				} else {
					fs.writeFile( dest, data, function ( err ) {
						if ( err ) {
							reject( err );
						} else {
							fulfil();
						}
					});
				}
			});
		});
	};

	sander[ qualifiedMethodName ] = method;
});

[ 'createReadStream', 'createWriteStream' ].forEach( function ( methodName ) {
	sander[ methodName ] = function () {
		var options, pathargs, i, filepath;

		if ( typeof arguments[ arguments.length - 1 ] === 'object' ) {
			options = arguments[ arguments.length - 1 ];

			i = arguments.length - 1;
			pathargs = [];
			while ( i-- ) {
				pathargs[i] = arguments[i];
			}
		} else {
			pathargs = arguments;
		}

		filepath = resolve( pathargs );

		if ( methodName === 'createWriteStream' ) {
			mkdirp.sync( path.dirname( filepath ) );
		}

		return fs[ methodName ]( filepath, options );
	};
});

/* Extra methods */

// sander.copyFile, sander.copyFileSync
[ true, false ].forEach( function ( isSync ) {
	var qualifiedMethodName, method;

	qualifiedMethodName = isSync ? 'copyFileSync' : 'copyFile';

	method = function () {
		var src, readOptions, pathargs, i;

		if ( typeof arguments[ arguments.length - 1 ] === 'object' ) {
			readOptions = arguments[ arguments.length - 1 ];

			i = arguments.length - 1;
			pathargs = [];
			while ( i-- ) {
				pathargs[i] = arguments[i];
			}
		} else {
			pathargs = arguments;
		}

		src = resolve( pathargs );

		return {
			to: function () {
				var dest, writeOptions, pathargs, i;

				if ( typeof arguments[ arguments.length - 1 ] === 'object' ) {
					writeOptions = arguments[ arguments.length - 1 ];

					i = arguments.length - 1;
					pathargs = [];
					while ( i-- ) {
						pathargs[i] = arguments[i];
					}
				} else {
					pathargs = arguments;
				}

				dest = resolve( pathargs );

				if ( isSync ) {
					data = fs.readFileSync( src, readOptions );

					mkdirp.sync( path.dirname( dest ) );
					return fs.writeFileSync( dest, data, writeOptions );
				}

				return new Promise( function ( fulfil, reject ) {
					mkdirp( path.dirname( dest ), function ( err ) {
						var readStream, writeStream;

						if ( err ) {
							reject( err );
						} else {
							readStream = fs.createReadStream( src, readOptions );
							writeStream = fs.createWriteStream( dest, writeOptions );

							readStream.on( 'error', reject );
							writeStream.on( 'error', reject );

							writeStream.on( 'close', fulfil );

							readStream.pipe( writeStream );
						}
					});
				});
			}
		};
	};

	sander[ qualifiedMethodName ] = method;
});

// sander.copydir, sander.copydirSync
[ true, false ].forEach( function ( isSync ) {
	var qualifiedMethodName, method;

	qualifiedMethodName = isSync ? 'copydirSync' : 'copydir';

	method = function () {
		var src, readOptions, pathargs, i;

		if ( typeof arguments[ arguments.length - 1 ] === 'object' ) {
			readOptions = arguments[ arguments.length - 1 ];

			i = arguments.length - 1;
			pathargs = [];
			while ( i-- ) {
				pathargs[i] = arguments[i];
			}
		} else {
			pathargs = arguments;
		}

		src = resolve( pathargs );

		return {
			to: function () {
				var dest, writeOptions, pathargs, i, copydir;

				if ( typeof arguments[ arguments.length - 1 ] === 'object' ) {
					writeOptions = arguments[ arguments.length - 1 ];

					i = arguments.length - 1;
					pathargs = [];
					while ( i-- ) {
						pathargs[i] = arguments[i];
					}
				} else {
					pathargs = arguments;
				}

				dest = resolve( pathargs );

				if ( isSync ) {
					copydir = function ( src, dest ) {
						mkdirp.sync( dest );

						fs.readdirSync( src ).forEach( function ( filename ) {
							var srcpath = src + path.sep + filename,
								destpath = dest + path.sep + filename;

							if ( fs.statSync( srcpath ).isDirectory() ) {
								return copydir( srcpath, destpath );
							}

							data = fs.readFileSync( srcpath, readOptions );
							fs.writeFileSync( destpath, data, writeOptions );
						});
					};

					return copydir( src, dest );
				}

				copydir = function ( src, dest, cb ) {
					mkdirp( dest, function ( err ) {
						if ( err ) return cb( err );

						fs.readdir( src, function ( err, files ) {
							var remaining,
								check;

							if ( err ) return cb( err );

							remaining = files.length;

							if ( !remaining ) return cb();

							check = function ( err ) {
								if ( err ) {
									return cb( err );
								}

								if ( !--remaining ) {
									cb();
								}
							};

							files.forEach( function ( filename ) {
								var srcpath = src + path.sep + filename,
									destpath = dest + path.sep + filename;

								fs.stat( srcpath, function ( err, stats ) {
									var readStream, writeStream;

									if ( stats.isDirectory() ) {
										return copydir( srcpath, destpath, check );
									}

									readStream = fs.createReadStream( srcpath, readOptions );
									writeStream = fs.createWriteStream( destpath, writeOptions );

									readStream.on( 'error', cb );
									writeStream.on( 'error', cb );

									writeStream.on( 'close', check );

									readStream.pipe( writeStream );
								});
							});
						});
					});
				};

				return new Promise( function ( fulfil, reject ) {
					copydir( src, dest, function ( err ) {
						if ( err ) return reject( err );
						fulfil();
					});
				});
			}
		};
	};

	sander[ qualifiedMethodName ] = method;
});

// sander.lsr, sander.lsrSync
sander.lsr = function () {
	var basedir = resolve( arguments );

	return new Promise( function ( fulfil, reject ) {
		var result = [];

		processdir( basedir, function ( err ) {
			if ( err ) {
				reject( err );
			} else {
				fulfil( result );
			}
		});

		function processdir ( dir, cb ) {
			fs.readdir( dir, function ( err, files ) {
				var remaining, check;

				if ( err ) {
					cb( err );
				} else {
					remaining = files.length;

					if ( !remaining ) {
						return cb();
					}

					files = files.map( function ( file ) {
						return dir + path.sep + file;
					});

					check = function ( err ) {
						if ( err ) {
							cb( err );
						}

						else if ( !--remaining ) {
							cb();
						}
					};

					files.forEach( function ( file ) {
						fs.stat( file, function ( err, stats ) {
							if ( err ) {
								cb( err );
							} else {
								if ( stats.isDirectory() ) {
									processdir( file, check );
								} else {
									result.push( file.replace( basedir + path.sep, '' ) );
									check();
								}
							}
						});
					});
				}
			});
		}
	});
};

sander.lsrSync = function () {
	var basedir = resolve( arguments ), result = [];

	processdir( basedir );
	return result;

	function processdir ( dir ) {
		fs.readdirSync( dir ).forEach( function ( file ) {
			var filepath = dir + path.sep + file;

			if ( fs.statSync( filepath ).isDirectory() ) {
				processdir( filepath );
			} else {
				result.push( filepath.replace( basedir + path.sep, '' ) );
			}
		});
	}
};

// sander.rimraf, sander.rimrafSync
sander.rimraf = function () {
	var target = resolve( arguments );

	return new Promise( function ( fulfil, reject ) {
		rimraf( target, function ( err ) {
			if ( err ) {
				reject( err );
			} else {
				fulfil();
			}
		});
	});
};

sander.rimrafSync = function () {
	rimraf.sync( resolve( arguments ) );
};

// sander.exists, sander.existsSync
sander.exists = function () {
	var target = resolve( arguments );

	return new Promise( function ( fulfil ) {
		fs.exists( target, function ( exists ) {
			fulfil( exists );
		});
	});
};

sander.existsSync = function () {
	return fs.existsSync( resolve( arguments ) );
};

sander.Promise = Promise;


function resolve ( pathargs ) {
	return path.resolve.apply( null, pathargs );
}
