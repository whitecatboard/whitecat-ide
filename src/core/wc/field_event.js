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

goog.provide('Blockly.wc.FieldEvent');

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
Blockly.wc.FieldEvent = function(eventname, opt_validator) {
	Blockly.wc.FieldEvent.superClass_.constructor.call(this,
		Blockly.wc.FieldEvent.dropdownCreate, opt_validator);
	this.setValue(eventname || '');
};
goog.inherits(Blockly.wc.FieldEvent, Blockly.FieldDropdown);

/**
 * The menu item index for the create event option.
 * @type {number}
 */
Blockly.wc.FieldEvent.prototype.createEventItemIndex_ = -1;

/**
 * The menu item index for the rename event option.
 * @type {number}
 */
Blockly.wc.FieldEvent.prototype.renameEventItemIndex_ = -1;

/**
 * The menu item index for the delete event option.
 * @type {number}
 */
Blockly.wc.FieldEvent.prototype.deleteEventIndex_ = -1;

Blockly.wc.FieldEvent.prototype.setText = function(newText) {
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

Blockly.wc.FieldEvent.prototype.setValue = function(newValue) {
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
	var options = this.getOptions_();
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
 * @this {!Blockly.wc.FieldEvent}
 */
Blockly.wc.FieldEvent.dropdownCreate = function() {
	if (this.sourceBlock_ && this.sourceBlock_.workspace) {
		// Get a copy of the list, so that adding rename and new event options
		// doesn't modify the workspace's list.
		var eventList = this.sourceBlock_.workspace.events.names.slice(0);
	} else {
		var eventList = [];
	}
	// Ensure that the currently selected event is an option.
	var name = this.getValue();
	if (name && eventList.indexOf(name) == -1) {
		eventList.push(name);
	}

	this.createEventItemIndex_ = eventList.length;
	eventList.push(Blockly.Msg.EVENT_CREATE);

	this.renameEventItemIndex_ = eventList.length;
	eventList.push(Blockly.Msg.RENAME_EVENT);

	this.deleteEventIndex_ = eventList.length;
	eventList.push(Blockly.Msg.DELETE_EVENT.replace('%1', name));

	var options = [];
	for (var i = 0; i < eventList.length; i++) {
		if (Blockly.Msg[eventList[i]]) {
			options[i] = [Blockly.Msg[eventList[i]], eventList[i]];
		} else {
			options[i] = [eventList[i], eventList[i]];
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
Blockly.wc.FieldEvent.prototype.onItemSelected = function(menu, menuItem) {
	var menuLength = menu.getChildCount();
	var itemText = menuItem.getValue();
	if (this.sourceBlock_) {
		var workspace = this.sourceBlock_.workspace;
		if (this.renameEventItemIndex_ >= 0 &&
			menu.getChildAt(this.renameEventItemIndex_) === menuItem) {
			// Rename event.
			workspace.createEvent(this.getText(), this);
			return;
		} else if (this.deleteEventIndex_ >= 0 &&
			menu.getChildAt(this.deleteEventIndex_) === menuItem) {
			// Delete event.
			workspace.deleteEvent(this.getText(), this);
			return;
		} else if (this.createEventItemIndex_ >= 0 &&
			menu.getChildAt(this.createEventItemIndex_) === menuItem) {
			// Create event.
			workspace.createEvent(undefined, this);
			return;
		}

		// Call any validation function, and allow it to override.
		itemText = this.callValidator(itemText);
	}
	if (itemText !== null) {
		this.setValue(itemText);
	}
};
