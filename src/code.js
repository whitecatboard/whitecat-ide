/**
 *
 * Board. Blocky Environment, Board. board definition
 *
 * Copyright (C) 2015 - 2016
 * IBEROXARXA SERVICIOS INTEGRALES, S.L. & CSS IBÉRICA, S.L.
 * 
 * Author: Jaume Olivé (jolive@iberoxarxa.com / jolive@Board.board.org)
 *
 * -----------------------------------------------------------------------
 * 
 * Blockly Demos: Code
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
 * @fileoverview JavaScript for Blockly's Code demo.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Create a namespace for the application.
 */
var Code = {};

if (typeof require != "undefined") {
	if (typeof require('nw.gui') != "undefined") {
		Code.folder = "";
	} else {
		Code.folder = "https://ide.whitecatboard.org";
	}
} else {
	Code.folder = "https://ide.whitecatboard.org";	
}

var blockAbstraction = {
	Low: 0,
	High: 1
};

var statusType = {
	Alert: 0,
	Info: 1,
	Nothing: 3,
	Progress: 4
};

Code.blockAbstraction = blockAbstraction.High;

Code.defaultStatus = {
	cpu: "ESP32",
	connected: false,
	modules: {
		"thread": true,
		"nvs": true,
		"pack": true,
		"i2c": true,
		"pio": true,
		"adc": true,
		"pwm": true,
		"tft": true,
		"spi": true,
		"tmr": true,
		"uart": true,
		"lora": true,
		"mqtt": true,
		"sensor": true,
		"servo": true,
		"net": true,
	},
	maps: []
};

Code.devices = [
	{
		"vendorId": "0x10c4",
		"productId": "0xea60",
		"vendor": "Silicon Labs"
	},
	{
		"vendorId": "0x403",
		"productId": "0x6001",
		"vendor": "FTDI"
	},
	{
		"vendorId": "0x1a86",
		"productId": "0x7523",
		"vendor": "CH340"
	}
];

Code.status = JSON.parse(JSON.stringify(Code.defaultStatus));

Code.platforms = ["MacIntel", "Win32", "Linux x86_64"];

Code.progressDialog = false;

Code.currentFile = {
	path: '/',
	file: ''
};

Code.settings = {
	"language": "en",
	"board": "N1ESP32"
};

Code.currentStatus = {
	type: statusType.Nothing,
	message: ""
}

/**
 * Lookup for names of supported languages.  Keys should be in ISO 639 format.
 */
Code.LANGUAGE_NAME = {
	'en': 'English',
	'ca': 'Català',
	'es': 'Español',
};

/**
 * List of RTL languages.
 */
Code.LANGUAGE_RTL = [];

Code.workspace = {};
Code.workspace.type = "blocks";
Code.workspace.prevType = Code.workspace.type;
Code.workspace.blocks = null;
Code.workspace.editor = null;
Code.workspace.block_editor = null;
Code.workspace.block_editorCode = null;

/**
 * Is the current language (Code.LANG) an RTL language?
 * @return {boolean} True if RTL, false if LTR.
 */
Code.isRtl = function() {
	return Code.LANGUAGE_RTL.indexOf(Code.settings.language) != -1;
};

Code.getCurrentFullPath = function() {
	var path;
	
	path = Code.currentFile.path;
	if (path.slice(-1) != "/") {
		path += "/";
	}
	
	path += Code.currentFile.file;
	
	return path;
}

Code.getPathFor = function(folder, file) {
	var path;
	
	if (folder == "") {
		path = Code.currentFile.path;		
	} else {
		path = folder;
	}
	
	if (path.slice(-1) != "/") {
		path += "/";
	}
	
	if (file == "") {
		path += Code.currentFile.file;	
	} else {
		path += file;
	}
		
	return path;	
}

/**
 * Load blocks saved on App Engine Storage or in session/local storage.
 * @param {string} defaultXml Text representation of default blocks.
 */
Code.loadBlocks = function(defaultXml) {
	try {
		var loadOnce = window.sessionStorage.loadOnceBlocks;
	} catch (e) {
		// Firefox sometimes throws a SecurityError when accessing sessionStorage.
		// Restarting Firefox fixes this, so it looks like a bug.
		var loadOnce = null;
	}
	if ('BlocklyStorage' in window && window.location.hash.length > 1) {
		// An href with #key trigers an AJAX call to retrieve saved blocks.
		BlocklyStorage.retrieveXml(window.location.hash.substring(1));
	} else if (loadOnce) {
		// Language switching stores the blocks during the reload.
		delete window.sessionStorage.loadOnceBlocks;
		var xml = Blockly.Xml.textToDom(loadOnce);
		Blockly.Xml.domToWorkspace(xml, Code.workspace.blocks);
		Code.workspace.blocks.scrollCenter();
	} else if (defaultXml) {
		// Load the editor with default starting blocks.
		var xml = Blockly.Xml.textToDom(defaultXml);
		Blockly.Xml.domToWorkspace(xml, Code.workspace.blocks);
		Code.workspace.blocks.scrollCenter();
	} else if ('BlocklyStorage' in window) {
		// Restore saved blocks in a separate thread so that subsequent
		// initialization is not affected from a failed load.
		window.setTimeout(BlocklyStorage.restoreBlocks, 0);
	}
};

/**
 * Save the blocks and reload with a different language.
 */
Code.changeLanguage = function() {
	// Store the blocks for the duration of the reload.
	// This should be skipped for the index page, which has no blocks and does
	// not load Blockly.
	// MSIE 11 does not support sessionStorage on file:// URLs.
	if (typeof Blockly != 'undefined' && window.sessionStorage) {
		var xml = Blockly.Xml.workspaceToDom(Code.workspace.blocks);
		var text = Blockly.Xml.domToText(xml);
		window.sessionStorage.loadOnceBlocks = text;
	}

	var languageMenu = document.getElementById('languageMenu');
	var newLang = encodeURIComponent(
		languageMenu.options[languageMenu.selectedIndex].value);
	var search = window.location.search;
	if (search.length <= 1) {
		search = '?lang=' + newLang;
	} else if (search.match(/[?&]lang=[^&]*/)) {
		search = search.replace(/([?&]lang=)[^&]*/, '$1' + newLang);
	} else {
		search = search.replace(/\?/, '?lang=' + newLang + '&');
	}

	Code.settings.language = newLang;

	if (typeof require != "undefined") {
		if (typeof require('nw.gui') != "undefined") {
			Settings.save(Code.settings);
			chrome.runtime.reload();
		}
	}
};

Code.bindClick = function(element, func) {
	if (typeof element == 'string') {
		element = document.getElementById(element);
	}
	element.addEventListener('click', func, true);
	element.addEventListener('touchend', func, true);
};

/**
 * Load the Prettify CSS and JavaScript.
 */
Code.importPrettify = function() {
	var link = document.createElement('link');
	link.setAttribute('rel', 'stylesheet');
	link.setAttribute('href', Code.folder + '/prettify.css');
	document.head.appendChild(link);
	var script = document.createElement('script');
	script.setAttribute('src', Code.folder + '/prettify.js');
	document.head.appendChild(script);	
};

Code.getBBox_ = function(element) {
	var height = element.offsetHeight;
	var width = element.offsetWidth;
	var x = 0;
	var y = 0;
	do {
		x += element.offsetLeft;
		y += element.offsetTop;
		element = element.offsetParent;
	} while (element);
	return {
		height: height,
		width: width,
		x: x,
		y: y
	};
};

/**
 * List of tab names.
 * @private
 */
Code.TABS_ = ['board', 'program'];

Code.selected = 'program';

/**
 * Switch the visible pane when a tab is clicked.
 * @param {string} clickedName Name of tab clicked.
 */
Code.tabClick = function(clickedName) {
	if (document.getElementById('tab_program').className == 'tabon') {
		jQuery("#content_editor").css('visibility', 'hidden');
		jQuery(".blocklyWidgetDiv").css('visibility', 'hidden');
		jQuery(".blocklyTooltipDiv").css('visibility', 'hidden');
		jQuery(".blocklyToolboxDiv").css('visibility', 'hidden');
		jQuery("#content_blocks").css('visibility', 'hidden');

		Code.workspace.blocks.setVisible(false);
	}

	// Deselect all tabs and hide all panes.
	for (var i = 0; i < Code.TABS_.length; i++) {
		var name = Code.TABS_[i];
		document.getElementById('tab_' + name).className = 'taboff';

		jQuery("#" + 'content_' + name).css('visibility', 'hidden');
	}

	// Select the active tab.
	Code.selected = clickedName;
	document.getElementById('tab_' + clickedName).className = 'tabon';

	// Show the selected pane.
	jQuery("#" + 'content_' + clickedName).css('visibility', 'visible');

	if (Code.workspace.type == 'blocks') {
		jQuery("#tab_program").text(MSG['blocks']);
	} else {
		jQuery("#tab_program").text(MSG['editor']);
	}

	Code.renderContent();

	jQuery("#tab_board").text(MSG['board']);

	jQuery("#" + 'tab_' + clickedName).trigger('click');

	if (Code.selected == 'program') {
		if (Code.workspace.type == 'blocks') {
			jQuery("#content_editor").hide();
		} else if (Code.workspace.type == 'editor') {
			jQuery("#content_editor").show();
		} else if (Code.workspace.type == 'block_editor') {
			jQuery("#content_block_editor").show();
		}
	} else {
		jQuery("#content_editor").hide();
		jQuery("#content_block_editor").hide();
	}

	window.dispatchEvent(new Event('resize'));
};

