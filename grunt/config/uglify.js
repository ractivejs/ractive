module.exports = [
	{ dest: '<%= tmpDir %>/src/ractive.min.js', src: '<%= tmpDir %>/src/ractive.js' },
	{ dest: '<%= tmpDir %>/src/ractive-legacy.min.js', src: '<%= tmpDir %>/src/ractive-legacy.js' },
	{ dest: '<%= tmpDir %>/src/ractive.runtime.min.js', src: '<%= tmpDir %>/src/ractive.runtime.js' },
	{ dest: '<%= tmpDir %>/src/ractive-legacy.runtime.min.js', src: '<%= tmpDir %>/src/ractive-legacy.runtime.js' }
];
