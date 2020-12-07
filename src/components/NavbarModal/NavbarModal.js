import { useEffect, useState } from "react";
import { useSpring, animated } from "react-spring";
import { corktaint } from "../Helper";
import NewPost from "./NewPost";
import Account from './Account';
import './NavbarModal.css';

export default function NavbarModal(props){
    const close = ()=> {
        setAnim({bottom:'100%'});
        window.setTimeout(()=>props.onClose(),500);
    }
    const [anim, setAnim] = useSpring(()=>({bottom:'100%'}));
    
    const types ={
        messenger:{name:'Messenger',bottom:'10%'},
        notifications:{name:'Notifications',bottom:'40%'},
        account:{name:'Account',bottom:'40%',src:<Account/>},
        newPost:{name:'Create Post',bottom:'40%',src:<NewPost close={close}/>},
    }
    const obj = types[props.type];
    useEffect(()=>setAnim({bottom:obj.bottom}),[props.type])
    return <animated.div className='navbar-modal-container col' style={anim}>
        {props.close?close():null}
        <div className='navbar-modal-header row' onClick={close}>
            <h1>{obj.name}</h1>
        </div>
        {!obj.src?null:obj.src}
    </animated.div>
}