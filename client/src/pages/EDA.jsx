// Overview of Citywide Performance
// Interactive display of school performances

import React, { useState, useEffect } from "react";
import supabase from '../config/supabase.js'
import { exams, colorList } from "../util.js";
import Plot from 'react-plotly.js';
import { Col, Row, HStack, InputPicker } from 'rsuite';
import { median, round, min, max } from 'mathjs';
import "./EDA.css"

function EDA() {

    // create lists to store the traces for the Plotly graphs
    const [examInputAll, setExamInputAll] = useState("Common Core English");
    const [examInputELL, setExamInputELL] = useState("Common Core English");
    const [examInputSWD, setExamInputSWD] = useState("Common Core English");

    const [metricInputAll, setMetricInputAll] = useState("mean_score");
    const [metricInputELL, setMetricInputELL] = useState("mean_score");
    const [metricInputSWD, setMetricInputSWD] = useState("mean_score");


    const [examArray, setExamArray] = useState([])
    const [metricArray, setMetricArray] = useState([])
    const [tracesAll, setTracesAll] = useState([]);
    const [tracesELL, setTracesELL] = useState([]);
    const [tracesSWD, setTracesSWD] = useState([]);
    const [tracesReady, setTracesReady] = useState(false);

    const setInputArrays = () => {

        var placeholder = [];

        exams.forEach((test) => {
            placeholder.push({label: test, value: test})
        })

        setExamArray(placeholder);

        setMetricArray([
            {label: "Mean Score", value: "mean_score"},
            {label: "Passing Rate", value: "percent_65_or_above"}
        ]);

    }

    // send API request to grab data for a specific exam from general, SWD, or ELL table
    const requestData = async(table, exam, metric) => {

        console.log(exam)
        console.log(metric)

        // set up the columns for the SELECT query
        var columns = metric;
        if (table === "regents") {
            
            columns = "year, ".concat(metric)
            setExamInputAll(exam);
            setMetricInputAll(metric);

        } else if (table === "regents_by_ell") {

            columns = "year, category, ".concat(metric)
            setExamInputELL(exam);
            setMetricInputELL(metric);

        } else if (table === "regents_by_swd") {

            columns = "year, category, ".concat(metric)
            setExamInputSWD(exam);
            setMetricInputSWD(metric);
        }

        const {data, error} = await supabase
        .from(table)
        .select(columns)
        .eq("regents_exam", exam)

        if (error !== null) {
            
            console.log(error);

        } else {

            return data;

        }
    };

    // calls on requestData() and processes the data into maps
    const processData = async(table, exam, metric) => {

        const data = await requestData(table, exam, metric);

        // use maps to store the mean scores or passing rates
        // if general table, map a year to an array of values
        // if ELL or SWD table, map a SWD or ELL Status to a second map
        // the second map maps a year to an array of mean scores or passing rates
        var valuesMap = new Map();

        // parse data from the general table
        if (table === "regents") {

            // use a helper array to keep track of encountered years
            var yearsArray = [];

            data.forEach((record) => {

                if (yearsArray.includes(record.year)) {
                    
                    var values = valuesMap.get(record.year)

                    if (metric === "mean_score") {
                        values.push(record.mean_score)
                    } else {
                        values.push(record.percent_65_or_above)
                    }

                    valuesMap.set(record.year, values)

                } else{

                    yearsArray.push(record.year)

                    if (metric === "mean_score") {
                        valuesMap.set(record.year, [record.mean_score])
                    } else {
                        valuesMap.set(record.year, [record.percent_65_or_above])
                    }
                }

            })

        } else {

            // parse the data from the SWD or ELL table

            data.forEach((record) => {

                if (metric === "mean_score") {
                    var value = record.mean_score;
                } else {
                    var value = record.percent_65_or_above;
                }

                // if we have not encountered this current status, map the status 
                // to a nested map that maps the year to an array of values
                if (valuesMap.get(record.category) === undefined) {

                    var nestedMap = new Map([[record.year, [value]]]);
                    valuesMap.set(record.category, nestedMap);

                } else {

                    // if we have encountered this current status but not the year,
                    // add an entry for it in the nested map
                    var nestedMap = valuesMap.get(record.category)

                    if (nestedMap.get(record.year) === undefined) {
                        nestedMap.set(record.year, [value])
                        valuesMap.set(record.category, nestedMap)

                    } else {

                        // if we have encountered this current status and year,
                        // append the current mean score or passing rate
                        var valuesArray = nestedMap.get(record.year)
                        valuesArray.push(value)
                        nestedMap.set(record.year, valuesArray)
                        valuesMap.set(record.category, nestedMap)
                    }
                }

            })

        }

        return valuesMap;
    }

    // receives an array of years with data and finds the years with no data
    function findGapYears(years) {

        var startGapYear = null;
        var endGapYear = null;

        // find the consecutive years without any data
        for (let yr = min(years); yr <= max(years); yr++) {
            if ((years.includes(yr) === false) && (startGapYear === null)) {
                startGapYear = yr;
            } else if ((years.includes(yr) === false) && (startGapYear !== null)) {
                continue
            } else if ((years.includes(yr) === true) && (startGapYear !== null)) {
                endGapYear = yr - 1;
                break;
            }
        }

        return {start: startGapYear, end: endGapYear};
    }

    // finds the median of an array and rounds it to 2 decimal places
    function medianValue(valueArray) {
        return round(median(valueArray), 2)
    }

    // receives a map that pairs a year to an array of values
    // calculates the median value for each year
    // returns arrays of years (X) and median values (Y) for plotting
    function createYearValueArrays(yearlyValues, years, gapYearBounds) {

        var [trace1_years, trace2_years, trace3_years, trace1_values, trace2_values, trace3_values] = [[], [], [], [], [], []];

        for (let yr=min(years); yr <=max(years); yr++) {

            const valueArray = yearlyValues.get(yr);

            if (yr < gapYearBounds.start) {
                trace1_years.push(yr);
                trace1_values.push(medianValue(valueArray))

            } else if (yr > gapYearBounds.end) {
                trace3_years.push(yr);
                trace3_values.push(medianValue(valueArray))
            }

            if ((yr >= gapYearBounds.start - 1) && (yr <= gapYearBounds.end + 1)) {
                trace2_years.push(yr);

                if ((yr === gapYearBounds.start - 1) || (yr === gapYearBounds.end + 1)) {
                    trace2_values.push(medianValue(valueArray))
                } else {
                    trace2_values.push(null)
                }
            }
        }

        return [trace1_years, trace2_years, trace3_years, trace1_values, trace2_values, trace3_values];
    }

    // receives arrays of years (X) and values (Y)
    // creates traces using the years and values
    // returns the traces in an array
    function createTraces(yearValueArrays, color, name=null) {

        const [trace1_years, trace2_years, trace3_years, trace1_values, trace2_values, trace3_values] = yearValueArrays;

        var traceArray = [];

        // the first trace covers data before the gap
        const trace1 = {
            name: name,
            type: 'lines+markers',
            x: trace1_years,
            y: trace1_values,
            marker: {color: color, size: 10},
            // hoverinfo: "none"
        };

        // the second trace covers data in the gap
        const trace2 = {
            name: name,
            type: 'lines',
            x: trace2_years,
            y: trace2_values,
            marker: {color: color, size: 10},
            line: {
                dash: "dot"
            },
            connectgaps: true
            // hoverinfo: "none"
        };

        // the third trace covers data after the gap
        const trace3 = {
            name: name,
            type: 'lines+markers',
            x: trace3_years,
            y: trace3_values,
            marker: {color: color, size: 10},
            // hoverinfo: "none"
        };

        traceArray.push(trace1)
        traceArray.push(trace2)
        traceArray.push(trace3)

        return traceArray;

    }

    // return an array of years with data
    function getAvailableYears(processedData, table) {

        var yearIterator = null;

        if (table === "regents") {
            yearIterator = processedData.keys()
        } else {
            yearIterator = processedData.values().next().value.keys()
        }

        const years = yearIterator.toArray()

        return years

    }

    // calls on processData() and creates an array of Plotly traces
    const createTraceArray = async(table, exam, metric) => {

        if (exam !== null && metric !== null) {

            // get the map of data
            const processedData = await processData(table, exam, metric);
            console.log(processedData)

            // get the years with data
            const years = getAvailableYears(processedData, table);

            // every exam has a gap in the years (2020 and 2021)
            // US History and Government has an extra gap year in 2022
            // find the first and last years in the gap
            const gapYearBounds = findGapYears(years);

            // check whether the table is ELL or SWD
            var categories = [];
            if (table === "regents_by_ell") {
                categories = ["ELL", "English Proficient", "Former ELL"];

            } else if (table === "regents_by_swd") {
                categories = ["SWD", "Non-SWD"];
            }

            if (table === "regents") {

                const yearValueArrays = createYearValueArrays(processedData, years, gapYearBounds);
                const traceArray = createTraces(yearValueArrays, colorList.at(0));

                setTracesAll(traceArray);

            } else {

                var categories = [];
                if (table === "regents_by_ell") {
                    categories = ["ELL", "English Proficient", "Former ELL"]
    
                } else if (table === "regents_by_swd") {
                    categories = ["SWD", "Non-SWD"]
                }

                var traceArray = [];
                var index = 0;
                categories.forEach((cat) => {

                    const yearlyValues = processedData.get(cat);
                    const yearValueArrays = createYearValueArrays(yearlyValues, years, gapYearBounds);
                    const traces = createTraces(yearValueArrays, colorList.at(index), cat);
                    index++;

                    traces.forEach((trace) => {
                        traceArray.push(trace)
                    })
                })

                if (table === "regents_by_ell") {
                    setTracesELL(traceArray)
                } else {
                    setTracesSWD(traceArray)
                }
            }
        }
    }

    // request to get list of unique school names
    useEffect(() => {
        setInputArrays();
        createTraceArray("regents", "Common Core English", "mean_score");
        createTraceArray("regents_by_ell", "Common Core English", "mean_score");
        createTraceArray("regents_by_swd", "Common Core English", "mean_score");
        setTracesReady(true);
    }, []);

    return (
        <div>

            <h1 className="eda-heading">Brief Exploratory Analysis of NYC Regents Performance</h1>

            <div className="eda-description">
                <h2>
                    Introduction
                </h2>

                <p>
                    The New York State (NYS) Regents exams are assessments that test public school students' understanding of high school learning standards in English, math, science, social studies, and foreign languages. 
                    Students generally must pass a certain number of Regents exams to graduate with a traditional high school diploma. Some middle schools in the state offer accelerated programs that teach the standards and 
                    enable students to earn high school credit before matriculation into high school.
                    In this analysis, I will explore the performances of New York City (NYC) public schools on the Regents exams. The analysis starts with an overview of the performance of NYC schools, then it delves more 
                    into the differences in performance by English Language Learner (ELL) status and Students with Disability (SWD) status. The time period covered in this analysis is from 2017 to 2023 (excluding 2020 and 
                    2021 due to COVID's impact on the exam administration). The goal is to identify interesting insights into the academic performance of students in the NYC public school system.
                </p>

                <h2>
                    Data Wrangling and Processing
                </h2>

                <p>
                    The data used for this analysis is found in an Excel file on the <a href="https://infohub.nyced.org/reports/academics/test-results" target="_blank">NYC Public Schools InfoHub </a>. At the time of the analysis, 
                    the Excel file included data from 2015 to 2023. The file organizes the data into multiple sheets. Each row in a sheet provides useful information about a school's performance on a particular exam in a given year, 
                    including, but not limited to, <strong>Mean Score</strong> and <strong>Percent Scoring 65 or Above</strong>. The <strong>Mean Score</strong> is the average of the scores of the students who took the exam in a specific year (i.e. Fort Hamilton High 
                    School students received a a mean or average score of 72.45 on the US History and Government exams in 2023). Since a grade of 65 is the minimum needed to earn high school graduation credit, this analysis will 
                    refer to <strong>Percent Scoring 65 or Above</strong> as <strong>Passing Rate</strong>.
                    
                    For this analysis, we are focusing on only the following three sheets in the Excel file:
                </p>

                <ul>
                    <li>
                        <strong>All Students</strong>: contains information about every public school's overall performance on the exams in a given year
                    </li>
                    <li>
                        <strong>By ELL Status</strong>: provides more fine-grain information by separating the performance data by ELL students, former ELL students, and English Proficient students (assumed to be students who never took ELL)*
                    </li>
                    <li>
                        <strong>By SWD Status</strong>: provides more fine-grain information by separating the performance data by students with disabilities and students without disabilities*
                    </li>
                </ul>

                <p>
                    As stated in the <strong>Notes</strong> sheet of the Excel file, the performance of a school on an exam is redacted if no more than 5 students took the exam in a given year. The redacted records are removed.

                    This analysis will focus on the following years: 2017, 2018, 2019, 2022, and 2023.

                    Why?

                    From 2015 to 2016, NYC was in the process of implementing English and math Regents exams aligned to the Common Core standards. Many students took exams aligned to the pre-Common Core standards, while some 
                    students took the newer exams. The data from 2015 to 2016 are ignored to focus primarily on the Common Core exams*.
                    Due to COVID, the Regents exams schedule was impacted. The 2020 Regents exams were cancelled, and the 2021 Regents exams were mostly cancelled. The 2021 data was removed due to low number of test takers and 
                    cancellation of most of the exams.


                    <i>*For more details about ELL and SWD status, see the <strong>Notes</strong> sheet in the Excel file.</i>
                    <br></br>
                    <i>**Note that a handful of students still took the pre-Common Core exams after 2016, but the vast majority took the Common Core exams.</i>
                </p>

                <h2>
                    General Performance Across the City
                </h2>


                <Row className="input-row">
                    <Col>
                        <label><strong>Regents Exam</strong></label>
                        <InputPicker
                                menuClassName="menu"
                                data={examArray}
                                onChange={(value) => {
                                    createTraceArray("regents", value, metricInputAll)
                                }}
                                defaultValue="Common Core English"
                                placeholder="Common Core English"
                        />
                    </Col>

                    <Col>
                        <label><strong>Metric</strong></label>
                        <InputPicker
                                menuClassName="menu"
                                data={metricArray}
                                onChange={(value) => {
                                    createTraceArray("regents", examInputAll, value)
                                }}
                                defaultValue="mean_score"
                                placeholder="Mean Score"
                        />
                    </Col>
                </Row>

                <p className="note">
                        Hover over a data point for specific value and number of test takers. A dashed line indicates absence of data. 
                        <br></br>
                        Note that any data from 2020 and 2021 were removed (see Methods).
                </p>

                <HStack className="plot">
                    <Plot data={tracesAll} layout={{width: 800, height: 400, showlegend: false, yaxis: {range: [0, 100]}}} config={{responsive: true}}></Plot>
                </HStack>

                <h2>
                    Performance by ELL Status
                </h2>


                <Row className="input-row">
                    <Col>
                        <label><strong>Regents Exam</strong></label>
                        <InputPicker
                                menuClassName="menu"
                                data={examArray}
                                onChange={(value) => {
                                    createTraceArray("regents_by_ell", value, metricInputELL)
                                }}
                                defaultValue="Common Core English"
                                placeholder="Common Core English"
                        />
                    </Col>

                    <Col>
                        <label><strong>Metric</strong></label>
                        <InputPicker
                                menuClassName="menu"
                                data={metricArray}
                                onChange={(value) => {
                                    createTraceArray("regents_by_ell", examInputELL, value)
                                }}
                                defaultValue="mean_score"
                                placeholder="Mean Score"
                        />
                    </Col>
                </Row>

                <p className="note">
                        Hover over a data point for specific value and number of test takers. A dashed line indicates absence of data. 
                        <br></br>
                        Note that any data from 2020 and 2021 were removed (see Methods).
                </p>

                <HStack className="plot">
                    <Plot data={tracesELL} layout={{width: 800, height: 400, showlegend: false, yaxis: {range: [0, 100]}}} config={{responsive: true}}></Plot>
                </HStack>

                <h2>
                    Performance by SWD Status
                </h2>


                <Row className="input-row">
                    <Col>
                        <label><strong>Regents Exam</strong></label>
                        <InputPicker
                                menuClassName="menu"
                                data={examArray}
                                onChange={(value) => {
                                    createTraceArray("regents_by_swd", value, metricInputSWD)
                                }}
                                defaultValue="Common Core English"
                                placeholder="Common Core English"
                        />
                    </Col>

                    <Col>
                        <label><strong>Metric</strong></label>
                        <InputPicker
                                menuClassName="menu"
                                data={metricArray}
                                onChange={(value) => {
                                    createTraceArray("regents_by_swd", examInputSWD, value)
                                }}
                                defaultValue="mean_score"
                                placeholder="Mean Score"
                        />
                    </Col>
                </Row>

                <p className="note">
                        Hover over a data point for specific value and number of test takers. A dashed line indicates absence of data. 
                        <br></br>
                        Note that any data from 2020 and 2021 were removed (see Methods).
                </p>

                <HStack className="plot">
                    <Plot data={tracesSWD} layout={{width: 800, height: 400, showlegend: false, yaxis: {range: [0, 100]}}} config={{responsive: true}}></Plot>
                </HStack>

            </div>

        </div>
    )

}

export default EDA;