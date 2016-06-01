/**
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

var editor;

/**
 * Create a namespace for the application.
 */
var Code = {};

Code.progressDialog = false;
Code.mode = "blocks";

Code.boardCurrentFile = {
	path: '',
	file: ''
};

Code.blocksCurrentFile = {
	path: '/sd',
	file: 'autorun.lua'
};

Code.editorCurrentFile = {
	path: '/sd',
	file: 'autorun.lua'
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

/**
 * Blockly's main workspace.
 * @type {Blockly.WorkspaceSvg}
 */
Code.workspace = null;

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
    Blockly.Xml.domToWorkspace(xml, Code.workspace);
  } else if (defaultXml) {
    // Load the editor with default starting blocks.
    var xml = Blockly.Xml.textToDom(defaultXml);
    Blockly.Xml.domToWorkspace(xml, Code.workspace);
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
    var xml = Blockly.Xml.workspaceToDom(Code.workspace);
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
 // var luaCode = editor.getValue();

  if (document.getElementById('tab_program').className == 'tabon') {
  	jQuery("#content_editor").css('visibility', 'hidden');
	jQuery(".blocklyWidgetDiv").css('visibility', 'hidden');
	jQuery(".blocklyTooltipDiv").css('visibility', 'hidden');
	jQuery(".blocklyToolboxDiv").css('visibility', 'hidden');
	jQuery("#content_blocks").css('visibility', 'hidden');
	    
	Code.workspace.setVisible(false);		
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
	  
  if (Code.mode == 'blocks') {
	  jQuery("#tab_program").text(MSG['blocks']);
  } else {
	  jQuery("#tab_program").text(MSG['editor']);
  }
 
  Code.renderContent();
  
  //jQuery("#tab_blocks").text(MSG['blocks'] + ' ' + Code.blocksCurrentFile.path + '/' + Code.blocksCurrentFile.file);
  //jQuery("#tab_editor").text(MSG['editor'] + ' ' + Code.editorCurrentFile.path + '/' + Code.editorCurrentFile.file);
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
  	  Code.boardCurrentFile.path = '';
  	  Code.boardCurrentFile.file = '';
	  
//  	  jQuery("#filesystem").append(jQuery('<i class="icon-upload icon-large">'));

	  jQuery("#content_editor").css('visibility', 'hidden');
	  jQuery(".blocklyWidgetDiv").css('visibility', 'hidden');
	  jQuery(".blocklyTooltipDiv").css('visibility', 'hidden');
	  jQuery(".blocklyToolboxDiv").css('visibility', 'hidden');
	  jQuery("#content_blocks").css('visibility', 'hidden');
  
  	  Code.listBoardDirectory();
  	  Code.updateStatus();
  } else if (Code.selected == 'program') {
  	if (Code.mode == 'blocks') {
		jQuery("#content_editor").css('visibility', 'hidden');
		jQuery(".blocklyWidgetDiv").css('visibility', 'visible');
		jQuery(".blocklyTooltipDiv").css('visibility', 'visible');
		jQuery(".blocklyToolboxDiv").css('visibility', 'visible');
		jQuery("#content_blocks").css('visibility', 'visible');

  		Code.workspace.setVisible(true);
		Code.workspaceRefresh();
  //	
    //	  	if (Code.linked) {
    	//  		var xml = '';
    	//  		var code = '';
	
    	  //		Code.workspace.clear();
	
    	  	//	xml = LuaToBlocks.convert(luaCode);

    	  //	    xml = Blockly.Xml.textToDom(xml);
    	 // 	    Blockly.Xml.domToWorkspace(xml, Code.workspace);
  	//
    	  //		Code.workspaceRefresh();
    	 // 	}
  	} else {
		jQuery(".blocklyWidgetDiv").css('visibility', 'hidden');
		jQuery(".blocklyTooltipDiv").css('visibility', 'hidden');
		jQuery(".blocklyToolboxDiv").css('visibility', 'hidden');
		jQuery("#content_blocks").css('visibility', 'hidden');
		jQuery("#content_editor").css('visibility', 'visible');
  	}	
  }

  // Initialize the pane.
  //if (content.id == 'content_editor') {
  //  var code = Blockly.Lua.workspaceToCode(Code.workspace);
	
  //  editor.setValue(code, -1);
    //if (typeof prettyPrintOne == 'function') {
    //  code = content.innerHTML;
    //  code = prettyPrintOne(code, 'lua');
    //  content.innerHTML = code;
    //}
  //}  
  
  Code.workspaceRefresh();
  
  Blockly.fireUiEvent(window, 'resize');
};

