/**
 *
 * Whitecat Blocky Environment, whitecat board definition
 *
 * Copyright (C) 2015 - 2016
 * IBEROXARXA SERVICIOS INTEGRALES, S.L. & CSS IBÉRICA, S.L.
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

/**
 * Create a namespace for the application.
 */
var Code = {};

Code.progressDialog = false;

Code.currentFile = {
	path: '',
	file: ''
};

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
Code.workspace.blocks = null;
Code.workspace.editor = null;
Code.workspace.name = "";
Code.workspace.sourceType = "";
Code.workspace.source = "";
Code.workspace.target = "";

/**
 * Extracts a parameter from the URL.
 * If the parameter is absent default_value is returned.
 * @param {string} name The name of the parameter.
 * @param {string} defaultValue Value to return if paramater not found.
 * @return {string} The parameter value or the default value if not found.
 */
Code.getStringParamFromUrl = function(name, defaultValue) {
  var val = location.search.match(new RegExp('[?&]' + name + '=([^&]+)'));
  return val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : defaultValue;
};

/**
 * Get the language of this user from the URL.
 * @return {string} User's language.
 */
Code.getLang = function() {
  var lang = Code.getStringParamFromUrl('lang', '');
  if (Code.LANGUAGE_NAME[lang] === undefined) {
    // Default to English.
    lang = 'en';
  }
  return lang;
};

/**
 * Is the current language (Code.LANG) an RTL language?
 * @return {boolean} True if RTL, false if LTR.
 */
Code.isRtl = function() {
  return Code.LANGUAGE_RTL.indexOf(Code.LANG) != -1;
};

/**
 * Load blocks saved on App Engine Storage or in session/local storage.
 * @param {string} defaultXml Text representation of default blocks.
 */
Code.loadBlocks = function(defaultXml) {
  try {
    var loadOnce = window.sessionStorage.loadOnceBlocks;
  } catch(e) {
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
  } else if (defaultXml) {
    // Load the editor with default starting blocks.
    var xml = Blockly.Xml.textToDom(defaultXml);
    Blockly.Xml.domToWorkspace(xml, Code.workspace.blocks);
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

  chrome.storage.sync.set(
	{
      language: newLang,
    },
	function() {
		chrome.runtime.reload();
    }
  );
	
//  window.location = window.location.protocol + '//' +
  //    window.location.host + window.location.pathname + search;
};

/**
 * Bind a function to a button's click event.
 * On touch enabled browsers, ontouchend is treated as equivalent to onclick.
 * @param {!Element|string} el Button element or ID thereof.
 * @param {!Function} func Event handler to bind.
 */
Code.bindClick = function(el, func) {
  if (typeof el == 'string') {
    el = document.getElementById(el);
  }
  el.addEventListener('click', func, true);
  el.addEventListener('touchend', func, true);
};

/**
 * Load the Prettify CSS and JavaScript.
 */
Code.importPrettify = function() {
  //<link rel="stylesheet" href="../prettify.css">
  //<script src="../prettify.js"></script>
  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('href', '../prettify.css');
  document.head.appendChild(link);
  var script = document.createElement('script');
  script.setAttribute('src', '../prettify.js');
  document.head.appendChild(script);
};

/**
 * Compute the absolute coordinates and dimensions of an HTML element.
 * @param {!Element} element Element to match.
 * @return {!Object} Contains height, width, x, and y properties.
 * @private
 */
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
 * User's language (e.g. "en").
 * @type {string}
 */
Code.LANG = Code.getLang();

/**
 * List of tab names.
 * @private
 */
Code.TABS_ = ['board', 'program'];

Code.selected = 'board';

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
  
  Blockly.fireUiEvent(window, 'resize');
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
	  jQuery(".blocklyWidgetDiv").css('visibility', 'hidden');
	  jQuery(".blocklyTooltipDiv").css('visibility', 'hidden');
	  jQuery(".blocklyToolboxDiv").css('visibility', 'hidden');
	  jQuery("#content_blocks").css('visibility', 'hidden');
  
  	  Code.listBoardDirectory(jQuery('#filesystem'),undefined,undefined,Code.loadFileFromBoard);
  	  Code.updateStatus();
  } else if (Code.selected == 'program') {
  	if (Code.workspace.type == 'blocks') {
		jQuery("#content_editor").css('visibility', 'hidden');
		jQuery(".blocklyWidgetDiv").css('visibility', 'visible');
		jQuery(".blocklyTooltipDiv").css('visibility', 'visible');
		jQuery(".blocklyToolboxDiv").css('visibility', 'visible');
		jQuery("#content_blocks").css('visibility', 'visible');

  		Code.workspace.blocks.setVisible(true);
  	} else {
		jQuery(".blocklyWidgetDiv").css('visibility', 'hidden');
		jQuery(".blocklyTooltipDiv").css('visibility', 'hidden');
		jQuery(".blocklyToolboxDiv").css('visibility', 'hidden');
		jQuery("#content_blocks").css('visibility', 'hidden');
		jQuery("#content_editor").css('visibility', 'visible');
  	}	
  }
  
  Blockly.fireUiEvent(window, 'resize');
};

