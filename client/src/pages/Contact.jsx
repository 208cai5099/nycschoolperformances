import React from "react";
import "./Contact.css"
import { Panel, Col} from "rsuite";

function Contact() {

    return (


            <Col id="panelLayout">
                <Panel className="bioPanel" bordered={true}>

                    <h3>Zhuo Biao (Leven) Cai</h3>
                    <p>
                    I'm a former math and science teacher. I started my teaching career by teaching 6th and 8th graders in Brooklyn, followed by 
                    teaching high schoolers in Manhattan. When I was teaching, I realized that it would be very helpful for families and 
                    students to have a tool to compare different schools' academic performances. Recently, I've been learning some web development skills. I thought 
                    it would be nice to put those skills into practice. Thus, this website was born. Hope you enjoy using it! <br />

                    <p></p>

                    Email: 208cai5099@gmail.com
                    </p>
                </Panel>

                <Panel className="bioPanel" bordered={true}>
                    <h3>Katrina Shih</h3>

                    <p>
                    Coming soon!
                    </p>
                </Panel>

            </Col>


  
    )
    

}

export default Contact;