import React from "react";
import "./Explore.css"
import { useNavigate } from 'react-router-dom';
import { Panel, FlexboxGrid, Row, Col } from "rsuite";

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

                <Row className="exploreOptionsRow">
                    <Col>
                        <Panel className="panel" bordered={true} shaded={true}>

                            <h3>School-Based</h3>

                            <button className="schoolButton" onClick={redirectToSchoolSpecific}/>

                            <p>
                                Click the icon above to visualize a specific school's performance 
                                on a designated Regents exam over time. 
                            </p>

                        </Panel>
                    </Col>

                        <Col>
                        <Panel className="panel" bordered={true} shaded={true}>

                            <h3>Citywide</h3>

                            <button className="cityButton" onClick={redirectToCitywide}/>
                        
                            <p>
                                Click the icon above to learn about general performance trends 
                                across <span id="thebigapple">"The Big Apple"</span> that is New York City.
                            </p>                        
                        
                        </Panel>
                    </Col>
                </Row>


        </div>
    )

}

export default Explore;