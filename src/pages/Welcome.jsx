import * as React from 'react';
import './Welcome.css'
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';

function NavBar() {

  const pages = ["Home", "Search", "Methods", "Quick Stats", "Contact"]

  return (

    <div className="navbar">
      <AppBar>
        {pages.map((page) => {
          return(
            <div className="btn">
            <Button>
              {page}
            </Button>
            </div>
          )
        })}
      </AppBar>
    </div>

  );
}

export default NavBar;
