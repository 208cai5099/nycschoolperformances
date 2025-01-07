import * as React from 'react';
import "./NavBar.css"
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav } from "rsuite";


function NavigationBar() {
    var navigator = useNavigate();

    function redirectToHome() {
        navigator("/home");
    }

    function redirectToExplore() {
        navigator("/disclaimer");
    }

    function redirectToMethods() {
        navigator("/methods");
    }

    function redirectToContact() {
        navigator("/contact");
    }

    function redirectToEDA() {
        navigator("/eda");
    }

    return (

        <Navbar id='navBar'>
            <Nav>
                <Nav.Item onSelect={redirectToHome}> Home </Nav.Item>
                <Nav.Item onSelect={redirectToExplore}> Explore </Nav.Item>
                <Nav.Item onSelect={redirectToEDA}> Analysis </Nav.Item>
                <Nav.Item onSelect={redirectToMethods}> Methods </Nav.Item>
                <Nav.Item onSelect={redirectToContact}> Contact </Nav.Item>
            </Nav>
        </Navbar>


    )

}

export default NavigationBar;