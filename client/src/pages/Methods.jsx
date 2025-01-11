import React from "react";
import "./Methods.css";
import Plot from 'react-plotly.js';
import { HStack } from 'rsuite';

function Methods() {

    const years = [2018, 2018, 2018, 2018, 2018, 2018, 2018, 2018, 2018]
    const schools = ["School A", "School A", "School A", "School B", "School B", "School B", "School C", "School C", "School C"]
    const categories = ["ELL", "Former ELL", "English Proficient", "ELL", "Former ELL", "English Proficient", "ELL", "Former ELL", "English Proficient"]
    const exam = ["Common Core English", "Common Core English", "Common Core English", "Common Core English", "Common Core English", "Common Core English", 
        "Common Core English", "Common Core English", "Common Core English"]
    const mean_scores = [42, 76, 63, 53, 89, 76, 55, 77, 65]
    const percent_65_or_above = [38, 68, 60, 44, 79, 66, 52, 70, 61]

    const columns = [ schools, categories, years, exam, mean_scores, percent_65_or_above ]

    const trace = [{
        type: "table",
        header: {
            values: [["School Name"], ["Category"], ["Year"], ["Regents Exam"], ["Mean Score"], ["Percent Scoring 65 or Above (Passing Rate)"]],
            align: "center",
            color: "black",
            font: {family: "Raleway"}
        },
        cells: {
            values: columns,
            height: 50,
            align: "center",
            color: "black",
            font: {family: "Raleway"}
        }
    }]

    const plotLayout = {width: 1050, height: 700}

    return (
        <div>
            <h1 className="heading">How Did We Process and Visualize the Data?</h1>

            <div className="method-description">

                <h2>
                    Introduction to the Regents Exams
                </h2>

                <p>
                    The New York State (NYS) Regents exams are assessments that test public school students' understanding of high school learning standards in English, math, 
                    science, social studies, and foreign languages. Students generally must pass a certain number of Regents exams to graduate with a traditional high school 
                    diploma. Some middle schools in the state offer accelerated programs that teach the standards and enable students to earn high school credit before 
                    matriculation into high school. Exams are usually administered three times a year in January, June, and August.
                </p>

                <h2>
                    Data Cleaning and Wrangling
                </h2>
                
                <p>
                    We collected the performance results of NYC schools from the <a href="https://infohub.nyced.org/reports/academics/test-results" target="_blank">NYC Public Schools InfoHub site</a>.
                    The NYC Public Schools InfoHub regularly releases the city's performance on standardized tests, including the annual ELA 
                    and math state tests.
                </p>

                <p>
                    The downloaded Excel data file includes Regents results from 2015 to 2023. The Excel file contains sheets with non-aggregated data and data aggregated by multiple categories, 
                    such as gender, English Language Learner (ELL) status, and Students with Disabilities (SWD) status. We used the non-aggregated sheet called "All Students" 
                    and the aggregated sheets "By ELL Status" and "By SWD Status". Each row in the sheets contains insightful information about a school's performance on a specific 
                    Regents exam in a particular year, such as Mean Score, Total Tested, Percent Scoring 65 or Above, and so on. For example, the students in Fort Hamilton 
                    High School had a Mean Score (average score) of 72.45% and a Passing Rate (Percent Scoring 65 or Above) of 77.67% on the 2023 US History and Government 
                    exam. The aggregated sheets, such as "By ELL Status", breaks down the results further by groups, such as ELL students, former ELL students, and English proficient students 
                    (see example table in the section below).
                </p>

                <p>
                    For our purposes, we use Mean Score and Percent Scoring 65 or Above as measures of performance. This website refers to the Percent Scoring 65 or Above as 
                    Passing Rate, because a grade of 65 or higher is usually considered sufficient to earn graduation credit.
                </p>

                <p>    
                    We noticed that some school names were truncated or misspelled. So, we checked the NYC Department of Education website as well as the schools' personal websites (if they exist) to confirm 
                    the full correct spelling of their names.
                </p>

                <p>
                    In the 2010s, New York State began implementing English and math Regents exams that are aligned to the Common Core standards. By 2017, the vast 
                    majority of test takers took the Common Core-aligned exams instead of the exams aligned to the older standards. To focus on more current standards, 
                    the data from the non-Common Core English and math exams are not shown on this website. Furthermore, this website will only show data from 2017 and onwards for 
                    all exams, including the science, history, and foreign language exams.
                </p>

                <p>
                    We noticed that if a school had 5 or fewer students take an exam in a given year, the performance of the school for that exam in that
                    specific year is labeled with an 's' to protect student privacy (see Data Limitations below).
                </p>

                <p>
                    Due to the COVID pandemic, the June and August 2020 Regents exams were canceled and the 2021 Regents exams were impacted. Any data  
                    from those two years were removed, because those data might not provide a reliable representation of school performance across the city.
                </p>

                <h2>
                    School-Based and Citywide Pages
                </h2>

                <p>                   
                    On the School-Based page, the user can select a school name, a Regents exam, and a metric (Mean Score or Passing Rate) to visualize. The chart will 
                    show the school's Mean Score or Passing Rate on the selected exam from 2017 to 2023, if the data is available in the database. The chart takes into 
                    account of all available students, regardless of ELL or SWD status
                </p>

                <p>    
                    On the Citywide page, the user can explore the trends in performance by borough, ELL status, and SWD status. There are five boroughs in the city: Bronx, 
                    Brooklyn, Manhattan, Queens, and Staten Island. There are three ELL groups: ELL, former ELL, and English proficient. There are two 
                    SWD groups: SWD and non-SWD. To help measure the performance levels across boroughs, ELL groups, and SWD groups, we 
                    used the median of the Mean Scores and Passing Rates in each group. 
                </p>

                <p>
                    Here is an example to illustrate the idea of median Mean Score and median Passing Rate. Let's say NYC has only three schools.
                </p>

                <HStack className="plot">
                    <Plot data={trace} layout={plotLayout} config={{displayModeBar: false}}></Plot>
                </HStack>

                <p>
                    Based on these hypothetical values, the median Mean Scores of ELL students, former ELL students, and English proficient students on the 2018 Common Core 
                    English exam were 53%, 77%, and 65%, respectively. The median Passing Rates of the groups in this same order were 44%, 70%, and 61%, respectively. Please 
                    keep in mind that the median Mean Score (or Passing Rate) is the median of a list of Mean Scores (or Passing Rates) from all available schools.
                </p>

                <p>
                    Using the dropdown menus on the Citywide page, the user can visualize the median Mean Scores or median Passing Rates to track the performance among the boroughs, 
                    ELL groups, and SWD groups. For example, Brooklyn and Manhattan had median Mean Scores of 66.44% and 72.89%, respectively, on the Common Core English exam in 2023.
                </p>

                <h2>
                    Data Limitations
                </h2>

                <p>
                    The data file does not contain performance data for schools that had 5 or fewer students take an exam. Also, this restriction applies to the ELL and SWD groups. 
                    If a school had 5 or fewer students from a specific group (ELL, former ELL, English proficient, SWD, or non-SWD) take an exam, their performance data is 
                    unavailable in the sheets "By ELL Status" and "By SWD Status". In addition, the median Mean Scores and median Passing Rates shown on the Citywide page are not medians of actual student scores. 
                    They are medians of Mean Scores (average scores) and Passing Rates from all available schools. Ideally, we would use the medians of actual student scores. However, 
                    that data is unavailable. Due to the aforementioned limitations, the charts and written findings on the Citywide page about the performances of boroughs, ELL groups, and SWD groups 
                    likely contain some degree of inaccuracy.
                </p>

                <h2>
                    Data Storage
                </h2>

                <p>
                    We are using <a href="https://supabase.com/" target="_blank">Supabase</a> as our SQL-based backend to store the processed data.
                </p>

                <h2>
                    Data Visualization
                </h2>

                <p>
                    We use <a href="https://www.chartjs.org/docs/latest/" target="_blank">Chart.js</a> to produce the line chart on the School-Based page, 
                    and we use <a href="https://plotly.com/javascript/" target="_blank">Plotly</a> to produce the line charts on the Citywide page. Once the user 
                    submits their inputs, the requested data is fetched from our Supabase database and processed for visualization.
                </p>
            </div>

        </div>
    )
    

}

export default Methods;