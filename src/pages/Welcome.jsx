import * as React from 'react';
import { title, school, highlight, footer } from "./Welcome-Styling.js";

function Welcome() {

  return (

    <div style={title}>
      <h1>Welcome!</h1>

      <p>This website is designed to provide information about the performances of NYC schools on the annual NYS Regents exams. </p>
      <p>Click <span style={highlight}>Search</span> to get started.</p>
      <img src = "https://cdn.pixabay.com/photo/2020/10/04/04/41/school-5625219_1280.png" alt='school' style={school}/>

      <footer style={footer}>Made with ❤️ in NYC</footer>

    </div>

    

  );
}

export default Welcome;