/**
 * Populate the currently selected pane with content generated from the blocks.
 */
Code.renderContent = function() {
	var content = document.getElementById('content_' + Code.selected);

	Code.tabRefresh();
	if (Code.selected == 'board') {
		Code.currentFile.path = '';
		Code.currentFile.file = '';

		jQuery("#content_editor").css('visibility', 'hidden');
		jQuery("#content_block_editor").css('visibility', 'hidden');
		jQuery(".blocklyWidgetDiv").css('visibility', 'hidden');
		jQuery(".blocklyTooltipDiv").css('visibility', 'hidden');
		jQuery(".blocklyToolboxDiv").css('visibility', 'hidden');
		jQuery("#content_blocks").css('visibility', 'hidden');

		Code.listBoardDirectory(jQuery('#filesystem'), undefined, undefined, Code.loadFileFromBoard, undefined);
		Code.updateStatus();
	} else if (Code.selected == 'program') {
		if (Code.workspace.type == 'blocks') {
			jQuery("#content_block_editor").css('visibility', 'hidden');
			jQuery("#content_editor").css('visibility', 'hidden');
			jQuery("#content_blocks").css('visibility', 'visible');
			
			jQuery("#content_blocks").find(".injectionDiv").css('visibility', 'visible').show();
			jQuery("#content_block_editor").find(".injectionDiv").css('visibility', 'hidden').hide();
			
			if (Code.workspace.blocks) {
				Code.workspace.blocks.setVisible(true);
			}
		} else if (Code.workspace.type == 'editor') {
			jQuery("#content_blocks").css('visibility', 'hidden');
			jQuery("#content_editor").css('visibility', 'visible');
			jQuery("#content_block_editor").css('visibility', 'hidden');

			if (Code.workspace.blocks) {
				Code.workspace.blocks.setVisible(false);
			}
		} else if (Code.workspace.type == 'block_editor') {
			jQuery("#content_blocks").css('visibility', 'hidden');
			jQuery("#content_editor").css('visibility', 'hidden');
			jQuery("#content_block_editor").css('visibility', 'visible');
			
			jQuery("#content_blocks").find(".injectionDiv").css('visibility', 'hidden').hide();
			jQuery("#content_block_editor").css('visibility', 'visible');

			if (Code.workspace.blocks) {
				Code.workspace.blocks.setVisible(false);
			}
		}
	}
	Code.updateToolBox();
	window.dispatchEvent(new Event('resize'));
};

