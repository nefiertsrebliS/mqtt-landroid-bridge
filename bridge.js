// --------------------------------------------------------------------------------------------
// MQTT-Landroid-Bridge for Node.js
// version 2.0.4
// --------------------------------------------------------------------------------------------	

	"use strict";
	const mqtt = require('mqtt');
	const worx = require('./worxCloud');
	const config = require('./config.json');
	const logLevel = ['debug', 'info', 'warn', 'error', 'silent'];
	const ping_interval = 1000 * 60; //1 Minute
	var client;
	var clientStatus = false;
	var worxCloud;
	
	var adapter = {
		config: config,
		log: {
			logLevel: config.logLevel,
			debug: function (msg) {
				if(this.getLogLevel(this.logLevel) < 1) console.log(this.getTimestamp()+' DEBUG: ' + msg);
			},
			info: function (msg) {
				if(this.getLogLevel(this.logLevel) < 2) console.log(this.getTimestamp()+' INFO: ' + msg);
			},
			warn: function (msg) {
				if(this.getLogLevel(this.logLevel) < 3) console.log(this.getTimestamp()+' WARN: ' + msg);
			},
			error: function (msg) {
				if(this.getLogLevel(this.logLevel) < 4) console.log(this.getTimestamp()+' ERROR: ' + msg);
			},
			// Build Timestamp
			getTimestamp : function() {
				var date = new Date();
				return date.toLocaleString();
			},
			// Get logLevel
			getLogLevel : function(level) {
				if(typeof level == "undefined"){
					console.log(this.getTimestamp()+' ERROR: ' + 'logLevel is undefined! Your options are "info", "debug", "warn", "error", "silent". logLevel "info" is set');
					return 0;
				}else{
					let levelint = logLevel.indexOf(config.logLevel.toLowerCase());
					if(levelint < 0) {
						console.log(this.getTimestamp()+' ERROR: ' + 'logLevel is undefined! Your options are "info", "debug", "warn", "error", "silent". logLevel "info" is set');
						return 0;
					}
					return levelint;
				}
			}
		},
	};

	// Establish MQTT Bridge
	main();

// --------------------------------------------------------------------------------------------	

	// set OnlineStatus
	function setOnlineStatus(mower, online) {
		if(mower['online'] != online){
			config.mower.forEach(function(device) {
				if(device.sn == mower.sn){
					device['online'] = online;
					adapter.log.info('Mower ('+mower.sn+') with Topic "'+device.topic+'" is '+(online?'online':'offline'));
					if(device['online'] && clientStatus) adapter.log.info('Bridge for Mower ('+device.sn+') sucessfully established');
				}
			});
		}
		if(clientStatus)config.mower.forEach(function(device) {
			if(device.sn == mower.sn)	client.publish(device.topic+'/status', '{"online":'+online+'}');
		});
	}

	async function main() {
		// Mower Online-Status
		config.mower.forEach(function(device) {
			device['online'] = false;
		});

		// MQTT-Connection to local Server
		if(typeof config.mqtt.options !== 'undefined'){
			var options = {};
			for (const [key, value] of Object.entries(config.mqtt.options)) {
				options[key] = value.toString();
			}
			client  = mqtt.connect(config.mqtt.url, options);
		}else{
			client  = mqtt.connect(config.mqtt.url);
		}

		client.on('connect', function () {
			config.mower.forEach(function(device) {
				client.subscribe(device.topic+'/set/json', function (err) {
					if (!err) {
						adapter.log.info('Topic '+device.topic+' sucessfully connected with local MQTT-Server');
						clientStatus = true;
						setOnlineStatus(device, device['online']);
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
					if(device['online']){
						adapter.log.info('Forwarding to Mower ('+device.sn+')');
						worxCloud.sendMessage(message.toString(), device.sn);
					}else{
						adapter.log.info('Forwarding rejected, Mower ('+device.sn+') is offline');
						setOnlineStatus(device, false);
					}
				}
			});
		})

		worxCloud = new worx(adapter);

        setInterval(() => {
			config.mower.forEach(function(device) {
				if(worxCloud.CloudOnline)client.publish(device.topic+'/status', '{"online":'+device['online']+'}');
			});
        }, ping_interval);

		worxCloud.on('mqtt', (serial, data) => {
			adapter.log.debug('Data for '+serial+': '+data);
			//Send data to local MQTT-Server
			config.mower.forEach(function(device) {
				if(device.sn == serial){
					setOnlineStatus(device, true);
					client.publish(device.topic+'/mowerdata', data);
				}
			});
        });

		worxCloud.on('online', (serial, online, data) => {
			adapter.log.debug('Mower '+serial+' is '+((online)?'online':'offline'));
			adapter.log.debug('Mower '+serial+' has data: '+ JSON.stringify(data.last_status.payload));
			config.mower.forEach(function(device) {
				if(device.sn == serial){
					setOnlineStatus(device, online);
					client.publish(device.topic+'/mowerdata', JSON.stringify(data.last_status.payload));
				}
			});
        });

		await worxCloud.StartUp();
	}

