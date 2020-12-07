import { Avatar } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {api, corktaint, User, Post, Comment} from '../Helper';
import './SingleUser.css';
export default function SingleUser(props){
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const types = ['posts','comments'];
    const trends = ['recent','hour','day','week','month','year','all-time'];
    const [page, setPage] = useState(1);
    const [type, _setType] = useState(types[0]);
    const [trend, _setTrend] = useState(trends[0]);
    const [content, setContent] = useState([]);

    const setType = e=>_setType(e.target.value);
    const setTrend = e=>_setTrend(e.target.value);
    const classes = {
        posts: Post,
        comments: Comment,
    }

    useEffect(()=>{
        Promise.all([User.get(id)]).then(u=>setUser(u[0]));  
    },[])

    useEffect(()=>{
        console.log('setting user to ',user);
        console.log(type,classes[type],classes[type].get);
        if(!user)return;
        fetch(`${api}/feed/from/${user.id}/${type}/${trend}/${page}`)
            .then(r=>r.json())
            .then(r=>Promise.all(r.map(a=>classes[type].get(a.id))))
            .then(r=>setContent(r))
    },[type,trend,page,user])
    return <div className='single-user-container container col'>
        <div className='user-bio row'>
            {user?<span>
                <Avatar variant="square" className={classes.square}>{user.name?user.name[0]:'C'}</Avatar>
                <p>{user.name}</p>
                <p>Score: {user.score}</p>
                <p>{user.bio}</p>
            </span>:null}
        </div>
        <div className='user-highlighted-content col'>
            <div className='row space-around'>
                <span>Content: <select value={type} onInput={setType}>
                    {types.map(x=><option value={x} key={x}>{x}</option>)}
                </select></span>
                <span>Sort By: <select value={trend} onInput={setTrend}>
                    {trends.map(x=><option value={x} key={x}>{x}</option>)}
                </select></span>
            </div>
            <div className='user-trend-content col'>
                <div className='user-content-row user-content-header row'>
                    <p>Rank</p>
                    <p>Desc</p>
                    <p>Score</p>
                </div>
                {content.map((x,i)=><Link to={`/${type.substring(0,type.length-1)}/${x.id}`}><div className='user-content-row row'>
                    <p>{(page-1)*10+i+1}</p>
                    <p>{x.desc}</p>
                    <p>{x.score}</p>
                </div></Link>)}
            </div>
            <div></div>
        </div>
    </div>
}