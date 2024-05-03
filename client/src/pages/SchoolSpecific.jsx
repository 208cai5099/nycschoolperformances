import { React, useState, useEffect } from "react";
import "./SchoolSpecific.css";
import { exams, yearList, options, colorList } from "../util.js";
import Chart from "chart.js/auto"
import { IconButton, InputPicker, TagPicker, Message, Row, Col } from "rsuite";
import LineChartIcon from '@rsuite/icons/LineChart';
import supabase from '../config/supabase.js'

function SchoolSpecific() {

    // represents the list of unique schools, exams, and options
    const [schoolList, setSchoolList] = useState([])
    const [examList, setExamList] = useState([]);
    const [optionList, setOptionList] = useState([]);

    const makeSchoolList = async() => {

        const {data, error} = await supabase
        .from("schools")
        .select("schools")

        if (error !== null) {
            console.log(error)
        } else {

            var schoolNames = [];

            data.forEach((element) => {
                schoolNames.push({
                    label: element.schools,
                    value: element.schools
                })
            })
    
            setSchoolList(schoolNames);

        }

    }

    const makeExamList = () => {
        var allExams = [];

        exams.forEach((element) => {
            allExams.push({
                label: element,
                value: element
            })
        })

        setExamList(allExams);
    }


    const makeOptionList = () => {
        var allOptions = [];

        options.forEach((element) => {
            allOptions.push({
                label: element,
                value: element
            })
        })

        setOptionList(allOptions);

    }


    // request to get list of unique school names
    useEffect(() => {
        makeSchoolList();
        makeExamList();
        makeOptionList();
    }, []);

    // represents the user inputs
    const [schoolInput, setSchoolInput] = useState([]);
    const [examInput, setExamInput] = useState("");
    const [optionInput, setOptionInput] = useState("");

    // represent the mapping of each color to a school
    const [colorMap, setColorMap] = useState(new Map());

    // represents whether any data was found
    const [isDataAvailable, setIsDataAvailable] = useState(true);

    // represents whether max 10 schools were inputted
    const [schoolCount, setSchoolCount] = useState(0);

    // represents whether a graph is currently displayed
    const [graphDisplay, setGraphDisplay] = useState(false);

    function getSchoolDBN() {

        var inputDBN = [];

        schoolInput.forEach((element) => {

            inputDBN.push(element.slice(0, 6))

        })

        return inputDBN;

    }

    const fetchData = async() => {

        const inputDBN = getSchoolDBN();

        var columns = null;
        if (optionInput === "Average Score") {
            columns = 'school_dbn, school_name, year, regents_exam, total_tested, mean_score'
        } else {
            columns = 'school_dbn, school_name, year, regents_exam, total_tested, percent_65_or_above'
        }
        
        const { data, error } = await supabase
        .from("regents")
        .select(columns)
        .in("school_dbn", inputDBN)
        .eq("regents_exam", examInput)

        if (error !== null) {
            console.log("error");
        } else {
            console.log(data);
            return data;
        }

    };

    function processData(data) {

        // iterate through each test result to organize the data in a map
        // group the data by its school name, which is the key
        // each key is mapped to another map that maps a year to the year's mean score or passing rate
        const gradesBySchool = new Map();

        // also record the number of students tested for each test
        const samplesBySchool = new Map();

        data.forEach((item) => {

            const identifier = item.school_dbn.concat(": ", item.school_name);

            if (samplesBySchool.get(identifier) === undefined) {
                samplesBySchool.set(identifier, new Map().set(item.year, item.total_tested));
            } else {
                const currentSamplesMap = samplesBySchool.get(identifier);
                samplesBySchool.set(identifier, currentSamplesMap.set(item.year, item.total_tested));
            }

            if (optionInput === "Average Score") {

                const avgScore = parseFloat(parseFloat(item.mean_score).toFixed(2));

                if (gradesBySchool.get(identifier) === undefined) {
                    gradesBySchool.set(identifier, new Map().set(item.year, avgScore));
                } else {
                    const currentGradesMap = gradesBySchool.get(identifier);
                    gradesBySchool.set(identifier, currentGradesMap.set(item.year, avgScore));
                }

            } else {

                const passingRate = parseFloat(parseFloat(item.percent_65_or_above).toFixed(2))

                if (gradesBySchool.get(identifier) === undefined) {
                    gradesBySchool.set(identifier, new Map().set(item.year, passingRate))
                } else {
                    const currentMap = gradesBySchool.get(identifier);
                    gradesBySchool.set(identifier, currentMap.set(item.year, passingRate));
                }

            }
            
        })

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
                backgroundColor: null,
                pointRadius: 4
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

                var newSchool = toBeAssigned.pop();
                for (const [color, school] of newColorMap) {
                    if (school === null) {
                        newColorMap.set(color, newSchool);
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

        return {
            processedData: processedData,
            samplesMap: samplesBySchool
        }

    }

    const [lineGraph, setLineGraph] = useState(null);

    const graphData = async() => {

        const rawData = await fetchData();
        const { processedData, samplesMap } = processData(rawData);

        if (lineGraph === null) {
            const graphInstance = new Chart(
                document.getElementById("graph"),
                {
                    type: "line",
                    data: processedData,
                    options: {
                        maintainAspectRatio: false,
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: (context) => {
                                        const year = parseInt(context.label);
                                        const school = context.dataset.label;

                                       if (samplesMap.get(school).get(year) === undefined) {
                                        return "No Data"
                                       } else {
                                        return context.formattedValue.concat("% (test takers: ", `${samplesMap.get(school).get(year)})`)
                                       }
                                    }
                                }
                            }
                        }
                    }
                }

            )
    
            setLineGraph(graphInstance);
            if (processedData.datasets.length === 0) {
                setIsDataAvailable(false);
                setGraphDisplay(false);
            } else {
                setIsDataAvailable(true);
                setGraphDisplay(true);
            }

        } else {

            if (processedData.datasets.length === 0) {
                lineGraph.destroy();
                setLineGraph(null);
                setIsDataAvailable(false);
                setGraphDisplay(false);

            } else {
                lineGraph.data = processedData;
                lineGraph.update();
                lineGraph.options.plugins.tooltip.callbacks = {
                    label: (context) => {
                        const year = parseInt(context.label);
                        const school = context.dataset.label;

                       if (samplesMap.get(school).get(year) === undefined) {
                        return "No Data"
                       } else {
                        return context.formattedValue.concat("% (test takers: ", `${samplesMap.get(school).get(year)})`)
                       }
                    }
                }
                setIsDataAvailable(true);
                setGraphDisplay(true);

            }

        }
 
    }    

    return (
        <div>

                <div>

                    {isDataAvailable === true ? null : 
                        <div className="notFoundMessage" >
                            <h1>No Data is Found </h1>
                            <img
                                className="notFoundImage" 
                                src='https://cdn.pixabay.com/photo/2015/12/08/17/40/magnifying-glass-1083378_1280.png'
                                alt='not found'
                            />
                        </div>
                    }

                    {graphDisplay === false ? null :
                        <div className="note">
                            <p> Click on data point for specific value and number of test takers. A dashed line indicates absence of data between two years </p>
                        </div>
                    }

                    <div className={isDataAvailable === true ? "dataIsAvailable" : "dataIsNotAvailable"}>
                        <canvas id="graph" />
                    </div>


                </div>

                { schoolList.length === 0 ? null :
                    <Row className="inputRow">
                        <Col>

                            { schoolCount <= 10 ? null :
                                <Message className="note" type="info" header="Exceeded limit">Please enter a maximum of 10 schools. </Message>
                            }

                            <TagPicker
                                className="inputBox"
                                menuClassName="menu"
                                data={schoolList}
                                onChange={(value) => {
                                    setSchoolInput(value);
                                    setSchoolCount(value.length);
                                }}
                            />

                            
                        </Col>

                        <Col>
                            <InputPicker
                                className="inputBox"
                                menuClassName="menu"
                                data={examList}
                                onChange={(value) => {
                                    setExamInput(value);
                                }}
                            />

                            { (schoolCount > 10 || schoolInput < 1 || examInput === null || optionInput === null || examInput.length === 0 || optionInput.length === 0) ? null :
                                <div className="buttonRow">
                                    <IconButton
                                        appearance="primary"
                                        icon={<LineChartIcon />}
                                        placement="right"
                                        onClick={graphData}
                                    >
                                        Search
                                    </IconButton>
                                </div>
                            }

                        </Col>

                        <Col>
                            <InputPicker
                                className="inputBox"
                                menuClassName="menu"
                                data={optionList}
                                onChange={(value) => {

                                    setOptionInput(value);
                                }}
                            />
                        </Col>

                    </Row>
                }

        </div>

        
    )
    

}

export default SchoolSpecific;