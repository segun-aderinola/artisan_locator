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
    // Check if the number starts with '0' and is 11 characters long
    if (phone.startsWith('0') && phone.length === 11) {
        // Replace the '0' with '+234' for Nigerian phone numbers
        return `234${phone.slice(1)}`;
    }

    // If the number starts with '+234' and is 13 characters long, return it as it is +2348187907998
    if (phone.startsWith('+234') && phone.length === 14) {
        return phone.slice(1);  // Remove the '+' sign to store it as '234...' format
    }

    // If the phone number doesn't meet either condition, return it as is (or you can throw an error)
    return "";
}


const generateHexToken = (bytes: number = 32) => {
  // Generate a secure random token (e.g., 32 bytes in hex format)
  return randomBytes(bytes).toString('hex');
};



const Utility = {
    generateNumericCode,
    formatPhoneNumber,
    generateHexToken,
  };

  export default Utility;


//   TODO::rate limiting for token generation

//   const maxRequests = 5;  // Max 5 requests per minute
//   const timeWindow = 1 * 60 * 1000;  // 1 minute
  
//   const recentRequests = await TokenModel.findAll({
//     where: {
//       user_id: userId,
//       createdAt: {
//         [Sequelize.Op.gte]: moment().subtract(timeWindow, 'milliseconds').toDate(),
//       },
//     },
//   });
  
//   if (recentRequests.length >= maxRequests) {
//     throw new Error('Too many requests. Please try again later.');
//   }
  

// import nodemailer from 'nodemailer';

// export async function sendEmailVerification(to: string, code: string) {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER, // Your email
//       pass: process.env.EMAIL_PASS, // Your email password
//     },
//   });

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to,
//     subject: 'Your Verification Code',
//     text: `Your email verification code is: ${code}. This code will expire in 10 minutes.`,
//   };

//   return transporter.sendMail(mailOptions);
// }
