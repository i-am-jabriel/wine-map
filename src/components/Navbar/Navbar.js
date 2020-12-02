import { useState } from 'react';
import Messenger from '../Messenger/Messenger';
import {Message, ExpandMore, Add, Notifications} from '@material-ui/icons';
import './Navbar.css';
import { Avatar, Tooltip } from '@material-ui/core';
import { corktaint } from '../Helper';
export default props => {
    const [messenger, setMessenger] = useState(false);
    const [close, setClose] = useState(false);
    return (
        <div className='navbar row'>
            <span className='logo'>CorkTaint</span>
            <div className='nav-right row'>
                {corktaint.user?<Tooltip title={corktaint.user.name}><Avatar>{corktaint.user.name[0]}</Avatar></Tooltip>:null}
                <Tooltip title='New Post'><Add/></Tooltip>
                <Tooltip title='Send DM'><Message className='open-messages-button' onClick={()=>messenger?setClose(true):setMessenger(true)}/></Tooltip>
                <Tooltip title='Notifications'><Notifications/></Tooltip>
                <Tooltip title='Account'><ExpandMore/></Tooltip>
            </div>
            {messenger?<Messenger close={close} onClose={()=>{setMessenger(false);setClose(false)}}/>:null}
        </div>
    )
}