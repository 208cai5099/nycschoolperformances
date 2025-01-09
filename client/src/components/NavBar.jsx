import * as React from 'react';
import "./NavBar.css"
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav } from "rsuite";


function NavigationBar() {
    var navigator = useNavigate();

    function redirectToHome() {
        navigator("/nycschoolperformances");
    }

    function redirectToDisclaimer() {
        navigator("/nycschoolperformances/disclaimer");
    }

    function redirectToMethods() {
        navigator("/nycschoolperformances/methods");
    }

    function redirectToContact() {
        navigator("/nycschoolperformances/contact");
    }

    return (

        <Navbar id='navBar'>
            <Nav>
                <Nav.Item onSelect={redirectToHome}> Home </Nav.Item>
                <Nav.Item onSelect={redirectToDisclaimer}> Explore </Nav.Item>
                <Nav.Item onSelect={redirectToMethods}> Methods </Nav.Item>
                <Nav.Item onSelect={redirectToContact}> Contact </Nav.Item>
            </Nav>
        </Navbar>


    )

}

export default NavigationBar;