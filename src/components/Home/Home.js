import WineMap from '../WineMap/WineMap';
import {corktaint } from "../Helper";
import {Switch, Route} from 'react-router-dom';
import Leaderboard from "../Leaderboard/Leaderboard";
import SingleUser from "../SingleUser/SingleUser";
import SinglePost from "../SinglePost/SinglePost";
import Discover from "./Discover";
import socket from 'socket.io-client';

export default function Home(props){
    return (
        <div className='home main-container open-container col' name='New Post'>
            <Switch>
                <Route exact path='/'><Discover/></Route>
                <Route path='/user/:id'><SingleUser/></Route>
                <Route path='/map'> <WineMap/> </Route>
                <Route path='/leaderboard'><Leaderboard/></Route>
                <Route path='/post/:id'><SinglePost/></Route>
                <Route path='/comment/:commentid'><SinglePost/></Route>
            </Switch>
        </div>
    )
}