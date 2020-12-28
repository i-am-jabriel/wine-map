import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player/lazy";
import { corktaint } from "../Helper";

export default function MediaPlayer(props){
    const [playing, setPlaying] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [url, setUrl] = useState(null);
    const ref = useRef();
    useEffect(()=>{
        setPlaying(props.active);
        if(props.active){
            corktaint.startSong=song=>setUrl(song);
            corktaint.seek=n=>ref.current.seekTo(n);
        }
    },[props.active]);
    useEffect(()=>{
       setPlaying(corktaint.player.playing);
       corktaint.player.refresh=()=>setRefresh(!refresh);
    },[refresh]);
    useEffect(()=>{
        corktaint.refresh();
    },[playing]);
    const song = url || props.content;
    const play = playing && !song.match(/soundcloud/);
    return <div className='media-content-wrapper' onClick={props.openPlayer}>
        <ReactPlayer ref={ref} url={song} className={`${playing?'active ':''}post-media-content`} volume={0} playing={play}/>
    </div>
}