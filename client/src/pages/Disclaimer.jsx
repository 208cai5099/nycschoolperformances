import React, {useState} from "react"
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { card, text, buttonRow, button } from "./Disclaimer-Styling.js"
import { useNavigate } from "react-router-dom";

function Disclaimer() {

    var navigator = useNavigate();

    function redirectToSearch() {
        navigator("/search");
    }

    function redirectToHome() {
        navigator("/home");
    }

    return (

        <Card style={card}>
            <CardContent>
                <Typography style={text}>
                    The information provided on this site is for informational purposes only. The information 
                    provided on this site is not intended to be used as advice for school selection and is not 
                    representative of any school, organization, or entity.
                </Typography>

                <Typography style={text}>
                    Press "Agree" to indicate that you understand this message.
                </Typography>
            </CardContent>

            <div style={buttonRow}>
                <Button style={button} onClick={redirectToHome}>
                    Go to Homepage
                </Button>

                <Button style={button} onClick={redirectToSearch}>
                    Agree
                </Button>
            </div>
        </Card>

    )
}

export default Disclaimer;