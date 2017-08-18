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
			mutation.setAttribute('unit', sensors.setup[index].unit);
			mutation.setAttribute('setAttribute', sensors.setup[index].id);
			mutation.setAttribute('device', sensors.setup[index].device);
			mutation.setAttribute('name', name);

			var block = goog.dom.createDom('block');
			block.setAttribute('type', 'sensor_attach');
			
			var label = sensors.setup[index].id;
			if (typeof Blockly.Msg[label] != "undefined") {
				label = Blockly.Msg[label];
			}

			var field = goog.dom.createDom('field', null, Blockly.Msg.SENSOR_ACQUIRE.replace("%1", name).replace("%2", label));
			field.setAttribute('name', 'NAME');
			block.appendChild(field);

			block.appendChild(mutation);

			xmlList.push(block);
		}

		if (Blockly.Blocks['sensor_when']) {
			var has_callback = false;
			
			Code.status.sensors.forEach(function(sensor, i1) {
				if (sensor.id == sensors.setup[index].id) {
					sensors.setup.forEach(function(ssensor, i2) {
						if (sensor.id == ssensor.id) {
							has_callback = sensor.callback;
						}
					});										
				}
			});
			
			if (has_callback) {
				var mutation = goog.dom.createDom('mutation', '');
				mutation.setAttribute('interface', sensors.setup[index]['interface']);
				mutation.setAttribute('pin', sensors.setup[index].pin);
				mutation.setAttribute('unit', sensors.setup[index].unit);
				mutation.setAttribute('sid', sensors.setup[index].id);
				mutation.setAttribute('device', sensors.setup[index].device);
				mutation.setAttribute('name', name);

				var block = goog.dom.createDom('block');
				block.setAttribute('type', 'sensor_when');

				var label = sensors.setup[index].id;
				if (typeof Blockly.Msg[label] != "undefined") {
					label = Blockly.Msg[label];
				}

				var field = goog.dom.createDom('field', null, Blockly.Msg.SENSOR_WHEN2.replace("%1", name).replace("%2", label));
				field.setAttribute('name', 'NAME');
				block.appendChild(field);

				var field = goog.dom.createDom('field', null, workspace.sensors.provides[index][0].id);
				field.setAttribute('name', 'PROVIDES');
				block.appendChild(field);

				block.appendChild(field);

				block.appendChild(mutation);

				xmlList.push(block);				
			}
		}
		
		if (Blockly.Blocks['sensor_read']) {
			var mutation = goog.dom.createDom('mutation', '');
			mutation.setAttribute('interface', sensors.setup[index]['interface']);
			mutation.setAttribute('pin', sensors.setup[index].pin);
			mutation.setAttribute('unit', sensors.setup[index].unit);
			mutation.setAttribute('sid', sensors.setup[index].id);
			mutation.setAttribute('device', sensors.setup[index].device);
			mutation.setAttribute('name', name);

			var block = goog.dom.createDom('block');
			block.setAttribute('type', 'sensor_read');

			var label = sensors.setup[index].id;
			if (typeof Blockly.Msg[label] != "undefined") {
				label = Blockly.Msg[label];
			}

			var field = goog.dom.createDom('field', null, Blockly.Msg.SENSOR_READ2.replace("%1", name).replace("%2", label));
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
			mutation.setAttribute('unit', sensors.setup[index].unit);
			mutation.setAttribute('sid', sensors.setup[index].id);
			mutation.setAttribute('device', sensors.setup[index].device);
			mutation.setAttribute('name', name);

			var block = goog.dom.createDom('block');
			block.setAttribute('type', 'sensor_set');

			var label = sensors.setup[index].id;
			if (typeof Blockly.Msg[label] != "undefined") {
				label = Blockly.Msg[label];
			}

			var field = goog.dom.createDom('field', null, Blockly.Msg.SENSOR_SET3.replace("%1", name).replace("%2", label));
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

Blockly.Sensors.categoryChanged = function() {
	var thisInstance = this;
	var form = jQuery("#sensor_form");

	// Get selected category
	var cat = form.find("#cat").find(":selected").attr("value");
	if (cat == Blockly.Msg.NEW_SENSOR_SELECT_ONE) {
		cat = "";
	}
	
	form.find(".id").hide();
	form.find(".sensor_name").hide();
	form.find(".sensor_interface").hide();
	
	// Build sensor list from category
	thisInstance.currentWS.allSensors.categories.forEach(function(category, index) {
		if (category.id == cat) {
			var options = '<option data-interface="" value="">' + Blockly.Msg.NEW_SENSOR_SELECT_ONE + '</option>';
			
			category.sensors.forEach(function(csensor, index) {
				// Get sensor from board
				var bsensor = null;
				Code.status.sensors.forEach(function(sensor, index) {
					if (sensor.id == csensor.id){
						bsensor = sensor;
					}
				});
				
				if (bsensor) {
					var label = bsensor.id;
					if (label.match(/^\d/)) {
						label = "S" + label;
						
					}
					if (typeof Blockly.Msg[label] != "undefined") {
						label = Blockly.Msg[label];
					} else {
						label = bsensor.id;
					}
					
					options += '<option data-interface="' + bsensor['interface'] + '" value="' + bsensor.id + '">' + label + '</option>';							
				}				
			});		
			
			form.find("#id").html(options);
			form.find(".id").show();	
		}
	});	
}

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

Blockly.Sensors.adcUnitChanged = function() {
	var channels = [];
	var i;		

	var form = jQuery("#sensor_form");

	// Get selected unit
	var unit = form.find("#adcUnit").find(":selected").attr("value");
	if (unit == 1){
		// Get internal channels
		for (var key in Code.status.maps.analogPins) {
			channels.push([Code.status.maps.analogPins[key][1] + ' - ' + Code.status.maps.analogPins[key][0].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
		}		
	} else {
		// Get externals channels		
		for(i=0; i < Code.status.maps.externalAdcUnits[unit][1];i++) {
			channels.push(["channel%1".replace("%1", String(i)), i.toString()]);
		}		
	}

	var options = '';
	channels.forEach(function(item, index) {
		options += '<option value="' + item[1] + '">' + item[0] + '</option>';
	});
	
	form.find("#adc").html(options);
};

Blockly.Sensors.createSetupStructure = function(id, sensor, interf, pin, unit, device) {
	var setup = {};
	
	setup.name = sensor;
	setup.id = id;
	setup.unit = unit;
	setup.pin = pin;
	setup.interface = interf;
	setup.device = device;

	return setup;
}

Blockly.Sensors.createSensor = function(workspace, opt_callback, block) {
	var dialogForm = "";
	var edit = false;
	
	this.currentWS = workspace;

	if (typeof block != "undefined") edit = true;

	if (Code.status.sensors.length == 0) {
		Code.showError(MSG['error'], MSG['attachBoardForUseThisOption'], function() {});
		
		return;
	}
	
	// Build sensor category selection
	if (edit) {
		var sensorCategorySelect = "";
	} else {
		var sensorCategorySelect = '<select onchange="Blockly.Sensors.categoryChanged()" id="cat" name="cat">';
		sensorCategorySelect += '<option data-interface="" value="">' + Blockly.Msg.NEW_SENSOR_SELECT_ONE + '</option>';
		workspace.allSensors.categories.forEach(function(item, index) {
			sensorCategorySelect += '<option value="' + item.id + '">' + Blockly.Msg[item.id] + '</option>';
		})
		sensorCategorySelect += "</select>";
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

	// Build adc unit
	var adcUnit = [];
	var adcUnitSelect = "";

	adcUnit.push(["ADC1","ADC1", 8, 1])
	for (var key in Code.status.maps.externalAdcUnits) {
		adcUnit.push([Code.status.maps.externalAdcUnits[key][0], Code.status.maps.externalAdcUnits[key][0], Code.status.maps.externalAdcUnits[key][1], key]);
	}

	var adcUnitSelect = '<select id="adcUnit" name="adcUnit" onchange="Blockly.Sensors.adcUnitChanged()">';
	adcUnit.forEach(function(item, index) {
		adcUnitSelect += '<option '+((edit && (item[3] == block.unit))?"selected":"")+' value="' + item[3] + '">' + item[0] + '</option>';
	})
	adcUnitSelect += "</select>";

	// Build adc channels selection
	var adcChan = [];
	var adcChanSelect = "";
	var adcUnit = 1;
	var i;
	
	if (edit) {
		adcUnit = block.unit;
	}
	
	if (adcUnit == 1){
		// Get internal channels
		for (var key in Code.status.maps.analogPins) {
			adcChan.push([Code.status.maps.analogPins[key][1] + ' - ' + Code.status.maps.analogPins[key][0].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
		}		
	} else {
		// Get externals channels		
		for(i=0; i < Code.status.maps.externalAdcUnits[adcUnit][1];i++) {
			adcChan.push(["channel%1".replace("%1", String(i)), i.toString()]);
		}		
	}
	
	var adcChanSelect = '<select id="adc" name="adc">';
	adcChan.forEach(function(item, index) {
		adcChanSelect += '<option '+((edit && (item[1] == block.pin))?"selected":"")+' value="' + item[1] + '">' + item[0] + '</option>';
	})
	adcChanSelect += "</select>";

	// Build i2c selection
	var i2c = [];
	var i2cSelect = "";

	for (var key in Code.status.maps.i2cUnits) {
		i2c.push([Code.status.maps.i2cUnits[key][0], key]);
	}
	
	var i2cSelect = '<select id="i2c" name="i2c">';
	i2c.forEach(function(item, index) {
		i2cSelect += '<option '+((edit && (item[1] == block.pin))?"selected":"")+' value="' + item[1] + '">' + item[0] + '</option>';
	})
	i2cSelect += "</select>";
	
	// Build uart selection
	var uart = [];
	var uartSelect = "";

	for (var key in Code.status.maps.uartUnits) {
		uart.push([Code.status.maps.uartUnits[key][0], key]);
	}
	
	var uartSelect = '<select id="uart" name="uart">';
	uart.forEach(function(item, index) {
		uartSelect += '<option '+((edit && (item[1] == block.pin))?"selected":"")+' value="' + item[1] + '">' + item[0] + '</option>';
	})
	uartSelect += "</select>";

	// Build 1-wire selection
	var oneWireSelect = [];
	var oneWireSelect = "";

	for (var key in  Code.status.maps.digitalPins) {
		gpio.push([Code.status.maps.digitalPins[key][3] + ' - ' + Code.status.maps.digitalPins[key][0].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
	}

	var oneWireSelect = '<select id="1-wire" name="1-wire">';
	gpio.forEach(function(item, index) {
		oneWireSelect += '<option '+((edit && (item[1] == block.pin))?"selected":"")+' value="' + item[1] + '">' + item[0] + '</option>';
	})
	oneWireSelect += "</select>";

	dialogForm = '<form id="sensor_form">';

	if (sensorCategorySelect != "") {
		dialogForm += '<label for="id">' + Blockly.Msg.SENSOR_CATEGORY + ':&nbsp;&nbsp;</label>' + sensorCategorySelect + '<br>';		

		dialogForm += '<div class="id" style="display: none;">';
		dialogForm += '<label for="id">' + Blockly.Msg.SENSOR + ':&nbsp;&nbsp;</label>' + sensorSelect;
		dialogForm += '</div>';
	} else {
		dialogForm += '<div class="id">';
		dialogForm += '<label for="id">' + Blockly.Msg.SENSOR + ':&nbsp;&nbsp;</label>' + sensorSelect;
		dialogForm += '</div>';		
	}
	

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

	if (edit && (block['interface'] == "1-WIRE")) {
		dialogForm += '<div>';
		dialogForm += '<label for="1-wire">' + Blockly.Msg.SENSOR_DIGITAL_PIN + ':&nbsp;&nbsp;</label>' + oneWireSelect;
		dialogForm += '<br><label for="device">' + Blockly.Msg.SENSOR_DEVICE_ID + ':&nbsp;&nbsp;</label>';
		dialogForm += '<input type="text" value="'+block.device+'" name="device" id="device">'
		dialogForm += '</div>';
	} else {
		dialogForm += '<div class="sensor_interface" id="1-WIRE_sensor" style="display: none;">';
		dialogForm += '<label for="1-wire">' + Blockly.Msg.SENSOR_DIGITAL_PIN + ':&nbsp;&nbsp;</label>' + oneWireSelect;
		dialogForm += '<br><label for="device">' + Blockly.Msg.SENSOR_DEVICE_ID + ':&nbsp;&nbsp;</label>';
		dialogForm += '<input type="text" value="1" name="device" id="device">'
		dialogForm += '</div>';
	}

	if (edit && (block['interface'] == "ADC")) {
		dialogForm += '<div>';
		dialogForm += '<label for="adc">' + Blockly.Msg.SENSOR_ANALOG_PIN + ':&nbsp;&nbsp;</label>' + adcUnitSelect + "&nbsp;&nbsp;" + adcChanSelect;
		dialogForm += '</div>';
	} else {
		dialogForm += '<div class="sensor_interface" id="ADC_sensor" style="display: none;">';
		dialogForm += '<label for="adc">' + Blockly.Msg.SENSOR_ANALOG_PIN + ':&nbsp;&nbsp;</label>' + adcUnitSelect + "&nbsp;&nbsp;" + adcChanSelect;
		dialogForm += '</div>';
	}

	if (edit && (block['interface'] == "I2C")) {
		dialogForm += '<div>';
		dialogForm += '<label for="i2c">' + Blockly.Msg.SENSOR_I2C + ':&nbsp;&nbsp;</label>' + i2cSelect;
		dialogForm += '</div>';
	} else {
		dialogForm += '<div class="sensor_interface" id="I2C_sensor" style="display: none;">';
		dialogForm += '<label for="i2c">' + Blockly.Msg.SENSOR_I2C + ':&nbsp;&nbsp;</label>' + i2cSelect;
		dialogForm += '</div>';
	}

	if (edit && (block['interface'] == "UART")) {
		dialogForm += '<div>';
		dialogForm += '<label for="uart">' + Blockly.Msg.SENSOR_UART + ':&nbsp;&nbsp;</label>' + uartSelect;
		dialogForm += '</div>';
	} else {
		dialogForm += '<div class="sensor_interface" id="UART_sensor" style="display: none;">';
		dialogForm += '<label for="uart">' + Blockly.Msg.SENSOR_UART + ':&nbsp;&nbsp;</label>' + uartSelect;
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
						var device = form.find("#device").val();
						var unit = form.find("#adcUnit").val();
							
						if ((sensor != "") && (interf != "")) {
							workspace.createSensor(
								edit ? block['name'] : undefined,
								Blockly.Sensors.createSetupStructure(id, sensor, interf, pin, unit, device)
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