Code.buildToolBox = function() {
    var xml;
	
	xml = '<category id="catIO" colour="20">';
	
	if (Board.hasDigitalSupport) {
		xml += ' \
		<category id="catIODigital"> \
			<block type="configuredigitalpin"></block> \
			<block type="setdigitalpin"></block>  \
			<block type="getdigitalpin"></block> \
	  	</category>';
	}
		
	if (Board.hasAnalogSupport) {
  		xml += ' \
		<category id="catIOAnalog"> \
			<block type="configureanalogpin"></block> \
			<block type="getanalogpin"></block> \
		</category>';
	}
	
	if (Board.hasPWMSupport) {
		xml += ' \
  		<category id="catIOPwm"> \
  			<block type="configuredefaultpwmpin"> \
  		        <value name="FREQUENCY"> \
  		          <shadow type="math_number"> \
  		            <field name="NUM">1000</field> \
  		          </shadow> \
  		        </value> \
  		        <value name="DUTY"> \
  		          <shadow type="math_number"> \
  		            <field name="NUM">0</field> \
  		          </shadow> \
  		        </value> \
  			</block> \
  			<block type="pwmstart"></block> \
  			<block type="pwmstop"></block> \
  			<block type="pwmsetduty"> \
  		        <value name="DUTY"> \
  		          <shadow type="math_number"> \
  		            <field name="NUM">0</field> \
  		          </shadow> \
  		        </value> \
  			</block> \
  		</category>';
	}
	
	xml += '</category>';
	
	xml += '<category id="catComm" colour="20">';
	
	if (Board.hasI2CSupport) {
		xml += ' \
  		<category id="catI2C"> \
  			<block type="configurei2c"> \
  		        <value name="SPEED"> \
  		          <shadow type="math_number"> \
  		            <field name="NUM">1000</field> \
  		          </shadow> \
  		        </value> \
  			</block> \
  			<block type="i2cstartcondition"></block> \
  			<block type="i2cstopcondition"></block> \
  			<block type="i2caddress"> \
  		        <value name="ADDRESS"> \
  		          <shadow type="math_number"> \
  		            <field name="NUM">0</field> \
  		          </shadow> \
  		        </value> \
  			</block> \
  			<block type="i2cread"></block> \
  			<block type="i2cwrite"> \
  		        <value name="VALUE"> \
  		          <shadow type="math_number"> \
  		            <field name="NUM">0</field> \
  		          </shadow> \
  		        </value> \
  			</block> \
  		</category>';
	}
	
	if (Board.hasLORASupport) {
		xml += ' \
  		<category id="catLora"> \
  			<category id="catLoraOTAA"> \
  				<block type="lora_configure"> \
  				</block> \
  				<block type="lora_set_deveui"> \
  			        <value name="DEVEUI"> \
  			          <shadow type="text"> \
  			            <field name="TEXT"></field> \
  			          </shadow> \
  			        </value> \
  				</block> \
  				<block type="lora_set_appeui"> \
  			        <value name="APPEUI"> \
  			          <shadow type="text"> \
  			            <field name="TEXT"></field> \
  			          </shadow> \
  			        </value> \
  				</block> \
  				<block type="lora_set_appkey"> \
  			        <value name="APPKEY"> \
  			          <shadow type="text"> \
  			            <field name="TEXT"></field> \
  			          </shadow> \
  			        </value> \
  				</block> \
  				<block type="lora_set_adr"></block> \
  				<block type="lora_set_dr"></block> \
  				<block type="lora_set_retx"></block> \
  				<block type="lora_join"></block> \
  				<block type="lora_tx"> \
  			        <value name="PORT"> \
  			          <shadow type="math_number"> \
  			            <field name="NUM">1</field> \
  			          </shadow> \
  			        </value> \
  			        <value name="PAYLOAD"> \
  			          <shadow type="text"> \
  			            <field name="TEXT"></field> \
  			          </shadow> \
  			        </value> \
  				</block> \
  		        <block type="lora_get_port"></block> \
  		        <block type="lora_get_payload"></block> \
  		        <block type="text_pack"></block> \
  		        <block type="text_unpack"></block> \
  			</category> \
  			<category id="catLoraABP"> \
  				<block type="lora_configure"> \
  				</block> \
  				<block type="lora_set_devaddr"> \
  			        <value name="DEVADDR"> \
  			          <shadow type="text"> \
  			            <field name="TEXT"></field> \
  			          </shadow> \
  			        </value> \
  				</block> \
  				<block type="lora_set_nwkskey"> \
  			        <value name="NWKSKEY"> \
  			          <shadow type="text"> \
  			            <field name="TEXT"></field> \
  			          </shadow> \
  			        </value> \
  				</block> \
  				<block type="lora_set_appskey"> \
  			        <value name="APPSKEY"> \
  			          <shadow type="text"> \
  			            <field name="TEXT"></field> \
  			          </shadow> \
  			        </value> \
  				</block> \
  				<block type="lora_set_adr"></block> \
  				<block type="lora_set_dr"></block> \
  				<block type="lora_set_retx"></block> \
  				<block type="lora_tx"> \
  			        <value name="PORT"> \
  			          <shadow type="math_number"> \
  			            <field name="NUM">1</field> \
  			          </shadow> \
  			        </value> \
  			        <value name="PAYLOAD"> \
  			          <shadow type="text"> \
  			            <field name="TEXT"></field> \
  			          </shadow> \
  			        </value> \
  				</block> \
  		        <block type="lora_get_port"></block> \
  		        <block type="lora_get_payload"></block> \
  		        <block type="text_pack"></block> \
  		        <block type="text_unpack"></block> \
  			</category> \
  		</category>';
	}
	
  	xml += '</category>';
	
	xml += '\
      <category id="catControl" colour="210"> \
  	    <category id="catEvents"> \
  			<block type="execute_on"></block> \
  		</category> \
  	    <category id="catDelays"> \
  	        <block type="wait_for"></block> \
  	        <block type="cpu_sleep"> \
  	          <value name="SECONDS"> \
  	            <shadow type="math_number"> \
  	              <field name="NUM"></field> \
  	            </shadow> \
  	        </block> \
  		</category> \
  	    <category id="catExceptions"> \
  	      <block type="exception_try"></block> \
  	      <block type="exception_catch_error"></block> \
  	      <block type="exception_catch_other_error"></block> \
  	      <block type="exception_raise_again"></block> \
  	    </category> \
      </category> \
  		<category id="catLogic" colour="210"> \
        <block type="controls_if"></block> \
        <block type="logic_compare"></block> \
        <block type="logic_operation"></block> \
        <block type="logic_negate"></block> \
        <block type="logic_boolean"></block> \
        <block type="logic_null"></block> \
        <block type="logic_ternary"></block> \
        <block type="bitlogic_msb"></block> \
        <block type="bitlogic_lsb"></block> \
      </category> \
      <category id="catLoops" colour="120"> \
        <block type="controls_repeat_ext"> \
          <value name="TIMES"> \
            <shadow type="math_number"> \
              <field name="NUM">10</field> \
            </shadow> \
          </value> \
        </block> \
        <block type="controls_whileUntil"></block> \
        <block type="controls_for"> \
          <value name="FROM"> \
            <shadow type="math_number"> \
              <field name="NUM">1</field> \
            </shadow> \
          </value> \
          <value name="TO"> \
            <shadow type="math_number"> \
              <field name="NUM">10</field> \
            </shadow> \
          </value> \
          <value name="BY"> \
            <shadow type="math_number"> \
              <field name="NUM">1</field> \
            </shadow> \
          </value> \
        </block> \
        <block type="controls_forEach"></block> \
        <block type="controls_flow_statements"></block> \
      </category> \
      <category id="catMath" colour="230"> \
        <block type="math_number"></block> \
        <block type="math_arithmetic"> \
          <value name="A"> \
            <shadow type="math_number"> \
              <field name="NUM">1</field> \
            </shadow> \
          </value> \
          <value name="B"> \
            <shadow type="math_number"> \
              <field name="NUM">1</field> \
            </shadow> \
          </value> \
        </block> \
        <block type="math_single"> \
          <value name="NUM"> \
            <shadow type="math_number"> \
              <field name="NUM">9</field> \
            </shadow> \
          </value> \
        </block> \
        <block type="math_trig"> \
          <value name="NUM"> \
            <shadow type="math_number"> \
              <field name="NUM">45</field> \
            </shadow> \
          </value> \
        </block> \
        <block type="math_constant"></block> \
        <block type="math_number_property"> \
          <value name="NUMBER_TO_CHECK"> \
            <shadow type="math_number"> \
              <field name="NUM">0</field> \
            </shadow> \
          </value> \
        </block> \
        <block type="math_change"> \
          <value name="DELTA"> \
            <shadow type="math_number"> \
              <field name="NUM">1</field> \
            </shadow> \
          </value> \
        </block> \
        <block type="math_round"> \
          <value name="NUM"> \
            <shadow type="math_number"> \
              <field name="NUM">3.1</field> \
            </shadow> \
          </value> \
        </block> \
        <block type="math_on_list"></block> \
        <block type="math_modulo"> \
          <value name="DIVIDEND"> \
            <shadow type="math_number"> \
              <field name="NUM">64</field> \
            </shadow> \
          </value> \
          <value name="DIVISOR"> \
            <shadow type="math_number"> \
              <field name="NUM">10</field> \
            </shadow> \
          </value> \
        </block> \
        <block type="math_constrain"> \
          <value name="VALUE"> \
            <shadow type="math_number"> \
              <field name="NUM">50</field> \
            </shadow> \
          </value> \
          <value name="LOW"> \
            <shadow type="math_number"> \
              <field name="NUM">1</field> \
            </shadow> \
          </value> \
          <value name="HIGH"> \
            <shadow type="math_number"> \
              <field name="NUM">100</field> \
            </shadow> \
          </value> \
        </block> \
        <block type="math_random_int"> \
          <value name="FROM"> \
            <shadow type="math_number"> \
              <field name="NUM">1</field> \
            </shadow> \
          </value> \
          <value name="TO"> \
            <shadow type="math_number"> \
              <field name="NUM">100</field> \
            </shadow> \
          </value> \
        </block> \
        <block type="math_random_float"></block> \
      </category> \
      <category id="catText" colour="160"> \
        <block type="text"></block> \
        <block type="text_join"></block> \
        <block type="text_append"> \
          <value name="TEXT"> \
            <shadow type="text"></shadow> \
          </value> \
        </block> \
        <block type="text_length"> \
          <value name="VALUE"> \
            <shadow type="text"> \
              <field name="TEXT">abc</field> \
            </shadow> \
          </value> \
        </block> \
        <block type="text_isEmpty"> \
          <value name="VALUE"> \
            <shadow type="text"> \
              <field name="TEXT"></field> \
            </shadow> \
          </value> \
        </block> \
        <block type="text_indexOf"> \
          <value name="VALUE"> \
            <block type="variables_get"> \
              <field name="VAR">text</field> \
            </block> \
          </value> \
          <value name="FIND"> \
            <shadow type="text"> \
              <field name="TEXT">abc</field> \
            </shadow> \
          </value> \
        </block> \
        <block type="text_charAt"> \
          <value name="VALUE"> \
            <block type="variables_get"> \
              <field name="VAR">text</field> \
            </block> \
          </value> \
        </block> \
        <block type="text_getSubstring"> \
          <value name="STRING"> \
            <block type="variables_get"> \
              <field name="VAR">text</field> \
            </block> \
          </value> \
        </block> \
        <block type="text_changeCase"> \
          <value name="TEXT"> \
            <shadow type="text"> \
              <field name="TEXT">abc</field> \
            </shadow> \
          </value> \
        </block> \
        <block type="text_trim"> \
          <value name="TEXT"> \
            <shadow type="text"> \
              <field name="TEXT">abc</field> \
            </shadow> \
          </value> \
        </block> \
        <block type="text_print"> \
          <value name="TEXT"> \
            <shadow type="text"> \
              <field name="TEXT">abc</field> \
            </shadow> \
          </value> \
        </block> \
        <block type="text_prompt_ext"> \
          <value name="TEXT"> \
            <shadow type="text"> \
              <field name="TEXT">abc</field> \
            </shadow> \
          </value> \
        </block> \
        <block type="text_pack"></block> \
        <block type="text_unpack"></block> \
      </category> \
      <category id="catLists" colour="260"> \
        <block type="lists_create_with"> \
          <mutation items="0"></mutation> \
        </block> \
        <block type="lists_create_with"></block> \
        <block type="lists_repeat"> \
          <value name="NUM"> \
            <shadow type="math_number"> \
              <field name="NUM">5</field> \
            </shadow> \
          </value> \
        </block> \
        <block type="lists_length"></block> \
        <block type="lists_isEmpty"></block> \
        <block type="lists_indexOf"> \
          <value name="VALUE"> \
            <block type="variables_get"> \
              <field name="VAR">list</field> \
            </block> \
          </value> \
        </block> \
        <block type="lists_getIndex"> \
          <value name="VALUE"> \
            <block type="variables_get"> \
              <field name="VAR">list</field> \
            </block> \
          </value> \
        </block> \
        <block type="lists_setIndex"> \
          <value name="LIST"> \
            <block type="variables_get"> \
              <field name="VAR">list</field> \
            </block> \
          </value> \
        </block> \
        <block type="lists_getSublist"> \
          <value name="LIST"> \
            <block type="variables_get"> \
              <field name="VAR">list</field> \
            </block> \
          </value> \
        </block> \
        <block type="lists_split"> \
          <value name="DELIM"> \
            <shadow type="text"> \
              <field name="TEXT">,</field> \
            </shadow> \
          </value> \
        </block> \
      </category> \
      <category id="catColour" colour="20"> \
        <block type="colour_picker"></block> \
        <block type="colour_random"></block> \
        <block type="colour_rgb"> \
          <value name="RED"> \
            <shadow type="math_number"> \
              <field name="NUM">100</field> \
            </shadow> \
          </value> \
          <value name="GREEN"> \
            <shadow type="math_number"> \
              <field name="NUM">50</field> \
            </shadow> \
          </value> \
          <value name="BLUE"> \
            <shadow type="math_number"> \
              <field name="NUM">0</field> \
            </shadow> \
          </value> \
        </block> \
        <block type="colour_blend"> \
          <value name="COLOUR1"> \
            <shadow type="colour_picker"> \
              <field name="COLOUR">#ff0000</field> \
            </shadow> \
          </value> \
          <value name="COLOUR2"> \
            <shadow type="colour_picker"> \
              <field name="COLOUR">#3333ff</field> \
            </shadow> \
          </value> \
          <value name="RATIO"> \
            <shadow type="math_number"> \
              <field name="NUM">0.5</field> \
            </shadow> \
          </value> \
        </block> \
      </category> \
      <category id="catVariables" colour="330" custom="VARIABLE"></category> \
      <category id="catFunctions" colour="290" custom="PROCEDURE"></category>';

  var toolbox = document.getElementById('toolbox');
  toolbox.innerHTML = xml;	

  jQuery("#catIO").attr("colour",Blockly.Blocks.io.HUE);
  jQuery("#catControl").attr("colour",Blockly.Blocks.control.HUE);
  jQuery("#catComm").attr("colour",Blockly.Blocks.i2c.HUE);
}

