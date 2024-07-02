function ord(str) { return str.charCodeAt(0); }
module.exports = function crc16_kermit(string1) {

  let crc = 0;
  for (var x = 0; x < string1.length; x++) {

    crc = crc ^ ord(string1[x]);
    for (var y = 0; y < 8; y++) {

      if ((crc & 0x0001) == 0x0001) crc = ((crc >> 1) ^ 0x8408);
      else crc = crc >> 1;
    }
  }

  let lb = (crc & 0xff00) >> 8;
  let hb = (crc & 0x00ff) << 8;
  crc = hb | lb;

  let mhex = crc.toString(16)
  if (mhex.length < 4) {
    while (mhex.length < 4) {
      mhex = "0" + mhex
    }
    return mhex
  } else {
    return mhex
  }
}