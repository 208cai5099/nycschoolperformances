import React, { useState } from "react";
import "./PerformanceByBorough.css"
import { Checkbox, CheckboxGroup, Col } from "rsuite";
import Chart from "chart.js/auto"
import { testColors, boroughList } from "../util";
import supabase from "../config/supabase"

function PerformanceByBorough() {

    const [graph, setGraph] = useState(null);
    const [graphDisplay, setGraphDisplay] = useState(false);

    const fetchAverage = async(exams) => {

        const {data, error} = await supabase
        .from("borough_avg")
        .select("borough, regents_exam, total_tested, mean_score")
        .in("regents_exam", exams)

        if (error !== null) {
            console.log(error);
        } else {
            return {rawData: data, examsInput: exams};
        }

    };

    const processAverage = (rawData, examInput) => {

        if (rawData !== undefined) {

            // an outer map pairs a test to an inner map
            // each inner map pairs a borough to the borough's average score for the test
            const gradesByTest = new Map();

            // an outer map pairs a test to an inner map
            // each inner map pairs a borough to the borough's number of test takers
            const testTakersByTest = new Map();

            examInput.forEach((exam) => {
                gradesByTest.set(exam, new Map());
                testTakersByTest.set(exam, new Map());
            })

            // iterate through each data entry
            rawData.forEach((element) => {

                // get the inner map
                const currentGradesMap = gradesByTest.get(element.regents_exam);

                // update inner map with a borough's avg score for the exam
                gradesByTest.set(element.regents_exam, currentGradesMap.set(element.borough, element.mean_score.toFixed(2)))

                // repeat for the number of test takers
                const currentTestTakersMap = testTakersByTest.get(element.regents_exam);

                testTakersByTest.set(element.regents_exam, currentTestTakersMap.set(element.borough, element.total_tested));

            })

            const datasets = []

            // iterate through each exam to create an object containing the avg scores
            examInput.forEach((exam) => {

                // represents the data to be graphed for a given exam
                const examData = {
                    label: exam,
                    data: [],
                    borderColor: testColors.get(exam),
                    backgroundColor: testColors.get(exam)
                }

                // push the avg scores into the data array
                boroughList.forEach((boroughName) => {
                    examData.data.push(gradesByTest.get(exam).get(boroughName))
                })

                // push the newly created data object to the running array
                datasets.push(examData);
            })

            return {
                labels: boroughList,
                datasets: datasets,
                testTakersMap: testTakersByTest
            }

        }

    }

    const graphAverage = async(value) => {

        if (value.length > 0) {

            // extract the input exams chosen by user and the raw data
            const { rawData, examsInput } = await fetchAverage(value);

            // process the data into the proper format
            const processedData = processAverage(rawData, examsInput);

            if (graph !== null) {
                graph.destroy();
            }

            const graphInstance = new Chart(
                document.getElementById("average-borough"),

                {
                    type: "bar",
                    data: processedData,
                    options: {
                        plugins: {
                            tooltip: {
                                callbacks: {

                                    // context contains the info for the tooltip label
                                    // append a "%"" mark to the end of the label
                                    label: (context) => {
                                        const borough = context.label;
                                        const exam = context.dataset.label;
                                        const testTakers = processedData.testTakersMap.get(exam).get(borough)
                                        return context.formattedValue.concat("% (test takers: ", `${testTakers})`);
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
                <h3>Performance by Borough </h3>

                <p>
                    Use the following checkboxes to explore the performance on particular exams
                    in the different boroughs. The values are calculated by taking the average of 
                    all available Mean Scores in the years 2017, 2018, 2019, 2022, and 2023. The years 
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
                    <p> Hover over a bar for specific value and number of test takers. 
                        <br></br>
                        Note that any data from 2020 and 2021 were removed (see Methods).
                    </p>
                </div>
            }


            <div className="graph">
                <canvas id="average-borough"/>
            </div>
        </div>

    )

}

export default PerformanceByBorough;