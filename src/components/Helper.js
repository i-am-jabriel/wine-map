import { Fab } from "@material-ui/core";
import { Add } from "@material-ui/icons"
import Reply from "./Reply/Reply";

export const api = 'http://localhost:2999';
export const parseBody = body =>
    [...body.replace(/\n\s*\n/g, '\n').split('\n')].map(x=>Content.parse(x));
// CREATE TABLE users (
//     id serial primary key,
//     name VARCHAR(32),
//     email VARCHAR(64),
//     last_login timestamp NOT NULL DEFAULT NOW(),
//     achievements VARCHAR(64)[],
//     score integer DEFAULT 0
//   );
export class User{  
    constructor(id, name, email, achievements, score){
        if(!name) Object.assign(this,id);
        else Object.assign(this, {id, name, email, achievements, score});
        User[this.id] = this;
    }
    static users = [];
    static from(a){
        return a.map(b=>new User(b));
    }
}
// id serial primary key,
// postType VARCHAR(32),
// broadcast varchar(32) default 'Public',
// body text[],
// title varchar(80),
// postDate timestamp NOT NULL DEFAULT NOW(),
// userId int NOT NULL,
// FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
export class Post{
    constructor(id,userId,title,body = [], comments=[],postDate){
        if(!userId) Object.assign(this,{comments:[],body:[]},id);
        else Object.assign(this,{comments:[],body:[]},{id, userId,title,comments,body,postDate});
        this.body = Content.parse(this.body);
        // console.log(arguments);
        Post.posts[this.id] = this;
    }
    static posts = []
    render(user){
        var like = this.likes.find(l=>l.userid==this.userid);
        console.log('individual post #',this.id,' with ',this.comments.length,'comments','is replying?',window.corktaint.reply==this);
        return (
            <div className='content-post col' key={this.id}>
                <div className='col post-container'>
                    {this.body.map((c,i)=>c.render(i))}
                </div>
                <p className='post-credit'>- {window.corktaint.user.name}</p>
                <div className='post-like-count' >
                    <span onClick={()=>like?Like.deleteLike(like,this):Like.likeObj(this)}>{this.likes.length} {like?<>❤️</>:<>♡</>}</span>
                    {window.corktaint.reply==this?<Reply/>:
                    <span className='row'><Fab color='primary' onClick={()=>{window.corktaint.reply=this;window.corktaint.refresh()}}>
                        <Add/>
                    </Fab></span>
                    }
                </div>
                <div className='post-comments'>
                    {this.comments.length?
                        this.comments.map((c,i)=>c.render(user,i)):
                        <p>No Comments Yet...{this.comments.length}</p>
                    }
                </div>
            </div>
        )
    }
    static render(user,posts){
        console.log('starting page render');
        window.corktaint.setPosts(posts);
        return (
            <div className='content-posts col wrap'>
                {posts.map(p=>p.render(user))}
            </div>
        )
    }
    static createPostFrom(userid,title,body){
        // console.log('creating post at',Post.posts.length, title, body);
        return new Post(Post.posts.length, userid, title, parseBody(body));
    }
    static async from(a){
        let posts = a.map(b=>new Post(b));
        var promises = posts.map(p=>fetch(`${api}/comments/posts/${p.id}`)
            .then(r=>r.json())
            .then(r=>{
                const [a,b] = Comment.from(r,5);
                p.comments = a;
                a.forEach(aa=>aa.parent = p);
                return Promise.all(b);
            }
        )).concat(posts.map(p=>Like.getLikesFor(p)));
        do{
            promises = (await Promise.all(promises)).filter(p=>p.then);
        }
        while(promises.length);
        console.log('finished',posts,window.corktaint);
        window.corktaint.setPage(Post.render(window.corktaint.user,posts));
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
        ['likeClick','unlikeClick','editClick','destroy','replyClick'].forEach(f=>this[f]=this[f].bind(this));
    }
    render(user){
        var like = this.likes.find(l=>l.userid==this.userid);
        // console.log(this.body,this.comments);
        return [
            <div className='comment-container' key={this.id}>
                {this.body.map((c,i)=>c.render(i))}
                {this.likes.length ? <p className='comment-like-count'>{this.likes.length} ❤️</p> : null}
                <div className='comment-options'>
                    { !like ?
                        <><span onClick={()=>this.likeClick(user)}>Like</span> | </>:
                        <><span onClick={()=>this.unlikeClick(like)}>Unlike</span> | </>
                    }
                    <span onClick={()=>this.replyClick()}> Reply</span> |
                    { user.id == this.userid || user.admin ?
                        <>
                            <span onClick={()=>this.editClick(user)}> Edit</span> | 
                            <span onClick={()=>this.destroy()} > Delete</span>
                        </>:null
                    }    
                </div>
                { window.corktaint.reply==this?<Reply value={this.replyMode=='reply'?null:Content.fullValues(this.body).join('\n')}/>:null}
                <div className='comment-chain'>
                    {this.comments.map((c)=>c.render(user))}
                </div>
            </div>
        ]
    }
    unlikeClick(like){
        Like.deleteLike(like,this);
    }
    replyClick(){
        window.corktaint.reply=window.corktaint.reply!=this?this:null;
        this.replyMode = 'reply';
        window.corktaint.refresh();
    }
    likeClick(user){
        Like.likeObj(this);
    }
    editClick(){
        window.corktaint.reply=window.corktaint.reply!=this?this:null;
        this.replyMode = 'edit';
        window.corktaint.refresh();
    }
    destroy(){
        fetch(`${api}/comments/${this.id}`,{method:'delete'})
            .then(r=>{
                this.parent.comments.splice(this.parent.comments.indexOf(this),1);
                window.corktaint.refresh();
            });
    }
    async edit(body){
        return fetch(`${api}/comments/${this.id}`,{
            method:'put',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({body})
        }).then(()=>this.body = Content.parse(body));
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
            body:JSON.stringify({body,userid:window.corktaint.user.id})
        }).then(r=>r.json()).then(r=>{
            var c=new Comment(r[0]);
            c.parent=obj;
            obj.comments.push(c);
            return 1;
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
        console.log(`${api}/likes/${obj.constructor.name}s/${obj.id}`);
        return fetch(`${api}/likes/${obj.constructor.name.toLowerCase()}s/${obj.id}`,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({userid:window.corktaint.user.id})
        }).then(r=>r.json()).then(r=>{
            obj.likes = obj.likes.concat(r);
            window.corktaint.refresh();
        });
    }
    static deleteLike(like,obj){
        return fetch(`${api}/likes/${like.id}`,{method:'DELETE'})
            .then(r=>{
                obj.likes.splice(obj.likes.findIndex(a=>a.id==like.id),1);
                window.corktaint.refresh();
            })
    }
}
export class Content{
    constructor(content, type = 'text', title, parent, fullValue){
        Object.assign(this, {content, type, title, parent, fullValue});
    }
    render(i){
        // console.log('content #'+this.id+' needs value');
        return this.type == 'text' ?
            (<p className='content content-text' key={i}>{this.content}</p>):
            (<img className='content content-img' src={this.content} alt={this.title||''} key={i}/>)
    }
    static parse(val,parent){
        if(Array.isArray(val))return val.map(a=>Content.parse(a,parent));
        let match = val.match(/(\[(.*?)\]\((.*?)\))/);
        // console.log('found match',match);
        if(match && match.length > 1)return new Content(match[3], 'img', match[4],parent,val);
        else return new Content(val,'text','hi',parent,val);
    }
    static toBody(a){
        return a.map(b=>b.content);
    }
    static fullValues(a){ return a.map(b=>b.fullValue)}
}

/*export const abe = new User(0,'Abe Johnson');

export const firstPost = new Post(Post.posts.length, abe,'This is my first post',[new Content('Here is my first content post'),new Content('It is filled with information'),new Content('https://s3-cdn.withwine.com/Wine/zrLjkNQrhk2dPco2FplGNg.png?h=256&autorotate=true','img','wine'), new Content('Ex Dee')]);
export const p2 = new Post(Post.posts.length, abe,'This is my second post',[new Content('Here is my first content post'),new Content('It is filled with information'),new Content('https://s3-cdn.withwine.com/Wine/zrLjkNQrhk2dPco2FplGNg.png?h=256&autorotate=true','img','wine'), new Content('Ex Dee')]);
export const p3 = new Post(Post.posts.length, abe,'This is my third post',[new Content('Here is my first content post'),new Content('It is filled with information'),new Content('https://s3-cdn.withwine.com/Wine/zrLjkNQrhk2dPco2FplGNg.png?h=256&autorotate=true','img','wine'), new Content('Ex Dee')]);
*/