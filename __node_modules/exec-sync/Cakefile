
fs = require 'fs'
findit = require 'findit'
exec = require('child_process').exec
coffee = require 'coffee-script'
path = require 'path'

escapeShell = (arg) -> "'" + arg.replace(/[^\\]'/g, (m, i, s) -> m.slice(0, 1) + "\\'") + "'"
src = __dirname + '/src'
bin = __dirname + '/bin'

task 'build', 'build project', (options) ->

    # Remove bin contents
    exec "rm -rf #{escapeShell bin}", (err, stdout, stderr) ->
        if err? then throw err

        # Copy src content into bin
        exec "cp -R #{escapeShell src} #{escapeShell bin}", (err, stdout, stderr) ->
            if err? then throw err
            
            # Compile coffee files
            for filename in findit.sync bin
                if filename.substring(filename.length-7) is '.coffee'
                    # Get script from coffee file
                    script = fs.readFileSync filename, 'utf8'
                    # Compile into js code
                    js = coffee.compile script
                    # Write js file with compiled code
                    file = fs.openSync filename.substring(0, filename.length-7)+'.js', 'w+'
                    fs.writeSync file, js
                    fs.closeSync file
                    # Delete coffee file
                    fs.unlinkSync filename

            # Finish
            console.log 'built exec-sync.'
        
