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
import PerformanceOverTime from "../components/PerformanceOverTime";
import PerformanceByBorough from "../components/PerformanceByBorough";
import { Nav } from "rsuite";

function Citywide() {

    const [option, setOption] = useState("Performance Over Time");

    function updateOption(event) {
        setOption(event);
    }

    return (
        <div>
            <h1 id="citywide-heading">Overview of Citywide Performances</h1>

            <Nav id="citywide-navbar" appearance="tabs" justified={true} activeKey={option} onSelect={updateOption}>
                <Nav.Item eventKey="Performance Over Time">
                    Performance Over Time
                </Nav.Item>

                <Nav.Item eventKey="Performance By Borough">
                    Performance by Borough
                </Nav.Item>
            </Nav>

            {option === "Performance Over Time" ? <PerformanceOverTime /> : <PerformanceByBorough />}

        </div>
    )

}

export default Citywide;