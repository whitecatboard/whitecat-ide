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
 * @fileoverview Logic blocks for Blockly.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Blocks.io');

goog.require('Blockly.Blocks');


/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.logic.HUE = 210;
  
Blockly.Blocks['configuredigitalpin'] = {
  init: function() {
	var pins = [];
	
	for(var key in Board.digitalPins) {
		pins.push([key + ' - ' + Board.digitalPins[key].replace(/pio\.P/i,'').replace(/_/i,''),key]);
	}  
	
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.configuredigitalpin)
        .appendField(new Blockly.FieldDropdown(pins), "PIN");
    this.appendDummyInput()
        .appendField(' ' + Blockly.Msg.AS + ' ')
        .appendField(new Blockly.FieldDropdown([[Blockly.Msg.INPUT, "Input"], [Blockly.Msg.OUTPUT, "Output"]]), "DIRECTION");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['configureanalogpin'] = {
  init: function() {
	var pins = [];
	
	for(var key in Board.analogPins) {
		pins.push([key + ' - ' + Board.analogPins[key].replace(/pio\.P/i,'').replace(/_/i,''),key]);
	}  
	
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.configureanalogpin)
        .appendField(new Blockly.FieldDropdown(pins), "PIN");
    this.appendDummyInput()
        .appendField(Blockly.Msg.WITH)
        .appendField(new Blockly.FieldDropdown([["12", "12"], ["10", "10"], ["8", "8"], ["6", "6"]]), "RESOLUTION")
        .appendField(' ' + Blockly.Msg.BITSOFRESOLUTION + ' ');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['setdigitalpin'] = {
  init: function() {
	var pins = [];
	
	for(var key in Board.digitalPins) {
		pins.push([key + ' - ' + Board.digitalPins[key].replace(/pio\.P/i,'').replace(/_/i,''),key]);
	}  
	
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.setdigitalpin)
        .appendField(new Blockly.FieldDropdown(pins), "PIN");
    this.appendDummyInput()
        .appendField(' ' + Blockly.Msg.TO + ' ')
        .appendField(new Blockly.FieldDropdown([[Blockly.Msg.HIGH, "1"], [Blockly.Msg.LOW, "0"]]), "VALUE");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['getdigitalpin'] = {
  init: function() {
	var pins = [];
	
	for(var key in Board.digitalPins) {
		pins.push([key + ' - ' + Board.digitalPins[key].replace(/pio\.P/i,'').replace(/_/i,''),key]);
	}  
	
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.getdigitalpin )
        .appendField(new Blockly.FieldDropdown(pins), "PIN");
	this.setOutput(true, null);
    this.setInputsInline(true);
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['getanalogpin'] = {
  init: function() {
	var pins = [];
	
	for(var key in Board.analogPins) {
		pins.push([key + ' - ' + Board.analogPins[key].replace(/pio\.P/i,'').replace(/_/i,''),key]);
	}  
	
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.getanalogpin )
        .appendField(new Blockly.FieldDropdown(pins), "PIN");
	this.setOutput(true, null);
    this.setInputsInline(true);
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
