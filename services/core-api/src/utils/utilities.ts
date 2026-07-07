import crypto from "crypto";

export const GenerateadminId = () => {
  const buffer = crypto.randomBytes(4);
  const randomNum = Math.floor(10000 + (buffer.readUInt32BE(0) % 90000));
  return `VT-ADM-${randomNum}`;
};

export const GenerateVoterId = () => {
  const buffer = crypto.randomBytes(4);
  const randomNum = Math.floor(10000 + (buffer.readUInt32BE(0) % 90000));
  return `VT-VTO-${randomNum}`;
};

export const Generatepin = () => {
  const buffer = crypto.randomBytes(4);
  const randomNum = Math.floor(100000 + (buffer.readUInt32BE(0) % 900000));
  return randomNum.toString();
};

export const GeneratepinExpiry = () => {
  return new Date(Date.now() + 15 * 60 * 1000);
}; 