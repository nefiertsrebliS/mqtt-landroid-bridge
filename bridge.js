// --------------------------------------------------------------------------------------------
// MQTT-Landroid-Bridge for Node.js
// version 1.0.5
// --------------------------------------------------------------------------------------------	

	"use strict";
	const mqtt = require('mqtt');
	const worx = require('iobroker.worx/lib/api');
	const config = require('./config.json');
	const logLevel = ['debug', 'info', 'warn', 'error', 'silent'];
	var client;
	var clientStatus = false;
	var onlineStatus = {};
	var data;
	var mowerId;
	var worxCloud;

	var adapter = {
		config:{
			server:"worx"
		},
		log: {
			debug: function (msg) {
				if(config.logLevel < 1) console.log(adapter.getTimestamp()+' DEBUG: ' + msg);
			},
			info: function (msg) {
				if(config.logLevel < 2) console.log(adapter.getTimestamp()+' INFO: ' + msg);
			},
			warn: function (msg) {
				if(config.logLevel < 3) console.log(adapter.getTimestamp()+' WARN: ' + msg);
			},
			error: function (msg) {
				if(config.logLevel < 4) console.log(adapter.getTimestamp()+' ERROR: ' + msg);
			}
		},
		msg: {
			info: [],
			error: [],
			debug: [],
			warn: []
		},
		// Build Timestamp
		getTimestamp : function() {
			var date = new Date();
			return date.toUTCString();
		},
		setStateAsync : function(){
			var info = {connection:{val: false, ack: true}};
		},
	};
	
	//Get logLevel
	if(typeof config.logLevel == "undefined") config.logLevel = "";
	config.logLevel = logLevel.indexOf(config.logLevel.toLowerCase());
	if(config.logLevel < 0) {
		config.logLevel = 0;
	    adapter.log.error('logLevel is undefined! Your options are "info", "debug", "warn", "error", "silent". logLevel "info" is set');
	}

	// Set Servertyp
    adapter.config.server = config.cloud.type;

	// Establish MQTT Bridge
	main();

// --------------------------------------------------------------------------------------------	

	// set OnlineStatus
	function setOnlineStatus(sn, online) {
		if(onlineStatus[sn] != online){
			onlineStatus[sn] = online;
			config.mower.forEach(function(device) {
				if(device.sn == sn){
					adapter.log.info('Mower ('+sn+') with Topic "'+device.topic+'" is '+(online?'online':'offline'));
					if(onlineStatus[sn] && clientStatus) adapter.log.info('Bridge for Mower ('+sn+') sucessfully established');
				}
			});
		}
		if(clientStatus)config.mower.forEach(function(device) {
			if(device.sn == sn)	client.publish(device.topic+'/', '{"online":'+online+'}');
		});
	}
	
	async function main() {
		// MQTT-Connection to local Server
		client  = mqtt.connect(config.mqtt.url);
		client.on('connect', function () {
			config.mower.forEach(function(device) {
				client.subscribe(device.topic+'/set/json', function (err) {
					if (!err) {
						adapter.log.info('Topic '+device.topic+' sucessfully connected with local MQTT-Server');
						clientStatus = true;
						var online = false;
						for (const key in onlineStatus) {
							if(onlineStatus[key]) online = true;
						}
						if(online) adapter.log.info('Bridge sucessfully established');
					}
				});
			});
		})
		 
		client.on('close', function() {
			if(clientStatus) adapter.log.info('Connection with local MQTT-Server closed');
			clientStatus = false;
		});
		 
		client.on('message', function (topic, message) {
		  // message is Buffer
		    adapter.log.info('Message received from '+topic+' - '+message.toString());
			config.mower.forEach(function(device) {
				if(device.topic+'/set/json' == topic){
//					if(onlineStatus[device.sn]){
						adapter.log.info('Forwarding to Mower ('+device.sn+')');
						worxCloud.sendMessage(message.toString(), device.sn);
//					}else{
//						adapter.log.info('Forwarding rejected, Mower ('+device.sn+') is offline');
//						setOnlineStatus(device.sn, false);
//					}
				}
			});
		})

		// MQTT-Connection to Cloud-Server
		worxCloud = new worx(config.cloud.email, config.cloud.pwd, adapter);
        await worxCloud.login();

		worxCloud.on('connect', worxc => {
		    adapter.log.info('sucessfully connected with '+config.cloud.type+'Cloud!');
        });
        worxCloud.on('refresh', worxc => {
		    adapter.log.info('sucessfully refreshed Access-Token');
        });

        worxCloud.on('found', function (mower) {
			config.mower.forEach(function(device) {
				if(device.sn == mower.serial){
					adapter.log.info('sucessfully connected with Mower ('+mower.serial+')');
					setOnlineStatus(mower.serial, mower.online?true:false);
				}
			});
        });

        worxCloud.on('online', function (mower) {
			setOnlineStatus(mower.serial, true);
        });

        worxCloud.on('offline', function (mower) {
			setOnlineStatus(mower.serial, false);
        });

	    worxCloud.on('mqtt', (mower, mower_data) => {

			setOnlineStatus(mower.serial, true);
			//Send data to local MQTT-Server
			config.mower.forEach(function(device) {
				if(device.sn == mower.serial) client.publish(device.topic+'/', JSON.stringify(mower_data));
			});
        });

        worxCloud.on('error', err => {
		    adapter.log.error(err);
		    if(err.statusCode == 401){
	            process.exit();
			}
        });
	}

