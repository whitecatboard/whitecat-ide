'use strict';

Blockly.BlockSvg.prototype.showContextMenu_ = function(e) {
  if (this.workspace.options.readOnly || !this.contextMenu) {
    return;
  }
  // Save the current block in a variable for use in closures.
  var block = this;
  var menuOptions = [];

  if (this.isDeletable() && this.isMovable() && !block.isInFlyout) {
    // Option to duplicate this block.
    var duplicateOption = {
      text: Blockly.Msg.DUPLICATE_BLOCK,
      enabled: true,
      callback: function() {
        Blockly.duplicate_(block);
      }
    };
    if (this.getDescendants().length > this.workspace.remainingCapacity()) {
      duplicateOption.enabled = false;
    }
    menuOptions.push(duplicateOption);

    if (this.isEditable() && !this.collapsed_ &&
        this.workspace.options.comments) {
      // Option to add/remove a comment.
      var commentOption = {enabled: !goog.userAgent.IE};
      if (this.comment) {
        commentOption.text = Blockly.Msg.REMOVE_COMMENT;
        commentOption.callback = function() {
          block.setCommentText(null);
        };
      } else {
        commentOption.text = Blockly.Msg.ADD_COMMENT;
        commentOption.callback = function() {
          block.setCommentText('');
        };
      }
      menuOptions.push(commentOption);
    }

    // Option to make block inline.
    if (!this.collapsed_) {
      for (var i = 1; i < this.inputList.length; i++) {
        if (this.inputList[i - 1].type != Blockly.NEXT_STATEMENT &&
            this.inputList[i].type != Blockly.NEXT_STATEMENT) {
          // Only display this option if there are two value or dummy inputs
          // next to each other.
          var inlineOption = {enabled: true};
          var isInline = this.getInputsInline();
          inlineOption.text = isInline ?
              Blockly.Msg.EXTERNAL_INPUTS : Blockly.Msg.INLINE_INPUTS;
          inlineOption.callback = function() {
            block.setInputsInline(!isInline);
          };
          menuOptions.push(inlineOption);
          break;
        }
      }
    }

    if (this.workspace.options.collapse) {
      // Option to collapse/expand block.
      if (this.collapsed_) {
        var expandOption = {enabled: true};
        expandOption.text = Blockly.Msg.EXPAND_BLOCK;
        expandOption.callback = function() {
          block.setCollapsed(false);
        };
        menuOptions.push(expandOption);
      } else {
        var collapseOption = {enabled: true};
        collapseOption.text = Blockly.Msg.COLLAPSE_BLOCK;
        collapseOption.callback = function() {
          block.setCollapsed(true);
        };
        menuOptions.push(collapseOption);
      }
    }

    if (this.workspace.options.disable) {
      // Option to disable/enable block.
	  
	  // WHITECAT IDE
	  var disableText = "";
	  var onlyDisable = false;
	  var wsId = this.workspace.id;
	  
	  if ((typeof block.disabledByIde != "undefined") && block.disabledByIde) {
		  disableText = Blockly.Msg.DISABLE_BLOCK;
		  onlyDisable = true;
	  } else {
		  disableText = (this.disabled ?Blockly.Msg.ENABLE_BLOCK : Blockly.Msg.DISABLE_BLOCK);
	  }
	  // WHITECAT IDE

      var disableOption = {
        text: disableText,
        enabled: !this.getInheritedDisabled(),
        callback: function() {
		  // WHITECAT IDE
		  if (onlyDisable) {
			  block.disabledByUser = true;
			  block.enabledByUser = false;
	          block.setDisabled(true);
			  
			  var event = new Blockly.Events.Ui(null, 'selected', block.id, block.id);
			  event.workspaceId = wsId;
			  Blockly.Events.fire(event);			  
		  } else {
			  block.disabledByUser = !block.disabled;
			  block.enabledByUser = block.disabled;
	          block.setDisabled(!block.disabled);
		  }
		  
		  Blockly.mainWorkspace.removeErrors();
		  
		  // WHITECAT IDE		  
        }
      };
      menuOptions.push(disableOption);
    }

    // Option to delete this block.
    // Count the number of blocks that are nested in this block.
    var descendantCount = this.getDescendants().length;
    var nextBlock = this.getNextBlock();
    if (nextBlock) {
      // Blocks in the current stack would survive this block's deletion.
      descendantCount -= nextBlock.getDescendants().length;
    }
    var deleteOption = {
      text: descendantCount == 1 ? Blockly.Msg.DELETE_BLOCK :
          Blockly.Msg.DELETE_X_BLOCKS.replace('%1', String(descendantCount)),
      enabled: true,
      callback: function() {
        Blockly.Events.setGroup(true);
        block.dispose(true, true);
        Blockly.Events.setGroup(false);
      }
    };
    menuOptions.push(deleteOption);
  }

  // Option to get block definition.
  if (Code.isLocal) {
	  var defOption = {enabled: true};
	  defOption.text = "Get definition";
	  defOption.callback = function() {
		  block.showDef_();
	  };
	  menuOptions.push(defOption);
  } 

  // Option to get help.
  var url = goog.isFunction(this.helpUrl) ? this.helpUrl() : this.helpUrl;
  var helpOption = {enabled: !!url};
  helpOption.text = Blockly.Msg.HELP;
  helpOption.callback = function() {
    block.showHelp_();
  };
  menuOptions.push(helpOption);

  // Allow the block to add or modify menuOptions.
  if (this.customContextMenu && !block.isInFlyout) {
    this.customContextMenu(menuOptions);
  }

  Blockly.ContextMenu.show(e, menuOptions, this.RTL);
  Blockly.ContextMenu.currentBlock = this;
};