/**
 * Initialize Blockly.  Called on page load.
 */
Code.init = function() {
  Code.initLanguage();

  jQuery("#catThreads").attr("colour",Blockly.Blocks.threads.HUE);
  jQuery("#catIO").attr("colour",Blockly.Blocks.io.HUE);
  jQuery("#catControl").attr("colour",Blockly.Blocks.control.HUE);
  
  var rtl = Code.isRtl();
  var container = document.getElementById('content_area');
  var onresize = function(e) {
    var bBox = Code.getBBox_(container);
    for (var i = 0; i < Code.TABS_.length; i++) {
	  var el;
	  if (Code.TABS_[i] == 'program') {
		  if (Code.mode == 'blocks') {
		  	el = document.getElementById('content_blocks');
		  } else {
	  	  	el = document.getElementById('content_editor');	  	
		  }	  	

	      el.style.top = bBox.y + 'px';
	      el.style.left = bBox.x + 'px';
	      // Height and width need to be set, read back, then set again to
	      // compensate for scrollbars.
	      el.style.height = bBox.height + 'px';
	      el.style.height = (2 * bBox.height - el.offsetHeight) + 'px';
	      el.style.width = bBox.width + 'px';
	      el.style.width = (2 * bBox.width - el.offsetWidth) + 'px';
	  }
      
	  el = document.getElementById('content_' + Code.TABS_[i]);
      el.style.top = bBox.y + 'px';
      el.style.left = bBox.x + 'px';
      // Height and width need to be set, read back, then set again to
      // compensate for scrollbars.
      el.style.height = bBox.height + 'px';
      el.style.height = (2 * bBox.height - el.offsetHeight) + 'px';
      el.style.width = bBox.width + 'px';
      el.style.width = (2 * bBox.width - el.offsetWidth) + 'px';
	  
	  el = document.getElementById('logo');
	  el.style.position = 'absolute';
	  el.style.width = '100px';
	  el.style.top = 5 + 'px';
	  el.style.left = (bBox.width - bBox.x - 110) + 'px';	  	  	

	  el = document.getElementById('languageMenu');
	  el.style.position = 'absolute';
	  el.style.width = '100px';
	  el.style.top = (bBox.y - 42) + 'px';
	  el.style.left = (bBox.width - bBox.x - 110) + 'px';	  	  	
    }
    // Make the 'Blocks' tab line up with the toolbox.
    //if (Code.workspace && Code.workspace.toolbox_.width) {
    //  document.getElementById('tab_blocks').style.minWidth =
    //      (Code.workspace.toolbox_.width - 38) + 'px';
          // Account for the 19 pixel margin and on each side.
    //}	
  };
  onresize();
  window.addEventListener('resize', onresize, false);

  var toolbox = document.getElementById('toolbox');
  Code.workspace = Blockly.inject('content_blocks',
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

  // Add to reserved word list: Local variables in execution environment (runJS)
  // and the infinite loop detection function.

  Code.loadBlocks('');

  ace.require("ace/ext/language_tools");
  editor = ace.edit(document.getElementById("content_editor"));
  editor.setShowPrintMargin(true);
  editor.setPrintMarginColumn(120);
  editor.getSession().setMode("ace/mode/lua");
  editor.setOptions({ enableBasicAutocompletion: true });
  editor.$blockScrolling = Infinity;		

  if ('BlocklyStorage' in window) {
    // Hook a save function onto unload.
    BlocklyStorage.backupOnUnload(Code.workspace);
  }

  Code.tabClick(Code.selected);

  Code.bindClick('trashButton',
      function() {Code.discard(); Code.renderContent();});
	  Code.bindClick('switchToCode', Code.switchToCode);
	  Code.bindClick('switchToBlocks', Code.switchToBlocks);
	  Code.bindClick('loadButton', Code.load);
	  Code.bindClick('saveButton', Code.save);
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
  

  document.getElementById('runButton').title = MSG['runTooltip'];
  document.getElementById('trashButton').title = MSG['trashTooltip'];

  var categories = [
	  'catIO','catIODigital','catIOAnalog','catIOPwm','catControl','catThreads','catLogic',
	  'catLoops', 'catMath', 'catText', 'catLists','catColour', 'catVariables', 'catFunctions'
  ];
  
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
};

Code.discard = function() {
	if (Code.selected == 'blocks') {
	    var count = Code.workspace.getAllBlocks().length;
  
	    if (count > 0) {
	  	  bootbox.confirm(Blockly.Msg.DELETE_ALL_BLOCKS.replace('%1', count), 
	  	  function(result) {
	  		  if (result) {
	  			  Code.workspace.clear();
	  		  }
	  	  }); 	  
	    }		
	} else if (Code.selected == 'editor') {
  	  bootbox.confirm(MSG['DELETE_EDIT_CODE'], 
  	  function(result) {
  		  if (result) {
  			  editor.setValue("", -1);		
  		  }
  	  }); 	  
	}
};

Code.run = function() {
	Code.showProgress(MSG['sendingCode']);
	
	var code = "";
    var content = document.getElementById('content_' + Code.selected);
  	var path = "";
		
    if (Code.mode == 'blocks') {
    	code = Blockly.Lua.workspaceToCode(Code.workspace);
		path = Code.blocksCurrentFile.path + '/' + Code.blocksCurrentFile.file
    } else if (Code.mode == 'editor') {
		code = editor.getValue();
		path = Code.editorCurrentFile.path + '/' + Code.editorCurrentFile.file;
	}
	
	Board.run(Board.currentPort(), path, code, 
		function() {
			Code.hideProgress();
		},
		function() {
			Code.hideProgress();			
		}
	);	
}

Code.load = function() {
	function loadFile(fileEntry) {
		if(chrome.runtime.lastError) {
			return;
		}
	   
	    fileEntry.file(function(file) {
	        Code.workspace.clear();
			
			var reader = new FileReader();
	    	reader.onload = function(e) {
			    var xml = Blockly.Xml.textToDom(e.target.result);
			    Blockly.Xml.domToWorkspace(xml, Code.workspace);
				
				Code.workspaceRefresh();
	    	};
	    	reader.readAsText(file);
	    });
	};
	
	var extension = "";
	
	if (Code.mode == 'blocks') {
		extension = "xml";
	} else if (Code.mode == 'editor') {
		extension = "lua";
	}
	
    chrome.fileSystem.chooseEntry({
         type: 'openFile',
         suggestedName: 'untitled.'+ extension,
         accepts: [ { description: extension + ' files (*.' + extension + ')',
                      extensions: [extension]} ],
         acceptsAllTypes: false
    }, loadFile);				
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
	function saveToFile(fileEntry) {
		fileEntry.createWriter(function(fileWriter) {
		      var truncated = false;
		      var blob = new Blob([Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(Code.workspace))]);
		      fileWriter.onwriteend = function(e) {
		        if (!truncated) {
		          truncated = true;
		          // You need to explicitly set the file size to truncate
		          // any content that might have been there before
		          this.truncate(blob.size);
		          return;
		        }
		      };

		      fileWriter.onerror = function(e) {
		      };

		      fileWriter.write(blob, {type: 'text/plain'});

		    });
	}
	
	var extension = "";
	if (Code.selected == 'blocks') {
		extension = "xml";
	} else if (Code.selected == 'editor') {
		extension = "lua";
	}

    chrome.fileSystem.chooseEntry( {
         type: 'saveFile',
         suggestedName: 'untitled.'+ extension,
         accepts: [ { description: extension + ' files (*.' + extension + ')',
                      extensions: [extension]} ],
         acceptsAllTypes: false
       }, saveToFile);
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
	Code.showAlert("Error: " + err);
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
		html += '<th>Item</th>';
		html += '<th>Value</th>';
		html += '</thead>';
		html += '<tbody>';
		html += '<tr><td>Installed firmware</td><td>'+Whitecat.status.firmware+'</td></tr>';
		html += '<tr><td>CPU model</td><td>'+Whitecat.status.cpu+'</td></tr>';
		html += '</tbody>';
		html += '</table>';
		html += '</table>';
		html +='<button id="checkFirmwareButton" type="button" class="btn btn-default" aria-label="Left Align">';
		html += 'Check for firmware updates ...';
		html += '</button>';
		
		container.html(html);	
		
	    Code.bindClick('checkFirmwareButton', Code.checkFirmware);	
	}
}

