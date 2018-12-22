'use strict';

Blockly.Block.prototype.isReporterBlock = function() {
	return ((this.outputConnection != null) && (this.outputConnection));
}

Blockly.Block.prototype.isSensorBlock = function() {
	var hatBlocks = [
		'sensor_read', 'sensor_set', 'sensor_when'
	];
	
	return (hatBlocks.indexOf(this.type) != -1);
}

Blockly.Block.prototype.isHatBlock = function() {
	return ((this.previousConnection == null) && (this.nextConnection == null));
}

Blockly.Block.prototype.isInHatBlock = function() {
	var hatBlocks = [
		'when_board_starts', 'when_i_receive', 'when_digital_pin', 'when_i_receive_a_lora_frame', 'sensor_when', 'execute_every', 'thread', 'mqtt_subscribe',
		'when_wifi_is_conneted', 'when_wifi_is_disconneted'
	];
	
	var block = this;
	do {
		if (hatBlocks.indexOf(block.type) != -1) {
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