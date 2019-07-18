/*
 * Whitecat Blocky Environment, LoRa WAN flyout category management
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

goog.provide('Blockly.Lora');

goog.require('Blockly.Blocks');
goog.require('Blockly.Workspace');
goog.require('goog.string');

Blockly.Lora.NAME_TYPE = 'LORA';

Blockly.Lora.flyoutCategory = function(workspace) {
	var xmlList = [];
	var lora = workspace.lora;

	var button = goog.dom.createDom('button');
	button.setAttribute('text', Blockly.Msg.CONFIGURE_LORA);
	button.setAttribute('callbackKey', 'CONFIGURE_LORA');

	workspace.registerButtonCallback('CONFIGURE_LORA', function(button) {
		Blockly.Lora.configure(button.getTargetWorkspace());
	});

	xmlList.push(button);

	if ((Blockly.Blocks['when_i_receive_a_lora_frame']) && (workspace.lora.role == "node")) {
		var block = goog.dom.createDom('block');
		block.setAttribute('type', 'when_i_receive_a_lora_frame');

		xmlList.push(block);
	}
	
	if (Blockly.Blocks['lora_start_gw'] && (workspace.lora.role == "gateway")) {
		var mutation = goog.dom.createDom('mutation', '');
		mutation.setAttribute('band', lora.band);
		mutation.setAttribute('freq', lora.freq);
		mutation.setAttribute('dr', lora.dr);
		mutation.setAttribute('role', lora.role);

		var block = goog.dom.createDom('block');
		block.setAttribute('type', 'lora_start_gw');

		block.appendChild(mutation);

		xmlList.push(block);
	}

/*
	if (Blockly.Blocks['lora_stop_gw'] && (workspace.lora.role == "gateway")) {
		var mutation = goog.dom.createDom('mutation', '');
		mutation.setAttribute('band', lora.band);
		mutation.setAttribute('dr', lora.dr);
		mutation.setAttribute('role', lora.role);

		var block = goog.dom.createDom('block');
		block.setAttribute('type', 'lora_stop_gw');

		block.appendChild(mutation);

		xmlList.push(block);
	}
*/
		
	if (Blockly.Blocks['lora_join'] && (workspace.lora.activation == 'OTAA') && (workspace.lora.role == "node")) {
		var mutation = goog.dom.createDom('mutation', '');
		mutation.setAttribute('band', lora.band);
		mutation.setAttribute('role', lora.role);
		mutation.setAttribute('activation', lora.activation);
		mutation.setAttribute('dr', lora.dr);
		mutation.setAttribute('retx', lora.retx);
		mutation.setAttribute('adr', lora.adr);
		mutation.setAttribute('deveui', lora.deveui);
		mutation.setAttribute('appeui', lora.appeui);
		mutation.setAttribute('appkey', lora.appkey);
		mutation.setAttribute('devaddr', lora.devaddr);
		mutation.setAttribute('nwkskey', lora.nwkskey);
		mutation.setAttribute('appskey', lora.appskey)

		var block = goog.dom.createDom('block');
		block.setAttribute('type', 'lora_join');

		block.appendChild(mutation);

		xmlList.push(block);
	}

	if ((Blockly.Blocks['lora_tx']) && (workspace.lora.role == "node")) {
		var mutation = goog.dom.createDom('mutation', '');
		mutation.setAttribute('band', lora.band);
		mutation.setAttribute('role', lora.role);
		mutation.setAttribute('activation', lora.activation);
		mutation.setAttribute('dr', lora.dr);
		mutation.setAttribute('retx', lora.retx);
		mutation.setAttribute('adr', lora.adr);
		mutation.setAttribute('deveui', lora.deveui);
		mutation.setAttribute('appeui', lora.appeui);
		mutation.setAttribute('appkey', lora.appkey);
		mutation.setAttribute('devaddr', lora.devaddr);
		mutation.setAttribute('nwkskey', lora.nwkskey);
		mutation.setAttribute('appskey', lora.appskey)

		var block = goog.dom.createDom('block');
		block.setAttribute('type', 'lora_tx');

		var field = goog.dom.createDom('field',null,"1");
		field.setAttribute('name', 'NUM');

		var shadow = goog.dom.createDom('shadow');
		shadow.setAttribute('type', 'math_number');
		shadow.appendChild(field);

		var value = goog.dom.createDom('value');
		value.setAttribute('name', 'PORT');
		value.appendChild(shadow);

		block.appendChild(value);

		var field = goog.dom.createDom('field', null, "");
		field.setAttribute('name', 'TEXT');

		var field = goog.dom.createDom('field',null,"");
		field.setAttribute('name', 'TEXT');

		var shadow = goog.dom.createDom('shadow');
		shadow.setAttribute('type', 'text');
		shadow.appendChild(field);

		var value = goog.dom.createDom('value');
		value.setAttribute('name', 'PAYLOAD');
		value.appendChild(shadow);

		block.appendChild(value);

		block.appendChild(mutation);

		xmlList.push(block);
	}

	if ((Blockly.Blocks['text_pack']) && (workspace.lora.role == "node")) {
		var block = goog.dom.createDom('block');
		block.setAttribute('type', 'text_pack');
		xmlList.push(block);
	}

	if ((Blockly.Blocks['text_unpack']) && (workspace.lora.role == "node")) {
		var block = goog.dom.createDom('block');
		block.setAttribute('type', 'text_unpack');
		xmlList.push(block);
	}
	

	return xmlList;
};

