// Overview of Citywide Performance
// Interactive display of school performances

import React, { useState, useEffect } from "react";
import supabase from '../config/supabase.js'
import { exams, colorList } from "../util.js";
import Plot from 'react-plotly.js';
import { Col, Row, HStack, InputPicker } from 'rsuite';
import { min, max, round } from 'mathjs';
import "./Citywide.css"

function Citywide() {

    // create lists to store the traces for the Plotly graphs
    const [examInputAll, setExamInputAll] = useState("Common Core English");
    const [examInputELL, setExamInputELL] = useState("Common Core English");
    const [examInputSWD, setExamInputSWD] = useState("Common Core English");

    const [metricInputAll, setMetricInputAll] = useState("median_mean_score");
    const [metricInputELL, setMetricInputELL] = useState("median_mean_score");
    const [metricInputSWD, setMetricInputSWD] = useState("median_mean_score");

    const [examArray, setExamArray] = useState([])
    const [metricArray, setMetricArray] = useState([])
    const [tracesAll, setTracesAll] = useState([]);
    const [tracesELL, setTracesELL] = useState([]);
    const [tracesSWD, setTracesSWD] = useState([]);

    const plotLayout = {width: 800, height: 400, showlegend: false, xaxis: {title: {text: "Year", font: {family: "Raleway", color: "black"}}}, yaxis: {title: {text: "Median Value"}, autorange: true}}

    const setInputArrays = () => {

        var placeholder = [];

        exams.forEach((test) => {
            placeholder.push({label: test, value: test})
        })

        setExamArray(placeholder);

        setMetricArray([
            {label: "Mean Score", value: "median_mean_score"},
            {label: "Passing Rate", value: "median_percent_65_or_above"}
        ]);

    }

    // send API request to grab data for a specific exam from general, SWD, or ELL table
    const requestData = async(table, exam, metric) => {

        // set up the columns for the SELECT query
        var columns = "year, category, regents_exam, ".concat(metric);

        const {data, error} = await supabase
        .from(table)
        .select(columns)
        .eq("regents_exam", exam)

        if (error !== null) {
            
            console.log(error);

        } else {

            // console.log(data)
            return data;

        }
    };

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

        return [startGapYear, endGapYear]
    }

    // receives two arrays that show years (X) and values (Y)
    // creates and returns a trace made from the arrays
    function createTrace(X, Y, gap=false, color, name="") {

        var trace = null;

        if (gap === false) {

            trace = {
                name: name,
                type: 'lines+markers',
                x: X,
                y: Y,
                marker: {color: color, size: 10},
                hovertemplate: 'Median: %{y}%'
            }

        } else {

            trace = {
                name: name,
                type: 'lines',
                x: X,
                y: Y,
                marker: {color: color, size: 10},
                line: {
                    dash: "dot"
                },
                connectgaps: true,
                hovertemplate: 'Median: %{y}%'
            };
        }

        return trace;

    }

    // calls on requestData() and processes the data into maps
    const processData = async(table, exam, metric) => {

        const data = await requestData(table, exam, metric);

        // get a list of years with data
        // get a list of categories
        var availableYears = [];
        var availableCategories = [];
        data.forEach((record) => {
            if (availableYears.includes(record.year) === false) {
                availableYears.push(record.year)
            }

            if (availableCategories.includes(record.category) === false) {
                availableCategories.push(record.category)
            }
        })

        // get first year in the gap and last year in the gap
        const [startGapYear, endGapYear] = findGapYears(availableYears);

        // iterate through each category and 3 separate traces for each category
        // trace 1: covers the line plot before the gap
        // trace 2: covers the line plot in the gap
        // trace 3: covers the line plot after the gap
        var index = 0;
        var traceArray = [];
        availableCategories.forEach((cat) => {

            var trace1_years = [];
            var trace1_values = [];
            var trace2_years = [];
            var trace2_values = [];
            var trace3_years = [];
            var trace3_values = [];

            data.forEach((record) => {

                const category = record.category
                const year = record.year;
                var value = null;

                if (metric === "median_mean_score") {
                    value = round(record.median_mean_score, 2);
                } else {
                    value = round(record.median_percent_65_or_above, 2);
                }

                if ((category === cat) && (year < startGapYear)) {
                    trace1_years.push(year)
                    trace1_values.push(value)
                }

                if ((category === cat) && (year >= startGapYear - 1) && (year <= endGapYear + 1)) {
                    trace2_years.push(year)
                    trace2_values.push(value)
                }

                if ((category === cat) && (year > endGapYear)) {
                    trace3_years.push(year)
                    trace3_values.push(value)
                }
            })

            const trace1 = createTrace(trace1_years, trace1_values, false, colorList.at(index), cat);
            const trace2 = createTrace(trace2_years, trace2_values, true, colorList.at(index), cat);
            const trace3 = createTrace(trace3_years, trace3_values, false, colorList.at(index), cat);

            traceArray.push(trace1)
            traceArray.push(trace2)
            traceArray.push(trace3)

            index++;

        })

        // console.log(traceArray)
        return traceArray;

    }

    // calls on processData() and sets the traces for the Plotly plots
    const plotData = async(table, exam, metric) => {

        if (table === "regents_median_by_borough") {
            
            setExamInputAll(exam);
            setMetricInputAll(metric);

        } else if (table === "regents_median_by_borough") {

            setExamInputELL(exam);
            setMetricInputELL(metric);

        } else if (table === "regents_median_by_borough") {

            setExamInputSWD(exam);
            setMetricInputSWD(metric);
        }

        if (exam !== null && metric !== null) {

            const traceArray = await processData(table, exam, metric);

            if (table === "regents_median_by_borough") {
                setTracesAll(traceArray)

            } else if (table === "regents_median_by_ell") {
                setTracesELL(traceArray)

            } else {
                setTracesSWD(traceArray)

            }

        }
    }

    // request to get list of unique school names
    useEffect(() => {
        setInputArrays();
        plotData("regents_median_by_borough", "Common Core English", "median_mean_score");
        plotData("regents_median_by_ell", "Common Core English", "median_mean_score");
        plotData("regents_median_by_swd", "Common Core English", "median_mean_score");
    }, []);

    return (
        <div>

            <h1 className="citywide-heading">Brief Exploratory Analysis of NYC Regents Performance</h1>

            <div className="citywide-description">
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
                                    plotData("regents_median_by_borough", value, metricInputAll)
                                }}
                                defaultValue="Common Core English"
                        />
                    </Col>

                    <Col>
                        <label><strong>Metric</strong></label>
                        <InputPicker
                                menuClassName="menu"
                                data={metricArray}
                                onChange={(value) => {
                                    plotData("regents_median_by_borough", examInputAll, value)
                                }}
                                defaultValue="median_mean_score"
                        />
                    </Col>
                </Row>

                <p className="note">
                        Hover over a data point for specific value and number of test takers. A dashed line indicates absence of data. 
                        <br></br>
                        Note that any data from 2020 and 2021 were removed (see Methods).
                </p>

                <HStack className="plot">
                    <Plot data={tracesAll} layout={plotLayout} config={{responsive: true}}></Plot>
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
                                    plotData("regents_median_by_ell", value, metricInputELL)
                                }}
                                defaultValue="Common Core English"
                        />
                    </Col>

                    <Col>
                        <label><strong>Metric</strong></label>
                        <InputPicker
                                menuClassName="menu"
                                data={metricArray}
                                onChange={(value) => {
                                    plotData("regents_median_by_ell", examInputELL, value)
                                }}
                                defaultValue="median_mean_score"
                        />
                    </Col>
                </Row>

                <p className="note">
                        Hover over a data point for specific value and number of test takers. A dashed line indicates absence of data. 
                        <br></br>
                        Note that any data from 2020 and 2021 were removed (see Methods).
                </p>

                <HStack className="plot">
                    <Plot data={tracesELL} layout={plotLayout} config={{responsive: true}}></Plot>
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
                                    plotData("regents_median_by_swd", value, metricInputSWD)
                                }}
                                defaultValue="Common Core English"
                        />
                    </Col>

                    <Col>
                        <label><strong>Metric</strong></label>
                        <InputPicker
                                menuClassName="menu"
                                data={metricArray}
                                onChange={(value) => {
                                    plotData("regents_median_by_swd", examInputSWD, value)
                                }}
                                defaultValue="median_mean_score"
                        />
                    </Col>
                </Row>

                <p className="note">
                        Hover over a data point for specific value and number of test takers. A dashed line indicates absence of data. 
                        <br></br>
                        Note that any data from 2020 and 2021 were removed (see Methods).
                </p>

                <HStack className="plot">
                    <Plot data={tracesSWD} layout={plotLayout} config={{responsive: true}}></Plot>
                </HStack>

            </div>

        </div>
    )

}

export default Citywide;