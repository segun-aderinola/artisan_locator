import { randomBytes } from 'crypto';


const generateNumericCode = (length: number): string => {
    const characters = '0123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return code;
}

const formatPhoneNumber = (phone: string): string => {
    if (phone.startsWith('0') && phone.length === 11) {
        return `234${phone.slice(1)}`;
    }
    if (phone.startsWith('+234') && phone.length === 14) {
        return phone.slice(1); 
    }
    return "";
}


const generateHexToken = (bytes: number = 32) => {
  return randomBytes(bytes).toString('hex');
};

const getDistanceFromLatLonInKm = (provider_lat: number, provider_lon: number, request_lat: number, request_lon: number): number => {
    const R = 6371;
    const dLat = ((request_lat - provider_lat) * Math.PI) / 180;
    const dLon = ((request_lon - provider_lon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((provider_lat * Math.PI) / 180) *
        Math.cos((request_lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  



const Utility = {
    generateNumericCode,
    formatPhoneNumber,
    generateHexToken,
    getDistanceFromLatLonInKm
  };

  export default Utility;