declare var pako: any; // support for Pako library

declare type dataViewFnc = (offset: number) => any;

/**
 * AgeScx Data view
 * supports reading and writing primitive types
 * offset is automaticly moved forward about size of 'DataType'
 */
export default class ASData {

    private _offset: number = 0;    // offset in binary file
    private _data: DataView = null; // will be initialized in constructor

    /**
     * @param {ArrayBuffer} arrayBuffer - arrayBuffer from file
     * @param {number} offset - starting offset = 0
     */
    constructor(arrayBuffer: ArrayBuffer, offset: number = 0) {
        this._offset = offset;
        this._data = new DataView(arrayBuffer, 0);
    }

    /**
     * will inflate dataview
     * @param {number} offset - from which offset
     */
    public inflate(offset: number = 0): void {
        let toInflate = new Uint8Array(this._data.buffer.slice(offset));
        let inflated = pako.inflate(toInflate, {raw: true});

        this._data = new DataView(inflated.buffer);
        this._offset = 0; // restart position
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
    public getUint8 = (): number => this._getPrimitive(this._data.getUint8, 1);

    /**
     * get Signed 8-bit integer
     * @return {number} Signed 8-bit integer
     */
    public getInt8 = (): number => this._getPrimitive(this._data.getInt8, 1);

    /**
     * get Unsigned 16-bit integer
     * @return {number} Unsigned 16-bit integer
     */
    public getUint16 = (): number => this._getPrimitive(this._data.getUint16, 2);

    /**
     * get Signed 16-bit integer
     * @return {number} Signed 16-bit integer
     */
    public getInt16 = (): number => this._getPrimitive(this._data.getInt16, 2);

    /**
     * get Unsigned 32-bit integer
     * @return {number} Unsigned 32-bit integer
     */
    public getUint32 = (): number => this._getPrimitive(this._data.getUint32, 4);

    /**
     * get Signed 32-bit integer
     * @return {number} Signed 32-bit integer
     */
    public getInt32 = (): number => this._getPrimitive(this._data.getInt32, 4);

    /**
     * get 32-bit float
     * @return {number} 32-bit float
     */
    public getFloat32 = (): number => this._getPrimitive(this._data.getFloat32, 4);

    /**
     * get 64-bit float
     * @return {number} 64-bit float
     */
    public getFloat64 = (): number => this._getPrimitive(this._data.getFloat64, 8);

    private _getPrimitive = (method: dataViewFnc, size: number): number => {
        this._offset += size;
        return (method.bind(this._data))(this._offset - size, true);
    }

}
