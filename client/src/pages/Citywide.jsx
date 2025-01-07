// Overview of Citywide Performance
// Interactive display of school performances

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