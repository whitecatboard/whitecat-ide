sudo chmod -R g+r,o+r *
sudo chown -R $(whoami):$(groups $(whoami) | cut -d' ' -f1) *
nw ./src
