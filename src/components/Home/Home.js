import {Fab, Tooltip} from "@material-ui/core";
import { Edit, Add, Image, Map } from "@material-ui/icons"
import { useEffect, useState } from "react";
import { Post, User, api, corktaint } from "../Helper";
import Reply from '../Reply/Reply';
import {useSpring, animated, config} from 'react-spring'




const home = {name:'Home',isPost:true};
export default function Home(props){
    const button ={
        length:120,
        to:{bottom:0,left:150,opacity:1},
        from:{bottom:60,left:0,opacity:0,pointerEvents:'none'},
        config:{duration:5000},
        count:4,
        getTo:function(i){
            return {
                opacity:1,
                left:this.length * Math.cos(Math.PI * i / this.count),
                bottom:this.length * Math.sin(Math.PI * i / this.count) + 60,
                pointerEvents:'all'
            }
        }
    }
    const [newPostButton, setNewPostButton] = useSpring(()=>button.from);
    const [newImageButton, setNewImageButton] = useSpring(()=>button.from);
    const [newMapButton, setNewMapButton] = useSpring(()=>button.from);
    const [moreButtons, setMoreButtons] = useState(false);
    let [posts, setPosts] = useState([]);
    let [page, setPage] = useState(<></>);
    useEffect(()=>{
        // fetch(`${api}/users`)
        // .then(r=>r.json())
        // .then(r=>User.from(r))
        // .then(r=>{
        //     setUsers(r)
        //     setUser(r[0]);
        //     return true;
        // })
        // .then(r=>
        fetch(`${api}/user/1/feed`)
        .then(r=>r.json())
        .then(r=>Post.from(r))
    },[]);
    Object.assign(corktaint,{posts,setPage, setPosts});
    
    const showButtons = () =>{
        setMoreButtons(true);
        setNewPostButton(button.getTo(2));
        setNewImageButton(button.getTo(1));
        setNewMapButton(button.getTo(3));
    }
    const hideButtons = () => {
        setMoreButtons(false);
        setNewPostButton(button.from);
        setNewImageButton(button.from);
        setNewMapButton(button.from);
    }
    console.log('about to render page');
    const showPost = () =>{
        corktaint.reply=home;
        corktaint.refresh();
    }
    return (
        <div className='home main-container col'>
            { corktaint.reply==home ? <div className='reply-wrapper'><Reply/></div>:
                <div className='main-button-hover' onMouseLeave={hideButtons}><div className='main-button'>
                    <Fab color="primary" aria-label="add" onClick={moreButtons?showPost:showButtons} onMouseEnter={showButtons}>
                        <Add />
                    </Fab>
                    {moreButtons ? ' ':'.'}
                    {/* {moreButtons? */}
                        <Tooltip title='New Post' placement='top'><animated.div className={`hover-button ${moreButtons?'':'disabled'}`} style={newPostButton}><Fab color='secondary' onClick={showPost} ><Edit/></Fab></animated.div></Tooltip>
                        <Tooltip title='Upload Gallery' placement='top'><animated.div className={`hover-button ${moreButtons?'':'disabled'}`} style={newImageButton}><Fab color='secondary' onClick={showPost} ><Image/></Fab></animated.div></Tooltip>
                        <Tooltip title='Submit Review' placement='top'><animated.div className={`hover-button ${moreButtons?'':'disabled'}`} style={newMapButton}><Fab color='secondary' onClick={showPost} ><Map/></Fab></animated.div></Tooltip>
                        {/* :null} */}
                </div></div>
             }
           { page }
        </div>
    )
}