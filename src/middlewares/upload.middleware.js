import { Upload } from "@aws-sdk/lib-storage";
import { S3 } from "@aws-sdk/client-s3";

const s3 = new S3({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const uploadFile = async (req, res, next) => {
    const file = req.file;
    //header set based on whether file upload is optional for a particular route.
    const isFileUploadOptional = req.get('X-File-Upload-Optional') === 'true';
    if (!file){
        if (!isFileUploadOptional){
            //if optional, function behaves like a normal controller
            res.status(400).send("File not found");
        } else {
            //else, behaves like a middleware
            next();
        }
    }
    else {
        const filename = file.originalname;
        const currTime = Date.now();
        const filePath = `Doctor/d${req.id}/${currTime}_${filename}`;
        //configuring parameters
        const params = {
            Bucket: process.env.AWS_BUCKET,
            Key: filePath,
            Body: file.buffer
            
        };

        try {
            const uploadFile = new Upload({
                client: s3,
                params: params,
            });

            uploadFile.on("httpUploadProgress", (progress) => {
                console.log(progress);
            });
            const s3response = await uploadFile.done();
            req.filePath = filePath;
            next();
        } catch (e) {
            console.error(e);
            res.status(400).send("Error occurred while uploading the file.");
        }

    }
}

export default uploadFile;

