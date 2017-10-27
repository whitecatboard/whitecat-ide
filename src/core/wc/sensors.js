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
			mutation.setAttribute('sid', sensors.setup[index].id);
			mutation.setAttribute('name', name);

			for(var i=0;i < sensors.setup[index]['interface'].split(",").length;i++) {
				mutation.setAttribute('interface'+i+'_unit',  sensors.setup[index]['interface'+i+'_unit']);
				mutation.setAttribute('interface'+i+'_subunit',  sensors.setup[index]['interface'+i+'_subunit']);
				mutation.setAttribute('interface'+i+'_device',  sensors.setup[index]['interface'+i+'_device']);
			}

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
							if (typeof sensor.callback == "string") {
								has_callback = (sensor.callback == "true");
							} else {
								has_callback = sensor.callback;								
							}
						}
					});										
				}
			});
			
			if (has_callback) {
				var mutation = goog.dom.createDom('mutation', '');
				mutation.setAttribute('interface', sensors.setup[index]['interface']);
				mutation.setAttribute('sid', sensors.setup[index].id);
				mutation.setAttribute('name', name);
				
				for(var i=0;i < sensors.setup[index]['interface'].split(",").length;i++) {
					mutation.setAttribute('interface'+i+'_unit',  sensors.setup[index]['interface'+i+'_unit']);
					mutation.setAttribute('interface'+i+'_subunit',  sensors.setup[index]['interface'+i+'_subunit']);
					mutation.setAttribute('interface'+i+'_device',  sensors.setup[index]['interface'+i+'_device']);
				}
				
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
			mutation.setAttribute('sid', sensors.setup[index].id);
			mutation.setAttribute('name', name);
			
			for(var i=0;i < sensors.setup[index]['interface'].split(",").length;i++) {
				mutation.setAttribute('interface'+i+'_unit',  sensors.setup[index]['interface'+i+'_unit']);
				mutation.setAttribute('interface'+i+'_subunit',  sensors.setup[index]['interface'+i+'_subunit']);
				mutation.setAttribute('interface'+i+'_device',  sensors.setup[index]['interface'+i+'_device']);
			}			

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
			mutation.setAttribute('sid', sensors.setup[index].id);
			mutation.setAttribute('name', name);

			for(var i=0;i < sensors.setup[index]['interface'].split(",").length;i++) {
				mutation.setAttribute('interface'+i+'_unit',  sensors.setup[index]['interface'+i+'_unit']);
				mutation.setAttribute('interface'+i+'_subunit',  sensors.setup[index]['interface'+i+'_subunit']);
				mutation.setAttribute('interface'+i+'_device',  sensors.setup[index]['interface'+i+'_device']);
			}

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
	form.find(".sensor_interfaces").html("");
	
	if (cat == "other") {
		// Show all uncategorized sensors in this category
		var options = '<option data-interface="" value="">' + Blockly.Msg.NEW_SENSOR_SELECT_ONE + '</option>';

		Code.status.sensors.forEach(function(sensor) {
			var add = true;
			
			// Check if sensor is categorized
			thisInstance.currentWS.allSensors.sensors.forEach(function(csensor) {
				if (csensor.id == sensor.id) {
					// This sensor is categorized
					add = false;
				}
			});
			
			if (add) {
				var label = sensor.id;
				
				if (typeof Blockly.Msg[label] != "undefined") {
					label = Blockly.Msg[label];
				}
				
				options += '<option data-interface="' + sensor['interface'] + '" value="' + sensor.id + '">' + label + '</option>';			
			}
		});
		
		form.find("#id").html(options);
		form.find(".id").show();	
	} else {
		// Build sensor list from category
		thisInstance.currentWS.allSensors.categories.forEach(function(category) {
			if (category.id == cat) {
				var options = '<option data-interface="" value="">' + Blockly.Msg.NEW_SENSOR_SELECT_ONE + '</option>';
			
				category.sensors.forEach(function(csensor) {
					// Get sensor from board
					var bsensor = null;
					Code.status.sensors.forEach(function(sensor) {
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
}

Blockly.Sensors.InterfaceName = function(id, index) {
	var int_name = "";
	Code.status.sensors.forEach(function(sensor, idx) {
		if (sensor.id == id) {
			if (typeof sensor.interface_name != "undefined") {
				var tmp = sensor.interface_name.split(",")[index];
				
				if ((typeof tmp != "undefined") && (tmp != "")) {
					int_name = Blockly.Msg.SENSOR_INT_ATTACHED.replace("%1", tmp);			
				} else {
					int_name = Blockly.Msg.SENSOR_INT_ATTACHED.replace("%1", Blockly.Msg.SENSOR);
				}
			} else {
				int_name = Blockly.Msg.SENSOR_INT_ATTACHED.replace("%1", Blockly.Msg.SENSOR);				
			}
		}
	});
	
	return int_name;
};

Blockly.Sensors.GPIOSelection = function(index, id, block, edit) {
	var part = "";
	
	// Build gpio selection
	var gpio = [];
	var gpioSelect = "";

	for (var key in  Code.status.maps.digitalPins) {
		gpio.push([Code.status.maps.digitalPins[key][3] + ' - ' + Code.status.maps.digitalPins[key][0].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
	}

	var gpioSelect = '<select id="interface'+index+'_unit" name="interface'+index+'_unit">';
	gpio.forEach(function(item) {
		gpioSelect += '<option '+((edit && (item[1] == block['interface'+index+'_unit']))?"selected":"")+' value="' + item[1] + '">' + item[0] + '</option>';
	})
	gpioSelect += "</select>";	
	

	var int_name = Blockly.Sensors.InterfaceName(id, index);
	
	if (edit) {
		part += '<div>';
		part += '<label for="gpio">' + int_name + ':&nbsp;&nbsp;</label>' + gpioSelect;
		part += '</div>';
	} else {
		part += '<div id="GPIO_sensor">';
		part += '<label for="gpio">' + int_name + ':&nbsp;&nbsp;</label>' + gpioSelect;
		part += '</div>';
	}
	
	return part;
};

Blockly.Sensors.I2CSelection = function(index, id, block, edit) {
	var part = "";
	
	// Build i2c selection
	var i2c = [];
	var i2cSelect = "";

	for (var key in Code.status.maps.i2cUnits) {
		i2c.push([Code.status.maps.i2cUnits[key][0], key]);
	}

	var i2cSelect = '<select id="interface'+index+'_unit" name="interface'+index+'_unit">';
	i2c.forEach(function(item) {
		i2cSelect += '<option '+((edit && (item[1] == block['interface'+index+'_unit']))?"selected":"")+' value="' + item[1] + '">' + item[0] + '</option>';
	})
	i2cSelect += "</select>";
	
	var int_name = Blockly.Sensors.InterfaceName(id, index);

	if (edit) {
		part += '<div>';
		part += '<label for="i2c">' + int_name + ':&nbsp;&nbsp;</label>' + i2cSelect;
		part += '</div>';
	} else {
		part += '<div id="I2C_sensor">';
		part += '<label for="i2c">' + int_name + ':&nbsp;&nbsp;</label>' + i2cSelect;
		part += '</div>';
	}
	
	return part;
};

Blockly.Sensors.UARTSelection = function(index, id, block, edit) {
	var part = "";

	// Build uart selection
	var uart = [];
	var uartSelect = "";

	for (var key in Code.status.maps.uartUnits) {
		uart.push([Code.status.maps.uartUnits[key][0], key]);
	}
	
	var uartSelect = '<select id="interface'+index+'_unit" name="interface'+index+'_unit">';
	uart.forEach(function(item) {
		uartSelect += '<option '+((edit && (item[1] == block['interface'+index+'_unit']))?"selected":"")+' value="' + item[1] + '">' + item[0] + '</option>';
	})
	uartSelect += "</select>";

	var int_name = Blockly.Sensors.InterfaceName(id, index);

	if (edit) {
		part += '<div>';
		part += '<label for="uart">' + int_name + ':&nbsp;&nbsp;</label>' + uartSelect;
		part += '</div>';
	} else {
		part += '<div id="UART_sensor">';
		part += '<label for="uart">' + int_name + ':&nbsp;&nbsp;</label>' + uartSelect;
		part += '</div>';
	}

	return part;
};

Blockly.Sensors.ONEWIRESelection = function(index, id, block, edit) {
	var part = "";
	var gpio = [];

	// Build 1-wire selection
	var oneWireSelect = [];
	var oneWireSelect = "";

	for (var key in  Code.status.maps.digitalPins) {
		gpio.push([Code.status.maps.digitalPins[key][3] + ' - ' + Code.status.maps.digitalPins[key][0].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
	}

	var oneWireSelect = '<select id="interface'+index+'_unit" name="interface'+index+'_unit">';
	gpio.forEach(function(item) {
		oneWireSelect += '<option '+((edit && (item[1] == block['interface'+index+'_unit']))?"selected":"")+' value="' + item[1] + '">' + item[0] + '</option>';
	})
	oneWireSelect += "</select>";

	var int_name = Blockly.Sensors.InterfaceName(id, index);

	if (edit) {
		part += '<div>';
		part += '<label for="1-wire">' + int_name + ':&nbsp;&nbsp;</label>' + oneWireSelect;
		part += '<br><label for="device">' + Blockly.Msg.SENSOR_DEVICE_ID + ':&nbsp;&nbsp;</label>';
		part += '<input type="text" value="'+block['interface'+index+'_device']+'" name="interface'+index+'_device" id="interface'+index+'_device">'
		part += '</div>';
	} else {
		part += '<div id="1-WIRE_sensor">';
		part += '<label for="1-wire">' + int_name + ':&nbsp;&nbsp;</label>' + oneWireSelect;
		part += '<br><label for="device">' + Blockly.Msg.SENSOR_DEVICE_ID + ':&nbsp;&nbsp;</label>';
		part += '<input type="text" value="1" name="interface'+index+'_device" id="interface'+index+'_device">'
		part += '</div>';
	}
	
	return part;
};

Blockly.Sensors.ADCSelection = function(index, id, block, edit) {
	var part = "";
	
	// Build adc unit
	var adcUnit = [];
	var adcUnitSelect = "";

	adcUnit.push(["ADC1","ADC1", 8, 1])
	for (var key in Code.status.maps.externalAdcUnits) {
		adcUnit.push([Code.status.maps.externalAdcUnits[key][0], Code.status.maps.externalAdcUnits[key][0], Code.status.maps.externalAdcUnits[key][1], key]);
	}

	var adcUnitSelect = '<select id="interface'+index+'_unit" name="interface'+index+'_unit" onchange="Blockly.Sensors.adcUnitChanged('+index+')">';
	adcUnit.forEach(function(item) {
		adcUnitSelect += '<option '+((edit && (item[3] == block['interface'+index+'_unit']))?"selected":"")+' value="' + item[3] + '">' + item[0] + '</option>';
	})
	adcUnitSelect += "</select>";

	// Build adc channels selection
	var adcChan = [];
	var adcChanSelect = "";
	var adcUnit = 1;
	var i;
	
	if (edit) {
		adcUnit = block['interface'+index+'_unit'];
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
	
	var adcChanSelect = '<select id="interface'+index+'_subunit" name="interface'+index+'_subunit">';
	adcChan.forEach(function(item) {
		adcChanSelect += '<option '+((edit && (item[1] == block['interface'+index+'_subunit']))?"selected":"")+' value="' + item[1] + '">' + item[0] + '</option>';
	})
	adcChanSelect += "</select>";
	
	var int_name = Blockly.Sensors.InterfaceName(id, index);

	if (edit) {
		part += '<div>';
		part += '<label for="adc">' + int_name + ':&nbsp;&nbsp;</label>' + adcUnitSelect + "&nbsp;&nbsp;" + adcChanSelect;
		part += '</div>';
	} else {
		part += '<div class="sensor_interface" id="ADC_sensor">';
		part += '<label for="adc">' + int_name + ':&nbsp;&nbsp;</label>' + adcUnitSelect + "&nbsp;&nbsp;" + adcChanSelect;
		part += '</div>';
	}
	
	return part;
};

Blockly.Sensors.sensorChanged = function(block, edit) {
	var form = jQuery("#sensor_form");

	// Get selected sensor and it's interface
	var id;
	
	if (edit) {
		id = form.find("#id").attr("value");
	} else {
		id = form.find("#id").find(":selected").attr("value");
	}

	if (id == Blockly.Msg.NEW_SENSOR_SELECT_ONE) {
		id = "";
	}

	var interf;
	
	if (edit) {
		interf = form.find("#id").data("interface").split(",");	
	} else {
   		interf = form.find("#id").find(":selected").data("interface").split(",");		
	}
	
	form.find(".sensor_interfaces").html("");
	interf.forEach(function(interf, index) {
		var part = "";
		
		if (interf == "GPIO") {
			part = Blockly.Sensors.GPIOSelection(index, id, block, edit);
		} else if (interf == "I2C") {
			part = Blockly.Sensors.I2CSelection(index, id, block, edit);
		} else if (interf == "UART") {
			part = Blockly.Sensors.UARTSelection(index, id, block, edit);
		} else if (interf == "1-WIRE") {
			part = Blockly.Sensors.ONEWIRESelection(index, id, block, edit);
		} else if (interf == "ADC") {
			part = Blockly.Sensors.ADCSelection(index, id, block, edit);
		}
		
		form.find(".sensor_interfaces").append(part);
	});
	
	
	// If sensor is valid show it's name
	if ((id != "") && (interf != "")) {
		form.find(".sensor_name").show();
	} else {
		form.find(".sensor_name").hide();
	}
};

Blockly.Sensors.adcUnitChanged = function(index) {
	var channels = [];
	var i;		

	var form = jQuery("#sensor_form");
	
	// Get selected unit
	var unit = form.find('#interface' + index + '_unit').find(":selected").attr("value");
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
	channels.forEach(function(item) {
		options += '<option value="' + item[1] + '">' + item[0] + '</option>';
	});
	
	form.find('#interface' + index + '_subunit').html(options);
};

Blockly.Sensors.createSetupStructure = function(edit, block) {
	var setup = {};
	
	if ((typeof block == "undefined") || (edit)) {
		var form = jQuery("#sensor_form");

		var id = form.find("#id").find(":selected").attr("value");
		if (id == Blockly.Msg.NEW_SENSOR_SELECT_ONE) {
			id = "";
		}
		
		setup.id = id;
		setup.name = form.find("#sensor_name").val();
		
		if (edit) {
			setup['interface'] = form.find("#id").data('interface');
		} else {
			setup['interface'] = form.find("#id").find(":selected").data('interface');
		}
		
		for (var i = 0;i < setup['interface'].split(",").length;i++) {
			setup['interface'+i+'_unit'] = form.find("#"+'interface'+i+'_unit').val();
			setup['interface'+i+'_subunit'] = form.find("#"+'interface'+i+'_subunit').val()
			setup['interface'+i+'_device'] = form.find("#"+'interface'+i+'_device').val()
		}		
	} else {
		setup.id = block.sid;
		setup.name = block.name;
		setup['interface'] = block['interface'];
	
		for (var i = 0;i < block['interface'].split(",").length;i++) {
			setup['interface'+i+'_unit'] = block['interface'+i+'_unit'];
			setup['interface'+i+'_subunit'] = block['interface'+i+'_subunit'];
			setup['interface'+i+'_device'] = block['interface'+i+'_device'];
		}		
	}
	
	
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
		workspace.allSensors.categories.forEach(function(item) {
			sensorCategorySelect += '<option value="' + item.id + '">' + Blockly.Msg[item.id] + '</option>';
		})
		sensorCategorySelect += '<option data-interface="" value="other">' + Blockly.Msg.other + '</option>';
		sensorCategorySelect += "</select>";
	}

	// Build sensor selection
	if (edit) {
		sensorSelect = '<span>' + block.sid + '</span>';
		sensorSelect += '<input type="hidden" id="id" name="id" value="'+block.sid+'" data-interface="' + block['interface'] + '"></input>';
	} else {
		var sensorSelect = '<select onchange="Blockly.Sensors.sensorChanged(' + block + ', ' + edit + ')" id="id" name="id">';
		sensorSelect += '<option data-interface="" value="">' + Blockly.Msg.NEW_SENSOR_SELECT_ONE + '</option>';
		sensorSelect += "</select>";
	}

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

	dialogForm += '<div class="sensor_interfaces"';
	dialogForm += '</div>';

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

						if ((sensor != "") && (interf != "")) {
							workspace.createSensor(
								edit ? block['name'] : undefined,
								Blockly.Sensors.createSetupStructure(edit,block)
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
		closable: false,
		onEscape: true
	}).on('shown.bs.modal', function (e) {
		Blockly.Sensors.sensorChanged(block, edit);
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
