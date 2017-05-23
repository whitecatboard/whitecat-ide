/*
 * Whitecat Blocky Environment, VT100 terminal emulator
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

var Term = {};

Term.port = null;
Term.term = null;
Term.div = null;
Term.cols = 78;
Term.rows = 17;
Term.offset = 0;
Term.reverse = false;

Term.x = 0;
Term.y = 0;
Term.ready = false
Term.disables = 0;
Term.visible = false;

Term.scape = false;
Term.scapePos = 0;
Term.bracketed = false;
Term.scapeSeq = '';

Term.clear = function() {
	var html = "";
	var style = "";
	
	Term.x = 0;
	Term.y = 0;
	Term.offset = 0;
	
	for(var row = 0;row < Term.rows;row++) {
		for(var col = 0;col < Term.cols;col++) {
			style = "consoleCH";
			
			if (col == Term.cols - 1) {
				if (style != "") {
					style += " ";
				}
				
				style += "consoleLB";
			}
			
			html += '<span data-c="' + col + '" data-r="' + row + '" class="' + style + '"></span>';
		}		
	}
	
	Term.div.html(html);
	Term.cursor();
}

Term.keyCodeMap = {
	"8" : [String.fromCharCode(8), function() {
	}], // BACKSPACE
	"46": [String.fromCharCode(8), function() {
	}], // BACKSPACE
	"37": [String.fromCharCode(27) + "[D", function() {
	}], //LEFT
	"38": [String.fromCharCode(27) + "[A", function() {
	}], //UP
	"39": [String.fromCharCode(27) + "[C", function() {		
	}], //RIGHT	
	"40": [String.fromCharCode(27) + "[B", function() {
	}] //DOWN	
}

Term.init = function() {	
	Term.div = jQuery("#boardConsole");
	
	Term.clear();
	
	Term.div.focus(function(event) {
		Term.div.css('border', 'solid 1px #4D90FE');
	});

	Term.div.focusout(function(event) {
		Term.div.css('border', '1px solid #eee');
	});
	
	Term.div.keypress(function(event) {
   		var charCode = (event.which)?event.which:event.keyCode;
		var str = String.fromCharCode(charCode);
		Code.agent.consoleDownSocket.send(str);
	});

	Term.div.keydown(function(event) {
   		var charCode = event.keyCode;

		if (typeof Term.keyCodeMap[charCode]!= 'undefined') {
			Code.agent.consoleDownSocket.send(Term.keyCodeMap[charCode][0]);
			Term.keyCodeMap[charCode][1]();
			event.preventDefault();
			return false;
		}
	});	
}

Term.scroll = function() {
	var html = "";
	var style = "";
		
	for(var col = 0;col < Term.cols;col++) {
		style = "consoleCH";
		
		if (col == Term.cols - 1) {
			if (style != "") {
				style += " ";
			}
			
			style += "consoleLB";
		}
		
		html += '<span data-c="' + col + '" data-r="' + (Term.rows + Term.offset) + '" class="' + style + '"></span>';
	}
	
	Term.offset++;
	Term.div.find('[data-r="' + (Term.offset - 1) + '"]').remove();
	Term.div.append(html);	
}

Term.cursor = function() {
	var c = "";
	
	Term.div.find(".blink").removeClass("blink");
	
	var el = Term.div.find('[data-c="' + Term.x + '"][data-r="' + (Term.y + Term.offset) + '"]');
	
	c = el.attr("data-char");
	if ((typeof c == "undefined") || (c == "")) {
		c = "&nbsp";
	}
	
	Term.div.find('[data-c="' + Term.x + '"][data-r="' + (Term.y + Term.offset) + '"]').addClass("blink").html(c);
}

Term.update = function(c) {
	c = String.fromCharCode(c);
	
	if (c == " ") {
		c = "&nbsp;";
	}

	var el = Term.div.find('[data-c="' + Term.x + '"][data-r="' + (Term.y + Term.offset) + '"]');
	
	el.html(c);
	
	if (Term.reverse) {
		el.addClass("reverse");
	}
	
	el.attr("data-char", c);	
}

Term.ansiCodes = {
	"[K": function() {
		// Erases from the current cursor position to the end of the current line
		Term.div.find('[data-r="' + (Term.y + Term.offset) + '"]:eq(' + Term.x + ')').empty().attr("data-char","").removeClass("reverse");
		Term.div.find('[data-r="' + (Term.y + Term.offset) + '"]:gt(' + Term.x + ')').empty().attr("data-char","").removeClass("reverse");
	},
	"[0K": function() {
		// Erases from the current cursor position to the end of the current line
		Term.div.find('[data-r="' + (Term.y + Term.offset) + '"]:eq(' + Term.x + ')').empty().attr("data-char","").removeClass("reverse");
		Term.div.find('[data-r="' + (Term.y + Term.offset) + '"]:gt(' + Term.x + ')').empty().attr("data-char","").removeClass("reverse");
	},
	"[1K": function() {
		// Erases from the current cursor position to the start of the current line
		Term.div.find('[data-r="' + (Term.y + Term.offset) + '"]:eq(' + Term.x + ')').empty().attr("data-char","").removeClass("reverse");
		Term.div.find('[data-r="' + (Term.y + Term.offset) + '"]:lt(' + Term.x + ')').empty().attr("data-char","").removeClass("reverse");
	},
	"[2K": function() {
		// Erases the entire current line
		Term.div.find('[data-r="' + (Term.y + Term.offset) + '"]').empty().attr("data-char","").removeClass("reverse");
	},
	"[J": function() {
		// Erases the screen from the current line down to the bottom of the screen
		Term.div.find('[data-r="' + (i + Term.offset) + '"]:eq').empty().attr("data-char","").removeClass("reverse");
		Term.div.find('[data-r="' + (i + Term.offset) + '"]:gt').empty().attr("data-char","").removeClass("reverse");
	},
	"[1J": function() {
		// Erases the screen from the current line up to the top of the screen
		Term.div.find('[data-r="' + (i + Term.offset) + '"]:eq').empty().attr("data-char","").removeClass("reverse");
		Term.div.find('[data-r="' + (i + Term.offset) + '"]:lt').empty().attr("data-char","").removeClass("reverse");
	},	
	"[2J": function() {
		// Erases the screen with the background colour and moves the cursor to home
		Term.clear();
	},
	"[xC": function(n) {
		if (n === null) n = 1;
		
		// Moves the cursor forward by COUNT columns; the default count is 1
		Term.x += n;
		if (Term.x >= Term.cols) {
			Term.x = Term.cols - 1;
		}
		
		Term.cursor();
	},	
	"[xH": function(n, m) {
		if ((n === null) && (m === null)) {
			n = 0;
			m = 0;
		}
		
		if (n > Term.rows) {
			n = Term.rows;
		}

		if (m > Term.cols) {
			m = Term.cols;
		}
		
		// Sets the cursor position where subsequent text will begin
		Term.y = n - 1;
		Term.x = m - 1;
		
		Term.cursor();
	},
	"[s": function() {
		// Save current cursor position
		Term.xSaved = Term.x;
		Term.ySaved = Term.y;
	},	
	"[u": function() {
		// Restores cursor position after a Save Cursor
		Term.x = Term.xSaved;
		Term.y = Term.ySaved;
	},	
	"[6n": function() {
		Code.agent.consoleDownSocket.send(String.fromCharCode(27) + "[" + (Term.y + 1) + ";" + (Term.x + 1));
	},	
	"[0m": function() {
		// Normal characters
		Term.reverse = false;
	},	
	"[7m": function() {
		// Reverse video characters
		Term.reverse = true;
	},	
}

Term.write = function(text) {
	var c = '';
	var prevC = '';
	
	for(var i = 0;i < text.length;i++) {
		prevC = c;
		c = text.charAt(i);
		
		if (c == '\033') {
			Term.scape = true;
			Term.scapePos = 0;
			Term.bracketed = false;
			Term.scapeSeq = '';
			continue;
		}
		
		if (!Term.scape) {
			if (c=='\r') {
				Term.x = 0;
				continue;
			} else if (c=='\n') {
				Term.x = 0;
				Term.y++;

				if (Term.y > Term.rows - 1) {
					Term.y--;
					Term.scroll();
				}	
				continue;
			}
			
			if (Term.x >= Term.cols) {
				Term.x = 0;
				Term.y++;
				
				if (Term.y > Term.rows - 1) {
					Term.y--;
					Term.scroll();
				}	
			}
		
			Term.update(c.charCodeAt());			
			Term.x++;	
			Term.cursor();
		} else {
			Term.scapePos++;
			if ((Term.scapePos == 1) && (c == '[')) {
				Term.bracketed = true;
				Term.scapeSeq += c;
				continue;
			}
			
			if (!Term.bracketed) {
				if ((c.charCodeAt() >= 64) && (c.charCodeAt() <= 95)) {
					Term.scapeSeq += c;
					Term.scape = false;

					if (typeof Term.ansiCodes[Term.scapeSeq] != "undefined") {						
						Term.ansiCodes[Term.scapeSeq];
					}
					continue;
				} else {
					Term.scapeSeq += c;
				}
			} else {
				if ((c.charCodeAt() >= 64) && (c.charCodeAt() <= 126)) {
					Term.scapeSeq += c;
					Term.scape = false;

					// Get arguments, if needed
					var n = null;
					var m = null;
					var tmp;
										
					if ((c == 'H') || (c == 'A') || (c == 'B') || (c == 'C') || (c == 'D') || (c == 'f') || (c == 'r')) {
						// [nX
						tmp = Term.scapeSeq.match(new RegExp("^\\[([0-9]*)" + c + "$"));
						if (tmp !== null) {
							n = parseInt(tmp[1]);
							Term.scapeSeq = "[x" + c;
						} else {
							// [n;mX
							tmp = Term.scapeSeq.match(new RegExp("^\\[([0-9]*)\\;([0-9]*)" + c + "$"));
							if (tmp !== null) {
								n = parseInt(tmp[1]);
								m = parseInt(tmp[2]);
								Term.scapeSeq = "[x" + c;
							} else {
								// [;mX
								tmp = Term.scapeSeq.match(new RegExp("^\\;([0-9]*)" + c + "$"));
								if (tmp !== null) {
									n = null;
									m = parseInt(tmp[1]);
									Term.scapeSeq = "[x" + c;
								} else {
									// [X
									tmp = Term.scapeSeq.match(new RegExp("^" + c + "$"));
									if (tmp !== null) {
										n = null;
										m = null;
										Term.scapeSeq = "[x" + c;	
									}								
								}												
							}													
						}						

					}

					if (typeof Term.ansiCodes[Term.scapeSeq] != "undefined") {
						Term.ansiCodes[Term.scapeSeq](n,m);
					} else {
						console.log("missing " + Term.scapeSeq);
					}

					continue;				
				} else {
					Term.scapeSeq += c;
				}						
			}
		}				
	}	
}

Term.show = function() {
	var term = Term.div;
	
	if (!Term.visible) {
		term.show();	
		term.focus();	
	} else {
		term.hide();
	}
	
	Term.visible = !Term.visible;

	Code.renderContent();
}