Code.listBoardDirectory = function(target) {
	var html;

	var container = jQuery('#filesystem');	
	if (!Board.isConnected()) {
		html = '<span style="margin-left: 25px;" class="waitingForBoard"><i class="spinner icon icon-spinner3"></i> ' + MSG['waitingForBoard'] + '</span>';
		container.html(html);	
		
		return;
	}

	if (typeof target != 'undefined') {
		container = target;
	} else {
		container.html('<div style="width: 20px;float: left;margin-left: 45px;"><i class="waiting"></i></div>');			
	}
	
	container.find(".waiting").addClass("spinner");
	container.find(".waiting").addClass("icon");
	container.find(".waiting").addClass("icon-spinner3");
	
	Whitecat.listDirectory(Whitecat.currentPort(), Code.boardCurrentFile.path, 
		function(entries) {
			var html = '<ul class="dir-entry list-unstyled">';

			container.find("[data-path='"+Code.boardCurrentFile.path+"']").remove();
			
			container.find(".waiting").removeClass("spinner");
			container.find(".waiting").removeClass("icon");
			container.find(".waiting").removeClass("icon-spinner3");
			
			entries.forEach(function(entry) {
			   html = html + '<li class="dir-entry-'+entry.type+'" data-expanded="false" data-path="' + Code.boardCurrentFile.path + '" data-name="' + entry.name + '" data-type="' + entry.type + '"><div style="width: 20px;float: left;"><i class="waiting"></i></div><i class="status"></i><span class="entryName">' + entry.name + '</span></li>'
			});

			html = html + '</ul>';
			container.append(html);
			
			var expanded = container.attr('data-expanded');
			if (expanded == "true") {
				container.find(".status:first").removeClass("icon-folder2");
				container.find(".status:first").addClass("icon-folder-open");
			} else {
				container.find(".status:first").addClass("icon-folder2");
				container.find(".status:first").removeClass("icon-folder-open");				
			}

			container.find(".dir-entry-d").find(".status").addClass("icon");
			container.find(".dir-entry-d").find(".status").addClass("icon-folder2");

			container.find(".dir-entry-f").find(".status").addClass("icon");
			container.find(".dir-entry-f").find(".status").addClass("icon-file-text2");
			
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
				  } else {
				  	  target.attr('data-expanded','true');
					  Code.boardCurrentFile.path = path + '/' + entry;
				  	  Code.listBoardDirectory(target);
				  }
			  } else {
				  Code.boardCurrentFile.path = path;
				  Code.boardCurrentFile.file = entry;				  		
				  Code.editorCurrentFile.path = path;
				  Code.editorCurrentFile.file = entry;				  		
				  Code.showProgress(MSG['downloadingFile'] + " " + path + '/' + entry + " ...");
				  Whitecat.receiveFile(Whitecat.currentPort(), path + '/' + entry, function(file) {
					Code.hideProgress();
				    editor.setValue(file, -1);	
					Code.mode = "editor";
					Code.tabClick("program");
				    Code.workspaceRefresh();  
				});	  	
			  }

			  e.stopPropagation();
			});
  	    },
		function(err) {
			Code.showError(err);
		}	
	);
}

