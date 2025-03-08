"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load environment variables
function sendEmail(to, body) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transporter = nodemailer_1.default.createTransport({
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
            const info = yield transporter.sendMail(mailOptions);
            console.log("Email sent: ", info.messageId);
            return info;
        }
        catch (error) {
            console.error("Error sending email:", error);
            throw error;
        }
    });
}
exports.sendEmail = sendEmail;
