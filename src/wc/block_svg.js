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