Code.buildToolBox = function(callback) {
	var xml = '';
	
	xml += '' +
		'<category id="catEvents">' +
		'<block type="when_board_starts"></block>' +
		'<block type="when_i_receive"></block>' +
		'<block type="broadcast"></block>' +
		'<block type="broadcast_and_wait"></block>' +
		'</category>' +
		'<category id="catControl">' +
		'<category id="catLoops">' +
		'<block type="controls_repeat_ext">' +
		'<value name="TIMES">' +
		'<shadow type="math_number">' +
		'<field name="NUM">10</field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="controls_whileUntil"></block>' +
		'<block type="controls_for">' +
		'<value name="FROM">' +
		'<shadow type="math_number">' +
		'<field name="NUM">1</field>' +
		'</shadow>' +
		'</value>' +
		'<value name="TO">' +
		'<shadow type="math_number">' +
		'<field name="NUM">10</field>' +
		'</shadow>' +
		'</value>' +
		'<value name="BY">' +
		'<shadow type="math_number">' +
		'<field name="NUM">1</field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="controls_forEach"></block>' +
		'<block type="controls_flow_statements"></block>' +
		'</category>' +
		'<category id="catLogic">' +
		'<block type="controls_if"></block>' +
		'<block type="logic_ternary"></block>' +
		'<block type="bitlogic_msb"></block>' +
		'<block type="bitlogic_lsb"></block>' +
		'</category>' +
		'<category id="catExceptions">' +
		'<block type="exception_try"></block>' +
		//		'<block type="exception_catch_error"></block>' +
		'<block type="exception_catch_other_error"></block>' +
		'<block type="exception_raise_again"></block>' +
		'</category>' +
		'<category id="catDelays">' +
		'<block type="wait_for"></block>' +
		'<block type="cpu_sleep">' +
		'<value name="SECONDS">' +
		'<shadow type="math_number">' +
		'<field name="NUM"></field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'</category>' +
		'</category>';

	xml += '' +
		'<category id="catOperators">' +
		'<category id="catOperatorsNumeric">' +
		'<block type="math_arithmetic">' +
		'<value name="A">' +
		'<shadow type="math_number">' +
		'<field name="NUM">1</field>' +
		'</shadow>' +
		'</value>' +
		'<value name="B">' +
		'<shadow type="math_number">' +
		'<field name="NUM">1</field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="math_number"></block>' +
		'<block type="math_constant"></block>' +
		'<block type="math_number_property">' +
		'<value name="NUMBER_TO_CHECK">' +
		'<shadow type="math_number">' +
		'<field name="NUM">0</field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="math_single">' +
		'<value name="NUM">' +
		'<shadow type="math_number">' +
		'<field name="NUM">9</field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="math_trig">' +
		'<value name="NUM">' +
		'<shadow type="math_number">' +
		'<field name="NUM">45</field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="math_round">' +
		'<value name="NUM">' +
		'<shadow type="math_number">' +
		'<field name="NUM">3.1</field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="math_on_list"></block>' +
		'<block type="math_modulo">' +
		'<value name="DIVIDEND">' +
		'<shadow type="math_number">' +
		'<field name="NUM">64</field>' +
		'</shadow>' +
		'</value>' +
		'<value name="DIVISOR">' +
		'<shadow type="math_number">' +
		'<field name="NUM">10</field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="math_constrain">' +
		'<value name="VALUE">' +
		'<shadow type="math_number">' +
		'<field name="NUM">50</field>' +
		'</shadow>' +
		'</value>' +
		'<value name="LOW">' +
		'<shadow type="math_number">' +
		'<field name="NUM">1</field>' +
		'</shadow>' +
		'</value>' +
		'<value name="HIGH">' +
		'<shadow type="math_number">' +
		'<field name="NUM">100</field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="math_random_int">' +
		'<value name="FROM">' +
		'<shadow type="math_number">' +
		'<field name="NUM">1</field>' +
		'</shadow>' +
		'</value>' +
		'<value name="TO">' +
		'<shadow type="math_number">' +
		'<field name="NUM">100</field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="math_random_float"></block>' +
		'</category>' +
		'<category id="catOperatorsLogic">' +
		'<block type="logic_compare"></block>' +
		'<block type="logic_operation"></block>' +
		'<block type="logic_negate"></block>' +
		'<block type="logic_boolean"></block>' +
		'<block type="logic_null"></block>' +
		'</category>' +
		'<category id="catOperatorsText">' +
		'<block type="text_join"></block>' +
		'<block type="text_append">' +
		'<value name="TEXT">' +
		'<shadow type="text"></shadow>' +
		'</value>' +
		'</block>' +
		'<block type="text_length">' +
		'<value name="VALUE">' +
		'<shadow type="text">' +
		'<field name="TEXT">abc</field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="text_isEmpty">' +
		'<value name="VALUE">' +
		'<shadow type="text">' +
		'<field name="TEXT"></field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="text_indexOf">' +
		'<value name="VALUE">' +
		'<block type="variables_get">' +
		'<field name="VAR">text</field>' +
		'</block>' +
		'</value>' +
		'<value name="FIND">' +
		'<shadow type="text">' +
		'<field name="TEXT">abc</field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="text_charAt">' +
		'<value name="VALUE">' +
		'<block type="variables_get">' +
		'<field name="VAR">text</field>' +
		'</block>' +
		'</value>' +
		'</block>' +
		'<block type="text_getSubstring">' +
		'<value name="STRING">' +
		'<block type="variables_get">' +
		'<field name="VAR">text</field>' +
		'</block>' +
		'</value>' +
		'</block>' +
		'<block type="text_changeCase">' +
		'<value name="TEXT">' +
		'<shadow type="text">' +
		'<field name="TEXT">abc</field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="text_trim">' +
		'<value name="TEXT">' +
		'<shadow type="text">' +
		'<field name="TEXT">abc</field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="text"></block>' +
		'<block type="text_pack"></block>' +
		'<block type="text_unpack"></block>' +
		'</category>' +
		'</category>' +
		'<category id="catLists" colour="260">' +
		'<block type="lists_create_with">' +
		'<mutation items="0"></mutation>' +
		'</block>' +
		'<block type="lists_create_with"></block>' +
		'<block type="lists_repeat">' +
		'<value name="NUM">' +
		'<shadow type="math_number">' +
		'<field name="NUM">5</field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="lists_length"></block>' +
		'<block type="lists_isEmpty"></block>' +
		'<block type="lists_indexOf">' +
		'<value name="VALUE">' +
		'<block type="variables_get">' +
		'<field name="VAR">list</field>' +
		'</block>' +
		'</value>' +
		'</block>' +
		'<block type="lists_getIndex">' +
		'<value name="VALUE">' +
		'<block type="variables_get">' +
		'<field name="VAR">list</field>' +
		'</block>' +
		'</value>' +
		'</block>' +
		'<block type="lists_setIndex">' +
		'<value name="LIST">' +
		'<block type="variables_get">' +
		'<field name="VAR">list</field>' +
		'</block>' +
		'</value>' +
		'</block>' +
		'<block type="lists_getSublist">' +
		'<value name="LIST">' +
		'<block type="variables_get">' +
		'<field name="VAR">list</field>' +
		'</block>' +
		'</value>' +
		'</block>' +
		'<block type="lists_split">' +
		'<value name="DELIM">' +
		'<shadow type="text">' +
		'<field name="TEXT">,</field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'</category>' +
		'<category id="catVariables" colour="330" custom="VARIABLE"></category>' +
		'<category id="catFunctions" colour="290" custom="PROCEDURE"></category>' +
		'<sep gap="32"></sep>';

	if (Code.status.modules.pio || Code.status.modules.adc || Code.status.modules.pwm) {
		xml += '<category id="catIO" colour="20">';

		if (Code.status.modules.pio) {
			xml += '<block type="setdigitalpin"></block>' +
				'<block type="getdigitalpin"></block>';
		}

		if (Code.status.modules.adc) {
			xml += '<block type="getanalogpin"></block>';
		}

		if (Code.status.modules.pwm) {
			xml += '' +
				'<block type="setpwmpin">' +
				'<value name="FREQUENCY">' +
				'<shadow type="math_number">' +
				'<field name="NUM">1000</field>' +
				'</shadow>' +
				'</value>' +
				'<value name="DUTY">' +
				'<shadow type="math_number">' +
				'<field name="NUM">50</field>' +
				'</shadow>' +
				'</value>' +
				'</block>';
			}

		xml += '</category>';
	}

	if (false && (Code.status.modules.i2c || Code.status.modules.lora)) {
		xml += '<category id="catComm" colour="20">';

		if (Code.status.modules.i2c) {
			xml += '' +
				'<category id="catI2C">' +
				'<block type="configurei2c">' +
				'<value name="SPEED">' +
				'<shadow type="math_number">' +
				'<field name="NUM">1000</field>' +
				'</shadow>' +
				'</value>' +
				'</block>' +
				'<block type="i2cstartcondition"></block>' +
				'<block type="i2cstopcondition"></block>' +
				'<block type="i2caddress">' +
				'<value name="ADDRESS">' +
				'<shadow type="math_number">' +
				'<field name="NUM">0</field>' +
				'</shadow>' +
				'</value>' +
				'</block>' +
				'<block type="i2cread"></block>' +
				'<block type="i2cwrite">' +
				'<value name="VALUE">' +
				'<shadow type="math_number">' +
				'<field name="NUM">0</field>' +
				'</shadow>' +
				'</value>' +
				'</block>' +
				'</category>';
		}

		if (Code.status.modules.lora) {
			xml += '' +
				'<category id="catLora">' +
				'<category id="catLoraOTAA">' +
				'<block type="lora_configure">' +
				'</block>' +
				'<block type="lora_set_deveui">' +
				'<value name="DEVEUI">' +
				'<shadow type="text">' +
				'<field name="TEXT"></field>' +
				'</shadow>' +
				'</value>' +
				'</block>' +
				'<block type="lora_set_appeui">' +
				'<value name="APPEUI">' +
				'<shadow type="text">' +
				'<field name="TEXT"></field>' +
				'</shadow>' +
				'</value>' +
				'</block>' +
				'<block type="lora_set_appkey">' +
				'<value name="APPKEY">' +
				'<shadow type="text">' +
				'<field name="TEXT"></field>' +
				'</shadow>' +
				'</value>' +
				'</block>' +
				'<block type="lora_set_adr"></block>' +
				'<block type="lora_set_dr"></block>' +
				'<block type="lora_set_retx"></block>' +
				'<block type="lora_join"></block>' +
				'<block type="lora_tx">' +
				'<value name="PORT">' +
				'<shadow type="math_number">' +
				'<field name="NUM">1</field>' +
				'</shadow>' +
				'</value>' +
				'<value name="PAYLOAD">' +
				'<shadow type="text">' +
				'<field name="TEXT"></field>' +
				'</shadow>' +
				'</value>' +
				'</block>' +
				'<block type="lora_get_port"></block>' +
				'<block type="lora_get_payload"></block>' +
				'<block type="text_pack"></block>' +
				'<block type="text_unpack"></block>' +
				'</category>' +
				'<category id="catLoraABP">' +
				'<block type="lora_configure">' +
				'</block>' +
				'<block type="lora_set_devaddr">' +
				'<value name="DEVADDR">' +
				'<shadow type="text">' +
				'<field name="TEXT"></field>' +
				'</shadow>' +
				'</value>' +
				'</block>' +
				'<block type="lora_set_nwkskey">' +
				'<value name="NWKSKEY">' +
				'<shadow type="text">' +
				'<field name="TEXT"></field>' +
				'</shadow>' +
				'</value>' +
				'</block>' +
				'<block type="lora_set_appskey">' +
				'<value name="APPSKEY">' +
				'<shadow type="text">' +
				'<field name="TEXT"></field>' +
				'</shadow>' +
				'</value>' +
				'</block>' +
				'<block type="lora_set_adr"></block>' +
				'<block type="lora_set_dr"></block>' +
				'<block type="lora_set_retx"></block>' +
				'<block type="lora_tx">' +
				'<value name="PORT">' +
				'<shadow type="math_number">' +
				'<field name="NUM">1</field>' +
				'</shadow>' +
				'</value>' +
				'<value name="PAYLOAD">' +
				'<shadow type="text">' +
				'<field name="TEXT"></field>' +
				'</shadow>' +
				'</value>' +
				'</block>' +
				'<block type="lora_get_port"></block>' +
				'<block type="lora_get_payload"></block>' +
				'<block type="text_pack"></block>' +
				'<block type="text_unpack"></block>' +
				'</category>' +
				'</category>';
		}

		xml += '</category>';
	}

	if (Code.status.modules.sensor) {
		xml += '<category id="catSensor" custom="SENSOR" colour="20">';
		xml += '<button function="expand(1)">Expand section</button>';
		xml += '</category>';
	}

	xml += '<category id="catActuators">';
	if (Code.status.modules.servo) {
		if (Code.blockAbstraction == blockAbstraction.Low) {
			xml += '<block type="servo_attach"></block>';
		}
	
		xml += '<block type="servo_move">' +
			'<value name="VALUE">' +
			'<shadow type="math_number">' +
			'<field name="NUM">0</field>' +
			'</shadow>' +
			'</value>' +
			'</block>';
	}
	xml += '</category>';

	if (Code.status.modules.net) {
		xml += '<category id="catNET" colour="20">';
		xml += '<category id="catWIFI" custom="WIFI" colour="20">';
		xml += '</category>';
		xml += '</category>';
	}
	
	if (Code.status.modules.lora) {
		xml +=  '<category id="catLora" custom="LORA" colour="20">';
		xml +=  '<button function="expand(1)">Expand section</button>';
		xml += '</category>';
	}

	if (Code.status.modules.mqtt) {
		xml +=  '<category id="catMQTT" custom="MQTT"colour="20">';
		xml +=  '<button function="expand(1)">Expand section</button>';
		xml += '</category>';
	}

	if (Code.status.modules.tft) {
		xml += '<category id="catTFT"colour="20">';
		xml += '</category>';
	}

	Code.lib.get(xml, "libs", function(xml){
		var toolbox = document.getElementById('toolbox');
		toolbox.innerHTML = xml;

		jQuery("#catVariables").attr("colour", Blockly.Blocks.variables.HUE);
		jQuery("#catLists").attr("colour", Blockly.Blocks.lists.HUE);
		jQuery("#catIO").attr("colour", Blockly.Blocks.io.HUE);
		jQuery("#catControl").attr("colour", Blockly.Blocks.control.HUE);
		jQuery("#catEvents").attr("colour", Blockly.Blocks.events.HUE);
		jQuery("#catSensor").attr("colour", Blockly.Blocks.sensor.HUE);
		jQuery("#catComm").attr("colour", Blockly.Blocks.i2c.HUE);
		jQuery("#catActuators").attr("colour", Blockly.Blocks.actuators.HUE);
		jQuery("#catOperators").attr("colour", Blockly.Blocks.operators.HUE);	
		jQuery("#catTFT").attr("colour", Blockly.Blocks.actuators.HUE);
		jQuery("#catNET").attr("colour", Blockly.Blocks.i2c.HUE);
		jQuery("#catWIFI").attr("colour", Blockly.Blocks.i2c.HUE);
		jQuery("#catMQTT").attr("colour", Blockly.Blocks.i2c.HUE);
		
		callback();	
	});
}

Code.updateToolBox = function() {
	Code.buildToolBox(function() {
		Code.initLanguage();

		var toolbox = null;
		var workSpace = null;
	
		if (Code.workspace.type == 'block_editor') {
			toolbox = document.getElementById('block_editortoolbox');
			workSpace = Code.workspace.block_editor;
		} else {
			toolbox = document.getElementById('toolbox');
			workSpace = Code.workspace.blocks;
		}

		if (workSpace) {
			workSpace.updateToolbox(toolbox);
		}				
	});
}

