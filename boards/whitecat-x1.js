/*
 * Whitecat Blocky Environment, ESP8266 maps
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

Whitecat.X1 = {};

Whitecat.X1.hardwareReset = false;

Whitecat.X1.hasFirmwareUpgradeSupport = true;
Whitecat.X1.stopTimeout = 2000;
Whitecat.X1.bootingTimeout = 3500;
Whitecat.X1.runningTimeout = 1500;

// Digital pins map
Whitecat.X1.digitalPins = {
	"8" : "pio.RB5",
	"9" : "pio.RB4",
	"10": "pio.RB3",
	"11": "pio.RB2",
	"12": "pio.RB1",
	"13": "pio.RB0",
	"14": "pio.RB6",
	"15": "pio.RB7",
	"16": "pio.RB8",
	"17": "pio.RB15",
	"18": "pio.RB13",
	"19": "pio.RB12",
	"20": "pio.RC15",
	"27": "pio.RD9",
	"28": "pio.RD10",
	"29": "pio.RD11",
	"30": "pio.RD0",
	"31": "pio.RC13",
	"32": "pio.RC14",
	"35": "pio.RD4",
	"36": "pio.RD5",
	"37": "pio.RE0",
	"38": "pio.RE1",
	"39": "pio.RE2",
	"40": "pio.RE3",
	"41": "pio.RE4",
	"42": "pio.RE5",
	"43": "pio.RE6",
	"44": "pio.RE7"
};

// Analog pins map
Whitecat.X1.analogPins = {
	"9" : "pio.RB4",
	"10": "pio.RB3",
    "11": "pio.RB2",
    "12": "pio.RB1",
	"13": "pio.RB0",
};

Whitecat.X1.analogPinsChannel = {
	"9" : "4",
	"10": "3",
    "11": "2",
    "12": "1",
	"13": "0",
};

// PWM pins map
Whitecat.X1.pwmPins = {
	"12": "pio.RB2",
	"14": "pio.RB6",
	"12": "pio.RB1",
	"13": "pio.RB0",
	"10": "pio.RB3",
	"16": "pio.RB8",
};

Whitecat.X1.pwmPinsChannel = {
	"12": "1",
	"14": "2",
	"12": "4",
	"13": "5",
	"10": "7",
	"16": "8",
};

// I2C map
Whitecat.X1.i2cModules = {
	"BB1": "i2c.I2CBB1",
	"BB2": "i2c.I2CBB2",
	"BB3": "i2c.I2CBB3",
	"BB4": "i2c.I2CBB4",
	"BB5": "i2c.I2CBB5",
}