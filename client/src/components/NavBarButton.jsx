import * as React from 'react';
import Button from '@mui/material/Button';
import { btnHover, btnNotHover } from "./Button-Styling.js";
import { useNavigate } from 'react-router-dom';

function NavBarButton(props) {
    const [isHover, setIsHover] = React.useState(false);
    var navigator = useNavigate();

    function updateHover() {
        setIsHover(!isHover);
    }

    function redirect() {
        if (props.text === "Search") {
            navigator("/disclaimer");
        } else {
            const url = `/${props.text.toLowerCase()}`;
            navigator(url);
        }

    }

    return (
        <Button sx={isHover === true ? btnHover : btnNotHover} onMouseOver={updateHover} onMouseOut={updateHover} onClick={redirect}>
            {props.text}
        </Button>
    )
}

export default NavBarButton;