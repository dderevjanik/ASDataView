declare const require;
declare type dataViewFnc = (offset: number, s: boolean) => any;
declare type readFnc = (offset: number) => any;
declare type inflateFnc = (start: number, end: number) => any;

const ENV_BROWSER: boolean = (typeof (window) !== 'undefined') ? true : false;
const ENV_NODE: boolean = !(ENV_BROWSER);

const zlib = (ENV_NODE) ? require('zlib') : null;
const pako = (ENV_BROWSER) ? require('pako') : null;

interface IReadPolyfil {
    uint8: readFnc;
    int8: readFnc;
    uint16: readFnc;
    int16: readFnc;
    uint32: readFnc;
    int32: readFnc;
    float32: readFnc;
    float64: any
}

/**
 * Initialize function polyfil for client-side pako library
 * @retunr {IReadPolyfil}
 */
const bindPakoFnc = (dataView): IReadPolyfil => ({
    uint8: dataView.getUint8,
    int8: dataView.getInt8,
    uint16: dataView.getUint16,
    int16: dataView.getInt16,
    uint32: dataView.getUint32,
    int32: dataView.getInt32,
    float32: dataView.getFloat32,
    float64: dataView.getFloat64
});

/**
 * Initialize function polyfil for server-side nodejs zlib library
 * @return {IReadPolyfil}
 */
const bindZlibFnc = (buffer): IReadPolyfil => ({
    uint8: buffer.readUInt8,
    int8: buffer.readInt8,
    uint16: buffer.readUInt16LE,
    int16: buffer.readInt16LE,
    uint32: buffer.readUInt32LE,
    int32: buffer.readInt32LE,
    float32: buffer.readFloatLE,
    float64: null
});


/**
 * AgeScx Data view
 * supports reading and writing primitive types
 * offset is automaticly moved forward about size of 'DataType'
 */
class ASData {

    private _offset: number = 0;        // offset in binary file
    private _data: DataView|any = null; // will be initialized in constructor
    private _read: IReadPolyfil = null; // polyfil to binary reader

    /**
     * @param {ArrayBuffer} arrayBuffer - arrayBuffer from file
     * @param {number} offset - starting offset = 0
     */
    constructor(buffer: ArrayBuffer|any, offset: number = 0) {
        if (ENV_BROWSER) {
            // browser enviroment
            this._data = new DataView(buffer);
            this._read = bindPakoFnc(this._data);
        } else {
            // nodejs enviroment
            console.log('nodeJS enviroment');
            this._data = buffer;
            this._read = bindZlibFnc(buffer);
        }
        this._offset = offset;
    }

    /**
     * will inflate dataview
     * @param {number} offset - from which offset
     */
    public inflate(offset: number = 0): ASData {
        if (ENV_BROWSER) {
            const toInflate = new Uint8Array(this._data.buffer.slice(offset));
            const inflated = pako.inflate(toInflate, {raw: true});

            return new ASData(inflated.buffer);
        } else {
            const inflated = zlib.inflateRawSync(this._data.slice(offset));

            return new ASData(inflated);
        }
    }

    /**
     * Create new ASReader from sliced one
     * @param {number} start - starting offset
     * @param {number} end - ending offset
     * @return {ASReader}
     */
    public slice(start: number, end: number): ASData {
        return new ASData(this._data.buffer.slice(start, end));
    }

    /**
     * skip number of bytes
     * @param {number} size - in bytes
     * @return {number} new offset
     */
    public skip(size: number): number {
        return (this._offset += size);
    }

    /**
     * set offset
     * @param {number} offset - new offset
     */
    public setOffset(offset: number): void {
        this._offset = offset;
    }

    /**
     * get current offset
     * @return {number} current offset
     */
    public getOffset(): number {
        return this._offset;
    }

    /**
     * get char(s)
     * @param {number} length - number of chars to read
     * @return {string} result as string
     */
    public getChar(length: number = 1): string {
        // @TODO support for Unicode chars
        let result: string = '';

        for(let i: number = 0; i < length; i++) {
            result += String.fromCharCode(this.getInt8());
        }

        return result;
    }

    /**
     * get null-terminated string
     * @param {number} maxSize - maximum size of c-string
     * @return {string} result string
     */
    public getCStr(maxSize: number = 65535): string {
        let result: string = '',
        i: number = 0,
        char: string = '';

        while(i < maxSize) {
            if ((char = this.getChar()) === '\0') {
                break;
            }
            result += char;
        }

        return result;
    }

    /**
     * get string with 16-bit length
     * @return {string} result
     */
    public getStr16(): string {
        let result: string = '',
        i: number = 0,
        length: number = this.getUint16();

        while(i < length) {
            result += this.getChar();
            i++;
        }

        return result;
    }

    /**
     * get string with 32-bit length
     * @return {string} result
     */
    public getStr32(): string {
        let result: string = '',
        i: number = 0,
        length: number = this.getUint32();

        while(i < length) {
            result += this.getChar();
            i++;
        }

        return result;
    }

    /**
     * get Unsigned 8-bit integer
     * @return {number} Unsigned 8-bit integer
     */
    public getUint8 = (): number => this._getPrimitive(this._read.uint8, 1);

    /**
     * get Signed 8-bit integer
     * @return {number} Signed 8-bit integer
     */
    public getInt8 = (): number => this._getPrimitive(this._read.int8, 1);

    /**
     * get Unsigned 16-bit integer
     * @return {number} Unsigned 16-bit integer
     */
    public getUint16 = (): number => this._getPrimitive(this._read.uint16, 2);

    /**
     * get Signed 16-bit integer
     * @return {number} Signed 16-bit integer
     */
    public getInt16 = (): number => this._getPrimitive(this._read.int16, 2);

    /**
     * get Unsigned 32-bit integer
     * @return {number} Unsigned 32-bit integer
     */
    public getUint32 = (): number => this._getPrimitive(this._read.uint32, 4);

    /**
     * get Signed 32-bit integer
     * @return {number} Signed 32-bit integer
     */
    public getInt32 = (): number => this._getPrimitive(this._read.int32, 4);

    /**
     * get 32-bit float
     * @return {number} 32-bit float
     */
    public getFloat32 = (): number => this._getPrimitive(this._read.float32, 4);

    /**
     * get 64-bit float
     * @return {number} 64-bit float
     */
    public getFloat64 = (): number => this._getPrimitive(this._read.float64, 8);

    private _getPrimitive = (method: dataViewFnc, size: number): number => {
        this._offset += size;
        return (method.bind(this._data))(this._offset - size, true);
    }

}

export default ASData;