export const api = 'http://localhost:2999'
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
        Post.posts[id] = this;
    }
    static posts = [];
    render(user,I){
        console.log('individual post #',this.id,' with ',this.comments.length,'comments');
        return (
            <div className='content-post col' key={this.id}>
                <div className='col post-container'>
                    {this.body.map((c,i)=>c.render(i))}
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
        return new Post(Post.posts.length, userid, title, [...body.replace(/\n\s*\n/g, '\n').split('\n')].map(x=>Content.parse(x)));
    }
    static async from(a){
        let posts = a.map(b=>new Post(b));
        var promises = posts.map(p=>fetch(`${api}/comments/posts/${p.id}`)
            .then(r=>r.json())
            .then(r=>{
                const [a,b] = Comment.from(r,5);
                p.comments = a;
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
        ['like','unlike','edit','destroy'].forEach(f=>this[f]=this[f].bind(this));
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
                        <><span onClick={()=>this.like(user)}>Like</span> | </>:
                        <><span onClick={()=>this.unlike(user,like)}>Unlike</span> |</>
                    }{ user.id == this.userid || user.admin ?
                        <>
                            <span onClick={()=>this.edit(user)}> Edit</span> | 
                            <span onClick={()=>this.destroy(user)} > Delete</span>
                        </>:null
                    }    
                </div>          
                <div className='comment-chain'>
                    {this.comments.map((c)=>c.render(user))}
                </div>
            </div>
        ]
    }
    unlike(user,like){
        fetch(`${api}/likes/${like.id}`,{method:'DELETE'})
            .then(r=>{
                this.likes = this.likes.splice(this.likes.indexOf(like),1);
                window.corktaint.setPosts(window.corktaint.posts);
            })
    }
    like(user){
        console.log({userid:user.id});
        fetch(`${api}/likes/comments/${this.id}`,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({userid:user.id})
        }).then(r=>{
            console.log(r);
            return r.json()})
        .then(r=>{
            console.log(r)
            this.likes = this.likes.concat(r);
            console.log(this.likes);
            debugger;
            window.corktaint.setPosts(window.corktaint.posts);
        });

    }
    edit(){

    }
    destroy(){
    }
    static from(a, i, set){
        if(--i<0)return [];
        let comments = a.map(b=>new Comment(b));
        var promises = comments.map(c=>fetch(`${api}/comments/comments/${c.id}`)
            .then(r=>r.json())
            .then(r=>{
                const [a,b]=Comment.from(r,i);
                c.comments = a || [];
                if(b)return Promise.all(b);
            })).concat(comments.map(c=>Like.getLikesFor(c)));
        return [comments, promises]
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
            .then(r=>{
                console.log(r);
                return obj.likes=r})
    }
}
export class Content{
    constructor(content, type = 'text', title, parent){
        Object.assign(this, {content, type, title, parent});
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
        if(match && match.length > 1)return new Content(match[3], 'img', match[4],parent);
        else return new Content(val,'text','hi',parent);
    }

}

/*export const abe = new User(0,'Abe Johnson');

export const firstPost = new Post(Post.posts.length, abe,'This is my first post',[new Content('Here is my first content post'),new Content('It is filled with information'),new Content('https://s3-cdn.withwine.com/Wine/zrLjkNQrhk2dPco2FplGNg.png?h=256&autorotate=true','img','wine'), new Content('Ex Dee')]);
export const p2 = new Post(Post.posts.length, abe,'This is my second post',[new Content('Here is my first content post'),new Content('It is filled with information'),new Content('https://s3-cdn.withwine.com/Wine/zrLjkNQrhk2dPco2FplGNg.png?h=256&autorotate=true','img','wine'), new Content('Ex Dee')]);
export const p3 = new Post(Post.posts.length, abe,'This is my third post',[new Content('Here is my first content post'),new Content('It is filled with information'),new Content('https://s3-cdn.withwine.com/Wine/zrLjkNQrhk2dPco2FplGNg.png?h=256&autorotate=true','img','wine'), new Content('Ex Dee')]);
*/