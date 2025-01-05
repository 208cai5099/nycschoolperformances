import { React, useState, useEffect } from "react";
import { colorList } from "../util.js";
import Plot from 'react-plotly.js';

function GeneralDistributionPlot(props) {

    const [encounteredYears, setEncounteredYears] = useState([])
    const [plotlyTraces, setPlotlyTraces] = useState([])

    function setUpPlotlyTraces(valuesArray, year, m) {

        var traces = plotlyTraces;
        var years = encounteredYears;

        if (years.includes(year) === false) {
            traces.push(
                {
                    name: year.toString(),
                    type: 'histogram',
                    x: valuesArray,
                    xbins: {start: 0 , end: 100, size: 2},
                    opacity: 0.5,
                    marker: {color: colorList.at(0)},
                    hoverinfo: "none"
                }
            )

            years.push(year)
        
            setPlotlyTraces(traces);
            setEncounteredYears(years);

            console.log(encounteredYears.length)
        }

    }

    useEffect(() => {
        props.map.forEach(setUpPlotlyTraces)
    }, []);


    return (
        <div>
            { encounteredYears.length >= 5 ? null : 
            <Plot>
                data={plotlyTraces}
                layout={{
                    grid: {
                    rows: 5,
                    columns: 1,
                    pattern: 'independent',
                    subplots: [["xy"], ["xy2"], ["xy3"]],
                },
                width: 1000,
                height: 500
                }}
            </Plot>
            }
        </div>
    )
}

export default GeneralDistributionPlot;