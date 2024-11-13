import Patient from "../../models/patient.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;
        if (!email || !password) {
            res.status(400).send('All fields required');
        }
        //check if user exists in database
        const userExists = await Patient.findOne({ email })
        if (userExists && (await bcrypt.compare(password, userExists.password))) {
            if (!userExists.isAdmin) {
                res.status(401).send("Unauthorized.");
            } else {
                //if verified, create and send a token
                const token = jwt.sign({ id: userExists._id , role: "Admin"}, process.env.JWT_SECRET_KEY, { expiresIn: "2h" });
                userExists.token = token;
                userExists.password = undefined;
                //send token to user cookie
                const options = {
                    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                    //Only server can manipulate this cookie
                    httpOnly: true
                }
                res.status(200).cookie("token", token, options).json({
                    success: true,
                    data: userExists
                })
            }
        } else if (!userExists) {
            res.status(401).send('No such admin found');
        } else {
            res.status(402).send('Wrong Password');
        }

    } catch (error) {
        console.log(error);
        res.send("Some error occurred while logging in admin.")
    }
}

export default login;