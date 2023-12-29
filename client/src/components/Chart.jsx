import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from "recharts";
import {chart} from "./Chart-Styling"

function Chart(props) {

    return (
        <ResponsiveContainer
            height={300}
            width="80%"
            style={chart}
        >

            <LineChart
                data={props.data}
            >
                <CartesianGrid />
                <XAxis dataKey="name"/>
                <YAxis />
                <Legend />
                <Tooltip />
                <Line type="monotone" dataKey="uv" stroke="#6CADDC" fill="#8884d8" />
            </LineChart>
        </ResponsiveContainer>

    )

}

export default Chart;