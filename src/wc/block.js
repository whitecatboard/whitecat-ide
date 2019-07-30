 /*
 * Whitecat Blocky Environment, additions in Blockly.Block
 *
 * Copyright (C) 2015 - 2016
 * IBEROXARXA SERVICIOS INTEGRALES, S.L.
 * 
 * Author: Jaume Olivé (jolive@iberoxarxa.com / jolive@whitecatboard.org)
 * 
 * All rights reserved.  
 *
 * Permission to use, copy, modify, and distribute this software
 * and its documentation for any purpose and without fee is hereby
 * granted, provided that the above copyright notice appear in all
 * copies and that both that the copyright notice and this
 * permission notice and warranty disclaimer appear in supporting
 * documentation, and that the name of the author not be used in
 * advertising or publicity pertaining to distribution of the
 * software without specific, written prior permission.
 *
 * The author disclaim all warranties with regard to this
 * software, including all implied warranties of merchantability
 * and fitness.  In no event shall the author be liable for any
 * special, indirect or consequential damages or any damages
 * whatsoever resulting from loss of use, data or profits, whether
 * in an action of contract, negligence or other tortious action,
 * arising out of or in connection with the use or performance of
 * this software.
 */
'use strict';

Blockly.Block.helper = {	
};

Blockly.Block.prototype.__constructor = Blockly.Block.prototype.constructor;
Blockly.Block.prototype.constructor = function(workspace, prototypeName, opt_id) {
	var self = this;
	
	// Call Blockly.Block constructor
	this.__constructor(workspace, prototypeName, opt_id);
	
	// Add help to block
	//
	// In Whitecat IDE, custom help is defined in boards/defs/help.json file, which
	// allows to update the IDE help fromn the web server, without changes in the
	// blocks programming.
    this.setHelpUrl(this.getHelpUrl());
	
	if (!self.isInFlyout) {
		if (self.isHatBlock()) {
			Code.workspace.blocks.addChangeListener(function(e) {
				var isChanged = false;
				var isNew = false;
				var isDeleted = false;
				
				var workspace = Blockly.Workspace.getById(e.workspaceId);
				var block = workspace.getBlockById(e.blockId);
		
				var oldTopBlock;
				var newTopBlock;
				var topBlock;
		
				if (e.type == Blockly.Events.MOVE) {
					if (e.oldParentId != undefined) {
						oldTopBlock = workspace.getBlockById(e.oldParentId).getTop();
					} else {
						oldTopBlock = null;
					}

					if (e.newParentId != undefined) {
						newTopBlock = workspace.getBlockById(e.newParentId).getTop();
					} else {
						newTopBlock = null;
					}
		
					if ((oldTopBlock == self) || (newTopBlock == self)) {
						isChanged = true;
					}			
				} else if (e.type == Blockly.Events.CHANGE) {
					topBlock = workspace.getBlockById(e.blockId).getTop();
					if (topBlock == self) {
						isChanged = true;
					}
				} else if (e.type == Blockly.Events.CREATE) {
					if (block == self) {
						isNew = true;
					}
				} else if (e.type == Blockly.Events.DELETE) {
					if (e.blockId == self.id) {
						isDeleted = true;
					}
				}
		
				if (isChanged) {
					console.log("isChanged");
					Blockly.Lua.updateChunk(self);
				}
				
				if (isNew) {
					console.log("isNew");
					Blockly.Lua.newChunk(self);
				}
				
				if (isDeleted) {
					console.log("isDeleted");
				}
			});
		}
	}
}

Blockly.Block.prototype.isReporterBlock = function() {
	return ((this.outputConnection != null) && (this.outputConnection));
}

Blockly.Block.prototype.isSensorBlock = function() {
	var hatBlocks = [
		'sensor_read', 'sensor_set', 'sensor_when'
	];
	
	return (hatBlocks.indexOf(this.type) != -1);
}

Blockly.Block.prototype.isTraced = function() {
	if (typeof this.traced != "undefined") {
		return this.traced;
	}
	
	return this.isHatBlock();
}

Blockly.Block.prototype.isHatBlock = function() {
	return ((this.previousConnection == null) && (this.nextConnection == null) && (this.outputConnection == null));
}

Blockly.Block.prototype.getTop = function() {
	var block = this;
	var topBlock = null;
	
	while (block) {
		topBlock = block;
		block = block.getSurroundParent();		
	}
	
	return topBlock;
}

Blockly.Block.prototype.isInHatBlock = function() {
	var block = this;
	do {
		if (block.isHatBlock()) {
			return true;
			
			break;
		}
		block = block.getSurroundParent();
	} while (block);
	
	return false;
}

