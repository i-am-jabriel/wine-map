import { Button, Fab, Tooltip } from "@material-ui/core";
import { Add, Close } from "@material-ui/icons"
import Reply from "./Reply/Reply";
import Rating from '@material-ui/lab/Rating';
import Chip from '@material-ui/core/Chip';

export const api = 'http://localhost:2999';
// export const sqlDateToJavascript = n => new Date(Date.UTC(...n.split(/[- :]/))).toString();
export const sqlDateToJavascript = n =>{
    let d = new Date(n);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}
export const parseBody = body =>
    [...body.replace(/\n\s*\n/g, '\n').split('\n')].map(x=>Content.parse(x));
export const increment = (o,i=1) => {Object.keys(o).forEach(k=>o[k]=(o[k]||0)+i);return o}
export class User{  
    constructor(id, name, email, achievements, score){
        if(!name) Object.assign(this,id);
        else Object.assign(this, {id, name, email, achievements, score});
        User.users[`${this.id}`] = this;
        console.log('created new user',this.name,this.id);
    }
    static users = {};
    static from(a){
        return a.map(b=>new User(b));
    }
    static getUser(id){
        console.log('attempting to get user at',id,User.users[id]);
        if(User.users[id])return User.users[id];
        console.log('downloading user')
        return fetch(`${api}/users/${id}`)
            .then(r=>r.json()).then(r=>new User(r[0]))
    }
    async changeScoreBy(i=1){
        return fetch(`${api}/users/${this.id}`,{
            method:'put',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({score:this.score+=i,lastaction:'now()',trend:increment(this.trend,i)})
        });
    }
}

