import * as React from 'react';
import "./Welcome.css";

function Welcome() {

  return (

    <div>
      <div className="title">

        <h1>Welcome!</h1>

        <p>This website is designed to provide information about the performances of NYC schools on the NYS Regents exams. </p>
        
        <p>Click <span className="highlight">Explore</span> to get started.</p>

      </div>

      <img 
        src = "https://cdn.pixabay.com/photo/2020/10/04/04/41/school-5625219_1280.png" 
        alt='school'
        className="school"
      />

      <footer className="footer">Made with ❤️ in NYC</footer>


    </div>

    

  );
}

export default Welcome;
