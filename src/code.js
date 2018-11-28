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

// Test if user's browser is Chrome
function isChrome() {
    var isChromium = window.chrome,
        winNav = window.navigator,
        vendorName = winNav.vendor,
        isOpera = winNav.userAgent.indexOf("OPR") > -1,
        isIEedge = winNav.userAgent.indexOf("Edge") > -1,
        isIOSChrome = winNav.userAgent.match("CriOS");

    if (isIOSChrome) {
        return true;
    } else if (isChromium !== null && isChromium !== undefined && vendorName === "Google Inc." && isOpera == false && isIEedge == false) {
        return true;
    } else {
        return false;
    }
}

// By default, enable developer mode
Blockly.Lua.developerMode = true;

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

Code.server = "https://ide.whitecatboard.org";
Code.cloud = null;

var blockAbstraction = {
    Low: 0,
    High: 1
};

Code.blockAbstraction = blockAbstraction.High;

Code.storage = {};

Code.minAgentVersion = 2.1;
Code.checkNewFirmwareVersion = true;
Code.checkNewAgentVersion = true;
Code.showCode = false;

Code.storage.board = null;
Code.storage.local = null;
Code.storage.cloud = null;

Code.Help = null;

Code.defaultStatus = {
    cpu: "ESP32",
    connected: false,
    modules: {
        "thread": true,
        "nvs": true,
        "pack": true,
        "i2c": true,
        "can": true,
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
    maps: [],
    sensors: []
};

Code.devices = [{
    "vendorId": "0x10c4",
    "productId": "0xea60",
    "vendor": "Silicon Labs",
	"maxBauds": "921600"
}, {
    "vendorId": "0x403",
    "productId": "0x6015",
    "vendor": "FTDI",
	"maxBauds": "921600"
}, {
    "vendorId": "0x403",
    "productId": "0x6001",
    "vendor": "FTDI",
	"maxBauds": "921600"
}, {
    "vendorId": "0x403",
    "productId": "0x6010",
    "vendor": "FTDI",
	"maxBauds": "2000000"
}, {
    "vendorId": "0x1a86",
    "productId": "0x7523",
    "vendor": "CH340",
	"maxBauds": "115200"
}];

Code.status = JSON.parse(JSON.stringify(Code.defaultStatus));

Code.platforms = ["MacIntel", "Win32", "Linux x86_64"];

Code.progressDialog = false;

Code.currentFile = {
    id: null,
    path: '/',
    file: '',
    storage: StorageType.Computer,
    changes: false
};
    
Code.settings = {
    "language": "en",
    "board": "N1ESP32",
    "programmingModel": "blocks"
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

Code.defaultStorage = function() {
    if (Code.status.connected) {
        return StorageType.Board;
    } else {
        return StorageType.Computer;
    }
};

Code.setDefaultStorage = function() {
    Code.currentFile.id = null;
    Code.currentFile.path = '/';
    Code.currentFile.file = '';
    Code.currentFile.storage = StorageType.Computer;
    Code.currentFile.changes = Code.defaultStorage();
    
    Code.renderStorage(StorageType.None, Code.currentFile.path , jQuery("#targetFile"));
};

Code.renderStorage = function(storage, file, target) {
    if (storage == StorageType.None) {
        if (target.attr("id") == "targetFile") {
            target.html("");
            return;
        }
    }
    
    if (target.attr("id") == "targetFile") {
        // We only render the file name, without path
        var tmp = file.split("/");

        file = tmp[tmp.length - 1];
    } else {
        //We only render the file path
        var tmp = file.split("/");

        file = "";
        for (var i = 0; i < tmp.length; i++) {
            if (tmp[i] != "") {
                if (file != "") {
                    file = file + "/";
                }

                file = file + tmp[i];
            }
        }

        file = "/" + file;

        if (file != "/") {
            file = file + "/";
        }
    }

    // Get storage's icon
    var icon = '';

    if (storage == StorageType.Board) {
        icon = '<span><span class="icon icon-chip" style="font-size: 14px;" aria-hidden="true"></span></span>&nbsp;';
    } else if (storage == StorageType.Computer) {
        icon = '<span><span class="icon icon-display" style="font-size: 14px;" aria-hidden="true"></span></span>&nbsp;';
    } else if (storage == StorageType.Cloud) {
        icon = '<span><span class="icon icon-cloud" style="font-size: 14px;" aria-hidden="true"></span></span>&nbsp;';
    }

    // Render
    if (target.attr("id") != "targetFile") {
        target.html("&nbsp;&nbsp;" + icon + "&nbsp;&nbsp;" + file);
    } else {
        target.html("|&nbsp;&nbsp;" + icon + file);
    }
};

Code.setCurrentStorage = function(storage, path, file, id) {
    if (typeof path == "undefined") {
        var tmp = file.split("/");
        var folder = "";
        var fileName = "";

        // Folder part
        for (var i = 0; i < tmp.length - 1; i++) {
            if (tmp[i] != "") {
                folder = folder + "/" + tmp[i];
            }
        }

        if (folder == "") {
            folder = "/";
        } else {
            folder = folder + "/";
        }

        // File part
        fileName = tmp[tmp.length - 1];

        path = folder;
        file = fileName;
    }

    if (storage != StorageType.Cloud) {
        Code.currentFile.path = path;
        Code.currentFile.id = null;
    } else {
        Code.currentFile.path = "";
        Code.currentFile.id = id;

        file = file.replace(/\/.*\//g, "");
    }

    Code.currentFile.file = file;

    Code.currentFile.storage = storage;
    Code.currentFile.changes = false;

    Code.renderStorage(storage, Code.getCurrentFullPath(), jQuery("#targetFile"));
};

Code.getCurrentFullPath = function() {
    var path;

    if (typeof Code.currentFile.path == "undefined") {
        Code.currentFile.path = "";
    }

    path = Code.currentFile.path;

    path = path.replace(/[\\\/]+/g, '/');
    if (path.charAt(0) != "/") {
        path = "/" + path;
    }

    path += Code.currentFile.file;

    path = path.replace(/[\\\/]+/g, '/');

    return path;
}

Code.getBasename = function(path) {
    var tmp = path.split("/");
    
    return tmp[tmp.length - 1];
}

Code.getPathFor = function(folder, file) {
    var path;

    if (typeof folder == "undefined") {
        folder = "";
    }

    if (folder == "") {
        path = Code.currentFile.path;
    } else {
        path = folder;
    }

    if (typeof file == "undefined") {
        file = "";
    }

    if (file == "") {
        file = Code.currentFile.file;
    }

    path = path.replace(/[\\\/]+/g, '/');
    if (path.charAt(0) != "/") {
        path = "/" + path;
    }

    if (path != "/") {
        path += "/";
    }

    path += file;

    path = path.replace(/[\\\/]+/g, '/');

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

    Settings.save(Code.settings);
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

/**
 * Populate the currently selected pane with content generated from the blocks.
 */
Code.renderContent = function() {
    var content = document.getElementById('content_program');

    Code.tabRefresh();

    if (Code.workspace.type == 'blocks') {
        jQuery("#content_block_editor").css('visibility', 'hidden');
        jQuery("#content_editor").css('visibility', 'hidden');
        jQuery(".ace_print-margin").css('visibility', 'hidden');
        jQuery("#content_blocks").css('visibility', 'visible');

        jQuery("#content_blocks").find(".injectionDiv").css('visibility', 'visible');
        jQuery("#content_block_editor").find(".injectionDiv").css('visibility', 'hidden');

        if (Code.workspace.blocks) {
            Code.workspace.blocks.setVisible(true);

            Code.updateToolBox();
        }
    } else if (Code.workspace.type == 'editor') {
        jQuery("#content_blocks").css('visibility', 'hidden');
        jQuery("#content_editor").css('visibility', 'visible');
        jQuery(".ace_print-margin").css('visibility', 'visible');
        jQuery("#content_block_editor").css('visibility', 'hidden');

        if (Code.workspace.blocks) {
            Code.workspace.blocks.setVisible(false);
        }
    } else if (Code.workspace.type == 'block_editor') {
        Code.blocklyFactory.init();

        jQuery("#content_blocks").css('visibility', 'hidden');
        jQuery("#content_editor").css('visibility', 'hidden');
        jQuery(".ace_print-margin").css('visibility', 'hidden');
        jQuery("#content_block_editor").css('visibility', 'visible');

        jQuery("#content_blocks").find(".injectionDiv").css('visibility', 'hidden');
        jQuery("#content_block_editor").find(".injectionDiv").css('visibility', 'visible');

        if (Code.workspace.blocks) {
            Code.workspace.blocks.setVisible(false);
        }
    }

    // Avoid toolbox items to be text-selected
    jQuery("[role='treeitem']").addClass("noselect");    
    
    // Add context menu to toolbox items to get help
    jQuery.contextMenu({
        selector: "[role='treeitem']",
        items: {
            help: {name: Blockly.Msg.HELP + " ...", callback: function(key, opt) { 
                var target = jQuery(this);
                var id = target[0].id;

                function findCat(categories) {
                    var i;
                    
                    if (!categories) return "";
                
                    for(i=0;i<categories.length;i++) {
                        var category = findCat(categories[i].children_);
                        
                        if (category == "") {
                            if (typeof categories[i].id_ != "undefined") {
                                if (categories[i].id_ == id) {
                                    return categories[i].catId;
                                }                        
                            }                            
                        } else {
                            return category;
                        }
                    }                    
                    
                    return "";
                }
                
                var category = findCat(Code.workspace.blocks.toolbox_.tree_.children_);
                
                if (category != "") {
                    Code.Help.show("categories", category);
                }
            }}
        }
    });


    jQuery.contextMenu({
        selector: '.btn-toolbar > .btn-group > [type="button"]',
        items: {
            help: {name: Blockly.Msg.HELP + " ...", callback: function(key, opt) { 
                var target = jQuery(this);
                var id = target[0].id;

                if (id != "") {
                    Code.Help.show("ui", id);
                }
            }}
        },
        zIndex: 999999
    });
        
    window.dispatchEvent(new Event('resize'));
};

Code.buildToolBox = function(callback) {
    var xml = '';

    xml += '' +
        '<category id="catEvents" colour="'+Blockly.Blocks.events.HUE+'">' +
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
        '<category id="catControl" colour="'+Blockly.Blocks.control.HUE+'">' +
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
        '<category id="catOperators" colour="'+Blockly.Blocks.operators.HUE+'">' +
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
        '<block type="logic_compare">' +
        '</block>' +    
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
        '<block type="bitlogic_msb">'+
        '<value name="BOOL">' +
        '<shadow type="math_number">' +
        '<field name="NUM">0</field>' +
        '</shadow>' +
        '</value>' +
        '</block>' +
        '<block type="bitlogic_lsb">'+
        '<value name="BOOL">' +
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
        '</block>' +
        '</category>' +
        '</category>' +
        '<category id="catLists" colour="'+Blockly.Blocks.lists.HUE+'">' +
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
        '<category id="catVariables" colour="'+Blockly.Blocks.variables.HUE+'" custom="VARIABLE"></category>' +
        '<category id="catFunctions" colour="290" custom="PROCEDURE"></category>' +
        '<sep gap="32"></sep>';

    if (Code.status.modules.pio || Code.status.modules.adc || Code.status.modules.pwm) {
        xml += '<category id="catIO" colour="'+Blockly.Blocks.io.HUE+'">';

        if (Code.status.modules.pio) {
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
        }

        if (Code.status.modules.adc) {
            xml += '<block type="getanalogpin">' +
                '<value name="PIN">' +
                '<shadow type="analog_pins">' +
                '</shadow>' +
                '</value>' +
                '</block>';
                
            if (Code.status.connected) {                
                var units = Blockly.Blocks.io.helper.getExternalAdcUnits();
                
                if (units.length > 0) {
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
                }
            }
        }

        if (Code.status.modules.pwm) {
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
        }
        
        xml += '<block type="output_digital_pin_sel"></block>';
        xml += '<block type="input_digital_pin_sel"></block>';
        xml += '<block type="input_digital_pin_sel"></block>';
        xml += '<block type="pwm_pins_sel"></block>';
        xml += '<block type="analog_pins_sel"></block>';

        xml += '</category>';
    }

    if (Code.status.modules.i2c || Code.status.modules.can) {
        xml += '<category id="catComm" colour="'+Blockly.Blocks.io.HUE+'">';

        if (Code.status.modules.can) {
            xml += '' +
                '<category id="catCan" colour="'+Blockly.Blocks.io.HUE+'">' +
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
        }
        
        if (Code.status.modules.i2c) {
            xml += '' +
                '<category id="catI2C" colour="'+Blockly.Blocks.io.HUE+'">' +
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
        }

        xml += '</category>';
    }

    if (Code.status.modules.sensor) {
        xml += '<category id="catSensor" custom="SENSOR" colour="'+Blockly.Blocks.sensor.HUE+'">';
        xml += '<button function="expand(1)">Expand section</button>';
        xml += '</category>';
    }

    if (Code.status.modules.servo) {
        xml += '<category id="catActuators" colour="'+Blockly.Blocks.actuators.HUE+'">';
        xml += '<category id="catServo" colour="'+Blockly.Blocks.actuators.HUE+'">';
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
    }
    xml += '</category>';

    if (Code.status.modules.net) {
        xml += '<category id="catNET" colour="'+Blockly.Blocks.lora.HUE+'">';
        xml += '<category id="catWIFI" custom="WIFI" colour="'+Blockly.Blocks.lora.HUE+'">';
        xml += '</category>';
        xml += '</category>';
    }

    if (Code.status.modules.lora) {
        xml += '<category id="catLora" custom="LORA" colour="20">';
        xml += '<button function="expand(1)">Expand section</button>';
        xml += '</category>';
    }

    if (Code.status.modules.mqtt) {
        xml += '<category id="catMQTT" custom="MQTT"colour="'+Blockly.Blocks.lora.HUE+'">';
        xml += '<button function="expand(1)">Expand section</button>';
        xml += '</category>';
    }

    xml += '<category id="catSystem" colour="'+Blockly.Blocks.actuators.HUE+'">';
    xml += '</category>';

    Code.lib.get(xml, function(xml) {
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

        if (Code.workspace.type == 'block_editor') {
            toolbox = document.getElementById('block_editortoolbox');
            workSpace = Code.workspace.block_editor;
        } else if (Code.workspace.type == 'blocks') {
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
            var el = document.getElementById('content_' + Code.TABS_[i]);
            if (Code.TABS_[i] == 'program') {
                if (Code.workspace.type == 'blocks') {
                    el = document.getElementById('content_blocks');
                } else if (Code.workspace.type == 'editor') {
                    el = document.getElementById('content_editor');
                } else if (Code.workspace.type == 'block_editor') {
                    el = document.getElementById('content_block_editor');
                }
            }

            var el_tab = el;

            el.style.top = bBox.y + 'px';
            el.style.left = bBox.x + 'px';

            // Height and width need to be set, read back, then set again to
            // compensate for scrollbars.
            el.style.height = bBox.height + 'px';
            el.style.height = (2 * bBox.height - el.offsetHeight - 34) + 'px';
            el.style.width = bBox.width + 'px';
            el.style.width = (2 * bBox.width - el.offsetWidth) + 'px';

            el = document.getElementById('languageDiv');

            var bBox2 = Code.getBBox_(el);

            el.style.position = 'absolute';
            el.style.height = '38px';
            el.style.width = bBox2.width + 'px';
            el.style.top = (bBox.y - 38) + 'px';
            el.style.left = (bBox.width - bBox.x - bBox2.width - 10) + 'px';
            el.style.visibility = 'visible';

            var el = document.getElementById('boardConsole');
            el.style.top = el_tab.style.top;
            el.style.left = (parseInt(el_tab.style.width.replace("px", "")) - 600) + 'px';

            var el = document.getElementById('cloudConsole');
            el.style.top = el_tab.style.top;
            el.style.left = (parseInt(el_tab.style.width.replace("px", "")) - 800) + 'px';
        }
    };

    window.addEventListener('resize', onresize, false);

    var toolbox = document.getElementById('toolbox');
    var block_editortoolbox = document.getElementById('block_editortoolbox');
    var block_editortoolboxpreview = document.getElementById('block_editortoolboxpreview');

    Code.workspace.blocks = Blockly.inject('content_blocks', {
        /*
        grid: {
            spacing: 25,
            length: 3,
            colour: '#ccc',
            snap: true
        },*/
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
    Code.storage.board = new Storage(StorageType.Board);
    Code.storage.local = new Storage(StorageType.Computer);
    Code.storage.cloud = new Storage(StorageType.Cloud);

    // Add to reserved word list: Local variables in execution environment (runJS)
    // and the infinite loop detection function.

    Code.loadBlocks('');

    onresize();
    Blockly.svgResize(Code.workspace.blocks);

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

    Code.bindClick('trashButton',
        function() {
            Code.discard();
            Code.renderContent();
        });

    if (jQuery("#developerMode").length > 0) {
        jQuery("#developerMode").removeClass("disabled");
        Code.bindClick('developerMode', Code.developerMode);
    }

    if (jQuery("#blockEditorButton").length > 0) {
        jQuery("#blockEditorButton").removeClass("disabled");
        Code.bindClick('blockEditorButton', Code.blockEditor);
    }

    if (jQuery("#previewButton").length > 0) {
        jQuery("#previewButton").removeClass("disabled");
        Code.bindClick('previewButton', Code.previewCode);
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

    if (jQuery("#developerMode").length > 0) {
        document.getElementById('developerMode').title = MSG['developerMode'];
    }

    document.getElementById('switchToBlocks').title = MSG['switchToBlocksTooltip'];
    document.getElementById('switchToCode').title = MSG['switchToCodeTooltip'];
    document.getElementById('loadButton').title = MSG['loadButtonTooltip'];
    document.getElementById('saveButton').title = MSG['saveButtonTooltip'];
    document.getElementById('saveAsButton').title = MSG['saveAsButtonTooltip'];
    document.getElementById('rebootButton').title = MSG['rebootButtonTooltip'];
    document.getElementById('stopButton').title = MSG['stopButtonTooltip'];
    document.getElementById('runButton').title = MSG['runTooltip'];
    document.getElementById('trashButton').title = MSG['trashTooltip'];

    if (jQuery("#blockEditorButton").length > 0) {
        document.getElementById('blockEditorButton').title = MSG['blockEditorTooltip'];
    }
    
    if (jQuery("#developerMode").length > 0) {
        document.getElementById('previewButton').title = MSG['previewButtonTooltip'];

        if (Blockly.Lua.developerMode) {
            document.getElementById('developerMode').title = MSG['developerModeTooltipOff'];
        } else {
            document.getElementById('developerMode').title = MSG['developerModeTooltipOn'];            
        }
    }

    var categories = [];

    if (Code.status.modules.pio || Code.status.modules.adc || Code.status.modules.pwm) {
        categories.push('catIO');
    }

    //if (Code.status.modules.pwm) categories.push('catIOPwm');

    if (Code.status.modules.sensor) {
        categories.push('catSensor');
    }

    categories.push('catActuators');
    categories.push('catServo');

    if (Code.status.modules.i2c || Code.status.modules.can) {
        categories.push('catComm');
    }


    if (Code.status.modules.i2c) categories.push('catI2C');
    if (Code.status.modules.can) categories.push('catCan');
    if (Code.status.modules.lora) categories.push('catLora');
    
    //if (Code.status.modules.lora) categories.push('catLoraOTAA');
    //if (Code.status.modules.lora) categories.push('catLoraABP');

    //if (Code.status.modules.tft) {
    //    categories.push('catTFT');
    //}

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
    categories.push('catOperatorsBitwise');
    categories.push('catExceptions');
    categories.push('catEvents');
    categories.push('catDelays');

    categories.push('catLogic');
    categories.push('catLoops');
    categories.push('catLists');
    categories.push('catVariables');
    categories.push('catFunctions');
    
    categories.push('catSystem');
    
    for (var i = 0, cat; cat = categories[i]; i++) {
        try {
            document.getElementById(cat).setAttribute('name', MSG[cat]);
        } catch (error) {}
    }
    var textVars = document.getElementsByClassName('textVar');
    for (var i = 0, textVar; textVar = textVars[i]; i++) {
        textVar.textContent = MSG['textVariable'];
    }
    var listVars = document.getElementsByClassName('listVar');
    for (var i = 0, listVar; listVar = listVars[i]; i++) {
        listVar.textContent = MSG['listVariable'];
    }
};

Code.discard = function() {
    if (Code.workspace.type == 'blocks') {
        var count = Code.workspace.blocks.getAllBlocks().length;

        if (count > 0) {
            bootbox.confirm(Blockly.Msg.DELETE_ALL_BLOCKS.replace('%1', count),
                function(result) {
                    if (result) {
                        Code.workspace.blocks.clear();
                        Code.setDefaultStorage();
                        Code.tabRefresh();
                    }
                });
        }
    } else if (Code.workspace.type == 'editor') {
        bootbox.confirm(MSG['DELETE_EDIT_CODE'],
            function(result) {
                if (result) {
                    Code.workspace.editor.setValue("", -1);
                    Code.setDefaultStorage();
                    Code.tabRefresh();
                }
            });
    }
};

Code.runtimeError = function(file, line, code, message) {
    Code.showError(MSG['runtimeError'], MSG['youHaveAnError'] + '<br><br>' + message, function() {});
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
    
    if (Code.cloud) {
        //Code.cloud.Disconnect();
        //Code.cloud = null;
        
        //Status.show("cloudConsoleOff");
    }

    function run() {
        var cloud = null;
        
        if (Blockly.Lua.usesMQTT(Code.workspace.blocks)) {
            //Status.show("cloudConsoleOn");
            
            //var MQTT = Blockly.mainWorkspace.MQTT;
            
            //Code.cloud = new Cloud("mqtt", MQTT.username, MQTT.password);
            //Code.cloud.Connect();        
        }
        
        Code.showProgress(MSG['sendingCode']);
        Code.agent.send({
            command: "boardRunProgram",
            arguments: {
                path: "/_run.lua",
                code: btoa(code)
            }
        }, function(id, info) {
            Code.hideProgress();
        });
    }

    var file = Code.getCurrentFullPath();
    var fileExtension = /(?:\.([^.]+))?$/.exec(file)[1];
    if (typeof fileExtension == "undefined") {
        Code.saveAs(run);
    } else {
        run();
    }
}

Code.removeFile = function(storage, path, entry, id, callback) {
    var file = Code.getPathFor(path, entry);
    var extension = /(?:\.([^.]+))?$/.exec(file)[1];

    if (extension == 'xml') {
        Code.workspace.type = "blocks";
    } else if (extension == 'lua') {
        Code.workspace.type = "editor";
    } else {
        return;
    }

    if (storage == StorageType.Board) {
        Code.storage.board.remove(file, function(success) {
            callback(success);                
        });
    } else if (storage == StorageType.Computer) {
        Code.storage.local.remove(file, function(success) {
            callback(success);                
        });
    } else if (storage == StorageType.Cloud) {
        Code.storage.cloud.remove(id, function(success) {
            callback(success);                
        });
    }
}

Code.loadFile = function(storage, path, entry, id) {
    var file = Code.getPathFor(path, entry);
    var extension = /(?:\.([^.]+))?$/.exec(file)[1];

    if (extension == 'xml') {
        Code.workspace.type = "blocks";
    } else if (extension == 'lua') {
        Code.workspace.type = "editor";
    } else {
        return;
    }

    function fileDownloaded(fileContent) {
        Code.closeDialogs();
        
        if (Code.workspace.type == 'blocks') {
            var xml = Blockly.Xml.textToDom(fileContent);
            xml = Code.workspace.blocks.migrate(xml);
            Code.workspace.blocks.clear();
            Blockly.Xml.domToWorkspace(xml, Code.workspace.blocks);
            Blockly.resizeSvgContents(Code.workspace.blocks);
        } else {
            Code.workspace.editor.setValue(fileContent, -1);
        }

        Code.setCurrentStorage(storage, path, entry, id);

        Code.tabRefresh();
        Code.renderContent();
        
        Code.workspace.blocks.scrollCenter();
    }

    Code.showProgress(MSG['downloadingFile'] + " " + file + " ...");
    if (storage == StorageType.Board) {
        Code.storage.board.load(file, function(fileContent) {
            fileDownloaded(fileContent);
        });
    } else if (storage == StorageType.Computer) {
        Code.storage.local.load(file, function(fileContent) {
            fileDownloaded(fileContent);
        });
    } else if (storage == StorageType.Cloud) {
        Code.storage.cloud.load(id, function(fileContent) {
            fileDownloaded(fileContent);
        });
    }
}

Code.saveFile = function(storage, folder, file, id, content, callback) {
    var fileName;

    if (typeof folder == "undefined") {
        fileName = file;
    } else {
        fileName = Code.getPathFor(folder, file);
    }

    function fileSaved() {
        Code.setCurrentStorage(storage, folder, file, id);

        Code.hideProgress();
        Code.tabRefresh();

        if (typeof callback == "function") {
            callback();
        }
    };

    Code.showProgress(MSG['sendingFile'] + " " + fileName + " ...");

    if (storage == StorageType.Board) {
        Code.storage.board.save(fileName, id, content, function() {
            fileSaved();
        });
    } else if (storage == StorageType.Computer) {
        Code.storage.local.save(fileName, id, content, function() {
            fileSaved();
        });
    } else if (storage == StorageType.Cloud) {
        Code.storage.cloud.save(file, id, content, function() {
            fileSaved();
        });
    }
}

Code.loadExample = function(file) {
    function fileDownloaded(fileContent) {
        Code.closeDialogs();
        
        Code.workspace.type == 'blocks';
        
        // Discard all blocks
        Code.workspace.blocks.clear();
        Code.setDefaultStorage();
        Code.tabRefresh();
        
        // Load
        var xml = Blockly.Xml.textToDom(fileContent);
        xml = Code.workspace.blocks.migrate(xml);
        Code.workspace.blocks.clear();
        Blockly.Xml.domToWorkspace(xml, Code.workspace.blocks);
        Blockly.resizeSvgContents(Code.workspace.blocks);

        Code.tabRefresh();
        Code.renderContent();
        Code.workspace.blocks.scrollCenter();
    }

    Code.storage.cloud.load(btoa(file), function(fileContent) {
        fileDownloaded(fileContent);
    });
}

Code.load = function() {
    function storageSelected(storage) {
        jQuery("#selectedStorage").val(storage);
        jQuery("#selectedId").val("");
    }

    function folderSelected(folder, id) {
        jQuery("#selectedFileName").val("");
        jQuery("#selectedId").val(id);
    }

    function fileSelected(folder, file, id) {
        folderSelected(folder);
        jQuery("#selectedId").val(id);

        Code.loadFile(jQuery("#selectedStorage").val(), folder, file, id);
    }

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

    bootbox.dialog({
        title: MSG['loadBlockTitle'],
        message: '<div id="loadFile" style="position: relative; left: -25px;overflow: auto;width:100%;height:' + (bBox.height * 0.50) + 'px;"></div>' +
            '<input type="hidden" id="selectedFolder" value="">' +
            '<input type="hidden" id="selectedStorage" value="">' +
            '<input type="hidden" id="selectedId" value="">' +
            '<input type="hidden" id="selectedFileName" value="">',
        buttons: {
            danger: {
                label: MSG['cancel'],
                className: "btn-default",
                callback: function() {}
            },
        },
        closable: false,
        onEscape: true
    });

    Code.listDirectories(jQuery('#loadFile'), extension, storageSelected, folderSelected, fileSelected);
};

Code.stop = function() {
    Blockly.mainWorkspace.removeStarts();
    
    if (Code.cloud) {
        Status.show("cloudConsoleOff");

        Code.cloud.Disconnect();
        Code.cloud = null;
    }
    
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
        var section = jQuery("#content_block_editor_code_section").val();
        
        for (var block in Code.lib.def.blocks) {
            if (Code.lib.def.blocks[block].spec.type == type) {
                var rootBlock = FactoryUtils.getRootBlock(BlockFactory.mainWorkspace);
                
                var xmlSpec = btoa(Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(BlockFactory.mainWorkspace)));
                var jsonSpec = JSON.parse(FactoryUtils.getBlockDefinition(type, rootBlock, 'JSON', BlockFactory.mainWorkspace));
    
                code = btoa(Code.workspace.block_editorCode.getValue());

                Code.lib.def.blocks[block].code[section] = code;
                Code.lib.def.blocks[block].xmlSpec = xmlSpec;
                Code.lib.def.blocks[block].spec = jsonSpec;
                
                Code.lib.def.blocks[block].whatcher = (rootBlock.getFieldValue('WHATCHER') == "TRUE");
                
                if (Code.lib.def.blocks[block].spec.message0 == "") {
                    Code.lib.def.blocks[block].msg.en = {"message0": Code.lib.def.blocks[block].spec.message0};                    
                    Code.lib.def.blocks[block].msg.ca = {"message0": Code.lib.def.blocks[block].spec.message0};
                    Code.lib.def.blocks[block].msg.es = {"message0": Code.lib.def.blocks[block].spec.message0};
                }
                  
                var contentsBlock = rootBlock.getInputTargetBlock('INPUTS');
                
                while (contentsBlock) {
                  if (contentsBlock.type == "input_value") {
                      if (contentsBlock.getFieldValue("SHADOW") == "TRUE") {
                          Code.lib.def.blocks[block].shadow[contentsBlock.getFieldValue("INPUTNAME")] = {
                              "value": "0",
                              "name": "NUM",
                              "type": "math_number"                              
                          };                    
                      }
                      
                      Code.lib.def.blocks[block].subtype[contentsBlock.getFieldValue("INPUTNAME")] = contentsBlock.getFieldValue("SUBTYPE");
                  }
                  
                  contentsBlock = contentsBlock.nextConnection &&
                      contentsBlock.nextConnection.targetBlock();
                }
                
                Code.lib.update();
                break;
            }
        }

        return;
    }

    function storageSelected(storage) {
        jQuery("#selectedStorage").val(storage);
        jQuery("#selectedId").val("");

        Code.renderStorage(storage, "/", jQuery("#storageType"));

        jQuery("#selectedFileName").focus();
    }

    function folderSelected(folder, id) {
        var storage = jQuery("#selectedStorage").val();

        jQuery("#selectedFolder").text(folder);
        jQuery("#selectedFolder").val(folder);

        jQuery("#selectedFileName").val("");
        jQuery("#selectedId").val(id);
        jQuery("#selectedFileName").focus();

        Code.renderStorage(storage, folder, jQuery("#storageType"));
    }

    function fileSelected(folder, file, id) {
        var fileExtension = /(?:\.([^.]+))?$/.exec(file)[1];
        file = file.replace("." + fileExtension, "");

        var storage = jQuery("#selectedStorage").val();

        folderSelected(folder);

        jQuery("#selectedFileName").val(file);
        jQuery("#selectedFileName").focus();
        jQuery("#selectedId").val(id);
    }

    var file = Code.getCurrentFullPath();
    var fileExtension = /(?:\.([^.]+))?$/.exec(file)[1];
    if (typeof fileExtension != "undefined") {
        Code.saveFile(Code.currentFile.storage, undefined, file, Code.currentFile.id, code);
    } else {
        file = Code.getPathFor("", "unnamed." + extension);
        bootbox.dialog({
            title: MSG['saveBlockTitle'],
            message: '<div id="saveFile" style="position: relative; left: -25px;overflow: auto;width:100%;height:' + (bBox.height * 0.50) + 'px;"></div><br>' +
                MSG['saveAs'] + '&nbsp;&nbsp;<span id="storageType"></span>' +
                '<input type="hidden" id="selectedFolder" value="/"></input><input type="hidden" id="selectedStorage" value="0">' +
                '<input type="hidden" id="selectedId" value="">' +
                '<input type="text" id="selectedFileName" value="">' + '.' + extension,
            buttons: {
                danger: {
                    label: MSG['cancel'],
                    className: "btn-default",
                    callback: function() {}
                },
                main: {
                    label: MSG['save'],
                    className: "btn-primary",
                    callback: function() {
                        var file = jQuery("#selectedFileName").val();
                        if (file != "") {
                            Code.saveFile(jQuery("#selectedStorage").val(), jQuery("#selectedFolder").val(), file + '.' + extension, jQuery("#selectedId").val(), code);
                        } else {
                            return false;
                        }
                    }
                },
            },
            closable: false,
            onEscape: true
        });

        storageSelected(Code.defaultStorage());
        Code.listDirectories(jQuery('#saveFile'), extension, storageSelected, folderSelected, fileSelected);
    }
};

Code.saveAs = function(callback) {
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

    function storageSelected(storage) {
        jQuery("#selectedStorage").val(storage);
        jQuery("#selectedId").val("");

        Code.renderStorage(storage, "/", jQuery("#storageType"));

        jQuery("#selectedFileName").focus();
    }

    function folderSelected(folder, id) {
        var storage = jQuery("#selectedStorage").val();

        jQuery("#selectedFolder").text(folder);
        jQuery("#selectedFolder").val(folder);

        jQuery("#selectedFileName").val("");
        jQuery("#selectedFileName").focus();
        jQuery("#selectedId").val(id);

        Code.renderStorage(storage, folder, jQuery("#storageType"));
    }

    function fileSelected(folder, file, id) {
        var fileExtension = /(?:\.([^.]+))?$/.exec(file)[1];
        file = file.replace("." + fileExtension, "");

        var storage = jQuery("#selectedStorage").val();

        folderSelected(folder);

        jQuery("#selectedFileName").val(file);
        jQuery("#selectedFileName").focus();
        jQuery("#selectedId").val(id);
    }

    bootbox.dialog({
        title: MSG['saveBlockTitle'],
        message: '<div id="saveFile" style="position: relative; left: -25px;overflow: auto;width:100%;height:' + (bBox.height * 0.50) + 'px;"></div><br>' +
            MSG['saveAs'] + '&nbsp;&nbsp;<span id="storageType"></span>' +
            '<input type="hidden" id="selectedFolder" value="/"></input><input type="hidden" id="selectedStorage" value="0">' +
            '<input type="hidden" id="selectedId" value="">' +
            '<input type="text" id="selectedFileName" value="">' + '.' + extension,
        buttons: {
            danger: {
                label: MSG['cancel'],
                className: "btn-default",
                callback: function() {}
            },
            main: {
                label: MSG['save'],
                className: "btn-primary",
                callback: function() {
                    var file = jQuery("#selectedFileName").val();
                    if (file != "") {
                        Code.saveFile(jQuery("#selectedStorage").val(), jQuery("#selectedFolder").val(), file + '.' + extension, jQuery("#selectedId").val(), code, callback);
                    } else {
                        return false;
                    }
                }
            },
        },
        closable: false,
        onEscape: true
    });

    storageSelected(Code.defaultStorage());
    Code.listDirectories(jQuery('#saveFile'), extension, storageSelected, folderSelected, fileSelected);
};

// Progress messages
Code.showProgress = function(title) {
    Code.closeDialogs();

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
    Code.closeDialogs();
}

// Information messages
Code.showInformation = function(text) {
    Code.closeDialogs();

    setTimeout(function() {
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
    }, 500);
}

Code.closeDialogs = function() {
    BootstrapDialog.closeAll();
    bootbox.hideAll();
    Code.Help.closeAll();
}

// Alert messages
Code.showAlert = function(text) {
    Code.closeDialogs();

    BootstrapDialog.show({
        message: text,
        title: MSG['alert'],
        closable: true,
        onshow: function(dialogRef) {
            setTimeout(function() {
                jQuery(".btn-alert-instructions").unbind("click").bind("click", function(e) {
                    dialogRef.close();

                    var target = jQuery(e.target);

                    if (typeof require != "undefined") {
                        if (typeof require('nw.gui') != "undefined") {
                            Code.Help.show("alerts", target.data("url"));
                        } else {
                            Code.Help.show("alerts", target.data("url"));
                        }
                    } else {
                        Code.Help.show("alerts", target.data("url"));
                    }
                });
            }, 500);
        }
    });
}

Code.showError = function(title, err, callback) {
    Code.closeDialogs();

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

Code.newFirmwareInfo = function() {
    Code.closeDialogs();

    bootbox.dialog({
        message: MSG['newFirmwareInstructions'],
        title: MSG['alert'],
        buttons: {
            success: {
                label: MSG['upgrade'],
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
        },
        closable: false,
        onEscape: true
    });
}

Code.newFirmwareWarning = function(info, msg) {
    if (typeof msg[Code.settings.language] == "undefined") {
        msg = msg.en;
    } else {
        msg = msg[Code.settings.language];
    }
    
    bootbox.dialog({
        message: msg,
        buttons: {
            danger: {
                label: MSG['notNow'],
                className: "btn-default",
                callback: function() {
                    Code.checkNewFirmwareVersion = false;
                }
            },
            success: {
                label: MSG['installNow'],
                className: "btn-primary",
                callback: function() {
                    setTimeout(Code.newFirmwareInfo, 500);                    
                }
            },
        },
        closable: false,
        onEscape: true
    });        
}

Code.newFirmwareOk = function(info) {
    Code.closeDialogs();
    
    bootbox.dialog({
        message: MSG['newFirmware'],
        buttons: {
            danger: {
                label: MSG['notNow'],
                className: "btn-default",
                callback: function() {
                    Code.checkNewFirmwareVersion = false;
                }
            },
            success: {
                label: MSG['installNow'],
                className: "btn-primary",
                callback: function() {
                    setTimeout(Code.newFirmwareInfo, 500);                    
                }
            },
        },
        closable: false,
        onEscape: true
    });    
}

Code.newFirmware = function(info) {
    if (!Code.checkNewFirmwareVersion) return;
    
    var firmware = "";

    if (info.info.brand != "") {
        firmware = info.info.brand + "-";
    }
    
    firmware = firmware + info.info.board;

    if (info.info.subtype != "") {
        firmware = firmware + '-' + info.info.subtype;
    }
    
    jQuery.ajax({
        url: Code.server + "?firmwareCheck&firmware=" + firmware + "&commit=" + info.info.commit,
        success: function(result) {
            if (result.status == "refuse") {
                return;
            } else if (result.status == "warning") {
                Code.newFirmwareWarning(info, result.msg);
            } else if (result.status == "ok") {
                Code.newFirmwareOk(info);
            }
        },
        error: function(error) {
            console.log(error);
        }
    });    
}

Code.listDirectoriesUpdate = function(container, storage, path, entries, extension) {
    var html = '';

    html += '<ul class="dir-entry">';

    entries.forEach(function(entry) {
        var include = true;

        if (typeof extension != "undefined") {
            include = entry.name.match(new RegExp('^.*\.' + extension + '$')) || (entry.type == "d");
        }

        if (include) {
            var icon = "icon-file-text2";
            var entryPath = path;
            var entryId = "";

            if (typeof entry.id != "undefined") {
                entryId = entry.id;
            } else {
                entryId = "";
            }

            if (entry.type == "d") {
                icon = "icon-folder2";

                if (path != "") {
                    entryPath += "/";
                }

                entryPath += entry.name;
            }

            html = html +
                  '<li class="dir-entry-' + entry.type + '" data-expanded="false" data-type="' + 
                   entry.type + '" data-id="' + entryId + '" data-path="' + entryPath + '" data-name="' + entry.name + '" data-storage="' + storage + '">' +
                  '<span data-type="' + entry.type + '" class="icon ' + icon + '"></span><span class="dir-label">' + entry.name + '</span>' +
                  '</li>';
        }
    });

    html += '</ul>';

    container.append(html);
}

Code.listDirectories = function(container, extension, storageSelectedCallback, folderSelectedCallback, fileSelectedCallback) {
    var html = '';

    html += '<ul class="dir-entry">';

    html += '<li class="dir-entry-d" data-expanded="false" data-type="r" data-id data-path data-name data-storage="' + StorageType.Board + '"><span class="icon icon-chip"></span><span class="dir-label">Board</span></li>';
    html += '<li class="dir-entry-d" data-expanded="false" data-type="r" data-id data-path data-name data-storage="' + StorageType.Computer + '"><span class="icon icon-display"></span><span class="dir-label">Computer</span></li>';
    html += '<li class="dir-entry-d" data-expanded="false" data-type="r" data-id data-path data-name data-storage="' + StorageType.Cloud + '"><span class="icon icon-cloud"></span><span class="dir-label">Cloud</span></li>';

    html += '</ul>';

    container.append(html);
    window.dispatchEvent(new Event('resize'));

    container.find('.dir-entry-d, .dir-entry-f').unbind().bind('click', function(e) {
        var target = jQuery(e.target);

        if (target.prop("tagName") != 'LI') {
            target = target.closest("li");
        }

        var type = target.attr('data-type');
        var storage = target.attr('data-storage');
        var expanded = target.attr('data-expanded');
        var path = target.attr('data-path');
        var entry = target.attr('data-name');
        var id = target.attr('data-id');

        path = path.replace(/[\\\/]+/g, '/');
        if (path.charAt(0) != "/") {
            path = "/" + path;
        }

        if (path.charAt(path.length - 1) != "/") {
            path = path + "/";
        }

        jQuery(".dir-entry-d[data-type='r']").each(function(index, value) {
            var rTarget = jQuery(value);
            
            if (!jQuery.contains(value, e.target)) {
                rTarget.find("ul").empty();
                rTarget.attr("data-expanded", "false");
            }
        });

        if ((type == 'r') || (type == 'd')) {
            if (expanded == "true") {
                target.find("ul").empty();
                target.attr("data-expanded", "false");
            } else {
                target.attr("data-expanded", "true");
            }

            if (expanded == "false") {
                if (storage == StorageType.Board) {
                    Code.storage.board.listDirectories(path, function(entries) {
                        Code.listDirectoriesUpdate(target, storage, path, entries, extension);

                        jQuery('.dir-entry-d[data-expanded="true"]').find("span[data-type='d']").removeClass("icon-folder2").addClass("icon-folder-open");
                        jQuery('.dir-entry-d[data-expanded="false"]').find("span[data-type='d']").removeClass("icon-folder-open").addClass("icon-folder2");

                        if (typeof storageSelectedCallback != "undefined") {
                            storageSelectedCallback(storage);
                        }

                        if (typeof folderSelectedCallback != "undefined") {
                            folderSelectedCallback(path, id);
                        }
                    });
                } else if (storage == StorageType.Computer) {
                    Code.storage.local.listDirectories(path, function(entries) {
                        Code.listDirectoriesUpdate(target, storage, path, entries, extension);

                        jQuery('.dir-entry-d[data-expanded="true"]').find("span[data-type='d']").removeClass("icon-folder2").addClass("icon-folder-open");
                        jQuery('.dir-entry-d[data-expanded="false"]').find("span[data-type='d']").removeClass("icon-folder-open").addClass("icon-folder2");

                        if (typeof storageSelectedCallback != "undefined") {
                            storageSelectedCallback(storage);
                        }

                        if (typeof folderSelectedCallback != "undefined") {
                            folderSelectedCallback(path, id);
                        }
                    });
                } else if (storage == StorageType.Cloud) {
                    Code.storage.cloud.listDirectories(id, function(entries) {
                        Code.listDirectoriesUpdate(target, storage, path, entries, extension);

                        jQuery('.dir-entry-d[data-expanded="true"]').find("span[data-type='d']").removeClass("icon-folder2").addClass("icon-folder-open");
                        jQuery('.dir-entry-d[data-expanded="false"]').find("span[data-type='d']").removeClass("icon-folder-open").addClass("icon-folder2");

                        if (typeof storageSelectedCallback != "undefined") {
                            storageSelectedCallback(storage);
                        }

                        if (typeof folderSelectedCallback != "undefined") {
                            folderSelectedCallback(path, id);
                        }
                    });
                }
            } else {
                if (storage == StorageType.Board) {
                    if (typeof storageSelectedCallback != "undefined") {
                        storageSelectedCallback(storage);
                    }

                    if (typeof folderSelectedCallback != "undefined") {
                        folderSelectedCallback(path, id);
                    }
                } else if (storage == StorageType.Computer) {
                    if (typeof storageSelectedCallback != "undefined") {
                        storageSelectedCallback(storage);
                    }

                    if (typeof folderSelectedCallback != "undefined") {
                        folderSelectedCallback(path, id);
                    }
                } else if (storage == StorageType.Cloud) {
                    if (typeof storageSelectedCallback != "undefined") {
                        storageSelectedCallback(storage);
                    }

                    if (typeof folderSelectedCallback != "undefined") {
                        folderSelectedCallback(path, id);
                    }
                }
            }
        } else if (type == "f") {
            if (typeof storageSelectedCallback != "undefined") {
                storageSelectedCallback(storage);
            }

            if (typeof fileSelectedCallback != "undefined") {
                fileSelectedCallback(path, entry, id);
            }
        }

        e.stopPropagation();
    });
    
    jQuery.contextMenu({
        selector: ".dir-entry-f",
        items: {
            remove: {name: Blockly.Msg.DELETE_FILE, callback: function(key, opt) { 
                var target = jQuery(this);
                var result;
                
                var id = target.attr("data-id");
                var path = target.attr("data-path");
                var entry = target.attr("data-name");
                var storage = target.attr("data-storage");
                
                bootbox.confirm(Blockly.Msg.DELETE_FILE_CONFIRM.replace('%1', entry), function(result) {
                    if (result) {
                        Code.removeFile(storage, path, entry, id, function(success) {
                            if (success) {
                                Code.showInformation(Blockly.Msg.FILE_DELETED.replace('%1', entry));        
                            }
                        });                        
                    } else {
                        setTimeout(function() {
                            jQuery("body").addClass("modal-open");
                        }, 500);
                    }
                });                
            }}
        }
    });
};

Code.tabRefresh = function() {
    if (Code.workspace.type == 'blocks') {
        jQuery("#blockEditorButton, #previewButton, #developerMode, #switchToCode, #trashButton, #loadButton, #saveButton,  #saveAsButton, #rebootButton, #stopButton, #runButton").removeClass("disabled");
        jQuery("#switchToBlocks").addClass("disabled");
    } else if (Code.workspace.type == 'editor') {
        jQuery("#switchToBlocks, #trashButton, #loadButton, #saveButton, #saveAsButton, #rebootButton, #stopButton, #runButton").removeClass("disabled");        
        jQuery("#developerMode,#previewButton, #blockEditorButton, #switchToCode").addClass("disabled");
    } else if (Code.workspace.type == 'block_editor') {
        jQuery("#blockEditorButton, #saveButton").removeClass("disabled");
        jQuery("#trashButton, #loadButton, #previewButton, #developerMode, #switchToCode, #switchToBlocks, #saveAsButton, #rebootButton, #stopButton, #runButton").addClass("disabled");
    }

    if (!Code.status.connected) {
        jQuery("#loadButton, #saveButton, #saveAsButton, #stopButton, #runButton, #rebootButton").addClass("disabled");
    } else {
        if (Code.workspace.type != 'block_editor') {
            jQuery("#stopButton, #runButton, #rebootButton").removeClass("disabled");
        }
    }

    if (Code.showCode) {
        jQuery("#developerMode").removeClass("disabled");
        jQuery("#previewButton").removeClass("disabled");
        jQuery("#saveButton").addClass("disabled");
        jQuery("#saveAsButton").addClass("disabled");
        jQuery("#rebootButton").addClass("disabled");
        jQuery("#stopButton").addClass("disabled");
        jQuery("#runButton").addClass("disabled");
        jQuery("#loadButton").addClass("disabled");
        jQuery("#blockEditorButton").addClass("disabled");
        jQuery("#trashButton").addClass("disabled");
        jQuery("#switchToBlocks").addClass("disabled");
        jQuery("#switchToCode").addClass("disabled");
    }
}

Code.developerMode = function() {
    if (jQuery("#developerMode").hasClass("on")) {
        jQuery("#developerMode").removeClass("on");
        jQuery("#developerMode").find(".icon").addClass("off");
        Blockly.Lua.developerMode = false;
    } else {
        jQuery("#developerMode").addClass("on");
        jQuery("#developerMode").find(".icon").removeClass("off");
        Blockly.Lua.developerMode = true;
    }

    Code.workspace.editor.setValue(Blockly.Lua.workspaceToCode(Code.workspace.blocks), -1);
    Code.workspace.editor.focus();
    Code.renderContent();
}

Code.blockEditor = function() {
    if (Code.workspace.type == "block_editor") {
        Code.workspace.type = "blocks"
    } else {
        Code.workspace.type = "block_editor";
    }

    Code.renderContent();
}

Code.previewCode = function() {
    Code.showCode = !Code.showCode;

    if (Code.showCode) {
        Code.workspace.type = "editor";
        Code.workspace.prevType = Code.workspace.type;
        Code.workspace.editor.setValue(Blockly.Lua.workspaceToCode(Code.workspace.blocks), -1);
        Code.workspace.editor.focus();
        Code.renderContent();
    } else {
        Code.workspace.type = "blocks";
        Code.workspace.prevType = Code.workspace.type;
        Code.workspace.editor.setValue("", -1);
        Code.workspace.editor.focus();
        Code.renderContent();
    }
}

Code.switchToCode = function() {
    function doSwitch() {
        Code.setDefaultStorage();
        Code.settings.programmingModel = "lua";
        Settings.save(Code.settings);

        Code.workspace.blocks.clear();

        Code.workspace.type = "editor";
        Code.workspace.prevType = Code.workspace.type;
        Code.workspace.editor.setValue("", -1);
        Code.workspace.editor.focus();
        Code.renderContent();
    }

    bootbox.dialog({
        title: MSG['information'],
        message: MSG['switchToCodeWarning'],
        buttons: {
            danger: {
                label: MSG['no'],
                className: "btn-default",
                callback: function() {}
            },
            success: {
                label: MSG['yes'],
                className: "btn-primary",
                callback: function() {
                    doSwitch();
                }
            },
        },
        closable: false,
        onEscape: true
    });
}

Code.switchToBlocks = function() {
    function doSwitch() {
        Code.setDefaultStorage();
        Code.settings.programmingModel = "blocks";
        Settings.save(Code.settings);

        Code.workspace.blocks.clear();

        Code.workspace.type = "blocks";
        Code.workspace.prevType = Code.workspace.type;
        Code.workspace.editor.setValue("", -1);
        Code.workspace.editor.focus();
        Code.renderContent();
    }

    bootbox.dialog({
        title: MSG['information'],
        message: MSG['switchToBlocksWarning'],
        buttons: {
            danger: {
                label: MSG['no'],
                className: "btn-default",
                callback: function() {}
            },
            success: {
                label: MSG['yes'],
                className: "btn-primary",
                callback: function() {
                    doSwitch();
                }
            },
        },
        closable: false,
        onEscape: true
    });
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
  
    Code.agent.addListener("invalidFirmware", function(id, info) {
        Status.hide();
        Dialog.invalidFirmware();
    });

    Code.agent.addListener("invalidPrerequisites", function(id, info) {
      Blockly.mainWorkspace.removeErrors();
      Blockly.mainWorkspace.removeStarts();
      
      Status.show("Invalid prerequisites");

      Code.status = JSON.parse(JSON.stringify(Code.defaultStatus));
      Code.board.getMaps(Code.settings.board, function(maps) {
          Code.status.maps = maps;
          Code.renderContent();
      });
    });
    
    Code.agent.addListener("boardAttached", function(id, info) {
        if (typeof info.info == "undefined") {
            return;
        }
        
        if (typeof info.info.board == "undefined") {
            return;
        }
        
        Blockly.mainWorkspace.removeErrors();
        Blockly.mainWorkspace.removeStarts();

        Status.hide();

        Code.status = JSON.parse(JSON.stringify(Code.defaultStatus));
        Code.status = info.info;
        Code.settings.board = info.info.board;

        Status.show(Code.board.getDesc(Code.settings.board));

        Code.board.getMaps(Code.settings.board, function(maps) {
            Code.status.maps = maps;

            Code.status.connected = true;
            Code.status.firmware = info.info.os + "-" + info.info.version.replace(" ", "-") + "-" + info.info.build;
            Code.renderContent();            
        });

        if ((Code.agent.version == "") || (Code.agent.version < Code.minAgentVersion)) {
            if (Code.checkNewAgentVersion) {
                Code.showAlert(MSG['pleaseUpgradeAgent']);
            }
            
            Code.checkNewAgentVersion = false;
        } else {
            if (Code.agent.version > 1.2) {
                if (info.newBuild) {
                    Code.newFirmware(info);
                }
            }    
        }
    });

    Code.agent.addListener("boardConsoleOut", function(id, info) {
        Term.write(atob(info.content));
    });

    Code.agent.addListener("attachIde", function(id, info) {
        if (!info.hasOwnProperty("agent-version")) {
            Code.showAlert(MSG['pleaseUpgradeAgent']);
        } else {
            Code.agent.version = parseFloat(info["agent-version"]);

            if (Code.agent.version > 1.2) {
                Code.agent.consoleUpSocketConnect();
                Code.agent.consoleDownSocketConnect();
            }
        }
    });

    Code.agent.addListener("boardDetached", function(id, info) {
        Blockly.mainWorkspace.removeErrors();
        Blockly.mainWorkspace.removeStarts();
        
        Status.show("Connect a board");

        Code.status = JSON.parse(JSON.stringify(Code.defaultStatus));
        Code.board.getMaps(Code.settings.board, function(maps) {
            Code.status.maps = maps;
            Code.renderContent();
        });
    });

    Code.agent.addListener("boardUpgraded", function(id, info) {
        Blockly.mainWorkspace.removeErrors();
        Blockly.mainWorkspace.removeStarts();

        Code.hideProgress();
        Code.tabRefresh();
    });

    Code.agent.addListener("blockStart", function(id, info) {
        if (Code.workspace.type == "blocks") {
            var block = atob(info.block).replace(/\0/g, '');

            var id = Blockly.Lua.numToBlockId(block);
            if (id) {
                var obj = Blockly.mainWorkspace.getBlockById(id);

                if ((obj.type == "cpu_sleep") || (obj.type == "when_board_starts")) {
                    Blockly.mainWorkspace.removeStarts();
                }

                obj.addStart();                
            }
        }
    });

    Code.agent.addListener("blockEnd", function(id, info) {
        if (Code.workspace.type == "blocks") {
            var block = atob(info.block).replace(/\0/g, '');;

            var id = Blockly.Lua.numToBlockId(block);
            if (id) {
                var obj = Blockly.mainWorkspace.getBlockById(id);

                obj.removeStart();
            }
        }
    });

    Code.agent.addListener("blockError", function(id, info) {
        if (Code.workspace.type == "blocks") {
            Blockly.mainWorkspace.removeStarts();
            Blockly.mainWorkspace.removeErrors();

            var block = atob(info.block).replace(/\0/g, '');

            var id = Blockly.Lua.numToBlockId(block);
            if (id) {
                var obj = Blockly.mainWorkspace.getBlockById(Blockly.Lua.numToBlockId(block));
                var error = atob(info.error);

                obj.addError();
                obj.setWarningText("Error: " + error, 2);
            }
        }
    });

    Code.agent.addListener("blockErrorCatched", function(id, info) {
        if (Code.workspace.type == "blocks") {
            Blockly.mainWorkspace.removeStarts();
            Blockly.mainWorkspace.removeErrors();
        }
    });

    Code.agent.addListener("boardUpdate", function(id, info) {
        Blockly.mainWorkspace.removeErrors();
        Blockly.mainWorkspace.removeStarts();

        if (Code.agent.version > 1.2) {
            info.what = atob(info.what);
        }

        Status.show(info.what);
    });

    Code.agent.addListener("boardRuntimeError", function(id, info) {
        info.message = atob(info.message);

        Code.runtimeError(info.where, info.line, info.exception, info.message);
    });

    if (typeof ide_init === "function") {
        ide_init();
    }

    Settings.load(Code.settings);
    Blockly.Blocks.operators = {};

    if (Code.settings.programmingModel == "blocks") {
        Code.workspace.type = "blocks";
    } else if (Code.settings.programmingModel == "lua") {
        Code.workspace.type = "editor";
    }

    Blockly.Blocks.variables.HUE = "#ee7d16";
    Blockly.Blocks.lists.HUE = "#cc5b22";
    Blockly.Blocks.control.HUE = "#e1a91a";
    Blockly.Blocks.events.HUE = "#c88330";
    Blockly.Blocks.sensor.HUE = "#2ca5e2";
    Blockly.Blocks.operators.HUE = "#5cb712";
    Blockly.Blocks.i2c.HUE = Blockly.Blocks.io.HUE;
    Blockly.Blocks.can.HUE = Blockly.Blocks.io.HUE;
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
                Code.Help.get(function() {
                    Code.buildToolBox(function() {
                        Code.init();
                        Term.init();
                        Code.renderContent();
                        Code.agent.controlSocketConnect();
                
                        if (typeof ide_post_init === "function") {
                            ide_post_init();
                        }
                    });
                });
            });
        });
    });
}

window.addEventListener('load', function() {
    $.ajax({
        /* Setup the call */
        xhrFields: {
            withCredentials: true
        }
    });

    Code.Help  = new Help();
    Code.agent = new agent();
    Code.board = new board();
    Code.lib   = new blockLibrary();

    Code.blocklyFactory = null;
    if (typeof require != "undefined") {
        if (typeof require('nw.gui') != "undefined") {
            Code.blocklyFactory = new AppController();
        }
    }

    Code.setup();
});

if (typeof require != "undefined") {
    if (typeof require('nw.gui') != "undefined") {
        var gui = require('nw.gui');
        var win = gui.Window.get();

        win.on('close', function(event) {
            Code.agent.send({
                command: "detachIde",
                arguments: {}
            }, function(id, info) {});

            win.close(true);
        });
    } else {
        appWin.addEventListener('close', function() {
            Code.agent.send({
                command: "detachIde",
                arguments: {}
            }, function(id, info) {});
        });
    }
} else {
    // Send alive message to server at regular intervals for matain the
    // session with server open
    setInterval(function() {
        jQuery.ajax({
            url: Code.server,
            data: {
                alive: ""
            },
            type: "POST",
            success: function(result) {
                result = JSON.parse(result);
            
                if (!result.success) {
                }
                return;
            },
            error: function() {
            }
        });                
    }, 1000 * 60 * 5);
    
    window.addEventListener('close', function() {
        Code.agent.send({
            command: "detachIde",
            arguments: {}
        }, function(id, info) {});
    });
}
