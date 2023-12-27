import React from "react";
import { heading, manPic, womanPic, manCard, womanCard, grid, layout } from "./Contact-Styling.js";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';


function Contact() {

    return (
        <div style={layout}>
            <h1 style={heading}>Who are We?</h1>

            <div style={grid}>

                <img style={manPic} src="https://cdn.pixabay.com/photo/2014/04/02/14/11/male-306408_1280.png" alt="man"/>

                <img style={womanPic} src="https://cdn.pixabay.com/photo/2014/04/02/17/07/user-307993_1280.png" alt="woman"/>


                <Card sx={manCard}>
                    <CardContent>
                        <Typography>
                            I'm a current student in the Master of Computer and Information Technology program at University of Pennsylvania. I used to teach math and 
                            biology to middle school students in Brooklyn, followed by teaching biology to high school students in Manhattan. When I taught my former 
                            8th graders, I realized that it would be very helpful for families and students to have a central place to compare school's academic 
                            performances. Now that I've learned a few things about programming, I thought it would be nice to put those skills into practice. Thus, this 
                            website was born. Hope you enjoy using it!                    
                        </Typography>
                    </CardContent>

                </Card>     

                <Card sx={womanCard}>
                    <CardContent>
                        <Typography>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                
                        </Typography>
                    </CardContent>

                </Card>     
            </div>
        </div>
  
    )
    

}

export default Contact;