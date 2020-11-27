const app = require('express')();
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./queries');
const port = 2999;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Epxress, and Postgres API'})
});
const main = ['users','posts','comments'];
const mainLikes = main.concat(['likes']);
mainLikes.forEach(a=>app.get(`/${a}`, db.get(a)));
main.forEach(a=>{
    app.get(`/comments/${a}/:id`, db.getJoin('comments',a));
    app.post(`/comments/${a}/:id`, db.post('comments', a));
});
mainLikes.forEach(a=>{
    app.post(`/${a}/:id`, db.post(a));
    app.delete(`/${a}/:id`, db.delete(a));
})
main.forEach(a=>{
    app.get(`/likes/${a}`, db.get(`likes${a}`));
    app.post(`/likes/${a}/:id`, db.post('likes', a));
    app.get(`/likes/${a}/:id`, db.getJoin('likes',a));
});
// app.get('/users',db.get('users'));
// app.get('/posts',db.get('users'));
app.listen(port,()=>console.log('hi'));