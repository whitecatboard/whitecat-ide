/**
 *
 * Board. Blocky Environment, Board. board definition
 *
 * Copyright (C) 2015 - 2016
 * IBEROXARXA SERVICIOS INTEGRALES, S.L.
 * 
 * Author: Jaume Olivé (jolive@iberoxarxa.com / jolive@whitecatboard.org)
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

// By default, enable developer mode
Blockly.Lua.developerMode = true;

/**
 * Create a namespace for the application.
 */
var Code = {};

Code.folder = "https://ide.whitecatboard.org";
Code.server = "https://ide.whitecatboard.org";

var blockAbstraction = {
	Low: 0,
	High: 1
};

Code.blockAbstraction = blockAbstraction.High;

Code.storage = {};

Code.minAgentVersion = "1.5";
Code.checkNewVersion = true;
Code.showCode = false;

Code.storage.board = null;
Code.storage.local = null;
Code.storage.cloud = null;

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

Code.buildToolBox = function(callback) {
	var xml = '';

	xml += '' +
		'<category id="catEvents">' +
		'<block type="when_board_starts"></block>' +
		'<block type="thread"></block>' +
		'<block type="execute_every">' +
		'<value name="TIME">' +
		'<shadow type="math_number">' +
		'<field name="NUM"></field>' +
		'</shadow>' +
		'</block>' +
		'<block type="when_i_receive"></block>' +
		'<block type="broadcast"></block>' +
		'<block type="broadcast_and_wait"></block>' +
		'<block type="event_is_being_processed"></block>' +
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
		'<block type="exception_catch_error"></block>' +
		'<block type="exception_raise_again"></block>' +
		'</category>' +
		'<category id="catDelays">' +
		'<block type="wait_for">' +
		'<value name="TIME">' +
		'<shadow type="math_number">' +
		'<field name="NUM"></field>' +
		'</shadow>' +
		'</block>' +
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
		'<category id="catOperatorsBitwise">' +
		'<block type="bitwise_unary_op">' +
		'<value name="OP1">' +
		'<shadow type="math_number">' +
		'<field name="NUM">0</field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="bitwise_op">' +
		'<value name="OP1">' +
		'<shadow type="math_number">' +
		'<field name="NUM">0</field>' +
		'</shadow>' +
		'</value>' +
		'<value name="OP2">' +
		'<shadow type="math_number">' +
		'<field name="NUM">0</field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
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
		'<block type="text_print">' +
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

	xml += '<category id="catIO" colour="20">';

	xml += '<block type="when_digital_pin">' +
		'<value name="PIN">' +
		'<shadow type="input_digital_pin">' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="setdigitalpin">' +
		'<value name="PIN">' +
		'<shadow type="output_digital_pin">' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="invertdigitalpin">' +
		'<value name="PIN">' +
		'<shadow type="output_digital_pin">' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="getdigitalpin">' +
		'<value name="PIN">' +
		'<shadow type="input_digital_pin">' +
		'</shadow>' +
		'</value>' +
		'</block>';

	xml += '<block type="getanalogpin">' +
		'<value name="PIN">' +
		'<shadow type="analog_pins">' +
		'</shadow>' +
		'</value>' +
		'</block>';

	xml += '<block type="getexternalanalogchannel">' +
		'<value name="UNIT">' +
		'<shadow type="external_analog_units">' +
		'</shadow>' +
		'</value>' +
		'<value name="CHANNEL">' +
		'<shadow type="external_analog_channels">' +
		'</shadow>' +
		'</value>' +
		'</block>';

	xml += '' +
		'<block type="setpwmpin">' +
		'<value name="PIN">' +
		'<shadow type="pwm_pins">' +
		'</shadow>' +
		'</value>' +
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

	xml += '</category>';

	xml += '<category id="catComm" colour="20">';

	xml += '' +
		'<category id="catCan">' +
		'<block type="cansetspeed">' +
		'<value name="SPEED">' +
		'<shadow type="math_number">' +
		'<field name="NUM">500</field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="cansetfilter">' +
		'<value name="FROM">' +
		'<shadow type="math_number">' +
		'<field name="NUM">0</field>' +
		'</shadow>' +
		'</value>' +
		'<value name="TO">' +
		'<shadow type="math_number">' +
		'<field name="NUM">0</field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="canframewrite"></block>' +
		'<block type="canread"></block>' +
		'<block type="canframeset">' +
		'<value name="VALUE">' +
		'<shadow type="math_number">' +
		'<field name="NUM">0</field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="canframeget"></block>' +
		'<block type="cantype"></block>' +
		'</category>';

	xml += '' +
		'<category id="catI2C">' +
		'<block type="i2csetspeed">' +
		'<value name="SPEED">' +
		'<shadow type="math_number">' +
		'<field name="NUM">1000</field>' +
		'</shadow>' +
		'</value>' +
		'</block>' +
		'<block type="i2cstartcondition">' +
		'</block>' +
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

	xml += '</category>';

	xml += '<category id="catSensor" custom="SENSOR" colour="20">';
	xml += '<button function="expand(1)">Expand section</button>';
	xml += '</category>';

	xml += '<category id="catActuators">';
	xml += '<block type="servo_move">' +
		'<value name="PIN">' +
		'<shadow type="output_digital_pin">' +
		'</shadow>' +
		'</value>' +
		'<value name="VALUE">' +
		'<shadow type="math_number">' +
		'<field name="NUM">0</field>' +
		'</shadow>' +
		'</value>' +
		'</block>';

	xml += '</category>';

	xml += '<category id="catNET" colour="20">';
	xml += '<category id="catWIFI" custom="WIFI" colour="20">';
	xml += '</category>';
	xml += '</category>';

	xml += '<category id="catLora" custom="LORA" colour="20">';
	xml += '<button function="expand(1)">Expand section</button>';
	xml += '</category>';

	xml += '<category id="catMQTT" custom="MQTT"colour="20">';
	xml += '<button function="expand(1)">Expand section</button>';
	xml += '</category>';

	Code.lib.get(xml, "libs", function(xml) {
		var toolbox = document.getElementById('toolbox');
		toolbox.innerHTML = xml;

		callback();
	});
}

