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

Status.current = {
	type: statusType.Nothing,
	message: ""
}

Status.alertAction = {
	cannotConnectToAgent: {
		url: "https://whitecatboard.org/git/wiki/whitecat-ide/Errors:--Can't-connect-to-agent"
	},
	
	noBoardAttached: {
		url: "https://whitecatboard.org/git/wiki/whitecat-ide/Errors:--No-board-attached"
	}
}

Status.show = function(type, tag, message) {
	// Show the status only is a new status
	if ((Status.current.type != type) || (Status.current.message != message)) {
		// Remove all additional styles
		jQuery(".statusBar").removeClass("statusBarClick").unbind("click");
		
		// Store current status
		Status.current.type = type;
		Status.current.message = message;
		
		// Translate message
		var messageTrans = message;
	
		if (typeof(MSG[message]) != "undefined") {
			messageTrans = MSG[message];
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
			html = '<span class="statusBarText noselect">'+messageTrans+' ...</span>';	
		} else {
			html = '<span class="statusBarText noselect">'+messageTrans+'</span>';	
			if (tag == "boardAttached") {
				html += '<span class="icon icon-arrow-down5" style="margin-right: 2px;vertical-align: text-bottom;"></span>';	
			}				
		}
		
		// Add icon
		if (icon) {
			html = '<i class="icon icon-'+icon+'"></i><span>'+html+'</span>';			
		}
						
		if (type == statusType.Alert) {
			// Alerts are bind to an url that contains information about it
			jQuery(".statusBar").addClass("statusBarClick").bind('click', function(e) {
				if (typeof Status.alertAction[tag] != "undefined") {
					if (typeof require != "undefined") {
						if (typeof require('nw.gui') != "undefined") {
							var win = gui.Window.open(Status.alertAction[tag].url, {
							  focus: true,
							  position: 'center',
							  width: 1055,
							  height: 700
							});
						} else {
							window.open(Status.alertAction[tag].url, '_blank');
						}
					} else {
						window.open(Status.alertAction[tag].url, '_blank');					
					}	
				}				
			});			
		} else if (type == statusType.Info) {
			if (tag == "boardAttached") {
				jQuery(".statusBar").addClass("statusBarClick").bind('click', function(e) {
					if (Code.agent.version > "1.2") {
						Term.show();
					} else {
						Code.showAlert(MSG['thisFuntionRequiresUpdateAgent']);
					}
				});
			}
		}
		
		jQuery(".statusBar").html(html).show();			
	}
}

Status.hide = function() {
	jQuery(".statusBar").hide();	
}