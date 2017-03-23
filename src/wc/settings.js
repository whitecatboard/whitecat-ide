/*
 * Whitecat Ecosystem Blockly Based Web IDE
 *
 * IDE settings manamgement functions
 *
 * Copyright (C) 2015 - 2016
 * IBEROXARXA SERVICIOS INTEGRALES, S.L. & CSS IBÉRICA, S.L.
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

var Settings = {};

Settings.load = function(appSettings) {
	if (typeof require != "undefined") {
		if (typeof require('nw.gui') != "undefined") {
		    var fs = require("fs");
		    var path = require('path');
  
		    var file = 'settings.json';
		    var filePath = path.join(process.cwd(), file);  

			try {
				var data = fs.readFileSync(filePath, "utf8");
			} catch (error) {
				return;
			}

			try {
				var settings = JSON.parse(data);
		
				if (settings.hasOwnProperty("language")) {
					appSettings.language = settings.language;
				}

				if (settings.hasOwnProperty("board")) {
					appSettings.board = settings.board;
				}
			} catch (error) {
				Code.showError(MSG['error'], MSG['youHaveAnErrorInSettings'] + '<br><br>' + error);	
			}
		}
	}
}

Settings.save = function(appSettings) {
	if (typeof require != "undefined") {
		if (typeof require('nw.gui') != "undefined") {
		    var fs = require('fs');
		    var path = require('path');
  
		    var file = 'settings.json';
		    var filePath = path.join(process.cwd(), file);  
    
		    fs.writeFileSync(filePath, JSON.stringify(appSettings));
		}
	}
}