export class Post{
    constructor(id,userId,title,body = [], comments=[],postDate){
        Object.assign(this,{comments:[],body:[],likes:[]});
        if(!userId) Object.assign(this,id);
        else Object.assign(this,{id, userId,title,comments,body,postDate});
        this.body = Content.parse(this.body);
        // console.log(arguments);
        Post.posts[`${this.id}`] = this;
        ['like','unlike','destroy','clickEdit'].forEach(m=>this[m]=this[m].bind(this));
    }
    static posts = {};
    render(){
        var _like = this.likes.find(l=>l.userid==corktaint.user.id);
        var admin = this.userid == corktaint.user.id || corktaint.user.admin;
        //console.log('individual post #',this.id,' with ',this.comments.length,'comments','is replying?',corktaint.reply==this);
        return (
            <div className='content-post col' key={this.id}>
                {admin ? <p className='delete-post-button' onClick={this}> <Close/> </p>: null}
                <div className='col post-container'>
                    {corktaint.reply!=this?this.body.map((c,i)=>c.render(i)):<Reply value={Content.fullValues(this.body).join('\n')}/>}
                </div>
                {admin?<p className='post-edit' onClick={this.clickEdit}>Edit</p>:null}
                <div className='post-credit'>
                    <p>- {User.users[this.userid].name}</p><p>{sqlDateToJavascript(this.postdate)}</p>
                    </div>
                <div className='post-like-count' >
                    <span onClick={()=>!_like?this.like():this.unlike(_like)}>{this.likes.length} {_like?<>❤️</>:<>♡</>}</span>
                    {corktaint.reply==this?<Reply/>:
                    <span className='row post-reply-button'><Tooltip title='Reply' placement='top'><Fab color='primary' onClick={()=>{corktaint.reply=this;corktaint.refresh()}}>
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
            </div>
        )
    }
    like(){
        Like.likeObj(this); 
        User.users[this.userid].changeScoreBy(1);
    }
    unlike(like){
        Like.deleteLike(like,this);
        User.users[this.userid].changeScoreBy(-1);
    }
    clickEdit(){
        this.replyMode = 'edit';
        corktaint.reply=this;
        corktaint.refresh();
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
    static createPostFrom(userid,title,body){
        // console.log('creating post at',Post.posts.length, title, body);
        return new Post(Post.posts.length, userid, title, parseBody(body));
    }
    destroy(){
        fetch(`${api}/posts/${this.id}`,{method:'delete'})
            .then(r=>{
                corktaint.posts.splice(this.id,1);
                corktaint.refresh();
            });
    }
    edit(body){
        return fetch(`${api}/comments/${this.id}`,{
            method:'put',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({body})
        }).then(()=>this.body = Content.parse(body))
        .then(r=>{
            corktaint.reply = null;
            corktaint.refresh();
        });
    }
    static submitNewPost(title,body){
        return fetch(`${api}/posts`,{
            method:'post',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({userid:corktaint.user.id,body,title}),
        }).then(r=>r.json()).then(r=>{
            corktaint.posts.push(new Post(r[0]));
            // console.log(corktaint.posts[corktaint.posts.length-1]);
            corktaint.reply = null;
            corktaint.refresh();
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
    static async from(a){
        let posts = a.map(b=>Post.posts[b.id]||new Post(b));
        var promises = posts.map(p=>p.getComments()).concat(posts.map(p=>Like.getLikesFor(p))).concat(posts.map(p=>User.getUser(p.userid)));
        do{
            promises = (await Promise.all(promises)).filter(p=>p.then);
        }
        while(promises.length);
        console.log('finished promises',posts,corktaint,User.users);
        corktaint.posts=posts;
        corktaint.refresh();
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
        Object.assign(this,{body:[],comments:[],likes:[]});
        if(!body.length) Object.assign(this,id);
        else Object.assign(this,{id, body, userid, comments, postdate});
        this.body = Content.parse(this.body, this);
        ['like','unlike','clickEdit','destroy','reply'].forEach(f=>this[f]=this[f].bind(this));
    }
    render(){
        var _like = this.likes.find(l=>l.userid==corktaint.user.id);
        // console.log(this.body,this.comments);
        return [
            <div className='comment-container' key={this.id}>
                {this.body.map((c,i)=>c.render(i))}
                {this.likes.length ? <p className='comment-like-count' onClick={_like?()=>this.unlike(_like):this.like}>{this.likes.length} ❤️</p> : null}
                <div className='comment-options'>
                    { !_like ?
                        <><span onClick={this.like}>Like</span> | </>:
                        <><span onClick={()=>this.unlike(_like)}>Unlike</span> | </>
                    }
                    <span onClick={()=>this.reply()}> Reply</span> |
                    { corktaint.user.id == this.userid || corktaint.user.admin ?
                        <>
                            <span onClick={this.clickEdit}> Edit</span> | 
                            <span onClick={this.destroy} > Delete</span>
                        </>:null
                    }    
                </div>
                { corktaint.reply==this?<Reply value={this.replyMode=='reply'?null:Content.fullValues(this.body).join('\n')}/>:null}
                <div className='comment-chain'>
                    {this.comments.map((c)=>c.render())}
                </div>
            </div>
        ]
    }
    unlike(like){
        Like.deleteLike(like,this);
        User.users[this.userid].changeScoreBy(-1);
    }
    like(){
        Like.likeObj(this);
        User.users[this.userid].changeScoreBy(1);
    }
    reply(){
        corktaint.reply=corktaint.reply!=this?this:null;
        this.replyMode = 'reply';
        corktaint.refresh();
    }
    clickEdit(){
        corktaint.reply=corktaint.reply!=this?this:null;
        this.replyMode = 'edit';
        corktaint.refresh();
    }
    destroy(){
        fetch(`${api}/comments/${this.id}`,{method:'delete'})
            .then(r=>{
                this.parent.comments.splice(this.parent.comments.indexOf(this),1);
                corktaint.refresh();
            });
    }
    edit(body){
        return fetch(`${api}/comments/${this.id}`,{
            method:'put',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({body})
        }).then(()=>this.body = Content.parse(body))
        .then(r=>{
            corktaint.reply = null;
            corktaint.refresh();
        });
    }
    static from(a, i, set){
        if(--i<0)return [];
        let comments = a.map(b=>new Comment(b));
        var promises = comments.map(c=>fetch(`${api}/comments/comments/${c.id}`)
            .then(r=>r.json())
            .then(r=>{
                const [a,b]=Comment.from(r,i);
                c.comments = a || [];
                c.comments.forEach(cc=>cc.parent=c);
                if(b)return Promise.all(b);
            })).concat(comments.map(c=>Like.getLikesFor(c)));
        return [comments, promises]
    }
    static async addCommentTo(obj,body){
        return fetch(`${api}/comments/${obj.constructor.name.toLowerCase()}s/${obj.id}`,{
            method:'post',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({body,userid:corktaint.user.id})
        }).then(r=>r.json()).then(r=>{
            var c=new Comment(r[0]);
            c.parent=obj;
            return obj.comments.push(c);
        }).then(r=>{
            corktaint.reply = null;
            corktaint.refresh();
        });
    }
}
export class Like{
    constructor(a){
        Object.assign(this,a);
    }
    static getLikesFor(obj){
        // console.log('atempting to get likes for',obj.constructor.name,' id',obj.id);
        return fetch(`${api}/likes/${obj.constructor.name.toLowerCase()}s/${obj.id}`)
            .then(r=>r.json())
            .then(r=>obj.likes=r);
    }
    static likeObj(obj){
        console.log('firing like on ',obj,obj.id);
        debugger;
        return fetch(`${api}/likes/${obj.constructor.name.toLowerCase()}s/${obj.id}`,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({userid:corktaint.user.id})
        }).then(r=>r.json()).then(r=>{
            obj.likes = obj.likes.concat(r);
            corktaint.refresh();
        });
    }
    static deleteLike(like,obj){
        console.log('firing delete like on',obj,obj.id);
        return fetch(`${api}/likes/${like.id}`,{method:'DELETE'})
            .then(r=>{
                obj.likes.splice(obj.likes.findIndex(a=>a.id==like.id),1);
                corktaint.refresh();
            })
    }
}
export class Content{
    constructor(content, type = 'text', title, parent, fullValue){
        Object.assign(this, {content, type, title, parent, fullValue});
    }
    render(i){
        // console.log('content #'+this.id+' needs value');
        switch(this.type){
            case 'rating':return <Rating value={this.content} precision={0.1} readOnly={true} size='small' key={i}/>
            case 'tags':return this.content.split(',').map((c,i)=><Chip key={i} label={c} variant='outlined' className='post-tag'/>)
            case 'img':return <img className='content content-img' src={this.content} alt={this.title||''} key={i}/>
            case 'text':default:return <p className='content content-text' key={i}>{this.content}</p>
        }
    }
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

export const corktaint ={
    refresh:()=>{
        console.log('refreshing',corktaint.user,User.users);
        corktaint.setPage(Post.render(corktaint.posts));
    },
    reply:null,
    posts:[],
    User,
    Post
};
window.corktaint=corktaint;