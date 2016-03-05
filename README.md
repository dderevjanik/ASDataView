# ASData

![Travis](https://travis-ci.org/dderevjanik/asdata.svg?branch=master)

ASData helps with reading/writing binary files in Javascript.
It's written in typescript.

## Supported Data Types

**Char** ASCII char

**Int8**

**UInt8**

**Int16**

**UInt16**

**Int32**

**UInt32**

**Float32**

**Float64**

**CString** C String terminated with '/0' char

**String16** C++ like string

**String32** C++ like string

**Zip** you need [pako](http://nodeca.github.io/pako/)

## Methods

**inflate** unzip all data from current offset

**slice** return new ASData from sliced data

**skip** will skip number of bytes

**getOffset** get current offset

**setOffset** set offset

## Example

```js
var data = ASData(arrayBuffer);
data.getUint16(); // return unsigned int16 (short) and moves offset about 2 bytes forward
```
