import React from "react";
import "./Explore.css"
import { useNavigate } from 'react-router-dom';

function Explore() {

    const navigator = useNavigate()

    function redirectToSchoolSpecific() {
        navigator("/school-specific");
    }

    function redirectToCitywide() {
        navigator("/citywide");
    }

    return (
        <div>
            <h1 className="optionsMessage">
                Pick an Option:
            </h1>

            <div className="pictureRow">
                <button className="schoolButton" onClick={redirectToSchoolSpecific}/>

                <button className="cityButton" onClick={redirectToCitywide}/>

            </div>
        </div>
    )

}

export default Explore;