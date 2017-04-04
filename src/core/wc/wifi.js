/*
 * Whitecat Blocky Environment, Wi-Fi flyout category management
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
'use strict';

goog.provide('Blockly.Wifi');

goog.require('Blockly.Blocks');
goog.require('Blockly.Workspace');
goog.require('goog.string');

Blockly.Wifi.NAME_TYPE = 'WIFI';

Blockly.Wifi.flyoutCategory = function(workspace) {
	var xmlList = [];
	var Wifi = workspace.Wifi;

	var button = goog.dom.createDom('button');
	button.setAttribute('text', Blockly.Msg.CONFIGURE_WIFI);
	button.setAttribute('callbackKey', 'CONFIGURE_WIFI');

	workspace.registerButtonCallback('CONFIGURE_WIFI', function(button) {
		Blockly.Wifi.configure(button.getTargetWorkspace());
	});

	xmlList.push(button);

	if (Blockly.Blocks['wifi_start']) {
		var mutation = goog.dom.createDom('mutation', '');
		mutation.setAttribute('wtype', Wifi.wtype);
		mutation.setAttribute('ssid', Wifi.ssid);
		mutation.setAttribute('password', Wifi.password);

		var block = goog.dom.createDom('block');
		block.setAttribute('type', 'wifi_start');

		block.appendChild(mutation);

		xmlList.push(block);
	}

	if (Blockly.Blocks['wifi_stop']) {
		var mutation = goog.dom.createDom('mutation', '');
		mutation.setAttribute('wtype', Wifi.wtype);
		mutation.setAttribute('ssid', Wifi.ssid);
		mutation.setAttribute('password', Wifi.password);

		var block = goog.dom.createDom('block');
		block.setAttribute('type', 'wifi_stop');

		block.appendChild(mutation);

		xmlList.push(block);
	}

	return xmlList;
};

Blockly.Wifi.configure = function(workspace, opt_callback, block) {
	var dialogForm = "";
	var edit = false;

	if (typeof block != "undefined") edit = true;

	// Build type selection
	var WifiTypeSelect = '<select id="type" name="type" onchange="Blockly.Wifi.wtypeChanged()">';
	WifiTypeSelect += '<option data-type="STA" '+(workspace.Wifi.wtype=="STA"?"selected":"")+' value="STA">STATION</option>';
	//WifiTypeSelect += '<option data-type="AP" '+(workspace.Wifi.wtype=="AP"?"selected":"")+' value="AP">AP</option>';
	WifiTypeSelect += "</select>";
		
	dialogForm = '<form id="Wifi_form">';
	dialogForm += '<div>';
	dialogForm += '<label for="type">' + Blockly.Msg.WIFI_TYPE + ':&nbsp;&nbsp;</label>' + WifiTypeSelect;
	dialogForm += '</div>';
	dialogForm += '<div><br>';
	dialogForm += '<div id="STA" style="display: none;">';
	dialogForm += '<div>';
	dialogForm += '<label for="ssid">SSID:&nbsp;&nbsp;</label><input id="ssid" name="ssid" style="width:300px;" value="'+workspace.Wifi.ssid+'">';
	dialogForm += '</div>';
	dialogForm += '<div>';
	dialogForm += '<label for="password">PASSWORD:&nbsp;&nbsp;</label><input type="password" id="password" name="password" style="width:300px;" value="'+workspace.Wifi.password+'">';
	dialogForm += '</div>';

	dialogForm += '<div id="AP" style="display: none;">';
	dialogForm += '</div>';
	dialogForm += '<span class="error-msg" id="errors"></span>';

	dialogForm += '</form>';
	
	var box = bootbox.dialog({
		title: Blockly.Msg.WIFI_CONFIG_TITLE,
		message: dialogForm,
		buttons: {
			main: {
				label: Blockly.Msg.CONFIGURE,
				classensor: "btn-primary",
				callback: function() {
					var form = jQuery("#Wifi_form");
					
					var type = form.find("#type").find(":selected").attr("value");
					var ssid = form.find("#ssid").val().trim();
					var password = form.find("#password").val().trim();

					var error = false;
					form.find("#errors").html("");
					if (type == 'STA') {
						if (ssid == '') {
							form.find("#errors").html(form.find("#errors").html() + "<br>" + Blockly.Msg.WIFI_INVALID.replace('%1', 'SSID'));
							error = true;
						}

						if (password == '') {
							form.find("#errors").html(form.find("#errors").html() + "<br>" + Blockly.Msg.WIFI_INVALID.replace('%1', 'PASSWORD'));
							error = true;
						}
					} else {
					}
					
					if (error) {
						return false;
					}
					
					workspace.configureWifi({
						"wtype": type,
						"ssid": ssid,
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
			var form = jQuery("#Wifi_form");
			
			form.find("#ssid").val(this.checked);
		}).prop('checked', workspace.Wifi.ssid == 'true');
		
		Blockly.Wifi.wtypeChanged();
	});
};

Blockly.Wifi.wtypeChanged = function() {
	var form = jQuery("#Wifi_form");

	// Get type
	var type = form.find("#type").find(":selected").attr("value");

	if (type == 'STA') {
		form.find("#STA").show();		
		form.find("#AP").hide();		
	} else {
		form.find("#STA").hide();		
		form.find("#AP").show();				
	}
};