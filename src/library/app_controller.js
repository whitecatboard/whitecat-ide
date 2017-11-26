/**
 * @license
 * Blockly Demos: Block Factory
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview The AppController Class brings together the Block
 * Factory, Block Library, and Block Exporter functionality into a single web
 * app.
 *
 * @author quachtina96 (Tina Quach)
 */
goog.provide('AppController');

goog.require('goog.dom.classlist');
goog.require('goog.ui.PopupColorPicker');
goog.require('goog.ui.ColorPicker');


/**
 * Controller for the Blockly Factory
 * @constructor
 */
AppController = function() {
	this.inited = false;
	this.toolWidth = 500;
	this.previewHeight = 70;
	this.section = "default";
	
	this.defaultBlockSpec  = '{';
	this.defaultBlockSpec += '   "parentCategory": "",';
	this.defaultBlockSpec += '   "category": "",';
	this.defaultBlockSpec += '   "xmlSpec": "",';
	this.defaultBlockSpec += '   "spec": {';
	this.defaultBlockSpec += '      "type": "",';
	this.defaultBlockSpec += '      "message0": "",';
	this.defaultBlockSpec += '      "args0": [';
	this.defaultBlockSpec += '      ],';
	this.defaultBlockSpec += '      "previousStatement": null,';
	this.defaultBlockSpec += '      "nextStatement": null,';
	this.defaultBlockSpec += '      "colour": "",';
	this.defaultBlockSpec += '      "inputsInline": true';
	this.defaultBlockSpec += '   },';
	this.defaultBlockSpec += '   "msg": {';
	this.defaultBlockSpec += '      "en": {';
	this.defaultBlockSpec += '         "message0": ""';
	this.defaultBlockSpec += '      },';
	this.defaultBlockSpec += '      "ca": {';
	this.defaultBlockSpec += '         "message0": ""';
	this.defaultBlockSpec += '      },';
	this.defaultBlockSpec += '      "es": {';
	this.defaultBlockSpec += '         "message0": ""';
	this.defaultBlockSpec += '      }';
	this.defaultBlockSpec += '   },';
	this.defaultBlockSpec += '   "whatcher": false,';
	this.defaultBlockSpec += '   "dependency": [';
	this.defaultBlockSpec += '      "block"';
	this.defaultBlockSpec += '   ],';
	this.defaultBlockSpec += '   "shadow": {},';
	this.defaultBlockSpec += '   "subtype": {},';
	this.defaultBlockSpec += '   "code": {';
	this.defaultBlockSpec += '      "default": "",';
	this.defaultBlockSpec += '      "functions": ""';
	this.defaultBlockSpec += '   }';
	this.defaultBlockSpec += '}';
};

/**
 * Add event listeners for the block factory.
 */
AppController.prototype.addBlockFactoryEventListeners = function() {
  // Update code on changes to block being edited.
  BlockFactory.mainWorkspace.addChangeListener(BlockFactory.updateLanguage);
  
  // Disable blocks not attached to the factory_base block.
  BlockFactory.mainWorkspace.addChangeListener(Blockly.Events.disableOrphans);
};

/**
 * Handle resizing of elements.
 */
