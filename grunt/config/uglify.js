module.exports = [
		{ dest: '<%= tmpDir %>/ractive.min.js', src: '<%= tmpDir %>/ractive.js' },
		{ dest: '<%= tmpDir %>/ractive-legacy.min.js', src: '<%= tmpDir %>/ractive-legacy.js' },
		{ dest: '<%= tmpDir %>/ractive.runtime.min.js', src: '<%= tmpDir %>/ractive.runtime.js' },
		{ dest: '<%= tmpDir %>/ractive-legacy.runtime.min.js', src: '<%= tmpDir %>/ractive-legacy.runtime.js' }
	];
