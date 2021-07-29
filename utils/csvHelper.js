const fs = require('fs')
const createCsvWriter = require('csv-writer').createObjectCsvWriter

const SUBMISSION_FILE = "./submissions.csv"

const submissionsWriter = createCsvWriter({
    path: SUBMISSION_FILE,
    header: [
        {id: 'type', name: "Type of network infrastucture"},
        {id: 'image', name: "Image"},
        {id: 'long', name: "Longitude"},
        {id: 'lat', name: "Latitude"},
        {id: 'desc', name: "Descriptive information"},
        {id: 'comment', name: "Comment"},
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