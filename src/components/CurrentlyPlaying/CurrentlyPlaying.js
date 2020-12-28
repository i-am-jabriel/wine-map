import { Tooltip } from '@material-ui/core';
import { AssignmentReturnedSharp, LiveTvRounded, Loop, PauseCircleOutline, PlayCircleOutline, Shuffle, SkipNext, SkipPrevious, VolumeMuteOutlined, VolumeUpOutlined } from '@material-ui/icons';
import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player/lazy';
import { Range } from 'react-range';
import { animated, useSpring } from 'react-spring';
import { corktaint } from '../Helper';
import './CurrentlyPlaying.css';
export default function CurrentlyPlaying(props) {
    const [playing, setPlaying] = useState(true);
    const [looping, setLooping] = useState(false);
    const [volume, setVolume] = useState(.5);
    const [muted, setMuted] = useState(false);
    const [seek, setSeek] = useState(0);
    const [player, setPlayer] = useState({})
    const ref = useRef();
    const update = e => {
        //const _player = ref.current.getInternalPlayer();
        switch(e.target.dataset?.type){
            case 'Play': case 'Pause':
                setPlaying(!playing);
                break;
            case 'Loop':
                setLooping(!looping);
                break;
            case 'Shuffle':
                setShuffle(!shuffle);
                player?.setShuffle(!shuffle);
                break;
            case 'Next':
                player?.nextVideo();
                break;
            case 'Previous':
                player?.previousVideo();
                break;
            case 'Mute':  case 'Unmute':
                setMuted(!muted);
                break;
            case 'Volume':
                setVolume(e.target.values[0]);
                break;
            case 'Seek':
                updateSeek(e.target.values[0]);
                break;
        }
    }
    const updateVolume = volume => setVolume(volume);
    useEffect(()=>{
        Object.assign(corktaint.player,{playing,looping,muted,volume});
        corktaint.player.refresh();
    },[props.player,playing,looping,muted,volume])
    useEffect(()=>corktaint.player.togglePause=()=>setPlaying(!playing),[playing])
    useEffect(()=>setShuffle(false),[props.player])

    const buttonImage={
        Play:<PlayCircleOutline/>,
        Pause:<PauseCircleOutline/>,
        Mute:<VolumeMuteOutlined/>,
        Unmute:<VolumeUpOutlined/>,
        Loop:<Loop/>,
        Shuffle:<Shuffle/>,
        Previous:<SkipPrevious/>,
        Next:<SkipNext/>
    }
    const createButton=(type,className='',tooltip)=><div className={`player-input-wrapper link ${className}`}>
        <Tooltip title={tooltip===undefined?type:''}>
            <span data-type={type} onClick={update}>
                {buttonImage[type]}
            </span>
        </Tooltip>
    </div>
    const secondsToTimestamp = seconds => new Date(Math.round(seconds) * 1000).toISOString().substr(11, 8).replace('00:','')
    const onProgress = data =>{
        setPlayedTime(secondsToTimestamp(data.playedSeconds));
        setSeek(data.played);
    }

    const onDuration = duration => setDuration(secondsToTimestamp(duration));

    const fetchSongInfo = _url =>{
        if(title||artist)return;
        const url=_url.replace(/list=.*&/,'');
        console.log(url,_url);
        corktaint.startSong(url);
        fetch(`https://noembed.com/embed?url=${url}`).then(r=>r.json()).then(data=>{
            console.log(data);
            if(!data.author_name)return;
            let artist = data.author_name.replace(' - Topic','').replace('VEVO','');
            let title = data.title.replace(' [Official Audio]','')
            .replace(artist,'')
                .replace(/^[-– ,&]*/,'')
                .replace(/ \[Lyric Video]/i,'')
                .replace(/ \[Official Video]/i,'')
                .replace(/ \(Official Video\)/i,'')
                .replace(/ \(Official Audio\)/i,'')
                .replace(/ \[Official Audio]/i,'')
                .replace(/ \(audio\)/i,'')
                .replace(/ \(Official Music Video\)/i,'')
                .replace(/ \[Official Music Video]/i,'')
                .replace(` by ${artist}`,'');
            if(title.match(/ \- /))[artist, title] = title.split(' - ');
            setTitle(title);        
            setArtist(artist);
            setThumbnail(data.thumbnail_url);
        });
    }
    const shuffleArray = array => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    const onStart = () => {
        setTitle('');
        setArtist('');
        setThumbnail(null);
        const player = ref.current.getInternalPlayer();
        fetchSongInfo(props.player);
        if(!player.mute)return;
        if(player.getVideoUrl().match(/list=/))setPlaylist(true);
        setDuration(secondsToTimestamp(player.getDuration()));   
    }
    const onReady = () => {
        const player = ref.current.getInternalPlayer();
        if(player.mute){
            player.addEventListener('onStateChange',state=>{
                if(state.data==1){
                    setDuration(secondsToTimestamp(player.getDuration()));
                    fetchSongInfo(player.getVideoUrl());
                }
                if(state.data==0){
                    setTitle('');
                    setArtist('');
                    setThumbnail(null);
                }
        });
            setPlayer(player);
        }else{
            const widget = window.SC.Widget(document.querySelector('#main-player>iframe'));
            widget.bind(window.SC.Widget.Events.PLAY,()=>{
                widget.getDuration(duration=>setDuration(secondsToTimestamp(duration/1000)));
                widget.getSounds(sounds=>{
                    setPlaylist(sounds.length>1);
                    widget.songs=sounds;
                })
                widget.getCurrentSound(obj=>{
                    console.log(obj);
                    setTitle(obj.publisher_metadata.release_title||obj.title);
                    setArtist(obj.publisher_metadata.artist);
                    setThumbnail(obj.artwork_url);
                    corktaint.startSong(obj.permalink_url);
                });
                widget.currentSong=-1;
                widget.songOrder=[];
                widget.seek=num=>window.SC.Widget(document.querySelector('#main-player>iframe')).skip(num);
                widget.setShuffle=value=>{
                    if(widget.shuffleMode = value){
                        widget.currentSong=-1;
                        widget.songOrder = shuffleArray(Object.keys(widget.songs).map(a=>Number(a)));
                        console.log(widget.songOrder);
                        //widget.nextVideo();
                    }
                }
                widget.nextVideo=()=>{
                    console.log(widget);
                    if(!widget.shuffleMode) widget.next()
                    else widget.seek(widget.songOrder[++widget.currentSong]);
                    if(widget.shuffleMode)console.log(widget.songOrder[widget.currentSong]);
                }
                widget.previousVideo=()=>{
                    if(!widget.shuffleMode) widget.prev()
                    else widget.seek(widget.songOrder[--widget.currentSong]);
                }
                widget.bind(window.SC.Widget.Events.FINISH,()=>widget.nextVideo())
                setPlayer(widget);
            });
        }

    }


    const updateSeek = value =>{
        ref.current.seekTo(value);
        setSeek(value);
        corktaint.seek(value);
    }
    const volPanel ={
        to:{height:'75px',padding:'5px 2px'},
        from:{height:'0px',padding:'0px 0px'},
    }
    const [volAnimation, setVolAnimation] = useSpring(()=>volPanel.from);
    const showVolume = () => setVolAnimation(volPanel.to);
    const hideVolume = () => setVolAnimation(volPanel.from);

    const [seekActive, setSeekActive] = useState(false);
    const seekHover = () => setSeekActive(true);
    const seekExit = () => setSeekActive(false);

    const [playedTime, setPlayedTime] = useState('00:00');
    const [duration, setDuration] = useState('00:00');

    const [playlist, setPlaylist] = useState(false);

    const [shuffle, setShuffle] = useState(false);
    const [artist, setArtist] = useState('');
    const [title, setTitle] = useState('');
    const [thumbnail, setThumbnail] = useState(null);

    
    return <div className='currently-playing-container row-center'>
        <div className='mini-player' value={playing} onClick={update} data-type='Play'>
            {thumbnail && <img src={thumbnail} alt='Song Thumbnail'/>}
            {<ReactPlayer id='main-player' url={props.player} playing={playing} loop={looping} muted={muted} volume={Math.min(1,Math.pow(volume*1.2,2.8)+(.5-volume)*.02)} ref={ref} onProgress={onProgress} onDuration={onDuration} onReady={onReady} onStart={onStart}/>}
        </div>
        <h5 className='mini-player-title'>
            <p>{artist}</p>
            <p>{title}</p>
        </h5>
        <div className='col seek-input-container'>
            <h3 className='played-time'>{playedTime} / {duration}</h3>
            <Range step={0.01} min={0} max={1} data-type='seek' values={[seek]} onChange={updateSeek}
                renderTrack={({ props, children }) => <div className={`input-track seek-track ${seekActive?'active':''}`} {...props} style={{...props.style}} onMouseEnter={seekHover} onMouseLeave={seekExit}>
                    <div className={`filled-track input-track seek-track ${seekActive?'active':''}`} {...props} style={{...props.style,width: `${seek*100}%`}}/>
                    {children}</div>}
                renderThumb={({ props }) => <div className='input-thumb seek-thumb' {...props} style={{...props.style}}/>}
            />
            <div className='row player-input-container'>
                {playlist && createButton('Previous')}
                {createButton('Loop',looping&&'active'||'')}
                {playlist && createButton('Shuffle', shuffle&&'active'||'')}
                {createButton(!playing?'Play':'Pause')}
                <div className='mute-control-container row' onMouseEnter={showVolume} onMouseLeave={hideVolume}>
                    <animated.div className='volume-control-container col' style={volAnimation}>
                        <Range step={0.01} min={0} max={1} data-type='volume' values={[volume]} onChange={updateVolume} direction='to top'
                            renderTrack={({ props, children }) => <div className='input-track volume-track ' {...props} style={{...props.style}}>
                                <div className='input-track volume-track filled-track' {...props} style={{...props.style,height: `${volume*100}%`}}/>
                                {children}</div>}
                            renderThumb={({ props }) => <div className='input-thumb volume-thumb' {...props} style={{...props.style}}/>}
                        />
                    </animated.div>
                    {createButton(muted?'Mute':'Unmute','',false)}
                </div>
                {playlist && createButton('Next')}
            </div>
        </div>
    </div>
}