import { React, useState, useEffect } from "react";
import { heading, inputRow, input, button } from "./Search-Styling.js";
import { examList, yearList } from "../util.js";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import Chart from "../components/Chart.jsx"


function Search() {

    const test = [
        {name: "A", uv: 100},
        {name: "B", uv: -100},
        {name: "C", uv: 0},
        {name: "D", uv: 89},
        {name: "E"},
        {name: "A", uv: -20},
    ]

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
    const [examInput, setExamInput] = useState([]);
    const [yearInput, setYearInput] = useState([]);


    function processData(data) {

        console.log(data);

        var processedData = []

        yearInput.map((year) => {

            var labelList = []
            var meanScoreList = []
            
            data.map((item) => {

                if (item.year === parseInt(year)) {

                    labelList.push(item.school_dbn.concat(" - ", item.regents_exam));
                    meanScoreList.push(item.mean_score);

                }
            })

        })

        console.log(processedData);

    }

    function formatInput(input, type) {
        var formattedInput = ""

        if (type === "school") {
            input.forEach((element) => {
                formattedInput = formattedInput.concat("'", element.slice(8, element.length), "'", ", ");
            })
        } else {
            input.forEach((element) => {
                formattedInput = formattedInput.concat("'", element, "'", ", ");
            })
        }

        return formattedInput.slice(0, formattedInput.length - 2);

    }

    const fetchData = async() => {
        try {
            var schools = formatInput(schoolInput, "school");
            var exams = formatInput(examInput, "exam");
            var years = formatInput(yearInput, "year");
    
            const url = `http://localhost:5000/search/(${schools})/(${exams})/(${years})`;
            console.log(url);
            const response = await fetch(url);
            const data = await response.json();

            console.log(data);

            // processData(data);


        } catch (error) {
            console.error(error.message);
        }
    };

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
                            multiple={true}
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

                        <Autocomplete 
                            multiple={true}
                            id="tags-standard"
                            options={yearList}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Year"
                                >
                                </TextField>
                            )}
                            onChange={(event, value) => {
                                setYearInput(value);
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
                    onClick={fetchData}

                >
                    Search
                </Button>

                <Chart data={test} />

            </Stack>


        </div>

        
    )
    

}

export default Search;