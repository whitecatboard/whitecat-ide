/*
 * Copyright (c) 2017, Simsystems GmbH
 * All rights reserved. Released under the BSD license.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
 * following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the
 * following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the
 * following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
 * USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

#include "input.h"
#include "config.h"
#include "rnetheader.h"
#include "sim.h"
#include "utils.h"
#include "cJSON.h"
#include "can.h"
#include "stats.h"

#include <stdint.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <sys/time.h>
#include <pthread.h>

// SIM status
static uint8_t *status;

// Type of input
typedef enum {
    Light     = 0,
    Display   = 1,
    Solenoid  = 2,
    Gauge     = 3,
    Backlight = 4,
    Motor     = 5,
    TypeMax
} input_type_t;

// Map info
// This info is used to translate the inputs received from the SIM to the CAN bus
typedef struct input_map_entry input_map_entry_t;

struct input_map_entry {
    protocol_t    protocol;    // Entry protocol: CAN AEROSPACE, SIMWORLD, ...
    uint32_t      can_id;      // CAN id for this entry
    input_type_t  type;        // Type of input
    uint16_t      offset;      // Input stream offset
    uint8_t       value;       // Value in input stream offset
    uint16_t      group;       // Frane group
    uint8_t       pos;         // Position in frame group
    uint8_t       nvalue;      // Value in frame
    float         convert;     // Conversion factor
    input_map_entry_t *next;   // Pointer to next entry
};

// Map info. This info is indexed by the type of input
static input_map_entry_t *map[TypeMax];

// Encode light functions
static uint64_t encode_light(input_map_entry_t *entry, uint64_t data) {
    if (entry->protocol == CanAerospace) {
        // TYPE_SHORT
        data |= 0x0006000000000000L;
        
        // Code light data
        data |= ((((uint64_t)entry->nvalue) & 0b11L) << ((uint64_t)(entry->pos - 1) << 1L));            
    } else if (entry->protocol == SimWorld) {
        // Code solenoid data
        data |= ((((uint64_t)entry->nvalue) & 0b1L) << (uint64_t)(entry->pos - 1));                    
    }    
    
    return data;
} 

// Encode soneloid functions
static uint64_t encode_solenoid(input_map_entry_t *entry, uint64_t data) {
    if (entry->protocol == CanAerospace) {
        // TYPE_SHORT
        data |= 0x0006000000000000L;
        
        // Code solenoid data
        data |= ((((uint64_t)entry->nvalue) & 0b1L) << (uint64_t)(entry->pos - 1));                    
    } else if (entry->protocol == SimWorld) {
        // Code solenoid data
        data |= ((((uint64_t)entry->nvalue) & 0b1L) << (uint64_t)(entry->pos - 1));                    
    }    
    
    return data;
} 

// Encode displays functions
typedef struct {
    uint32_t can_id;
    uint8_t  digit;
    uint8_t  ascii;
    uint64_t data;
} simworld_display_data_t;

const simworld_display_data_t simworld_display[] = { 
    {0x702,0,0x00,0x1EA000000}, // CRS LEFT
    {0x702,0,0x20,0x1EA000000},
    {0x702,0,0x30,0x1EA000000},
    {0x702,0,0x31,0xA000000},
    {0x702,0,0x32,0x1A6000000},
    {0x702,0,0x33,0x12E000000},
    {0x702,0,0x34,0x4E000000},
    {0x702,0,0x35,0x16C000000},
    {0x702,0,0x36,0x1EC000000},
    {0x702,0,0x37,0x2A000000},
    {0x702,0,0x38,0x1EE000000},
    {0x702,0,0x39,0x06E000000 | 0x100000000},
    {0x702,1,0x00,0x1EA0000},
    {0x702,1,0x20,0x1EA0000},
    {0x702,1,0x30,0x1EA0000},
    {0x702,1,0x31,0xA0000},
    {0x702,1,0x32,0x1A60000},
    {0x702,1,0x33,0x12E0000},
    {0x702,1,0x34,0x4E0000},
    {0x702,1,0x35,0x16C0000},
    {0x702,1,0x36,0x1EC0000},
    {0x702,1,0x37,0x2A0000},
    {0x702,1,0x38,0x1EE0000},
    {0x702,1,0x39,0x6E0000 | 0x1000000},
    {0x702,2,0x00,0x1EA00},
    {0x702,2,0x20,0x1EA00},
    {0x702,2,0x30,0x1EA00},
    {0x702,2,0x31,0xA00},
    {0x702,2,0x32,0x1A600},
    {0x702,2,0x33,0x12E00},
    {0x702,2,0x34,0x4E00},
    {0x702,2,0x35,0x16C00},
    {0x702,2,0x36,0x1EC00},
    {0x702,2,0x37,0x2A00},
    {0x702,2,0x38,0x1EE00},
    {0x702,2,0x39,0x6E00 | 0x10000},

    {0x703,0,0x00,0x15340000000}, // IAS/MATCH
    {0x703,0,0x20,0x15340000000},
    {0x703,0,0x2a,0x1DFC0000000}, // Overspeed
    {0x703,0,0x30,0x15340000000},
    {0x703,0,0x31,0x140000000},
    {0x703,0,0x32,0xD380000000},
    {0x703,0,0x33,0x93C0000000},
    {0x703,0,0x34,0x181C0000000},
    {0x703,0,0x35,0x192C0000000},
    {0x703,0,0x36,0x1D2C0000000},
    {0x703,0,0x37,0x1140000000},
    {0x703,0,0x38,0x1D3C0000000},
    {0x703,0,0x39,0x191C0000000 | 0x200000000},
    {0x703,0,0x41,0x1D1C0000000}, // Underspeed
    {0x703,1,0x00,0x15E00000},
    {0x703,1,0x20,0x15E00000},
    {0x703,1,0x30,0x15E00000},
    {0x703,1,0x31,0xC00000},
    {0x703,1,0x32,0xDA00000},
    {0x703,1,0x33,0x9E00000},
    {0x703,1,0x34,0x18C00000},
    {0x703,1,0x35,0x19600000},
    {0x703,1,0x36,0x1D600000},
    {0x703,1,0x37,0x1C00000},
    {0x703,1,0x38,0x1DE00000},
    {0x703,1,0x39,0x19C00000 | 0x200000},
    {0x703,2,0x00,0x0},
    {0x703,2,0x20,0x0},
    {0x703,2,0x2E,0x20000},
    {0x703,3,0x00,0x15E000},
    {0x703,3,0x20,0x15E000},
    {0x703,3,0x30,0x15E000},
    {0x703,3,0x31,0xC000},
    {0x703,3,0x32,0xDA000},
    {0x703,3,0x33,0x9E000},
    {0x703,3,0x34,0x18C000},
    {0x703,3,0x35,0x196000},
    {0x703,3,0x36,0x1D6000},
    {0x703,3,0x37,0x1C000},
    {0x703,3,0x38,0x1DE000},
    {0x703,3,0x39,0x19C000 | 0x2000},
    {0x703,4,0x00,0x2022001A00},
    {0x703,4,0x20,0x2022001A00},
    {0x703,4,0x30,0x2022001A00},
    {0x703,4,0x31,0x2000000200},
    {0x703,4,0x32,0x22001600},
    {0x703,4,0x33,0x2020001600},
    {0x703,4,0x34,0x2000000E00},
    {0x703,4,0x35,0x2020001C00},
    {0x703,4,0x36,0x2022001C00},
    {0x703,4,0x37,0x2000001200},
    {0x703,4,0x38,0x2022001E00},
    {0x703,4,0x39,0x2000001E00 | 0x20000000},

    {0x704,0,0x00,0x1EA000000}, // HDG
    {0x704,0,0x20,0x1EA000000},
    {0x704,0,0x30,0x1EA000000},
    {0x704,0,0x31,0xA000000},
    {0x704,0,0x32,0x1A6000000},
    {0x704,0,0x33,0x12E000000},
    {0x704,0,0x34,0x4E000000},
    {0x704,0,0x35,0x16C000000},
    {0x704,0,0x36,0x1EC000000},
    {0x704,0,0x37,0x2A000000},
    {0x704,0,0x38,0x1EE000000},
    {0x704,0,0x39,0x6E000000 | 0x100000000},
    {0x704,1,0x00,0x1EA0000},
    {0x704,1,0x20,0x1EA0000},
    {0x704,1,0x30,0x1EA0000},
    {0x704,1,0x31,0xA0000},
    {0x704,1,0x32,0x1A60000},
    {0x704,1,0x33,0x12E0000},
    {0x704,1,0x34,0x4E0000},
    {0x704,1,0x35,0x16C0000},
    {0x704,1,0x36,0x1EC0000},
    {0x704,1,0x37,0x2A0000},
    {0x704,1,0x38,0x1EE0000},
    {0x704,1,0x39,0x6E0000 | 0x1000000},
    {0x704,2,0x00,0x1EA00},
    {0x704,2,0x20,0x1EA00},
    {0x704,2,0x30,0x1EA00},
    {0x704,2,0x31,0xA00},
    {0x704,2,0x32,0x1A600},
    {0x704,2,0x33,0x12E00},
    {0x704,2,0x34,0x4E00},
    {0x704,2,0x35,0x16C00},
    {0x704,2,0x36,0x1EC00},
    {0x704,2,0x37,0x2A00},
    {0x704,2,0x38,0x1EE00},
    {0x704,2,0x39,0x6E00 | 0x10000},

    {0x705,0,0x00,0x15E000000000}, // ALT
    {0x705,0,0x20,0x15E000000000},
    {0x705,0,0x30,0x15E000000000},
    {0x705,0,0x31,0xC000000000},
    {0x705,0,0x32,0xDA000000000},
    {0x705,0,0x33,0x9E000000000},
    {0x705,0,0x34,0x18C000000000},
    {0x705,0,0x35,0x196000000000},
    {0x705,0,0x36,0x1D6000000000},
    {0x705,0,0x37,0x1C000000000},
    {0x705,0,0x38,0x1DE000000000},
    {0x705,0,0x39,0x19C000000000 | 0x2000000000},
    {0x705,1,0x00,0x15E0000000},
    {0x705,1,0x20,0x15E0000000},
    {0x705,1,0x30,0x15E0000000},
    {0x705,1,0x31,0xC0000000},
    {0x705,1,0x32,0xDA0000000},
    {0x705,1,0x33,0x9E0000000},
    {0x705,1,0x34,0x18C0000000},
    {0x705,1,0x35,0x1960000000},
    {0x705,1,0x36,0x1D60000000},
    {0x705,1,0x37,0x1C0000000},
    {0x705,1,0x38,0x1DE0000000},
    {0x705,1,0x39,0x19C0000000 | 0x20000000},
    {0x705,2,0x00,0x15E00000},
    {0x705,2,0x20,0x15E00000},
    {0x705,2,0x30,0x15E00000},
    {0x705,2,0x31,0xC00000},
    {0x705,2,0x32,0xDA00000},
    {0x705,2,0x33,0x9E00000},
    {0x705,2,0x34,0x18C00000},
    {0x705,2,0x35,0x19600000},
    {0x705,2,0x36,0x1D600000},
    {0x705,2,0x37,0x1C00000},
    {0x705,2,0x38,0x1DE00000},
    {0x705,2,0x39,0x19C00000 | 0x200000},
    {0x705,3,0x00,0x15E000},
    {0x705,3,0x20,0x15E000},
    {0x705,3,0x30,0x15E000},
    {0x705,3,0x31,0xC000},
    {0x705,3,0x32,0xDA000},
    {0x705,3,0x33,0x9E000},
    {0x705,3,0x34,0x18C000},
    {0x705,3,0x35,0x196000},
    {0x705,3,0x36,0x1D6000},
    {0x705,3,0x37,0x1C000},
    {0x705,3,0x38,0x1DE000},
    {0x705,3,0x39,0x19C000 | 0x2000},
    {0x705,4,0x00,0x2021E00},
    {0x705,4,0x20,0x2021E00},
    {0x705,4,0x30,0x2021E00},

    {0x706,0,0x00,0x2020200000}, // VSPED
    {0x706,0,0x20,0x2020200000},
    {0x706,0,0x2b,0x2020200000},
    {0x706,0,0x2d,0x20000000},
    {0x706,1,0x00,0x15E00000000},
    {0x706,1,0x20,0x15E00000000},
    {0x706,1,0x30,0x15E00000000},
    {0x706,1,0x31,0xC00000000},
    {0x706,1,0x32,0xDA00000000},
    {0x706,1,0x33,0x9E00000000},
    {0x706,1,0x34,0x18C00000000},
    {0x706,1,0x35,0x19600000000},
    {0x706,1,0x36,0x1D600000000},
    {0x706,1,0x37,0x1C00000000},
    {0x706,1,0x38,0x1DE00000000},
    {0x706,1,0x39,0x19C00000000 | 0x200000000},
    {0x706,2,0x00,0x15E000000},
    {0x706,2,0x20,0x15E000000},
    {0x706,2,0x30,0x15E000000},
    {0x706,2,0x31,0xC000000},
    {0x706,2,0x32,0xDA000000},
    {0x706,2,0x33,0x9E000000},
    {0x706,2,0x34,0x18C000000},
    {0x706,2,0x35,0x196000000},
    {0x706,2,0x36,0x1D6000000},
    {0x706,2,0x37,0x1C000000},
    {0x706,2,0x38,0x1DE000000},
    {0x706,2,0x39,0x19C000000 | 0x2000000},
    {0x706,3,0x00,0x15E0000},
    {0x706,3,0x20,0x15E0000},
    {0x706,3,0x30,0x15E0000},
    {0x706,3,0x31,0xC0000},
    {0x706,3,0x32,0xDA0000},
    {0x706,3,0x33,0x9E0000},
    {0x706,3,0x34,0x18C0000},
    {0x706,3,0x35,0x1960000},
    {0x706,3,0x36,0x1D60000},
    {0x706,3,0x37,0x1C0000},
    {0x706,3,0x38,0x1DE0000},
    {0x706,3,0x39,0x19C0000 | 0x20000},
    {0x706,4,0x00,0x15E00},
    {0x706,4,0x20,0x15E00},
    {0x706,4,0x30,0x15E00},

    {0x707,0,0x00,0x1EA000000}, // CRS RIGHT
    {0x707,0,0x20,0x1EA000000},
    {0x707,0,0x30,0x1EA000000},
    {0x707,0,0x31,0xA000000},
    {0x707,0,0x32,0x1A6000000},
    {0x707,0,0x33,0x12E000000},
    {0x707,0,0x34,0x4E000000},
    {0x707,0,0x35,0x16C000000},
    {0x707,0,0x36,0x1EC000000},
    {0x707,0,0x37,0x2A000000},
    {0x707,0,0x38,0x1EE000000},
    {0x707,0,0x39,0x6E000000 | 0x100000000},
    {0x707,1,0x00,0x1EA0000},
    {0x707,1,0x20,0x1EA0000},
    {0x707,1,0x30,0x1EA0000},
    {0x707,1,0x31,0xA0000},
    {0x707,1,0x32,0x1A60000},
    {0x707,1,0x33,0x12E0000},
    {0x707,1,0x34,0x4E0000},
    {0x707,1,0x35,0x16C0000},
    {0x707,1,0x36,0x1EC0000},
    {0x707,1,0x37,0x2A0000},
    {0x707,1,0x38,0x1EE0000},
    {0x707,1,0x39,0x6E0000 | 0x1000000},
    {0x707,2,0x00,0x1EA00},
    {0x707,2,0x20,0x1EA00},
    {0x707,2,0x30,0x1EA00},
    {0x707,2,0x31,0xA00},
    {0x707,2,0x32,0x1A600},
    {0x707,2,0x33,0x12E00},
    {0x707,2,0x34,0x4E00},
    {0x707,2,0x35,0x16C00},
    {0x707,2,0x36,0x1EC00},
    {0x707,2,0x37,0x2A00},
    {0x707,2,0x38,0x1EE00},
    {0x707,2,0x39,0x6E00 | 0x10000},
};

static uint64_t encode_display(input_map_entry_t *entry, uint64_t data) {
    if (entry->protocol == CanAerospace) {
        // TYPE_SHORT
        data |= 0x0006000000000000L;
        
        // Code display data
        data |= ((uint64_t)status[entry->offset]) << (uint64_t)(24 - (entry->pos - 1) * 8);
    } else if (entry->protocol == SimWorld) {
        int i;
        
        for(i=0;i < sizeof(simworld_display) / sizeof(simworld_display_data_t);i++) {					
            if ((entry->can_id == simworld_display[i].can_id) && (simworld_display[i].digit == (entry->pos - 1)) && (simworld_display[i].ascii == status[entry->offset])) {
                data |= simworld_display[i].data;
                break;
            }
        }
    }    
    
    return data;
} 

// Encode gauge functions
static uint64_t encode_gauge(input_map_entry_t *entry, uint64_t data) {
    if (entry->protocol == CanAerospace) {
        // TYPE_SHORT
        data |= 0x0006000000000000L;

        float val;
        uint32_t *bval;

        val = *((float *)&status[entry->offset]);

        if (entry->convert != 0) {
            val = val * entry->convert;
        }

        bval = (uint32_t *)&val;
        
        data |= (uint64_t)(*bval);
    } else if (entry->protocol == SimWorld) {
    }    
    
    return data;
}

// Encode backlight functions
static uint64_t encode_backlight(input_map_entry_t *entry, uint64_t data) {
    if (entry->protocol == CanAerospace) {
        // TYPE_SHORT
        data |= 0x0006000000000000L;
        
        float val;
        uint32_t cval;
        uint32_t *bval;
        
        val = *((float *)&status[entry->offset]);
        
        if (entry->convert != 0) {
            val = val * entry->convert;
        }
        
        cval = val;
        
        bval = (uint32_t *)&cval;
        
        data |= (uint64_t)(*bval);
    } else if (entry->protocol == SimWorld) {
        float val;
        uint32_t cval;
        uint32_t *bval;
        
        val = *((float *)&status[entry->offset]);
        
        if (entry->convert != 0) {
            val = val * entry->convert;
        }
        
        cval = val;
        
        bval = (uint32_t *)&cval;
        
        data |= (uint64_t) ((uint64_t)(*bval) << 56);
    }    
    
    return data;
}

// Encode motor functions
static uint64_t encode_motor(input_map_entry_t *entry, uint64_t data) {
    if (entry->protocol == CanAerospace) {
        // TYPE_SHORT
        data |= 0x0006000000000000L;
        
        data |= (uint64_t)*((uint8_t *)&status[entry->offset]);
    } else if (entry->protocol == SimWorld) {
    }    
    
    return data;
}

static void command() {
    input_map_entry_t *centry;
    int i,type;
    
    uint64_t light            = 0; // Current light bits
    uint32_t light_can_id     = 0; // Current light CAN id
    protocol_t light_protocol = CanAerospace;    
    uint8_t  light_f          = 0;

    uint64_t solen            = 0; // Current solenoide bits
    uint32_t solen_can_id     = 0; // Current solenoid CAN id
    protocol_t solen_protocol = CanAerospace;
    uint8_t  solen_f          = 0;
    
    uint64_t displ            = 0;  // Current display digits
    uint32_t displ_can_id     = 0; // Current display CAN id
    protocol_t displ_protocol = CanAerospace;
    uint8_t  displ_f          = 0;

    elapsed_start(STAT_CAN_INPUTS, can_inputs);

    for(type = 0;type < TypeMax;type++) {
        centry = map[type];
        while (centry) {
            if (centry->type == Light) {
                if (centry->value == status[centry->offset]) {                    
                    // If the light CAN id changes, flush and reset
                    if (light_can_id != centry->can_id) {
                        if (light_f) can_queue_raw_64(light_protocol, light_can_id, light);
                
                        // Reset
                        light = 0;
                        light_f = 0;

                        // Set current light CAN ID
                        light_can_id = centry->can_id;
                        light_protocol = centry->protocol;
                    }
            
                    light = encode_light(centry, light);										
                    light_f = 1;
                } 
            } else if (centry->type == Solenoid) {    
                if (centry->value == status[centry->offset]) {                    
                    // If the solenoid CAN id changes, flush and reset
                    if (solen_can_id != centry->can_id) {
                        if (solen_f) can_queue_raw_64(solen_protocol, solen_can_id, solen);
            
                        // Reset
                        solen = 0;
                        solen_f = 0;
        
                        // Set current solenoid CAN id
                        solen_can_id = centry->can_id;
                        solen_protocol = centry->protocol;
                    }

                    solen = encode_solenoid(centry, solen);
                    solen_f = 1;
                } 
            } else if (centry->type == Display) {
                // If the display CAN id changes, flush and reset
                if (displ_can_id != centry->can_id) {
                    if (displ_f) can_queue_raw_64(displ_protocol, displ_can_id, displ);
                
                    // Reset
                    displ = 0;
                    displ_f = 0;

                    // Set current display CAN id
                    displ_can_id = centry->can_id;
                    displ_protocol = centry->protocol;
                }
            
                displ = encode_display(centry, displ);
                displ_f = 1;
            }  else if (centry->type == Gauge) {
                can_queue_raw_64(centry->protocol, centry->can_id, encode_gauge(centry, 0));
            }  else if (centry->type == Backlight) {
                can_queue_raw_64(centry->protocol, centry->can_id, encode_backlight(centry, 0));
            }  else if (centry->type == Motor) {
                can_queue_raw_64(centry->protocol, centry->can_id, encode_motor(centry, 0));
            }    
            centry = centry->next;
        }
    }
    
    if (light_f) {
        can_queue_raw_64(light_protocol, light_can_id, light);
    }

    if (solen_f) {
        can_queue_raw_64(solen_protocol, solen_can_id, solen);
    }

    if (displ_f) {
        can_queue_raw_64(displ_protocol, displ_can_id, displ);
    }
        
    elapsed_end(STAT_CAN_INPUTS, can_inputs);
};

void set_input_8_status(int offset, void *value) {
    status[offset] = *((uint8_t *)value);
    
    command();
}

void set_input_16_status(int offset, void *value) {
    *((uint16_t *)&status[offset]) = *((uint16_t *)value);
    
    command();
}

void set_input_32_status(int offset, void *value) {
    *((uint32_t *)&status[offset]) = *((uint32_t *)value);
    
    command();
}

void input(struct sim_conn *conn) {
    tRNetHeader *header;
    
    conn->valid = 0;

    // Wait for a new packet from the simulator
    elapsed_start(STAT_SIM_COMM_IN, sim_comm_in);
    
    int nbytes = recvfrom(conn->fromSIM, status, conn->inputSize, 0, (struct sockaddr *)&conn->fromSIM_addr, &conn->fromSIM_addr_len);    
    
    elapsed_end(STAT_SIM_COMM_IN, sim_comm_in);
    if (nbytes > 0) {    
        // Get header from packet to inspect it
        header = (tRNetHeader *)status;
        if (header->Length == conn->inputSize) {
            switch (header->TypeId) {
                case eCommand:
                    if ((header->StreamId == 9) && (header->MsgId == conn->inputId)) {
                        conn->valid = 1;
                        command();                
                    }					
					
                    break;

                default:
                    break;
            }
        
            conn->transaction = header->Transaction;
            conn->timestamp = header->Timestamp;            
        }
    } else {
        command();
    }
}

// Read the inputs definition from a json file an create the on-memory structures that
// represent the inputs
void read_inputs(wrapper_config_t *config) {
    memset(map, 0, sizeof(map));
    
    // Read inputs config file
    char *json_file = read_file("inputs.json");
    if (!json_file) {
        perror("can't read inputs.json file");
        exit(1);        
    }
    
    // Parse file
    cJSON *root = cJSON_Parse(json_file);
    if (!root) {
        perror("error in inputs.json file");
        exit(1);                
    }
    
    // Iterate over all the inputs, and create the table map
    int i;
    int count = cJSON_GetArraySize(root);

    for(i=0;i<count;i++) {
        // Allocate space for the new entry
        input_map_entry_t *entry;
        
        entry = calloc(1,sizeof(input_map_entry_t));
        if (!entry) {
            perror("can't allocate new input map entry");
            exit(1);
        }

        // Get input
        cJSON *input = cJSON_GetArrayItem(root, i);

        cJSON *canid    = cJSON_GetObjectItemCaseSensitive(input, "canid");
        cJSON *protocol = cJSON_GetObjectItemCaseSensitive(input, "protocol");
        cJSON *offset   = cJSON_GetObjectItemCaseSensitive(input, "offset");
        cJSON *type     = cJSON_GetObjectItemCaseSensitive(input, "type");
        cJSON *group    = cJSON_GetObjectItemCaseSensitive(input, "group");
        cJSON *pos      = cJSON_GetObjectItemCaseSensitive(input, "pos");
        cJSON *convert  = cJSON_GetObjectItemCaseSensitive(input, "convert");

        entry->protocol = atoi(protocol->valuestring);
        entry->offset   = atoi(offset->valuestring);
        entry->group    = atoi(group->valuestring);
        entry->pos      = atoi(pos->valuestring);
        
        // Get CAN id
        if (strlen(canid->valuestring) == 0) {
            entry->can_id = 0;
        } else {
            hex_string_to_val(canid->valuestring, (char *)&entry->can_id, strlen(canid->valuestring), 1);
        }
        
        if (strcmp(convert->valuestring,"PSI_HPA") == 0) {
            entry->convert = 68.947572931783;
        } else if (strcmp(convert->valuestring,"FT_M") == 0) {
            entry->convert = 0.3048;
        } else if (strcmp(convert->valuestring,"FT/MIN_M/S") == 0) {
            entry->convert = 0.00508;
        } else if (strcmp(convert->valuestring,"BCK_P_I") == 0) {
            entry->convert = 65535.0;
        } else if (strcmp(convert->valuestring,"BCK_P_I_SW") == 0) {
            entry->convert = 100;
        } else {
            entry->convert = 0.0;
        }
        
        if (strcmp(type->valuestring,"light") == 0) {
            entry->type = Light;

            cJSON *value  = cJSON_GetObjectItemCaseSensitive(input, "value");
            cJSON *nvalue = cJSON_GetObjectItemCaseSensitive(input, "new_value");
            
            entry->value  = atoi(value->valuestring);
            entry->nvalue = atoi(nvalue->valuestring);
        } else if (strcmp(type->valuestring,"display") == 0) {
            entry->type = Display;
        } else if (strcmp(type->valuestring,"solenoid") == 0) {
            entry->type = Solenoid;

            cJSON *value  = cJSON_GetObjectItemCaseSensitive(input, "value");
            cJSON *nvalue = cJSON_GetObjectItemCaseSensitive(input, "new_value");
            
            entry->value  = atoi(value->valuestring);
            entry->nvalue = atoi(nvalue->valuestring);
        } else if (strcmp(type->valuestring,"gauge") == 0) {
            entry->type = Gauge;
        } else if (strcmp(type->valuestring,"backlight") == 0) {
            entry->type = Backlight;
        } else if (strcmp(type->valuestring,"motor") == 0) {
            entry->type = Motor;
        }

        entry->next = NULL;
        
        // Add entry to the map table
        if (map[entry->type] == NULL) {
            // First element
            map[entry->type] = entry;
        } else {
            // Insert at the end
            input_map_entry_t *centry;
            
            centry = map[entry->type];
            while (centry->next) {
                centry = centry->next;
            }
            
            centry->next = entry;
        }        
    }
    
    cJSON_Delete(root);
    
    free(json_file);
    json_file = NULL;

    // Initialize the status and mutex
    status = calloc(config->inputSize, sizeof(uint8_t));
	if (!status) {
        perror("can't allocate memory for input status");
        exit(1);		
	}
}