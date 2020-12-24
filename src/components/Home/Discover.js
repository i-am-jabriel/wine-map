import { Fab, Tooltip } from "@material-ui/core";
import { Edit, Add, Image, Map } from "@material-ui/icons"
import { useEffect, useState } from "react";
import Reply from '../Reply/Reply';
import { useSpring, animated } from 'react-spring';
import Scroll from 'react-scroll';
import './Discover.css';
import { corktaint, api, Post } from '../Helper';

export const home = { name: 'Home', isPost: true };
export function newPost() {
    corktaint.reply = home;
    corktaint.refresh();
}

export default function Discover() {
    const button = {
        length: 120,
        to: { bottom: 0, left: 150, opacity: 1 },
        from: { bottom: 60, left: 0, opacity: 0, pointerEvents: 'none' },
        config: { duration: 5000 },
        count: 4,
        getTo: function (i) {
            return {
                opacity: 1,
                left: this.length * Math.cos(Math.PI * i / this.count),
                bottom: this.length * Math.sin(Math.PI * i / this.count) + 60,
                pointerEvents: 'all'
            }
        }
    }
    const [newPostButton, setNewPostButton] = useSpring(() => button.from);
    const [newImageButton, setNewImageButton] = useSpring(() => button.from);
    const [newMapButton, setNewMapButton] = useSpring(() => button.from);
    const [moreButtons, setMoreButtons] = useState(false);
    let [page, setPage] = useState(<></>);
    useEffect(() => {
        Object.assign(corktaint, { setPage });
        if (corktaint.scrollTo) {
            Scroll.scroller.scrollTo('scroll', {
                delay: 100,
                smooth: true,
                offset: 50, // Scrolls to element + 50 pixels down the page
            })
            corktaint.scrollTo = null;
        }
    }, [page]);

    const showButtons = () => {
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
    const showPost = () => {
        corktaint.reply = home;
        corktaint.refresh();
    }
    //const trends = ['recent', 'hour', 'day', 'week', 'month', 'year', 'all-time'];
    const trends = ['recent', 'hour', 'day', 'week', 'month', 'all-time'];
    const [currentTrend, setCurrentTrend] = useState(0);
    const setTrend = e => setCurrentTrend(e.target.dataset.trend);
    const [discoverPage, setDiscoverPage] = useState(1);
    useEffect(() => {
        setPage(<></>);
        console.log('fetching',`${api}/user/${corktaint.user.id}/feed/posts/${trends[currentTrend]}/${discoverPage}`);
        fetch(`${api}/user/${corktaint.user.id}/feed/posts/${trends[currentTrend]}/${discoverPage}`)
            .then(r => r.json())
            .then(r => Post.from(r))
            .then(p =>{
                corktaint.posts=p;
                corktaint.refresh();
            });
    }, [currentTrend]);
    return <div className='discover-row row'>
        <div className='discover-options-container'>
            <div className='discover-options col'>
                <h2>Discover Options:</h2>
                    <h5>Trend</h5>
                    <span className='row'>
                        {trends.map((t,i)=><span key={i}><span className={`trend-link link ${currentTrend==i?'active':''}`} onClick={setTrend} data-trend={i}>{t}</span> {i+1==trends.length?null:<span> | </span>} </span>)}
                    </span>
            </div>
        </div>
        <div className='page-wrapper col'>
            {corktaint.reply == home ? <div className='reply-wrapper'><Reply /></div> :
                <><div className='main-button-hover' onMouseLeave={hideButtons}><div className='main-button'>
                    <Fab color="primary" aria-label="add" onClick={moreButtons ? showPost : showButtons} onMouseEnter={showButtons}>
                        <Add />
                    </Fab>
                    {moreButtons ? ' ' : '.'}
                    {/* {moreButtons? */}
                    <Tooltip title='New Post' placement='top'><animated.div className={`hover-button ${moreButtons ? '' : 'disabled'}`} style={newPostButton}><Fab color='secondary' onClick={showPost} ><Edit /></Fab></animated.div></Tooltip>
                    <Tooltip title='Upload Gallery' placement='top'><animated.div className={`hover-button ${moreButtons ? '' : 'disabled'}`} style={newImageButton}><Fab color='secondary' onClick={showPost} ><Image /></Fab></animated.div></Tooltip>
                    <Tooltip title='Submit Review' placement='top'><animated.div className={`hover-button ${moreButtons ? '' : 'disabled'}`} style={newMapButton}><Fab color='secondary' onClick={showPost} ><Map /></Fab></animated.div></Tooltip>
                    {/* :null} */}
                </div></div> </>
            } 
            {page}
        </div>
    </div>
}