## Installation of the init.d script

This script is used in conjunction with the nodejs source installation. 

Adjust the USER, APP_DIR in the file, and copy it to /etc/init.d/

```
sudo cp mqtt-landroid-bridge /etc/init.d/
```
change rights
```
sudo chmod 755 /etc/init.d/mqtt-landroid-bridge
```

Run update-rc.d to load the bridge upon startup:

```
sudo update-rc.d mqtt-landroid-bridge defaults
```
