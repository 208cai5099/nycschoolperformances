import './App.css';
import Welcome from './pages/Welcome';
import NavigationBar from './components/NavBar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Contact from './pages/Contact';
import Methods from './pages/Methods'
import Explore from './pages/Explore'
import Disclaimer from './pages/Disclaimer';
import SchoolSpecific from './pages/SchoolSpecific';
import Citywide from './pages/Citywide'

import 'rsuite/dist/rsuite-no-reset.min.css';

function App() {

  return (
    <div>
      
      <Router>
        <div>
          <NavigationBar />
        </div>
        <Routes>
          <Route path="/" element={<Welcome />}></Route>
          <Route path="/home" element={<Welcome />}></Route>
          <Route path="/school-specific" element={<SchoolSpecific />}></Route>
          <Route path="/methods" element={<Methods />}></Route>
          <Route path="/contact" element={<Contact />}></Route>
          <Route path="/disclaimer" element={<Disclaimer />}></Route>
          <Route path="/explore" element={<Explore />}></Route>
          <Route path="/citywide" element={<Citywide />}></Route>

        </Routes>
      </Router>
    </div>


  )

}

export default App;
