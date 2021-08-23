const express = require("express")
const app = express()
const axios = require("axios").default;
const { exec } = require("child_process");
const fs = require("fs")
const util = require("util")
const readFile = util.promisify(fs.readFile)
const openFile = util.promisify(fs.open)
const closeFile = util.promisify(fs.close)
const writeFile = util.promisify(fs.writeFile)
const deleteFile = util.promisify(fs.unlink);
const execCmd = util.promisify(exec);
const { writeToCsv } = require("./utils/csvHelper")

const apiUrl =
  "https://nu5rdmmh11.execute-api.us-east-1.amazonaws.com/nm/upload-mngd/";
const challenge =
  "ee07111f94cdb8b0955590b63a71c33e197c2ace6d2b7903b12a7ca35bba1a80" //managed1

/* To parse URL encoded data */
app.use(express.urlencoded({ extended: true }))
/* To parse json data */
app.use(express.json())
app.set("json spaces", 40)

/* Test route */
app.get("/", (_, res) => {
  res.send("Hello World!")
})

/* Get examples */
app.get("/examples", async (_, res, next) => {
  try {
    const examples = await JSON.parse(readFile("examples.json"))
    res.status(200).json({
      statusCode: 200,
      examples,
    })
  } catch (error) {
    console.error(error)
    next(error)
  }
})

/* Submission route */
app.post("/submit", async (req, res, next) => {
  const submissionTime = new Date()
  // console.log(req.body)
  const { device, type, desc, comment, image, originalImage, long, lat } = req.body
  const csvData = [
    {
      device,
      type,
      desc,
      comment,
      image,
      originalImage,
      long,
      lat,
      submittedAt: submissionTime.toUTCString(),
    },
  ]
  try {
    // Write data to CSV (front-facing DB)
    await writeToCsv(csvData)
    const filePath = `./${device}.json`
    const input = {
      exp: "nm-exp-androidapp",
      file: filePath,
      topic: "netinfra",
      challenge
    }
    // Write data to JSON file
    const file = await openFile(filePath, "w")
    await writeFile(file, JSON.stringify(csvData[0]))
    await closeFile(file)
    console.log("Written to file!")
    // POST request to get Pre-signed S3 URL
    const { status, data } = await axios.post(apiUrl + device, input)
    if (status === 200) {
      const { message, url } = data;
      console.log("message: ", message);
      console.log("Pre-signed URL: ", url);
      // PUT request to upload file to Pre-signed S3 URL
      const { stdout, stderr } = await execCmd(
        `curl -X PUT -T ${input.file} \'${url}\' -v`
      );
      console.log("stdout: ", stdout);
      console.log("stderr: ", stderr);
      // Delete file on completion
      await deleteFile(input.file)
      
      const response = {
        statusCode: status,
        message: `Submitted at ${submissionTime.toUTCString()}`,
      };
      res.status(200).json(response);
    } else {
      throw Error("Unable to fetch Pre-signed S3 URL!")
    }
  } catch (error) {
    console.error(error)
    next(error)
  }
})

/* Invalid URL */
app.get("*", (_, res) => {
  res.status(404).send("404: URL not found")
})

app.listen(8080, () => {
  console.log("Server listening on port 8080")
})
