// Overview of Citywide Performance
// Interactive display of school performances

import React, { useState, useEffect } from "react";
import supabase from '../config/supabase.js'
import { colorList } from "../util.js";
import GeneralDistributionPlot from '../components/GeneralDistributionPlot.jsx'
import Plot from 'react-plotly.js';
import "./Citywide.css"

function Citywide() {

    // create a map that pairs a year to an array
    // the array contains mean scores or passing rates
    const [exam, setExam] = useState("Common Core English")
    const [meanScoreMapAll, setMeanScoreMapAll] = useState(new Map())
    const [passingRateMapAll, setPassingRateMapAll] = useState(new Map())
    const [meanScoreMapELL, setMeanScoreMapELL] = useState(new Map())
    const [passingRateMapELL, setPassingRateMapELL] = useState(new Map())
    const [meanScoreMapSWD, setMeanScoreMapSWD] = useState(new Map())
    const [passingRateMapSWD, setPassingRateMapSWD] = useState(new Map())

    const requestData = async(table) => {

        const {data, error} = await supabase
        .from(table)
        .select()
        .eq("regents_exam", exam)

        if (error !== null) {
            
            console.log(error);

        } else {

            return data;

        }
    };

    const processData = async(table) => {

        const data = await requestData(table)

        // console.log(data)

        if (table === "regents") {

            var meanScores = new Map();
            var passingRates = new Map();
            var yearsArray = [];

            data.forEach((record) => {

                if (yearsArray.includes(record.year)) {
                    var scores = meanScores.get(record.year)
                    scores.push(record.mean_score)
                    meanScores.set(record.year, scores)

                    var rates = passingRates.get(record.year)
                    rates.push(record.percent_65_or_above)
                    passingRates.set(record.year, rates)

                } else{
                    yearsArray.push(record.year)

                    meanScores.set(record.year, [record.mean_score])
                    passingRates.set(record.year, [record.percent_65_or_above])
                }

            })

            // console.log(meanScores)
            // console.log(passingRates)

            setMeanScoreMapAll(meanScores);
            setPassingRateMapAll(passingRates);

        } else {

            var meanScores = new Map();
            var passingRates = new Map();
            var yearCategoryMap = new Map();

            data.forEach((record) => {

                if (typeof yearCategoryMap.get(record.year) === "undefined") {

                    var newScoresMap = new Map([[record.category, [record.mean_score]]])
                    var newRatesMap = new Map([[record.category, [record.percent_65_or_above]]])

                    meanScores.set(record.year, newScoresMap)
                    passingRates.set(record.year, newRatesMap)

                    yearCategoryMap.set(record.year, [record.category])

                } else {

                    const encounteredCategories = yearCategoryMap.get(record.year)

                    if (encounteredCategories.includes(record.category) === false) {
                        encounteredCategories.push(record.category)

                        var scoresMap = meanScores.get(record.year)
                        scoresMap.set(record.category, [record.mean_score])
                        meanScores.set(record.year, scoresMap)
    
                        var ratesMap = passingRates.get(record.year)
                        ratesMap.set(record.category, [record.percent_65_or_above])
                        passingRates.set(record.year, ratesMap)

                    } else {
                        var scoresMap = meanScores.get(record.year)
                        var scores = scoresMap.get(record.category)
                        scores.push(record.mean_score)
                        scoresMap.set(record.category, scores)
                        meanScores.set(record.year, scoresMap)
    
                        var ratesMap = passingRates.get(record.year)
                        var rates = ratesMap.get(record.category)
                        rates.push(record.percent_65_or_above)
                        ratesMap.set(record.category, rates)
                        passingRates.set(record.year, ratesMap)
                    }
                }

            })

            // console.log(meanScores)
            // console.log(passingRates)

            if (table === "regents_by_ell") {
                setMeanScoreMapELL(meanScores);
                setPassingRateMapELL(passingRates);

            } else if (table === "regents_by_swd") {
                setMeanScoreMapSWD(meanScores);
                setPassingRateMapSWD(passingRates);
            }
        }
    }

    // request to get list of unique school names
    useEffect(() => {
        processData("regents")
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

                <h3>
                    General Performance Across the City
                </h3>

                {
                    meanScoreMapAll.size === 0 ? null : <GeneralDistributionPlot map={meanScoreMapAll}/>
                }

            </div>

            

        </div>
    )

}

export default Citywide;