Code.workspaceRefresh = function() {
	//if (Code.mode == 'blocks') {
	//	if (Code.linked) {
	//		editor.setValue(Blockly.Lua.workspaceToCode(Code.workspace), -1);	
	//	}
	//	Code.editorCurrentFile = Code.blocksCurrentFile;
	//} else if (Code.selected == 'code') {
	//	editor.focus();
	//	
	  //	var count = Code.workspace.getAllBlocks().length;
	
		//if (count > 0) {
		//	if (Code.linked) {
		//		editor.setValue(Blockly.Lua.workspaceToCode(Code.workspace), -1);	
		//	}
		//	Code.editorCurrentFile = Code.blocksCurrentFile;
		//}
		//}

    //jQuery("#tab_blocks").text(MSG['blocks'] + ' ' + Code.blocksCurrentFile.path + '/' + Code.blocksCurrentFile.file);
    //jQuery("#tab_editor").text(MSG['editor'] + ' ' + Code.editorCurrentFile.path + '/' + Code.editorCurrentFile.file);
}

Code.tabRefresh = function() {
	if ((Code.selected == 'program') && (Code.mode == 'blocks')) {
		jQuery("#switchToCode, #trashButton, #loadButton, #saveButton, #rebootButton, #stopButton, #runButton").removeClass("disabled");
		jQuery("#switchToBlocks").addClass("disabled");
	} else if ((Code.selected == 'program') && (Code.mode == 'editor')) {
		jQuery("#switchToBlocks, #trashButton, #loadButton, #saveButton, #rebootButton, #stopButton, #runButton").removeClass("disabled");
		jQuery("#switchToCode").addClass("disabled");
	} else if (Code.selected == 'board') {
		jQuery("#switchToCode, #switchToBlocks, #trashButton, #loadButton, #saveButton, #rebootButton, #stopButton, #runButton").addClass("disabled");
	}
	
	if (!Board.isConnected()) {
		jQuery("#stopButton, #runButton, #tab_board, #rebootButton, #content_board").addClass("disabled");
	} else {
		jQuery("#stopButton, #runButton, #rebootButton, #content_board").removeClass("disabled");
	}
}

