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
    // console.log(`SELECT * FROM ${b} inner JOIN ${a}${b} ON ${b}.id = ${a}${b}.parentid inner JOIN ${a} ON ${a}.id = ${a}${b}.childid WHERE ${b}.id = ${req.params.id}`)
    pool.query(`SELECT * FROM ${b} inner JOIN ${a}${b} ON ${b}.id = ${a}${b}.parentid ${a!=b?`inner JOIN ${a} ON ${a}.id = ${a}${b}.childid WHERE `:`AND `}${b}.id = ${req.params.id}`, (error, results) => {
        // pool.query(`select * from `)
        if(error)throw error;
        res.status(200).json(results.rows);
    });
}

exports.put = (table) => (req,res) =>{
    let obj = req.body;
    let keys = Object.keys(obj);
    let vals = keys.map(a=>obj[a]);
    pool.query(`insert into ${table}(${keys.join(',')}) values(${vals.join(',')}) returning *`, (error, result) => {
        if(error)throw error;
        res.status(200).json(results.rows);
    });
}

//module.exports = {get, getWhere, getJoin };