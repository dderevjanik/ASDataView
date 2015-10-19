declare var pako;

/**
 * AgeScx Data view
 * supports reading and writing primitive types
 * in scenario file. After get/set'DataType', offset is automaticly
 * moved forward about size of 'DataType'
 */
class ASReader {
	
	/**
	* current position in scenario file
	*/
	public offset: number = 0;
	
	private _data: DataView = null;
	
	/**
	* @param file {File}
	* @param offset {number} starting offset, optionally at 0 offset
	*/
	constructor(arrayBuffer: ArrayBuffer, offset: number = 0){
		this.offset = offset;
		this._data = new DataView(arrayBuffer, 0);	
	}
	
	public skip = (bytes: number) => (this.offset += bytes);
	public toOffset = (offset: number) => {this.offset = offset}	
	public getInt8 = (repeat: number) => this._getPrimitiveType(this._data.getInt8.bind(this._data), 1, repeat);
	public getUint8 = (repeat: number) => this._getPrimitiveType(this._data.getUint8.bind(this._data), 1, repeat);
	public getInt16 = (repeat: number) => this._getPrimitiveType(this._data.getInt16.bind(this._data), 2, repeat);
	public getUint16 = (repeat: number) => this._getPrimitiveType(this._data.getUint16.bind(this._data), 2, repeat);
	public getInt32 = (repeat: number) => this._getPrimitiveType(this._data.getInt32.bind(this._data), 4, repeat);
	public getUint32 = (repeat: number) => this._getPrimitiveType(this._data.getUint32.bind(this._data), 4, repeat);
	public getFloat32 = (repeat: number) => this._getPrimitiveType(this._data.getFloat32.bind(this._data), 4, repeat);
	public getFloat64 = (repeat: number) => this._getPrimitiveType(this._data.getFloat32.bind(this._data), 8, repeat);
	
	/**
	* will inflate dataview
	* @param offset default 0, a point from which deflate
	*/
	public inflate(offset: number = 0){
		let toInflate = new Uint8Array(this._data.buffer.slice(offset));
		let inflated = pako.inflate(toInflate, {raw: true});
		this._data = new DataView(inflated.buffer);
		this.offset = 0; //restart position
	}
	
	/**
	* @param repeat {number} number of char(s) to retrieve
	* @description get bytes
	* @param repeat number of bytes to retrieve
	*/
	public getBytes(repeat: number = 1): Uint8Array{
		this.offset += repeat;
		return new Uint8Array(this._data.buffer.slice(this.offset-repeat, repeat));
	}
	
	/**
	* @param repeat {number} number of char(s) to retrieve
	* @description size of char is 1 byte
	* @return array of char(s)
	*/
	public getChar(repeat: number = 1): Array<number>{
		return this._repeater(repeat, (offset: number) => {
			return String.fromCharCode(this._data.getInt8(offset));
		}, 1);
	}
	
	/**
	 * @param repeat {number} number of strings to retrieve
	 * @description C string is terminated with '\0' at the end
	 * @return array of string(s) 
	 */
	public getCStr(repeat: number = 1): Array<string> {
		let ret: Array<string> = [];
		
		for(let i: number = 0; i < repeat; i++){
			let result: string = "";
			while((String.fromCharCode(this._data.getInt8(this.offset))) !== '\0'){
				ret.push(result);
			}
		}
		
		return ret;
	}

	/**
	* @param repeat number {number} of str16(s) to retrieve
	* @description every 16-bit length string has UInt16 at start, where
	* is size of string described
	* @return array of 16-bit length string(s)
	*/
	public getStr16(repeat: number = 1): Array<string>{
		let result: Array<string> = new Array<string>();
		for (let i: number = 0; i < repeat; i++){
			result.push(
				this.getChar( this.getUint16(1)[0] ).join("")
			);
		}
		return result;
	}

	/**
	* @param repeat {number} number of str32(s) to retrieve
	* @description every 32-bit length string has UInt32 at start, where
	* is size of string described
	* @return array of 16-bit length string(s)
	*/
	public getStr32(repeat: number = 1): Array<string>{
		let result: Array<string> = new Array<string>();
		for (let i: number = 0; i < repeat; i++){
			result.push(
				this.getChar( this.getUint32(1)[0] ).join("")
			);
		}
		return result;
	}

	private _getPrimitiveType(callback: Function, size: number, repeat: number = 1){
		return this._repeater(repeat, (offset: number) => {
			return callback(offset, true);
		}, size);
	}

	/**
	* @param repeat {number} how many times to repeat
	* @callback function to callback on DataView
	* @param size {number} size of data type, it'll move offset forward about size of DataType
	* @return array of readed data
	*/
	private _repeater(repeat: number, callback: Function, size: number): Array<number>{
		let result: Array<any> = new Array<any>();
		let getfnc = callback.bind(this._data);			// bind function to _data object, otherwise you'll get an error
		for(let i: number = 0; i < repeat; i++){
			result.push(getfnc(this.offset));
			this.offset += size;
		}
		return result;
	}
	
}
