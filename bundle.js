const querystring = require('querystring'),
    topText = "/*! EnderLibrary v0.0.2 | (c) EnderCommunity */\n",
    https = require('https'),
    fs = require('fs'),
    { EasyZip } = require('easy-zip'),
    code = fs.readFileSync('./EnderLibrary.js', 'utf8'),
    query = querystring.stringify({
        input: code
    }),
    req = https.request({
        method: 'POST',
        hostname: 'javascript-minifier.com',
        path: '/raw'
    }, function(response) {
        if (response.statusCode !== 200) {
            throw Error(`Couldn't Connect to the server! Status Code: ${response.statusCode}`);
        }
        fs.writeFile('./bundles/EnderLibrary.js', topText + code, function(err) {
            if (err) throw err;
        });
        fs.writeFile('./bundles/EnderLibrary.min.js', topText, function(err) {
            if (err) throw err;
        });
        var file = fs.createWriteStream('./bundles/EnderLibrary.min.js', {
            flags: 'a' // 'a' means appending (old data will be preserved)
        })
        response.on('data', function(chunk) {
            file.write(chunk);
        });
    }),
    zipFolder = function() {
        var zip5 = new EasyZip();
        zip5.zipFolder('./EnderConsole', function() {
            zip5 = zip5.generate({ base64: false, compression: 'DEFLATE' });
            fs.writeFile("./bundles/EnderConsole.zip", zip5, 'binary', function(error) {
                if (error)
                    throw error;
            });

        });
    };

req.on('error', function(err) {
    throw err;
});
req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
req.setHeader('Content-Length', query.length);
req.end(query, 'utf8');

zipFolder();

//Copy the files to "./bundles"