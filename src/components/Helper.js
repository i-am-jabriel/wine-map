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
    render(i){
        console.log('individual post #',this.id);
        return (
            <div className='content-post col' key={i}>
                {this.body.map((c,i)=>c.render(i))}
                <div className='post-comment'>
                    {this.comments.map((c,i)=>c.values(i))}
                </div>
            </div>
        )
    }
    static render(posts){
        console.log('starting to get value');
        return (
            <div className='content-posts row wrap'>
                {posts.map((p,i)=>p.render(i))}
            </div>
        )
    }
    static createPostFrom(userid,title,body){
        // console.log('creating post at',Post.posts.length, title, body);
        return new Post(Post.posts.length, userid, title, [...body.replace(/\n\s*\n/g, '\n').split('\n')].map(x=>Content.parse(x)));
    }
    static from(a){
        return a.map(b=>new Post(b));
    }
}
// id serial primary key,
// broadcast varchar(32) default 'Public',
// body text[],
// userId int NOT NULL,
// FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
// postDate timestamp NOT NULL DEFAULT NOW()
export class Comment{
    constructor(id, body = [], userId, comments = [], postDate = ''){
        if(!body.length) Object.assign(this,id);
        else Object.assign(this, {id, body, userId, comments, postDate});
        body = Content.parse(body, this);
    }
    get render(){
        return (
            <div className='comment-container'>
                {this.body.map(c=>c.value)}
                <div className='comment-chain'>
                    {this.comments.map(c=>c.value)}
                </div>
            </div>
        )
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
        console.log('found match',match);
        if(match && match.length > 1)return new Content(val[1], 'img', val[0],parent);
        else return new Content(val,'text','hi',parent);
    }

}

/*export const abe = new User(0,'Abe Johnson');

export const firstPost = new Post(Post.posts.length, abe,'This is my first post',[new Content('Here is my first content post'),new Content('It is filled with information'),new Content('https://s3-cdn.withwine.com/Wine/zrLjkNQrhk2dPco2FplGNg.png?h=256&autorotate=true','img','wine'), new Content('Ex Dee')]);
export const p2 = new Post(Post.posts.length, abe,'This is my second post',[new Content('Here is my first content post'),new Content('It is filled with information'),new Content('https://s3-cdn.withwine.com/Wine/zrLjkNQrhk2dPco2FplGNg.png?h=256&autorotate=true','img','wine'), new Content('Ex Dee')]);
export const p3 = new Post(Post.posts.length, abe,'This is my third post',[new Content('Here is my first content post'),new Content('It is filled with information'),new Content('https://s3-cdn.withwine.com/Wine/zrLjkNQrhk2dPco2FplGNg.png?h=256&autorotate=true','img','wine'), new Content('Ex Dee')]);
*/