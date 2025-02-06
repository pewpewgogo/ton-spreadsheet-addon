const bounceable_tag = 0x11;
const non_bounceable_tag = 0x51;
const test_flag = 0x80;

function crc16(data) {
    const poly = 0x1021;
    let reg = 0;
    const message = new Uint8Array(data.length + 2);
    message.set(data);
    for (let byte of message) {
        let mask = 0x80;
        while (mask > 0) {
            reg <<= 1;
            if (byte & mask) {
                reg += 1;
            }
            mask >>= 1
            if (reg > 0xffff) {
                reg &= 0xffff;
                reg ^= poly;
            }
        }
    }
    return new Uint8Array([Math.floor(reg / 256), reg % 256]);
}

function stringToBytes(str, size = 1) {
    let buf;
    let bufView;
    if (size === 1) {
        buf = new ArrayBuffer(str.length);
        bufView = new Uint8Array(buf);
    }
    if (size === 2) {
        buf = new ArrayBuffer(str.length * 2);
        bufView = new Uint16Array(buf);
    }
    if (size === 4) {
        buf = new ArrayBuffer(str.length * 4);
        bufView = new Uint32Array(buf);
    }
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return new Uint8Array(bufView.buffer);
}

/**
 * Converts a base64 string to a binary string.
 * @param {string} base64 - The base64 string to decode.
 * @returns {string} - The decoded binary string.
 */
function base64toString(base64) {
  try {
    // Decode base64 to bytes
    const bytes = Utilities.base64Decode(base64);
    // Convert bytes to a binary string
    let binaryString = '';
    for (let i = 0; i < bytes.length; i++) {
      binaryString += String.fromCharCode(bytes[i]);
    }
    return binaryString;
  } catch (e) {
    throw new Error('Invalid base64 input: ' + e.message);
  }
}

/**
 * Converts a binary string to a base64 string.
 * @param {string} s - The binary string to encode.
 * @returns {string} - The encoded base64 string.
 */
function stringToBase64(s) {
  try {
    // Convert binary string to bytes
    const bytes = [];
    for (let i = 0; i < s.length; i++) {
      bytes.push(s.charCodeAt(i));
    }
    // Encode bytes to base64
    return Utilities.base64Encode(bytes);
  } catch (e) {
    throw new Error('Invalid binary string input: ' + e.message);
  }
}

// Lookup table for converting bytes to hex
const to_hex_array = [
  '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '0a', '0b', '0c', '0d', '0e', '0f',
  '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '1a', '1b', '1c', '1d', '1e', '1f',
  '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '2a', '2b', '2c', '2d', '2e', '2f',
  '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '3a', '3b', '3c', '3d', '3e', '3f',
  '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '4a', '4b', '4c', '4d', '4e', '4f',
  '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '5a', '5b', '5c', '5d', '5e', '5f',
  '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '6a', '6b', '6c', '6d', '6e', '6f',
  '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '7a', '7b', '7c', '7d', '7e', '7f',
  '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '8a', '8b', '8c', '8d', '8e', '8f',
  '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '9a', '9b', '9c', '9d', '9e', '9f',
  'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'aa', 'ab', 'ac', 'ad', 'ae', 'af',
  'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'ba', 'bb', 'bc', 'bd', 'be', 'bf',
  'c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'ca', 'cb', 'cc', 'cd', 'ce', 'cf',
  'd0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'da', 'db', 'dc', 'dd', 'de', 'df',
  'e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'ea', 'eb', 'ec', 'ed', 'ee', 'ef',
  'f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'fa', 'fb', 'fc', 'fd', 'fe', 'ff'
];

// Lookup table for converting hex strings to bytes
const to_byte_map = {};
for (let i = 0; i < to_hex_array.length; i++) {
  to_byte_map[to_hex_array[i]] = i;
}

// Convert a buffer to a hex string
function bytesToHex(buffer) {
  const hex_array = [];
  for (let i = 0; i < buffer.length; i++) {
    hex_array.push(to_hex_array[buffer[i]]);
  }
  return hex_array.join("");
}

// Convert a hex string back to bytes (Uint8Array)
function hexToBytes(s) {
  s = s.toLowerCase();
  const length2 = s.length;
  if (length2 % 2 !== 0) {
    throw new Error("Hex string must have length a multiple of 2");
  }
  const length = length2 / 2;
  const result = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    const i2 = i * 2;
    const b = s.substring(i2, i2 + 2);
    if (!to_byte_map.hasOwnProperty(b)) {
      throw new Error('Invalid hex character ' + b);
    }
    result[i] = to_byte_map[b];
  }
  return result;
}
/**
 * @private
 * @param addressString {string}
 * @return {{isTestOnly: boolean, workchain: number, hashPart: Uint8Array, isBounceable: boolean}}
 */