Code.boardConnected = function() {
	//Code.showInformation(MSG['boardConnected']);
	Code.renderContent();
}

Code.boardDisconnected = function() {
//	Code.showInformation(MSG['boardDisconnected']);	
//	Code.tabClick('blocks');
//	Code.tabRefresh();
	Code.renderContent();
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
	var blockCode = Blockly.Lua.workspaceToCode(Code.workspace).trim();

	Code.mode = "editor";
	Code.tabClick("program");
	editor.setValue(blockCode, -1);
	editor.focus();
}

Code.switchToBlocks = function() {
	var blockCode = Blockly.Lua.workspaceToCode(Code.workspace).replace(/\r|\n|\s/g,"");
	var luaCode = editor.getValue().replace(/\r|\n|\s/g,"");
	
	if (blockCode != luaCode) {
		bootbox.dialog({
			title: MSG['warning'],
		    message: MSG['switchToBlocksWarning'],
			buttons: {
			    success: {
			      label: MSG['yes'],
			      className: "btn-primary",
			      callback: function() {
				  	Code.mode = "blocks";
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
		Code.mode = "blocks";
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
//var consoleWindow;

//chrome.app.window.create('console.html', {
  //  id: "consolewin",
  //  'outerBounds': {
    //  'width': 400,
    //  'height': 500
   // }
 // },
 // function(createdWindow) {
//	  consoleWindow = createdWindow.contentWindow;	  
 // }
 //);  	
 
