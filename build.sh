#!/bin/sh

rm -f -r tmp
rm -f -r build
mkdir tmp
cd src
./build.py
cd ..
cp -f -r src/* tmp/
rm -f -r tmp/*_uncompressed.js
rm -f -r tmp/index.html
rm -f -r tmp/*.desktop
rm -f -r tmp/tmp.js
rm -f -r tmp/whitecat.icns
rm -f -r tmp/whitecat.ico
rm -f -r tmp/*.py
rm -f -r tmp/compress
rm -f -r tmp/i18n

node ./build.js

