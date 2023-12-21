import * as React from 'react';
import { navBar } from "./Welcome-Styling.js";
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container'
import NavBarButton from './NavBarButton.jsx';

function NavBar() {

    const words = ["Home", "Search", "Quick Stats", "Methods", "Contact", "Disclaimer"]

    return (
        <div>
            <AppBar sx={navBar}>
                <Container>
                    {words.map((word) => {

                        return (
                            <NavBarButton text={word} />
                        )

                    })}
                </Container>
            </AppBar>
        </div>
    )

}

export default NavBar;