Code.updateToolBox = function() {
		Code.buildToolBox(function() {
			Code.initLanguage();

			var toolbox = null;
			var workSpace = null;

			toolbox = document.getElementById('toolbox');
			workSpace = Code.workspace.blocks;

			workSpace.updateToolbox(toolbox);
		});
	}
	/**
	 * Is the current language (Code.LANG) an RTL language?
	 * @return {boolean} True if RTL, false if LTR.
	 */
Code.isRtl = function() {
	return Code.LANGUAGE_RTL.indexOf(Code.settings.language) != -1;
};

/**
 * Load blocks saved on App Engine Storage or in session/local storage.
 * @param {string} defaultXml Text representation of default blocks.
 */
Code.loadBlocks = function(defaultXml) {
	var xml = Blockly.Xml.textToDom(defaultXml);
	Blockly.Xml.domToWorkspace(xml, Code.workspace.blocks);
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
Code.TABS_ = ['program'];

Code.selected = 'program';

/**
 * Populate the currently selected pane with content generated from the blocks.
 */
Code.renderContent = function() {
	jQuery("#content_blocks").css('visibility', 'visible');
	jQuery("#content_blocks").find(".injectionDiv").css('visibility', 'visible');
	jQuery("#content_blocks").find(".injectionDiv:nth-child(2)").css('visibility', 'hidden');

	Code.workspace.blocks.setVisible(true);

	Code.updateToolBox();

	window.dispatchEvent(new Event('resize'));
};

/**
 * Initialize Blockly.  Called on page load.
 */
Code.init = function() {
	Code.initLanguage();

	var container = document.getElementById('content_area');
	var onresize = function(e) {
		var bBox = Code.getBBox_(container);
		var el = document.getElementById('content_blocks');

		el.style.top = bBox.y + 'px';
		el.style.left = bBox.x + 'px';

		// Height and width need to be set, read back, then set again to
		// compensate for scrollbars.
		el.style.height = bBox.height + 'px';
		el.style.height = (2 * bBox.height - el.offsetHeight) + 'px';
		el.style.width = bBox.width + 'px';
		el.style.width = (2 * bBox.width - el.offsetWidth) + 'px';
	};

	window.addEventListener('resize', onresize, false);

	var toolbox = document.getElementById('toolbox');

	Code.workspace.blocks = Blockly.inject('content_blocks', {
		media: Code.folder + '/media/',
		rtl: Code.isRtl(),
		toolbox: toolbox,
		zoom: {
			controls: false,
			wheel: false
		}
	});

	onresize();
	Blockly.svgResize(Code.workspace.blocks);

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
};

Code.setup = function(lang, type) {
	Code.settings.language = lang;

	Code.workspace.type = "blocks";

	jQuery.getScript('msg/wc/' + Code.settings.language + '.js', function() {
		jQuery.getScript('msg/js/' + Code.settings.language + '.js', function() {
			Code.init();
			Code.loadBlocks('<xml xmlns="http://www.w3.org/1999/xhtml"><block deletable="false" movable="false" type="' + type + '" id="MH;qeLe,9@vd4XiynEB_" x="0" y="50"></block></xml>');
			Code.renderContent();
		});
	});
}
