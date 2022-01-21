import { xf, equals, exists, existance, empty, last, delay } from './functions.js';
import { channels } from './channels.js';

function Device(args = {}) {
    const defaults = {
        profile: 'device',
    };

    const onData  = existance(args.onData, defaultOnData);
    const profile = existance(args.profile, defaults.profile);
    const channel = channels.create({profile, onData});

    let _connected = false;

    function start() {
        const self = this;
        xf.sub(`ui:${self.id}:switch`, onSwitch.bind(self));
    }

    function stop() {
        const self = this;
        xf.unsub(`ui:${self.id}:switch`, onSwitch.bind(self));
    }

    function onSwitch() {
        if(isConnected()) {
            disconnect();
        } else {
            connect();
        }
    }

    function search() {
    }

    function isConnected() {
        return _connected;
    }

    function connect() {
        channel.connect();
        _connected = true;
    }

    function disconnect() {
        channel.disconnect();
        _connected = false;
    }

    function defaultOnData(data) {
        return data;
    }

    function write(msg) {
        channel.write(msg);
    }

    return {
        start,
        stop,
        search,
        isConnected,
        connect,
        disconnect,
        write,
    };
}

function Controllable() {

    const device = Device({profile: 'fec', onData: onData});

    let _mode = 'erg';

    function start() {
        const self = this;
        device.start();
        xf.sub(`db:mode`, onMode.bind(self));
        xf.sub('db:powerTarget', onPowerTarget.bind(self));
        xf.sub('db:resistanceTarget', onResistanceTarget.bind(self));
        xf.sub('db:slopeTarget', onSlopeTarget.bind(self));
    }

    function stop() {
        const self = this;
        device.stop();
        xf.unsub(`db:mode`, onMode.bind(self));
        xf.unsub('db:powerTarget', onPowerTarget.bind(self));
        xf.unsub('db:resistanceTarget', onResistanceTarget.bind(self));
        xf.unsub('db:slopeTarget', onSlopeTarget.bind(self));
    }

    function onMode(value) {
        _mode = value;
    }

    function onPowerTarget(power) {
        if(device.isConnected() && (equals(_mode, 'erg'))) {
            setPowerTarget(power);
        }
    }

    function onResistanceTarget(resistance) {
        if(device.isConnected()) setResistanceTarget(resistance);
    }

    function onSlopeTarget(power) {
        if(device.isConnected()) setSlopeTarget(power);
    }

    function setPowerTarget(power) {
        const view = message.targetPower.encode(power, self.channel.number);
        device.write(view);
    }

    function setResistanceTarget(level) {
        const view = message.targetResistance.encode(level, self.channel.number);
        device.write(view);
    }

    function setSlopeTarget(grade) {
        const view = message.targetSlope.encode(grade, self.channel.number);
        device.write(view);
    }

    function onData(data) {
        if(('power' in data) && !isNaN(data.power) && models.sources.isSource('power', self.id)) {
            xf.dispatch('power', data.power);
        };
        if(('cadence' in data) && !isNaN(data.cadence) && models.sources.isSource('cadence', self.id)) {
            xf.dispatch('cadence', data.cadence);
        };
        if(('speed' in data) && !isNaN(data.speed) && models.sources.isSource('speed', self.id)) {
            xf.dispatch('speed', data.speed);
        };
    }

    return Object.freeze({
        isConnected: device.isConnected,
        connect:     device.connect,
        disconnect:  device.disconnect,
        start,
        stop,
        setPowerTarget,
        setResistanceTarget,
        setSlopeTarget,
        onData,
    });
}

export { Device, Controllable, };