AppController.prototype.onresize = function(event) {
	var optionsTop = 0;
	var optionsHeight = 32;
	var previewTop = 0;
	var previewWidth = 0;
	var sepWidth = 4;
	var previewLeft;
	var editorTop;
	
	var container = document.getElementById('content_area');
	var bBox = Code.getBBox_(container);

	var tool = document.getElementById('block_editor_tool');
	
	tool.style.top = bBox.y + 'px';
	tool.style.left = bBox.x + 'px';

	tool.style.height = (bBox.height - 34) + 'px';
	tool.style.width = this.toolWidth + 'px';
	
	var v_sep = document.getElementById('block_editor_v_sep');
	
	v_sep.style.top = 0 + 'px';
	v_sep.style.left = (bBox.x + this.toolWidth) + 'px';

	v_sep.style.height = (bBox.height - 34) + 'px';
	v_sep.style.width = sepWidth + 'px';

	var options = document.getElementById('block_editor_options');
	options.style.top = optionsTop + 'px';
	options.style.left = (bBox.x + this.toolWidth + sepWidth) + 'px';
	options.style.height = (optionsHeight) + 'px';
	options.style.width = this.toolWidth + 'px';

	var preview = document.getElementById('preview');
	
	previewTop = optionsHeight;
	preview.style.top = previewTop + 'px';
	
	previewLeft = bBox.x + this.toolWidth;
	preview.style.left = (bBox.x + this.toolWidth + sepWidth - 1) + 'px';
	
	preview.style.height = this.previewHeight + 'px';
	
	previewWidth = (bBox.width - parseInt(preview.style.left.replace("px","")));
	preview.style.width = previewWidth + 'px';
	

	var h_sep = document.getElementById('block_editor_h_sep');
	
	h_sep.style.top = optionsHeight + this.previewHeight + 'px';
	h_sep.style.left = (previewLeft) + 'px';

	h_sep.style.height = sepWidth + 'px';
	h_sep.style.width = previewWidth + sepWidth + 'px';

	var options = document.getElementById('block_editor_code_options');
	optionsTop = optionsHeight + this.previewHeight;
	
	options.style.top = optionsTop + 'px';
	options.style.left = (bBox.x + this.toolWidth) + 'px';
	options.style.height = (optionsHeight) + 'px';
	options.style.width = previewWidth + sepWidth + 'px';
	
	var editor = document.getElementById('block_editor_code');

	editorTop = optionsTop + optionsHeight;
	editor.style.top = (editorTop) + 'px';
	editor.style.left = (bBox.x + this.toolWidth + sepWidth - 1) + 'px';
	editor.style.height = (bBox.height - editorTop) + 'px';
	editor.style.width = (bBox.width - previewLeft) + 'px';
};

AppController.prototype.updateLibraryList = function() {
	var self = this;
	
    // Populate list of libraries
    var libs = Code.lib.libs;
  
    html = '';
 
    if (libs.length == 0) {
  	  html += '<option value="new-library">Choose one ...</option>'  	
    }
  
    libs.forEach(function(library, index) {
  	html += '<option '+(index==0?"selected":"")+' value="'+library.name+'">'+library.name+'</option>'
    });

    html += '<option value="new-library">New library ...</option>'
  
    jQuery("#content_block_editor_library").html(html);
    jQuery("#content_block_editor_library").unbind('change').on('change', function(e) {
  	  var target = jQuery(e.target);
  	  var libraryName = target.val();
	  
  	  if (libraryName == "new-library") {
  		var dialogForm = "";
		
  		dialogForm  = '<form id="new_library">';
  		dialogForm += '<div>';
  		dialogForm += '<label for="library_name">Name:&nbsp;&nbsp;</label>';
  		dialogForm += '<input id="library_name" name="library_name" value="">';
  		dialogForm += '</div>';
  		dialogForm += '</form>';
  		dialogForm += '<span class="error-msg" id="errors"></span>';

  		bootbox.dialog({
  			title: "New library",
  			message: dialogForm,
  			buttons: {
  				danger: {
  					label: "Cancel",
  					classensor: "btn-danger",
  					callback: function() {}
  				},
  				main: {
  					label: "Create",
  					callback: function() {
  						var form = jQuery("#new_library");
  						jQuery("#errors").html("");
						
  						var name = form.find("#library_name").val();
						
  						if (name == "") {
  							jQuery("#errors").html("Library name missing");
  							return false;
  						}
						
  						Code.lib.create(name);
  					}
  				},
  			},
  			closable: false,
  			onEscape: true
  		});	  	
  	  } else {
  		  // Change current library
  		  libs.forEach(function(library, index) {
  			  if (library.name == libraryName) {
  				  Code.lib.def = JSON.parse(JSON.stringify(library));		  	
  			  }
  		  });
		  
  		  self.updateBlockList();
  	  };
  });
};

