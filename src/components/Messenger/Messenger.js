import { useEffect, useState } from "react";
import { useSpring, animated } from "react-spring";
import {PostAdd} from '@material-ui/icons';
import { corktaint } from "../Helper";
import './Messenger.css';

const messenger = {name:'messenger'}
export default function Messenger(props){
    const [anim, setAnim] = useSpring(()=>({bottom:'100%'}));
    const [reply, setReply] = useState(null);
    const close = ()=> {
        setAnim({bottom:'100%'});
        window.setTimeout(()=>props.onClose(),500);
    }
    useEffect(()=>setAnim({bottom:'10%'}),[])
    return <animated.div className='messenger-container col' style={anim}>
        {props.close?close():null}
        <div className='messenger-header row' onClick={close}>
            <h1>Messenger</h1><PostAdd className='new-message-button' onClick={()=>{setReply(corktaint.reply=messenger)}} />

        </div>
    </animated.div>
}