function parseFriendlyAddress(addressString) {
    if (addressString.length !== 48) {
        throw new Error(`User-friendly address should contain strictly 48 characters`);
    }
    const data = stringToBytes(base64toString(addressString));
    if (data.length !== 36) { // 1byte tag + 1byte workchain + 32 bytes hash + 2 byte crc
        throw "Unknown address type: byte length is not equal to 36";
    }
    const addr = data.slice(0, 34);
    const crc = data.slice(34, 36);
    const calcedCrc = crc16(addr);
    if (!(calcedCrc[0] === crc[0] && calcedCrc[1] === crc[1])) {
        throw "Wrong crc16 hashsum";
    }
    let tag = addr[0];
    let isTestOnly = false;
    let isBounceable = false;
    if (tag & test_flag) {
        isTestOnly = true;
        tag = tag ^ test_flag;
    }
    if ((tag !== bounceable_tag) && (tag !== non_bounceable_tag))
        throw "Unknown address tag";

    isBounceable = tag === bounceable_tag;

    let workchain = null;
    if (addr[1] === 0xff) { // TODO we should read signed integer here
        workchain = -1;
    } else {
        workchain = addr[1];
    }
    if (workchain !== 0 && workchain !== -1) throw new Error('Invalid address wc ' + workchain);

    const hashPart = addr.slice(2, 34);
    return {isTestOnly, isBounceable, workchain, hashPart};
}

class Address {
    /**
     * @param anyForm {string | Address}
     */
    static isValid(anyForm) {
        try {
            new Address(anyForm);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * @param anyForm {string | Address}
     */
    constructor(anyForm) {
        if (anyForm == null) {
            throw "Invalid address";
        }

        if (anyForm instanceof Address) {
            this.wc = anyForm.wc;
            this.hashPart = anyForm.hashPart;
            this.isTestOnly = anyForm.isTestOnly;
            this.isUserFriendly = anyForm.isUserFriendly;
            this.isBounceable = anyForm.isBounceable;
            this.isUrlSafe = anyForm.isUrlSafe;
            return;
        }

        this.isUrlSafe = true;

        if (anyForm.search(/\-/) > 0 || anyForm.search(/_/) > 0) {
            anyForm = anyForm.replace(/\-/g, '+').replace(/_/g, '\/');
        } else {
            this.isUrlSafe = false;
        }
        if (anyForm.indexOf(':') > -1) {
            const arr = anyForm.split(':');
            if (arr.length !== 2) throw new Error('Invalid address ' + anyForm);
            const wc = parseInt(arr[0]);
            if (wc !== 0 && wc !== -1) throw new Error('Invalid address wc ' + anyForm);
            const hex = arr[1];
            if (hex.length !== 64) throw new Error('Invalid address hex ' + anyForm);
            this.isUserFriendly = false;
            this.wc = wc;
            this.hashPart = hexToBytes(hex);
            this.isTestOnly = false;
            this.isBounceable = false;
        } else {
            this.isUserFriendly = true;
            const parseResult = parseFriendlyAddress(anyForm);
            this.wc = parseResult.workchain;
            this.hashPart = parseResult.hashPart;
            this.isTestOnly = parseResult.isTestOnly;
            this.isBounceable = parseResult.isBounceable;
        }
    }

    /**
     * @param isUserFriendly? {boolean}
     * @param isUrlSafe? {boolean}
     * @param isBounceable? {boolean}
     * @param isTestOnly? {boolean}
     * @return {string}
     */
    toString(isUserFriendly,
             isUrlSafe,
             isBounceable,
             isTestOnly) {

        if (isUserFriendly === undefined) isUserFriendly = this.isUserFriendly;
        if (isUrlSafe === undefined) isUrlSafe = this.isUrlSafe;
        if (isBounceable === undefined) isBounceable = this.isBounceable;
        if (isTestOnly === undefined) isTestOnly = this.isTestOnly;

        if (!isUserFriendly) {
            return this.wc + ":" + bytesToHex(this.hashPart);
        } else {
            let tag = isBounceable ? bounceable_tag : non_bounceable_tag;
            if (isTestOnly) {
                tag |= test_flag;
            }

            const addr = new Int8Array(34);
            addr[0] = tag;
            addr[1] = this.wc;
            addr.set(this.hashPart, 2);

            const addressWithChecksum = new Uint8Array(36);
            addressWithChecksum.set(addr);
            addressWithChecksum.set(crc16(addr), 34);
            let addressBase64 = stringToBase64(String.fromCharCode.apply(null, new Uint8Array(addressWithChecksum)));

            if (isUrlSafe) {
                addressBase64 = addressBase64.replace(/\+/g, '-').replace(/\//g, '_');
            }
            return addressBase64;
        }
    }
}