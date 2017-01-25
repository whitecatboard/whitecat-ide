/*
 * Whitecat Blocky Environment, sensor blocks
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

goog.provide('Blockly.Blocks.sensor');

goog.require('Blockly.Blocks');

/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.sensor.HUE = 290;


Blockly.Blocks['sensor_acquire'] = {
  createSensorIfNeeded: function(instance) {
  	// Get index for sensor
  	var index = instance.workspace.sensorIndexOf(instance.name);
	
  	// Sensor must be created
  	if (index == -1) {
  	  instance.workspace.createSensor(
  		  Blockly.Sensors.createSetupStructure(instance.sid, instance.name, instance.interface, instance.pin)
  	  );
	  
  	  //Get index for sensor
  	  index = instance.workspace.sensorIndexOf(instance.name);
  	}
	
	return index;		
  },

  /**
   * Mutator block for container.
   * @this Blockly.Block
   */
  init: function() {
      this.setHelpUrl(Blockly.Msg.SENSOR_ACQUIRE_HELPURL);
      this.setColour(Blockly.Blocks.sensor.HUE);
      this.appendDummyInput()
          .appendField("","ID")
	      .appendField(new Blockly.FieldSensor(Blockly.Msg.SENSOR_DEFAULT_NAME), "NAME");
	  this.setPreviousStatement(true, null);
	  this.setNextStatement(true, null);
	  this.setTooltip(Blockly.Msg.SENSOR_ACQUIRE_TOOLTIP);
   },
   mutationToDom: function() {
     var container = document.createElement('mutation');
	 var sensor = this.getFieldValue("NAME");
	 var index = Blockly.getMainWorkspace().sensorIndexOf(sensor);
	 var interf;
	 var pin;
	 var sid;
	 
	 if (typeof this.interface == "undefined") {	 	
		 interf = Blockly.getMainWorkspace().sensors.setup[index].interface;
	 } else {
		 interf = this.interface;
	 }
	 
	 if (typeof this.pin == "undefined") {	 	
		 pin = Blockly.getMainWorkspace().sensors.setup[index].pin;
	 } else {
		 pin = this.pin;
	 }

	 if (typeof this.sid == "undefined") {	 	
		 sid = Blockly.getMainWorkspace().sensors.setup[index].id;
	 } else {
		 sid = this.sid;
	 }

     container.setAttribute('interface', interf);
     container.setAttribute('pin', pin);
     container.setAttribute("sid", sid);
     container.setAttribute("name", sensor);
	 
	 this.interface = interf;
	 this.pin = pin;
	 this.sid = sid;
	 this.name = sensor;
	 	 
     return container;
   },
   domToMutation: function(xmlElement) {
     this.interface = xmlElement.getAttribute('interface');
     this.pin = xmlElement.getAttribute('pin');
     this.sid = xmlElement.getAttribute("sid");
     this.name = xmlElement.getAttribute("name");
   	 Blockly.Blocks['sensor_acquire'].createSensorIfNeeded(this);	
	 this.updateShape_();
   },
   updateShape_: function() {	 
	 this.getField("ID").setText(Blockly.Msg.SENSOR_ACQUIRE.replace("%1",this.sid));
   }
};

Blockly.Blocks['sensor_read'] = {
  /**
   * Mutator block for container.
   * @this Blockly.Block
   */
  init: function() {
      this.setHelpUrl(Blockly.Msg.SENSOR_READ_HELPURL);
      this.setColour(Blockly.Blocks.sensor.HUE);
	  
      this.appendDummyInput()
	      .appendField(Blockly.Msg.SENSOR_READ1)
	      .appendField(new Blockly.FieldDropdown([['magnitude','']]),"PROVIDES")
	      .appendField("","ID")
 	      .appendField(new Blockly.FieldSensor(Blockly.Msg.SENSOR_DEFAULT_NAME), "NAME");
      this.setOutput(true);
      this.setTooltip(Blockly.Msg.SENSOR_READ_TOOLTIP);
  },
  mutationToDom: Blockly.Blocks['sensor_acquire'].mutationToDom,
  domToMutation: Blockly.Blocks['sensor_acquire'].domToMutation,
  updateShape_: function() {
	var index = Blockly.getMainWorkspace().sensorIndexOf(this.name);	

	// Build provides option list
  	var provides = [];
	this.workspace.sensors.provides[index].forEach(function(item, index) {
		provides.push([item.id, item.id]);
	});

    this.getField("ID").setText(Blockly.Msg.SENSOR_READ2.replace("%1",this.sid));
	this.getField("PROVIDES").menuGenerator_ = provides;
  }  
};

Blockly.Blocks['sensor_set'] = {
  /**
   * Mutator block for container.
   * @this Blockly.Block
   */
  init: function() {
      this.setHelpUrl(Blockly.Msg.SENSOR_SET_HELPURL);
      this.setColour(Blockly.Blocks.sensor.HUE);
	  
      this.appendDummyInput()
	      .appendField(Blockly.Msg.SENSOR_SET1)	  
	      .appendField(new Blockly.FieldDropdown([['','']]),"SETTINGS")
	      .appendField(Blockly.Msg.SENSOR_SET2);	  
	  
	  this.appendValueInput("VALUE");
	  
      this.appendDummyInput()
	      .appendField("","ID")
 	      .appendField(new Blockly.FieldSensor(Blockly.Msg.SENSOR_DEFAULT_NAME), "NAME");

      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);

      this.setTooltip(Blockly.Msg.SENSOR_SET_TOOLTIP);
  },
  mutationToDom: Blockly.Blocks['sensor_acquire'].mutationToDom,
  domToMutation: Blockly.Blocks['sensor_acquire'].domToMutation,
  updateShape_: function() {
	var index = Blockly.getMainWorkspace().sensorIndexOf(this.name);	

	// Build settings option list
  	var settings = [];
	this.workspace.sensors.settings[index].forEach(function(item, index) {
		settings.push([item.id, item.id]);
	});

    this.getField("ID").setText(Blockly.Msg.SENSOR_SET3.replace("%1",this.sid));
	this.getField("SETTINGS").menuGenerator_ = settings;
  }  
};