import './App.css';
import {BrowserRouter as Router} from 'react-router-dom';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Navbar from './components/Navbar/Navbar';
import Modal from './components/Modal/Modal';
import { useEffect, useState } from 'react';
import {corktaint} from './components/Helper';
import CurrentlyPlaying from './components/CurrentlyPlaying/CurrentlyPlaying';


function App() {
    const [user,setUser] = useState(null);
    const [modal, setModal] = useState(null);
    const [player, setPlayer] = useState(null);

    useEffect(()=>{
        corktaint.openModal=n=>setModal(n);
        corktaint.openPlayer=content=>{
            content.setActive();
            setPlayer(content.content);
            corktaint.refresh();
        }
    },[]);
  return !user?<Login setUser={setUser}/>:
        <div className="App col">
            <Router>
            <Navbar/>
            <Home/>
            {modal && <Modal type={modal}/>}
            </Router>
            {player && <CurrentlyPlaying player={player}/>}
        </div>
}

export default App;