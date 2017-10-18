/*
 * Whitecat Ecosystem Blockly Based Web IDE
 *
 * Copyright (C) 2015 - 2016
 * IBEROXARXA SERVICIOS INTEGRALES, S.L.
 *
 * Author: Jaume Olivé (jolive@iberoxarxa.com / jolive@whitecatboard.org)
 *
 * All rights reserved.
 *
 * Permission to use, copy, modify, and distribute this software
 * and its documentation for any purpose and without fee is hereby
 * granted, provided that the above copyright notice appear in all
 * copies and that both that the copyright notice and this
 * permission notice and warranty disclaimer appear in supporting
 * documentation, and that the name of the author not be used in
 * advertising or publicity pertaining to distribution of the
 * software without specific, written prior permission.
 *
 * The author disclaim all warranties with regard to this
 * software, including all implied warranties of merchantability
 * and fitness.  In no event shall the author be liable for any
 * special, indirect or consequential damages or any damages
 * whatsoever resulting from loss of use, data or profits, whether
 * in an action of contract, negligence or other tortious action,
 * arising out of or in connection with the use or performance of
 * this software.
 */

function Cloud(user, password) {
	var thisInstance = this;
	
	thisInstance.username = user;
	
	if (thisInstance.username != "") {
		thisInstance.client = new Paho.MQTT.Client(
						"mqtt.whitecatboard.org",
						80,
						"/" + thisInstance.username,
						"web_" + parseInt(Math.random() * 100, 10)
		);		

        thisInstance.client.onConnectionLost = thisInstance.onConnectionLost;
        thisInstance.client.onMessageArrived = thisInstance.onMessageArrived;
		
	    thisInstance.options = {
            timeout: 3,
            useSSL: false,
            cleanSession: true,
            onSuccess: function() {
				thisInstance.client.subscribe("/" + thisInstance.username + "/+", {qos: 0});
				thisInstance.client.subscribe("/" + thisInstance.username + "/+/+", {qos: 0});
				thisInstance.client.subscribe("/" + thisInstance.username + "/+/+/+", {qos: 0});
				thisInstance.client.subscribe("/" + thisInstance.username + "/+/+/+/+", {qos: 0});
            },
            onFailure: function (message) {
                setTimeout(thisInstance.Connect, 200);
            },
			userName: thisInstance.username,
			password: password
        };
		
		var html = '';
			
		html += '<table id="cloudTable" width="100%">';
		html += '<thead>';
		html += '<tr>';
		html += '<th>Time</th><th>Topic</th><th>Payload</th>';
		html += '</tr>';
		html += '</thead>';
		html += '<tbody>';
		html += '</thead>';
		html += '</table>';
		
		jQuery("#cloudConsole").html(html);		
		jQuery("#cloudTable").DataTable({
			"lengthMenu": [[10, 25], [10, 25]],
			"order": [[ 0, "desc" ]],
			"columns": [
				{"width": "5%"},
				{"width": "20%"},
				{"width": "75%"},
			]
		});
	}
}

Cloud.prototype.Connect = function() {
	var thisInstance = this;

	thisInstance.client.connect(thisInstance.options);
}

Cloud.prototype.Disconnect = function() {
	var thisInstance = this;

	thisInstance.client.disconnect();
}

Cloud.prototype.onConnectionLost = function(response) {
	var thisInstance = this;

   	setTimeout(thisInstance.Connect, 200);
}

Cloud.prototype.onMessageArrived = function(message) {
    var topic = message.destinationName;
    var payload = message.payloadString;
	
	var table = jQuery("#cloudTable").DataTable();
	
	table.row.add([jQuery.format.date(new Date(), 'dd/M/yy hh:mm:ss'),topic,payload]).draw(false);
};