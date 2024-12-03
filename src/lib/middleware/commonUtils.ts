import crypto from "crypto";

const SECRET_KEY = "sleep_company"; //

// export function encryptOtp(otp) {
//     try {
//         const iv = crypto.randomBytes(16);
//         const salt = "foobar";
//         const hash = crypto.createHash("sha1");

//         hash.update(SECRET_KEY);

//         let key = hash.digest().slice(0, 16);

//         const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
//         let encrypted = cipher.update(String(otp));  // Convert OTP to string if it's a number
//         encrypted = Buffer.concat([encrypted, cipher.final()]);

//         return iv.toString('hex') + ':' + encrypted.toString('hex');
//     } catch (error) {
//         console.error('Encryption error:', error);
//         throw new Error('Failed to encrypt OTP');
//     }
// }

// export function decryptOtp(encryptedOtp) {
//     try {
//         const [ivHex, encryptedHex] = encryptedOtp.split(':');
//         const iv = Buffer.from(ivHex, 'hex');
//         const encryptedText = Buffer.from(encryptedHex, 'hex');

//         const salt = "foobar";
//         const hash = crypto.createHash("sha1");

//         hash.update(SECRET_KEY);
//         let key = hash.digest().slice(0, 16);

//         const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
//         let decrypted = decipher.update(encryptedText);
//         decrypted = Buffer.concat([decrypted, decipher.final()]);

//         return decrypted.toString();
//     } catch (error) {
//         console.error('Decryption error:', error);
//         throw new Error('Failed to decrypt OTP');
//     }
// }

// import crypto from 'crypto';

// const SECRET_KEY = 'sleep_company';

export function encryptOtp(otp: any) {
  try {
    const salt = "foobar";
    const hash = crypto.createHash("sha1");

    hash.update(SECRET_KEY);

    let key = hash.digest().slice(0, 16);

    const cipher = crypto.createCipheriv("aes-128-cbc", key, Buffer.alloc(16)); // Using a zero IV for simplicity
    let encrypted = cipher.update(String(otp)); // Convert OTP to string if it's a number
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return encrypted.toString("hex");
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt OTP");
  }
}

export function decryptOtp(encryptedOtp: any) {
  try {
    const encryptedText = Buffer.from(encryptedOtp, "hex");

    const salt = "foobar";
    const hash = crypto.createHash("sha1");

    hash.update(SECRET_KEY);
    let key = hash.digest().slice(0, 16);

    const decipher = crypto.createDecipheriv(
      "aes-128-cbc",
      key,
      Buffer.alloc(16),
    ); // Using a zero IV for simplicity
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt OTP");
  }
}

export const validatePhoneNumber = (mobile: string) => {
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return false;
  }

  return true;
};
