import { useEffect, useState } from "react"
import {api, Comment, Post, User} from '../Helper';
import './Leaderboard.css';

export default function Leaderboard(){
    const [type, setType] = useState('users');
    const [trend, setTrend] = useState('day');
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
        posts:['id'],
        comments:['id'],
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
                    {cols[type].map(c=><p key={c}>{c} :</p>)}
                    <p>score :</p>
                </div>
                {r.map(r=><div className='leaderboard-row row'>
                    {cols[type].map(c=><p key={c}>{r[c]}</p>)}
                    <p>{r.trend[trend]}</p>
                </div>)}
            </div>
            )
            })
    ,[type,trend,page])
    return <div className='leaderboard-container col'>
        <div className='row'>
            <select onInput={e=>setType(e.target.value)}>
                {types.map(t=><option value={t}>{t}</option>)}
            </select>
            <select onInput={e=>setTrend(e.target.value)}>
                {trends.map(t=><option value={t}>{t}</option>)}
            </select>
        </div>
        {results}
    </div>
}