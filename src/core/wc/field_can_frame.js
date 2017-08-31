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

goog.provide('Blockly.wc.FieldCanFrame');

goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Msg');
goog.require('Blockly.Events');
goog.require('goog.asserts');
goog.require('goog.string');

/**
 * Class for a canFrame's dropdown field.
 * @param {?string} canFrameName The default name for the canFrame.  If null,
 *     a unique canFrame name will be generated.
 * @param {Function=} opt_validator A function that is executed when a new
 *     option is selected.  Its sole argument is the new option value.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.wc.FieldCanFrame = function(canFrameName, opt_validator) {
	Blockly.wc.FieldCanFrame.superClass_.constructor.call(this,
		Blockly.wc.FieldCanFrame.dropdownCreate, opt_validator);
	this.setValue(canFrameName || '');
};
goog.inherits(Blockly.wc.FieldCanFrame, Blockly.FieldDropdown);

/**
 * The menu item index for the create canFrame option.
 * @type {number}
 */
Blockly.wc.FieldCanFrame.prototype.createCanFrameItemIndex_ = -1;

/**
 * The menu item index for the rename canFrame option.
 * @type {number}
 */
Blockly.wc.FieldCanFrame.prototype.renameCanFrameItemIndex_ = -1;

/**
 * The menu item index for the delete canFrame option.
 * @type {number}
 */
Blockly.wc.FieldCanFrame.prototype.deleteCanFrameIndex_ = -1;

Blockly.wc.FieldCanFrame.prototype.setText = function(newText) {
	if (newText === null) {
		// No change if null.
		return;
	}
	
	if (Blockly.Msg[newText]) {
		newText = Blockly.Msg[newText];
	}
	
	newText = String(newText);
	if (newText === this.text_) {
		// No change.
		return;
	}
	this.text_ = newText;
	// Set width to 0 to force a rerender of this field.
	this.size_.width = 0;

	if (this.sourceBlock_ && this.sourceBlock_.rendered) {
		this.sourceBlock_.render();
		this.sourceBlock_.bumpNeighbours_();
	}
};

Blockly.wc.FieldCanFrame.prototype.setValue = function(newValue) {
	if (newValue === null || newValue === this.value_) {
		return; // No change if null.
	}
	if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
		Blockly.Events.fire(new Blockly.Events.Change(
			this.sourceBlock_, 'field', this.name, this.value_, newValue));
	}

	// Add
	if (this.sourceBlock_) {
		this.sourceBlock_.workspace.doCreateCanFrame(undefined, newValue);
	}

	this.value_ = newValue;
	// Look up and display the human-readable text.
	var options = this.getOptions();
	for (var i = 0; i < options.length; i++) {
		// Options are tuples of human-readable text and language-neutral values.
		if (options[i][1] == newValue) {
			var content = options[i][0];
			if (typeof content == 'object') {
				this.imageJson_ = content;
				this.setText(content.alt);
			} else {
				this.imageJson_ = null;
				this.setText(content);
			}
			return;
		}
	}
	// Value not found.  Add it, maybe it will become valid once set
	// (like variable names).
	this.setText(newValue);
};

/**
 * Return a sorted list of canFrame names for canFrame dropdown menus.
 * Include a special option at the end for creating a new canFrame name.
 * @return {!Array.<string>} Array of canFrame names.
 * @this {!Blockly.wc.FieldCanFrame}
 */
Blockly.wc.FieldCanFrame.dropdownCreate = function() {
	if (this.sourceBlock_ && this.sourceBlock_.workspace) {
		// Get a copy of the list, so that adding rename and new canFrame options
		// doesn't modify the workspace's list.
		var canFrameList = this.sourceBlock_.workspace.canFrames.names.slice(0);
	} else {
		var canFrameList = [];
	}
	// Ensure that the currently selected canFrame is an option.
	var name = this.getValue();
	if (name && canFrameList.indexOf(name) == -1) {
		canFrameList.push(name);
	}

	this.createCanFrameItemIndex_ = canFrameList.length;
	canFrameList.push(Blockly.Msg.CAN_FRAME_CREATE);

	this.renameCanFrameItemIndex_ = canFrameList.length;
	canFrameList.push(Blockly.Msg.RENAME_CAN_FRAME);

	this.deleteCanFrameIndex_ = canFrameList.length;
	canFrameList.push(Blockly.Msg.DELETE_CAN_FRAME.replace('%1', name));

	var options = [];
	for (var i = 0; i < canFrameList.length; i++) {
		if (Blockly.Msg[canFrameList[i]]) {
			options[i] = [Blockly.Msg[canFrameList[i]], canFrameList[i]];
		} else {
			options[i] = [canFrameList[i], canFrameList[i]];
		}
	}

	return options;
};

/**
 * Handle the selection of an item in the canFrame dropdown menu.
 * Special case the 'Rename canFrame...' and 'Delete canFrame...' options.
 * In the rename case, prompt the user for a new name.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!goog.ui.MenuItem} menuItem The MenuItem selected within menu.
 */
Blockly.wc.FieldCanFrame.prototype.onItemSelected = function(menu, menuItem) {
	var menuLength = menu.getChildCount();
	var itemText = menuItem.getValue();
	if (this.sourceBlock_) {
		var workspace = this.sourceBlock_.workspace;
		if (this.renameCanFrameItemIndex_ >= 0 &&
			menu.getChildAt(this.renameCanFrameItemIndex_) === menuItem) {
			// Rename canFrame.
			workspace.createCanFrame(this.getText(), this);
			return;
		} else if (this.deleteCanFrameIndex_ >= 0 &&
			menu.getChildAt(this.deleteCanFrameIndex_) === menuItem) {
			// Delete canFrame.
			workspace.deleteCanFrame(this.getText(), this);
			return;
		} else if (this.createCanFrameItemIndex_ >= 0 &&
			menu.getChildAt(this.createCanFrameItemIndex_) === menuItem) {
			// Create canFrame.
			workspace.createCanFrame(undefined, this);
			return;
		}

		// Call any validation function, and allow it to override.
		itemText = this.callValidator(itemText);
	}
	if (itemText !== null) {
		this.setValue(itemText);
	}
};
