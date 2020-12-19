import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Comment, corktaint, Post } from '../Helper';
import './SinglePost.css';

export default function SinglePost(props){
    const { id, commentid } = useParams();
    const [post, setPost] = useState(null);

    const loadPost = id => Promise.all([Post.get(id)]).then(p=>setPost(p[0]))

    useEffect(()=>console.log(post),[post]);
    useEffect(()=>{
        if(!id && !commentid)return;
        if(id) loadPost(id);
        else Promise.all([Comment.get(commentid)])
            .then(c=>{
                corktaint.scrollTo=c[0];
                loadPost(c[0])
            })
    },[id, commentid])

    return <div className='home main-container open-container col'>
        {post ? post.render():<></>}
    </div>
}