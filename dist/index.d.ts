/**
 * AgeScx Data view
 * supports reading and writing primitive types
 * offset is automaticly moved forward about size of 'DataType'
 */
export default class ASData {
    private _offset;
    private _data;
    /**
     * @param {ArrayBuffer} arrayBuffer - arrayBuffer from file
     * @param {number} offset - starting offset = 0
     */
    constructor(arrayBuffer: ArrayBuffer, offset?: number);
    /**
     * will inflate dataview
     * @param {number} offset - from which offset
     */
    inflate(offset?: number): void;
    /**
     * Create new ASReader from sliced one
     * @param {number} start - starting offset
     * @param {number} end - ending offset
     * @return {ASReader}
     */
    slice(start: number, end: number): ASData;
    /**
     * skip number of bytes
     * @param {number} size - in bytes
     * @return {number} new offset
     */
    skip(size: number): number;
    /**
     * set offset
     * @param {number} offset - new offset
     */
    setOffset(offset: number): void;
    /**
     * get current offset
     * @return {number} current offset
     */
    getOffset(): number;
    /**
     * get char(s)
     * @param {number} length - number of chars to read
     * @return {string} result as string
     */
    getChar(length?: number): string;
    /**
     * get null-terminated string
     * @param {number} maxSize - maximum size of c-string
     * @return {string} result string
     */
    getCStr(maxSize?: number): string;
    /**
     * get string with 16-bit length
     * @return {string} result
     */
    getStr16(): string;
    /**
     * get string with 32-bit length
     * @return {string} result
     */
    getStr32(): string;
    /**
     * get Unsigned 8-bit integer
     * @return {number} Unsigned 8-bit integer
     */
    getUint8: () => number;
    /**
     * get Signed 8-bit integer
     * @return {number} Signed 8-bit integer
     */
    getInt8: () => number;
    /**
     * get Unsigned 16-bit integer
     * @return {number} Unsigned 16-bit integer
     */
    getUint16: () => number;
    /**
     * get Signed 16-bit integer
     * @return {number} Signed 16-bit integer
     */
    getInt16: () => number;
    /**
     * get Unsigned 32-bit integer
     * @return {number} Unsigned 32-bit integer
     */
    getUint32: () => number;
    /**
     * get Signed 32-bit integer
     * @return {number} Signed 32-bit integer
     */
    getInt32: () => number;
    /**
     * get 32-bit float
     * @return {number} 32-bit float
     */
    getFloat32: () => number;
    /**
     * get 64-bit float
     * @return {number} 64-bit float
     */
    getFloat64: () => number;
    private _getPrimitive;
}