Code.updateToolBox = function() {
	Code.buildToolBox();
	Code.initLanguage();
	
    var toolbox = document.getElementById('toolbox');
	Blockly.getMainWorkspace().updateToolbox(toolbox);	
}

/**
 * Initialize Blockly.  Called on page load.
 */
Code.init = function() {
  Code.buildToolBox();	
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
		  } else {
	  	  	el = document.getElementById('content_editor');	  	
		  }	  	

	      el.style.top = bBox.y + 'px';
	      el.style.left = bBox.x + 'px';
	      // Height and width need to be set, read back, then set again to
	      // compensate for scrollbars.
	      el.style.height = (bBox.height - 25) + 'px';
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
	  
	  el = document.getElementById('logo');
	  el.style.position = 'absolute';
	  el.style.width = '100px';
	  el.style.top = 5 + 'px';
	  el.style.left = (bBox.width - bBox.x - 110) + 'px';	  	  	
	  el.style.visibility = 'visible';

	  el = document.getElementById('languageDiv');
	  el.style.position = 'absolute';
	  el.style.width = '100px';
	  el.style.height = '38px';
	  el.style.top = (bBox.y - 38) + 'px';
	  el.style.left = (bBox.width - bBox.x - 110) + 'px';	  	  	
	  el.style.visibility = 'visible';

	  el = document.getElementById('targetFile');
	  el.style.position = 'absolute';
	  el.style.width = '400px';
	  el.style.height = '38px';
	  el.style.top = (bBox.y - 38) + 'px';
	  el.style.left = (bBox.width - bBox.x - 110 - 400 - 10) + 'px';	
	  el.style.visibility = 'visible';
    }
	
    var bBoxBoardStatus = Code.getBBox_(document.getElementById('boardStatus'));
	var boardConsole = document.getElementById('boardConsole');
	var width = bBox.width - bBoxBoardStatus.x - bBoxBoardStatus.width - 40;
	var height = bBox.height - bBoxBoardStatus.y - 20;
	
    boardConsole.style.width = width + 'px';
	boardConsole.style.height = height + 'px';
	
	Term.resize(width, height);
	
    // Make the 'Blocks' tab line up with the toolbox.
    //if (Code.workspace.blocks && Code.workspace.blocks.toolbox_.width) {
    //  document.getElementById('tab_blocks').style.minWidth =
    //      (Code.workspace.blocks.toolbox_.width - 38) + 'px';
          // Account for the 19 pixel margin and on each side.
    //}	
  };
  onresize();
  window.addEventListener('resize', onresize, false);
  
  var toolbox = document.getElementById('toolbox');

  Code.workspace.blocks = Blockly.inject('content_blocks',
      {grid:
          {spacing: 25,
           length: 3,
           colour: '#ccc',
           snap: true},
       media: '../../media/',
       rtl: rtl,
       toolbox: toolbox,
       zoom:
           {controls: true,
            wheel: true}
      });

