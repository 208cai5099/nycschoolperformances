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

    const plotLayout = {width: 800, height: 400, showlegend: false, xaxis: {title: {text: "Year", font: {family: "Raleway", color: "black"}}}, 
    yaxis: {title: {text: "Median Metric Value", font: {family: "Raleway", color: "black"}}, autorange: true}}

    const setInputArrays = () => {

        var placeholder = [];

        exams.forEach((test) => {
            placeholder.push({label: test, value: test})
        })

        setExamArray(placeholder);

        setMetricArray([
            {label: "Median Mean Score", value: "median_mean_score"},
            {label: "Median Passing Rate", value: "median_percent_65_or_above"}
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

        // get a list of categories
        var availableCategories = [];
        data.forEach((record) => {

            if (availableCategories.includes(record.category) === false) {
                availableCategories.push(record.category)
            }

        })

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

            // store the records with the current category and their associated yers
            var availableYears = [];
            var relevantRecords = [];
            data.forEach((record) => {
                if (record.category === cat) {
                    relevantRecords.push(record)
                    availableYears.push(record.year)
                }
            })

            // get first year in the gap and last year in the gap
            const [startGapYear, endGapYear] = findGapYears(availableYears);

            relevantRecords.forEach((record) => {

                const year = record.year;
                var value = null;

                if (metric === "median_mean_score") {
                    value = round(record.median_mean_score, 2);
                } else {
                    value = round(record.median_percent_65_or_above, 2);
                }

                if (year < startGapYear) {
                    trace1_years.push(year)
                    trace1_values.push(value)
                }

                if ((year >= startGapYear - 1) && (year <= endGapYear + 1)) {
                    trace2_years.push(year)
                    trace2_values.push(value)
                }

                if (year > endGapYear) {
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

        return traceArray;

    }

    // calls on processData() and sets the traces for the Plotly plots
    const plotData = async(table, exam, metric) => {

        if (table === "regents_median_by_borough") {
            
            setExamInputAll(exam);
            setMetricInputAll(metric);

        } else if (table === "regents_median_by_ell") {

            setExamInputELL(exam);
            setMetricInputELL(metric);

        } else if (table === "regents_median_by_swd") {

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

            <h1 className="citywide-heading">Overview of Citywide Regents Performance</h1>

            <div className="citywide-description">

                <p>
                    On this page, you can explore general trends in the performance of NYC students on the Regents exams based on two metric 
                    measures: median Mean Score and median Passing Rate. Please note that the median values are not medians of actual student scores. 
                    Instead, they are medians of Mean Scores and Passing Rates from all available schools (see Methods). You can visualize the performance trends 
                    by <strong> borough</strong>, <strong>English Language Learner (ELL)</strong> status, and <strong>Students with Disabilities (SWD)</strong> status.
                </p>

                <h2>
                    Performance by Borough
                </h2>

                <Row className="input-row">
                    <Col>
                        <label className="padding-right"><strong>Regents Exam:</strong></label>
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
                        <label className="padding-right"><strong>Metric:</strong></label>
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
                        Hover over a data point for specific value. A dashed line indicates absence of data. 
                        <br></br>
                        Note that any data from 2020 and 2021 were removed (see Methods).
                </p>

                <HStack className="plot">
                    <Plot data={tracesAll} layout={plotLayout} config={{responsive: true}}></Plot>
                </HStack>
                
                <p>
                    From 2017 to 2019, Staten Island consistently outperformed the other boroughs on the Common Core English exam. It dropped in 2022, but it climbed back up in 2023.
                    The median Passing Rate on the Common Core Algebra exam was over 65% in Staten Island and Queens in 2023, while the median Passing Rate was 60% or lower for the 
                    other boroughs. Staten Island and Queens also appear to outperform the other boroughs on the Common Core Geometry and Common Core Algebra 2 exams. For instance, 
                    the median Passing Rate was 18.87% in Bronx and 48.01% in Staten Island on the 2023 Common Core Algebra 2 exam. Similar to the English and math exams, the science exams dropped in performance 
                    from 2019 to 2022 (likely due to the COVID pandemic's effect on learning). The Living Environment exam showed the smallest drop in performance out of all four 
                    science exams. Meanwhile, the Global History and Geography exam demonstrated the opposite trend. The median Passing Rate increased in every borough from 2017 to 
                    2023. Staten Island, Queens, and Bronx had an increase of over 10% in the median Passing Rate. In contrast, the US History and Government exam showed a downward 
                    trend from 2017 to 2023. Out of all exams, the foreign language exams had some of the highest median Passing Rates. The Spanish exams had median Passing Rates of 
                    over 80% in all the boroughs from 2017 to 2023, while the French and Italian exams had lower median Passing Rates. The Chinese exam had near perfect median Passing Rate 
                    in every borough other than Staten Island.
                </p>

                <h2>
                    Performance by ELL Status
                </h2>


                <Row className="input-row">
                    <Col>
                        <label className="padding-right"><strong>Regents Exam:</strong></label>
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
                        <label className="padding-right"><strong>Metric:</strong></label>
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
                        Hover over a data point for specific value. A dashed line indicates absence of data. 
                        <br></br>
                        Note that any data from 2020 and 2021 were removed (see Methods).
                </p>

                <HStack className="plot">
                    <Plot data={tracesELL} layout={plotLayout} config={{responsive: true}}></Plot>
                </HStack>

                <p>
                    Based on the performance data, former ELL students tend to outperform ELL students and English proficient students. The former ELL students had 
                    median Mean Scores that surpassed those of English proficient students by roughly 2-4% every year from 2017 to 2023 on the Common Core English 
                    exam. The gap is even larger between former ELL students and ELL students (roughly ~20%). Similar trends in performance among the 
                    ELL status groups are seen in the other exams. In fact, former ELL students had nearly double, if not more than double, the median Passing Rates of 
                    ELL students on the Global History and Geography exam in every year from 2017 to 2023. Former ELL students outperformed the other two groups on 
                    math exams as well. The median Passing Rates of former ELL students surpassed those of English proficient students by 8-10% in every year 
                    on all the math exams. The data implies a correlation between overcoming the language barrier and higher academic performance.
                </p>

                <h2>
                    Performance by SWD Status
                </h2>

                <Row className="input-row">
                    <Col>
                        <label className="padding-right"><strong>Regents Exam:</strong></label>
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
                        <label className="padding-right"><strong>Metric:</strong></label>
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
                        Hover over a data point for specific value. A dashed line indicates absence of data. 
                        <br></br>
                        Note that any data from 2020 and 2021 were removed (see Methods).
                </p>

                <HStack className="plot">
                    <Plot data={tracesSWD} layout={plotLayout} config={{responsive: true}}></Plot>
                </HStack>

                <p>
                    SWD and non-SWD students have a stark difference in their performances on the Regents exams. Non-SWD students consistently surpassed their 
                    counterparts on every Regents exam. The median Mean Scores of non-SWD students were higher than those of SWD students by over 10% on the Common Core 
                    English exam and Common Core Algebra exam every year. In fact, the non-SWD students had higher median Mean Scores than SWD students on each exam nearly every year. 
                    The only time when SWD students had a higher median Mean Score was when SWD students had a median Mean Score that was higher by 0.3% on the 2018 Physics exam. 
                    Nevertheless, the non-SWD students still had a slightly higher median Passing Rate on the 2018 Physics exam. Based on the overall patterns in the performances 
                    between SWD and non-SWD students, there is a great need for special education support in NYC schools.
                </p>

            </div>

        </div>
    )

}

export default Citywide;