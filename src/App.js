import logo from './logo.svg';
import './App.css';
import {Switch, Route, BrowserRouter as Router} from 'react-router-dom';
import Home from './components/Home/Home';
import Navbar from './components/Navbar/Navbar';


function App() {
  return (
      <Router>
        <div className="App col">
            <Navbar />
            <Switch>
                <Route path="/about">
                {/* <About /> */}
                </Route>
                <Route path="/users">
                {/* <Users /> */}
                </Route>
                <Route path="/">
                <Home />
                </Route>
            </Switch>
        </div>
      </Router>
  );
}

export default App;
