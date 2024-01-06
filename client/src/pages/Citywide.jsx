// Overview of Citywide Performance
// Interactive display of school performances

// Section 1: Users choose which test to see the avg performance of from 2015 to 2019
// Users are presented with buttons representing the tests
// Once clicked, the button triggers a graph showing the appropriate data

// Section 3: Users get to see performance comparisons pre-COVID and post-COVID
// Users are presented with dropdown menu for test
// Once selected, a boxplot is shown for pre-COVID and post-COVID

import React, { useState } from "react";
import "./Citywide.css"
import { Checkbox, CheckboxGroup, Col } from "rsuite";
import Chart from "chart.js/auto"
import { yearList, testColors } from "../util";

function Citywide() {

    const [graph, setGraph] = useState(null);

    function formatInput(input) {
        var result = "";

        input.forEach((element) => {
            if (result === "") {
                result = result.concat("'", element, "'");
            } else {
                result = result.concat(", '", element, "'");
            }
        
        })
        
        return result;

    }

    const fetchAverage = async(exams) => {
        try {

            if (exams !== null && exams.length > 0) {

                const examInput = formatInput(exams);
        
                const url = `http://localhost:5100/search-average/(${examInput})`;
                const response = await fetch(url);
                const rawData = await response.json();
                return rawData;
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const processAverage = (rawData) => {

        if (rawData !== undefined) {
            // make a nested map
            // the outer map pairs a test to a year
            // the inner map pairs a year to the exam's avg score for that year
            var gradesByTest = new Map();

            // repeat process for number of test takers
            var samplesByTest = new Map();

            rawData.forEach((element) => {
                if (gradesByTest.get(element.regents_exam) === undefined) {
                    gradesByTest.set(element.regents_exam, new Map().set(element.year, parseFloat(parseFloat(element.avg).toFixed(2))));
                } else {
                    const currentGradesMap = gradesByTest.get(element.regents_exam);
                    gradesByTest.set(element.regents_exam, currentGradesMap.set(element.year, parseFloat(parseFloat(element.avg).toFixed(2))));
                }

                if (samplesByTest.get(element.regents_exam) === undefined) {
                    samplesByTest.set(element.regents_exam, new Map().set(element.year, parseInt(element.sum)));
                } else {
                    const currentSamplesMap = samplesByTest.get(element.regents_exam);
                    samplesByTest.set(element.regents_exam, currentSamplesMap.set(element.year, parseInt(element.sum)));
                }
            })

            const datasets = []

            gradesByTest.forEach((value, key) => {

                console.log(testColors.get(key));
                
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

            return processedData;
        }

    }

    const graphAverage = async(value) => {
        const rawData = await fetchAverage(value);
        const processedData = processAverage(rawData);

        console.log(processedData);

        if (graph !== null) {
            graph.destroy();
        }


        const graphInstance = new Chart(
            document.getElementById("citywide-average"),
                {
                type: "line",
                data: processedData
                }
        )

        setGraph(graphInstance);

    }

    return (
        <div>
            <h1 id="citywide-heading">Overview of Citywide Performances</h1>

            <div>
                <h3>Average Exam Scores from 2015 to 2019 </h3>

                <p>
                    Use the following checkboxes to explore the average score of a particular
                    exam across all schools that administered it.
                </p>

                    <CheckboxGroup inline={true} name="exams" onChange={(value) => {
                        graphAverage(value)
                    }}>

                        <Col>

                            <p>ELA</p>

                            <Checkbox value="English">English (old)</Checkbox>

                            <Checkbox value="Common Core English">Common Core English</Checkbox>
                        </Col>

                        <Col>

                            <p>Math</p>

                            <Checkbox value="Integrated Algebra">Integrated Algebra (old)</Checkbox>

                            <Checkbox value="Common Core Algebra">Common Core Algebra</Checkbox>

                            <Checkbox value="Geometry">Geometry (old)</Checkbox>

                            <Checkbox value="Common Core Geometry">Common Core Geometry</Checkbox>

                            <Checkbox value="Algebra 2 (Trigonometry)">Algebra 2 (Trigonometry) (old)</Checkbox>

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

            <div>
                <canvas id="citywide-average"/>
            </div>
        </div>

    )

}

export default Citywide;