const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user:"root",
    password:"Sound#777",
    database:"ONLINE_FORUM"
});

db.connect((err)=>{
    if(err){
        console.log("Database connection failed");
    }
    else{
        console.log("Database connected");
    }
});

app.post("/register",(req,res) => {
    console.log(req.body);
    const {username, email, password} = req.body;
    const sql = "INSERT INTO USERS (username, email, password) VALUES(?, ?, ?)";

    db.query(sql,[username, email, password], (err, result) => {
        if(err) return res.json({message : "Error"});
        res.json({message:"Registration Successful"});
    });
});

app.post("/login", (req,res) =>{
    const {email, password} = req.body;
    const sql = "SELECT * FROM USERS WHERE email = ? AND password = ?";

    db.query(sql,[email,password], (err,result) =>{
        if(result.length > 0) return res.json({message:"Login successfull"});
        else res.json({message :"Invalid email or password"});
    });
});

app.listen(3000,() =>{
    console.log("Server running in port 3000");
});