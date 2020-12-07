import { useEffect, useState } from "react";
import { useSpring, animated } from "react-spring";
import {PostAdd} from '@material-ui/icons';
import { corktaint } from "../Helper";
import Account from './Account';
import './NavbarModal.css';

const types ={
    messenger:{name:'Messenger',bottom:'10%'},
    notifications:{name:'Notifications',bottom:'40%'},
    account:{name:'Account',bottom:'40%',src:<Account/>},
    newPost:{name:'Create Post',bottom:'40%'},
}
export default function NavbarModal(props){
    const obj = types[props.type];
    const [anim, setAnim] = useSpring(()=>({bottom:'100%'}));
    const [reply, setReply] = useState(null);
    const close = ()=> {
        setAnim({bottom:'100%'});
        window.setTimeout(()=>props.onClose(),500);
    }
    useEffect(()=>setAnim({bottom:obj.bottom}),[props.type])
    return <animated.div className='navbar-modal-container col' style={anim}>
        {props.close?close():null}
        <div className='navbar-modal-header row' onClick={close}>
            <h1>{obj.name}</h1><PostAdd className='new-message-button' onClick={()=>{setReply(corktaint.reply=obj)}} />
        </div>
        {!obj.src?null:obj.src}
    </animated.div>
}