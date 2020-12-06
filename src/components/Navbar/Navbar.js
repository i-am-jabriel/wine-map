import { useState } from 'react';
import NavbarModal from '../NavbarModal/NavbarModal';
import {MmsTwoTone, ExpandMore, NoteAddTwoTone, NotificationsTwoTone, WhatshotTwoTone, ScoreTwoTone, MenuBookTwoTone, MapTwoTone} from '@material-ui/icons';
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
    return (
        <div className='navbar row'>
            <div className='nav-left'><span className='logo'>CorkTaint</span></div>
            <div className='nav-middle row'>
                <Tooltip title='Wine Map'><NavLink to='/map'><MapTwoTone className={view=='Wine Map'?'active':''}/></NavLink></Tooltip>
                <Tooltip title='Discover'><NavLink exact to='/'><WhatshotTwoTone className={view=='Discover'?'active':''}/></NavLink></Tooltip>
                <Tooltip title='Reviews'><NavLink to='/reviews'><MenuBookTwoTone className={view=='Reviews'?'active':''}/></NavLink></Tooltip>
                <Tooltip title='Leaderboard'><NavLink to='/leaderboard'><ScoreTwoTone className={view=='Leaderboard'?'active':''}/></NavLink></Tooltip>
            </div>
            <div className='nav-right row'>
                {corktaint.user?
                <Tooltip title={corktaint.user.name}><RouteLink to={`/user/${corktaint.user.id}`}><Avatar>{corktaint.user.name[0]}</Avatar></RouteLink></Tooltip>:null}
                <Tooltip title='New Post'><Link to='New Post' smooth={true} onClick={newPost}><NoteAddTwoTone/></Link></Tooltip>
                <Tooltip title='Send DM'><a><MmsTwoTone className='open-messages-button' onClick={()=>navbarModal=='messenger'?setClose(true):setNavbarModal('messenger')}/></a></Tooltip>
                <Tooltip title='Notifications'><a><NotificationsTwoTone onClick={()=>navbarModal=='notification'?setClose(true):setNavbarModal('notification')}/></a></Tooltip>
                <Tooltip title='Account'><a><ExpandMore/></a></Tooltip>
            </div>
            {navbarModal?<NavbarModal type={navbarModal} close={close} onClose={()=>{setNavbarModal(false);setClose(false)}}/>:null}
        </div>
    )
}