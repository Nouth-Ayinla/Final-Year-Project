export const GenerateadminId = () => {
  return `VT-ADM-${Math.floor(10000 + Math.random() * 90000)}`;
};

export const GenerateVoterId = () => {
  return `VT-VTO-${Math.floor(10000 + Math.random() * 90000)}`;
};


export const Generatepin = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const GeneratepinExpiry = () => {
  return new Date(Date.now() + 15 * 60 * 1000);
}; 