/**
 * Select this block.  Highlight it visually as block has an error.
 */
Blockly.BlockSvg.prototype.addError = function() {
	var thisInstance = this;

    Blockly.utils.addClass(/** @type {!Element} */ (thisInstance.svgGroup_), 'blocklyError');
};

/**
 * Unselect this block.  Remove its highlighting as block has not an error.
 */
Blockly.BlockSvg.prototype.removeError = function() {
	var thisInstance = this;

    Blockly.utils.removeClass(/** @type {!Element} */ (thisInstance.svgGroup_), 'blocklyError');
};

/**
 * Select this block.  Highlight it visually as block is running.
 */
Blockly.BlockSvg.prototype.addStart = function() {
	var thisInstance = this;
	
	if (!this.lastStart) {
		this.lastStart = (new Date).getTime();
		Blockly.utils.addClass(/** @type {!Element} */ (thisInstance.svgGroup_), 'blocklyStarted');
	}
};

/**
 * Unselect this block.  Remove its highlighting as block is not running.
 */
Blockly.BlockSvg.prototype.removeStart = function() {
	var thisInstance = this;
	var now = (new Date).getTime();
	
	if (thisInstance.lastStart) {
		if (now - thisInstance.lastStart >= 500) {
			thisInstance.lastStart = null;  	
			Blockly.utils.removeClass(/** @type {!Element} */ (thisInstance.svgGroup_), 'blocklyStarted');
		} else {
			setTimeout(function() {
				thisInstance.lastStart = null;  					
				Blockly.utils.removeClass(/** @type {!Element} */ (thisInstance.svgGroup_), 'blocklyStarted');
			}, 500 - now + thisInstance.lastStart);
		}
	}
};

/**
 * Change the colour of a block.
 */
Blockly.BlockSvg.prototype.updateColour = function() {
  if (this.disabled) {
    // Disabled blocks don't have colour.
    return;
  }
  var hexColour = this.getColour();
  var rgb = goog.color.hexToRgb(hexColour);
  if (this.isShadow()) {
    //rgb = goog.color.lighten(rgb, 0.6);
    hexColour = goog.color.rgbArrayToHex(rgb);
    this.svgPathLight_.style.display = 'none';
    this.svgPathDark_.setAttribute('fill', hexColour);
  } else {
    this.svgPathLight_.style.display = '';
    var hexLight = goog.color.rgbArrayToHex(goog.color.lighten(rgb, 0.3));
    var hexDark = goog.color.rgbArrayToHex(goog.color.darken(rgb, 0.2));
    this.svgPathLight_.setAttribute('stroke', hexLight);
    this.svgPathDark_.setAttribute('fill', hexDark);
  }
  this.svgPath_.setAttribute('fill', hexColour);

  var icons = this.getIcons();
  for (var i = 0; i < icons.length; i++) {
    icons[i].updateColour();
  }

  // Bump every dropdown to change its colour.
  for (var x = 0, input; input = this.inputList[x]; x++) {
    for (var y = 0, field; field = input.fieldRow[y]; y++) {
      field.setText(null);
    }
  }
};

Blockly.BlockSvg.prototype.showHelp_ = function() {
  var thisInstance = this;

  var url = goog.isFunction(this.helpUrl) ? this.helpUrl() : this.helpUrl;
  if (url) {
	  Code.Help._show(url);
  }
};

Blockly.BlockSvg.prototype.showDef_ = function() {
  alert(Blockly.Xml.domToText(Blockly.Xml.blockToDom(this)));
};