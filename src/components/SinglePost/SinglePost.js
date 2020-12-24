import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Comment, corktaint, Post } from '../Helper';
import Scroll from 'react-scroll';
import './SinglePost.css';

export default function SinglePost(props){
    const { id, commentid } = useParams();
    const [post, setPost] = useState(null);
    const [page, setPage] = useState(<></>);
    Object.assign(corktaint,{setPage});

    const loadPost = id => Promise.all([Post.get(id)]).then(p=>setPost(p[0]));

    useEffect(()=>{
        if(corktaint.scrollTo){
            Scroll.scroller.scrollTo('scroll', {
                delay: 100,
                smooth: true,
                offset: -50, // Scrolls to element + 50 pixels down the page
            })
            corktaint.scrollTo=null;
        }
        if(post){
            corktaint.posts=[post];
            corktaint.refresh();
        }
    },[post]);
    useEffect(()=>{
        if(!id && !commentid)return;
        if(id) loadPost(id);
        else Promise.all([Comment.get(commentid)])
            .then(c=>{
                const comment = c[0];
                corktaint.scrollTo=comment.id;
                Promise.all([comment.parentPost()]).then(parent=>setPost(parent[0]));
            })
    },[id, commentid])

    return <div className='home main-container open-container col'>
        {/* {console.log('POST is ',post)} */}
        {/* {post?(Array.isArray(post)?post[0].render():post.render()):<></>} */}
        {page}
    </div>
}