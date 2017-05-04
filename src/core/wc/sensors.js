/*
 * Whitecat Blocky Environment, sensors flyout category management
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

goog.provide('Blockly.Sensors');

goog.require('Blockly.Blocks');
goog.require('Blockly.Workspace');
goog.require('goog.string');
goog.require('Blockly.Blocks.io.helper');

Blockly.Sensors.NAME_TYPE = 'SENSOR';

Blockly.Sensors.flyoutCategory = function(workspace) {
	var xmlList = [];
	var sensors = workspace.sensors;
	
	var button = goog.dom.createDom('button');
	button.setAttribute('text', Blockly.Msg.NEW_SENSOR);
	button.setAttribute('callbackKey', 'CREATE_SENSOR');

	workspace.registerButtonCallback('CREATE_SENSOR', function(button) {
		Blockly.Sensors.createSensor(button.getTargetWorkspace());
	});

	xmlList.push(button);

	sensors.names.forEach(function(name, index) {
		if (Blockly.Blocks['sensor_attach'] && (Code.blockAbstraction == blockAbstraction.Low)) {
			var mutation = goog.dom.createDom('mutation', '');
			mutation.setAttribute('interface', sensors.setup[index]['interface']);
			mutation.setAttribute('pin', sensors.setup[index].pin);
			mutation.setAttribute('sid', sensors.setup[index].id);
			mutation.setAttribute('name', name);

			var block = goog.dom.createDom('block');
			block.setAttribute('type', 'sensor_attach');

			var field = goog.dom.createDom('field', null, Blockly.Msg.SENSOR_ACQUIRE.replace("%1", name).replace("%2", sensors.setup[index].id));
			field.setAttribute('name', 'NAME');
			block.appendChild(field);

			block.appendChild(mutation);

			xmlList.push(block);
		}

		if (Blockly.Blocks['sensor_read']) {
			var mutation = goog.dom.createDom('mutation', '');
			mutation.setAttribute('interface', sensors.setup[index]['interface']);
			mutation.setAttribute('pin', sensors.setup[index].pin);
			mutation.setAttribute('sid', sensors.setup[index].id);
			mutation.setAttribute('name', name);

			var block = goog.dom.createDom('block');
			block.setAttribute('type', 'sensor_read');

			var field = goog.dom.createDom('field', null, Blockly.Msg.SENSOR_READ2.replace("%1", name).replace("%2", sensors.setup[index].id));
			field.setAttribute('name', 'NAME');
			block.appendChild(field);

			var field = goog.dom.createDom('field', null, workspace.sensors.provides[index][0].id);
			field.setAttribute('name', 'PROVIDES');
			block.appendChild(field);

			block.appendChild(field);

			block.appendChild(mutation);

			xmlList.push(block);
		}

		if (Blockly.Blocks['sensor_set'] && (workspace.sensors.properties[index].length > 0)) {
			var mutation = goog.dom.createDom('mutation', '');
			mutation.setAttribute('interface', sensors.setup[index]['interface']);
			mutation.setAttribute('pin', sensors.setup[index].pin);
			mutation.setAttribute('sid', sensors.setup[index].id);
			mutation.setAttribute('name', name);

			var block = goog.dom.createDom('block');
			block.setAttribute('type', 'sensor_set');

			var field = goog.dom.createDom('field', null, Blockly.Msg.SENSOR_SET3.replace("%1", name).replace("%2", sensors.setup[index].id));
			field.setAttribute('name', 'NAME');
			block.appendChild(field);

			var field = goog.dom.createDom('field', null, workspace.sensors.properties[index][0].id);
			field.setAttribute('name', 'PROPERTIES');
			block.appendChild(field);

			var field = goog.dom.createDom('field', null, "0");
			field.setAttribute('name', 'NUM');

			var shadow = goog.dom.createDom('shadow', null, field);
			shadow.setAttribute('type', 'math_number');

			var value = goog.dom.createDom('value', null, shadow);
			value.setAttribute('name', 'VALUE');
			block.appendChild(value);

			block.appendChild(field);

			block.appendChild(mutation);

			xmlList.push(block);
		}
	})

	return xmlList;
};

Blockly.Sensors.sensorChanged = function() {
	var form = jQuery("#sensor_form");

	// Get selected sensor and it's interface
	var id = form.find("#id").find(":selected").attr("value");
	if (id == Blockly.Msg.NEW_SENSOR_SELECT_ONE) {
		id = "";
	}

	var interf = form.find("#id").find(":selected").data("interface");

	// Hide all interfaces and sensor name
	form.find(".sensor_interface").hide();
	form.find(".sensor_name").hide();

	// If sensor is valid show it's interface and name
	if ((id != "") && (interf != "")) {
		form.find(".sensor_name").show();
		form.find("#" + interf + "_sensor").show();
	}
};

Blockly.Sensors.createSetupStructure = function(id, sensor, interf, pin) {
	var setup = {};
	setup.id = id;
	setup['name'] = sensor;
	if (interf == "GPIO") {
		setup['interface'] = "GPIO";
		setup.pin = pin;
	} else if (interf == "ADC") {
		setup['interface'] = "ADC";
		setup.pin = pin;
	}

	return setup;
}

Blockly.Sensors.createSensor = function(workspace, opt_callback, block) {
	var dialogForm = "";
	var edit = false;

	if (typeof block != "undefined") edit = true;

	if (Code.status.sensors.length == 0) {
		Code.showError(MSG['error'], MSG['attachBoardForUseThisOption'], function() {});
		
		return;
	}

	// Build sensor selection
	if (edit) {
		sensorSelect = '<span>' + block.sid + '</span>';
		sensorSelect += '<input type="hidden" id="id" name="id" value="'+block.sid+'" data-interface="' + block['interface'] + '"></input>';
	} else {
		var sensorSelect = '<select onchange="Blockly.Sensors.sensorChanged()" id="id" name="id">';
		sensorSelect += '<option data-interface="" value="">' + Blockly.Msg.NEW_SENSOR_SELECT_ONE + '</option>';
		Code.status.sensors.forEach(function(item, index) {
			sensorSelect += '<option data-interface="' + item['interface'] + '" value="' + item.id + '">' + item.id + '</option>';
		})
		sensorSelect += "</select>";
	}

	// Build gpio selection
	var gpio = [];
	var gpioSelect = "";

	for (var key in  Code.status.maps.digitalPins) {
		gpio.push([Code.status.maps.digitalPins[key][3] + ' - ' + Code.status.maps.digitalPins[key][0].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
	}

	var gpioSelect = '<select id="gpio" name="gpio">';
	gpio.forEach(function(item, index) {
		gpioSelect += '<option '+((edit && (item[1] == block.pin))?"selected":"")+' value="' + item[1] + '">' + item[0] + '</option>';
	})
	gpioSelect += "</select>";

	// Build adc selection
	var adc = [];
	var adcSelect = "";

	for (var key in Code.status.maps.analogPins) {
		adc.push([Code.status.maps.digitalPins[key][1] + ' - ' + Code.status.maps.analogPins[key][0].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
	}

	var adcSelect = '<select id="adc" name="adc">';
	adc.forEach(function(item, index) {
		adcSelect += '<option value="' + item[1] + '">' + item[0] + '</option>';
	})
	adcSelect += "</select>";


	dialogForm = '<form id="sensor_form">';
	dialogForm += '<label for="id">' + Blockly.Msg.SENSOR + ':&nbsp;&nbsp;</label>' + sensorSelect;

	if (edit) {
		dialogForm += '<div>';
		dialogForm += '<label for="sensor_name">' + Blockly.Msg.SENSOR_NAME + ':&nbsp;&nbsp;</label>';
		dialogForm += '<input id="sensor_name" name="sensor_name" value="' + block['name'] + '">';
		dialogForm += '</div>';
	} else {
		dialogForm += '<div class="sensor_name" style="display: none;">';
		dialogForm += '<label for="sensor_name">' + Blockly.Msg.SENSOR_NAME + ':&nbsp;&nbsp;</label>';
		dialogForm += '<input id="sensor_name" name="sensor_name" value="' + Blockly.Msg.SENSOR_DEFAULT_NAME + workspace.sensors.names.length + '">';
		dialogForm += '</div>';
	}

	if (edit && (block['interface'] == "GPIO")) {
		dialogForm += '<div>';
		dialogForm += '<label for="gpio">' + Blockly.Msg.SENSOR_DIGITAL_PIN + ':&nbsp;&nbsp;</label>' + gpioSelect;
		dialogForm += '</div>';
	} else {
		dialogForm += '<div class="sensor_interface" id="GPIO_sensor" style="display: none;">';
		dialogForm += '<label for="gpio">' + Blockly.Msg.SENSOR_DIGITAL_PIN + ':&nbsp;&nbsp;</label>' + gpioSelect;
		dialogForm += '</div>';
	}

	if (edit && (block['interface'] == "ADC")) {
		dialogForm += '<div>';
		dialogForm += '<label for="adc">' + Blockly.Msg.SENSOR_ANALOG_PIN + ':&nbsp;&nbsp;</label>' + adcSelect;
		dialogForm += '</div>';
	} else {
		dialogForm += '<div class="sensor_interface" id="ADC_sensor" style="display: none;">';
		dialogForm += '<label for="adc">' + Blockly.Msg.SENSOR_ANALOG_PIN + ':&nbsp;&nbsp;</label>' + adcSelect;
		dialogForm += '</div>';
	}
	dialogForm += '</form>';

	bootbox.dialog({
		title: edit ? Blockly.Msg.EDIT_SENSOR_TITLE : Blockly.Msg.NEW_SENSOR_TITLE,
		message: dialogForm,
		buttons: {
			main: {
				label: edit ? Blockly.Msg.UPDATE : Blockly.Msg.SENSOR_CREATE,
				classensor: "btn-primary",
				callback: function() {
					var form = jQuery("#sensor_form");

					// Get selected sensor and it's interface
					var id;
					if (edit) {
						id = form.find("#id").val();
					} else {
						id = form.find("#id").find(":selected").attr("value");
						if (id == Blockly.Msg.NEW_SENSOR_SELECT_ONE) {
							id = "";
						}
					}

					// If sensor is valid ...
					var sensor = form.find("#sensor_name").val();

					if ((workspace.sensorIndexOf(sensor) == -1) || (edit && block['name'] == sensor)) {
						var interf;

						if (edit) {
							interf = form.find("#id").data("interface");
						} else {
							interf = form.find("#id").find(":selected").data("interface");
						}

						var pin = form.find("#" + interf.toLowerCase()).val();

						if ((sensor != "") && (interf != "")) {
							workspace.createSensor(
								edit ? block['name'] : undefined,
								Blockly.Sensors.createSetupStructure(id, sensor, interf, pin)
							);
							workspace.toolbox_.refreshSelection();
						} else {
							return false;
						}
					} else {
						Code.showError(Blockly.Msg.ERROR, Blockly.Msg.SENSOR_ALREADY_EXISTS.replace('%1', sensor), function() {});
					}
				}
			},
			danger: {
				label: Blockly.Msg.SENSOR_CANCEL,
				classensor: "btn-danger",
				callback: function() {}
			},
		},
		closable: false
	});
};

Blockly.Sensors.edit = function(block) {
	Blockly.Sensors.createSensor(block.workspace, null, block);
};

Blockly.Sensors.remove = function(block) {
	bootbox.confirm({
	    message: Blockly.Msg.SENSOR_REMOVE_CONFIRM.replace('%1', block['name'] + ' - ' + block.sid),
	    buttons: {
	        confirm: {
	            label: Blockly.Msg.YES,
	            className: 'btn-success'
	        },
	        cancel: {
	            label: Blockly.Msg.NO,
	            className: 'btn-danger'
	        }
	    },
	    callback: function (result) {
			if (result) {
				block.workspace.removeSensor(block);
			}
	    }
	});	
};