//  Code.workspace.updateToolbox(toolbox);
	  
  // Add to reserved word list: Local variables in execution environment (runJS)
  // and the infinite loop detection function.

  Code.loadBlocks('');

  ace.require("ace/ext/language_tools");
  Code.workspace.editor = ace.edit(document.getElementById("content_editor"));
  Code.workspace.editor.setShowPrintMargin(true);
  Code.workspace.editor.setPrintMarginColumn(120);
  Code.workspace.editor.getSession().setMode("ace/mode/lua");
  Code.workspace.editor.setOptions({ enableBasicAutocompletion: true });
  Code.workspace.editor.$blockScrolling = Infinity;		

  if ('BlocklyStorage' in window) {
    // Hook a save function onto unload.
    BlocklyStorage.backupOnUnload(Code.workspace.blocks);
  }

  Code.tabClick(Code.selected);

  Code.bindClick('trashButton',
      function() {Code.discard(); Code.renderContent();});
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

  for (var i = 0; i < Code.TABS_.length; i++) {
    var name = Code.TABS_[i];
    Code.bindClick('tab_' + name,
        function(name_) {return function() {Code.tabClick(name_);};}(name));
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
  document.head.parentElement.setAttribute('lang', Code.LANG);

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
    if (lang == Code.LANG) {
      option.selected = true;
    }
    languageMenu.options.add(option);
  }
  languageMenu.addEventListener('change', Code.changeLanguage, true);

  // Inject language strings.
  
  jQuery(".tabon, .taboff").each(function(index, value){
  	  var element = jQuery(value);

	  element.text(MSG[element.attr('id').replace('tab_','')]);
  });
  
  document.getElementById('switchToBlocks').title = MSG['switchToBlocksTooltip'];
  document.getElementById('switchToCode').title = MSG['switchToCodev'];
  document.getElementById('loadButton').title = MSG['loadButtonTooltip'];
  document.getElementById('saveButton').title = MSG['saveButtonTooltip'];
  document.getElementById('saveAsButton').title = MSG['saveAsButtonTooltip'];
  document.getElementById('rebootButton').title = MSG['rebootButtonTooltip'];
  document.getElementById('stopButton').title = MSG['stopButtonTooltip'];

  document.getElementById('runButton').title = MSG['runTooltip'];
  document.getElementById('trashButton').title = MSG['trashTooltip'];

  var categories = [];
  
  categories.push('catIO');
  
  if (Board.hasDigitalSupport) categories.push('catIODigital');
  if (Board.hasAnalogSupport)  categories.push('catIOAnalog');
  if (Board.hasPWMSupport)     categories.push('catIOPwm');

  categories.push('catComm');
  
  if (Board.hasI2CSupport)  categories.push('catI2C');
  if (Board.hasLORASupport) categories.push('catLora');
  if (Board.hasLORASupport) categories.push('catLoraOTAA');
  if (Board.hasLORASupport) categories.push('catLoraABP');

  categories.push('catControl');
  categories.push('catExceptions');
  categories.push('catEvents');
  categories.push('catDelays');

  categories.push('catLogic');
  categories.push('catLoops');
  categories.push('catMath');
  categories.push('catText');
  categories.push('catLists');
  categories.push('catColour');
  categories.push('catVariables');
  categories.push('catFunctions');
  
  for (var i = 0, cat; cat = categories[i]; i++) {
    document.getElementById(cat).setAttribute('name', MSG[cat]);
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
				  Code.workspace.sourceType = "";
				  Code.workspace.source = "";
			  	  Code.workspace.name = "";
			  	  Code.workspace.target = "";
				  Code.tabRefresh();
	  		  }
	  	  }); 	  
	    }		
	} else if (Code.workspace.type == 'editor') {
  	  bootbox.confirm(MSG['DELETE_EDIT_CODE'], 
  	  function(result) {
  		  if (result) {
  			  Code.workspace.editor.setValue("", -1);
			  Code.workspace.sourceType = "";
			  Code.workspace.source = "";	
		  	  Code.workspace.name = "";
		  	  Code.workspace.target = "";	
			  Code.tabRefresh();
  		  }
  	  }); 	  
	}	
};

