import React from "react";
import Chart from "chart.js/auto"

function LineGraph(props) {

    // represent the line graph
    const lineGraph = new Chart(
        props.canvas,
        {
            type: "line",
            data: props.data,
            options: {maintainAspectRatio: false}
        }
    )

    return lineGraph;
    
}

export default LineGraph;