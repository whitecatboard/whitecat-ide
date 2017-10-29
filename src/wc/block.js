'use strict';

var IDEHelp = {
	// Events
	"broadcast": "wiki/Broadcast-()",
	"broadcast_and_wait": "wiki/Broadcast-()-and-wait",
	"when_board_starts": "wiki/When-board-starts",
	"when_i_receive": "wiki/When-I-receive-()",
	"execute_every": "wiki/Every-()-(unit)",
	"thread": "wiki/Forever",

	// Delays
	"wait_for": "wiki/Wait-()-(unit)",
	"cpu_sleep": "wiki/Sleep-()-seconds",

	// Loops
	"controls_repeat": "wiki/Repeat-()-times",
	"controls_whileUntil": "wiki/Repeat-while-()",
	
	// IO
	"setdigitalpin": "wiki/Set-digital-pin-()-to-()",
	"invertdigitalpin": "wiki/Invert-digital-pin-()",
	"getdigitalpin": "wiki/Get-digital-pin-value-()",
	"getanalogpin": "wiki/Get-analog-pin-value-()-in-()",
	"getexternalanalogchannel": "wiki/Get-analog-value-from-()-()-in-()",
	"setpwmpin": "wiki/Set-PWM-pin-()-to-frequency-()-hertzs-and-duty-()-%25",
	"when_digital_pin": "wiki/When-digital-pin-()-changes-at-()",
	
	// Wi-Fi
	"wifi_start": "wiki/Start-Wi-Fi",
	"wifi_stop": "wiki/Stop-Wi-Fi",
	
	// MQTT 
	"mqtt_subscribe": "wiki/When-a-message-is-received-to-topic-()-with-()-with:-length,-payload",
	"mqtt_publish": "wiki/Publish-()-to-topic-()-with-()",
	
	// LORA
	"when_i_receive_a_lora_frame": "wiki/When-I-receive-a-LoRa-frame-with:-port,-payload",
	"lora_tx": "wiki/Transmit-()-frame-to-port-()",
	
	// BITWISE
	"bitwise_unary_op": "wiki/Bitwise-(operator)-(operand)",
	"bitwise_op": "wiki/Bitwise-(operand)-(operator)-(operand)",
	 
	// Pack / unpack 
	"text_pack": "wiki/Pack-hex-string-with-(),-with(),-...",
	"text_unpack": "wiki/Unpack-hex-string-()-to-(),-to-(),-...",
	
	"math_round": "wiki/Numbers:-(round-function)-()",
	"math_number": "wiki/Numbers:-(value)",
	"math_arithmetic": "wiki/Numbers:-(operand)-(operator)-(operand)",
	"math_single": "wiki/Numbers:-(function)-()",
	"math_trig": "wiki/Numbers:-(trigonometric-function)-()",
	"math_constant": "wiki/Numbers:-(constant)",
	"math_number_property": "wiki/Numbers:-()-is-(property)",
	"math_on_list": "wiki/Numbers:-(operation)-of-list-()",
	"math_modulo": "wiki/Numbers:-remainder-of-()-()",
	"math_constrain": "wiki/Numbers:-constraint-()-low-()-high-()",
	"math_random_int": "wiki/Numbers:-random-integer-from-()-to-()",
	"math_random_float": "wiki/Numbers:-random-fraction"
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
		url = IDEHelp[this.type];
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