/**
 * Initialize Blockly.  Called on page load.
 */
Code.init = function() {
	Code.initLanguage();

	var rtl = Code.isRtl();
	var container = document.getElementById('content_area');
	var onresize = function(e) {
		var bBox = Code.getBBox_(container);
		for (var i = 0; i < Code.TABS_.length; i++) {
			var el;
			if (Code.TABS_[i] == 'program') {
				if (Code.workspace.type == 'blocks') {
					el = document.getElementById('content_blocks');
				} else if (Code.workspace.type == 'editor') {
					el = document.getElementById('content_editor');
				} else if (Code.workspace.type == 'block_editor') {
					el = document.getElementById('content_block_editor');
				}

				el.style.top = bBox.y + 'px';
				el.style.left = bBox.x + 'px';
				// Height and width need to be set, read back, then set again to
				// compensate for scrollbars.
				el.style.height = (bBox.height) + 'px';
				//el.style.height = (bBox.height - el.offsetHeight) + 'px';
			
				el.style.width = bBox.width + 'px';
				//el.style.width = (bBox.width - el.offsetWidth) + 'px';
			}

			el = document.getElementById('content_' + Code.TABS_[i]);
			el.style.top = bBox.y + 'px';
			el.style.left = bBox.x + 'px';
			// Height and width need to be set, read back, then set again to
			// compensate for scrollbars.
			el.style.height = bBox.height + 'px';
			//el.style.height = (2 * bBox.height - el.offsetHeight) + 'px';
			el.style.width = bBox.width + 'px';
			//el.style.width = (2 * bBox.width - el.offsetWidth) + 'px';

			//el = document.getElementById('logo');
			//el.style.position = 'absolute';
			//el.style.width = '100px';
			//el.style.top = 5 + 'px';
			//el.style.left = (bBox.width - bBox.x - 110) + 'px';
			//el.style.visibility = 'visible';

			el = document.getElementById('languageDiv');

			var bBox2 = Code.getBBox_(el);

			el.style.position = 'absolute';
			el.style.height = '38px';
			el.style.width = bBox2.width + 'px';
			el.style.top = (bBox.y - 38) + 'px';
			el.style.left = (bBox.width - bBox.x - bBox2.width - 10) + 'px';
			el.style.visibility = 'visible';

			//var bBoxBoardStatus = Code.getBBox_(document.getElementById('boardStatus'));
			//var boardConsole = document.getElementById('boardConsole');
			//var width = bBox.width - bBoxBoardStatus.x - bBoxBoardStatus.width - 40;
			//var height = bBox.height - bBoxBoardStatus.y - 20;

			//boardConsole.style.width = width + 'px';
			//boardConsole.style.height = height + 'px';

			//Term.resize(width, height);
		}
	};

	Code.workspace.type = 'blocks';
	onresize(undefined);
	window.addEventListener('resize', onresize, false);

	var toolbox = document.getElementById('toolbox');
	var block_editortoolbox = document.getElementById('block_editortoolbox');
	var block_editortoolboxpreview = document.getElementById('block_editortoolboxpreview');

	Code.workspace.blocks = Blockly.inject('content_blocks', {
		grid: {
			spacing: 25,
			length: 3,
			colour: '#ccc',
			snap: true
		},
		media: Code.folder + '/media/',
		rtl: rtl,
		toolbox: toolbox,
		zoom: {
			controls: true,
			wheel: true
		}
	});

	Code.workspace.blocks.wcInit();
	Code.watcher = new watcher();

	// Add to reserved word list: Local variables in execution environment (runJS)
	// and the infinite loop detection function.

	Code.loadBlocks('');

	ace.require("ace/ext/language_tools");
	Code.workspace.editor = ace.edit(document.getElementById("content_editor"));
	Code.workspace.editor.setShowPrintMargin(true);
	Code.workspace.editor.setPrintMarginColumn(120);
	Code.workspace.editor.getSession().setMode("ace/mode/lua");
	Code.workspace.editor.setOptions({
		enableBasicAutocompletion: true
	});
	Code.workspace.editor.$blockScrolling = Infinity;

	ace.require("ace/ext/language_tools");
	Code.workspace.block_editorCode = ace.edit(document.getElementById("block_editor_code"));
	Code.workspace.block_editorCode.setShowPrintMargin(true);
	Code.workspace.block_editorCode.setPrintMarginColumn(120);
	Code.workspace.block_editorCode.getSession().setMode("ace/mode/lua");
	Code.workspace.block_editorCode.setOptions({
		enableBasicAutocompletion: true
	});
	Code.workspace.block_editorCode.$blockScrolling = Infinity;

	if ('BlocklyStorage' in window) {
		// Hook a save function onto unload.
		BlocklyStorage.backupOnUnload(Code.workspace.blocks);
	}

	//Code.tabClick(Code.selected);

	Code.bindClick('trashButton',
		function() {
			Code.discard();
			Code.renderContent();
		});
	
	if (jQuery("#blockEditorButton").length > 0) {
		Code.bindClick('blockEditorButton', Code.blockEditor);	
	}

	Code.bindClick('switchToCode', Code.switchToCode);
	Code.bindClick('switchToBlocks', Code.switchToBlocks);
	Code.bindClick('loadButton', Code.load);
	Code.bindClick('saveButton', Code.save);
	Code.bindClick('saveAsButton', Code.saveAs);
	Code.bindClick('stopButton', Code.stop);
	Code.bindClick('runButton', Code.run);
	Code.bindClick('rebootButton', Code.reboot);

	if ('BlocklyStorage' in window) {
		BlocklyStorage['HTTPREQUEST_ERROR'] = MSG['httpRequestError'];
		BlocklyStorage['LINK_ALERT'] = MSG['linkAlert'];
		BlocklyStorage['HASH_ERROR'] = MSG['hashError'];
		BlocklyStorage['XML_ERROR'] = MSG['xmlError'];
	}

	// Lazy-load the syntax-highlighting.
	window.setTimeout(Code.importPrettify, 1);
};

/**
 * Initialize the page language.
 */
Code.initLanguage = function() {
	// Set the HTML's language and direction.
	var rtl = Code.isRtl();
	document.dir = rtl ? 'rtl' : 'ltr';
	document.head.parentElement.setAttribute('lang', Code.settings.language);

	// Sort languages alphabetically.
	var languages = [];
	for (var lang in Code.LANGUAGE_NAME) {
		languages.push([Code.LANGUAGE_NAME[lang], lang]);
	}
	var comp = function(a, b) {
		// Sort based on first argument ('English', 'Русский', '简体字', etc).
		if (a[0] > b[0]) return 1;
		if (a[0] < b[0]) return -1;
		return 0;
	};
	languages.sort(comp);
	// Populate the language selection menu.
	var languageMenu = document.getElementById('languageMenu');
	languageMenu.options.length = 0;
	for (var i = 0; i < languages.length; i++) {
		var tuple = languages[i];
		var lang = tuple[tuple.length - 1];
		var option = new Option(tuple[0], lang);
		if (lang == Code.settings.language) {
			option.selected = true;
		}
		languageMenu.options.add(option);
	}
	languageMenu.addEventListener('change', Code.changeLanguage, true);

	// Inject language strings.

	jQuery(".tabon, .taboff").each(function(index, value) {
		var element = jQuery(value);

		element.text(MSG[element.attr('id').replace('tab_', '')]);
	});

	document.getElementById('switchToBlocks').title = MSG['switchToCodev'];
	document.getElementById('switchToCode').title = MSG['switchToCodev'];
	document.getElementById('loadButton').title = MSG['loadButtonTooltip'];
	document.getElementById('saveButton').title = MSG['saveButtonTooltip'];
	document.getElementById('saveAsButton').title = MSG['saveAsButtonTooltip'];
	document.getElementById('rebootButton').title = MSG['rebootButtonTooltip'];
	document.getElementById('stopButton').title = MSG['stopButtonTooltip'];

	document.getElementById('runButton').title = MSG['runTooltip'];
	document.getElementById('trashButton').title = MSG['trashTooltip'];

	var categories = [];

	if (Code.status.modules.pio || Code.status.modules.adc || Code.status.modules.pwm) {
		categories.push('catIO');
	}

	//if (Code.status.modules.pwm) categories.push('catIOPwm');

	if (Code.status.modules.sensor) {
		categories.push('catSensor');
	}

	categories.push('catActuators');

	//if (Code.status.modules.i2c || Code.status.modules.lora) {
	//	categories.push('catComm');
	//}

	//if (Code.status.modules.i2c) categories.push('catI2C');
	if (Code.status.modules.lora) categories.push('catLora');
	//if (Code.status.modules.lora) categories.push('catLoraOTAA');
	//if (Code.status.modules.lora) categories.push('catLoraABP');

	if (Code.status.modules.tft) {
		categories.push('catTFT');
	}

	if (Code.status.modules.net) {
		categories.push('catNET');
		categories.push('catWIFI');
	}

	if (Code.status.modules.mqtt) {
		categories.push('catMQTT');
	}

	categories.push('catControl');
	categories.push('catOperators');
	categories.push('catOperatorsNumeric');
	categories.push('catOperatorsLogic');
	categories.push('catOperatorsText');
	categories.push('catExceptions');
	categories.push('catEvents');
	categories.push('catDelays');

	categories.push('catLogic');
	categories.push('catLoops');
	categories.push('catLists');
	categories.push('catVariables');
	categories.push('catFunctions');

	for (var i = 0, cat; cat = categories[i]; i++) {
		try {
			document.getElementById(cat).setAttribute('name', MSG[cat]);
		} catch (error) {
		}
	}
	var textVars = document.getElementsByClassName('textVar');
	for (var i = 0, textVar; textVar = textVars[i]; i++) {
		textVar.textContent = MSG['textVariable'];
	}
	var listVars = document.getElementsByClassName('listVar');
	for (var i = 0, listVar; listVar = listVars[i]; i++) {
		listVar.textContent = MSG['listVariable'];
	}

	jQuery("#content_board").find(".caption-subject").each(function(index, value) {
		var value = jQuery(value);

		value.text(MSG[value.text()]);
	});
};

