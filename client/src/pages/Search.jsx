import { React, useState, useEffect } from "react";
import { heading, inputRow, input, button, graph } from "./Search-Styling.js";
import { examList, yearList } from "../util.js";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import Chart from "chart.js/auto"

function Search() {

    // represents the list of unique schools
    const [schoolList, setSchoolList] = useState([])

    const getSchoolList = async() => {
        try {
            const url = 'http://localhost:5000/search/'
            const response = await fetch(url);
            const data = await response.json();

            var allSchoolNames = []

            data.forEach((element) => {
                allSchoolNames.push(element.school_name);
            })

            setSchoolList(allSchoolNames);

        } catch (error) {
            console.error(error.message);
        }
    };

    // request to get list of unique school names
    useEffect(() => {
        getSchoolList();
    }, []);

    // represents the user inputs
    const [schoolInput, setSchoolInput] = useState([]);
    const [examInput, setExamInput] = useState("");

    function formatInput(input) {
        var formattedInput = ""

        input.forEach((element) => {
            formattedInput = formattedInput.concat("'", element.slice(8, element.length), "'", ", ");
        })

        return formattedInput.slice(0, formattedInput.length - 2);

    }

    // represent the processed data for graphing
    const [dataPoints, setDataPoints] = useState({})

    const fetchData = async() => {
        try {
            var schools = formatInput(schoolInput, "school");
    
            const url = `http://localhost:5000/search/(${schools})/'${examInput}'`;
            console.log(url);
            const response = await fetch(url);
            const rawData = await response.json();

            console.log(rawData);
            
            return rawData;

        } catch (error) {
            console.error(error.message);
        }
    };

    function processData(data) {

        // iterate through each test result to organize the data in a map
        // group the data by its school name, which is the key
        // each key is mapped to another map that maps a year to the year's mean score
        const gradesBySchool = new Map();
        data.forEach((item) => {

            const identifier = item.school_name;
            if (gradesBySchool.get(identifier) === undefined) {
                gradesBySchool.set(identifier, new Map().set(String(item.year), parseFloat(parseFloat(item.mean_score).toFixed(2))))
            } else {
                const currentMap = gradesBySchool.get(identifier);
                gradesBySchool.set(identifier, currentMap.set(String(item.year), parseFloat(parseFloat(item.mean_score).toFixed(2))));
            }
            
        })

        // console.log(gradesBySchoolAndExam);

        // make the data for graphing
        const datasets = []

        gradesBySchool.forEach((value, key) => {

            const set = {
                label: key,
                data: []
            }

            yearList.forEach((year) => {
                if (value.get(year) === undefined) {
                    set.data.push(NaN);
                } else {
                    set.data.push(value.get(year));
                }
            })

            datasets.push(set);

        })

        const processedData = {
            labels: yearList,
            datasets: datasets
        }

        return processedData;



    }

    const [lineGraph, setLineGraph] = useState(null);

    const graphData = async() => {

        console.log(dataPoints);
        const rawData = await fetchData();
        const processedData = processData(rawData);

        console.log(processedData);

        if (lineGraph === null) {
            const graphInstance = new Chart(
                document.getElementById("graph"),
                {
                    type: "line",
                    data: processedData,
                    options: {maintainAspectRatio: false}
                }
            )
    
            setLineGraph(graphInstance);
        } else {

            lineGraph.data = processedData;
            lineGraph.update();

        }

            
    }

    return (
        <div>
            <Stack spacing={3}>
                <h1 style={heading}>Look up schools!</h1>

                { schoolList.length === 0 ? null :
                    <div style={inputRow}>
                        <Autocomplete 
                            multiple={true}
                            id="tags-standard"
                            options={schoolList}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="School Name"
                                >
                                </TextField>
                            )}
                            style={input}
                            onChange={(event, value) => {
                                setSchoolInput(value);
                            }}
                        >
                        </Autocomplete>

                        <Autocomplete
                            id="tags-standard"
                            options={examList}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Exam Name"
                                >
                                </TextField>
                            )}
                            onChange={(event, value) => {
                                setExamInput(value);
                            }}
                            style={input}
                        >
                        </Autocomplete>

                    </div>
                }

                <Button 
                    variant="contained" 
                    style={button}
                    endIcon={<QueryStatsIcon />}
                    onClick={graphData}

                >
                    Search
                </Button>

                <div style={graph}>
                    <canvas id="graph" />
                </div>


            </Stack>


        </div>

        
    )
    

}

export default Search;