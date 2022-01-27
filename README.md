# WebANT+

A project to bring ANT+ connectivity to the browser.

## Support

Works with Google Chrome on MacOS, Linux (Ubuntu) and Android. Requires ANT+ stick on all operating systems. Support for Windows 10 might be possible in the future.

The current development setup uses Suunto movestick mini, Garmin Fenix 5 watch broadcasting heart rate, Tacx Heart Rate monitor, Tacx Flux S trainer.

## Demo

Just published the first working version of the [demo](https://web-ant.vercel.app/), it's very basic, most of the UI is not yet functional, but you can coonect ANT+ Heart Rate Monitor or ANT+ controllable trainer (it must have the FE-C profile), and see some data readings.

## How to use the demo

1. connect ANT+ stick by clicking on the gray ANT+ label at the top.
2. start search for a device by clicking on one of the chip icons with the red dot.
3. once a device is found it will show inside the seach popup, select a device by clicking on it's name
4. click pair

It doesn't yet handle page reloads, and they might leave the ANT+ stick in wrong state, so you will need to plug it in and out to reset the system. 

If it doesn't work the developer console will have some information about the reason.
You can open an issue here and attach a screenshot or something with the error in the console + some info on your setup (OS, Device, Trainer, ANT+ usb stick).