Code.discard = function() {
	if (Code.workspace.type == 'blocks') {
		var count = Code.workspace.blocks.getAllBlocks().length;

		if (count > 0) {
			bootbox.confirm(Blockly.Msg.DELETE_ALL_BLOCKS.replace('%1', count),
				function(result) {
					if (result) {
						Code.workspace.blocks.clear();
						Code.currentFile.path = "/";
						Code.currentFile.file = "";
						Code.tabRefresh();
					}
				});
		}
	} else if (Code.workspace.type == 'editor') {
		bootbox.confirm(MSG['DELETE_EDIT_CODE'],
			function(result) {
				if (result) {
					Code.workspace.editor.setValue("", -1);
					Code.currentFile.path = "/";
					Code.currentFile.file = "";
					Code.tabRefresh();
				}
			});
	}
};

Code.runtimeError = function(file, line, code, message) {
	Code.showError(MSG['runtimeError'], MSG['youHaveAnError'] + '<br><br>' + message, function() {});
}

Code.showStatus = function(type, message) {
	if ((Code.currentStatus.type != type) || (Code.currentStatus.mesage != message)) {
		var icon = "";
		switch (type) {
			case statusType.Alert:
				icon = "warning2";
				break;
				
		}
		
		var html;
		
		if (icon) {
			var html = '<i class="icon icon-'+icon+'"></i><span><span class="statusBarText">'+message+'</span></span>';			
		} else {
			if (type == statusType.Progress) {
				html = '<span class="statusBarText">'+message+' ...</span>';	
			} else {
				html = '<span class="statusBarText">'+message+'</span>';					
			}
		}
	
		jQuery(".statusBar").html(html).show();		
		
		Code.currentStatus.type = type;
		Code.currentStatus.message = message;
	}
}

Code.hideStatus = function() {
	jQuery(".statusBar").hide();	
}

