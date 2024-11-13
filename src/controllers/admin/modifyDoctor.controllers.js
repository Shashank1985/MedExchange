import nodemailer from "nodemailer";
import randomstring from "randomstring";
import handlebars from "handlebars";
import fs from "fs";
import Doctor from "../../models/doctor.model.js";


const verifyDoctor = async (req, res) => {
    const id = req.query.id;
    const doc = await Doctor.findById(id);
    //send special code as mail.
    if (!doc) {
        res.status(404).send("No such doctor exists. Please check again.");
    }
    //  else if (doc.isVerified) {
    //     res.send("Doctor is already verified. You can login with your Secret Code received on mail.");
    // } 
    else {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            }
        });
    
        const source = fs.readFileSync('./src/utils/email_template.html', 'utf-8').toString();
        const template = handlebars.compile(source);
        const securityCode = randomstring.generate();
        const replacements = {
            username: doc.name,
            code: securityCode
        };
        const htmlToSend = template(replacements);
    
        const mailOptions = {
            from: process.env.MAIL_USERNAME,
            to: doc.email,
            subject: 'D2P - Hey Doctor! Here\'s your code! ',
            html: htmlToSend
        };
    
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
                res.send("Some error occurred while sending mail.")
            } else {
                
                doc["securityCode"] = securityCode;
                doc.isVerified = true;
                doc.save()
                .then(savedDoc => {
                    console.log('Email sent: ' + info.response);
                    console.log("Successfully verified doctor in database!")
                    res.status(200).json(savedDoc);
                })
                .catch(err => {
                    res.send('Error while adding doctor:', err);
                });
            }
        })
    }
    
}

export { verifyDoctor };