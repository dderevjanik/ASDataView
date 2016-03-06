"use strict";
var ENV_BROWSER = (typeof (window) !== 'undefined') ? true : false;
var ENV_NODE = !(ENV_BROWSER);
var zlib = (ENV_NODE) ? require('zlib') : null;
var pako = (ENV_BROWSER) ? require('pako') : null;
/**
 * Initialize function polyfil for client-side pako library
 * @retunr {IReadPolyfil}
 */
var bindPakoFnc = function (dataView) { return ({
    uint8: dataView.getUint8,
    int8: dataView.getInt8,
    uint16: dataView.getUint16,
    int16: dataView.getInt16,
    uint32: dataView.getUint32,
    int32: dataView.getInt32,
    float32: dataView.getFloat32,
    float64: dataView.getFloat64
}); };
/**
 * Initialize function polyfil for server-side nodejs zlib library
 * @return {IReadPolyfil}
 */
var bindZlibFnc = function (buffer) { return ({
    uint8: buffer.readUInt8,
    int8: buffer.readInt8,
    uint16: buffer.readUInt16LE,
    int16: buffer.readInt16LE,
    uint32: buffer.readUInt32LE,
    int32: buffer.readInt32LE,
    float32: buffer.readFloatLE,
    float64: null
}); };
/**
 * AgeScx Data view
 * supports reading and writing primitive types
 * offset is automaticly moved forward about size of 'DataType'
 */
var ASData = (function () {
    /**
     * @param {ArrayBuffer} arrayBuffer - arrayBuffer from file
     * @param {number} offset - starting offset = 0
     */
    function ASData(buffer, offset) {
        var _this = this;
        if (offset === void 0) { offset = 0; }
        this._offset = 0; // offset in binary file
        this._data = null; // will be initialized in constructor
        this._read = null; // polyfil to binary reader
        /**
         * get Unsigned 8-bit integer
         * @return {number} Unsigned 8-bit integer
         */
        this.getUint8 = function () { return _this._getPrimitive(_this._read.uint8, 1); };
        /**
         * get Signed 8-bit integer
         * @return {number} Signed 8-bit integer
         */
        this.getInt8 = function () { return _this._getPrimitive(_this._read.int8, 1); };
        /**
         * get Unsigned 16-bit integer
         * @return {number} Unsigned 16-bit integer
         */
        this.getUint16 = function () { return _this._getPrimitive(_this._read.uint16, 2); };
        /**
         * get Signed 16-bit integer
         * @return {number} Signed 16-bit integer
         */
        this.getInt16 = function () { return _this._getPrimitive(_this._read.int16, 2); };
        /**
         * get Unsigned 32-bit integer
         * @return {number} Unsigned 32-bit integer
         */
        this.getUint32 = function () { return _this._getPrimitive(_this._read.uint32, 4); };
        /**
         * get Signed 32-bit integer
         * @return {number} Signed 32-bit integer
         */
        this.getInt32 = function () { return _this._getPrimitive(_this._read.int32, 4); };
        /**
         * get 32-bit float
         * @return {number} 32-bit float
         */
        this.getFloat32 = function () { return _this._getPrimitive(_this._read.float32, 4); };
        /**
         * get 64-bit float
         * @return {number} 64-bit float
         */
        this.getFloat64 = function () { return _this._getPrimitive(_this._read.float64, 8); };
        this._getPrimitive = function (method, size) {
            _this._offset += size;
            return (method.bind(_this._data))(_this._offset - size, true);
        };
        if (ENV_BROWSER) {
            // browser enviroment
            this._data = new DataView(buffer);
            this._read = bindPakoFnc(this._data);
        }
        else {
            // nodejs enviroment
            this._data = buffer;
            this._read = bindZlibFnc(buffer);
        }
        this._offset = offset;
    }
    /**
     * will inflate dataview
     * @param {number} offset - from which offset
     */
    ASData.prototype.inflate = function (offset) {
        if (offset === void 0) { offset = 0; }
        if (ENV_BROWSER) {
            var toInflate = new Uint8Array(this._data.buffer.slice(offset));
            var inflated = pako.inflate(toInflate, { raw: true });
            return new ASData(inflated.buffer);
        }
        else {
            var inflated = zlib.inflateRawSync(this._data.slice(offset));
            return new ASData(inflated);
        }
    };
    /**
     * Create new ASReader from sliced one
     * @param {number} start - starting offset
     * @param {number} end - ending offset
     * @return {ASReader}
     */
    ASData.prototype.slice = function (start, end) {
        return new ASData(this._data.buffer.slice(start, end));
    };
    /**
     * skip number of bytes
     * @param {number} size - in bytes
     * @return {number} new offset
     */
    ASData.prototype.skip = function (size) {
        return (this._offset += size);
    };
    /**
     * set offset
     * @param {number} offset - new offset
     */
    ASData.prototype.setOffset = function (offset) {
        this._offset = offset;
    };
    /**
     * get current offset
     * @return {number} current offset
     */
    ASData.prototype.getOffset = function () {
        return this._offset;
    };
    /**
     * get char(s)
     * @param {number} length - number of chars to read
     * @return {string} result as string
     */
    ASData.prototype.getChar = function (length) {
        if (length === void 0) { length = 1; }
        // @TODO support for Unicode chars
        var result = '';
        for (var i = 0; i < length; i++) {
            result += String.fromCharCode(this.getInt8());
        }
        return result;
    };
    /**
     * get null-terminated string
     * @param {number} maxSize - maximum size of c-string
     * @return {string} result string
     */
    ASData.prototype.getCStr = function (maxSize) {
        if (maxSize === void 0) { maxSize = 65535; }
        var result = '', i = 0, char = '';
        while (i < maxSize) {
            if ((char = this.getChar()) === '\0') {
                break;
            }
            result += char;
        }
        return result;
    };
    /**
     * get string with 16-bit length
     * @return {string} result
     */
    ASData.prototype.getStr16 = function () {
        var result = '', i = 0, length = this.getUint16();
        while (i < length) {
            result += this.getChar();
            i++;
        }
        return result;
    };
    /**
     * get string with 32-bit length
     * @return {string} result
     */
    ASData.prototype.getStr32 = function () {
        var result = '', i = 0, length = this.getUint32();
        while (i < length) {
            result += this.getChar();
            i++;
        }
        return result;
    };
    return ASData;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ASData;
