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
    const [examInput, setExamInput] = useState("Common Core English");
    const [metricInput, setMetricInput] = useState("mean_score");
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

        setExamInput(exam);
        setMetricInput(metric);

        // set up the columns for the SELECT query
        var columns = metric;
        if (table !== "regents") {
            columns = "year, category, ".concat(metric)
        } else{
            columns = "year, ".concat(metric)
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
        // if ELL or SWD table, map every year to a second map
        // the second map maps a SWD or ELL status to an array of mean scores or passing rates
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

            // use a helper map to keep track of the year and status combinations already set up
            // in the maps
            var yearCategoryMap = new Map();

            data.forEach((record) => {

                if (metric === "mean_score") {
                    var value = record.mean_score;
                } else {
                    var value = record.percent_65_or_above;
                }

                // if we have not encountered this current year, map the year 
                // to a nested map
                if (typeof yearCategoryMap.get(record.year) === "undefined") {

                    var nestedMap = new Map([[record.category, [value]]]);
                    valuesMap.set(record.year, nestedMap);

                    yearCategoryMap.set(record.year, [record.category])

                } else {

                    const encounteredCategories = yearCategoryMap.get(record.year)

                    // if we have encountered this current year but not the ELL or SWD status,
                    // add an entry for it in the nested map
                    if (encounteredCategories.includes(record.category) === false) {
                        encounteredCategories.push(record.category)

                        var nestedMap = valuesMap.get(record.year)
                        nestedMap.set(record.category, [value])
                        valuesMap.set(record.year, nestedMap)

                    } else {

                        // if we have encountered this current year and ELL or SWD status,
                        // include the current mean score or passing rate
                        var nestedMap = valuesMap.get(record.year)
                        var valuesArray = nestedMap.get(record.category)
                        valuesArray.push(value)
                        nestedMap.set(record.category, valuesArray)
                        valuesMap.set(record.year, nestedMap)
                    }
                }

            })

        }

        return valuesMap;
    }

    function traceHelper(years) {

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

    // calls on processData() and creates an array of Plotly traces
    const createTraces = async(table, exam, metric) => {

        if (exam !== null && metric !== null) {

            const processedData = await processData(table, exam, metric);
            console.log(processedData)

            var years = [];
            var tracesArray = [];

            var categories = null;
            
            if (table === "regents_by_ell") {
                categories = ["ELL", "English Proficient", "Former ELL"];

            } else if (table === "regents_by_swd") {
                categories = ["SWD", "Non-SWD"];
            }

            processedData.forEach((value, key, map) => {
                years.push(key)
            })

            // find the yearly median mean score or passing rate
            if (table === "regents") {

                const gapYearBounds = traceHelper(years);

                var trace1_years = [];
                var trace2_years = [];
                var trace3_years = [];
                var trace1_values = [];
                var trace2_values = [];
                var trace3_values = [];

                for (let yr=min(years); yr <=max(years); yr++) {

                    if (yr < gapYearBounds.start) {
                        trace1_years.push(yr);
                        trace1_values.push(round(median(processedData.get(yr)), 2))

                    } else if (yr > gapYearBounds.end) {
                        trace3_years.push(yr);
                        trace3_values.push(round(median(processedData.get(yr)), 2))
                    }

                    if ((yr >= gapYearBounds.start - 1) && (yr <= gapYearBounds.end + 1)) {
                        trace2_years.push(yr);

                        if ((yr === gapYearBounds.start - 1) || (yr === gapYearBounds.end + 1)) {
                            trace2_values.push(round(median(processedData.get(yr)), 2))
                        } else {
                            trace2_values.push(null)
                        }
                    }

                }

                const trace1 = {
                    type: 'lines+markers',
                    x: trace1_years,
                    y: trace1_values,
                    marker: {color: "#6CADDC", size: 10},
                    // hoverinfo: "none"
                };

                const trace2 = {
                    type: 'lines',
                    x: trace2_years,
                    y: trace2_values,
                    marker: {color: "#6CADDC", size: 10},
                    line: {
                        dash: "dot"
                    },
                    connectgaps: true
                    // hoverinfo: "none"
                };

                const trace3 = {
                    type: 'lines+markers',
                    x: trace3_years,
                    y: trace3_values,
                    marker: {color: "#6CADDC", size: 10},
                    // hoverinfo: "none"
                };

                tracesArray.push(trace1)
                tracesArray.push(trace2)
                tracesArray.push(trace3)

                setTracesAll(tracesArray);

            } else {

                years.forEach((yr) => {

                    var nestedMap = processedData.get(yr);
                    const trace = []
        
                    var index = 0;
                    categories.forEach((cat) => {
                        trace.push({
                            name: cat,
                            type: 'histogram',
                            x: nestedMap.get(cat),
                            xbins: {start: 0 , end: 100, size: 2},
                            opacity: 0.5,
                            marker: {color: colorList.at(index)},
                            hoverinfo: "none"
                        })
                        index++;
                    })
        
                    tracesArray.push(trace);
                })

                if (table === "regents_by_ell") {
                    setTracesELL(tracesArray);

                } else {
                    setTracesSWD(tracesArray);
                }
            }
        }

    }

    // request to get list of unique school names
    useEffect(() => {
        setInputArrays();
        createTraces("regents", "Common Core English", "mean_score");
        createTraces("regents_by_ell", "Common Core English", "mean_score");
        createTraces("regents_by_swd", "Common Core English", "mean_score");
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
                                    createTraces("regents", value, metricInput)
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
                                    createTraces("regents", examInput, value)
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
                    <Plot data={tracesAll} layout={{width: 800, height: 400, showlegend: false, yaxis: {range: [0, 100]}}} config={{responsive: true}} className="plot"></Plot>
                </HStack>



                {/* <HStack>
                    <VStack>
                        {tracesReady === false ? null : <Plot data={tracesELL.at(0)} layout={{showlegend: true, xaxis: {range: [0, 100]}, yaxis: {range: [0, 100]}}} config={{responsive: true}}></Plot>}
                        {tracesReady === false ? null : <Plot data={tracesELL.at(1)} layout={{showlegend: true, xaxis: {range: [0, 100]}, yaxis: {range: [0, 100]}}} config={{responsive: true}}></Plot>}
                        {tracesReady === false ? null : <Plot data={tracesELL.at(2)} layout={{showlegend: true, xaxis: {range: [0, 100]}, yaxis: {range: [0, 100]}}} config={{responsive: true}}></Plot>}
                    </VStack>
                    <VStack>
                        {tracesReady === false ? null : <Plot data={tracesELL.at(3)} layout={{showlegend: true, xaxis: {range: [0, 100]}, yaxis: {range: [0, 100]}}} config={{responsive: true}}></Plot>}
                        {tracesReady === false ? null : <Plot data={tracesELL.at(4)} layout={{showlegend: true, xaxis: {range: [0, 100]}, yaxis: {range: [0, 100]}}} config={{responsive: true}}></Plot>}
                    </VStack>
                </HStack> */}

            </div>

        </div>
    )

}

export default EDA;