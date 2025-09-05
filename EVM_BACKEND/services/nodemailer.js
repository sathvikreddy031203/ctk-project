
import nodemailer from 'nodemailer';
 
const transporter = nodemailer.createTransport({
    secure: true,
    host: 'smtp.gmail.com',
    port: 465,
    auth:{
        user:'mvpsmvp313@gmail.com',
        pass:'nkcrevwxcimxxotq'
    }
});
 
export const sendMailForOtp = async(to,sub,otp)=>{
    transporter.sendMail({
        to:to,
        subject:sub,
        html:"<h1>OTP for password change in CTKEvents</h1><p>Your OTP is <strong>" + otp + "</strong></p>",
    }
    ,(err,info)=>{
        if(err)
        {
            console.log("Error in sending mail: ",err);
        }
        else
        {
            console.log("Mail sent successfully: ",info.response);
        }
    });
}
 
 