Code.run = function() {
	var code = "";
	
	Blockly.mainWorkspace.removeStarts();
	Blockly.mainWorkspace.removeErrors();

	// Get the bounding box of the content area
	var container = document.getElementById('content_area');
	var bBox = Code.getBBox_(container);

	if (Code.workspace.type == 'blocks') {
		code = Blockly.Lua.workspaceToCode(Code.workspace.blocks);
	} else if (Code.workspace.type == 'editor') {
		code = Code.workspace.editor.getValue();
	}

	function run(file) {
		Code.showProgress(MSG['sendingCode']);
		Code.agent.send({
			command: "boardRunProgram",
			arguments: {
				path: file,
				code: btoa(code)
			}
		}, function(id, info) {
			Code.hideProgress();
		});
	}

	function fileSelected(file) {
		jQuery("#selectedFileName").val(file.replace(/\.([^.]*?)$/, ""));
	}

	function folderSelected(folder) {
		if (folder != '/') {
			folder = folder + '/';
		}
		
		folder = folder.replace(/\/\//g, "/");

		jQuery("#selectedFolder").text(folder);
		jQuery("#selectedFolder").data("selected", folder);
	}

	var file = Code.getCurrentFullPath();
	var fileExtension = /(?:\.([^.]+))?$/.exec(file)[1];
	if (typeof fileExtension == "undefined") {	
		bootbox.dialog({
			title: MSG['noTarget'],
			message: '<div id="runFile" style="position: relative; left: -25px;overflow: auto;width:100%;height:' + (bBox.height * 0.50) + 'px;"></div><br>' +
				MSG['saveAs'] + '<span id="selectedFolder"></span><input type="text" id="selectedFileName" value="unnamed">.lua',
			buttons: {
				main: {
					label: MSG['run'],
					className: "btn-primary",
					callback: function() {
						var file = jQuery("#selectedFileName").val();
						if (file != "") {
							Code.tabRefresh();
							run(Code.getPathFor(jQuery("#selectedFolder").data("selected"), file + ".lua"));
						} else {
							return false;
						}
					}
				},
				danger: {
					label: MSG['cancel'],
					className: "btn-danger",
					callback: function() {}
				},
			},
			closable: false
		});

		// Show root files from board
		folderSelected("/");
		Code.listBoardDirectory(jQuery('#runFile'), "lua", folderSelected, fileSelected, undefined);
	} else {
		run(Code.getCurrentFullPath().replace(".xml",".lua"));
	}
}

// File is loaded from computer
Code.loadFileFromComputer = function(fileEntry) {
	if (chrome.runtime.lastError) {
		return;
	}

	fileEntry.file(function(file) {
		Code.workspace.blocks.clear();

		var reader = new FileReader();
		reader.onload = function(e) {
			var file = fileEntry.fullPath;
			var fileExtension = /(?:\.([^.]+))?$/.exec(file)[1];
			
			Code.currentFile.path = fileEntry.fullPath.replace(fileEntry.name, "");
			Code.currentFile.file = fileEntry.name;
			
			if (fileExtension == 'xml') {
				Code.workspace.type = "blocks";
			} else if (extension == 'lua') {
				Code.workspace.type = "editor";
			} else {
				return;
			}

			if (Code.workspace.type == 'blocks') {
				Code.workspace.blocks.clear();
				var xml = Blockly.Xml.textToDom(e.target.result);
				Blockly.Xml.domToWorkspace(xml, Code.workspace.blocks);
				Code.workspace.blocks.scrollCenter();
			} else {
				Code.workspace.editor.setValue(e.target.result, -1);
			}
		};
		reader.readAsText(file);
		
		Code.tabRefresh();
	});

	bootbox.hideAll();
};

// File is loaded from board
Code.loadFileFromBoard = function(file) {
	var file = Code.getCurrentFullPath();
	var extension = /(?:\.([^.]+))?$/.exec(file)[1];

	if (extension == 'xml') {
		Code.workspace.type = "blocks";
	} else if (extension == 'lua') {
		Code.workspace.type = "editor";
	} else {
		return;
	}

	// Download file
	Code.showProgress(MSG['downloadingFile'] + " " + file + " ...");
	Code.agent.send({
		command: "boardReadFile",
		arguments: {
			path: file
		}
	}, function(id, info) {
		var fileContent = atob(info.content)

		BootstrapDialog.closeAll();
		bootbox.hideAll();

		if (Code.workspace.type == 'blocks') {
			Code.workspace.blocks.clear();
			var xml = Blockly.Xml.textToDom(fileContent);
			Blockly.Xml.domToWorkspace(xml, Code.workspace.blocks);
			Code.workspace.blocks.scrollCenter();
		} else {
			Code.workspace.editor.setValue(fileContent, -1);
		}
		
		Code.tabRefresh();
	});
}

Code.load = function() {
	// File extension is determined by the workspace type
	// blocks: xml
	// ediror: lua
	var extension = "";
	if (Code.workspace.type == 'blocks') {
		extension = "xml";
	} else if (Code.workspace.type == 'editor') {
		extension = "lua";
	}

	// Get the bounding box of the content area
	var container = document.getElementById('content_area');
	var bBox = Code.getBBox_(container);

	if (typeof require != "undefined") {
		// Show a dialog for select a file from board, or allow to select a file from
		// computer
		bootbox.dialog({
			title: MSG['loadBlockTitle'],
			message: '<div id="loadFile" style="position: relative; left: -25px;overflow: auto;width:100%;height:' + (bBox.height * 0.50) + 'px;"></div>',
			buttons: {
				success: {
					label: MSG['loadFromDesktop'],
					className: "btn-primary",
					callback: function() {
						chrome.fileSystem.chooseEntry({
							type: 'openFile',
							suggestedName: 'untitled.' + extension,
							accepts: [{
								description: extension + ' files (*.' + extension + ')',
								extensions: [extension]
							}],
							acceptsAllTypes: false
						}, Code.loadFileFromComputer);

						return false;
					}
				},
				danger: {
					label: MSG['cancel'],
					className: "btn-danger",
					callback: function() {}
				},
			},
			closable: false
		});		
	} else {
		// Show a dialog for select a file from board, or allow to select a file from
		// computer
		bootbox.dialog({
			title: MSG['loadBlockTitle'],
			message: '<div id="loadFile" style="position: relative; left: -25px;overflow: auto;width:100%;height:' + (bBox.height * 0.50) + 'px;"></div>',
			buttons: {
				danger: {
					label: MSG['cancel'],
					className: "btn-danger",
					callback: function() {}
				},
			},
			closable: false
		});			
	}


	// Show root files from board
	Code.listBoardDirectory(jQuery('#loadFile'), extension, undefined, Code.loadFileFromBoard, undefined);
};

Code.stop = function() {
	Blockly.mainWorkspace.removeStarts();

	Code.agent.send({
		command: "boardStop",
		arguments: {}
	}, function(id, info) {
		Code.renderContent();
	});
}

Code.reboot = function() {
	Blockly.mainWorkspace.removeErrors();
	Blockly.mainWorkspace.removeStarts();

	Code.agent.send({
		command: "boardReset",
		arguments: {}
	}, function(id, info) {
		Code.renderContent();
	});
}

Code.save = function() {
	var code; // Code to save (Lua source code or xml)
	var extension; // Extension to use (.lua or .xml)

	var container = document.getElementById('content_area');
	var bBox = Code.getBBox_(container);

	if (Code.workspace.type == 'blocks') {
		extension = "xml";
		code = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(Code.workspace.blocks));
	} else if (Code.workspace.type == 'editor') {
		extension = "lua";
		code = Code.workspace.editor.getValue();
	} else if (Code.workspace.type == 'block_editor') {
		var type = jQuery("#content_block_editor_type").val();
		code = btoa(Code.workspace.block_editorCode.getValue());	
		
		for (var block in Code.lib.def.blocks) {
			if (Code.lib.def.blocks[block].spec.type == type) {
				Code.lib.def.blocks[block].code = code;
				Code.lib.update();
				break;
			}
		}
		
		return;
	}

	function saveToFile(fileEntry) {
		if (chrome.runtime.lastError) {
			return;
		}

		fileEntry.createWriter(function(fileWriter) {
			var truncated = false;
			var blob = new Blob([code]);

			fileWriter.onwriteend = function(e) {
				bootbox.hideAll();
				if (!truncated) {
					truncated = true;
					// You need to explicitly set the file size to truncate
					// any content that might have been there before
					this.truncate(blob.size);
					Code.tabRefresh();
					return;
				}
			};

			fileWriter.onerror = function(e) {};

			fileWriter.write(blob, {
				type: 'text/plain'
			});
		});
	}

	function saveToBoard(folder, file) {
		Code.showProgress(MSG['sendingFile'] + " " + Code.getPathFor(folder, file) + " ...");
		Code.agent.send({
			command: "boardWriteFile",
			arguments: {
				path: Code.getPathFor(folder,file),
				content: btoa(code)
			}
		}, function(id, info) {
			Code.currentFile.path = folder;
			Code.currentFile.file = file;
			Code.hideProgress();
			Code.tabRefresh();
		});
	}

	function folderSelected(folder) {
		folder = folder + '/';
		
		folder = folder.replace(/\/\//g, "/");
			
		jQuery("#selectedFolder").text(folder);
		jQuery("#selectedFolder").data("selected", folder);
	}

	function fileSelected(file) {
		jQuery("#selectedFileName").val(file.replace(/\.([^.]*?)$/, ""));
	}

	var file = Code.getCurrentFullPath();
	var fileExtension = /(?:\.([^.]+))?$/.exec(file)[1];
	if (typeof fileExtension != "undefined") {
		Code.showProgress(MSG['sendingFile'] + " " + file + " ...");
		Code.agent.send({
			command: "boardWriteFile",
			arguments: {
				path: file,
				content: btoa(code)
			}
		}, function(id, info) {
			Code.hideProgress();
			Code.tabRefresh();
		});
	} else {
		file = Code.getPathFor("", "unnamed." + extension);
		if (typeof require != "undefined") {
			bootbox.dialog({
				title: MSG['saveBlockTitle'],
				message: '<div id="saveFile" style="position: relative; left: -25px;overflow: auto;width:100%;height:' + (bBox.height * 0.50) + 'px;"></div><br>' +
					MSG['saveAs'] + '<span id="selectedFolder"></span><input type="text" id="selectedFileName" value="unnamed">' + '.' + extension,
				buttons: {
					main: {
						label: MSG['saveToBoard'],
						className: "btn-primary",
						callback: function() {
							var file = jQuery("#selectedFileName").val();
							if (file != "") {
								saveToBoard(jQuery("#selectedFolder").data("selected"), file + '.' + extension);
							} else {
								return false;
							}
						}
					},
					success: {
						label: MSG['saveToDesktop'],
						className: "btn-primary",
						callback: function() {
							// TO DO
							chrome.fileSystem.chooseEntry({
								type: 'saveFile',
								suggestedName: 'unnamed.' + extension,
								accepts: [{
									description: extension + ' files (*.' + extension + ')',
									extensions: [extension]
								}],
								acceptsAllTypes: false
							}, saveToFile);

							return false;
						}
					},
					danger: {
						label: MSG['cancel'],
						className: "btn-danger",
						callback: function() {}
					},
				},
				closable: false
			});
		} else {
			bootbox.dialog({
				title: MSG['saveBlockTitle'],
				message: '<div id="saveFile" style="position: relative; left: -25px;overflow: auto;width:100%;height:' + (bBox.height * 0.50) + 'px;"></div><br>' +
					MSG['saveAs'] + '<span id="selectedFolder"></span><input type="text" id="selectedFileName" value="unnamed">' + '.' + extension,
				buttons: {
					main: {
						label: MSG['º'],
						className: "btn-primary",
						callback: function() {
							var file = jQuery("#selectedFileName").val();
							if (file != "") {
								saveToBoard(jQuery("#selectedFolder").data("selected"), file + '.' + extension);
							} else {
								return false;
							}
						}
					},
					danger: {
						label: MSG['cancel'],
						className: "btn-danger",
						callback: function() {}
					},
				},
				closable: false
			});			
		}

		folderSelected("/");
		Code.listBoardDirectory(jQuery('#saveFile'), extension, folderSelected, fileSelected, undefined);
	}
};

Code.saveAs = function() {
	var code; // Code to save (Lua source code or xml)
	var extension; // Extension to use (.lua or .xml)

	var container = document.getElementById('content_area');
	var bBox = Code.getBBox_(container);

	if (Code.workspace.type == 'blocks') {
		extension = "xml";
		code = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(Code.workspace.blocks));
	} else if (Code.workspace.type == 'editor') {
		extension = "lua";
		code = Code.workspace.editor.getValue();
	}

	function saveToFile(fileEntry) {
		if (chrome.runtime.lastError) {
			return;
		}

		fileEntry.createWriter(function(fileWriter) {
			var truncated = false;
			var blob = new Blob([code]);

			fileWriter.onwriteend = function(e) {
				bootbox.hideAll();
				if (!truncated) {
					truncated = true;
					// You need to explicitly set the file size to truncate
					// any content that might have been there before
					this.truncate(blob.size);
					Code.tabRefresh();
					return;
				}
			};

			fileWriter.onerror = function(e) {};

			fileWriter.write(blob, {
				type: 'text/plain'
			});
		});
	}

	function saveToBoard(folder, file) {
		Code.showProgress(MSG['sendingFile'] + " " + Code.getPathFor(folder, file) + " ...");
		Code.agent.send({
			command: "boardWriteFile",
			arguments: {
				path: Code.getPathFor(folder, file),
				content: btoa(code)
			}
		}, function(id, info) {
			Code.currentFile.path = folder;
			Code.currentFile.file = file;
			Code.hideProgress();
			Code.tabRefresh();
		});
	}

	function folderSelected(folder) {
		if (folder != '/') {
			folder = folder + '/';
		}

		jQuery("#selectedFolder").text(folder);
		jQuery("#selectedFolder").data("selected", folder);
	}

	function fileSelected(file) {
		jQuery("#selectedFileName").val(file.replace(/\.([^.]*?)$/, ""));
	}

	if (typeof require != "undefined") {
		bootbox.dialog({
			title: MSG['saveBlockTitle'],
			message: '<div id="saveFile" style="position: relative; left: -25px;overflow: auto;width:100%;height:' + (bBox.height * 0.50) + 'px;"></div><br>' +
				MSG['saveAs'] + '<span id="selectedFolder"></span><input type="text" id="selectedFileName" value="">' + '.' + extension,
			buttons: {
				main: {
					label: MSG['saveToBoard'],
					className: "btn-primary",
					callback: function() {
						var file = jQuery("#selectedFileName").val();
						if (file != "") {						
							saveToBoard(jQuery("#selectedFolder").data("selected"), file + '.' + extension);
						} else {
							return false;
						}
					}
				},
				success: {
					label: MSG['saveToDesktop'],
					className: "btn-primary",
					callback: function() {
						chrome.fileSystem.chooseEntry({
							type: 'saveFile',
							suggestedName: 'unnamed.' + extension,
							accepts: [{
								description: extension + ' files (*.' + extension + ')',
								extensions: [extension]
							}],
							acceptsAllTypes: false
						}, saveToFile);

						return false;
					}
				},
				danger: {
					label: MSG['cancel'],
					className: "btn-danger",
					callback: function() {}
				},
			},
			closable: false
		});
	} else {
		bootbox.dialog({
			title: MSG['saveBlockTitle'],
			message: '<div id="saveFile" style="position: relative; left: -25px;overflow: auto;width:100%;height:' + (bBox.height * 0.50) + 'px;"></div><br>' +
				MSG['saveAs'] + '<span id="selectedFolder"></span><input type="text" id="selectedFileName" value="">' + '.' + extension,
			buttons: {
				main: {
					label: MSG['saveToBoard'],
					className: "btn-primary",
					callback: function() {
						var file = jQuery("#selectedFileName").val();
						if (file != "") {						
							saveToBoard(jQuery("#selectedFolder").data("selected"), file + '.' + extension);
						} else {
							return false;
						}
					}
				},
				danger: {
					label: MSG['cancel'],
					className: "btn-danger",
					callback: function() {}
				},
			},
			closable: false
		});		
	}

	folderSelected("/");
	Code.listBoardDirectory(jQuery('#saveFile'), extension, folderSelected, fileSelected, undefined);
};

