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
['users','posts','comments'].forEach(a=>app.get(`/${a}`, db.get(a)));
['users','posts','comments'].forEach(a=>app.get(`/comments/${a}`, db.getJoin('comments',a)));
// app.get('/users',db.get('users'));
// app.get('/posts',db.get('users'));
app.listen(port,()=>console.log('hi'));