/*
 * Whitecat Blocky Environment, MQTT flyout category management
 *
 * Copyright (C) 2015 - 2016
 * IBEROXARXA SERVICIOS INTEGRALES, S.L. & CSS IBÉRICA, S.L.
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
'use strict';

goog.provide('Blockly.MQTT');

goog.require('Blockly.Blocks');
goog.require('Blockly.Workspace');
goog.require('goog.string');

Blockly.MQTT.NAME_TYPE = 'MQTT';

Blockly.MQTT.flyoutCategory = function(workspace) {
	var xmlList = [];
	var MQTT = workspace.MQTT;

	var button = goog.dom.createDom('button');
	button.setAttribute('text', Blockly.Msg.CONFIGURE_MQTT);
	button.setAttribute('callbackKey', 'CONFIGURE_MQTT');

	workspace.registerButtonCallback('CONFIGURE_MQTT', function(button) {
		Blockly.MQTT.configure(button.getTargetWorkspace());
	});

	xmlList.push(button);

	if (Blockly.Blocks['mqtt_publish']) {
		var mutation = goog.dom.createDom('mutation', '');
		mutation.setAttribute('clientid', MQTT.clientid);
		mutation.setAttribute('host', MQTT.host);
		mutation.setAttribute('port', MQTT.port);
		mutation.setAttribute('secure', MQTT.secure);
		mutation.setAttribute('username', MQTT.username);
		mutation.setAttribute('password', MQTT.password);

		var block = goog.dom.createDom('block');
		block.setAttribute('type', 'mqtt_publish');

		var field = goog.dom.createDom('field', null, "");
		field.setAttribute('name', 'TEXT');

		var shadow = goog.dom.createDom('shadow', null, field);
		shadow.setAttribute('type', 'text');

		var value = goog.dom.createDom('value', null, shadow);
		value.setAttribute('name', 'PAYLOAD');
		block.appendChild(value);
		block.appendChild(field);
		
		var field = goog.dom.createDom('field', null, "");
		field.setAttribute('name', 'TEXT');

		var shadow = goog.dom.createDom('shadow', null, field);
		shadow.setAttribute('type', 'text');

		var value = goog.dom.createDom('value', null, shadow);
		value.setAttribute('name', 'TOPIC');
		block.appendChild(value);
		block.appendChild(field);

		block.appendChild(mutation);

		xmlList.push(block);
	}
	
	if (Blockly.Blocks['mqtt_subscribe']) {
		var mutation = goog.dom.createDom('mutation', '');
		mutation.setAttribute('clientid', MQTT.clientid);
		mutation.setAttribute('host', MQTT.host);
		mutation.setAttribute('port', MQTT.port);
		mutation.setAttribute('secure', MQTT.secure);
		mutation.setAttribute('username', MQTT.username);
		mutation.setAttribute('password', MQTT.password);

		var block = goog.dom.createDom('block');
		block.setAttribute('type', 'mqtt_subscribe');

		var field = goog.dom.createDom('field', null, "");
		field.setAttribute('name', 'TEXT');

		var shadow = goog.dom.createDom('shadow', null, field);
		shadow.setAttribute('type', 'text');

		var value = goog.dom.createDom('value', null, shadow);
		value.setAttribute('name', 'TOPIC');
		block.appendChild(value);
		block.appendChild(field);

		block.appendChild(mutation);

		xmlList.push(block);
	}

	if (Blockly.Blocks['mqtt_get_len']) {
		var block = goog.dom.createDom('block');
		block.setAttribute('type', 'mqtt_get_len');
		xmlList.push(block);
	}

	if (Blockly.Blocks['mqtt_get_payload']) {
		var block = goog.dom.createDom('block');
		block.setAttribute('type', 'mqtt_get_payload');
		xmlList.push(block);
	}
	
	return xmlList;
};

Blockly.MQTT.configure = function(workspace, opt_callback, block) {
	var dialogForm = "";
	var edit = false;

	if (typeof block != "undefined") edit = true;
	
	dialogForm = '<form id="MQTT_form">';
	dialogForm += '<label for="clientid">Client ID:&nbsp;&nbsp;</label><input id="clientid" name="clientid" style="width:300px;" value="'+workspace.MQTT.clientid+'">';
	dialogForm += '</div>';
	dialogForm += '<div>';
	dialogForm += '<label for="host">Host:&nbsp;&nbsp;</label><input type="text" id="host" name="host" style="width:300px;" value="'+workspace.MQTT.host+'">';
	dialogForm += '</div>';
	dialogForm += '<div>';
	dialogForm += '<label for="port">Port:&nbsp;&nbsp;</label><input type="text" id="port" name="port" style="width:100px;" value="'+workspace.MQTT.port+'">';
	dialogForm += '</div>';
	dialogForm += '<div>';
	dialogForm += '<label for="secure">Secure:&nbsp;&nbsp;</label><br>';
	dialogForm += '<input id="secure" name="secure" type="checkbox" data-group-cls="btn-group-sm" value="'+workspace.MQTT.secure+'">';
	dialogForm += '</div>';
	dialogForm += '<div id="credentials" style="display:none;"><br>';
	dialogForm += '<div>';
	dialogForm += '<label for="username">User:&nbsp;&nbsp;</label><input type="text" id="username" name="username" style="width:100px;" value="'+workspace.MQTT.username+'">';
	dialogForm += '</div>';
	dialogForm += '<div>';
	dialogForm += '<label for="password">Password:&nbsp;&nbsp;</label><input type="password" id="password" name="password" style="width:100px;" value="'+workspace.MQTT.password+'">';
	dialogForm += '</div>';
	dialogForm += '</div>';

	dialogForm += '<span class="error-msg" id="errors"></span>';

	dialogForm += '</form>';
	
	var box = bootbox.dialog({
		title: Blockly.Msg.MQTT_CONFIG_TITLE,
		message: dialogForm,
		buttons: {
			main: {
				label: Blockly.Msg.CONFIGURE,
				classensor: "btn-primary",
				callback: function() {
					var form = jQuery("#MQTT_form");
					
					var clientid = form.find("#clientid").val().trim();
					var host = form.find("#host").val().trim();
					var port = form.find("#port").val().trim();
					var secure = form.find("#secure").val();
					var username = form.find("#username").val().trim();
					var password = form.find("#password").val().trim();

					var error = false;
					form.find("#errors").html("");
					
					if (clientid == '') {
						form.find("#errors").html(form.find("#errors").html() + "<br>" + Blockly.Msg.MQTT_INVALID.replace('%1', 'Client ID'));
						error = true;
					}

					if (host == '') {
						form.find("#errors").html(form.find("#errors").html() + "<br>" + Blockly.Msg.MQTT_INVALID.replace('%1', 'Host'));
						error = true;
					}

					if ((port == '') || (isNaN(port))) {
						form.find("#errors").html(form.find("#errors").html() + "<br>" + Blockly.Msg.MQTT_INVALID.replace('%1', 'Port'));
						error = true;
					}
					
					if (parseInt(port) < 0) {
						form.find("#errors").html(form.find("#errors").html() + "<br>" + Blockly.Msg.MQTT_INVALID.replace('%1', 'Port'));
						error = true;						
					}

					if (error) {
						return false;
					}
					
					workspace.configureMQTT({
						"clientid": clientid,
						"host": host,
						"port":port,
						"secure": secure,
						"username": username,
						"password": password,
					});
					
					workspace.toolbox_.refreshSelection();
				}
			},
			danger: {
				label: Blockly.Msg.CANCEL,
				classensor: "btn-danger",
				callback: function() {}
			},
		},
		closable: false
	});
	
	box.bind('shown.bs.modal', function(){
		jQuery(':checkbox').checkboxpicker({
		  html: true,
		  offLabel: '<span class="glyphicon glyphicon-remove">',
		  onLabel: '<span class="glyphicon glyphicon-ok">',
		}).on('change', function() {
			var form = jQuery("#MQTT_form");
			
			form.find("#secure").val(this.checked);
			
			if (this.checked) {
				form.find("#credentials").show();
			} else {
				form.find("#credentials").hide();				
			}
		}).prop('checked', workspace.MQTT.secure == 'true');		
	});
};