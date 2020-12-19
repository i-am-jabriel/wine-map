import { Avatar } from "@material-ui/core";
import { ExitToApp, Feedback } from "@material-ui/icons";
import { Link } from "react-router-dom";
import { corktaint } from "../Helper";
import Button from './Button';

export default function Account(props){ 
    //const buttons=[[<Feedback/>,'Leave Feedback',()=>{}],[<ExitToApp/>,'Log Out',corktaint.logOut]].map(b=>new Button(...b));
    const buttons=Button.from([[<Feedback/>,'Leave Feedback',()=>{}],[<ExitToApp/>,'Log Out',corktaint.logOut]]);
    return <div className='account-container navbar-modal-content col'>
        <Link to={`/user/${corktaint.user.id}`} className='link wide navbar-modal-user-profile'>
        <div className='account-row'>
            <span>
                {corktaint.user.avatar}
            </span>
                <p><h5>{corktaint.user.name}</h5></p>
                <p>See your profile</p>
        </div>
            </Link>
        <hr/>
        {Button.render(buttons,'account-row')}
    </div>
}