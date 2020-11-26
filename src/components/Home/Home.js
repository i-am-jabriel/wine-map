import { useEffect, useState } from "react";
import { Post, User } from "../Helper";



export default props=>{
    const [users, setUsers] = useState([]);
    const [addPost, setAddPost] = useState(false);
    const [posts, setPosts] = useState(Post.posts);
    useEffect(()=>{
        fetch('http://localhost:2999/users')
        .then(r=>r.json())
        .then(r=>setUsers(User.from(r)))
        
        fetch('http://localhost:2999/posts')
        .then(r=>r.json())
        .then(r=>Post.from(r,setPosts))
    },[]);
    // 
    console.log(posts);
    return (
        <div className='home main-container'>
            { addPost ? 
                (
                    <div className='new-post-container col'>
                        <input id='new-post-title' placeholder='Title' />
                        <textarea id='new-post-body' placeholder='Share something!'/>
                        <button onClick={()=>{
                            let post = Post.createPostFrom(document.getElementById('new-post-title').value,document.getElementById('new-post-body').value);
                            setPosts(posts.concat([post]));
                        }
                        }>Submit</button>
                    </div>
                    ):
                    <button onClick={()=>setAddPost(true)}>Add Post</button>
             }
           
            { Post.render(posts) }
        </div>
    )
}