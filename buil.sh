sudo nwb nwbuild --side-by-side -v nwbuild -v 0.14.4-sdk -p osx64,win64,linux64 --win-ico ./src/whitecat.ico --mac-icns ./src/whitecat.icns -o ./app ./src
sudo chown -R $(whoami):$(groups $(whoami) | cut -d' ' -f1) *
cp src/Whitecat.desktop app/Whitecat-linux-x64
cp src/whitecat.ico app/Whitecat-linux-x64
sudo chmod 755 app/Whitecat/linux64/Whitecat
sudo chmod 755 app/Whitecat/linux64/Whitecat.desktop
cd app
rm -f *.zip
zip -r Whitecat-osx-x64.zip ./Whitecat-osx-x64/*
zip -r Whitecat-linux-x64.zip ./Whitecat-linux-x64/*
zip -r Whitecat-win-x64.zip ./Whitecat-win-x64/*
