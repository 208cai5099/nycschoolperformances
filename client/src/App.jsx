import './App.css';
import Welcome from './pages/Welcome';
import NavBar from './components/NavBar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Contact from './pages/Contact';
import Methods from './pages/Methods'
import Search from './pages/Search'
import Disclaimer from './pages/Disclaimer';

function App() {

  return (
    <div>
      
      <Router>
        <div>
          <NavBar />
        </div>
        <Routes>
          <Route path="/" element={<Welcome />}></Route>
          <Route path="/home" element={<Welcome />}></Route>
          <Route path="/search" element={<Search />}></Route>
          <Route path="/methods" element={<Methods />}></Route>
          <Route path="/contact" element={<Contact />}></Route>
          <Route path="/disclaimer" element={<Disclaimer />}></Route>
        </Routes>
      </Router>
    </div>


  )

}

export default App;
