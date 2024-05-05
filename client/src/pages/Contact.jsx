import React from "react";
import "./Contact.css"
import { Panel, Row, Col } from "rsuite";

function Contact() {

    return (

        <Row id="contactLayout">
            <Col sm={10} md={10} lg={10}>
                <Panel className="panel" header="Leven Cai" bordered={true}>
                    <p className="bio">
                    I'm a current student in the Master of Computer and Information Technology program at University of Pennsylvania. I used to teach math and 
                    biology to middle school students in Brooklyn, followed by teaching biology to high school students in Manhattan. When I taught my former 
                    8th graders, I realized that it would be very helpful for families and students to have a central place to compare school's academic 
                    performances. Now that I've learned a few things about programming, I thought it would be nice to put those skills into practice. Thus, this 
                    website was born. Hope you enjoy using it!
                    Email: 208cai5099@gmail.com
                    </p>
                </Panel>
            </Col>

            <Col sm={10} md={10} lg={10}>
                <Panel className="panel" header="Katrina Shih" bordered={true}>
                    <p className="body">
                    Coming soon!
                    </p>
                </Panel>
            </Col>

        </Row>

  
    )
    

}

export default Contact;