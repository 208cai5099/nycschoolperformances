import React, { useState } from "react";
import "./PerformanceOverTime.css"
import { Checkbox, CheckboxGroup, Col } from "rsuite";
import Chart from "chart.js/auto"
import { yearList, testColors } from "../util";
import supabase from "../config/supabase"

function PerformanceOverTime() {

    const [graph, setGraph] = useState(null);
    const [graphDisplay, setGraphDisplay] = useState(false);

    const fetchAverage = async(exams) => {

        const {data, error} = await supabase
        .from("yearly_avg")
        .select("year, regents_exam, total_tested, mean_score")
        .in("regents_exam", exams)

        if (error !== null) {
            console.log(error);
        } else {
            return data;
        }

    };


    const processAverage = (rawData) => {

        if (rawData !== undefined) {
            // make a nested map
            // the outer map pairs a test to an inner map
            // the inner map pairs a year to the exam's avg score for that year
            var gradesByTest = new Map();

            // repeat process for number of test takers
            var samplesByTest = new Map();

            rawData.forEach((element) => {
                if (gradesByTest.get(element.regents_exam) === undefined) {
                    gradesByTest.set(element.regents_exam, new Map().set(element.year, parseFloat(element.mean_score.toFixed(2))));
                } else {
                    const currentGradesMap = gradesByTest.get(element.regents_exam);
                    gradesByTest.set(element.regents_exam, currentGradesMap.set(element.year, parseFloat(element.mean_score.toFixed(2))));
                }

                if (samplesByTest.get(element.regents_exam) === undefined) {
                    samplesByTest.set(element.regents_exam, new Map().set(element.year, parseInt(element.total_tested)));
                } else {
                    const currentSamplesMap = samplesByTest.get(element.regents_exam);
                    samplesByTest.set(element.regents_exam, currentSamplesMap.set(element.year, parseInt(element.total_tested)));
                }
            })

            const datasets = []

            gradesByTest.forEach((value, key) => {
                
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
                    borderColor: testColors.get(key),
                    backgroundColor: testColors.get(key),
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

            const processedData = {
                labels: yearList,
                datasets: datasets
            }

            return {
                processedData: processedData,
                samplesByTest: samplesByTest
            };
        }

    }

    const graphAverage = async(value) => {

        if (value.length > 0) {

            const rawData = await fetchAverage(value);
            const { processedData, samplesByTest } = processAverage(rawData);

            if (graph !== null) {
                graph.destroy();
            }


            const graphInstance = new Chart(
                document.getElementById("average-time"),
                    {
                    type: "line",
                    data: processedData,
                    options: {
                        maintainAspectRatio: false,
                        plugins: {
                            tooltip: {
                                callbacks: {

                                    // context contains the info for the tooltip label
                                    label: (context) => {

                                        // extract the exam name and year
                                        const examName = context.dataset.label;
                                        const year = parseInt(context.label);

                                        // look up the number of test takers
                                        if (samplesByTest.get(examName).get(year) === undefined) {
                                            return "No Data"
                                        } else {
                                            return context.formattedValue.concat("% (test takers: ", `${samplesByTest.get(examName).get(year)}`)
                                        }
                                    }
                                }
                            }
                        }
                    }
                    }
            )

            setGraph(graphInstance);
            setGraphDisplay(true);
        } else {

            if (graph !== null) {
                graph.destroy();
                setGraphDisplay(false);
            }

        }

    }

    return (
        <div>
            <div className="description">
                <h3>Performance Over Time </h3>

                <p>
                    Use the following checkboxes to explore the performance on particular exams
                    over time. The values are calculated by taking the average of all available 
                    Mean Scores in the years 2017, 2018, 2019, 2022, and 2023. The years 
                    2020 and 2021 are excluded due to the COVID pandemic's effect on exam administration.
                </p>

                    <CheckboxGroup inline={true} name="exams" onChange={(value) => {
                        graphAverage(value)
                    }}>

                        <Col>

                            <p>ELA</p>

                            <Checkbox value="Common Core English">Common Core English</Checkbox>
                        </Col>

                        <Col>

                            <p>Math</p>

                            <Checkbox value="Common Core Algebra">Common Core Algebra</Checkbox>

                            <Checkbox value="Common Core Geometry">Common Core Geometry</Checkbox>

                            <Checkbox value="Common Core Algebra 2">Common Core Algebra 2</Checkbox>
                        </Col>

                        <Col>

                            <p>Science</p>

                            <Checkbox value="Living Environment">Living Environment</Checkbox>

                            <Checkbox value="Earth Science">Earth Science</Checkbox>

                            <Checkbox value="Chemistry">Chemistry</Checkbox>

                            <Checkbox value="Physics">Physics</Checkbox>
                        </Col>

                        <Col>

                            <p>History</p>

                            <Checkbox value="Global History and Geography">Global History and Geography</Checkbox>

                            <Checkbox value="US History and Government">US History and Government</Checkbox>
                        </Col>

                        <Col>

                            <p>Foreign Language</p>

                            <Checkbox value="Chinese">Chinese</Checkbox>

                            <Checkbox value="French">French</Checkbox>

                            <Checkbox value="Italian">Italian</Checkbox>

                            <Checkbox value="Spanish">Spanish</Checkbox>
                        </Col>

                    </CheckboxGroup>

            </div>
            
            {graphDisplay === false ? null :
                <div className="note">
                    <p> Hover over a data point for specific value and number of test takers. A dashed line indicates absence of data. 
                        <br></br>
                        Note that any data from 2020 and 2021 were removed (see Methods).
                    </p>
                </div>
            }

            <div className="graph">
                <canvas id="average-time"/>
            </div>

        </div>

    )

}

export default PerformanceOverTime;