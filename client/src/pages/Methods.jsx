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
                    The downloaded Excel dataset includes Regents results from 2015 to 2023. As explained in the notes within the Excel file, the dataset only takes into 
                    account of a student's highest score on a specific exam in a given year. For example, a student who took the Chemistry Regents exam
                    more than once in 2016 would only have their highest grade be factored into their school's mean score and other metrics in
                    the year 2016. The Excel dataset aggregated the results by multiple categories, such as gender, English Language Learner status, and
                    Students with Disabilities status. We used the non-aggregated sheet labeled "All Students".
                </p>

                <h2>
                    Data Cleaning
                </h2>

                <p>
                    For our purposes, we extracted the following data: school DBN (unique school identifier), school name, year, regents exam, total 
                    number of test takers, mean scores, and percent of students scoring 65% or above. We also noticed that some school names were
                    truncated or misspelled. So, we referenced the NYC DOE website as well as the schools' personal websites (if they exist) to confirm 
                    the full correct spelling of their names.
                </p>

                <p>
                    We noticed that if a school had 5 or fewer students take an exam in a given year, the performance of the school for that exam in that
                    specific year is labeled with an 's' to protect student privacy. We removed all such data from the dataset.
                </p>

                <p>
                    In 2021, only four Regents exams were offered due to COVID restrictions: Living Environment, Earth Science, Common Core Algebra, 
                    and Common Core English. For some reason, the dataset listed two schools that took the Global History Regents. We suspect that this
                    was a mistake, so we removed the scores from those two schools.
                </p>

                <h2>
                    Data Storage
                </h2>

                <p>
                    We are using <a href="https://supabase.com/" target="_blank">Supabase</a> as our backend. In our backend, the data are organized into four SQL tables: regents, schools, yearly_avg, and borough_avg. <br />

                    <p></p>

                    regents: stores every school's mean score and passing rate on the Regents exams <br />

                    <p></p>

                    schools: stores every pair of school dbn and school name <br />

                    <p></p>

                    yearly_avg: stores every borough's yearly average scores on the Regents exams <br />

                    <p></p>

                    borough_avg: stores every borough's average scores on the Regents exams across all available years <br />
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