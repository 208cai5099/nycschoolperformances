const express = require("express");
const server = express();
const pool = require("./database");

// set to process JSON file
server.use(express.json());

server.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    next();
});

// create a GET request to get alL distinct schools
server.get("/search/", async (request, response) => {
    try {
        const allData = await pool.query("SELECT * FROM (SELECT DISTINCT CONCAT(school_dbn, ': ', school_name) AS school_name FROM schools) AS tb1 ORDER BY school_name");
        response.json(allData.rows);
    } catch (error) {
        console.error(error.message);
    }

})

// create a GET request to get data based on school, exam, and year inputs
server.get("/search/:school/:exam/:year", async (request, response) => {
    try {
        const { school, exam, year} = request.params;
        console.log(request.params);

        const query = `SELECT * FROM schools WHERE school_name IN ${school} AND regents_exam IN ${exam} and year IN ${year}`;
        console.log(query);

        const results = await pool.query(query)
        response.json(results.rows);

    } catch (error) {
        console.error(error.message);
    }

})


server.listen(5000, () => {
    console.log("Server is running on port 5000");
})