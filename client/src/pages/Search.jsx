import { React, useState, useEffect } from "react";
import { inputRow, input, button, notFoundMessage, notFoundImage, dataIsAvailable, dataIsNotAvailable, limitMessage } from "./Search-Styling.js";
import { examList, yearList, optionList, colorList } from "../util.js";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import Chart from "chart.js/auto"

function Search() {

    // represents the list of unique schools
    const [schoolList, setSchoolList] = useState([])

    // represents the style of the graph
    const [graphStyle, setGraphStyle] = useState(dataIsNotAvailable);

    const getSchoolList = async() => {
        try {
            const url = 'http://localhost:5100/search/'
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
    const [schoolInputLabel, setSchoolInputLabel] = useState("School Name (Limit: 10)");
    const [examInput, setExamInput] = useState("");
    const [optionInput, setOptionInput] = useState("");

    // represent the mapping of each color to a school
    const [colorMap, setColorMap] = useState(new Map());

    // represents whether any data was found
    const [isDataAvailable, setIsDataAvailable] = useState(true);

    // represents whether max 10 schools were inputted
    const [schoolCount, setSchoolCount] = useState(0);

    function formatInput(input) {
        var formattedInput = ""

        input.forEach((element) => {
            formattedInput = formattedInput.concat("'", element.slice(8, element.length), "'", ", ");
        })

        return formattedInput.slice(0, formattedInput.length - 2);

    }

    const fetchData = async() => {
        try {
            var schools = formatInput(schoolInput, "school");
    
            const url = `http://localhost:5100/search/(${schools})/'${examInput}'`;
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
        // each key is mapped to another map that maps a year to the year's mean score or passing rate
        const gradesBySchool = new Map();
        data.forEach((item) => {

            const identifier = item.school_dbn.concat(": ", item.school_name);

            if (optionInput === "Average Score") {

                if (gradesBySchool.get(identifier) === undefined) {
                    gradesBySchool.set(identifier, new Map().set(String(item.year), parseFloat(parseFloat(item.mean_score).toFixed(2))))
                } else {
                    const currentMap = gradesBySchool.get(identifier);
                    gradesBySchool.set(identifier, currentMap.set(String(item.year), parseFloat(parseFloat(item.mean_score).toFixed(2))));
                }

            } else {


                if (gradesBySchool.get(identifier) === undefined) {
                    gradesBySchool.set(identifier, new Map().set(String(item.year), parseFloat(parseFloat(item.percent_65_or_above).toFixed(2))))
                } else {
                    const currentMap = gradesBySchool.get(identifier);
                    gradesBySchool.set(identifier, currentMap.set(String(item.year), parseFloat(parseFloat(item.percent_65_or_above).toFixed(2))));
                }

            }
            
        })

        console.log(gradesBySchool);

        // make the data for graphing
        const datasets = []
        gradesBySchool.forEach((value, key) => {

            const set = {
                label: key,
                data: [],
                spanGaps: true,
                segment: {
                            borderDash: (seg) => {
                                return (
                                    seg.p0.skip || seg.p1.skip ? [18,6] : undefined
                                )
                            }
                        },
                borderColor: null,
                backgroundColor: null
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

        // map each color to a school
        // update the map as needed as schools get added or removed
        if (colorMap.size === 0) {
            
            var index = 0;
            var newColorMap = new Map();

            datasets.forEach((element) => {
                element.borderColor = colorList.at(index);
                element.backgroundColor = colorList.at(index);
                element.segment.borderColor = (seg) => {
                                            return (
                                                seg.p0.skip || seg.p1.skip ? colorList.at(index) : undefined
                                            )
                                        };
                newColorMap.set(colorList.at(index), element.label);

                index++;
            })

            // assigns leftover colors to null schools
            while (index < 10) {
                newColorMap.set(colorList.at(index), null);
                index++;

            }

            setColorMap(newColorMap);

        } else {

            // get a list of currently graphed schools
            var currentSchoolList = [];
            for (const [color, school] of colorMap) {
                if (school !== null) {
                    currentSchoolList.push(school);
                }
            }

            // get a list of schools that now need to be graphed
            var newSchoolList = [];
            datasets.forEach((element) => {
                newSchoolList.push(element.label);
            })

            // track which currently graphed schools need to be removed
            // from colorMap to "free up" their colors
            var toBeRemovedList = []
            for (const school of currentSchoolList) {
                if (newSchoolList.includes(school) === false) {
                    toBeRemovedList.push(school);
                }
            }

            // "free up" the colors that are assigned to schools that need
            // to be removed
            for (const [color, school] of colorMap) {
                if (toBeRemovedList.includes(school) === true) {
                    colorMap.set(color, null);
                }
            }

            // get a list of schools that now need to be assigned colors
            var toBeAssigned = [];
            for (const school of newSchoolList) {
                if (currentSchoolList.includes(school) === false) {
                    toBeAssigned.push(school);
                }
            }

            // assign colors to the schools without assigned colors
            var newColorMap = colorMap;
            while (toBeAssigned.length > 0) {

                var label = toBeAssigned.pop();
                for (const [color, school] of newColorMap) {
                    if (school === null) {
                        newColorMap.set(color, label);
                        break;
                    }
                }
            }

            datasets.forEach((element) => {

                for (const [color, school] of newColorMap) {
                    if (element.label === school) {
                        element.borderColor = color;
                        element.backgroundColor = color;
                        element.segment.borderColor = (seg) => {
                            return (
                                seg.p0.skip || seg.p1.skip ? color : undefined
                            )
                        };
                        break;
                    }
                }
            })

            setColorMap(newColorMap);

        }

        const processedData = {
            labels: yearList,
            datasets: datasets
        }

        return processedData;

    }

    const [lineGraph, setLineGraph] = useState(null);

    const graphData = async() => {

        console.log(schoolInput);
        console.log(examInput);
        console.log(optionInput);

        const rawData = await fetchData();
        const processedData = processData(rawData);
        console.log(rawData);
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
            if (processedData.datasets.length === 0) {
                setIsDataAvailable(false);
                setGraphStyle(dataIsNotAvailable);
            } else {
                setIsDataAvailable(true);
                setGraphStyle(dataIsAvailable);

            }

        } else {

            if (processedData.datasets.length === 0) {
                lineGraph.destroy();
                setLineGraph(null);
                setIsDataAvailable(false);
                setGraphStyle(dataIsNotAvailable);

            } else {
                lineGraph.data = processedData;
                lineGraph.update();
                setIsDataAvailable(true);
                setGraphStyle(dataIsAvailable);
            }

        }
 
    }

    return (
        <div>
            <Stack spacing={3}>

                <div>
                    {isDataAvailable === true ? null : 
                        <div style={notFoundMessage} >
                            <h1>No Data is Found </h1>
                            <img src='https://cdn.pixabay.com/photo/2015/12/08/17/40/magnifying-glass-1083378_1280.png' alt='not found' style={notFoundImage} />
                        </div>
                    }

                    <div style={graphStyle}>
                        <canvas id="graph" />
                    </div>
                </div>

                { schoolCount <= 10 ? null :
                    <Alert style={limitMessage} severity="info">Please enter a maximum of 10 schools.</Alert>
                }

                { (schoolCount > 10 || schoolInput < 1 || examInput.length === 0 || optionInput.length === 0) ? null :
                    <Button 
                    variant="contained" 
                    style={button}
                    endIcon={<QueryStatsIcon />}
                    onClick={graphData}
                    >
                        Search
                    </Button>
                }



                { schoolList.length === 0 ? null :
                    <div style={inputRow}>
                        <Autocomplete 
                            multiple={true}
                            id="tags-standard"
                            options={schoolList}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={schoolInputLabel}
                                >
                                </TextField>
                            )}
                            style={input}
                            onChange={(event, value) => {
                                setSchoolInput(value);
                                setSchoolCount(value.length);
                                if (value.length > 0 && value.length <= 10) {
                                    setSchoolInputLabel(`School Name (Remaining: ${10 - value.length})`);
                                } else if (value.length === 0) {
                                    setSchoolInputLabel("School Name (Limit: 10)");   
                                } else if (value.length > 10) {
                                    setSchoolInputLabel("School Name (Exceeded Limit)");   
                                }
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

                        <Autocomplete
                            id="tags-standard"
                            options={optionList}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Option"
                                >
                                </TextField>
                            )}
                            onChange={(event, value) => {
                                setOptionInput(value);
                            }}
                            style={input}
                        >
                        </Autocomplete>
                    </div>
                }


            </Stack>

        </div>

        
    )
    

}

export default Search;