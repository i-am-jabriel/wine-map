import { Avatar, Fab, Tooltip } from "@material-ui/core";
import { Add, Close, Remove } from "@material-ui/icons"
import Reply from "./Reply/Reply";
import Rating from '@material-ui/lab/Rating';
import Chip from '@material-ui/core/Chip';
import {Link} from 'react-router-dom';
import Carousel from './Carousel/Carousel';
import {aws} from '../secret';
import {socket} from '../socket';
import ReactPlayer from 'react-player/lazy'
import MediaPlayer from "./MediaPlayer/MediaPlayer";

// export const api = 'http://localhost:2999';
export const api = 'http://ec2-54-198-43-159.compute-1.amazonaws.com:2999';
export const mod = (a,b) => ((a%b)+b)%b;
export const zero = n => n <= 9?`0${n}`:n;
export const sqlDateToJavascript = n =>{
    let d = new Date(n);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}
export const trim = (s, i=40)=> s.length<i?s:s.substr(0,37)+'...';
export const parseBody = body =>
    [...body.replace(/\n\s*\n/g, '\n').split('\n')].map(x=>Content.parse(x));
export const increment = (o,i=1) => {Object.keys(o).forEach(k=>o[k]=(o[k]||0)+i);return o}
export class User{  
    constructor(id, name, email, achievements, score){
        Object.assign(this,{type:'user'});
        if(!name) Object.assign(this,id);
        else Object.assign(this, {id, name, email, achievements, score});
        User.users[`${this.id}`] = this;
        // NEEDS FIXING 
        // console.log('created new user',this.name,this.id);
    }
    static users = {};
    static from(a){
        return a.map(b=>new User(b));
    }
    static get(id){
        if(User.users[id])return User.users[id];
        return fetch(`${api}/users/${id}`)
            .then(r=>r.json()).then(r=>new User(r[0]))
    }
    async changeScoreBy(i=1){
        const data = {score:this.score+=i,lastaction:'now()',trend:increment(this.trend,i)};
        return fetch(`${api}/users/${this.id}`,{
            method:'put',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(data),
        })
        .then(r=>socket.changeScoreBy({type:'user',id:this.id},data))
    }
    changeScoreByFromSocket(data){
       Object.assign(this,data); 
    }
    get avatar(){return <Avatar>{this.name[0]}</Avatar>}
}

export class Post{
    constructor(id,userId,title,body = [], comments=[],postDate){
        Object.assign(this,{comments:[],body:[],likes:[],hide:false,type:'post'});
        if(!userId) Object.assign(this,id);
        else Object.assign(this,{id, userId,title,comments,body,postDate});
        this.body = Content.parse(this.body);
        // console.log(arguments);
        Post.posts[`${this.id}`] = this;
        ['like','unlike','clickDestroy','clickEdit','clickReply','toggleHide'].forEach(m=>this[m]=this[m].bind(this));
    }
    static posts = {};
    render(){
        var _like = this.likes.find(l=>l.userid==corktaint.user.id);
        var admin = this.userid == corktaint.user.id || corktaint.user.admin;
        //console.log('individual post #',this.id,' with ',this.comments.length,'comments','is replying?',corktaint.reply==this);
        return (
            <div className='content-post col' key={this.id} name={corktaint.scrollTo==this.id?'scroll':undefined}>
                <Tooltip title='Hide'><Fab color='secondary'className='hide-post-button' onClick={this.toggleHide}><Remove/></Fab></Tooltip>
                {!this.hide && <>
                    {admin ? <Tooltip title='Delete Post'><Fab color='secondary' className='delete-post-button' onClick={this.clickDestroy}> <Close/> </Fab></Tooltip>: null}
                    <div className='col post-container'>
                        {corktaint.reply==this && this.replyMode=='edit'?<Reply value={Content.fullValues(this.body).join('\n')}/>:this.body.map((c,i)=>c.render(i))}
                    </div>
                    {admin?<p className='post-edit link' onClick={this.clickEdit}>Edit</p>:null}
                    <div className='post-credit'>
                        <Link to={`/user/${this.userid}`}><p>- {User.users[this.userid].name}</p></Link><p>{sqlDateToJavascript(this.postdate)}</p>
                        </div>
                    <div className='post-like-count'>
                        <Tooltip title={_like?'Unlike':'Like'} placement='top'><span onClick={()=>!_like?this.like():this.unlike(_like)}>{this.likes.length} {_like?<>❤️</>:<>♡</>}</span></Tooltip>
                        {corktaint.reply==this && this.replyMode=='reply'?<Reply/>:
                        <span className='row post-reply-button'><Tooltip title='Reply' placement='top'><Fab color='primary' onClick={this.clickReply}>
                            <Add/>
                        </Fab></Tooltip></span>
                        }
                    </div>
                <div className='post-comments'>
                    {this.comments.length?
                        this.comments.map((c,i)=>c.render(i)):
                        <p>No Comments Yet...</p>
                    }
                </div>
                </>}
            </div>
        )
    }
    
