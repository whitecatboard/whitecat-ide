var NwBuilder = require('nw-builder');
var nw = new NwBuilder({
    files: ['./tmp/**'],
    appName: "The Whitecat IDE",
    macIcns: "./src/whitecat.icns",
    platforms: ['osx64', 'win32', 'linux32'],
    zip: false
});

// Log stuff you want
nw.on('log',  console.log);

nw.build().then(function () {
   console.log('all done!');
}).catch(function (error) {
    console.error(error);
});