Code.runtimeError = function(file, line, code, message) {
	Code.showError(MSG['youHaveAnError'] + '<br><br>' + message);	
}

Code.run = function() {
	var code = "";	

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
		Board.run(Board.currentPort(), file, code, 
			function() {
				Code.hideProgress();
			},
			function(file, line, message) {
				Code.showError(MSG['youHaveAnError'] + '<br><br>' + message);		
			}
		);			
	}

   	function fileSelected(file) {
		jQuery("#selectedFileName").val(file.replace(/\.([^.]*?)$/, ""));
   	}

   	function folderSelected(folder) {
		if (folder != '/') {
			folder = folder + '/';
		}
		
		jQuery("#selectedFolder").text(folder);
		jQuery("#selectedFolder").data("selected", folder);
   	}
	
	if (Code.workspace.target == '') {
	   	bootbox.dialog({
	   		title: MSG['noTarget'],
	   	    message: '<div id="runFile" style="position: relative; left: -25px;overflow: auto;width:100%;height:'+(bBox.height * 0.50)+'px;"></div><br>' +
					 MSG['saveAs'] + '<span id="selectedFolder"></span><input type="text" id="selectedFileName" value="unnamed">.lua' ,
	   		buttons: {
	   		    main: {
	   		      label: MSG['run'],
	   		      className: "btn-primary",
	   		      callback: function() {
					  var file = jQuery("#selectedFileName").val();
					  if (file != "") {
			  			  Code.workspace.source = file;			
						  Code.workspace.target = jQuery("#selectedFolder").data("selected") + file + '.lua';
						  Code.tabRefresh();
						  run(Code.workspace.target);
					  } else {
						  return false;
					  }
	   			  }
	   		    },
	   		    danger: {
	   		      label: MSG['cancel'],
	   		      className: "btn-danger",
	   		      callback: function() {
	   		      }
	   		    },
	   		},
	   		closable: false
	   	});	

		// Show root files from board
		folderSelected("/");	
		Code.listBoardDirectory(jQuery('#runFile'), "lua", folderSelected, fileSelected);
	} else {
		run(Code.workspace.target);
	}	
}

// File is loaded from computer
Code.loadFileFromComputer = function(fileEntry) {
	if(chrome.runtime.lastError) {
		return;
	}
	
    fileEntry.file(function(file) {
        Code.workspace.blocks.clear();
		
		var reader = new FileReader();
    	reader.onload = function(e) {
			Code.workspace.sourceType = "computer";
			Code.workspace.source = fileEntry.fullPath.replace(/\.([^.]*?)$/, "");			
			Code.workspace.name = file.name.replace(/\.([^.]*?)$/, "");
			Code.workspace.target = Code.currentFile.path + "/" + Code.workspace.name + ".lua";
			
			var extension = file.name.replace(Code.workspace.name,"").replace(".","");
	
			if (extension == 'xml') {
				Code.workspace.type = "blocks";
			} else if (extension == 'lua'){
				Code.workspace.type = "editor";
			} else {
				return;
			}

			if (Code.workspace.type == 'blocks') {
				Code.workspace.blocks.clear();			
			    var xml = Blockly.Xml.textToDom(e.target.result);
			    Blockly.Xml.domToWorkspace(xml, Code.workspace.blocks);
			} else {
			    Code.workspace.editor.setValue(e.target.result, -1);	
			}

			Code.tabClick("program");
    	};
    	reader.readAsText(file);
    });
	
	bootbox.hideAll();
};

