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
	var toolWidth = 500;
	var previewHeight = 150;
	var optionsTop = 0;
	var optionsHeight = 22;
	var previewTop = 0;
	var previewLeft;
	var previewHeight;
	var editorTop;
	
	var container = document.getElementById('content_area');
	var bBox = Code.getBBox_(container);

	var tool = document.getElementById('block_editor_tool');
	
	toolTop = 0;
	tool.style.top = toolTop + 'px';
	tool.style.left = bBox.x + 'px';
	tool.style.height = (bBox.height) + 'px';
	tool.style.width = toolWidth + 'px';

	var options = document.getElementById('block_editor_options');
	options.style.top = optionsTop + 'px';
	options.style.left = (bBox.x + toolWidth) + 'px';
	options.style.height = (optionsHeight) + 'px';
	options.style.width = toolWidth + 'px';

	var preview = document.getElementById('preview');
	
	previewTop = optionsHeight;
	preview.style.top = previewTop + 'px';
	
	previewLeft = bBox.x + toolWidth;
	preview.style.left = (bBox.x + toolWidth) + 'px';
	
	preview.style.height = previewHeight + 'px';
	preview.style.width = (bBox.width - parseInt(preview.style.left.replace("px",""))) + 'px';
	
	var editor = document.getElementById('block_editor_code');

	editorTop = optionsHeight + previewHeight;
	editor.style.top = (editorTop) + 'px';
	editor.style.left = (bBox.x + toolWidth) + 'px';
	editor.style.height = (bBox.height - editorTop) + 'px';
	editor.style.width = (bBox.width - previewLeft) + 'px';
};

/**
 * Initialize Blockly and layout.  Called on page load.
 */
AppController.prototype.init = function() {
  var self = this;

  var html = '';
  var i = 0;
  for (var block in Code.lib.def.blocks) {
	html += '<option '+(i==0?"selected":"")+'value="'+Code.lib.def.blocks[block].spec.type+'">'+Code.lib.def.blocks[block].spec.type+'</option>'
	i++;
  }

  jQuery("#content_block_editor_type").html(html);

  jQuery("#content_block_editor_type").on('change', function() {
	var type = jQuery(this.selectedOptions).val();

	for (var block in Code.lib.def.blocks) {
		if (Code.lib.def.blocks[block].spec.type == type) {
			var code = atob(Code.lib.def.blocks[block].code);
		
			Code.workspace.block_editorCode.setValue(code, -1);
			Code.workspace.block_editorCode.focus();
		}
	}
  });		

  jQuery("#content_block_editor_type").trigger('change');
  
  this.onresize();
  window.addEventListener('resize', function() {
    self.onresize();
  });

  // Inject Block Factory Main Workspace.
  var toolbox = document.getElementById('blockfactory_toolbox');
  BlockFactory.mainWorkspace = Blockly.inject('block_editor_tool',
      {collapse: false,
       toolbox: toolbox,
       media: Code.folder + '/media/'});

  // Create the root block on Block Factory main workspace.
  if ('BlocklyStorage' in window && window.location.hash.length > 1) {
    BlocklyStorage.retrieveXml(window.location.hash.substring(1),
                               BlockFactory.mainWorkspace);
  } else {
    BlockFactory.showStarterBlock();
  }
  BlockFactory.mainWorkspace.clearUndo();

  // Add Block Factory event listeners.
  this.addBlockFactoryEventListeners();
};
