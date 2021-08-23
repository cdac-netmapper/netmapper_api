const fs = require('fs')
const createCsvWriter = require('csv-writer').createObjectCsvWriter

const SUBMISSION_FILE = "./submissions.csv"

const submissionsWriter = createCsvWriter({
    path: SUBMISSION_FILE,
    header: [
        {id: 'device', title: "Device ID"},
        {id: 'type', title: "Network element"},
        {id: 'image', title: "Image"},
        {id: 'originalImage', title: "Original Image"},
        {id: 'long', title: "Longitude"},
        {id: 'lat', title: "Latitude"},
        {id: 'desc', title: "Descriptive information"},
        {id: 'comment', title: "Comment"},
        {id: 'submittedAt', name: "Submitted at"}
    ],
    append: fs.existsSync(SUBMISSION_FILE)  // appends if file exists
})

const writeToCsv = (payload) => {
    return Promise.resolve(submissionsWriter.writeRecords(payload))
}

module.exports = {
    writeToCsv
}