// File is loaded from board
Code.loadFileFromBoard = function(file) {
	Code.workspace.sourceType = "board";
	Code.workspace.source =  (Code.currentFile.path + "/" + file).replace(/\.([^.]*?)$/, "");
	Code.workspace.name = file.replace(/\.([^.]*?)$/, "");
	Code.workspace.target = Code.currentFile.path + "/" + Code.workspace.name + ".lua";
	
	var extension = file.replace(Code.workspace.name,"").replace(".","");
	
	if (extension == 'xml') {
		Code.workspace.type = "blocks";
	} else if (extension == 'lua'){
		Code.workspace.type = "editor";
	} else {
		return;
	}
	
	// Download file
    Code.showProgress(MSG['downloadingFile'] + " " + Code.currentFile.path + "/" + file + " ...");	
	Whitecat.receiveFile(Whitecat.currentPort(), Code.currentFile.path + "/" + file, function(fileContent) {
		BootstrapDialog.closeAll();
		bootbox.hideAll();

		if (Code.workspace.type == 'blocks') {
			Code.workspace.blocks.clear();			
		    var xml = Blockly.Xml.textToDom(fileContent);
		    Blockly.Xml.domToWorkspace(xml, Code.workspace.blocks);
		} else {
		    Code.workspace.editor.setValue(fileContent, -1);	
		}

		Code.tabClick("program");
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

	// Show a dialog for select a file from board, or allow to select a file from
	// computer
	bootbox.dialog({
		title: MSG['loadBlockTitle'],
	    message: '<div id="loadFile" style="position: relative; left: -25px;overflow: auto;width:100%;height:'+(bBox.height * 0.50)+'px;"></div>',
		buttons: {
		    success: {
		      label: MSG['loadFromDesktop'],
		      className: "btn-primary",
		      callback: function() {
			      chrome.fileSystem.chooseEntry({
			           type: 'openFile',
			           suggestedName: 'untitled.'+ extension,
			           accepts: [ { description: extension + ' files (*.' + extension + ')',
			                        extensions: [extension]} ],
			            acceptsAllTypes: false
			      }, Code.loadFileFromComputer);
				  
				  return false;
			  }
		    },
		    danger: {
		      label: MSG['cancel'],
		      className: "btn-danger",
		      callback: function() {
		      }
		    },
		},
		closable: false
	});	
			
	// Show root files from board
	Code.listBoardDirectory(jQuery('#loadFile'), extension, undefined, Code.loadFileFromBoard);
};

Code.stop = function() {
	Board.stop(Board.currentPort(),
		function() {
		},
		function(err) {
			Code.showError("1" + err);
		}
	);
}

Code.reboot = function() {
	Board.reboot(Board.currentPort(),
		function() {
			Code.renderContent();
		}
	);
}

Code.save = function() {
	var code;      // Code to save (Lua source code or xml)
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

	      fileWriter.onerror = function(e) {
	      };

	      fileWriter.write(blob, {type: 'text/plain'});
		});
	}
	
	function saveToBoard(folder, file) {
		Code.showProgress(MSG['sendingFile'] + " " + folder + file + " ...");	
		Whitecat.sendFile(Whitecat.currentPort(), folder + file, code, 
			function() {
				Code.workspace.sourceType = "board";
				Code.workspace.name = file.replace(/\.([^.]*?)$/, "");
				Code.workspace.target = folder + "/" + Code.workspace.name + ".lua";
				Code.workspace.source = folder + "/" + Code.workspace.name;
				
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

	var target = Code.workspace.target;
	if (target != "") {
		target = target.replace(/\.([^.]*?)$/, "");
		
		Code.showProgress(MSG['sendingFile'] + " " + target + "." + extension + " ...");	
		Whitecat.sendFile(Whitecat.currentPort(), target + "." + extension, code, 
			function() {
				Code.hideProgress();
				Code.tabRefresh();
		});				
	} else {
		target = 'unnamed';
	
	   	bootbox.dialog({
	   		title: MSG['saveBlockTitle'],
	   	    message: '<div id="saveFile" style="position: relative; left: -25px;overflow: auto;width:100%;height:'+(bBox.height * 0.50)+'px;"></div><br>' +
					 MSG['saveAs'] + '<span id="selectedFolder"></span><input type="text" id="selectedFileName" value="'+target+'">' + '.' + extension ,
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
				      chrome.fileSystem.chooseEntry( {
				           type: 'saveFile',
				           suggestedName: 'unnamed.'+ extension,
				           accepts: [ { description: extension + ' files (*.' + extension + ')',
				                        extensions: [extension]} ],
				           acceptsAllTypes: false
				         }, saveToFile);
					 
					  return false;
	   			  }
	   		    },
	   		    danger: {
	   		      label: MSG['cancel'],
	   		      className: "btn-danger",
	   		      callback: function() {
	   		      }
	   		    },
	   		},
	   		closable: false
	   	});	
		
		folderSelected("/");	
	   	Code.listBoardDirectory(jQuery('#saveFile'), extension, folderSelected, fileSelected);
	}
};

Code.saveAs = function() {
	var code;      // Code to save (Lua source code or xml)
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

	      fileWriter.onerror = function(e) {
	      };

	      fileWriter.write(blob, {type: 'text/plain'});
		});
	}
	
	function saveToBoard(folder, file) {
		Code.showProgress(MSG['sendingFile'] + " " + folder + file + " ...");	
		Whitecat.sendFile(Whitecat.currentPort(), folder + file, code, 
			function() {
				Code.workspace.sourceType = "board";
				Code.workspace.name = file.replace(/\.([^.]*?)$/, "");
				Code.workspace.target = folder + "/" + Code.workspace.name + ".lua";
				Code.workspace.source = folder + "/" + Code.workspace.name;
				
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

   	bootbox.dialog({
   		title: MSG['saveBlockTitle'],
   	    message: '<div id="saveFile" style="position: relative; left: -25px;overflow: auto;width:100%;height:'+(bBox.height * 0.50)+'px;"></div><br>' +
				 MSG['saveAs'] + '<span id="selectedFolder"></span><input type="text" id="selectedFileName" value="">' + '.' + extension ,
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
			      chrome.fileSystem.chooseEntry( {
			           type: 'saveFile',
			           suggestedName: 'unnamed.'+ extension,
			           accepts: [ { description: extension + ' files (*.' + extension + ')',
			                        extensions: [extension]} ],
			           acceptsAllTypes: false
			         }, saveToFile);
				 
				  return false;
   			  }
   		    },
   		    danger: {
   		      label: MSG['cancel'],
   		      className: "btn-danger",
   		      callback: function() {
   		      }
   		    },
   		},
   		closable: false
   	});	
	
	folderSelected("/");	
   	Code.listBoardDirectory(jQuery('#saveFile'), extension, folderSelected, fileSelected);
};

