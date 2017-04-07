# What's Whitecat Ecosystem Blockly Based Web IDE?

Whitecat Ecosystem Blockly Based Web IDE is a programming environment for boards compatible with the Whitecat ecosystem. This means that you can use it to program boards with a Lua RTOS firmware installed.

# What's Lua RTOS?

Lua RTOS is a real-time operating system designed to run on embedded systems, with minimal requirements of FLASH and RAM memory. Currently Lua RTOS is available for ESP32, ESP8266 and PIC32MZ platforms, and can be easilly ported to other 32-bit platforms.

Lua RTOS is the main-core of the Whitecat ecosystem, that is being developed by a team of engineers, educators and living lab designers, designed for build Internet Of Things networks in an easy way.

Lua RTOS has a 3-layers design:

1. In the top layer there is a Lua 5.3.2 interpreter which offers to the programmer all resources provided by Lua 5.3.2 programming language, plus special modules for access the hardware (PIO, ADC, I2C, RTC, etc ...) and middleware services provided by Lua RTOS (LoRa WAN, MQTT, ...).

2. In the middle layer there is a Real-Time micro-kernel, powered by FreeRTOS. This is the responsible for that things happen in the expected time.

3. In the bottom layer there is a hardware abstraction layer, which talk directly with the platform hardware.

![](http://whitecatboard.org/git/luaos.png)

You can find all related to Lua RTOS in:

[https://github.com/whitecatboard/Lua-RTOS-ESP32](https://github.com/whitecatboard/Lua-RTOS-ESP32)


# Blocks and Lua programming

The Lua RTOS compatible boards can be programmed in two ways: using the Lua programming language directly, or using a block-based programming language that translates blocks to Lua. No matter if you use Lua or blocks, both forms of programming are made from the same programming environment. The programmer can decide, for example, to made a fast prototype using blocks, then change to Lua, and finally back to blocks.

![](http://whitecatboard.org/wp-content/uploads/2016/11/block-example.png)

![](http://whitecatboard.org/wp-content/uploads/2016/11/code-example.png)

You can find all the documentataion in:

* [Blocks] (https://github.com/whitecatboard/blockly-environment/wiki) 
* [Lua] (https://github.com/whitecatboard/Lua-RTOS-ESP32/wiki) 

**Contribute to The Whitecat IDE development making a donation**

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=M8BG7JGEPZUP6)
