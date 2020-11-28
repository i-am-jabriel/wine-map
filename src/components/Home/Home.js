import {Fab} from "@material-ui/core";
import { Edit, Add } from "@material-ui/icons"
import { useEffect, useState } from "react";
import { Post, User, api } from "../Helper";
import Reply from '../Reply/Reply';
import {useSpring, animated, config} from 'react-spring'




const home = {name:'Home',postMode:true};
export default props=>{
    if(!window.corktaint)window.corktaint={
        refresh:()=>{
            window.corktaint.setPage(Post.render(window.corktaint.user,window.corktaint.posts));
            console.log('refreshing');
        },
        reply:null
    };
    const button1 ={
        to:{bottom:150,left:60,opacity:1},
        from:{bottom:60,left:0,opacity:0},
        config:{duration:5000},
        onStart:()=>console.log('starting animation'),
        onRest:()=>console.log('animation finished')
    }
    const [newPostButton, setNewPostButton] = useSpring(()=>({bottom:60,left:0,opacity:0}));
    const [users, setUsers] = useState([]);
    const [user, setUser]  = useState(null)
    const [moreButtons, setMoreButtons] = useState(false);
    let [posts, setPosts] = useState([]);
    let [page, setPage] = useState(<></>);
    useEffect(()=>{
        fetch(`${api}/users`)
        .then(r=>r.json())
        .then(r=>User.from(r))
        .then(r=>{
            setUsers(r)
            setUser(r[0]);
            return true;
        })
        .then(r=>fetch(`${api}/user/1/feed`))
        .then(r=>r.json())
        .then(r=>Post.from(r))
    },[]);
    Object.assign(window.corktaint,{posts,setPage, setPosts, user, users});
    
    const showButtons = () =>{
        setMoreButtons(true);
        setNewPostButton(button1.to);
    }
    const hideButtons = () => {
        setMoreButtons(false);
        setNewPostButton(button1.from);
    }
    console.log('about to render papge');
    return (
        <div className='home main-container col'>
            { window.corktaint.reply==home ? <div className='reply-wrapper'><Reply/></div>:
                <div className='main-button-hover' onMouseLeave={hideButtons}><div className='main-button'>
                    <Fab color="primary" aria-label="add" onClick={showButtons} onMouseEnter={showButtons}>
                        <Add />
                    </Fab>
                    {moreButtons ? ' ':'.'}
                    {/* {moreButtons? */}
                        <animated.div className={`hover-button ${moreButtons?'':'disabled'}`} style={newPostButton}><Fab color='secondary' onClick={()=>{
                            window.corktaint.reply=home;
                            window.corktaint.refresh();
                        }} ><Edit/></Fab></animated.div>
                        {/* :null} */}
                </div></div>
             }
           { page }
        </div>
    )
}