// Progress messages
Code.showProgress = function(title) {
	BootstrapDialog.closeAll();
	bootbox.hideAll();
	
	BootstrapDialog.show({
	   message: `<div class="progress progress-striped active" style="width: 100%;"> \
 				 	<div class="progress-bar" role="progressbar" style="width: 100%;"> \
					</div> \ 
				</div>`,
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
            setTimeout(function(){
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

Code.showError = function(err) {
	BootstrapDialog.closeAll();
	bootbox.hideAll();

	setTimeout(function() {
	   	bootbox.dialog({
	   		title: MSG['runtimeError'],
	   	    message: err ,
	   		buttons: {
	   		    main: {
	   		      label: MSG['ok'],
	   		      className: "btn-primary",
	   		      callback: function() {
	   			  }
	   		    }
			},
	   		closable: false
	   	});			
	}, 500);
	
	//Code.showAlert("Error: " + err);
}

Code.updateStatus = function() {
	var container = jQuery('#boardStatus');	

	var html;
	
	if (!Board.isConnected()) {
		html = '<span class="waitingForBoard"><i class="spinner icon icon-spinner3"></i> ' + MSG['waitingForBoard'] + '</span>';		
		container.html(html);	
	} else {
		html  = '<table class="table table-striped">';
		html += '<thead>';
		html += '<th>' + MSG['item'] + '</th>';
		html += '<th>' + MSG['value'] + '</th>';
		html += '</thead>';
		html += '<tbody>';
		html += '<tr><td>' + MSG['installedFirmware'] + '</td><td>' + Whitecat.status.firmware + '</td></tr>';
		html += '<tr><td>' + MSG['cpuModel'] + '</td><td>' + Whitecat.status.cpu + '</td></tr>';
		html += '</tbody>';
		html += '</table>';
		html += '</table>';
		
		if (Board.hasFirmwareUpgradeSupport) {
			html +='<button id="checkFirmwareButton" type="button" class="btn btn-default" aria-label="Left Align">';
			html += MSG['checkForFirmwareUpdates'];
			html += '</button>';
		}
	
		container.html(html);	
		
		if (Board.hasFirmwareUpgradeSupport) {
			Code.bindClick('checkFirmwareButton', Code.checkFirmware);	
		}
	}
	
	Blockly.fireUiEvent(window, 'resize');
}

Code.listBoardDirectory = function(container, extension, folderSelect, fileSelect, target) {
	var html;
	var path = "";
	var root = false;

	if (!Board.isConnected()) {
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

	Whitecat.listDirectory(Whitecat.currentPort(), path, 
		function(entries) {
			var html = '';
			
			if (path == '/') path = '';
			
			html +='<ul class="dir-entry list-unstyled">';
			
			if (root) {
				html += '<li class="dir-entry-d" data-expanded="true" data-path data-name data-type="d"><div style="width: 20px;float: left;"><i class="waiting"></i></div><i class="status"></i><span class="entryName">Whitecat</span>'	
				html +='<ul class="dir-entry list-unstyled">';				
			}

			container.find("[data-path='"+path+"']").remove();
			
			container.find(".waiting").removeClass("spinner");
			container.find(".waiting").removeClass("icon");
			container.find(".waiting").removeClass("icon-spinner3");
			
			entries.forEach(function(entry) {
				if (entry.type == 'f') {
					if (typeof extension != "undefined") {
						if (entry.name.match(new RegExp('^.*\.'+extension+'$'))) {
							html = html + '<li class="dir-entry-'+entry.type+'" data-expanded="false" data-path="' +path + '" data-name="' + entry.name + '" data-type="' + entry.type + '"><div style="width: 20px;float: left;"><i class="waiting"></i></div><i class="status"></i><span class="entryName">' + entry.name + '</span></li>'											
						}						
					} else {
						html = html + '<li class="dir-entry-'+entry.type+'" data-expanded="false" data-path="' +path + '" data-name="' + entry.name + '" data-type="' + entry.type + '"><div style="width: 20px;float: left;"><i class="waiting"></i></div><i class="status"></i><span class="entryName">' + entry.name + '</span></li>'																	
					}
				} else {
					html = html + '<li class="dir-entry-'+entry.type+'" data-expanded="false" data-path="' + path + '" data-name="' + entry.name + '" data-type="' + entry.type + '"><div style="width: 20px;float: left;"><i class="waiting"></i></div><i class="status"></i><span class="entryName">' + entry.name + '</span></li>'					
				}
			});

			if (root) {
				html += '</li>';				
			}
			
			html += '</ul>';

			container.append(html);
			Blockly.fireUiEvent(window, 'resize');
			
			container.find('.dir-entry-d, .dir-entry-f').unbind().bind('click',function(e) {
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
				  	  target.attr('data-expanded','false');
					  target.find(".dir-entry").remove();	
					  
	  				  target.find(".status:first").addClass("icon-folder2");
				      target.find(".status:first").removeClass("icon-folder-open");	
					  
					  if (typeof folderSelect != 'undefined') {
						  folderSelect(path + '/' + entry);
					  }
					  			
				  } else {
				  	  target.attr('data-expanded','true');
					  Code.currentFile.path = path + '/' + entry;
					  
					  if (typeof folderSelect != 'undefined') {
						  folderSelect(path + '/' + entry);
					  }
					  
				  	  Code.listBoardDirectory(jQuery('#filesystem'), extension, folderSelect, fileSelect,target);
				  }				  
			  } else {
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
  	    },
		function(err) {
			Code.showError(err);
		}	
	);
}

Code.tabRefresh = function() {
	if ((Code.selected == 'program') && (Code.workspace.type == 'blocks')) {
		jQuery("#switchToCode, #trashButton, #loadButton, #saveButton,  #saveAsButton, #rebootButton, #stopButton, #runButton").removeClass("disabled");
		jQuery("#switchToBlocks").addClass("disabled");
	} else if ((Code.selected == 'program') && (Code.workspace.type == 'editor')) {
		jQuery("#switchToBlocks, #trashButton, #loadButton, #saveButton, #saveAsButton, #rebootButton, #stopButton, #runButton").removeClass("disabled");
		jQuery("#switchToCode").addClass("disabled");
	} else if (Code.selected == 'board') {
		jQuery("#switchToCode, #switchToBlocks, #trashButton, #loadButton, #saveButton, #saveAsButton, #rebootButton, #stopButton, #runButton").addClass("disabled");
	}
	
	if (!Board.isConnected()) {
		jQuery("#stopButton, #runButton, #tab_board, #rebootButton, #content_board").addClass("disabled");
	} else {
		jQuery("#stopButton, #runButton, #rebootButton, #content_board").removeClass("disabled");
	}

	if (Code.selected == 'program') {
		if (Code.workspace.target != '') {
			var extension = "";
			if (Code.workspace.type == 'blocks') {
				extension = "xml";
			} else if (Code.workspace.type == 'editor') {
				extension = "lua";
			}
			
			jQuery("#targetFile").html(Code.workspace.source + '.' + extension + '&nbsp;&nbsp;<i class="icon icon-arrow-right6"></i>&nbsp;&nbsp;' + Code.workspace.target);					
		} else {
			jQuery("#targetFile").html('');					
		}
	} else {
		jQuery("#targetFile").html('');		
	}
	
}

Code.boardConnected = function() {
	Code.renderContent();
	Term.connect(Board.currentPort());	
}

Code.boardDisconnected = function() {
	Code.renderContent();
	Term.disconnect();
}

Code.boardRecover = function() {
  Code.showProgress(MSG['downloadingFirmware']);
  Whitecat.getLastFirmwareAvailableCode(
	  function(code) {
		Code.hideProgress();
		Board.upgradeFirmware(Board.currentPort(), code, 
		  function() {
			Code.showInformation(MSG['firmwareUpgraded']);
			Board.init();								
		  }
	  	);
	  },
	  function(err) {
		Code.showError("2" + err);
	  }
  );
}

Code.boardBadFirmware = function() {
	bootbox.dialog({
		title: MSG['boardBadFirmwareTitle'],
	    message: MSG['boardBadFirmware'],
		buttons: {
		    success: {
		      label: MSG['recover'],
		      className: "btn-primary",
		      callback: function() {
				  setTimeout(function() {
				  	  Code.showProgress(MSG['recovering']);
				  	  Board.init(Whitecat.RECOVER_STATE);
				  },500);
			  }
		    },
		    danger: {
		      label: MSG['cancel'],
		      className: "btn-danger",
		      callback: function() {
				  Board.init();
		      }
		    },
		},
		closable: false
	});	
}

Code.boardInBootloaderMode = function(callback) {
	bootbox.dialog({
	  message: MSG['boardInBootloaderMode'],
		buttons: {
		    success: {
		      label: MSG['installNow'],
		      className: "btn-primary",
		      callback: function() {
				  Code.showProgress(MSG['downloadingFirmware']);
				  Whitecat.getLastFirmwareAvailableCode(
					  function(code) {
						Code.hideProgress();
						Board.upgradeFirmware(Board.currentPort(), code, 
						  function() {
							Code.showInformation(MSG['firmwareUpgraded']);
							Board.init();								
						  }
					  	);
					  },
					  function(err) {
			  			Code.showError("3" + err);
					  }
				  );
			  }
		    },
		    danger: {
		      label: MSG['notNow'],
		      className: "btn-danger",
		      callback: function() {
				  Board.init();
		      }
		    },
		},
		closable: false
	});
}

Code.upgradeFirmwareProgress = function(percent) {
	if (!Code.progressDialog) {
		Code.progressDialog = true;
		BootstrapDialog.closeAll();
		bootbox.hideAll();

		BootstrapDialog.show({
		   message: `<div class="progress" style="width: 100%;"> \
				<div class="upgradeFirmwareProgress progress-bar progress-bar-striped active" role="progressbar" style="width:`+percent+`%"> \
	    		</div> \
			</div>`,
			title: 'Upgrading firmware ...',
			closable: false
		});					
	} else {
		jQuery(".upgradeFirmwareProgress").width(percent + "%");
	}
}

Code.checkFirmware = function() {
	Whitecat.checkForNewFirmwareAvailability(Board.currentPort(),
		function(newFirmware) {
			if (newFirmware) {
				bootbox.dialog({
				  message: MSG['newFirmware'],
					buttons: {
					    success: {
					      label: MSG['installNow'],
					      className: "btn-primary",
					      callback: function() {
	  						  Code.showProgress(MSG['downloadingFirmware']);
	  						  Whitecat.getLastFirmwareAvailableCode(
	  							  function(code) {
			  						Code.showProgress(MSG['rebooting']);
  	  								Board.upgradeFirmware(Board.currentPort(), code, 
  	  								  function() {
  	  									Code.showInformation(MSG['firmwareUpgraded']);
  	  									Board.init();								
  	  								  }
  	  							  	);
	  							  },
	  							  function(err) {
						  			Code.showError("4" + err);
	  							  }
	  						  );
						  }
					    },
					    danger: {
					      label: MSG['notNow'],
					      className: "btn-danger",
					      callback: function() {
					      }
					    },
					},
					closable: false
				});
			} else {
				Code.showInformation(MSG['firmwareNoNewVersion']);
			}
		},
		function(err) {
			Code.showError("5" + err);
		}
	);
}

Code.switchToCode = function() {
	var blockCode = Blockly.Lua.workspaceToCode(Code.workspace.blocks).trim();

	Code.workspace.type = "editor";
	Code.tabClick("program");
	Code.workspace.editor.setValue(blockCode, -1);
	Code.workspace.editor.focus();
}

Code.switchToBlocks = function() {
	var blockCode = Blockly.Lua.workspaceToCode(Code.workspace.blocks).replace(/\r|\n|\s/g,"");
	var luaCode = Code.workspace.editor.getValue().replace(/\r|\n|\s/g,"");
	
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
				  	Code.tabClick("program");					  
				  }
			    },
			    danger: {
			      label: MSG['no'],
			      className: "btn-danger",
			      callback: function() {
			      }
			    },
			},
			closable: false
		});	
	} else {
		Code.workspace.type = "blocks";
		Code.tabClick("program");
	}
}

// Load the Code demo's language strings.
var script = document.createElement('script');
script.src = 'msg/' + Code.LANG + '.js';
document.head.appendChild(script);
 
// Load Blockly's language strings.
script = document.createElement('script');
script.src = 'msg/js/' + Code.LANG + '.js';
document.head.appendChild(script);

window.addEventListener('load', Code.init);
window.addEventListener('load', Board.init);
window.addEventListener('load', Term.init);
