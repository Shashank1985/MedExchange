import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Upload } from "@aws-sdk/lib-storage";
import { S3 } from "@aws-sdk/client-s3";
import Doctor from "../../models/doctor.model.js"


const s3 = new S3({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});


const signup = async (req, res) => {
    try {
        const {
            name,
            email,
            gender,
            password,
            contact,
            specialization,
        } = req.body;
        const DOB = new Date(req.body.DOB).toLocaleDateString('en-US'); // dd/mm/yyyy
        
        if (!name || !DOB || !email || !gender || !password || !specialization) {
            res.status(400).send('All fields are required');
        }
        const checkExisting = await Doctor.findOne({ email })
        if (checkExisting) {
            res.status(400).send('Doctor already registered/pending verification');
        } else {
            const files = req.files; //object containing fieldName as key, array of files with that name as value.
            console.log(files);
            console.log(req.body);
            if (!files["medicalLicense"] || !files["degree"] || !files["identityProof"]) {
                res.status(400).send("Please upload all the required documents marked with *");
            } else {
                //encrypt password 
                const hashedPassword = await bcrypt.hash(password, 10);
                let newDoctor = await Doctor({
                    name,
                    email,
                    password: hashedPassword,
                    DOB,
                    gender,
                    contact,
                    specialization,
                })
                const fields = Object.keys(files); //fields = ["medicalLicense", "degree", "identityProof", "publishments"]
                
                let fileObjects = [];
                fields.forEach(field => {
                    files[field].forEach(file => {
                        fileObjects.push(file);
                    }) 
                });

                let fileUploadPaths = {} // filePath of the file in each field.

                async function uploadFile(file) {      
                    try {
                        let field;
                        fields.forEach(f => {
                            if (files[f].includes(file)) {
                                field = f;
                            }
                        });
                        const filename = file.originalname;
                        const currTime = Date.now();
                        // Doctor/4703284028340/degree/16827339382_degree.pdf
                        const filePath = `Doctor/${newDoctor._id}/${field}/${currTime}_${filename}`;          
                        const params = {
                            Bucket: process.env.AWS_BUCKET,
                            Key: filePath,
                            Body: file.buffer,
                        };
                        if (field === "publishments") {
                            if (!fileUploadPaths[publishments]) {
                                fileUploadPaths[publishments] = [filePath];
                            } else {
                                fileUploadPaths[field].push(filePath);
                            }
                        } else {
                            fileUploadPaths[field] = filePath;
                        }
                        const uploadFile = new Upload({
                            client: s3,
                            params: params
                        });
            
                        uploadFile.on("httpUploadProgress", (progress) => {
                            console.log(progress);
                        });
                        return await uploadFile.done();
                    } catch (err) {
                        console.log(err);
                        console.log("\n\n")
                    }
                }
                
                async function uploadAllFiles() {
                    const uploadPromises = fileObjects.map(file => uploadFile(file));
                    console.log(uploadPromises)
                    await Promise.all(uploadPromises);
                    console.log('All files uploaded successfully.');

                    fields.forEach(field => {
                        newDoctor[field] = fileUploadPaths[field];
                    })
                    const savedDoc = await newDoctor.save();
                    console.log("Successfully added doctor in database.")
                    res.status(200).json(savedDoc);
                }
                  
                uploadAllFiles();
                

            }
        }
    } catch (error) {
        console.log(error);
        console.log("\n\n");
        res.send("Some error occurred while signing up user.")
    }
}

const login = async (req, res) => {
    try {
        const {
            email,
            password,
            securityCode
        } = req.body;
        if (!email || !password || !securityCode) {
            res.status(400).send('All fields required');
        }
        //check if user exists in database
        const doctorExists = await Doctor.findOne({ email })
        if (doctorExists && (await bcrypt.compare(password, doctorExists.password))) {
            //if verified, create and send a token
            if (!doctorExists.isVerified) {
                res.status(401).send('Please wait for verification');
            } else if (doctorExists.securityCode !== securityCode) {
                res.send("Invalid answer. Please try again.");
            } 
            else {
                const token = jwt.sign({ id: doctorExists._id , role: "Doctor"}, process.env.JWT_SECRET_KEY, { expiresIn: "2h" });
                doctorExists.token = token;
                doctorExists.password = undefined;
    
                //send token to user cookie
                const options = {
                    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                    //Only server can manipulate this cookie
                    httpOnly: true
                }
                res.status(200).cookie("token", token, options).json({
                    success: true,
                    token,
                    data: doctorExists
                })
            }
        }

        else if (!doctorExists)
            res.status(401).send('Please Sign Up first');

        else
            res.status(402).send('Wrong Password');

    } catch (error) {
        console.log(error);
        res.send("Some error occurred while logging in user.")
    }
}


export default {login, signup};