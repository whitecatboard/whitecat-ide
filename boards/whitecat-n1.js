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

Whitecat.N1 = {};

Whitecat.N1.hardwareReset = true;
Whitecat.N1.stopTimeout = 2000;
Whitecat.N1.bootingTimeout = 3500;
Whitecat.N1.runningTimeout = 1500;

// Digital pins map
Whitecat.N1.digitalPins = {
	"14": "pio.GPIO2",
	"16": "pio.GPIO4",	
	"24": "pio.GPIO5",
	"10": "pio.GPIO12",
	"12": "pio.GPIO13",
	"9" : "pio.GPIO14",
	"13": "pio.GPIO15",
};

// Analog pins map
Whitecat.N1.analogPins = {
/*
	"9" : "pio.PB_4",
	"10": "pio.PB_3",
    "11": "pio.PB_2",
    "12": "pio.PB_1",
	"13": "pio.PB_0",
*/
};

Whitecat.N1.analogPinsChannel = {
/*
	"9" : "4",
	"10": "3",
    "11": "2",
    "12": "1",
	"13": "0",
*/
};

// PWM pins map
Whitecat.N1.pwmPins = {
/*
	"12": "pio.PB_2",
	"14": "pio.PB_6",
	"12": "pio.PB_1",
	"13": "pio.PB_0",
	"10": "pio.PB_3",
	"16": "pio.PB_8",
*/
};

Whitecat.N1.pwmPinsChannel = {
/*
	"12": "1",
	"14": "2",
	"12": "4",
	"13": "5",
	"10": "7",
	"16": "8",
*/
};

// I2C map
Whitecat.N1.i2cModules = {
/*
	"BB1": "i2c.I2CBB1",
	"BB2": "i2c.I2CBB2",
	"BB3": "i2c.I2CBB3",
	"BB4": "i2c.I2CBB4",
	"BB5": "i2c.I2CBB5",
*/
}