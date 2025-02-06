const bounceable_tag = 0x11;
const non_bounceable_tag = 0x51;
const test_flag = 0x80;

function crc16(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i] << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
  }
  return new Uint8Array([(crc >> 8) & 0xFF, crc & 0xFF]);
}

function parseFriendlyAddress(src) {
  if (typeof src === 'string' && !Address.isFriendly(src)) {
    throw new Error('Unknown address type');
  }

  const data = src instanceof Uint8Array ? src : Utilities.base64Decode(src);

  // 1byte tag + 1byte workchain + 32 bytes hash + 2 byte crc
  if (data.length !== 36) {
    throw new Error('Unknown address type: byte length is not equal to 36');
  }

  // Prepare data
  const addr = data.slice(0, 34);
  const crc = data.slice(34, 36);
  const calcedCrc = crc16(addr);
  if (!(calcedCrc[0] === crc[0] && calcedCrc[1] === crc[1])) {
    throw new Error('Invalid checksum: ' + src);
  }

  // Parse tag
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
  if (addr[1] === 0xff) {
    workchain = -1;
  } else {
    workchain = addr[1];
  }

  const hashPart = addr.slice(2, 34);

  return { isTestOnly, isBounceable, workchain, hashPart };
}

class Address {
  static isAddress(src) {
    return src instanceof Address;
  }

  static isFriendly(source) {
    // Check length
    if (source.length !== 48) {
      return false;
    }
    // Check if address is valid base64
    return /[A-Za-z0-9+/_-]+/.test(source);
  }
  static isRaw(source) {
    // Check if has delimiter
    if (source.indexOf(':') === -1) {
      return false;
    }

    let [wc, hash] = source.split(':');

    // wc is not valid
    if (!Number.isInteger(parseFloat(wc))) {
      return false;
    }

    // hash is not valid
    if (!/[a-f0-9]+/.test(hash.toLowerCase())) {
      return false;
    }

    // hash is not correct
    if (hash.length !== 64) {
      return false;
    }

    return true;
  }

  static normalize(source) {
    if (typeof source === 'string') {
      return Address.parse(source).toString();
    } else {
      return source.toString();
    }
  }

  static parse(source) {
    if (Address.isFriendly(source)) {
      return this.parseFriendly(source).address;
    } else if (Address.isRaw(source)) {
      return this.parseRaw(source);
    } else {
      throw new Error('Unknown address type: ' + source);
    }
  }

  static parseRaw(source) {
    let workChain = parseInt(source.split(":")[0]);
    let hash = new Uint8Array(Utilities.base64Decode(source.split(":")[1]));

    return new Address(workChain, hash);
  }

  static parseFriendly(source) {
    if (source instanceof Uint8Array) {
      let r = parseFriendlyAddress(source);
      return {
        isBounceable: r.isBounceable,
        isTestOnly: r.isTestOnly,
        address: new Address(r.workchain, r.hashPart)
      };
    } else {
      let addr = source.replace(/\-/g, '+').replace(/_/g, '\/'); // Convert from url-friendly to true base64
      let r = parseFriendlyAddress(addr);
      return {
        isBounceable: r.isBounceable,
        isTestOnly: r.isTestOnly,
        address: new Address(r.workchain, r.hashPart)
      };
    }
  }

  constructor(workChain, hash) {
    if (hash.length !== 32) {
      throw new Error('Invalid address hash length: ' + hash.length);
    }

    this.workChain = workChain;
    this.hash = hash;
    Object.freeze(this);
  }

  toRawString() {
    return this.workChain + ':' + Utilities.base64Encode(this.hash);
  }

  equals(src) {
    if (src.workChain !== this.workChain) {
      return false;
    }
    return src.hash.every((val, index) => val === this.hash[index]);
  }

  toRaw() {
    const addressWithChecksum = new Uint8Array(36);
    addressWithChecksum.set(this.hash);
    addressWithChecksum.set([this.workChain, this.workChain, this.workChain, this.workChain], 32);
    return addressWithChecksum;
  }

  toStringBuffer(args) {
    let testOnly = (args && args.testOnly !== undefined) ? args.testOnly : false;
    let bounceable = (args && args.bounceable !== undefined) ? args.bounceable : true;

    let tag = bounceable ? bounceable_tag : non_bounceable_tag;
    if (testOnly) {
      tag |= test_flag;
    }

    const addr = new Uint8Array(34);
    addr[0] = tag;
    addr[1] = this.workChain;
    addr.set(this.hash, 2);
    const addressWithChecksum = new Uint8Array(36);
    addressWithChecksum.set(addr);
    addressWithChecksum.set(crc16(addr), 34);
    return addressWithChecksum;
  }

  toString(args) {
    let urlSafe = (args && args.urlSafe !== undefined) ? args.urlSafe : true;
    let buffer = this.toStringBuffer(args);
    if (urlSafe) {
      return Utilities.base64Encode(buffer).replace(/\+/g, '-').replace(/\//g, '_');
    } else {
      return Utilities.base64Encode(buffer);
    }
  }
}

function address(src) {
  return Address.parse(src);
}