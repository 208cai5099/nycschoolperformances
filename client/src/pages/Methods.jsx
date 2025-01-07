import React from "react";
import "./Methods.css";

function Methods() {

    return (
        <div>
            <h1 className="heading">How Did We Process and Visualize the Data?</h1>

            <div className="method-description">

                <h2>
                    Data Collection
                </h2>
                
                <p>
                    We collected the performance results of NYC schools from the <a href="https://infohub.nyced.org/reports/academics/test-results" target="_blank">NYC Public Schools InfoHub site</a>.
                    The NYC Public Schools InfoHub regularly releases the city's performance on standardized tests, including the annual ELA 
                    and math state tests.
                </p>

                <p>
                    The downloaded Excel dataset includes Regents results from 2015 to 2023. The Excel dataset aggregated the results by multiple categories, 
                    such as gender, English Language Learner status, and Students with Disabilities status. We used the non-aggregated sheet labeled "All Students". 
                    Each row in the sheet contains insightful information about a school's performance on a specific Regents exam in a particular year, such as 
                    Mean Score, Total Tested, Percent Scoring 65 or Above, and so on. For example, the students in Fort Hamilton High School had a Mean Score 
                    (average score) of 72.45% on the 2023 US History and Government exam. This website refers to the Mean Score as Average Score and the Percent 
                    Scoring 65 or Above as Passing Rate.
                </p>

                <h2>
                    Data Wrangling
                </h2>

                <p>
                    For our purposes, we extracted the following data: School DBN (unique school identifier), School Name, Year, Regents Exam, Total 
                    Tested (number of test takers), Mean Score, and Percent Scoring 65 or Above. We also noticed that some school names were
                    truncated or misspelled. So, we referenced the NYC DOE website as well as the schools' personal websites (if they exist) to confirm 
                    the full correct spelling of their names.
                </p>

                <p>
                    In the 2010s, New York State began the Common Core standards. By 2017, the vast majority of test takers took the Common Core-aligned exams 
                    instead of the exams aligned to the older standards (English, Integrated Algebra, Geometry, and Algebra 2/Trigonometry). To focus on more 
                    current standards, the data from the older English and math exams are not shown on this website. Due to the removal of the older exam data, this 
                    website will only show data from 2017 and onwards for all exams, including the science, history, and foreign language exams.
                </p>

                <p>
                    We noticed that if a school had 5 or fewer students take an exam in a given year, the performance of the school for that exam in that
                    specific year is labeled with an 's' to protect student privacy. We removed all such data from the dataset.
                </p>

                <p>
                    Due to the COVID pandemic, the June and August 2020 Regents exams were canceled and the 2021 Regents exams were impacted. Any data  
                    from those two years were removed, because those data might not provide a reliable measure of school performance.
                </p>

                <h2>
                    Data Storage
                </h2>

                <p>
                    We are using <a href="https://supabase.com/" target="_blank">Supabase</a> as our backend. In our backend, the data are organized into four SQL tables: regents, schools, yearly_avg, and borough_avg. <br />

                    <p></p>

                    regents: stores every school's Mean Score and Passing Rate on the Regents exams <br />

                    <p></p>

                    schools: stores every pair of School DBN and School Name <br />

                    <p></p>

                    yearly_avg: stores every borough's yearly average Mean Score on every Regents exam from 2017 to 2023 (excluding 2020 and 2021)<br />

                    <p></p>

                    borough_avg: stores every borough's average Mean Score on every Regents exam from 2017 to 2023 (excluding 2020 and 2021) <br />
                </p>

                <h2>
                    Data Visualization
                </h2>

                <p>
                    For our visualizations, we used <a href="https://www.chartjs.org/docs/latest/" target="_blank">Chart.js</a> to produce the line and bar charts in the Explore page. Once user submits their inputs, the
                    requested data is fetched from our database and processed for visualization.
                </p>
            </div>

        </div>
    )
    

}

export default Methods;