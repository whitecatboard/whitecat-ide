'use strict';

var IDEHelp = {
	// Events
	"broadcast": "Broadcast-()",
	"broadcast_and_wait": "Broadcast-()-and-wait",
	"when_board_starts": "When-board-starts",
	"when_i_receive": "When-I-receive-()",
	"execute_every": "Every-()-(unit)",
	"thread": "Forever",

	// Delays
	"wait_for": "Wait-()-(unit)",
	"cpu_sleep": "Sleep-()-seconds",

	// Loops
	"controls_repeat": "Repeat-()-times",
	"controls_whileUntil": "Repeat-while-()",
	
	// IO
	"setdigitalpin": "Set-digital-pin-()-to-()",
	"invertdigitalpin": "Invert-digital-pin-()",
	"getdigitalpin": "Get-digital-pin-value-()",
	"getanalogpin": "Get-analog-pin-value-()-in-()",
	"getexternalanalogchannel": "Get-analog-value-from-()-()-in-()",
	"setpwmpin": "Set-PWM-pin-()-to-frequency-()-hertzs-and-duty-()-%25",
	"when_digital_pin": "When-digital-pin-()-changes-at-()"
}

Blockly.Block.prototype.isHatBlock = function() {
	var hatBlocks = [
		'when_board_starts', 'when_i_receive', 'when_digital_pin', 'when_i_receive_a_lora_frame', 'sensor_when', 'execute_every', 'thread', 'mqtt_subscribe'
	];
	
	return (hatBlocks.indexOf(this.type) != -1);
}

Blockly.Block.prototype.isInHatBlock = function() {
	var hatBlocks = [
		'when_board_starts', 'when_i_receive', 'when_digital_pin', 'when_i_receive_a_lora_frame', 'sensor_when', 'execute_every', 'thread', 'mqtt_subscribe'
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

Blockly.Block.prototype.getHelpUrl = function()  {
	var url;
	
	if (typeof IDEHelp[this.type] != "undefined") {
		url = 'https://ide.whitecatboard.org/wiki/' + IDEHelp[this.type];
	} else {
		url = '';
		
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