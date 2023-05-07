# MQTT-Landroid-Bridge

## Worx (Kress, Landxcape and Ferrex) adapter for IP-Symcon

IP-Symcon-Mowercontrol via MQTT and cloud

This adapter connects IP-Symcon with your Worx-, Kress- ,Landxcape- or Ferrex-mower via Cloud. 
This bridge is based on the [ioBroker.worx-Adapter](https://github.com/iobroker-community-adapters/ioBroker.worx) from the ioBroker-Community. Thanks to all the people, who build this great adapter.

## Requisites

To use this bridge, you need [IP-Symcon V5.0 or newer](https://www.symcon.de/) and the newest Version of [Node.js](https://nodejs.org/).

## Setup

1. Make sure you have [Node.js](https://nodejs.org) installed (tested with Node.js v18).
1. Check out the source code and build it:
    ```
    git clone https://github.com/nefiertsrebliS/mqtt-landroid-bridge.git
    cd mqtt-landroid-bridge
    npm install
    ```
1. Update ```config.json``` to match your environment.
1. Run the bridge:
    ```
    node bridge.js
    ```
1. Optional (Linux only): 
    1. Set up an systemd script to start the bridge on system startup (see example in systemd-script folder).

## Configuration

Please modify your config.json like this:

```
{
	"cloud": {
	    "email": "yourmail@mailserver.org",
	    "pwd": "TopSecret!",
	    "type": "worx"
	},
	"mqtt": {
	    "url": "mqtt://yourIPS-Server"
	},
	"mower": [
		{
		    "sn": "serialNumberOfYourMower",
		    "topic": "yourbestmower"
		}
	],
	"logLevel": "info"
}
```
where
* email and pwd are your login-data of your Cloud.
* type is the type of your Mower and Cloud. It may be worx, landxcape or kress.
* sn is the Serialnumber of your Mower. You may find it on your mower or on startup of this bridge in LogLevel "debug".
* topic is a MQTT-topic of your choice to subscribe to on your IP-Symcon-MQTT-Server. Make sure, that your IP-Symcon MQTTworxGateway uses the same topic.
* for logLevel you have the options debug, info, warn, error and silent.

## Managing multiple mowers in the same Cloud

If you have more than one mower connected to your Cloud Account, please modify your config.json like this:
```
{
	"cloud": {
	    "email": "yourmail@mailserver.org",
	    "pwd": "TopSecret!",
	    "type": "kress"
	},
	"mqtt": {
	    "url": "mqtt://yourIPS-Server"
	},
	"mower": [
		{
		    "sn": "serialNumberOfYourMower",
		    "topic": "yourbestmower"
		},
		{
		    "sn": "serialNumberOfYourSecondMower",
		    "topic": "yourOthermower"
		}
	],
	"logLevel": "debug"
}
```
## Managing mowers in different Clouds

If your mowers ar in different clouds, please run seperat instances of this bridge for each cloud.

## More MQTT options

If you **do not** use IP Symcon with this bridge but use it with some other home automation system (e. g. Loxone), you may need to add a more complex MQTT configuration.

```
{
	"cloud": {
	    "email": "yourmail@mailserver.org",
	    "pwd": "TopSecret!",
	    "type": "worx"
	},
        "mqtt": {
            "url": "mqtt://yourMQTTbroker",
            "subtopics": true,
	    "options": [
	        {
	            "username": "mqttusername"
	        },
	        {
	            "password": "mqttpassword"
	        }
	    ]
        },
	"mower": [
		{
		    "sn": "serialNumberOfYourMower",
		    "topic": "yourbestmower"
		}
	],
	"logLevel": "info"
}
```
where
* subtopics uses subtopics in your mqtt data structure if set to true
* options will be passed to NodeJS's MQTT Client Constructor. See here for possible options: https://github.com/mqttjs/MQTT.js/#client

If you set `subtopics": true` the bridge uses a more complex MQTT topic structure with additional subtopics. Please note that this is **not** compatible with the [MQTTworx-Modul](https://github.com/nefiertsrebliS/MQTTworx) of IP-Symcon!

MQTT topic structure without additional subtopics (default, `subtopics": false`):
```
<topic>/
<topic>/set/json
```

MQTT topic structure with additional subtopics (`subtopics": true`):
```
<topic>/<sn>/status
<topic>/<sn>/mowerdata
<topic>/<sn>/set/json
```

## Recommendation for the winter break

If your mower is offline for a longer period, please disable the MQTT-Landroid-Bridge.

## Connecting to IP-Symcon

To connect this Landroid Bridge to [IP-Symcon](https://www.symcon.de/), add the newest Version of the [MQTTworx-Modul](https://github.com/nefiertsrebliS/MQTTworx) to your Symcon-installation after Landroid Bridge is up and running successfully (see above).

## Changelog

| Version | Changes								|
| --------|-------------------------------------|
| V1.0.0  | Baseversion							|
| V1.0.1  | FIX: Servertype						|
| V1.0.2  | FIX: Onlinestatus					|
| V1.0.3  | FIX: ioBroker.worx Version 1.3.0	|
| V1.0.4  | FIX: ioBroker.worx latest Version	|
| V1.0.5  | FIX: new Worx Cloud login method	|
| V2.0.0  | New: based on ioBroker.worx V2.0.3<br> FIX: New Login-procedure for worxCloud	|
| V2.0.1  | FIX: waiting for network online	|
| V2.0.2  | New: More options for MQTT configuration	|

## License

MIT License

Copyright (c) 2023 nefiertsrebliS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
