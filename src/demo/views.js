import { xf, equals, exists, existance, } from '../functions.js';

class DataView extends HTMLElement {
    constructor() {
        super();
        this.state = '';
        this.postInit();
    }
    postInit() { return; }
    static get observedAttributes() {
        return ['disabled'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if(equals(name, 'disabled')) {
            this.disabled = exists(newValue) ? true : false;
        }
    }
    getDefaults() {
        return {};
    }
    config() {
        return;
    }
    subs() {
        xf.sub(`${this.prop}`, this.onUpdate.bind(this));
    }
    connectedCallback() {
        this.prop     = existance(this.getAttribute('prop'), this.getDefaults().prop);
        this.disabled = this.hasAttribute('disabled');

        this.config();
        this.subs();
    }
    unsubs() { return; }
    disconnectedCallback() {
        window.removeEventListener(`${this.prop}`, this.onUpdate);
        this.unsubs();
    }
    getValue(propValue) {
        return propValue;
    }
    shouldUpdate(value) {
        return !equals(value, this.state) && !this.disabled;
    }
    updataState(value) {
        this.state = value;
    }
    onUpdate(propValue) {
        const value = this.getValue(propValue);

        if(this.shouldUpdate(value)) {
            this.updataState(value);
            this.render();
        }
    }
    transform(state) {
        return state;
    }
    render() {
        this.textContent = this.transform(this.state);
    }
}

customElements.define('data-view', DataView);


class PowerValue extends DataView {
    getDefaults() {
        return {
            prop: 'db:power',
        };
    }
}

customElements.define('power-value', PowerValue);


class SpeedValue extends DataView {
    postInit() {
        this.measurement = this.getDefaults().measurement;
    }
    getDefaults() {
        return {
            prop: 'db:speed',
            measurement: 'metric',
        };
    }
    onMeasurement(measurement) {
        this.measurement = measurement;
    }
    kmhToMph(kmh) {
        return 0.621371 * kmh;
    };
    format(value, measurement = 'metric') {
        if(equals(measurement, 'imperial')) {
            value = `${this.kmhToMph(value).toFixed(1)}`;
        } else {
            value = `${(value).toFixed(1)}`;
        }
        return value;
    }
    transform(state) {
        return this.format(state, this.measurement);
    }
}

customElements.define('speed-value', SpeedValue);


class CadenceValue extends DataView {
    getDefaults() {
        return {
            prop: 'db:cadence',
        };
    }
}

customElements.define('cadence-value', CadenceValue);


class HeartRateValue extends DataView {
    getDefaults() {
        return {
            prop: 'db:heartRate',
        };
    }
}

customElements.define('heart-rate-value', HeartRateValue);


class DeviceRequest extends HTMLElement {
    constructor() {
        super();
        this.devices = new Map();
        this.selected = undefined;
        this._status = 'closed';
        this.listSelector   = '#device-request--list';
        this.cancelSelector = '#device-request--cancel';
        this.pairSelector   = '#device-request--pair';
    }
    get status() {
        return this._status;
    }
    set status(value) {
        this._status = value;
        console.log(this._status);
    }
    connectedCallback() {
        this.list      = this.querySelector(this.listSelector);
        this.cancelBtn = this.querySelector(this.cancelSelector);
        this.pairBtn   = this.querySelector(this.pairSelector);

        xf.sub(`ant:search:start`,  this.onStart.bind(this));
        xf.sub(`ant:search:cancel`, this.onCancel.bind(this));
        xf.sub(`ant:search:found`,  this.onFound.bind(this));


        xf.sub(`pointerup`, this.onSelectAction.bind(this), this.list);
        xf.sub(`pointerup`, this.onCancelAction.bind(this), this.cancelBtn);
        xf.sub(`pointerup`, this.onPairAction.bind(this),   this.pairBtn);
    }
    disconnectedCallback() {
        xf.unsub(`ant:search:start`,  this.onSwitch);
        xf.unsub(`ant:search:cancel`, this.onCancel);
        xf.unsub(`ant:search:found`,  this.onFound);

        xf.unsub(`pointerup`, this.onSelectAction, this.list);
        xf.unsub(`pointerup`, this.onCancelAction, this.cancelBtn);
        xf.unsub(`pointerup`, this.onPairAction,   this.pairBtn);
    }
    onStart() {
        this.open();
    }
    onCancel() {
        this.close();
    }
    onPair() {
        this.pair();
        this.close();
    }
    onFound(channelId) {
        this.add(channelId);
    }
    onLost(device) {
        this.remove(device);
    }
    onSelectAction(e) {
        const el = e.target.closest('.device-request--item');
        const els = this.list.querySelectorAll('.device-request--item');

        if(el === undefined || el === null) return;
        if(el.id === undefined) return;

        els.forEach(el => el.classList.remove('active'));
        el.classList.add('active');

        this.select(parseInt(el.id));
    }
    onCancelAction() {
        xf.dispatch(`ant:search:cancel`);
    }
    onPairAction() {
        this.pair();
    }
    open() {
        this.status = 'opened';
        this.classList.add('active');
    }
    close() {
        this.status = 'closed';
        this.clear();
        this.classList.remove('active');
    }
    select(deviceNumber) {
        const channelId = this.devices.get(deviceNumber);
        this.selected = channelId;
        console.log(`:device-selected ${channelId}`);
    }
    pair() {
        this.status = 'pairing';
        this.close();
        xf.dispatch('ant:search:pair', this.selected);
    }
    deviceItemTemplate(args = { deviceNumber: '--', deviceType: '--'}) {
        return `<div class="device-request--item" id="${args.deviceNumber}">
        <div class="device-request--item--protocol">ANT+</div>
        <div class="device-request--item--number">${args.deviceNumber}</div>
        <div class="device-request--item--type">${args.deviceType}</div>
     </div>`;
    }
    add(channelId) {
        if(this.devices.has(channelId.deviceNumber)) return;

        this.devices.set(channelId.deviceNumber, channelId);
        const item = this.deviceItemTemplate(channelId);
        this.list.insertAdjacentHTML('beforeend', item);
    }
    remove(device) {
        const item = this.list.querySelector(`#${device.deviceNumber}`);
        this.list.removeChild(item);
    }
    clear() {
        this.list.innerHTML = '';
        this.devices = new Map();
    }
}

customElements.define('device-request', DeviceRequest);


class ConnectionSwitch extends HTMLElement {
    constructor() {
        super();
        this.status = 'off';
    }
    connectedCallback() {
        this.for            = this.getAttribute('for');
        this.onClass        = existance(this.getAttribute('onClass'), this.defaultOnClass());
        this.offClass       = existance(this.getAttribute('offClass'), this.defaultOffClass());
        this.loadingClass   = existance(this.getAttribute('loadingClass'), this.defaultLoadingClass());
        this.indicatorClass = existance(this.getAttribute('indicatorClass'), this.defaultIndicatorClass());

        this.indicator = existance(this.querySelector(`.${this.indicatorClass}`), this);

        xf.sub('pointerup',                this.onEffect.bind(this), this);
        xf.sub(`${this.for}:connected`,    this.on.bind(this));
        xf.sub(`${this.for}:disconnected`, this.off.bind(this));
        xf.sub(`${this.for}:connecting`,   this.loading.bind(this));
    }
    defaultOnClass() {
        return 'on';
    }
    defaultOffClass() {
        return 'off';
    }
    defaultLoadingClass() {
        return 'loading';
    }
    defaultIndicatorClass() {
        return 'connection-switch--indicator';
    }
    disconnectedCallback() {
        this.removeEventListener('pointerup', this.onEffect);
        document.removeEventListener(`${this.for}:connected`,    this.on);
        document.removeEventListener(`${this.for}:disconnected`, this.off);
        document.removeEventListener(`${this.for}:connecting`,   this.loading);
    }
    onEffect(e) {
        console.log(`ui:${this.for}:switch`);
        xf.dispatch(`ui:${this.for}:switch`);
    }
    on(e) {
        this.indicator.classList.remove(this.loadingClass);
        this.indicator.classList.remove(this.offClass);
        this.indicator.classList.add(this.onClass);
    }
    off(e) {
        this.indicator.classList.remove(this.loadingClass);
        this.indicator.classList.remove(this.onClass);
        this.indicator.classList.add(this.offClass);
    }
    loading(e) {
        this.indicator.classList.remove(this.offClass);
        this.indicator.classList.remove(this.onClass);
        this.indicator.classList.add(this.loadingClass);
    }
    render() {}
}

customElements.define('connection-switch', ConnectionSwitch);



export {
    ConnectionSwitch,
    DataView,
}

