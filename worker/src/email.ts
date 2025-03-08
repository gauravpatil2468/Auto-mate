import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

export async function sendEmail(to: string, body: string) {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.BREVO_SMTP_HOST, // smtp-relay.brevo.com
            port: Number(process.env.BREVO_SMTP_PORT), // 587
            secure: false, // `true` for port 465, `false` for 587
            auth: {
                user: process.env.BREVO_SMTP_USER, // Your Brevo login email
                pass: process.env.BREVO_SMTP_PASSWORD, // Your Brevo master password
            },
        });

        const mailOptions = {
            from: `"Auto-Mate" <gauravpatil2468@gmail.com>`, // Replace with your sender email
            to: to, 
            subject: "Notification", 
            text: body, 
            html: `<p>${body}</p>`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}
