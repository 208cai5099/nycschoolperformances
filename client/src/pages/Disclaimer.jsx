import React from "react";
import { Panel, Button } from "rsuite";
import "./Disclaimer.css";
import { useNavigate } from "react-router-dom";

function Disclaimer() {

    var navigator = useNavigate();

    function redirectToExplore() {
        navigator("/nycschoolperformances/explore");
    }

    function redirectToHome() {
        navigator("/nycschoolperformances");
    }

    return (

        <Panel className="panel" bordered={true}>
                <p>
                    The information provided on this site is for informational purposes only. The information 
                    provided on this site is not intended to be used as advice or guidance for school application.
                </p>

                <p>
                    Press "Agree" to indicate that you understand this message.
                </p>

            <div className="buttonRow">
                <Button className="button" onClick={redirectToHome} appearance="ghost">
                    Go to Homepage
                </Button>

                <Button className="button" onClick={redirectToExplore} appearance="ghost">
                    Agree
                </Button>
            </div>
        </Panel>

    )
}

export default Disclaimer;