    static get(id, p){
        if(Post.posts[id])return Post.posts[id];
        if(p && p.body) return new Post(p);
        return fetch(`${api}/posts/${id}`)
            .then(r=>r.json()).then(r=>Post.greedyLoad(new Post(r[0])))
    }
    static render(posts){
        //corktaint.setPosts(posts);
        corktaint.posts = posts;
        return (
            <div className='content-posts col wrap'>
                {posts.map(p=>p.render())}
            </div>
        )
    }
    get desc(){return trim(Content.fullValues(this.body.slice(0,3)).join(''))}
    like(){
        Like.likeObjInDatabase(this); 
        User.users[this.userid].changeScoreBy(1);
        this.changeScoreBy(1);
    }
    unlike(like){
        Like.deleteLikeInDatabase(this,like);
        User.users[this.userid].changeScoreBy(-1);
        this.changeScoreBy(-1);
    }
    clickEdit(){
        this.replyMode = 'edit';
        corktaint.reply=this;
        corktaint.refresh();
    }
    clickReply(){
        this.replyMode = 'reply';
        corktaint.reply=this;
        corktaint.refresh();
    }
    static createPostFrom(userid,title,body){
        // console.log('creating post at',Post.posts.length, title, body);
        return new Post(Post.posts.length, userid, title, parseBody(body));
    }
    clickDestroy(){
        this.destroy();
        fetch(`${api}/posts/${this.id}`,{method:'delete'}).then(r=>socket.destroy({type:'post',id:this.id}))
    }
    destroy(){
        Post.posts[this.id]=undefined;
        const index = corktaint.posts.indexOf(this);
        if(index==-1)return;
        corktaint.posts.splice(index,1);
        corktaint.refresh();
    }
    async changeScoreBy(i=1){
        const data={score:this.score+=i,lastaction:'now()',trend:increment(this.trend,i)};
        return fetch(`${api}/posts/${this.id}`,{
            method:'put',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(data)
        }).then(r=>socket.changeScoreBy({type:'post',id:this.id},data))
    }
    changeScoreByFromSocket(data){
       Object.assign(this,data); 
    }
    edit(body){
        corktaint.reply = null;
        this.body = Content.parse(body);
        corktaint.refresh();
        return fetch(`${api}/posts/${this.id}`,{
            method:'put',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({body})
        }).then(r=>socket.edit({type:'post',id:this.id},{body}))
    }
    static addNewPost(post){
        if(corktaint.view=='/discover/recent'){
            corktaint.posts.unshift(new Post(post));
            corktaint.refresh();
        }
    }
    static submitNewPost(title,body){
        corktaint.reply = null;
        corktaint.refresh();
        return fetch(`${api}/posts`,{
            method:'post',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({userid:corktaint.user.id,body,title}),
        }).then(r=>r.json()).then(r=>{
            Post.addNewPost(r[0]);
            socket.addNewPost(r[0]);
            // console.log(corktaint.posts[corktaint.posts.length-1]);
        })
    }
    getComments(){
        if(this.commentsLoaded)return;
        return fetch(`${api}/comments/posts/${this.id}`)
            .then(r=>r.json())
            .then(r=>{
                const [a,b] = Comment.from(r,5);
                this.comments = a;
                a.forEach(aa=>aa.parent = this);
                this.commentsLoaded=true;
                return Promise.all(b);
            }
        );
    }
    async greedyLoad(){
        let x = await Post.greedyLoad(this);
        return this;
    }
    static async greedyLoad(posts){
        const arrayMode = Array.isArray(posts);
        if(!arrayMode)posts = [posts];
        let promises = posts.map(p=>p.getComments()).concat(posts.map(p=>Like.getLikesFor(p))).concat(posts.map(p=>User.get(p.userid)));
        do{
            promises = (await Promise.all(promises)).filter(p=>p&&p.then);
        }
        while(promises.length);
        return arrayMode?posts:posts[0];
    }
    static async from(a){
        let posts = a.map(p=>Post.get(p.id,p));
        posts = await Promise.all(posts);
        posts = await Post.greedyLoad(posts);
        /*corktaint.posts=posts;
        corktaint.refresh();*/
        return posts;
    }
    toggleHide(){
        this.hide=!this.hide;
        corktaint.refresh();
    }
    inView(){
        return corktaint.posts.includes(this);
    }
}
// id serial primary key,
// broadcast varchar(32) default 'Public',
// body text[],
// userId int NOT NULL,
// FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
// postDate timestamp NOT NULL DEFAULT NOW()
export class Comment{
    constructor(id, body = [], userid, comments = [], postdate = ''){
        Object.assign(this,{body:[],comments:[],likes:[],type:'comment'});
        if(!body.length) Object.assign(this,id);
        else Object.assign(this,{id, body, userid, comments, postdate});
        this.body = Content.parse(this.body, this);
        ['like','unlike','clickEdit','clickDestroy','reply','toggleHide'].forEach(f=>this[f]=this[f].bind(this));
        comments[this.id] = this;
    }
    static comments = {};
    static get(id, c){
        if(Comment.comments[id])return Comment.comments[id];
        if(c)return new Comment(c);
        return fetch(`${api}/comments/${id}`)
            .then(r=>r.json()).then(r=>new Comment(r[0]))
    }
    render(){
        var _like = this.likes.find(l=>l.userid==corktaint.user.id);
        // console.log(this.body,this.comments);
        return <div className='comment-container' key={this.id} name={corktaint.scrollTo==this.id?'scroll':undefined}>
                    <div className='hide-comment-wrapper'><Tooltip title={this.hide?'Show':'Hide'} placement='top'><span className='hide-comment-button link' onClick={this.toggleHide}>[{this.hide?'+':'-'}]</span></Tooltip></div>
                    {this.hide?null:<>
                        <Link className='comment-author' to={`/user/${this.userid}`}>{User.users[this.userid].name}</Link>
                        {corktaint.reply==this&&this.replyMode=='edit'?<Reply value={Content.fullValues(this.body).join('\n')}/>:this.body.map((c,i)=>c.render(i))}
                        {this.likes.length ? <span className='comment-like-count' onClick={_like?()=>this.unlike(_like):this.like}>{this.likes.length}<Tooltip title={_like?'Unlike':'Like'} placement='top'><span>❤️</span></Tooltip></span> : null}
                        <div className='comment-options'>
                            {[ !_like ? <span className='link' onClick={this.like}>Like</span> : <span className='link' onClick={()=>this.unlike(_like)}>Unlike</span>,
                                <span className='link' onClick={()=>this.reply()}> Reply</span>,
                                corktaint.user.id == this.userid || corktaint.user.admin ?
                                    <><span className='link' onClick={this.clickEdit}> Edit</span> | <span className='link' onClick={this.clickDestroy} > Delete</span></> : null
                            ].filter(a=>a).reduce((a,c,i,arr)=>a.concat(c,i<arr.length-1?<> | </>:undefined),[])}
                        </div>
                        { corktaint.reply==this && this.replyMode=='reply' && <Reply/>}
                        <div className='comment-chain'>
                            {this.comments.map((c)=>c.render())}
                        </div>
                    </>}
            </div>
    }
    get desc(){return trim(Content.fullValues(this.body.slice(0,3)).join(''))}
    parentPostInstant(){
        if(this._parentPost)return this._parentPost;
        if(this.parent){
            if(typeof this.parent == 'Comment')return this._parentPost = this.parent.parentPostInstant();
            else return this.parent;
        }
    }
    async parentPost(){
        if(this._parentPost)return this._parentPost;
        if(this.parent){
            if(typeof this.parent == 'Comment')return this._parentPost = this.parent.parentPost();
            else return this.parent;
        }
        const response = await (await (await fetch(`${api}/comment/parent/${this.id}`)).json());
        if(response.type=='comment'){
            const comment = await Comment.get(response.parentid)
            const post = await comment.parentPost();
            return this._parentPost = post;
        }else{
            const post = await Post.get(response.parentid);
            return this._parentPost = post;
        }
    }
    toggleHide(){
        this.hide = !this.hide;
        corktaint.refresh();
    }
    inView(){
        return this.parentPostInstant().inView();
    }
    unlike(like){
        Like.deleteLikeInDatabase(this,like);
        User.users[this.userid].changeScoreBy(-1);
        this.changeScoreBy(-1);
    }
    like(){
        Like.likeObjInDatabase(this);
        User.users[this.userid].changeScoreBy(1);
        this.changeScoreBy(1);
    }
    reply(){
        corktaint.reply=corktaint.reply!=this?this:null;
        this.replyMode = 'reply';
        corktaint.refresh();
    }
    async changeScoreBy(i=1){
        const data = {score:this.score+=i,lastaction:'now()',trend:increment(this.trend,i)};
        return fetch(`${api}/comments/${this.id}`,{
            method:'put',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(data)
        }).then(r=>socket.changeScoreBy({type:'comment',id:this.id},data));
    }
    changeScoreByFromSocket(data){
       Object.assign(this,data); 
    }
    clickEdit(){
        corktaint.reply=corktaint.reply!=this?this:null;
        this.replyMode = 'edit';
        corktaint.refresh();
    }
    clickDestroy(){
        this.destroy();
        fetch(`${api}/comments/${this.id}`,{method:'delete'}).then(r=> socket.destroy({type:'comment',id:this.id}))
    }
    destroy(){
        Comment.comments[this.id]=undefined;
        this.parent.comments.splice(this.parent.comments.indexOf(this),1);
        if(this.inView())corktaint.refresh();
    }
    edit(body){
        corktaint.reply = null;
        this.body = Content.parse(body);
        corktaint.refresh();
        return fetch(`${api}/comments/${this.id}`,{
            method:'put',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({body})
        }).then(r=>{
            socket.edit({type:'comment',id:this.id},{body});
        });
    }
    static from(a, i, set){
        if(--i<0)return [];
        const comments = a.map(c=>Comment.get(c.id,c));
        const promises = comments.filter(c=>!c.commentsLoaded).map(c=>fetch(`${api}/comments/comments/${c.id}`)
            .then(r=>r.json())
            .then(r=>{
                const [a,b]=Comment.from(r,i);
                c.comments = a || [];
                c.commentsLoaded = true;
                c.comments.forEach(cc=>{
                    cc.parent=c;
                    if(b)b.push(User.get(cc.userid));
                });
                if(b)return Promise.all(b);
            })).concat(comments.map(c=>Like.getLikesFor(c)));
        return [comments, promises]
    }
    static async submitCommentToDatabase(obj,body){
        corktaint.reply = null;
        corktaint.refresh();
        const type=obj.type||obj.constructor.name.toLowerCase();
        return fetch(`${api}/comments/${type}s/${obj.id}`,{
            method:'post',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({body,userid:corktaint.user.id})
        }).then(r=>r.json()).then(r=>{
            Comment.addCommentTo(obj,r[0]);
            socket.addCommentTo({type,id:obj.id},r[0]);
        });
    }
    static addCommentTo(parent, comment){
        comment = new Comment(comment);
        comment.parent = parent;
        parent.comments.push(comment);
        if(parent.inView())corktaint.refresh();
    }
}
export class Like{
    constructor(a){
        Object.assign(this,a);
    }
    static getLikesFor(obj){
        // console.log('atempting to get likes for',obj.constructor.name,' id',obj.id);
        if(obj.likesLoaded)return true;
        const type=obj.type||obj.constructor.name.toLowerCase();
        console.warn('attempting to like ',type,obj.id);
        return fetch(`${api}/likes/${type}s/${obj.id}`)
            .then(r=>r.json())
            .then(likes=>Object.assign(obj,{likes,likesLoaded:true}));
    }
    static likeObjInDatabase(obj){
        // console.log('firing like on ',obj,obj.id);
        const type = obj.type||obj.constructor.name.toLowerCase();
        const likeData = {userid:corktaint.user.id};
        Like.likeObj(obj, likeData);
        return fetch(`${api}/likes/${type}s/${obj.id}`,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(likeData)
        }).then(r=>r.json()).then(like=>{
            socket.likeObj({type:type,id:obj.id}, like);
        }).catch(e=>Like.deleteLike(obj, likeData));
    }
    static likeObj(obj, like){
        obj.likes = obj.likes.concat(like);
        if(obj.inView())corktaint.refresh();
    }
    static deleteLikeInDatabase(obj, like){
        // console.log('firing delete like on',obj,obj.id);
        const type = obj.type||obj.constructor.name.toLowerCase();
        Like.deleteLike(obj, like);
        return fetch(`${api}/likes/${like.id}`,{method:'DELETE'})
        .then(r=>{
            socket.deleteLike({type:type,id:obj.id}, like);
        }).catch(e=>Like.likeObj(obj, like))
    }
    static deleteLike(obj, like){
        obj.likes.splice(obj.likes.findIndex(a=>a.id==like.id),1);
        if(obj.inView())corktaint.refresh();
    }
}
export class Content{
    constructor(content, type = 'text', title, parent, fullValue){
        Object.assign(this, {content, type, title, parent, fullValue});
        this.onClick=()=>{
            if(!this.active)corktaint.openPlayer(this);
            else corktaint.player.togglePause();
        }
    }
    render(i){
        // console.log('content #'+this.id+' needs value');
        switch(this.type){
            case 'rating':return <Rating value={this.content} precision={0.1} readOnly={true} size='small' key={i}/>
            case 'tags':return this.content.split(',').map((c,i)=><Chip key={i} label={c} variant='outlined' className='post-tag'/>)
            case 'img':
                const l  = this.content.split(',');
                if(l.length>1)return <Carousel images={l} key={i}/>
                return <img className='content content-img' src={this.content} alt={this.title||''} key={i}/>
            case 'youtube':case 'twitch': case 'facebook':case 'soundcloud':case 'media':  
                return <MediaPlayer content={this.content} active={this.active} openPlayer={this.onClick} key={i} type={this.type}/>
            case 'text': default:return <p className='content content-text' key={i}>{this.content}</p>
        }
    }
    static active = null;
    setActive(){
        if(Content.active){
            Content.active.active=false;
            Content.active=this;
        }
        this.active=true;
    }
    //
    static parse(val,parent){
        if(Array.isArray(val))return val.map(a=>Content.parse(a,parent));
        let match = (val.match(/(\[(.*?)\]\((.*?)\))/)||[]).slice(2);
        if(match.length > 1)return new Content(match[1], match[0], match[0],parent,val);
        else return new Content(val,'text','hi',parent,val);
    }
    static toBody(a){
        return a.map(b=>b.content);
    }
    static fullValues(a){ return a.map(b=>b.fullValue)}
}
export class Cookie{
    static set(key, value, date){
        document.cookie = `${key}=${value};expires=${date.toUTCString()}`;
    }
    static get(key){
        let entry = document.cookie.split(';').find(c=>c.includes(key));
        return entry?entry.split('=')[1]:null;
    }
    static delete(key){
        document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    }
}
export const corktaint ={
    refresh:()=>{
        // console.log('refreshing',corktaint.user,User.users);
        corktaint.setPage(Post.render(corktaint.posts));
    },
    player:{},
    reply:null,
    posts:[],
    User,
    Post
};
window.corktaint=corktaint;
const readBlob = file => new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e =>resolve(e.target.result);
    reader.readAsDataURL(file);
    // reader.readAsText(file);
});
// export AWS_SDK_LOAD_CONFIG="true";
export async function uploadToBucket(files, onUpload, onComplete){
    let file;
    let val = [];
    //files = await Promise.all([...files].map(f=>readBlob(f)))
    files=Array.from(files);
    while(file = files.shift()){
        const params = {
            ACL: 'public-read',
            Key: file.name,
            ContentType: file.type,
            Body: file,
        }
        console.log('starting upload of ',{file});
        let x = await aws.bucket.putObject(params,()=>!files.length && onComplete(val))
            .on('httpUploadProgress', (evt) =>onUpload((evt.loaded / evt.total) * 100))
            .send((e) => {
                if (e && !console.log(e))throw e;
                return 1;
            });
        console.log('uploaded! remaining',files.length);
        val.push(x);
    }
}
Object.assign(socket, {
    containers:{
        'post':Post.posts,
        'user':User.users,
        'comment':Comment.comments
    },
    types:{
        'post':Post,
        'user':User,
        'comment':Comment,
    },
    tryGet:(obj) =>socket.containers[obj.type][obj.id],
    addNewPost: post => socket.emit('rebroadcast','addNewPost',post),
    changeScoreBy:(obj, data) => socket.emit('rebroadcast','changeScoreBy', obj, data),
    destroy: obj => socket.emit('rebroadcast', 'destroy', obj),
    edit: (obj, data) => socket.emit('rebroadcast', 'edit', obj, data),
    addCommentTo: (obj, data) => socket.emit('rebroadcast', 'addCommentTo', obj, data),
    likeObj: (obj, like) => socket.emit('rebroadcast','likeObj',obj, like),
    deleteLike: (obj, like) => socket.emit('rebroadcast','deleteLike', obj, like)
})
socket.on('edit',(obj, data)=>{
    obj = socket.tryGet(obj);
    if(!obj)return;
    Object.assign(obj,{body:Content.parse(data.body)});
    if(obj.inView())corktaint.refresh();
});
socket.on('addCommentTo',(parent, comment)=>{
    parent = socket.tryGet(parent);
    if(!parent)return;
    Comment.addCommentTo(parent, comment);
});
socket.on('destroy',(obj)=>{
    if(!(obj = socket.tryGet(obj)))return;
    obj.destroy();
});
socket.on('likeObj',(obj, like)=>{
    if(!(obj = socket.tryGet(obj)))return;
    Like.likeObj(obj, like);
});
socket.on('deleteLike',(obj, like)=>{
    if(!(obj = socket.tryGet(obj)))return;
    Like.deleteLike(obj, like);
});
socket.on('addNewPost', (post) =>{
    Post.addNewPost(post);
});
socket.on('changeScoreBy', (obj, data) =>{
    if(!(obj = socket.tryGet(obj)))return;
    obj.changeScoreByFromSocket(data);
})