AppController.prototype.updateBlockList = function() {
    var self = this;
    var html = '';
	

    if (Code.lib.def.blocks.length == 0) {
  	  html += '<option value="new-library">Choose one ...</option>'  	
    }

	Code.lib.def.blocks.forEach(function(block, index) {
		html += '<option '+(index==0?"selected":"")+' value="'+block.spec.type+'">'+block.spec.type+'</option>'
	});

	html += '<option value="new-block">New block ...</option>'

	jQuery("#content_block_editor_type").html(html);
	
	if (Code.lib.def.blocks.length == 0) {
		// No blocks in library
		if (BlockFactory.mainWorkspace) {
			BlockFactory.mainWorkspace.clear();
		}
		
		if (BlockFactory.previewWorkspace) {
			BlockFactory.previewWorkspace.clear();
		}

		Code.workspace.block_editorCode.setValue("", -1);
	} else {
		// Show fisrt bock
		jQuery("#content_block_editor_type").trigger("change");		
	}

    jQuery("#content_block_editor_type").unbind('change').on('change', function() {
	  	var type = jQuery(this.selectedOptions).val();
		
		if (type == "new-block") {
			var dialogForm = "";
			
			dialogForm  = '<form id="new_block">';
			dialogForm += '<div>';
			dialogForm += '<label for="block_parent_category">Parent category:&nbsp;&nbsp;</label>';
			dialogForm += '<input id="block_parent_category" name="block_parent_category" value="">';
			dialogForm += '</div>';
			dialogForm += '<div>';
			dialogForm += '<label for="block_category">Category:&nbsp;&nbsp;</label>';
			dialogForm += '<input id="block_category" name="block_category" value="">';
			dialogForm += '</div>';
			dialogForm += '<div>';
			dialogForm += '<label for="block_name">Name:&nbsp;&nbsp;</label>';
			dialogForm += '<input id="block_name" name="block_name" value="">';
			dialogForm += '</div>';
			dialogForm += '</form>';
			dialogForm += '<span class="error-msg" id="errors"></span>';
			
			bootbox.dialog({
				title: "New block",
				message: dialogForm,
				buttons: {
					danger: {
						label: "Cancel",
						classensor: "btn-danger",
						callback: function() {}
					},
					main: {
						label: "Create",
						callback: function() {
							var form = jQuery("#new_block");
							jQuery("#errors").html("");

							var parent_category = form.find("#block_parent_category").val();
							var category = form.find("#block_category").val();
							var name = form.find("#block_name").val();
							
							if (parent_category == "") {
								jQuery("#errors").html("Block parent category missing");
								return false;
							}

							if (category == "") {
								jQuery("#errors").html("Block category missing");
								return false;
							}

							if (name == "") {
								jQuery("#errors").html("Block name missing");
								return false;
							}
							
							// Create a default block
							var def = JSON.parse(self.defaultBlockSpec);
							
							def.parentCategory = parent_category;
							def.category = category;
							def.spec.type = name;
							
							// Add this block to the library
							Code.lib.def.blocks.push(def);
							
							// Update block list
							self.updateBlockList();
							
							// Show the block
							var xml = '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="factory_base" deletable="false" movable="false" x="10" y="15"><mutation connections="BOTH"></mutation><field name="NAME">'+name+'</field><field name="INLINE">AUTO</field><field name="CONNECTIONS">BOTH</field><statement name="INPUTS"></statement><value name="TOOLTIP"><block type="text" deletable="false" movable="false"><field name="TEXT"></field></block></value><value name="HELPURL"><block type="text" deletable="false" movable="false"><field name="TEXT"></field></block></value><value name="TOPTYPE"><shadow type="type_null"></shadow></value><value name="BOTTOMTYPE"><shadow type="type_null"></shadow></value><value name="COLOUR"><block type="colour_hue"><mutation colour="#5b67a5"></mutation><field name="HUE">230</field></block></value></block></xml>';
							
							BlockFactory.mainWorkspace.clear();
							Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), BlockFactory.mainWorkspace);
							
				  			Code.workspace.block_editorCode.setValue("", -1);
							
							jQuery("#content_block_editor_type").val(name);
						}
					},
				},
				closable: false,
				onEscape: true
			});
		} else {
			var codeSection = jQuery("#content_block_editor_code_section").val();
			
		  	for (var block in Code.lib.def.blocks) {
		  		if (Code.lib.def.blocks[block].spec.type == type) {
		  			var spec = "";
		  			var code = "";
		
		  			if (typeof Code.lib.def.blocks[block].xmlSpec != "undefined") {
		  				spec = atob(Code.lib.def.blocks[block].xmlSpec);
		  			}
		
		  			if (typeof Code.lib.def.blocks[block].code[codeSection] != "undefined") {
		  				code = atob(Code.lib.def.blocks[block].code[codeSection]);
		  			}
		
		  			Code.workspace.block_editorCode.setValue(code, -1);
		  			Code.workspace.block_editorCode.focus();		
	
		  			if (spec != "") {
		  				if (BlockFactory.mainWorkspace) {
		  					BlockFactory.mainWorkspace.clear();
		  				    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(spec), BlockFactory.mainWorkspace);					
		  				}			
		  			}					
		  		}
		  	}							
		}
    });	
	
	jQuery("#content_block_editor_code_section").unbind('change').on('change', function() {
		var self = this;
		
		var type = jQuery("#content_block_editor_type").val();		
		var section = jQuery(this.selectedOptions).val();
		var code = "";
		
		Code.lib.def.blocks.forEach(function(block, idx){
			if (block.spec.type == type) {
				// Save current code in its section
				code = btoa(Code.workspace.block_editorCode.getValue());
				block.code[self.section] = code;
				
				// Get new code section and display
				code = "";

	  			if (typeof block.code[section] != "undefined") {
	  				code = atob(block.code[section]);
	  			}				

	  			Code.workspace.block_editorCode.setValue(code, -1);
	  			Code.workspace.block_editorCode.focus();
				
				// Change current section
				self.section = section;
			}
		});
	});
};