Blockly.Block.prototype.useNumber = function() {
	var blocks = [
		"math_arithmetic", "math_single", "math_trig", "math_constant", "math_change", "math_round", "math_modulo",
		"math_constrain", "math_random_int", "math_number_property"
	];
	
	
	var block = this;
	do {
		if (!block.disabled && !block.getInheritedDisabled() && block.isInHatBlock() && blocks.indexOf(block.type) != -1) {
			return true;
			
			break;
		}
		block = block.getSurroundParent();
	} while (block);
		
	return false;
}

Blockly.Block.prototype.checkIsInHatBlock = function(e) {
	if (!this.workspace.isDragging || this.workspace.isDragging()) {
		return;
	}

	if ((typeof e.element != "undefined") && (this.warning != null) && (e.element == "disabled")) {
		if (e.blockId == this.id) {
			this.setDisabled(true);
			return;
		}
	}

	if ((typeof e.element != "undefined") && (e.element == "disabled")) {
		if ((e.newValue != e.oldValue) && (e.blockId == this.id)) {
			this.disabledByUser = e.newValue;
		}
	}

	if (this.isInHatBlock()) {
		var wasInWarning = (this.warning != null);
		
		this.setWarningText(null);
		if (!this.isInFlyout && wasInWarning & (typeof this.disabledByUser == "undefined"?true:(!this.disabledByUser))) {
			this.setDisabled(false);
		} else {
			if (typeof this.disabledByUser != "undefined") {
				this.setDisabled(this.disabledByUser);
			}	
		}
	} else {
		this.setWarningText(Blockly.Msg.WARNING_NOT_IN_HAT_BLOCK);
		if (!this.isInFlyout && !this.getInheritedDisabled()) {
			this.setDisabled(true);
		}
	}
}

Blockly.Block.prototype.isInField = function(parentBlock, field) {
	var i;
	var j;
	
	// Find field
	for(i=0; i < parentBlock.inputList.length;i++) {
		if (parentBlock.inputList[i].name == field) {
			// Get first block connected to the field
			var firstBlock = parentBlock.inputList[i].connection.targetConnection.sourceBlock_;
			
			// Get all descendants
			var descendants = firstBlock.getDescendants();
			
			for(j=0; j < descendants.length;j++) {
				if (descendants[j].type == this.type) {
					return true;
				}
			}
		}
	}
	
	return false;
}

Blockly.Block.prototype.isInBlock = function(type, field) {
	var block = this;
	var parentBlock = this;

	do {
		if (parentBlock.type == type) {
			if (typeof field != "undefined") {
				return this.isInField(parentBlock, field);
			} else {
				return true;				
			}
			
			break;
		}
		parentBlock = parentBlock.getSurroundParent();
	} while (parentBlock);
	
	return false;	
}

Blockly.Block.prototype.getFieldInParentBlock = function(type, field) {
	var block = this;
	var parentBlock = this;
	var i;
	var j;
	
	do {
		if (parentBlock.type == type) {
			// Find field
			for(i=0; i < parentBlock.inputList.length;i++) {
				if (parentBlock.inputList[i].name == field) {
					return parentBlock.inputList[i].connection;
				}
			}				
			
			break;
		}
		parentBlock = parentBlock.getSurroundParent();
	} while (parentBlock);
	
	return null;	
}


Blockly.Block.prototype.getHelpUrl = function()  {
	var url;
	var thisInstance = this;
	
	if (this.isSensorBlock()) {
		url = Code.Help.getUrl("sensors", thisInstance.sid);
	} else {
		url = Code.Help.getUrl("blocks", this.type);
	}
	
	return url;
}

Blockly.Block.prototype.updateBoardAtFieldChange = function(field) {
	return;
	
	var thisInstance = this;
	
	if (!thisInstance.isInFlyout) {
		Code.workspace.blocks.addChangeListener(function(e) {
			if ((e.type == Blockly.Events.CHANGE)) {
				if (e.blockId != thisInstance.id) {
					var workspace = Blockly.Workspace.getById(e.workspaceId);

					if (workspace.getBlockById(e.blockId).getParent()) {
						if (workspace.getBlockById(e.blockId).getParent().id != thisInstance.id) {
							return;
						}						
					} else {
						return;
					}
				}

				if (e.name == field) {
					if (thisInstance.fieldTimeout) {
						clearTimeout(thisInstance.fieldTimeout);
					}

					thisInstance.fieldTimeout = setTimeout(function() {
						thisInstance.value = e.newValue;

						var code = Blockly.Lua.blockCode(thisInstance);
						console.log(code);
						thisInstance.removeError();
						thisInstance.removeStart();
						
						Code.agent.send({
							command: "boardRunCommand",
							arguments: {
								code: btoa(code)
							}
						}, function(id, info) {});

						thisInstance.value = -1;
					}, 500);
				}
			}
		});
	}
}

