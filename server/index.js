const express = require("express");
const server = express();
const pool = require("./database");

// set to process JSON file
server.use(express.json());

server.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    next();
});

// create a GET request to get all the data
server.get("/search", async (request, response) => {
    try {
        const allData = await pool.query("SELECT * FROM schools");
        response.json(allData.rows);
    } catch (error) {
        console.error(error.message);
    }

})

// create a GET request to get data based on school, test, from year, and to year inputs
server.get("/search/:school/:test/:fromYear/:toYear", async (request, response) => {
    try {
        const { school, test, fromYear, toYear } = request.params;
        console.log(request.params);
        const schoolData = await pool.query("SELECT * FROM schools WHERE school_name = $1 AND regents_exam = $2 AND (year BETWEEN $3 AND $4)", 
        [ school, test, fromYear, toYear ]);
        response.json(schoolData.rows);
    } catch (error) {
        console.error(error.message);
    }

})


server.listen(5000, () => {
    console.log("Server is running on port 5000");
})