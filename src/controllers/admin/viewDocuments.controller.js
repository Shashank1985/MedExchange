import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import Doctor from '../../models/doctor.model.js';
import dotenv from "dotenv";
dotenv.config();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const downloadDocuments = async (req, res) => {
    const doctorId = req.params.id;
    let fileType = req.query.fileType; //degree, license, identityProof, publishments
    fileType = fileType.toLowerCase();

    const doc = await Doctor.findById(doctorId);

    if (!doc) {
        res.status(404).send("No such doctor has been registered/verified");
    } else {
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET,
            Key: doc[fileType],
            Expires: 3600 // 1 hour
        });

        /*
        preSignedUrl allows users to download file without AWS credentials.
        when the user clicks on a particular file (whose journalId and articleId are known), 
        frontend gets presigned url from 
        /browse/:category/:journalId/:articleId/download.
        to make the download prompt, set window.location.href to the presigned url.
        */
        const preSignedUrl = await getSignedUrl(s3, command);
        res.status(200).json(preSignedUrl);
    }
}

export { downloadDocuments };