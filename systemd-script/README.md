## Installation of the systemctl script

This script is used in conjunction with the nodejs source installation to run as a service. 
It is not intended for use with the docker container.

Adjust the username and paths in the file, and copy it to /lib/systemd/system/

```
cp mqtt-landroid-bridge /lib/systemd/system/
```

refresh services:

```
systemctl daemon-reload
```

Enable the service

```
systemctl enable mqtt-landroid-bridge.service
```

Start the service

```
systemctl start mqtt-landroid-bridge.service
```
