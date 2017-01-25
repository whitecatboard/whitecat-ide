sudo chmod -R g+r,o+r *
sudo chown -R $(whoami):$(groups $(whoami) | cut -d' ' -f1) *
nwb nwbuild -v nwbuild -v 0.14.4-sdk -r ./src
#nwb nwbuild -r ./src