// Progress messages
Code.showProgress = function(title) {
	BootstrapDialog.closeAll();
	bootbox.hideAll();

	BootstrapDialog.show({
		message: '<div class="progress progress-striped active" style="width: 100%;">' +
			'<div class="progress-bar" role="progressbar" style="width: 100%;">' +
			'</div>' +
			'</div>',
		title: title,
		closable: false
	});
}

Code.hideProgress = function() {
	BootstrapDialog.closeAll();
	bootbox.hideAll();
}

// Information messages
Code.showInformation = function(text) {
	BootstrapDialog.closeAll();
	bootbox.hideAll();

	BootstrapDialog.show({
		message: text,
		title: MSG['information'],
		closable: false,
		onshow: function(dialogRef) {
			setTimeout(function() {
				dialogRef.close();
			}, 2500);
		}
	});
}

// Alert messages
Code.showAlert = function(text) {
	BootstrapDialog.closeAll();
	bootbox.hideAll();

	BootstrapDialog.show({
		message: text,
		title: 'Alert',
		closable: true,
	});
}

Code.showError = function(title, err, callback) {
	BootstrapDialog.closeAll();
	bootbox.hideAll();

	setTimeout(function() {
		bootbox.dialog({
			title: title,
			message: err,
			buttons: {
				main: {
					label: MSG['ok'],
					className: "btn-primary",
					callback: function() {
						if (typeof callback != undefined) {
							callback();
						}
					}
				}
			},
			closable: false
		});
	}, 500);

	//Code.showAlert("Error: " + err);
}

Code.newFirmware = function() {
	bootbox.dialog({
		message: MSG['newFirmware'],
		buttons: {
			success: {
				label: MSG['installNow'],
				className: "btn-primary",
				callback: function() {					
					Code.agent.send({
						command: "boardUpgrade",
						arguments: {}
					}, function(id, info) {
						Code.showProgress(MSG['downloadingFirmware']);
					});
					
				}
			},
			danger: {
				label: MSG['notNow'],
				className: "btn-danger",
				callback: function() {}
			},
		},
		closable: false
	});
}

Code.updateStatus = function() {
	var container = jQuery('#boardStatus');

	var html;

	if (Code.status.connected) {
		html = '<table class="table table-striped">';
		html += '<thead>';
		html += '<th>' + MSG['item'] + '</th>';
		html += '<th>' + MSG['value'] + '</th>';
		html += '</thead>';
		html += '<tbody>';
		html += '<tr><td>' + MSG['installedFirmware'] + '</td><td>' + Code.status.firmware + '</td></tr>';
		html += '<tr><td>' + MSG['cpuModel'] + '</td><td>' + Code.status.cpu + '</td></tr>';
		html += '</tbody>';
		html += '</table>';
		html += '</table>';

		if (Code.status.hasFirmwareUpgradeSupport) {
			html += '<button id="checkFirmwareButton" type="button" class="btn btn-default" aria-label="Left Align">';
			html += MSG['checkForFirmwareUpdates'];
			html += '</button>';
		}

		container.html(html);

		// TO DO
		//if (thisInstance.status.hasFirmwareUpgradeSupport) {
		//	Code.bindClick('checkFirmwareButton', Code.checkFirmware);
		//}
	} else {
		html = '<span class="waitingForBoard"><i class="spinner icon icon-spinner3"></i> ' + MSG['waitingForBoard'] + '</span>';
		container.html(html);
	}

	window.dispatchEvent(new Event('resize'));
}

Code.listBoardDirectory = function(container, extension, folderSelect, fileSelect, target) {
	var html;
	var path = "";
	var root = false;

	if (!Code.status.connected) {
		html = '<span style="margin-left: 25px;" class="waitingForBoard"><i class="spinner icon icon-spinner3"></i> ' + MSG['waitingForBoard'] + '</span>';
		container.html(html);
		return;
	}

	if (typeof target != 'undefined') {
		container = target;
		path = Code.currentFile.path;
	} else {
		container.html('<div style="width: 20px;float: left;margin-left: 45px;"><i class="waiting"></i></div>');
		root = true;
	}

	container.find(".waiting").addClass("spinner");
	container.find(".waiting").addClass("icon");
	container.find(".waiting").addClass("icon-spinner3");

	Code.agent.send({
		command: "boardGetDirContent",
		arguments: {
			path: path
		}
	}, function(id, entries) {
		var html = '';

		if (path == '/') path = '';

		html += '<ul class="dir-entry list-unstyled">';

		if (root) {
			html += '<li class="dir-entry-d" data-expanded="true" data-path data-name data-type="d"><div style="width: 20px;float: left;"><i class="waiting"></i></div><i class="status"></i><span class="entryName">Board</span>'
			html += '<ul class="dir-entry list-unstyled">';
		}

		container.find("[data-path='" + path + "']").remove();

		container.find(".waiting").removeClass("spinner");
		container.find(".waiting").removeClass("icon");
		container.find(".waiting").removeClass("icon-spinner3");

		entries.forEach(function(entry) {
			if (entry.type == 'f') {
				if (typeof extension != "undefined") {
					if (entry.name.match(new RegExp('^.*\.' + extension + '$'))) {
						html = html + '<li class="dir-entry-' + entry.type + '" data-expanded="false" data-path="' + path + '" data-name="' + entry.name + '" data-type="' + entry.type + '"><div style="width: 20px;float: left;"><i class="waiting"></i></div><i class="status"></i><span class="entryName">' + entry.name + '</span></li>'
					}
				} else {
					html = html + '<li class="dir-entry-' + entry.type + '" data-expanded="false" data-path="' + path + '" data-name="' + entry.name + '" data-type="' + entry.type + '"><div style="width: 20px;float: left;"><i class="waiting"></i></div><i class="status"></i><span class="entryName">' + entry.name + '</span></li>'
				}
			} else {
				html = html + '<li class="dir-entry-' + entry.type + '" data-expanded="false" data-path="' + path + '" data-name="' + entry.name + '" data-type="' + entry.type + '"><div style="width: 20px;float: left;"><i class="waiting"></i></div><i class="status"></i><span class="entryName">' + entry.name + '</span></li>'
			}
		});

		if (root) {
			html += '</li>';
		}

		html += '</ul>';

		container.append(html);
		window.dispatchEvent(new Event('resize'));

		container.find('.dir-entry-d, .dir-entry-f').unbind().bind('click', function(e) {
			var target = jQuery(e.target);

			if (target.prop("tagName") != 'LI') {
				target = target.closest("li");
			}

			var entry = target.data('name');
			var path = target.data('path');
			var type = target.data('type');
			var expanded = target.attr('data-expanded');

			if ((typeof entry === "undefined") || (typeof path === "undefined")) {
				e.stopPropagation();
				return;
			}

			if (type == 'd') {
				if (expanded == "true") {
					target.attr('data-expanded', 'false');
					target.find(".dir-entry").remove();

					target.find(".status:first").addClass("icon-folder2");
					target.find(".status:first").removeClass("icon-folder-open");

					if (typeof folderSelect != 'undefined') {
						folderSelect(path + '/' + entry);
					}

				} else {
					target.attr('data-expanded', 'true');
					Code.currentFile.path = path + '/' + entry;

					if (typeof folderSelect != 'undefined') {
						folderSelect(path + '/' + entry);
					}

					Code.listBoardDirectory(jQuery('#filesystem'), extension, folderSelect, fileSelect, target);
				}
			} else {
				if (path == "") {
					path = "/";
				}
				Code.currentFile.path = path;
				Code.currentFile.file = entry;
				if (typeof fileSelect != 'undefined') {
					fileSelect(entry);
				}
			}

			e.stopPropagation();
		});

		var expanded = container.attr('data-expanded');
		if (expanded == "true") {
			container.find(".status:first").removeClass("icon-folder2");
			container.find(".status:first").addClass("icon-folder-open");
		} else {
			container.find(".status:first").addClass("icon-folder2");
			container.find(".status:first").removeClass("icon-folder-open");
		}

		if (root) {
			container.find(".status:first").removeClass("icon-folder2");
			container.find(".status:first").addClass("icon-chip");

			container = container.find(".dir-entry-d:first");
		}

		container.find(".status").closest(".dir-entry-d").find(".status").addClass("icon");
		container.find(".dir-entry-d").find(".status").addClass("icon-folder2");

		container.find(".dir-entry-f").find(".status").addClass("icon");
		container.find(".dir-entry-f").find(".status").addClass("icon-file-text2");
	});
}

