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
 * @fileoverview Variable input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldSensor');

goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Msg');
goog.require('Blockly.Sensors');
goog.require('goog.asserts');
goog.require('goog.string');


/**
 * Class for a variable's dropdown field.
 * @param {?string} name The default name for the variable.  If null,
 *     a unique variable name will be generated.
 * @param {Function=} opt_validator A function that is executed when a new
 *     option is selected.  Its sole argument is the new option value.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldSensor = function(name, opt_validator) {
  Blockly.FieldSensor.superClass_.constructor.call(this,
      Blockly.FieldSensor.dropdownCreate, opt_validator);
  this.setValue(name || '');
};
goog.inherits(Blockly.FieldSensor, Blockly.FieldDropdown);

/**
 * The menu item index for the rename variable option.
 * @type {number}
 */
Blockly.FieldSensor.prototype.renameSensorItemIndex_ = -1;

/**
 * The menu item index for the delete variable option.
 * @type {number}
 */
Blockly.FieldSensor.prototype.deleteSensorItemIndex_ = -1;


/**
 * Install this dropdown on a block.
 */
Blockly.FieldSensor.prototype.init = function() {
  if (this.fieldGroup_) {
    // Dropdown has already been initialized once.
    return;
  }
  Blockly.FieldSensor.superClass_.init.call(this);
  if (!this.getValue()) {
    // Variables without names get uniquely named for this workspace.
    var workspace =
        this.sourceBlock_.isInFlyout ?
            this.sourceBlock_.workspace.targetWorkspace :
            this.sourceBlock_.workspace;
    this.setValue(Blockly.Variables.generateUniqueName(workspace));
  }
};

/**
 * Attach this field to a block.
 * @param {!Blockly.Block} block The block containing this field.
 */
Blockly.FieldSensor.prototype.setSourceBlock = function(block) {
  goog.asserts.assert(!block.isShadow(),
      'Variable fields are not allowed to exist on shadow blocks.');
  Blockly.FieldSensor.superClass_.setSourceBlock.call(this, block);
};

/**
 * Get the variable's name (use a variableDB to convert into a real name).
 * Unline a regular dropdown, variables are literal and have no neutral value.
 * @return {string} Current text.
 */
Blockly.FieldSensor.prototype.getValue = function() {
  return this.getText();
};

/**
 * Set the variable name.
 * @param {string} newValue New text.
 */
Blockly.FieldSensor.prototype.setValue = function(newValue) {
  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.Change(
        this.sourceBlock_, 'field', this.name, this.value_, newValue));
  }
  this.value_ = newValue;
  this.setText(newValue);
};

/**
 * Return a sorted list of variable names for variable dropdown menus.
 * Include a special option at the end for creating a new variable name.
 * @return {!Array.<string>} Array of variable names.
 * @this {!Blockly.FieldSensor}
 */
Blockly.FieldSensor.dropdownCreate = function() {
  if (this.sourceBlock_ && this.sourceBlock_.workspace) {
	  var sensorList = this.sourceBlock_.workspace.sensors.names.slice(0);
  } else {
    var sensorList = [];
  }
  
  // Ensure that the currently selected sensor is an option.
  var name = this.getText();
  if (name && sensorList.indexOf(name) == -1) {
    sensorList.push(name);
  }
  sensorList.sort(goog.string.caseInsensitiveCompare);

  this.renameSensorItemIndex_ = sensorList.length;
  sensorList.push(Blockly.Msg.RENAME_SENSOR);

  this.deleteSensorItemIndex_ = sensorList.length;
  sensorList.push(Blockly.Msg.DELETE_SENSOR.replace('%1', name));
  // Sensors are not language-specific, use the name as both the user-facing
  // text and the internal representation.
  var options = [];
  for (var i = 0; i < sensorList.length; i++) {
    options[i] = [sensorList[i], sensorList[i]];
  }
  return options;
};

/**
 * Handle the selection of an item in the variable dropdown menu.
 * Special case the 'Rename variable...' and 'Delete variable...' options.
 * In the rename case, prompt the user for a new name.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!goog.ui.MenuItem} menuItem The MenuItem selected within menu.
 */
Blockly.FieldSensor.prototype.onItemSelected = function(menu, menuItem) {
  var menuLength = menu.getChildCount();
  var itemText = menuItem.getValue();

  if (this.sourceBlock_) {
    var workspace = this.sourceBlock_.workspace;
    if (this.renameSensorItemIndex_ >= 0 && menu.getChildAt(this.renameSensorItemIndex_) === menuItem) {
		// Rename sensor.
		var oldName = this.getText();
		Blockly.hideChaff();
		//Blockly.Sensors.promptName(
		//  Blockly.Msg.RENAME_VARIABLE_TITLE.replace('%1', oldName), oldName,
		//  function(newName) {
		//    if (newName) {
		//      workspace.renameVariable(oldName, newName);
		//    }
		//  });
      return;
    } else if (this.deleteSensorItemIndex_ >= 0 && menu.getChildAt(this.deleteSensorItemIndex_) === menuItem) {
      // Delete sensor.
      // workspace.deleteVariable(this.getText());
      return;
    }

    // Call any validation function, and allow it to override.
    itemText = this.callValidator(itemText);
  }
  if (itemText !== null) {
    this.setValue(itemText);
  }
};
