module.exports = function ( grunt ) {

    'use strict';

    var qunitConfig = {},
        tests = grunt.template.process( 'test/modules/**/*.js' );

    grunt.file.expand( tests ).forEach( function ( path ) {
        var testName = /test\/modules\/(.+)\.js/.exec( path )[1];

        if ( testName === 'index' ) {
            testName = 'all';
        }

        qunitConfig[ testName.replace(/\//g, '-') ] = '<%= tmpDir %>/' + path.replace( '/modules/', '/tests/' ).replace( '.js', '.html' );
    });

    qunitConfig.all = '<%= tmpDir %>/test/tests/index.html';

    return qunitConfig;

};
