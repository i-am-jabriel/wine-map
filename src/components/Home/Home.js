import {Fab} from "@material-ui/core";
import { Edit } from "@material-ui/icons"
import { useEffect, useState } from "react";
import { Post, User } from "../Helper";



export default props=>{
    if(!window.corktaint)window.corktaint={
        refresh:()=>{
            window.corktaint.setPage(Post.render(window.corktaint.user,window.corktaint.posts));
            console.log('refreshing');
        },
        reply:null
    };
    const [users, setUsers] = useState([]);
    const [user, setUser]  = useState(null)
    const [addPost, setAddPost] = useState(false);
    let [posts, setPosts] = useState([]);
    let [page, setPage] = useState(<></>);
    useEffect(()=>{
        fetch('http://localhost:2999/users')
        .then(r=>r.json())
        .then(r=>User.from(r))
        .then(r=>{
            setUsers(r)
            setUser(r[0]);
            return true;
        })
        .then(r=>fetch('http://localhost:2999/posts'))
        .then(r=>r.json())
        .then(r=>Post.from(r))
    },[]);
    Object.assign(window.corktaint,{posts,setPage, setPosts, user, users});
    
    // 
    console.log('about to render papge');
    return (
        <div className='home main-container col'>
            { addPost ? 
                (
                    <div className='new-post-container col'>
                        <input id='new-post-title' placeholder='Title' />
                        <textarea id='new-post-body' placeholder='Share something!'/>
                        
                        <button onClick={()=>{
                            let post = Post.createPostFrom(document.getElementById('new-post-title').value,document.getElementById('new-post-body').value);
                            setPosts(posts.concat([post]));
                        }}>Submit</button>
                    </div>
                    ):
                    <div className='row'>
                        <Fab color="secondary" aria-label="edit" onClick={(()=>setAddPost(true))}>
                            <Edit />
                        </Fab>
                    </div>
             }
           { page }
            {/* { users.length ? Post.render(users[0],posts):null} */}
        </div>
    )
}