
//Dependecies
const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const status = require("http-status");
const pool = require("./p_data/database");
const client = require("./p_data/elephantsql");
const jwt = require("./p_data/jwt");
var jwtDecode = require('jwt-decode');
const bcrypt = require("bcrypt");
const cors = require("cors");
const saltRounds = 12;

require("dotenv").config();
const app = express();

//Middlewares
app.use(helmet());
app.use(bodyParser.json());
app.use(cors());

//Routes
app.post("/login", async (req,res)=>{
    const data = await pool.query("SELECT * FROM users WHERE username = '"+req.body.username+"';");
    // const data = await client.query("SELECT * FROM users WHERE username = '"+req.body.username+"';");
    if(!data.rows[0]) res.json({error:"Incorect username or password!"});
    else{
        const hashed_p = data.rows[0].hashed_p;
        const match = await bcrypt.compare(req.body.password, hashed_p);
        if(match){
            const token = await jwt.generateToken({
                id:data.rows[0].id,
                username:req.body.username
            });
            res.json({
                error:false,
                token:token
                });
        }
        else {
            res.json({error:"Incorect username or password!"});
        }
    }
});

app.post("/register" , async (req,res)=>{
    const checkUser = await pool.query("SELECT COUNT(id) FROM users WHERE username = '"+req.body.username+"'");
    // const checkUser = await client.query("SELECT COUNT(id) FROM users WHERE username = '"+req.body.username+"'");
    if(checkUser.rows[0].count != 0) res.json({
        error:"This username is already used"
    })
    else{
            bcrypt.hash(req.body.password, saltRounds, async function(err, hash) {
                await pool.query(`INSERT INTO users (username,email,hashed_p) 
                VALUES ('${req.body.username}','${req.body.email}','${hash}');`);
                // await client.query(`INSERT INTO users (username,email,hashed_p) 
                // VALUES ('${req.body.username}','${req.body.email}','${hash}');`);
            });
            res.json({error:false});
        }
});

app.post("/addtodo" , async (req,res)=>{
    const decode = jwtDecode(req.body.token);
    await pool.query("INSERT INTO chores (username,todo,done) VALUES ('"+decode.username+"','"+req.body.todo+"',false)");
    // await client.query("INSERT INTO chores (username,todo,done) VALUES ('"+decode.username+"','"+req.body.todo+"',false)");
    console.log(req.body.todo);
    res.json(req.body.todo);
})

app.post("/deltodo" , async (req,res)=>{
    const decode = jwtDecode(req.body.token);
    await pool.query("UPDATE chores SET done = true WHERE todo = '"+req.body.todo+"'");
    // await client.query("UPDATE chores SET done = true WHERE todo = '"+req.body.todo+"'");
    res.json({error:false});
})

app.post("/gettodo" , async (req,res)=>{
    if(!req.body.token) res.json({error:"invalid token"})
    else{
        const decode = jwtDecode(req.body.token);
        const data = await pool.query("SELECT * FROM chores WHERE username = '"+decode.username+"' ORDER BY id");
        const no = await pool.query("SELECT * FROM chores WHERE username = '"+decode.username+"' AND done = false ORDER BY id");
        // const data = await client.query("SELECT * FROM chores WHERE username = '"+decode.username+"' ORDER BY id");
        res.json({
            error:false,
            data:data.rows,
            username:decode.username,
            no:no.rows.length
            });
    }
})

app.listen(process.env.PORT || 5000 , ()=>{
    console.log(`App running on port ${process.env.PORT}!`);
});