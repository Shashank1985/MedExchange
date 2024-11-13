import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Patient from "../../models/patient.model.js"


const signup = async (req, res) => {
    try {
        const {
            name,
            email,
            gender,
            password,
            countryOfOrigin,
            contact,
        } = req.body;
        const DOB = new Date(req.body.DOB).toLocaleDateString('en-US'); // dd/mm/yyyy
        
        if (!name || !DOB || !email || !gender || !password) {
            res.status(400).send('All fields are required');
        }
    
        const checkExisting = await Patient.findOne({ email })
        if (checkExisting) {
            res.status(400).send('User Already Exists');
        } else {
            //encrypt password 
            const hashedPassword = await bcrypt.hash(password, 10);
            let newUser = await Patient.create({
                name,
                email,
                password: hashedPassword,
                DOB,
                gender,
                countryOfOrigin,
                contact
            })
            console.log("Successfully created new user!");
            res.status(200).json(newUser);
        }
    } catch (error) {
        console.log(error);
        res.send("Some error occurred while signing up user.")
    }
}

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
            //if verified, create and send a token
            const token = jwt.sign({ id: userExists._id , role: "Patient"}, process.env.JWT_SECRET_KEY, { expiresIn: "2h" });
            userExists.token = token;
            userExists.password = undefined;
            //send token to user cookie
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                //Only server can manipulate this cookie
                httpOnly: true
            }
            res.status(200).cookie("token", token, options)
            .redirect("https://d2p-frontend.onrender.com/patient/dashboard")
        }

        else if (!userExists)
            res.status(401).send('Please Sign Up first');

        else
            res.status(402).send('Wrong Password');

    } catch (error) {
        console.log(error);
        res.send("Some error occurred while logging in user.")
    }
}


export default {login, signup};