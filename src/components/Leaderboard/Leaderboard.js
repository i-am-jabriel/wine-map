import { useEffect, useState } from "react"
import { Link } from "react-router-dom";
import {api, Comment, Post, sqlDateToJavascript, User} from '../Helper';
import './Leaderboard.css';

export default function Leaderboard(){
    const [type, setType] = useState('users');
    const [trend, setTrend] = useState('week');
    const [page, setPage] = useState(1);
    const types = ['users','posts','comments'];
    const trends = ['hour','day','week','month','year'];
    const classes = {
        users: User,
        posts: Post,
        comments: Comment,
    }
    const cols = {
        users:['name'],
        posts:['title','desc','postdate'],
        comments:['desc','postdate'],
    }

    const [results, setResults] = useState(<></>);
    useEffect(()=>
        fetch(`${api}/leaderboard/${type}/${trend}/${page}`).then(r=>r.json())
            .then(r=>Promise.all(r.map(a=>classes[type].get(a.id))))
            .then(r=>{
                console.log(r);
                setResults(
                    <div className='leaderboard-results col'>
                <div className='leaderboard-header leaderboard-row row'>
                    {cols[type].map(c=><p key={c}>{c}</p>)}
                    <p>score</p>
                </div>
                {r.map(r=><Link to={`/${type.substring(0,type.length-1)}/${r.id}`}><div className='leaderboard-row row'>
                    {cols[type].map(c=><p key={c}>{c!='postdate'?r[c]:sqlDateToJavascript(r[c])}</p>)}
                    <p>{r.trend[trend]}</p>
                </div></Link>)}
            </div>
            )
            })
    ,[type,trend,page])
    return <div className='leaderboard-container container col'>
        <h1>Leaderboard</h1>
        <div className='row space-around leaderboard-options'>
            <span>Top: <select onInput={e=>setType(e.target.value)}>
                {types.map(t=><option value={t}>{t}</option>)}
            </select></span>
            <span>Sort by: <select onInput={e=>setTrend(e.target.value)} value={trend}>
                {trends.map(t=><option value={t}>{t}</option>)}
            </select></span>
        </div>
        {results}
    </div>
}