Code.tabRefresh = function() {
	if ((Code.selected == 'program') && (Code.workspace.type == 'blocks')) {
		jQuery("#switchToCode, #trashButton, #loadButton, #saveButton,  #saveAsButton, #rebootButton, #stopButton, #runButton").removeClass("disabled");
		jQuery("#switchToBlocks").addClass("disabled");
	} else if ((Code.selected == 'program') && (Code.workspace.type == 'editor')) {
		jQuery("#switchToBlocks, #trashButton, #loadButton, #saveButton, #saveAsButton, #rebootButton, #stopButton, #runButton").removeClass("disabled");
		jQuery("#switchToCode").addClass("disabled");
	} else if ((Code.selected == 'program') && (Code.workspace.type == 'block_editor')) {
		jQuery("#trashButton, #loadButton, #saveButton, #saveAsButton, #rebootButton, #stopButton, #runButton").removeClass("disabled");
		jQuery("#switchToCode, #switchToBlocks").addClass("disabled");
	} else if (Code.selected == 'board') {
		jQuery("#switchToCode, #switchToBlocks, #trashButton, #loadButton, #saveButton, #saveAsButton, #rebootButton, #stopButton, #runButton").addClass("disabled");
	}

	if (!Code.status.connected) {
		jQuery("#loadButton, #saveButton, #saveAsButton, #stopButton, #runButton, #tab_board, #rebootButton, #content_board").addClass("disabled");
	} else {
		jQuery("#stopButton, #runButton, #rebootButton, #content_board").removeClass("disabled");
	}
	
	if (Code.workspace.type == 'block_editor') {
		jQuery("#saveButton").removeClass("disabled");
	}

	if (Code.selected == 'program') {
		if (Code.getCurrentFullPath() != "/") {
			var extension = "";
			if (Code.workspace.type == 'blocks') {
				extension = "xml";
			} else if (Code.workspace.type == 'editor') {
				extension = "lua";
			}

			var file = Code.getCurrentFullPath();
			var fileExtension = /(?:\.([^.]+))?$/.exec(file)[1];
			
			jQuery("#targetFile").html(file.replace(fileExtension, extension));
		} else {
			jQuery("#targetFile").html('');
		}
	} else {
		jQuery("#targetFile").html('');
	}

}

Code.blockEditor = function() {
	if (Code.workspace.type == "block_editor") {
		Code.workspace.type = Code.workspace.prevType;
	} else {
		Code.workspace.type = "block_editor";

		Code.blocklyFactory.init();
	}
	
	Code.renderContent();
}

Code.switchToCode = function() {
	var blockCode = Blockly.Lua.workspaceToCode(Code.workspace.blocks).trim();

	Code.workspace.type = "editor";
	Code.workspace.prevType = Code.workspace.type;
	Code.workspace.editor.setValue(blockCode, -1);
	Code.workspace.editor.focus();
	Code.renderContent();
}

Code.switchToBlocks = function() {
	var blockCode = Blockly.Lua.workspaceToCode(Code.workspace.blocks).replace(/\r|\n|\s/g, "");
	var luaCode = Code.workspace.editor.getValue().replace(/\r|\n|\s/g, "");

	if (blockCode != luaCode) {
		bootbox.dialog({
			title: MSG['warning'],
			message: MSG['switchToBlocksWarning'],
			buttons: {
				success: {
					label: MSG['yes'],
					className: "btn-primary",
					callback: function() {
						Code.workspace.type = "blocks";
						Code.renderContent();
						//Code.tabClick("program");
					}
				},
				danger: {
					label: MSG['no'],
					className: "btn-danger",
					callback: function() {}
				},
			},
			closable: false
		});
	} else {
		Code.workspace.type = "blocks";
		Code.workspace.prevType = Code.workspace.type;
		Code.renderContent();
		//Code.tabClick("program");
	}
}

Code.openAgent = function() {
	if (typeof require != "undefined") {
		if (typeof require('nw.gui') != "undefined") {
		    var path = require('path');
			var os = require('os');
			var exec = require('child_process').exec;
  
		    var cwd = path.join(process.cwd(), "bin/" + os.platform());  
			var app = path.join(cwd, "/whitecat-create-agent");  
		
			require('child_process').spawn(app, {
				cwd: cwd
			});	
		}	
	}
}

Code.setup = function() {	
	Code.agent.addListener("boardPowerOnReset", function(id, info) {
		Blockly.mainWorkspace.removeErrors();
		Blockly.mainWorkspace.removeStarts();

		Code.status = JSON.parse(JSON.stringify(Code.defaultStatus));
		Code.board.getMaps(Code.settings.board, function(maps) {
			Code.status.maps = maps;
		});
		Code.renderContent();
	});

	Code.agent.addListener("boardAttached", function(id, info) {
		Blockly.mainWorkspace.removeErrors();
		Blockly.mainWorkspace.removeStarts();

		Code.hideStatus();
		
		Code.status = JSON.parse(JSON.stringify(Code.defaultStatus));
		Code.status = info.info;
		Code.settings.board = info.info.board;
		
		Code.showStatus(statusType.Info,Code.board.getDesc(Code.settings.board));
		
		Code.board.getMaps(Code.settings.board, function(maps) {
			Code.status.maps = maps;
		});
		Code.status.connected = true;
		Code.status.firmware = info.info.os + "-" + info.info.version.replace(" ", "-") + "-" + info.info.build;

		if (info.newBuild) {
			Code.newFirmware();
		}

		Code.renderContent();
	});

	Code.agent.addListener("boardDetached", function(id, info) {
		Blockly.mainWorkspace.removeErrors();
		Blockly.mainWorkspace.removeStarts();

		Code.showStatus(statusType.Alert,"Connect a board");
		
		Code.status = JSON.parse(JSON.stringify(Code.defaultStatus));
		Code.board.getMaps(Code.settings.board, function(maps) {
			Code.status.maps = maps;
		});
		Code.renderContent();

	});
	
	Code.agent.addListener("boardUpgraded", function(id, info) {
		Blockly.mainWorkspace.removeErrors();
		Blockly.mainWorkspace.removeStarts();

		Code.hideProgress();
		Code.tabRefresh();
	});

	Code.agent.addListener("blockStart", function(id, info) {
		var block = atob(info.block);

		Blockly.mainWorkspace.getBlockById(block.replace(/\0/g, '')).addStart();
	});

	Code.agent.addListener("blockEnd", function(id, info) {
		var block = atob(info.block);

		Blockly.mainWorkspace.getBlockById(block.replace(/\0/g, '')).removeStart();
	});

	Code.agent.addListener("blockError", function(id, info) {
		Blockly.mainWorkspace.removeStarts();
		Blockly.mainWorkspace.removeErrors();

		var block = atob(info.block);
		var error = atob(info.error);

		Blockly.mainWorkspace.getBlockById(block.replace(/\0/g, '')).addError();
		Blockly.mainWorkspace.getBlockById(block.replace(/\0/g, '')).setWarningText(error);
	});

	Code.agent.addListener("boardUpdate", function(id, info) {
		Blockly.mainWorkspace.removeErrors();
		Blockly.mainWorkspace.removeStarts();

		Code.showStatus(statusType.Progress,info.what);
	});

	Settings.load(Code.settings);
	Blockly.Blocks.operators = {};

	Blockly.Blocks.variables.HUE = "#ee7d16";
	Blockly.Blocks.lists.HUE = "#cc5b22";
	Blockly.Blocks.control.HUE = "#e1a91a";
	Blockly.Blocks.events.HUE = "#c88330";
	Blockly.Blocks.sensor.HUE = "#2ca5e2";
	Blockly.Blocks.operators.HUE = "#5cb712";
	Blockly.Blocks.actuators.HUE = "#4a6cd4";

	Blockly.Blocks['try'].HUE = Blockly.Blocks.control.HUE;
	Blockly.Blocks.loops.HUE = Blockly.Blocks.control.HUE;
	Blockly.Blocks.logic.HUE = Blockly.Blocks.control.HUE;

	Blockly.Blocks.constant.HUE = "#cccccc";

	Blockly.Blocks.texts.HUE = Blockly.Blocks.operators.HUE;
	Blockly.Blocks.math.HUE = Blockly.Blocks.operators.HUE;

	jQuery.getScript('msg/wc/' + Code.settings.language + '.js', function() {
		jQuery.getScript('msg/js/' + Code.settings.language + '.js', function() {
			Code.board.getMaps(Code.settings.board, function(maps) {
				Code.status.maps = maps;
				Code.buildToolBox(function() {
					Code.init();
					Code.renderContent();
					Code.agent.socketConnect();		
				});		
			});
		});
	});	
}

window.addEventListener('load', function() {
	Code.agent = new agent();
	Code.board = new board();
	Code.lib = new blockLibrary();
    //Code.blocklyFactory = new AppController();
		
	Code.setup();
});

if (typeof require != "undefined") {
	if (typeof require('nw.gui') != "undefined") {	
		var gui = require('nw.gui');
		var win = gui.Window.get();
		
		win.on('close', function(event) {
			Code.agent.send({
				command: "detachIde",
				arguments: {
				}
			}, function(id, info) {
			});
			
			win.close(true);
		});
	} else {
		appWin.addEventListener('close', function() {
			Code.agent.send({
				command: "detachIde",
				arguments: {
				}
			}, function(id, info) {
			});
		});
	}
} else {
	window.addEventListener('close', function() {
		Code.agent.send({
			command: "detachIde",
			arguments: {
			}
		}, function(id, info) {
		});
	});
}
