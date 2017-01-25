/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Utility functions for handling sensors.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Sensors');

goog.require('Blockly.Blocks');
goog.require('Blockly.Workspace');
goog.require('goog.string');


/**
 * Category to separate sensor names from procedures and generated functions.
 */
Blockly.Sensors.NAME_TYPE = 'SENSOR';

/**
 * Construct the blocks required by the flyout for the sensor category.
 * @param {!Blockly.Workspace} workspace The workspace contianing sensors.
 * @return {!Array.<!Element>} Array of XML block elements.
 */
Blockly.Sensors.flyoutCategory = function(workspace) {
  var sensors = workspace.sensors;

  var xmlList = [];
  var button = goog.dom.createDom('button');
  button.setAttribute('text', Blockly.Msg.NEW_SENSOR);
  button.setAttribute('callbackKey', 'CREATE_SENSOR');

  workspace.registerButtonCallback('CREATE_SENSOR', function(button) {
    Blockly.Sensors.createSensor(button.getTargetWorkspace());
  });

  xmlList.push(button);
  
  sensors.names.forEach(function(name, index) {
      if (Blockly.Blocks['sensor_acquire']) {
	      var block = goog.dom.createDom('block');
	      block.setAttribute('type', 'sensor_acquire');
		  
	      var field = goog.dom.createDom('field', null, name);
	      field.setAttribute('name', 'NAME');
	      block.appendChild(field);	
		  		  	  
	      var field = goog.dom.createDom('field', null, Blockly.Msg.SENSOR_ACQUIRE.replace("%1",workspace.sensors.setup[index].id));
	      field.setAttribute('name', 'ID');
	      block.appendChild(field);	

	      xmlList.push(block);
	  }
	  
      if (Blockly.Blocks['sensor_read']) {
	      var block = goog.dom.createDom('block');
	      block.setAttribute('type', 'sensor_read');

	      var field = goog.dom.createDom('field', null, name);
	      field.setAttribute('name', 'NAME');
	      block.appendChild(field);

	      var field = goog.dom.createDom('field', null, Blockly.Msg.SENSOR_READ2.replace("%1",workspace.sensors.setup[index].id));
	      field.setAttribute('name', 'ID');
	      block.appendChild(field);	

	      var field = goog.dom.createDom('field', null, workspace.sensors.provides[index][0].id);
	      field.setAttribute('name', 'PROVIDES');
	      block.appendChild(field);	

	      block.appendChild(field);
	      xmlList.push(block);
	  }

      if (Blockly.Blocks['sensor_set'] && (workspace.sensors.settings[index].length > 0)) {
	      var block = goog.dom.createDom('block');
	      block.setAttribute('type', 'sensor_set');

	      var field = goog.dom.createDom('field', null, name);
	      field.setAttribute('name', 'NAME');
	      block.appendChild(field);

	      var field = goog.dom.createDom('field', null, Blockly.Msg.SENSOR_SET3.replace("%1",workspace.sensors.setup[index].id));
	      field.setAttribute('name', 'ID');
	      block.appendChild(field);	

	      var field = goog.dom.createDom('field', null, workspace.sensors.settings[index][0].id);
	      field.setAttribute('name', 'SETTINGS');
	      block.appendChild(field);	

	      var field = goog.dom.createDom('field', null, "0");
	      field.setAttribute('name', 'NUM');

	      var shadow = goog.dom.createDom('shadow', null, field);
	      shadow.setAttribute('type', 'math_number');

	      var value = goog.dom.createDom('value', null, shadow);
	      value.setAttribute('name', 'VALUE');
	      block.appendChild(value);	

	      block.appendChild(field);
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
		form.find("#"+interf+"_sensor").show();		
	}
};

/**
 * Create a new sensor on the given workspace.
 * @param {!Blockly.Workspace} workspace The workspace on which to create the
 *     sensor.
 * @param {function(null|undefined|string)=} opt_callback A callback. It will
 *     return an acceptable new sensor name, or null if change is to be
 *     aborted (cancel button), or undefined if an existing sensor was chosen.
 */

Blockly.Sensors.createSetupStructure = function(id, sensor, interf, pin) {
  var setup = {};
  setup.id = id;
  setup.name = sensor;
  if (interf == "GPIO") {
	  setup.interface = "GPIO";
	  setup.pin = pin;
  } else if (interf == "ADC") {
	  setup.interface = "ADC";						  	
	  setup.pin = pin;
  }	
  
  return setup;
}

Blockly.Sensors.createSensor = function(workspace, opt_callback) {
	var dialogForm = "";
	
	// Build sensor selection
	var sensorSelect = '<select onchange="Blockly.Sensors.sensorChanged()" id="id" name="id">';
	sensorSelect += '<option data-interface="" value="">' + Blockly.Msg.NEW_SENSOR_SELECT_ONE + '</option>';
	Board.sensors.forEach(function(item, index) {
		sensorSelect += '<option data-interface="'+item.interface+'" value="'+item.id+'">' + item.id + '</option>';
	})
	sensorSelect += "</select>";
	
	// Build gpio selection
	var gpio = [];
	var gpioSelect = "";
	
	for(var key in Board.digitalPins) {
		gpio.push([key + ' - ' + Board.digitalPins[key].replace(/pio\.P/i,'').replace(/_/i,''),key]);
	}  

	var gpioSelect = '<select id="gpio" name="gpio">';
	gpio.forEach(function(item, index) {
		gpioSelect += '<option value="'+item[1]+'">' + item[0] + '</option>';
	})
	gpioSelect += "</select>";

	// Build adc selection
	var adc = [];
	var adcSelect = "";
	
	for(var key in Board.analogPins) {
		adc.push([key + ' - ' + Board.analogPins[key].replace(/pio\.P/i,'').replace(/_/i,''),key]);
	}  

	var adcSelect = '<select id="adc" name="adc">';
	adc.forEach(function(item, index) {
		adcSelect += '<option value="'+item[1]+'">' + item[0] + '</option>';
	})
	adcSelect += "</select>";
	

	dialogForm  = '<form id="sensor_form">';
	dialogForm += '<label for="id">'+Blockly.Msg.SENSOR+':&nbsp;&nbsp;</label>' + sensorSelect;
	dialogForm += '<div class="sensor_name" style="display: none;">';
	dialogForm += '<label for="sensor_name">'+Blockly.Msg.SENSOR_NAME+':&nbsp;&nbsp;</label>';
	dialogForm += '<input id="sensor_name" name="sensor_name" value="'+Blockly.Msg.SENSOR_DEFAULT_NAME + workspace.sensors.names.length +'">';
	dialogForm += '</div>';
	dialogForm += '<div class="sensor_interface" id="GPIO_sensor" style="display: none;">';
	dialogForm += '<label for="gpio">'+Blockly.Msg.SENSOR_DIGITAL_PIN+':&nbsp;&nbsp;</label>' + gpioSelect;
	dialogForm += '</div>';
	dialogForm += '<div class="sensor_interface" id="ADC_sensor" style="display: none;">';
	dialogForm += '<label for="adc">'+Blockly.Msg.SENSOR_ANALOG_PIN+':&nbsp;&nbsp;</label>' + adcSelect;
	dialogForm += '</div>';
	dialogForm += '</form>';

   	bootbox.dialog({
   		title: Blockly.Msg.NEW_SENSOR_TITLE,
   	    message: dialogForm ,
   		buttons: {
   		    main: {
			  label: Blockly.Msg.SENSOR_CREATE,
   		      classensor: "btn-primary",
   		      callback: function() {
				 var form = jQuery("#sensor_form");
	
			  	  // Get selected sensor and it's interface
			      var id = form.find("#id").find(":selected").attr("value");
			  	  if (id == Blockly.Msg.NEW_SENSOR_SELECT_ONE) {
			  	  	id = "";
			  	  }

				  // If sensor is valid ...
			      var sensor   = form.find("#sensor_name").val();

		          if (workspace.sensorIndexOf(sensor) == -1) {	
				      var interf   = form.find("#id").find(":selected").data("interface");
					  var pin      = form.find("#" + interf.toLowerCase()).val();
					  			  
					  if ((sensor != "") && (interf != "")) {
						  workspace.createSensor(
						  	Blockly.Sensors.createSetupStructure(id, sensor, interf, pin)
						  );
						  workspace.toolbox_.refreshSelection();
					  } else {
						  return false;
					  }
				  } else {
					  Code.showError('Error', Blockly.Msg.SENSOR_ALREADY_EXISTS.replace('%1',sensor), function() {});
				  }
   			  }
   		    },
   		    danger: {
   		      label: Blockly.Msg.SENSOR_CANCEL,
   		      classensor: "btn-danger",
   		      callback: function() {
   		      }
   		    },
   		},
   		closable: false
   	});	
};