import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player/lazy";
import { corktaint } from "../Helper";

export default function MediaPlayer(props){
    const track = ['playing','muted','seek','loop'].map(t=>corktaint.player[t]);
    const [playing, setPlaying] = useState(true);
    const [muted, setMuted] = useState(false);
    const [loop, setLoop] = useState(false);
    const [refresh, setRefresh] = useState(false);
    useEffect(()=>{
        corktaint.player.refresh=()=>setRefresh(!refresh);
    },[props.active]);
    const ref = useRef();
    useEffect(()=>{
       if(playing!=corktaint.player.playing)setPlaying(corktaint.player.playing);
       if(muted!=corktaint.player.muted)setMuted(corktaint.player.muted);
       if(loop!=corktaint.player.loop)setLoop(corktaint.player.loop);
    },[refresh])
    return <div className='media-content-wrapper' onClick={props.openPlayer}>
        {!props.active?<ReactPlayer url={props.content} className={`post-media-content media-${props.type}`}/>:
        <ReactPlayer ref={ref} url={props.content} className={`active post-media-content media-${props.type}`} volume={0} muted={muted} playing={playing} loop={loop}/>
        } 
    </div>
}