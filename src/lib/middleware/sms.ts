import axios from 'axios';

export const sendOtp = async (mobile:any, otp:any) => {
    const apiKey = '63624625b06d9' || process.env.SMS_API_KEY;
    const sender = 'SLPCOM';
    const message = `Your One Time Password to verify your contact number is ${otp}.\n\nThe Sleep Company`;

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://www.smsalert.co.in/api/push.json?apikey=${apiKey}&sender=${sender}&mobileno=${mobile}&text=${encodeURIComponent(message)}`,
        headers: {},
    };

    try {
        const response = await axios.request(config);
        console.log('OTP sent successfully:', JSON.stringify(response.data));
        return response.data;
    } catch (error:any) {
        console.error('Error sending OTP:', error.message || error);
        throw new Error('Failed to send OTP');
    }
};

export const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();
