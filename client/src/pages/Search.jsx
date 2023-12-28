import { React, useState, useEffect } from "react";
import { heading, inputRow, input, button } from "./Search-Styling.js";
import { examList, yearList } from "../util.js";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

function Search() {

    // represents the list of unique schools
    const [schoolList, setSchoolList] = useState([])

    // represents the user inputs
    const [schoolName, setSchoolName] = useState("");
    const [testName, setTestName] = useState("");
    const [toYear, setToYear] = useState("");
    const [fromYear, setFromYear] = useState("");

    const fetchData = async() => {
        try {
            const url = `http://localhost:5000/search/${schoolName}/${testName}/${fromYear}/${toYear}`;
            const response = await fetch(url);
            const data = await response.json();

        } catch (error) {
            console.error(error.message);
        }
    };


    const getSchoolList = async() => {
        try {
            const url = 'http://localhost:5000/search/'
            const response = await fetch(url);
            const data = await response.json();

            setSchoolList(data);

        } catch (error) {
            console.error(error.message);
        }
    };

    // request to get list of unique school names
    useEffect(() => {
        getSchoolList();
    }, []);

    return (
        <Stack spacing={3}>
            <h1 style={heading}>Look up schools!</h1>

            { schoolList.length === 0 ? null :
                <div style={inputRow}>
                    <Autocomplete 
                        multiple
                        id="tags-standard"
                        options={schoolList}
                        getOptionLabel={(option) => option.school_name}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="School Name"
                            >
                            </TextField>
                        )}
                        style={input}
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
                        style={input}
                    >
                    </Autocomplete>
                </div>
            }

            <Button 
                variant="contained" 
                style={button}
            >
                Search
            </Button>


        </Stack>
    )
    

}

export default Search;