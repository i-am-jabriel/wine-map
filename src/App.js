import logo from './logo.svg';
import './App.css';
import {Switch, Route, BrowserRouter as Router} from 'react-router-dom';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Navbar from './components/Navbar/Navbar';
import Modal from './components/Modal/Modal';
import { useState } from 'react';
import {corktaint} from './components/Helper';


function App() {
    const [user,setUser] = useState(null);
    const [modal, setModal] = useState(null);
    corktaint.openModal=n=>setModal(n);
  return !user?<Login setUser={setUser}/>:
        <div className="App col">
            <Router>
            <Navbar/>
            <Home/>
            {!modal?null:<Modal type={modal}/>}
            </Router>
        </div>
}

export default App;