Blockly.Lora.configure = function(workspace, opt_callback, block) {
	var dialogForm = "";
	var edit = false;

	if (typeof block != "undefined") edit = true;

	// Build band selection
	var loraBandSelect = '<select id="band" name="band" onchange="Blockly.Lora.bandChanged()">';
	loraBandSelect += '<option data-band="868" '+(workspace.lora.band=="868"?"selected":"")+' value="868">868 (Europe) MHz</option>';
//	loraBandSelect += '<option data-band="915" '+(workspace.lora.band=="915"?"selected":"")+' value="915">915 (United States) MHz</option>';
	loraBandSelect += "</select>";

	// Build lora role selection
	var loraRoleSelect = '<select id="role" name="role" onchange="Blockly.Lora.roleChanged()">';
	loraRoleSelect += '<option data-role="node" '+(workspace.lora.role=="node"?"selected":"")+' value="node">'+Blockly.Msg.LORA_NODE+'</option>';
	loraRoleSelect += '<option data-role="gateway" '+(workspace.lora.role=="gateway"?"selected":"")+' value="gateway">'+Blockly.Msg.LORA_GATEWAY+'</option>';
	loraRoleSelect += "</select>";
	
	// Build activation selection
	var loraActivationSelect = '<select id="activation" name="activation" onchange="Blockly.Lora.activationChanged()">';
	loraActivationSelect += '<option data-band="OTAA" '+(workspace.lora.activation=="OTAA"?"selected":"")+' value="OTAA">OTAA</option>';
	loraActivationSelect += '<option data-band="ABP" '+(workspace.lora.activation=="ABP"?"selected":"")+' value="ABP">ABP</option>';
	loraActivationSelect += "</select>";

	// Build frequency selection
	var loraFreqSelect = '<select id="freq" name="freq">';
	loraFreqSelect += "</select>";

	// Build data rate selection
	var loraDRSelect = '<select id="dr" name="dr">';
	loraDRSelect += "</select>";

	// Build retransmissions selection
	var loraRETXSelect = '<select id="retx" name="retx">';
	loraRETXSelect += '<option data-retx="0" '+(workspace.lora.retx=="0"?"selected":"")+' value="0">0</option>';
	loraRETXSelect += '<option data-retx="1" '+(workspace.lora.retx=="1"?"selected":"")+' value="1">1</option>';
	loraRETXSelect += '<option data-retx="2" '+(workspace.lora.retx=="2"?"selected":"")+' value="2">2</option>';
	loraRETXSelect += '<option data-retx="3" '+(workspace.lora.retx=="3"?"selected":"")+' value="3">3</option>';
	loraRETXSelect += '<option data-retx="4" '+(workspace.lora.retx=="4"?"selected":"")+' value="4">4</option>';
	loraRETXSelect += '<option data-retx="5" '+(workspace.lora.retx=="5"?"selected":"")+' value="5">5</option>';
	loraRETXSelect += '<option data-retx="6" '+(workspace.lora.retx=="6"?"selected":"")+' value="6">6</option>';
	loraRETXSelect += '<option data-retx="7" '+(workspace.lora.retx=="7"?"selected":"")+' value="7">7</option>';
	loraRETXSelect += '<option data-retx="8" '+(workspace.lora.retx=="8"?"selected":"")+' value="8">8</option>';
	loraRETXSelect += "</select>";
	
	dialogForm = '<form id="lora_form">';
	dialogForm += '<div>';
	dialogForm += '<label for="band">' + Blockly.Msg.LORA_BAND + ':&nbsp;&nbsp;</label>' + loraBandSelect;
	dialogForm += '</div>';
	dialogForm += '<div>';
	dialogForm += '<label for="role">' + Blockly.Msg.LORA_ROLE + ':&nbsp;&nbsp;</label>' + loraRoleSelect;
	dialogForm += '</div><br>';
	dialogForm += '<div style="margin: 0px;border-bottom: 1px solid #e5e5e5;">';
	dialogForm += '<label class="role-node" style="display: none;">'+Blockly.Msg.LORA_ROLE_NODE_TITLE+'&nbsp;&nbsp;</label>';
	dialogForm += '<label class="role-gateway" style="display: none;">'+Blockly.Msg.LORA_ROLE_GATEWAY_TITLE+'&nbsp;&nbsp;</label>';
	dialogForm += '</div><br>';
	dialogForm += '<div class="role-node" style="display: none;">';
	dialogForm += '<label for="activation">' + Blockly.Msg.LORA_ACTIVATION + ':&nbsp;&nbsp;</label>' + loraActivationSelect;
	dialogForm += '</div>';
	dialogForm += '<div class="role-gateway" style="display: none;">';
	dialogForm += '<label for="freq">' + Blockly.Msg.LORA_FREQ + ':&nbsp;&nbsp;</label>' + loraFreqSelect;
	dialogForm += '</div>';
	dialogForm += '<div>';
	dialogForm += '<label for="dr">' + Blockly.Msg.LORA_DR + ':&nbsp;&nbsp;</label>' + loraDRSelect;
	dialogForm += '</div>';
	dialogForm += '<div class="role-node" style="display: none;">';
	dialogForm += '<label for="retx">' + Blockly.Msg.LORA_CONFIG_RETX + ':&nbsp;&nbsp;</label>' + loraRETXSelect;
	dialogForm += '</div>';
	dialogForm += '<div>';
	dialogForm += '<div><br>';
			
	dialogForm += '<div id="OTAA" style="display: none;">';
	dialogForm += '<div style="margin: 0px;border-bottom: 1px solid #e5e5e5;">';
	dialogForm += '<label>'+Blockly.Msg.LORA_ACTIVATION_DATA+'&nbsp;&nbsp;</label>';
	dialogForm += '</div><br>';
	dialogForm += '<div>';
	
	if (Code.status.hasOwnProperty("eui")) {
		dialogForm += '<label for="DevEUI">DevEUI:&nbsp;&nbsp;</label>'+Code.status.eui+'<input id="DevEUI" name="DevEUI" type="hidden" value="'+Code.status.eui+'">';				
	} else {
		dialogForm += '<label for="DevEUI">DevEUI:&nbsp;&nbsp;</label><input id="DevEUI" name="DevEUI" style="width:300px;" value="'+workspace.lora.deveui+'">';		
	}
	
	dialogForm += '</div>';
	dialogForm += '<div>';
	dialogForm += '<label for="AppEUI">AppEUI:&nbsp;&nbsp;</label><input id="AppEUI" name="AppEUI" style="width:300px;" value="'+workspace.lora.appeui+'">';
	dialogForm += '</div>';
	dialogForm += '<div>';
	dialogForm += '<label for="AppKey">AppKey:&nbsp;&nbsp;</label><input id="AppKey" name="AppKey" style="width:300px;" value="'+workspace.lora.appkey+'">';
	dialogForm += '</div>';
	//dialogForm += '<br><span>'+Blockly.Msg.LORA_GET_OTAA_DATA_HELP+'</span><br>';
	//dialogForm += '<br><button type="button" class="btn btn-primary" id="getOTAAData">'+Blockly.Msg.LORA_GET_DATA+'</button>&nbsp;<span id="waitingOTAA" class="waiting"><i class="spinner icon icon-spinner3"></i></span><br>';
	dialogForm += '</div>';

	dialogForm += '<div id="ABP" style="display: none;">';
	dialogForm += '<div style="margin: 0px;border-bottom: 1px solid #e5e5e5;">';
	dialogForm += '<label>'+Blockly.Msg.LORA_PERSONALIZATION_DATA+'&nbsp;&nbsp;</label>';
	dialogForm += '</div><br>';
	dialogForm += '<div>';
	dialogForm += '<label for="DevAddr">DevAddr:&nbsp;&nbsp;</label><input id="DevAddr" name="DevAddr" style="width:300px;" value="'+workspace.lora.devaddr+'">';
	dialogForm += '</div>';
	dialogForm += '<div>';
	dialogForm += '<label for="NwkSKey">NwkSKey:&nbsp;&nbsp;</label><input id="NwkSKey" name="NwkSKey" style="width:300px;" value="'+workspace.lora.nwkskey+'">';
	dialogForm += '</div>';
	dialogForm += '<div>';
	dialogForm += '<label for="AppSKey">AppSKey:&nbsp;&nbsp;</label><input id="AppSKey" name="AppSKey" style="width:300px;" value="'+workspace.lora.appskey+'">';
	dialogForm += '</div>';
	//dialogForm += '<br><span>'+Blockly.Msg.LORA_GET_ABP_DATA_HELP+'</span><br>';
	//dialogForm += '<br><button type="button" class="btn btn-primary" id="getABPData">'+Blockly.Msg.LORA_GET_DATA+'</button>&nbsp;<span id="waitingABP" class="waiting"><i class="spinner icon icon-spinner3"></i></span><br>';
	dialogForm += '</div>';
	dialogForm += '<span class="error-msg" id="errors"></span>';

	dialogForm += '</form>';
	
	var box = bootbox.dialog({
		title: Blockly.Msg.LORA_CONFIG_TITLE,
		message: dialogForm,
		buttons: {
			main: {
				label: Blockly.Msg.CONFIGURE,
				classensor: "btn-primary",
				callback: function() {
					var form = jQuery("#lora_form");
					
					var band = form.find("#band").find(":selected").attr("value");
					var role = form.find("#role").find(":selected").attr("value");
					var activation = form.find("#activation").find(":selected").attr("value");
					var freq = form.find("#freq").find(":selected").attr("value");
					var dr = form.find("#dr").find(":selected").attr("value");
					var retx = form.find("#retx").find(":selected").attr("value");
					var adr = false;
					var DevEUI = form.find("#DevEUI").val();
					var AppEUI = form.find("#AppEUI").val();
					var AppKey = form.find("#AppKey").val();
					var DevAddr = form.find("#DevAddr").val();
					var NwkSKey = form.find("#NwkSKey").val();
					var AppSKey = form.find("#AppSKey").val();	
					
					var key16 = /[0-9A-Fa-f]{16}/;
					var key32 = /[0-9A-Fa-f]{32}/;
					var key8 = /[0-9A-Fa-f]{8}/;

					var error = false;
					form.find("#errors").html("");
					if (role == "node") {
						if (activation == 'OTAA') {
							if (!(key16.test(DevEUI))) {
								form.find("#errors").html(form.find("#errors").html() + "<br>" + Blockly.Msg.LORA_INVALID.replace('%1', 'DevEUI'));
								error = true;
							}

							if (!(key16.test(AppEUI))) {
								form.find("#errors").html(form.find("#errors").html() + "<br>" + Blockly.Msg.LORA_INVALID.replace('%1', 'AppEUI'));
								error = true;
							}

							if (!(key32.test(AppKey))) {
								form.find("#errors").html(form.find("#errors").html() + "<br>" + Blockly.Msg.LORA_INVALID.replace('%1', 'AppKey'));
								error = true;
							}						
						} else {
							if (!(key8.test(DevAddr))) {
								form.find("#errors").html(form.find("#errors").html() + "<br>" + Blockly.Msg.LORA_INVALID.replace('%1', 'DevAddr'));
								error = true;
							}

							if (!(key32.test(NwkSKey))) {
								form.find("#errors").html(form.find("#errors").html() + "<br>" + Blockly.Msg.LORA_INVALID.replace('%1', 'NwkSKey'));
								error = true;
							}

							if (!(key32.test(AppSKey))) {
								form.find("#errors").html(form.find("#errors").html() + "<br>" + Blockly.Msg.LORA_INVALID.replace('%1', 'AppSKey'));
								error = true;
							}												
						}						
					}
					
					if (error) {
						return false;
					}
					
					workspace.configureLora({
						"band": band,
						"freq": freq,
						"activation": activation,
						"dr": dr,
						"role": role,
						"retx": retx,
						"adr": adr,
						"deveui": DevEUI,
						"appeui": AppEUI,
						"appkey": AppKey,
						"devaddr": DevAddr,
						"nwkskey": NwkSKey,
						"appskey": AppSKey						
					});
					
					workspace.toolbox_.refreshSelection();
				}
			},
			danger: {
				label: Blockly.Msg.CANCEL,
				classensor: "btn-danger",
				callback: function() {}
			},
		},
		closable: false
	});
	
	box.bind('shown.bs.modal', function(){
		var form = jQuery("#lora_form");
		
		form.find("#getOTAAData").click(function() {
			jQuery("#waitingOTAA").show();
			jQuery.ajax({
				url: Code.server + "/?nodeRegister",
				type: "POST",
				success: function(result) {
					jQuery("#waitingOTAA").hide();
					result = JSON.parse(result);
					if (result.success) {
						result = JSON.parse(result.result);
						
						form.find("#AppEUI").val(result.OTAA.AppEUI);
						form.find("#DevEUI").val(result.OTAA.DevEUI);
						form.find("#AppKey").val(result.OTAA.AppKey);
					} else {
						form.find("#errors").html(result.result);
					}
				},

				error: function() {
					jQuery("#waitingOTAA").hide();
				}
			});					
		});

		form.find("#getABPData").click(function() {
			jQuery("#waitingABP").show();
			jQuery.ajax({
				url: Code.server + "/?nodeRegister",
				type: "POST",
				success: function(result) {
					jQuery("#waitingABP").hide();
					result = JSON.parse(result);
					if (result.success) {
						result = JSON.parse(result.result);
						
						form.find("#DevAddr").val(result.ABP.DevAddr);
						form.find("#NwkSKey").val(result.ABP.NwkSKey);
						form.find("#AppSKey").val(result.ABP.AppSKey);
					} else {
						form.find("#errors").html(result.result);
					}
				},

				error: function() {
					jQuery("#waitingABP").hide();
				}
			});	
		});

		jQuery(':checkbox').checkboxpicker({
		  html: true,
		  offLabel: '<span class="glyphicon glyphicon-remove">',
		  onLabel: '<span class="glyphicon glyphicon-ok">',
		}).on('change', function() {
			var form = jQuery("#lora_form");
			
			form.find("#adr").val(this.checked);			
		}).prop('checked', workspace.lora.adr == 'true');
		
		Blockly.Lora.bandChanged();
		Blockly.Lora.roleChanged();
	});
};

