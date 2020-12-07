import { Avatar } from "@material-ui/core";
import { ExitToApp, Feedback } from "@material-ui/icons";
import { Link } from "react-router-dom";
import { corktaint } from "../Helper";
import Button from './Button';

export default function Account(props){ 
    //const buttons=[[<Feedback/>,'Leave Feedback',()=>{}],[<ExitToApp/>,'Log Out',corktaint.logOut]].map(b=>new Button(...b));
    const buttons=Button.from([[<Feedback/>,'Leave Feedback',()=>{}],[<ExitToApp/>,'Log Out',corktaint.logOut]]);
    return <div className='account-container navbar-modal-content col'>
        <div className='account-row link'>
            <span>
                {corktaint.user.avatar}
            </span>
            <Link to={`/user/${corktaint.user.id}`}>
                <p><h5>{corktaint.user.name}</h5></p>
                <p>See your profile</p>
            </Link>
        </div>
        <hr/>
        {Button.render(buttons,'account-row')}
    </div>
}