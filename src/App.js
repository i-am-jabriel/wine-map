import logo from './logo.svg';
import './App.css';
import {Switch, Route, BrowserRouter as Router} from 'react-router-dom';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Navbar from './components/Navbar/Navbar';
import SingleUser from './components/SingleUser/SingleUser';
import { useState } from 'react';


function App() {
    const [user,setUser] = useState(null);
  return !user?<Login setUser={setUser}/>:
           <Router>
        <div className="App col">
            <Navbar />
            <Switch>
                <Route path="/about">
                {/* <About /> */}
                </Route>
                <Route path="/user/:id" children={<SingleUser/>}>
                </Route>
                <Route path="/">
                <Home />
                </Route>
            </Switch>
        </div>
        </Router>
}

export default App;