# ASDataView

ASDataView helps with reading/writing binary files in Javascript. It's written in typescript.

## Supported Data Types

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

## Example

```tsc
var reader = ASReader(arrayBuffer); 
reader.getInt8(); // return Int8 and move offest about 1 bytes forward
```

