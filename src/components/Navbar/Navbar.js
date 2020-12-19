import { useState } from 'react';
import NavbarModal from '../NavbarModal/NavbarModal';
import {ChatTwoTone, ExpandMore, NoteAddTwoTone, NotificationsTwoTone, WhatshotTwoTone, ScoreTwoTone, MenuBookTwoTone, MapTwoTone} from '@material-ui/icons';
import './Navbar.css';
import { Avatar, Tooltip } from '@material-ui/core';
import { corktaint } from '../Helper';
import { Link } from 'react-scroll';
import { NavLink, Link as RouteLink } from 'react-router-dom';
import {newPost} from '../Home/Home';


export default props => {
    const {view, setView} = props;
    const [navbarModal, setNavbarModal] = useState(false);
    const [close, setClose] = useState(false);
    const newPost=()=>navbarModal=='newPost'?setClose(true):setNavbarModal('newPost');
    const messenger=()=>navbarModal=='messenger'?setClose(true):setNavbarModal('messenger');
    const notifications=()=>navbarModal=='notifications'?setClose(true):setNavbarModal('notifications');
    const account=()=>navbarModal=='account'?setClose(true):setNavbarModal('account');
    return (
        <div className='navbar row'>
            <div className='nav-left'><span className='logo'>CorkTaint</span></div>
            <div className='nav-middle navbar-nav row'>
                <Tooltip title='Wine Map'><NavLink to='/map'><MapTwoTone className={view=='Wine Map'?'active':''}/></NavLink></Tooltip>
                <Tooltip title='Discover'><NavLink exact to='/'><WhatshotTwoTone className={view=='Discover'?'active':''}/></NavLink></Tooltip>
                <Tooltip title='Reviews'><NavLink to='/reviews'><MenuBookTwoTone className={view=='Reviews'?'active':''}/></NavLink></Tooltip>
                <Tooltip title='Leaderboard'><NavLink to='/leaderboard'><ScoreTwoTone className={view=='Leaderboard'?'active':''}/></NavLink></Tooltip>
            </div>
            <div className='nav-right navbar-nav row'>
                {corktaint.user?
                <Tooltip title={corktaint.user.name}><RouteLink to={`/user/${corktaint.user.id}`}>{corktaint.user.avatar}</RouteLink></Tooltip>:null}
                <Tooltip title='New Post'><a onClick={newPost}><NoteAddTwoTone/></a></Tooltip>
                <Tooltip title='Send DM'><a  onClick={messenger}><ChatTwoTone className='open-messages-button'/></a></Tooltip>
                <Tooltip title='Notifications'><a onClick={notifications}><NotificationsTwoTone/></a></Tooltip>
                <Tooltip title='Account'><a onClick={account}><ExpandMore/></a></Tooltip>
            </div>
            {navbarModal?<NavbarModal type={navbarModal} close={close} onClose={()=>{setNavbarModal(false);setClose(false)}}/>:null}
        </div>
    )
}