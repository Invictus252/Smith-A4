const express = require('express');
const app = express();
const mysql = require('mysql');
const session = require('express-session'); 
const conInfo ={
    host: process.env.IP,
    user: process.env.C9_USER,
    password: "",
    database: "GAMEDB"
};

let con = mysql.createConnection(conInfo);
app.use(session({ secret: 'happy jungle', 
                  resave: false, 
                  saveUninitialized: false, 
                  cookie: { maxAge: 60000 }}))

app.get('/', function(req, res){
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write("<h1>Number Guessing Game</h1>");
  res.write("<p>Use /game to start a new game.</p>");
  res.write("<p>Use /game?guess=num to make a guess.</p>");
  res.end('');
});                  
app.get('/game', function(req, res){
    let result = {};
    // if we have not picked a secret number, restart the game...
    if (req.session.answer == undefined)
    {
        req.session.guesses = 0;
        req.session.answer = Math.floor(Math.random() * 100) + 1;
    }
      
    // if a guess was not made, restart the game...
    if (req.query.guess == undefined)
    {
      result = {'gameStatus' : 'Pick a number from 1 to 100.'}; 
      req.session.guesses = 0;
      req.session.answer = Math.floor(Math.random() * 100) + 1;
    }
    // a guess was made, check to see if it is correct...
    else if (req.query.guess == req.session.answer)
    {
      req.session.guesses = req.session.guesses + 1;
      result = {'gameStatus' : `Correct! It took you ${req.session.guesses} guesses. Play Again!`}; 
      var sql = "INSERT INTO GAME (GUESS_COUNT,SECRET_NUM) VALUES ('" 
                + req.session.guesses + "','" 
                + req.session.answer + "')";    
      con.query(sql,function(err,result){
          if(err) throw err;
          console.log("Query Success @ FUNCTION game || 1 record created @ table GAME");
        });    
      req.session.answer = undefined;
      
    }
    // a guess was made, check to see if too high...
    else if (req.query.guess > req.session.answer)
    {
      req.session.guesses = req.session.guesses + 1;
      result = {'gameStatus' : 'To High. Guess Again!', 'guesses' : req.session.guesses}; 
    }
    // a guess was made, it must be too low...
    else
    {
      req.session.guesses = req.session.guesses + 1;
      result = {'gameStatus' : 'To Low. Guess Again!', 'guesses' : req.session.guesses}; 
    };

    writeResult(req,res,result);
});
app.get('/stats',function(req,res){
    con.query("SELECT MIN(GUESS_COUNT) as best,MAX(GUESS_COUNT) as worst,COUNT(GAME_ID) as gamesPlayed FROM GAME", function (err, result, fields) {
    if (err) 
        writeResult(req, res, {'error' : err});
    else
        console.log("Query Success @ FUNCTION stats || moving to writeResult");
        writeResult(req, res, {'result' : result[0]});   
    });
});
app.listen(process.env.PORT,  process.env.IP, startHandler())

function startHandler()
{
  console.log('Server listening on port ' + process.env.PORT)
}
function writeResult(req, res, obj)
{
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(obj));
  res.end('');
}

