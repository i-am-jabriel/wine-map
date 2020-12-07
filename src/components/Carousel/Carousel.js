import { ChevronLeft, ChevronRight } from "@material-ui/icons";
import { useState } from "react"
import {mod} from '../Helper';
import { animated, useSpring } from "react-spring";
import { Divider } from "@material-ui/core";

export default function Carousel(props){
    const [index,setIndex]  = useState(0);
    const [lastIndex, setLastIndex] = useState(0);
    const [currentAnimation, setCurrentAnimation] = useSpring(()=>({}));
    const [lastAnimation, setLastAnimation] = useSpring(()=>({}));
    const changeImageBy = i => setImage(mod(index + i,props.images.length));
    const setImage = i => {
        console.log('setting index to ',i);
        const up = i>index||(i==0 && index+1==props.images.length) || true;
        const dir = [up?'right':'left'];
        setCurrentAnimation({from:Object.assign({left:'0%',right:'0%',},{[dir]:'100%'}),to:{[dir]:'0%'}});
        //setLastAnimation({from:{[dir]:'100%'},to:{[dir]:'100%'}});
        setLastIndex(index);
        setIndex(i);
    }
    return <div className='carousel-container col'>
        {props.images.map((a,i)=><animated.img src={a} key={i} className={i==index?'active':null} style={i!=index?(i!=lastIndex?{}:lastAnimation):currentAnimation}/>)}
        <span className='carousel-dots'>
            {props.images.map((a,i)=><span key={i} className={`link ${i==index?'active':''}`} onClick={()=>setImage(i)}>.</span>)}
        </span>
        <div className='carousel-buttons'>
            <ChevronLeft className='link carousel-button' onClick={()=>changeImageBy(-1)}/>
            <ChevronRight className='link carousel-button' onClick={()=>changeImageBy(1)}/>
        </div>
    </div>
}