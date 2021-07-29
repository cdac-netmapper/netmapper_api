const express = require('express')
const app = express()
const fs = require('fs')

const { writeToCsv } = require("./utils/csvHelper")

/* To parse URL encoded data */
app.use(express.urlencoded({ extended: true }))

/* To parse json data */
app.use(express.json())
app.set("json spaces", 40);

/* Test route */
app.get('/', (_, res) => {
    res.send('Hello World!')
})

/* Get examples */
app.get('/examples', (_, res) => {
    const examples = JSON.parse(fs.readFileSync('examples.json'))
    res.status(200).json({
        statusCode: 200,
        examples
    });
})

/* Submission route */
app.post('/submit', async (req, res) => {
    const submissionTime = new Date()
    const { 
        type, 
        desc, 
        comment,
        image,
        long,
        lat
    } = req.body
    const data = [
        {
            type,
            desc,
            comment,
            image,
            long,
            lat,
            submittedAt: submissionTime.toUTCString()
        }
    ]
    try {
        await writeToCsv(data)
        const response = {
            statusCode: 200,
            message: `Submitted at ${submissionTime.toUTCString()}`
        }
        res.status(200).json(response)
    } catch (error) {
        console.log()
        const response = {
            statusCode: 500,
            error: error.message
        }
        res.status(500).json(response)
    }
});

/* Invalid URL */
app.get('*', (_, res) => {
    res.status(404).send("404: URL not found")
});

app.listen(8080, () => {
    console.log("Server listening on port 8080")
})