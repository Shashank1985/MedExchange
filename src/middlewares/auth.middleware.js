import jwt from 'jsonwebtoken'

const generator = (role) => {
    return async function (req, res, next) {
        const token = req.cookies.token;
        if (!token) {
            res.status(401).send("Please login to access the page.");
        } else {
            try {
                const payload = jwt.verify(token, process.env.JWT_SECRET_KEY)
                const id = payload.id;
                req.id = id;
                if (!role.some(r => r === payload.role)) {
                    res.status(401).send("Unauthorized access.");
                } else {
                    req.role = role; //Doctor, Patient, Admin
                    next();
                }
            } catch (err) {
                console.log(err);
                res.status(500).send("Error while verifying token.");
            }
        }
    }
}

const patientAuthMiddleware = generator(["Patient"]);
const doctorAuthMiddleware = generator(["Doctor"]);
const adminAuthMiddleware = generator(["Admin"]);
const patientOrDoctorAuthMiddleware = generator(["Doctor", "Patient"])

export { patientAuthMiddleware, doctorAuthMiddleware, adminAuthMiddleware, patientOrDoctorAuthMiddleware };