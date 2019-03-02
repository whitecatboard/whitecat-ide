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

goog.provide('Blockly.wc.FieldException');

goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Msg');
goog.require('Blockly.Events');
goog.require('goog.asserts');
goog.require('goog.string');

/**
 * Class for a event's dropdown field.
 * @param {?string} eventname The default name for the event.  If null,
 *     a unique event name will be generated.
 * @param {Function=} opt_validator A function that is executed when a new
 *     option is selected.  Its sole argument is the new option value.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.wc.FieldException = function(eventname, opt_validator) {
	Blockly.wc.FieldException.superClass_.constructor.call(this,
		Blockly.wc.FieldException.dropdownCreate, opt_validator);
	this.setValue(eventname || '');
};
goog.inherits(Blockly.wc.FieldException, Blockly.FieldDropdown);

Blockly.wc.FieldException.prototype.setText = function(newText) {
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

Blockly.wc.FieldException.prototype.setValue = function(newValue) {
	if (newValue === null || newValue === this.value_) {
		return; // No change if null.
	}
	if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
		Blockly.Events.fire(new Blockly.Events.Change(
			this.sourceBlock_, 'field', this.name, this.value_, newValue));
	}

	// Add
	if (this.sourceBlock_) {
		this.sourceBlock_.workspace.doCreateEvent(undefined, newValue);
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
 * Return a sorted list of event names for event dropdown menus.
 * Include a special option at the end for creating a new event name.
 * @return {!Array.<string>} Array of event names.
 * @this {!Blockly.wc.FieldException}
 */
Blockly.wc.FieldException.find = function(statement, exceptionList) {
	while (statement) {
		statement = statement.targetBlock();
		if (statement) {
			if (typeof statement.module != "undefined") {
				if (typeof Code.status.exceptions[statement.module] != "undefined") {
					for (var i = 0; i < Code.status.exceptions[statement.module].length; i++) {
						var exceptionName = statement.module + ".error." + Code.status.exceptions[statement.module][i];
						
						if (exceptionList.indexOf(exceptionName) == -1) {
							exceptionList.push(exceptionName);
						}										
					}			
				}	
			}
			
			var connections = statement.getConnections_();
			for (var i = 0; i < connections.length; i++) {
				if (connections[i].type == 1) {
					Blockly.wc.FieldException.find(connections[i], exceptionList);
				}
			}
			
			statement = statement.nextConnection;
		}
	}
};

Blockly.wc.FieldException.dropdownCreate = function() {
	var exceptionList = [];

	if (this.sourceBlock_ && this.sourceBlock_.workspace) {
		if (this.sourceBlock_.isInBlock("exception_try", "CATCH0")) {
			var statement = this.sourceBlock_.getFieldInParentBlock("exception_try", "TRY0");
			if (statement) {
				Blockly.wc.FieldException.find(statement, exceptionList);									
			} 
		}		
	}
	
	exceptionList.push("any");
	
	exceptionList = exceptionList.sort();
	
	var options = [];
	for (var i = 0; i < exceptionList.length; i++) {
		if (Blockly.Msg[exceptionList[i]]) {
			options[i] = [Blockly.Msg[exceptionList[i]], exceptionList[i]];
		} else {
			options[i] = [exceptionList[i], exceptionList[i]];
		}
	}

	return options;
};

/**
 * Handle the selection of an item in the event dropdown menu.
 * Special case the 'Rename event...' and 'Delete event...' options.
 * In the rename case, prompt the user for a new name.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!goog.ui.MenuItem} menuItem The MenuItem selected within menu.
 */
Blockly.wc.FieldException.prototype.onItemSelected = function(menu, menuItem) {
	var menuLength = menu.getChildCount();
	var itemText = menuItem.getValue();

	if (itemText !== null) {
		this.setValue(itemText);
	}
};
