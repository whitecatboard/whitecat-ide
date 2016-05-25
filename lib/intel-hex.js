/*
 * Whitecat Blocky Environment, parser for Intel HEX file format
 *
 * Inspired on code from: https://github.com/bminer/intel-hex.js
 *
 * ----
 *
 * Inspired on code from: https://github.com/sergev/pic32prog
 * 
 * Copyright (C) 2014-2015 Serge Vakulenko
 *
 * This file is part of PIC32PROG project, which is distributed
 * under the terms of the GNU General Public License (GPL).
 * See the accompanying file "COPYING" for more details.
 *
 * ----
 *
 * Adapted for Whitecat Blocky Environment
 * 
 * Copyright (C) 2015 - 2016
 * IBEROXARXA SERVICIOS INTEGRALES, S.L. & CSS IBÉRICA, S.L.
 * 
 * Author: Jaume Olivé (jolive@iberoxarxa.com / jolive@whitecatboard.org)
 * 
 */
var intelHex = {};

intelHex.DATA = 0,
intelHex.END_OF_FILE = 1,
intelHex.EXT_SEGMENT_ADDR = 2,
intelHex.START_SEGMENT_ADDR = 3,
intelHex.EXT_LINEAR_ADDR = 4,
intelHex.START_LINEAR_ADDR = 5;
intelHex.EMPTY_VALUE = 0xFF;
intelHex.SMALLEST_LINE = 11;

intelHex.FLASHV_BASE = 0x9d000000;
intelHex.BOOTV_BASE  = 0x9fc00000;
intelHex.FLASHP_BASE = 0x1d000000;
intelHex.FLASH_BYTES = 2048 * 1024;

intelHex.flashData = [];

intelHex.store = function(address, byte) {
	var offset;
	
	if (address >= intelHex.FLASHV_BASE && address < intelHex.FLASHV_BASE + intelHex.FLASH_BYTES) {
		// Main flash memory, virtual
	    offset = address - intelHex.FLASHV_BASE;
	} else if (address >= intelHex.FLASHP_BASE && address < intelHex.FLASHP_BASE + intelHex.FLASH_BYTES) {
		// Main flash memory, physical
		offset = address - intelHex.FLASHP_BASE;
	} else {
		return;
	}
	
	// Need fill?
	if (offset > intelHex.flashData.length) {
		for (var i = 0; i < offset - intelHex.flashData.length; i++) {
			intelHex.flashData.push(0xff);
		}
	}
	
	intelHex.flashData.push(byte);
}

intelHex.parse = function(data) {
	var pos = 0;
	var lineNum = 0;
	var buffer = [];
	var dataBuffer = [];
	var byte;
	var highAddress = 0;
	var startAddress = undefined;
	
	while (pos + intelHex.SMALLEST_LINE <= data.length) {
		// Advance to the next line
		if(data.charAt(pos) == "\r") pos++;
		if(data.charAt(pos) == "\n") pos++;

		// Parse an entire line
		if (data.charAt(pos++) != ":")
			throw new Error("Line " + (lineNum + 1) + " does not start with a colon (:).");
		else
			lineNum++;		

		// Number of bytes (hex digit pairs) in the data field
		var dataLength = parseInt(data.substr(pos, 2), 16);
		var calcChecksum = (dataLength) & 0xff;
		pos += 2;
		
		// Get 16-bit address (big-endian)
		var lowAddress = parseInt(data.substr(pos, 4), 16);
		calcChecksum = (calcChecksum + parseInt(data.substr(pos, 2), 16) + parseInt(data.substr(pos + 2, 2), 16)) & 0xff;
		pos += 4;
		
		// Record type
		var recordType = parseInt(data.substr(pos, 2), 16);
		calcChecksum = (calcChecksum + recordType) & 0xff;
		pos += 2;
		
		// Data field (hex-encoded string)
		dataBuffer = [];
		var dataField = data.substr(pos, dataLength * 2);
		var i = 0;
		while (i < dataField.length) {
		    byte = parseInt("0x" + dataField[i++] + dataField[i++], 16);
			calcChecksum = (calcChecksum + byte) & 0xFF;
			
			dataBuffer.push(byte);
		}
		pos += dataLength * 2;
		
		calcChecksum = (((~calcChecksum & 0xff) + 1) & 0xff);
		
		// Checksum
		var checksum = parseInt(data.substr(pos, 2), 16);
		pos += 2;

		// Validate checksum
		if (checksum != calcChecksum)
			throw new Error("Invalid checksum on line " + lineNum + ": got " + checksum + ", but expected " + calcChecksum);

		//Parse the record based on its recordType
		if (recordType == intelHex.END_OF_FILE) {
			break;
		}
		
		if (recordType == intelHex.START_LINEAR_ADDR) {
			// Ignore
			continue;
		}

		if (recordType == intelHex.EXT_LINEAR_ADDR) {
			if(dataLength != 2 || lowAddress != 0)
				throw new Error("Invalid extended linear address record on line " + lineNum + ".");
		
			highAddress = parseInt(dataField, 16) << 16;

			continue;
		}

		if (recordType == intelHex.DATA) {
			var absoluteAddress = highAddress + lowAddress;
			
			for (var i = 0; i < dataBuffer.length; i++) {
				intelHex.store(absoluteAddress++, dataBuffer[i]);
			}			
		} else {
			throw new Error("Invalid record type " + recordType);
		}
	}
	
	return intelHex.flashData;
}