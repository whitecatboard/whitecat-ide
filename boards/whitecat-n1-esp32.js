/*
 * Whitecat Blocky Environment, ESP8266 maps
 *
 * Copyright (C) 2015 - 2016
 * IBEROXARXA SERVICIOS INTEGRALES, S.L. & CSS IBÉRICA, S.L.
 * 
 * Author: Jaume Olivé (joliveiberoxarxa.com / jolivewhitecatboard.org)
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

Whitecat.N1ESP32 = {};

Whitecat.N1ESP32.hasFirmwareUpgradeSupport = false;

Whitecat.N1ESP32.hasDigitalSupport = true;
Whitecat.N1ESP32.hasAnalogSupport = true;
Whitecat.N1ESP32.hasPWMSupport = true;
Whitecat.N1ESP32.hasI2CSupport = false;
Whitecat.N1ESP32.hasLORASupport = true;

Whitecat.N1ESP32.stopTimeout = 2000;
Whitecat.N1ESP32.bootingTimeout = 1000;
Whitecat.N1ESP32.runningTimeout = 1500;

// Digital pins map
Whitecat.N1ESP32.digitalPins = {
"4":  "GPIO36",
"5":  "GPIO39",
"6":  "GPIO34",
"7":  "GPIO35",
"8":  "GPIO32",
"9":  "GPIO33",
"10": "GPIO25",
"11": "GPIO26",
"12": "GPIO27",
"13": "GPIO14",
"14": "GPIO12",
"16": "GPIO13",
"17": "GPIO9",
"18": "GPIO10",
"19": "GPIO11",
"20": "GPIO6",
"21": "GPIO7",
"22": "GPIO8",
"23": "GPIO15",
"24": "GPIO2",
"25": "GPIO0",
"26": "GPIO4",
"27": "GPIO16",
"28": "GPIO17",
"29": "GPIO5",
"30": "GPIO18",
"31": "GPIO19",
"33": "GPIO21",
"34": "GPIO3",
"35": "GPIO1",
"36": "GPIO22",
"37": "GPIO23",
};

// Analog pins map
Whitecat.N1ESP32.analogPins = {
	"4": "GPIO36",
	"5": "GPIO39",
    "8": "GPIO32",
    "9": "GPIO33",
	"6": "GPIO34",
	"7": "GPIO35",
};

Whitecat.N1ESP32.analogPinsChannel = {
	"4": "0",
	"5": "3",
    "8": "4",
    "9": "5",
	"6": "6",
	"7": "7",
};

// PWM pins map
Whitecat.N1ESP32.pwmPins = {
"4":  "GPIO36",
"5":  "GPIO39",
"6":  "GPIO34",
"7":  "GPIO35",
"8":  "GPIO32",
"9":  "GPIO33",
"10": "GPIO25",
"11": "GPIO26",
"12": "GPIO27",
"13": "GPIO14",
"14": "GPIO12",
"16": "GPIO13",
"17": "GPIO9",
"18": "GPIO10",
"19": "GPIO11",
"20": "GPIO6",
"21": "GPIO7",
"22": "GPIO8",
"23": "GPIO15",
"24": "GPIO2",
"25": "GPIO0",
"26": "GPIO4",
"27": "GPIO16",
"28": "GPIO17",
"29": "GPIO5",
"30": "GPIO18",
"31": "GPIO19",
"33": "GPIO21",
"34": "GPIO3",
"35": "GPIO1",
"36": "GPIO22",
"37": "GPIO23",
};

Whitecat.N1ESP32.pwmPinsChannel = {
"4":  "-1",
"5":  "-1",
"6":  "-1",
"7":  "-1",
"8":  "-1",
"9":  "-1",
"10": "-1",
"11": "-1",
"12": "-1",
"13": "-1",
"14": "-1",
"16": "-1",
"17": "-1",
"18": "-1",
"19": "-1",
"20": "-1",
"21": "-1",
"22": "-1",
"23": "-1",
"24": "-1",
"25": "-1",
"26": "-1",
"27": "-1",
"28": "-1",
"29": "-1",
"30": "-1",
"31": "-1",
"33": "-1",
"34": "-1",
"35": "-1",
"36": "-1",
"37": "-1",
};

// I2C map
Whitecat.N1ESP32.i2cModules = {
	"BB1": "i2c.I2CBB1",
	"BB2": "i2c.I2CBB2",
	"BB3": "i2c.I2CBB3",
	"BB4": "i2c.I2CBB4",
};