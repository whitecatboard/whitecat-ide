sudo nwbuild -p osx64,win64,linux64 -o ./app ./src
sudo chmod -R g+r,o+r *
sudo chown -R $(whoami):$(groups $(whoami) | cut -d' ' -f1) *
sudo chmod 755 app/Whitecat/linux64/Whitecat