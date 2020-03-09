# What's The Whitecat IDE?

Whitecat ecosystem can be programmed in two ways: using blocks or using the Lua programming language. No matter if you use blocks or Lua, both forms of programming are made from the The Whitecat IDE. It is cross-platform and localised.

Our programming model comes from years of experience and research of the Whitecat team members, formed by engineers, educators and living lab designers. We want to share our knowledge with you, so that you can develop your IOT projects in a fast and agile way.

The Whitecat IDE is available at:

* Online version: [https://ide.whitecatboard.org](https://ide.whitecatboard.org).

* Desktop version:

  - [Linux 64](https://downloads.whitecatboard.org/ide/TheWhitecatIDE-2.0-linux-x64-installer.run)

# What's Lua RTOS?

Lua RTOS is a real-time operating system designed to run on embedded systems, with minimal requirements of FLASH and RAM memory. Currently Lua RTOS is available for ESP32, ESP8266 and PIC32MZ platforms, and can be easilly ported to other 32-bit platforms.

Lua RTOS has a 3-layer design:

1. In the top layer there is a Lua 5.3.4 interpreter which offers to the programmer all the resources provided by the Lua programming language, plus special modules for access the hardware (PIO, ADC, I2C, RTC, etc …), and middleware services provided by Lua RTOS (Lua Threads, LoRa WAN, MQTT, …).
1. In the middle layer there is a Real-Time micro-kernel, powered by FreeRTOS. This is the responsible for that things happen in the expected time.
1. In the bottom layer there is a hardware abstraction layer, which talk directly with the platform hardware.

![](http://git.whitecatboard.org/luartos.png)

For porting Lua RTOS to other platforms is only necessary to write the code for the bottom layer, because the top and the middle layer are the same for all platforms.


# Blocks and Lua programming

The Lua RTOS compatible boards can be programmed using The Whitecat IDE, using blocks or lua. No matter if you use Lua or blocks. The programmer can decide, for example, to made a fast prototype using blocks, then change to Lua, and finally back to blocks.

![](http://git.whitecatboard.org/block-example.png)

![](http://git.whitecatboard.org/code-example.png)

[Visit the wiki](https://github.com/whitecatboard/whitecat-ide/wiki) for more information about The Whitecat IDE.

---
The Whitecat IDE is free for you, but funds are required for make it possible. Feel free to donate as little or as much as you wish. Every donation is very much appreciated.

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=M8BG7JGEPZUP6&lc=US)
