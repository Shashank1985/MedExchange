import axios from "axios";
axios.defaults.proxy = false;
const uploadPrompt = async (req, res) => {
    const inp = req.body.prompt;
    if (!inp) {
        res.send("No input prompt detected.");
    } else {
        const response = await axios({
            url: "https://hackout-ml-model.onrender.com/output",
            method: "GET",
            data: {
                prompt: inp
            },
            headers: {'Content-Type': 'application/json'}
        })
        console.log(response.data);
        res.status(200).json({output: response.data});
    }
}

export default uploadPrompt