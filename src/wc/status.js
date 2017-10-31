/**
 *
 * The Whitecat IDE - Statusbar management functions
 *
 * Copyright (C) 2015 - 2016
 * IBEROXARXA SERVICIOS INTEGRALES, S.L.
 * 
 * Author: Jaume Olivé (jolive@iberoxarxa.com / jolive@whitecatboard.org)
 *
 * -----------------------------------------------------------------------
 * 
 * Blockly Demos: Code
 *
 * Copyright 2012 Google Inc.
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

'use strict';

var statusType = {
	Alert: 0,
	Info: 1,
	Nothing: 3,
	Progress: 4
};

var Status = {};

Status.messages = [];

Status.messages["Downloading prerequisites"] = {tag: "downloadingPrerequisites", type: statusType.Progress, zone: "statusBar1"};
Status.messages["Uploading framework"] = {tag: "uploadingFramework", type: statusType.Progress, zone: "statusBar1"};
Status.messages["Downloading esptool"] = {tag: "downloadingEsptool", type: statusType.Progress, zone: "statusBar1"};
Status.messages["Unpacking esptool"] = {tag: "unpackingEsptool", type: statusType.Progress, zone: "statusBar1"};
Status.messages["Downloading firmware"] = {tag: "downloadingFirmware", type: statusType.Progress, zone: "statusBar1"};
Status.messages["Unpacking firmware"] = {tag: "unpackingFirmware", type: statusType.Progress, zone: "statusBar1"};
Status.messages["No board attached"] = {tag: "noBoardAttached", type: statusType.Alert, page: "wiki/Errors:--No-board-attached", zone: "statusBar1"};
Status.messages["Scanning boards"] = {tag: "scanningBoards", type: statusType.Progress, zone: "statusBar1"};
Status.messages["Python not found"] = {tag: "pythonNotFound", type: statusType.Aler, zone: "statusBar1"};
Status.messages["Reseting board"] = {tag: "resetingBoard", type: statusType.Progress, zone: "statusBar1"};
Status.messages["Stopping program"] = {tag: "stoppingProgram", type: statusType.Progress, zone: "statusBar1"};
Status.messages["Can't connect to agent"] = {tag: "cannotConnectToAgent", type: statusType.Alert, page: "wiki/Errors:--Can't-connect-to-agent", zone: "statusBar1"};
Status.messages["Connect a board"] = {tag: "connectABoard", type: statusType.Alert, zone: "statusBar1"};
Status.messages["Corrupted firmware"] = {tag: "corruptedFirmware", type: statusType.Alert, zone: "statusBar1"};
Status.messages["Flash error"] = {tag: "flashError", type: statusType.Alert, zone: "statusBar1"};

Status.messages["Whitecat N1 ESP32"] = {tag: "boardAttached", type: statusType.Info, zone: "statusBar1"};
Status.messages["ESP32 Thing"] = {tag: "boardAttached", type: statusType.Info, zone: "statusBar1"};
Status.messages["ESP32 Core Board"] = {tag: "boardAttached", type: statusType.Info, zone: "statusBar1"};

Status.messages["cloudConsoleOn"] = {tag: "cloudConsoleOn", type: statusType.Info, zone: "statusBar2"};
Status.messages["cloudConsoleOff"] = {tag: "cloudConsoleOff", type: statusType.Info, zone: "statusBar2"};

Status.current = {
	type: statusType.Nothing,
	message: ""
}

Status.show = function(message) {
	var messageMap = Status.messages[message];
	var type = statusType.Info;
	var tag = "";
	var url = undefined;
	var zone = "";
	
	// Get the status type, tag, and url from the message map
	if (typeof messageMap != "undefined") {
		type = messageMap.type;
		tag = messageMap.tag;
		zone = messageMap.zone;
		
		if (typeof messageMap.page != "undefined") {
			url = messageMap.page;			
		}
	} else {
		zone = "statusBar1";
	}
	 
	// Show the status only is a new status
	if ((Status.current.type != type) || (Status.current.message != message)) {
		// Remove all additional styles
		jQuery("." + zone).removeClass("statusBarClick").unbind("click");
		
		// Store current status
		Status.current.type = type;
		Status.current.message = message;
		
		// Translate message
		var messageTrans = message;
	
		if (typeof(MSG[tag]) != "undefined") {
			messageTrans = MSG[tag];
		}
		
		if (type == statusType.Progress) {
			messageTrans = messageTrans + " ...";
		}

		// Each status type can have it's own icon
		var icon = "";
		switch (type) {
			case statusType.Alert:
				icon = "warning2";
				break;
		}
				
		// Get the html
		var html;

		// Put message
		if (type == statusType.Progress) {
			html = '<span class="statusBarText noselect">'+messageTrans+'</span>';	
		} else {
			html = '<span class="statusBarText noselect">'+messageTrans+'</span>';	
			if (tag == "boardAttached") {
				html += '<span class="icon icon-arrow-down5" style="margin-right: 2px;vertical-align: text-bottom;"></span>';	
			}				
			if ((tag == "cloudConsoleOn") || (tag == "cloudConsoleOff")) {
				html += '<span class="icon icon-arrow-down5" style="margin-right: 2px;vertical-align: text-bottom;"></span>';	
			}				
		}
		
		// Add icon
		if (icon) {
			html = '<i class="icon icon-'+icon+'"></i><span>'+html+'</span>';			
		}
						
		if (type == statusType.Alert) {
			// Alerts are bind to an url that contains information about it
			jQuery("." + zone).addClass("statusBarClick").bind('click', function(e) {
				if (typeof url != "undefined") {
					if (typeof require != "undefined") {
						if (typeof require('nw.gui') != "undefined") {
							Code.Help.show("alerts", url);
						} else {
							Code.Help.show("alerts", url);
						}
					} else {
						Code.Help.show("alerts", url);
					}	
				}				
			});			
		} else if (type == statusType.Info) {
			if (tag == "boardAttached") {
				jQuery("." + zone).addClass("statusBarClick").bind('click', function(e) {
					jQuery("#cloudConsole").hide();
					jQuery("#cloudConsole").attr("data-visibe","false");
					
					if (Code.agent.version > "1.2") {
						var visible = jQuery("#boardConsole").attr("data-visibe");
						if (typeof visible == "undefined") {
							visible = false;
						}
					
						if ((visible == "") || (visible == "false")) {
							jQuery("#boardConsole").show();
							jQuery("#boardConsole").attr("data-visibe","true");
							jQuery("#boardConsole").focus();
						} else {
							jQuery("#boardConsole").hide();
							jQuery("#boardConsole").attr("data-visibe","false");
						}
					} else {
						Code.showAlert(MSG['thisFuntionRequiresUpdateAgent']);
					}
				});
			}

			if ((tag == "cloudConsoleOn") || (tag == "cloudConsoleOff"))  {
				jQuery("." + zone).addClass("statusBarClick").bind('click', function(e) {
					jQuery("#boardConsole").hide();
					jQuery("#boardConsole").attr("data-visibe","false");

					var visible = jQuery("#cloudConsole").attr("data-visibe");
					if (typeof visible == "undefined") {
						visible = false;
					}
					
					if ((visible == "") || (visible == "false")) {
						jQuery("#cloudConsole").show();
						jQuery("#cloudConsole").attr("data-visibe","true");
					} else {
						jQuery("#cloudConsole").hide();
						jQuery("#cloudConsole").attr("data-visibe","false");						
					}
				});
			}
		}
		
		if (tag == "cloudConsoleOff") {
			jQuery("." + zone).html(html).hide();
			jQuery("#cloudConsole").hide();
			jQuery("#cloudConsole").attr("data-visibe","false");						
		} else {
			jQuery("." + zone).html(html).show();				
		}
	}
}

Status.hide = function() {
	jQuery(".statusBar1").hide();	
	jQuery(".statusBar2").hide();	
}