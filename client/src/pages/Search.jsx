import { React, useState, useEffect } from "react";
import { heading, inputRow, input, button } from "./Search-Styling.js";
import { examList, yearList } from "../util.js";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import QueryStatsIcon from '@mui/icons-material/QueryStats';

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
    const [examInput, setExamInput] = useState([]);
    const [yearInput, setYearInput] = useState([]);

    // represent the fetched data
    const [results, setResults] = useState([]);

    const fetchData = async() => {
        try {
            var schools = "";
            schoolInput.forEach((element) => {
                schools = schools.concat("'", element.slice(8, element.length), "'", ", ");
            })
    
            schools = schools.slice(0, schools.length - 2);
    
            var exams = "";
            examInput.forEach((element) => {
                exams = exams.concat("'", element, "'", ", ");
            })
    
            exams = exams.slice(0, exams.length - 2);
    
            const fromYear = yearInput.sort()[0]
            const toYear = yearInput.sort()[yearInput.length - 1];

            const url = `http://localhost:5000/search/(${schools})/(${exams})/${fromYear}/${toYear}`;
            console.log(url);
            const response = await fetch(url);
            const data = await response.json();

            console.log(data);

        } catch (error) {
            console.error(error.message);
        }
    };


    return (
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
                        multiple
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
                        multiple
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


        </Stack>
    )
    

}

export default Search;