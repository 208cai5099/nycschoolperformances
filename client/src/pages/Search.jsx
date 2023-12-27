import {React, useState} from "react";
import { heading } from "./Search-Styling.js";

function Search() {

    const [schoolName, setSchoolName] = useState("");
    const [testName, setTestName] = useState("");
    const [toYear, setToYear] = useState("");
    const [fromYear, setFromYear] = useState("");

    const fetchData = async() => {
        try {
            const url = `http://localhost:5000/search/${schoolName}/${testName}/${fromYear}/${toYear}`;
            const response = await fetch(url);
            const data = await response.json();
            console.log(data);

        } catch (error) {
            console.log(error.message);
        }
    }

    return (
        <div>
            <h1 style={heading}>Look up schools!</h1>
            <input placeholder="School (ex: Fort Hamilton High School)" onChange={(event) => {setSchoolName(event.target.value)}}></input>

            <input placeholder="Test (ex: Common Core Algebra)" onChange={(event) => {setTestName(event.target.value)}}></input>

            <input placeholder="From (ex: 2015)" onChange={(event) => {setFromYear(event.target.value)}}></input>

            <input placeholder="To (ex: 2019)" onChange={(event) => {setToYear(event.target.value)}}></input>

            <button onClick={fetchData}>Search</button>

        </div>
    )
    

}

export default Search;