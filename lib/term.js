/*
 * Whitecat Blocky Environment, VT100 terminal emulator
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

var Term = {};

Term.port = null;
Term.term = null;
Term.div = null;
Term.buffer = null;
Term.cols = 80;
Term.rows = 80;

Term.x = 0;
Term.y = 0;
Term.cursorMask = (1 << 15);

Term.clear = function() {
	var index = 0;
	
	for(var i = 0; i < Term.cols;i++) {
		for(var j = 0; j < Term.rows;j++) {			
			Term.buffer[index] = 0;
			index++;
		}	
	}	
	
	Term.x = 0;
	Term.y = 0;
}

Term.listener = function(info) {
    if (info.connectionId == Term.port.connId && info.data) {
		var str = Whitecat.ab2str(info.data);
		
		Term.write(str);
	}
}

Term.init = function() {
	Term.buffer = new Uint16Array(Term.cols * Term.rows);
	Term.div = jQuery("#boardConsole");

	Term.clear();
	
	Term.div.keypress(function(event) {
   		var charCode = (event.which)?event.which:event.keyCode;
		var str = String.fromCharCode(charCode);
		
		chrome.serial.send(Term.port.connId, Whitecat.str2ab(str), function(info) {
		});			 		
	});	
}

Term.enable = function() {
	chrome.serial.onReceive.addListener(Term.listener);	

	if (Term.port != null) {
		chrome.serial.send(Term.port.connId, Whitecat.str2ab("\ros.clear()\r"), function(info) {
		});			 				
	}
}

Term.disable = function() {
	chrome.serial.onReceive.removeListener(Term.listener);		
}

Term.connect = function(port) {
	Term.port = port;
}

Term.disconnect = function() {
	Term.port = null;
	Term.clear();
	Term.refresh();
}

Term.ansiCodes = {
	"[K": function() {
		// Erases from the current cursor position to the end of the current line
		var index = Term.y * Term.cols + Term.x;
		var num = Term.cols - Term.x;
		
		for(var i = 0;i < num;i++) {
			Term.buffer[index++] = " ".charCodeAt();
		}		
	},
	"[1K": function() {
		// Erases from the current cursor position to the start of the current line
		var index = Term.y * Term.cols;
		var num = Term.x;
		
		for(var i = 0;i < num;i++) {
			Term.buffer[index++] = " ".charCodeAt();
		}		
	},
	"[2K": function() {
		// Erases the entire current line
		var index = Term.y * Term.cols;
		var num = Term.cols;
		
		for(var i = 0;i <= num;i++) {
			Term.buffer[index++] = " ".charCodeAt();
		}		
	},
	"[J": function() {
		// Erases the screen from the current line down to the bottom of the screen
		var index = Term.y * Term.cols;
		var num = Term.rows - Term.y;
		
		for(var i = 0;i <= num;i++) {
			Term.buffer[index++] = " ".charCodeAt();
		}		
	},
	"[1J": function() {
		// Erases the screen from the current line up to the top of the screen
		var index = 0;
		var num = Term.y * Term.cols;
		
		for(var i = 0;i <= num;i++) {
			Term.buffer[index++] = " ".charCodeAt();
		}		
	},	
	"[2J": function() {
		// Erases the screen with the background colour and moves the cursor to home
		Term.clear();
	}
}

Term.refresh = function() {
	var index = 0;
	var html = '';
	var c = '';
	
	for(var i = 0; i < Term.rows;i++) {
		if (i > 0) {
			html +=  '<br>';
		}
		for(var j = 0; j < Term.cols;j++) {	
			c = Term.buffer[index];
			if (c == 0) {
				index++;
				continue;
			}

			if (Term.buffer[index] & Term.cursorMask) {
				if ((i != Term.y) || (j != Term.x)) {
					c = ' ';
				} else {
					c = '<span class="blink">&nbsp;</span>';
				}
			} else {
				c = String.fromCharCode(c);				
			}

			if (c == ' ') {
				html += "&nbsp;";
			} else {
				html += c;
			}
			
			index++;
		}	
	}

	Term.div.html(html);
}

Term.write = function(text) {
	var c = '';
	var scape = false;
	var scapePos = 0;
	var bracketed = false;
	var scapeSeq = '';
	
	for(var i = 0;i < text.length;i++) {
		c = text.charAt(i);
		
		if (c == '\033') {
			scape = true;
			scapePos = 0;
			bracketed = false;
			scapeSeq = '';
			continue;
		}
		
		if (!scape) {
			if (c=='\r') {
				Term.x = 0;
				continue;
			} else if (c=='\n') {
				Term.x = 0;
				Term.y++;

				if (Term.y > Term.rows - 1) {
					Term.y = 0;

				}	
				continue;
			}
			
			Term.buffer[Term.y * Term.cols + Term.x] = c.charCodeAt();	
			
			Term.x++;	
			if (Term.x > Term.cols - 1) {
				Term.x = 0;
			}	

			if (Term.x < Term.cols) {
				Term.buffer[Term.y * Term.cols + Term.x] = ("_".charCodeAt()) | Term.cursorMask;
			}			
		} else {
			scapePos++;
			
			if ((scapePos == 1) && (c == '[')) {
				bracketed = true;
				scapeSeq += c;
				continue;
			}
			
			if (!bracketed) {
				if ((c.charCodeAt() >= 64) && (c.charCodeAt() <= 95)) {
					scapeSeq += c;
					scape = false;
					if (typeof Term.ansiCodes[scapeSeq] != "undefined") {
						Term.ansiCodes[scapeSeq]();
					}
					continue;
				} else {
					scapeSeq += c;
				}
			} else {
				if ((c.charCodeAt() >= 64) && (c.charCodeAt() <= 126)) {
					scapeSeq += c;
					scape = false;
					if (typeof Term.ansiCodes[scapeSeq] != "undefined") {
						Term.ansiCodes[scapeSeq]();
					}
					continue;				
				} else {
					scapeSeq += c;
				}						
			}
		}				
	}
	
	Term.refresh();	
}
