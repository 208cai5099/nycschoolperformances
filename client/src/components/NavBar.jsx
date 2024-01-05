import * as React from 'react';
import "./NavBar.css"
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav } from "rsuite";


function NavigationBar() {
    var navigator = useNavigate();

    function redirectToHome() {
        navigator("/home");
    }

    function redirectToSearch() {
        navigator("/disclaimer");
    }

    function redirectToMethods() {
        navigator("/methods");
    }

    function redirectToContact() {
        navigator("/contact");
    }

    return (

        <Navbar className='navBar'>
            <Nav>
                <Nav.Item onSelect={redirectToHome}> Home </Nav.Item>
                <Nav.Item onSelect={redirectToSearch}> Search </Nav.Item>
                <Nav.Item onSelect={redirectToMethods}> Methods </Nav.Item>
                <Nav.Item onSelect={redirectToContact}> Contact </Nav.Item>
            </Nav>
        </Navbar>


    )

}

export default NavigationBar;