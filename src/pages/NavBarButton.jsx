import * as React from 'react';
import Button from '@mui/material/Button';
import { btnHover, btnNotHover } from "./Welcome-Styling.js";

function NavBarButton(props) {
    const [isHover, setIsHover] = React.useState(false);

    function updateHover() {
        setIsHover(!isHover);
    }

    return (
        <Button sx={isHover === true ? btnHover : btnNotHover} onMouseOver={updateHover} onMouseOut={updateHover}>
            {props.text}
        </Button>
    )
}

export default NavBarButton;