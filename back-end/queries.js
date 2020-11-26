const { PoolOutlined, ErrorOutline } = require('@material-ui/icons');

const Pool =  require('pg').Pool;
const pool = new Pool({
    user:'postgres',
    host:'hyperfocus.cvfpf4e1t0yy.us-east-1.rds.amazonaws.com',
    database:'CorkTaint',
    password:'zMrdkenTGxPOQwlcN3MO',
});

exports.get = (...names) => (req, res) =>{
    pool.query(`select * from ${names.join(',')}`,(error, results) =>{
        if(error)throw error;
        res.status(200).json(results.rows);
    });
}

exports.getWhere = (names, conds) => (req, res) =>{
    pool.query(`select * from ${names.join(',')} where ${Object.keys(conds).map(a=>`${a} = ${conds[a]}`).join(' and ')}`,(error, results) =>{
        if(error)throw error;
        res.status(200).json(results.rows);
    });
}

exports.getJoin = (a,b) => (req,res)=>{
    // console.log(`select * from ${b} right outer join ${a}${b} on ${b}.id = ${a}${b}.parentid inner join ${a} on ${a}${b}.childid = ${a}.id`);
    //TEFEE!
    var q=`SELECT * FROM ${b} inner JOIN ${a}${b} ON ${b}.id = ${a}${b}.parentid ${a!=b?`inner JOIN ${a} ON ${a}.id = ${a}${b}.childid WHERE `:`AND `}${b}.id = ${req.params.id}`;
    if(a==b)q=`select * from ${a}${a} aa inner join ${a} a on aa.childid = a.id where aa.parentid = ${req.params.id}`
    // console.log(`SELECT * FROM ${b} inner JOIN ${a}${b} ON ${b}.id = ${a}${b}.parentid inner JOIN ${a} ON ${a}.id = ${a}${b}.childid WHERE ${b}.id = ${req.params.id}`)
     pool.query(q, (error, results) => {
    //pool.query(`select * from ${b} inner join ${a}${b} on ${a}.id = ${a}${b}.childid ${a!=b?`inner JOIN ${a} ON ${a}.id = ${a}${b}.parentid WHERE `:`AND `}${b}.id = ${req.params.id}`, (error, results) => {
    // pool.query(`select * from `)
        if(error)throw error;
        res.status(200).json(results.rows);
    });
}

// insert into comments(userId, body) values(1,array['filling the database']);
// insert into commentsPosts(parentId, childId) values(2,currval('comments_id_seq'));

exports.post = (a, b) => (req,res) =>{
    let id = req.params.id || obj.parentid || obj.id;
    let obj = req.body;
    let keys = Object.keys(obj);
    let vals = keys.map(a=>obj[a]);
    let query = `insert into ${a}(${keys.join(',')}) values(${vals.join(',')});${b?`insert into ${a}${b}(parentid,childid) values(${id},currval('${a}_id_seq'));`:null}`;
    pool.query(query, e => {
        if(e)throw e;
        pool.query(`select * from ${a} order by id desc limit 1`, (e,results) => {
            if(e)throw e;
            res.status(200).json(results.rows);
        });
    });
}

exports.delete = (a) => (req,res) =>{
    let id = req.params.id || obj.parentid || obj.id;
    let q = `delete from ${a} where id=${id}`;
    pool.query(q,e=>{
        if(e)throw(e);
        res.status(200).json({response:true});
    });
    //let q2 = `delete from ${a}${b} where  `
}

//module.exports = {get, getWhere, getJoin };