Blockly.Block.prototype.updateBoardAtBlockCreate = function() {
	return;
	
	var thisInstance = this;
	
	if (!thisInstance.isInFlyout) {
		Code.workspace.blocks.addChangeListener(function(e) {
			if ((e.type == Blockly.Events.CREATE)) {
				if (e.blockId != thisInstance.id) {
					var workspace = Blockly.Workspace.getById(e.workspaceId);

					if (workspace.getBlockById(e.blockId).getParent()) {
						if (workspace.getBlockById(e.blockId).getParent().id != thisInstance.id) {
							return;
						}						
					} else {
						return;
					}
				}

//				if (e.name == field) {
					if (thisInstance.createTimeout) {
						clearTimeout(thisInstance.createTimeout);
					}

					thisInstance.createTimeout = setTimeout(function() {
//						thisInstance.value = e.newValue;

						var code = Blockly.Lua.blockCode(thisInstance);

						thisInstance.removeError();
						thisInstance.removeStart();
						
						Code.agent.send({
							command: "boardRunCommand",
							arguments: {
								code: btoa(code)
							}
						}, function(id, info) {});

//						thisInstance.value = -1;
					}, 250);
//				}
			}
		});
	}
}

Blockly.Block.prototype.checkUses = function(e, checkF, msg) {
	this.disabledByUser = ((typeof this.disabledByUser != "undefined")?this.disabledByUser:false);

	if (!this.workspace.isDragging || this.workspace.isDragging()) {
		return;
	}
	
	var uses = 0;
	var blocks = this.workspace.getTopBlocks(true);
	for (var x = 0, block; block = blocks[x]; x++) {
		if (!block.disabledByUser && checkF(block) && (block.type == this.type)) {
			uses++;
		}
	}
	
	Blockly.Events.disable();
	if (uses > 1) {
		this.setWarningText(Blockly.Msg.WARNING_EVENTS_CAN_ONLY_PROCESSED_IN_ONE_EVENT_BLOCK,1);
		if (!this.isInFlyout) {
			this.setWarningText(null,2);
			this.disabledByIde = true;
			this.setDisabled(true);
		}
		
	} else {
		this.setWarningText(null,1);		
		if (!this.isInFlyout) {
			this.disabledByIde = false;
			this.setDisabled(this.disabledByUser);
		}
	}
	Blockly.Events.enable();
}

Blockly.Block.helper.getField = function(xml, field) {
	var nodes = xml.childNodes;
	var nodeCount = nodes.length;
	var value = null;
	
	for (var i = 0; i < nodeCount; i++) {
		var node = nodes[i];
		
		if (typeof node.nodeName != "undefined") {
	        var nodeName = node.nodeName.toLowerCase();
			
			if (nodeName == "field") {
				var fieldName = node.getAttribute('name');
				if (fieldName == field) {
					value = node.textContent;
				}
			} else if (nodeName == "value") {
				value = this.getField(node, field)
			} else if (nodeName == "shadow") {
				value = this.getField(node, field);
			}
			
			if (value) {
				break;
			}
		}
	}
	
	return value;
}

Blockly.Block.helper.setField = function(xml, field, value) {
	var nodes = xml.childNodes;
	var nodeCount = nodes.length;
	
	for (var i = 0; i < nodeCount; i++) {
		var node = nodes[i];
		
		if (typeof node.nodeName != "undefined") {
	        var nodeName = node.nodeName.toLowerCase();
			
			if (nodeName == "field") {
				var fieldName = node.getAttribute('name');
				if (fieldName == field) {
					node.textContent = value;
				}
			} else if (nodeName == "value") {
				this.setField(node, field, value)
			} else if (nodeName == "shadow") {
				this.setField(node, field, value);
			}
		}
	}
}

/*
Blockly.Block.prototype.getVars = function() {
  var vars = [];
  
  for (var i = 0, input; input = this.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (field instanceof Blockly.FieldVariable) {
        vars.push(field.getValue());
      }
    }
  }
  return vars;
};

Blockly.Block.prototype.getLocalVars = function() {
  var vars = [];
  
  if ((this.type == "procedures_defnoreturn") || (this.type == "procedures_defreturn")) {
	  // For procedures and functions, arguments are always local variable names
	  this.arguments_.forEach(function(argument) {
          vars.push(argument);		  							  	
	  });
  }
  
  // Variables marked as local
  for (var i = 0, input; input = this.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (field instanceof Blockly.FieldVariable) {
		  if (this.type == 'variables_local') {
	          vars.push(field.getValue());		  	
		  }
      }
    }
  }
  
  return vars;
};
*/
