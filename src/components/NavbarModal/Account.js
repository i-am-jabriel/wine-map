import { Avatar } from "@material-ui/core";
import { ExitToApp, Feedback } from "@material-ui/icons";
import { Link } from "react-router-dom";
import { corktaint } from "../Helper";

export default function Account(props){
    class Button{
        constructor(icon,text,onClick){
            Object.assign(this,{icon,text,onClick});
        }
    }
    const buttons=[[<Feedback/>,'Leave Feedback',()=>{}],[<ExitToApp/>,'Log Out',corktaint.logOut]].map(b=>new Button(...b));
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
        {buttons.map(b=><div className='account-row row link' key={b.text} onClick={b.onClick}>
            {b.icon} {b.text}
        </div>)}
    </div>
}