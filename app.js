const express = require('express')
const app = express()

const { writeToCsv } = require("./utils/csvHelper")

// To parse URL encoded data
app.use(express.urlencoded({ extended: true }))

// To parse json data
app.use(express.json())

// Test route
app.get('/', (_, res) => {
    res.send('Hello World!')
})

// Submission route
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

// Invalid URL
app.get('*', (_, res) => {
    res.send("404: URL not found")
});

app.listen(8080, () => {
    console.log("Server listening on port 8080")
})