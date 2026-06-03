import mysql from "mysql2";
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password:process.env.DB_PASSWORD,
    database: "testdb"
});
db.connect((err)=>{
    if(err){
        console.log("Error connecting DB:", err);
    }
    else{
        console.log("DB connected successfully");
    }
});

export default db;