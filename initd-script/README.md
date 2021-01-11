## Installation of the init.d script

This script is used in conjunction with the nodejs source installation. 

Adjust the USER, APP_DIR in the file, and copy it to /etc/init.d/

```
cp mqtt-landroid-bridge /etc/init.d/
```
change rights
```
chmod 755 /etc/init.d/mqtt-landroid-bridge
```

Run update-rc.d to load the bridge upon startup:

```
update-rc.d mqtt-landroid-bridge defaults
```