/**
 * Initialize Blockly and layout.  Called on page load.
 */
AppController.prototype.init = function() {
  var self = this;
  var html = '';

  if (this.inited) return;
  this.inited = true;
  
  // Populate list of code sections
  // Code sections
  var codeSection = ["default", "functions"];

  html = '';

  codeSection.forEach(function(section, index) {
	html += '<option '+(index==0?"selected":"")+' value="'+section+'">'+section+'</option>'  	
  });

  jQuery("#content_block_editor_code_section").html(html);
  
  // Update library list
  self.updateLibraryList();
  
  jQuery("#content_block_editor_translate").unbind('click').on('click', function(e) {
	var dialogForm = "";
	var block;
	
	dialogForm  = '<form id="translate_block">';
	
	var type = jQuery("#content_block_editor_type").val();
	Code.lib.def.blocks.forEach(function(b) {
		if (b.spec.type == type) {
			block = b;
		}
	});
	
	if (block.msg.en.message0 == "") {
		block.msg.en.message0 = block.spec.message0;
	}

	if (block.msg.ca.message0 == "") {
		block.msg.ca.message0 = block.spec.message0;
	}

	if (block.msg.es.message0 == "") {
		block.msg.es.message0 = block.spec.message0;
	}
	
	dialogForm += '<div>';
	dialogForm += '<label for="message_en">English:&nbsp;&nbsp;</label>';
	dialogForm += '<input id="message_en" name="library_name" style="width:100%" value="'+block.msg.en.message0+'">';
	dialogForm += '</div>';			
	dialogForm += '<br>';		
	
	dialogForm += '<div>';
	dialogForm += '<label for="message_ca">Català:&nbsp;&nbsp;</label>';
	dialogForm += '<input id="message_ca" name="library_name" style="width:100%" value="'+block.msg.ca.message0+'">';
	dialogForm += '</div>';			
	dialogForm += '<br>';		

	dialogForm += '<div>';
	dialogForm += '<label for="message_es">Español:&nbsp;&nbsp;</label>';
	dialogForm += '<input id="message_es" name="library_name" style="width:100%" value="'+block.msg.es.message0+'">';
	dialogForm += '</div>';			
	
	dialogForm += '</form>';
	dialogForm += '<span class="error-msg" id="errors"></span>';

	bootbox.dialog({
		title: "Translate block",
		message: dialogForm,
		buttons: {
			danger: {
				label: "Cancel",
				classensor: "btn-danger",
				callback: function() {}
			},
			main: {
				label: "Update",
				callback: function() {
					var en = jQuery("#message_en").val();
					var ca = jQuery("#message_ca").val();
					var es = jQuery("#message_es").val();
					
					block.msg.en.message0 = en;
					block.msg.ca.message0 = ca;
					block.msg.es.message0 = es;
				}
			},
		},
		closable: false,
		onEscape: true
	});	  	
  });

  window.addEventListener('resize', function() {
    self.onresize();
  });

  // Inject Block Factory Main Workspace.
  var toolbox = document.getElementById('blockfactory_toolbox');
  BlockFactory.mainWorkspace = Blockly.inject('block_editor_tool',
      {collapse: false,
       toolbox: toolbox,
       media: Code.folder + '/media/',
	  });

  // Create the root block on Block Factory main workspace.
  if ('BlocklyStorage' in window && window.location.hash.length > 1) {
//    BlocklyStorage.retrieveXml(window.location.hash.substring(1),
//                               BlockFactory.mainWorkspace);
  } else {	  
  //  BlockFactory.showStarterBlock();
  }
  
  BlockFactory.mainWorkspace.clearUndo();
  
  // Add Block Factory event listeners.
  this.addBlockFactoryEventListeners();

  // Show first block in library
  jQuery("#content_block_editor_library").trigger("change");
  jQuery("#content_block_editor_type").trigger("change");
};