Blockly.Lora.bandChanged = function() {
	var form = jQuery("#lora_form");
	var workspace = Code.workspace.blocks;
	var dr = [];
	var freq = [];
	
	// Get selected band
	var band = form.find('#band').find(":selected").attr("value");
	if (band == 868) {
		dr.push(0);
		dr.push(1);
		dr.push(2);
		dr.push(3);
		dr.push(4);
		dr.push(5);
		dr.push(6);
		dr.push(7);
		
		freq.push(868100000);
		freq.push(868300000);
		freq.push(868500000);
		freq.push(867100000);
		freq.push(867300000);
		freq.push(867500000);
		freq.push(867700000);
		freq.push(867900000);		
	}

	var options = '';
	dr.forEach(function(item) {
		options += '<option data-dr="'+item+'" '+(workspace.lora.dr==item?"selected":"")+' value="'+item+'">'+item+'</option>';
	});
	
	form.find('#dr').html(options);

	var options = '';
	freq.forEach(function(item) {
		options += '<option data-freq="'+item+'" '+(workspace.lora.freq==item?"selected":"")+' value="'+item+'">'+(item/1000000)+ " " + Blockly.Msg.MHZ +'</option>';
	});
	
	form.find('#freq').html(options);
};

Blockly.Lora.roleChanged = function() {
	var form = jQuery("#lora_form");
		
	// Get selected role
	var role = form.find('#role').find(":selected").attr("value");
	
	if (role == "node") {
		form.find(".role-node").show();
		form.find(".role-gateway").hide();
	} else if (role == "gateway") {
		form.find(".role-node").hide();		
		form.find(".role-gateway").show();
	}

	Blockly.Lora.activationChanged();
	
	form.find("#errors").html("");
};

Blockly.Lora.activationChanged = function() {
	var form = jQuery("#lora_form");

	// Get activation
	var activation = form.find("#activation").find(":selected").attr("value");

	// Get role
	var role = form.find('#role').find(":selected").attr("value");

	if (role == "node") {
		if (activation == 'OTAA') {
			form.find("#OTAA").show();		
			form.find("#ABP").hide();		
		} else {
			form.find("#OTAA").hide();		
			form.find("#ABP").show();				
		}		
	} else if (role == "gateway") {
		form.find("#ABP").hide();		
		form.find("#OTAA").hide();				
	}
	
	form.find("#errors").html("");
};