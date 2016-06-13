/*
 * Whitecat Blocky Environment, i2c block definition
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

goog.provide('Blockly.Blocks.i2c');

goog.require('Blockly.Blocks');

/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.i2c.HUE = 260;
  
Blockly.Blocks['configurei2c'] = {
  init: function() {
      var modules = [];
  	  var pins = [];
	
  	  for(var key in Board.i2cModules) {
  		modules.push([key, key]);
  	  }  
	
  	  for(var key in Board.digitalPins) {
  		pins.push([key + ' - ' + Board.digitalPins[key].replace(/pio\.P/i,'').replace(/_/i,''),key]);
  	  }  

      this.appendDummyInput()
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(Blockly.Msg.configurei2c)
          .appendField(new Blockly.FieldDropdown(modules), "MODULE");
      this.appendDummyInput()
          .appendField(' ' + Blockly.Msg.i2cSDA + ' ')
          .appendField(new Blockly.FieldDropdown(pins), "SDA");
      this.appendDummyInput()
          .appendField(' ' + Blockly.Msg.i2cSCL + ' ')
          .appendField(new Blockly.FieldDropdown(pins), "SCL");
      this.appendDummyInput()
          .appendField(' ' + Blockly.Msg.i2cSpeed + ' ');
	  this.appendValueInput("SPEED")
  	  	   .setCheck('Number');
      this.appendDummyInput()
          .appendField(' ' + Blockly.Msg.Khz);
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(Blockly.Blocks.i2c.HUE);
      this.setTooltip('');
      this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['i2cstartcondition'] = {
  init: function() {
      var modules = [];
	
  	  for(var key in Board.i2cModules) {
  		modules.push([key, key]);
  	  }  
	
      this.appendDummyInput()
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(Blockly.Msg.i2cStartConditionFor)
          .appendField(new Blockly.FieldDropdown(modules), "MODULE");
	  this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(Blockly.Blocks.i2c.HUE);
      this.setTooltip('');
      this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['i2cstopcondition'] = {
  init: function() {
      var modules = [];
	
  	  for(var key in Board.i2cModules) {
  		modules.push([key, key]);
  	  }  
	
      this.appendDummyInput()
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(Blockly.Msg.i2cStopConditionFor)
          .appendField(new Blockly.FieldDropdown(modules), "MODULE");
	  this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(Blockly.Blocks.i2c.HUE);
      this.setTooltip('');
      this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['i2caddress'] = {
  init: function() {
      var modules = [];
	
  	  for(var key in Board.i2cModules) {
  		modules.push([key, key]);
  	  }  
	
      this.appendDummyInput()
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(Blockly.Msg.i2cAddress)
          .appendField(new Blockly.FieldDropdown(modules), "MODULE")
          .appendField(' ');

	  this.appendValueInput("ADDRESS")
  	  	   .setCheck('Number');
  
      this.appendDummyInput()
          .appendField(' ' + Blockly.Msg.for + ' ')
          .appendField(new Blockly.FieldDropdown([[Blockly.Msg.read,'read'],[Blockly.Msg.write,'write']]), "DIRECTION");

	  	this.setOutput(true, null);
	      this.setInputsInline(true);
	      this.setPreviousStatement(false, null);
	      this.setNextStatement(false, null);
	      this.setColour(Blockly.Blocks.io.HUE);
	      this.setTooltip('');
	      this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['i2cread'] = {
  init: function() {
      var modules = [];
	
  	  for(var key in Board.i2cModules) {
  		modules.push([key, key]);
  	  }  
	
      this.appendDummyInput()
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(Blockly.Msg.i2cReadFrom)
          .appendField(new Blockly.FieldDropdown(modules), "MODULE");
	  	this.setOutput(true, null);
	      this.setInputsInline(true);
	      this.setPreviousStatement(false, null);
	      this.setNextStatement(false, null);
	      this.setColour(Blockly.Blocks.io.HUE);
	      this.setTooltip('');
	      this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['i2cwrite'] = {
  init: function() {
      var modules = [];
	
  	  for(var key in Board.i2cModules) {
  		modules.push([key, key]);
  	  }  
	
      this.appendDummyInput()
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(Blockly.Msg.i2cWriteTo)
          .appendField(new Blockly.FieldDropdown(modules), "MODULE")
		  .appendField(' ' + MSG['value'] + ' ');

  this.appendValueInput("VALUE")
 	  	   .setCheck('Number');
	  	this.setOutput(true, null);
	      this.setInputsInline(true);
	      this.setPreviousStatement(false, null);
	      this.setNextStatement(false, null);
	      this.setColour(Blockly.Blocks.io.HUE);
	      this.setTooltip('');
	      this.setHelpUrl('http://www.example.com/');
  }
};