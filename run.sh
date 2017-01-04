sudo chmod -R g+r,o+r *
sudo chown -R $(whoami):$(groups $(whoami) | cut -d' ' -f1) *
./app/Whitecat/osx64/Whitecat.app/Contents/MacOS/nwjs
