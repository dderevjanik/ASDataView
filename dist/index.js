define(["require", "exports"], function (require, exports) {
    "use strict";
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
        function ASData(arrayBuffer, offset) {
            var _this = this;
            if (offset === void 0) { offset = 0; }
            this._offset = 0; // offset in binary file
            this._data = null; // will be initialized in constructor
            /**
             * get Unsigned 8-bit integer
             * @return {number} Unsigned 8-bit integer
             */
            this.getUint8 = function () { return _this._getPrimitive(_this._data.getUint8, 1); };
            /**
             * get Signed 8-bit integer
             * @return {number} Signed 8-bit integer
             */
            this.getInt8 = function () { return _this._getPrimitive(_this._data.getInt8, 1); };
            /**
             * get Unsigned 16-bit integer
             * @return {number} Unsigned 16-bit integer
             */
            this.getUint16 = function () { return _this._getPrimitive(_this._data.getUint16, 2); };
            /**
             * get Signed 16-bit integer
             * @return {number} Signed 16-bit integer
             */
            this.getInt16 = function () { return _this._getPrimitive(_this._data.getInt16, 2); };
            /**
             * get Unsigned 32-bit integer
             * @return {number} Unsigned 32-bit integer
             */
            this.getUint32 = function () { return _this._getPrimitive(_this._data.getUint32, 4); };
            /**
             * get Signed 32-bit integer
             * @return {number} Signed 32-bit integer
             */
            this.getInt32 = function () { return _this._getPrimitive(_this._data.getInt32, 4); };
            /**
             * get 32-bit float
             * @return {number} 32-bit float
             */
            this.getFloat32 = function () { return _this._getPrimitive(_this._data.getFloat32, 4); };
            /**
             * get 64-bit float
             * @return {number} 64-bit float
             */
            this.getFloat64 = function () { return _this._getPrimitive(_this._data.getFloat64, 8); };
            this._getPrimitive = function (method, size) {
                _this._offset += size;
                return (method.bind(_this._data))(_this._offset - size, true);
            };
            this._offset = offset;
            this._data = new DataView(arrayBuffer, 0);
        }
        /**
         * will inflate dataview
         * @param {number} offset - from which offset
         */
        ASData.prototype.inflate = function (offset) {
            if (offset === void 0) { offset = 0; }
            var toInflate = new Uint8Array(this._data.buffer.slice(offset));
            var inflated = pako.inflate(toInflate, { raw: true });
            this._data = new DataView(inflated.buffer);
            this._offset = 0; // restart position
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
});
