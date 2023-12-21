import * as React from 'react';
import { navBar } from "./NavBar-Styling.js";
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container'
import NavBarButton from './NavBarButton.jsx';

function NavBar() {

    const words = ["Home", "Search", "Methods", "Contact"]

    return (
        <AppBar sx={navBar}>
            <Container>
                {words.map((word) => {

                    return (
                        <NavBarButton key={word} id={word} text={word} />
                    )

                })}
            </Container>
        </AppBar>
    )

}

export default NavBar;