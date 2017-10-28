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

	if (Blockly.Blocks['when_i_receive_a_lora_frame']) {
		var block = goog.dom.createDom('block');
		block.setAttribute('type', 'when_i_receive_a_lora_frame');

		xmlList.push(block);
	}
	
	if (Blockly.Blocks['lora_join'] && (workspace.lora.activation == 'OTAA')) {
		var mutation = goog.dom.createDom('mutation', '');
		mutation.setAttribute('band', lora.band);
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

	if (Blockly.Blocks['lora_tx']) {
		var mutation = goog.dom.createDom('mutation', '');
		mutation.setAttribute('band', lora.band);
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

	return xmlList;
};

Blockly.Lora.configure = function(workspace, opt_callback, block) {
	var dialogForm = "";
	var edit = false;

	if (typeof block != "undefined") edit = true;

	// Build band selection
	var loraBandSelect = '<select id="band" name="band">';
	loraBandSelect += '<option data-band="868" '+(workspace.lora.band=="868"?"selected":"")+' value="868">868 (Europe) Mhz</option>';
	loraBandSelect += '<option data-band="433" '+(workspace.lora.band=="433"?"selected":"")+' value="433">433 (United States) Mhz</option>';
	loraBandSelect += "</select>";

	// Build activation selection
	var loraActivationSelect = '<select id="activation" name="activation" onchange="Blockly.Lora.activationChanged()">';
	loraActivationSelect += '<option data-band="ABP" '+(workspace.lora.activation=="ABP"?"selected":"")+' value="ABP">ABP</option>';
	loraActivationSelect += '<option data-band="OTAA" '+(workspace.lora.activation=="OTAA"?"selected":"")+' value="OTAA">OTAA</option>';
	loraActivationSelect += "</select>";

	// Build data rate selection
	var loraDRSelect = '<select id="dr" name="dr">';
	loraDRSelect += '<option data-dr="0" '+(workspace.lora.dr=="0"?"selected":"")+' value="0">0</option>';
	loraDRSelect += '<option data-dr="1" '+(workspace.lora.dr=="1"?"selected":"")+' value="1">1</option>';
	loraDRSelect += '<option data-dr="2" '+(workspace.lora.dr=="2"?"selected":"")+' value="2">2</option>';
	loraDRSelect += '<option data-dr="3"' +(workspace.lora.dr=="3"?"selected":"")+' value="3">3</option>';
	loraDRSelect += '<option data-dr="4" '+(workspace.lora.dr=="4"?"selected":"")+' value="4">4</option>';
	loraDRSelect += '<option data-dr="5" '+(workspace.lora.dr=="5"?"selected":"")+' value="5">5</option>';
	loraDRSelect += '<option data-dr="6" '+(workspace.lora.dr=="6"?"selected":"")+' value="6">6</option>';
	loraDRSelect += '<option data-dr="7" '+(workspace.lora.dr=="7"?"selected":"")+' value="7">7</option>';
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
	dialogForm += '<label for="activation">' + Blockly.Msg.LORA_ACTIVATION + ':&nbsp;&nbsp;</label>' + loraActivationSelect;
	dialogForm += '</div>';
	dialogForm += '<div>';
	dialogForm += '<label for="dr">' + Blockly.Msg.LORA_DR + ':&nbsp;&nbsp;</label>' + loraDRSelect;
	dialogForm += '</div>';
	dialogForm += '<div>';
	dialogForm += '<label for="retx">' + Blockly.Msg.LORA_CONFIG_RETX + ':&nbsp;&nbsp;</label>' + loraRETXSelect;
	dialogForm += '</div>';
	dialogForm += '<div>';
	dialogForm += '<label for="adr">' + Blockly.Msg.LORA_ADR + ':&nbsp;&nbsp;</label><br>';
	dialogForm += '<input id="adr" name="adr" type="checkbox" data-group-cls="btn-group-sm" value="'+workspace.lora.adr+'">';
	dialogForm += '</div>';
	dialogForm += '<div><br>';
			
	dialogForm += '<div id="OTAA" style="display: none;">';
	dialogForm += '<div style="margin: 0px;border-bottom: 1px solid #e5e5e5;">';
	dialogForm += '<label>'+Blockly.Msg.LORA_ACTIVATION_DATA+'&nbsp;&nbsp;</label>';
	dialogForm += '</div><br>';
	dialogForm += '<div>';
	dialogForm += '<label for="DevEUI">DevEUI:&nbsp;&nbsp;</label><input id="DevEUI" name="DevEUI" style="width:300px;" value="'+workspace.lora.deveui+'">';
	dialogForm += '</div>';
	dialogForm += '<div>';
	dialogForm += '<label for="AppEUI">AppEUI:&nbsp;&nbsp;</label><input id="AppEUI" name="AppEUI" style="width:300px;" value="'+workspace.lora.appeui+'">';
	dialogForm += '</div>';
	dialogForm += '<div>';
	dialogForm += '<label for="AppKey">AppKey:&nbsp;&nbsp;</label><input id="AppKey" name="AppKey" style="width:300px;" value="'+workspace.lora.appkey+'">';
	dialogForm += '</div>';
	dialogForm += '<br><span>'+Blockly.Msg.LORA_GET_OTAA_DATA_HELP+'</span><br>';
	dialogForm += '<br><button type="button" class="btn" id="getOTAAData">'+Blockly.Msg.LORA_GET_DATA+'</button>&nbsp;<span id="waitingOTAA" class="waiting"><i class="spinner icon icon-spinner3"></i></span><br>';
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
	dialogForm += '<br><span>'+Blockly.Msg.LORA_GET_ABP_DATA_HELP+'</span><br>';
	dialogForm += '<br><button type="button" class="btn" id="getABPData">'+Blockly.Msg.LORA_GET_DATA+'</button>&nbsp;<span id="waitingABP" class="waiting"><i class="spinner icon icon-spinner3"></i></span><br>';
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
					var activation = form.find("#activation").find(":selected").attr("value");
					var dr = form.find("#dr").find(":selected").attr("value");
					var retx = form.find("#retx").find(":selected").attr("value");
					var adr = form.find("#adr").val();
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
					
					if (error) {
						return false;
					}
					
					workspace.configureLora({
						"band": band,
						"activation": activation,
						"dr": dr,
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
		
		Blockly.Lora.activationChanged();
	});
};

Blockly.Lora.activationChanged = function() {
	var form = jQuery("#lora_form");

	// Get activation
	var activation = form.find("#activation").find(":selected").attr("value");

	if (activation == 'OTAA') {
		form.find("#OTAA").show();		
		form.find("#ABP").hide();		
	} else {
		form.find("#OTAA").hide();		
		form.find("#ABP").show();				
	}
};