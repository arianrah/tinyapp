/*
need assistance on:
  cookies login
  where to save username
  proper route usage(?)
*/

  /////////////////////
 ////////CONFIG///////
/////////////////////

const express = require("express");
const app = express();
const port = 3453;
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const cookies = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookies());

  /////////////////////
 //////FUNCTION///////
/////////////////////


//RANDOM GENERATOR!
const crypto = require("crypto");
const generateRandomString = function() {
  const short = crypto.randomBytes(3).toString('hex');
  return short;
}


  /////////////////////
 ////////SERVER///////
/////////////////////

//./node_modules/.bin/nodemon -L express_server.js

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 

  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },

 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies.username, user: users[req.cookies["user_id"]] }
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

//signin things
app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (eLookup(email) === true && pwLookup(password)) {
    res.cookie("user_id", users["user_id"])
    res.redirect('/urls')
  } else {
    res.status(403).send("bad login")
  }
  console.log(users)
  // let username = req.body;
  // let cookieGen = generateRandomString();
  // res.cookie("username", req.body.username)
  // res.redirect("/urls")
});

app.get('/login', (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"], user: users[req.cookies["user_id"]] };
  res.render('urls_login', templateVars);
})

app.post('/logout', (req, res) => {
  // console.log(req.cookies["username"])
  // res.cookie("username", undefined);
  // console.log(req.cookies.username)
  res.clearCookie("user_id");
  res.redirect("/urls")
})

//reg page
app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"], user: users[req.cookies["user_id"]] };
  res.render("register", templateVars)
})

app.post("/register", (req, res) => {

  if (req.body.email == "" || req.body.password == ""){
    res.status(400).send("EMAIL OR PASSWORD IS EMPTY!!😡");
  }

  if (eLookup(req.body.email) === true){
    res.status(400).send("EMAIL ALREADY IN USE!!😡");
  }

  const userID = generateRandomString();
  // console.log("random HEYOOO");
  users[userID] = {};
  // users[userID] = userID;
  // users[userID].email = req.body.email;
  // users[userID].password = req.body.password;
  let userInfo = users[userID];
  userInfo.id = userID;
  userInfo.email = req.body.email;
  userInfo.password = req.body.password;
  res.cookie("user_id", userID);
  console.log(users)
  res.redirect("/urls");
})

//EMAIL LOOKUPS!
const eLookup = function(eToFind) {
  console.log("eLookup ENGAGED!!!/\/\//\/\//\/\/\/\\//\/\\/\//\/\//\/")
  for (const user in users){
    if (eToFind === users[user].email){
      // console.log(users[user].email)
      return true
    }
  }
}
const pwLookup = function(eToFind) {
  console.log("pwLookup ENGAGED!!!/\/\//\/\//\/\/\/\\//\/\\/\//\/\//\/")
  for (const user in users){
    if (eToFind === users[user].password){
      // console.log(users[user].email)
      return true
    }
  }
}


app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"], user: users[req.cookies["user_id"]] };
  // console.log(req.cookies["username"])
  // console.log("username test", templateVars.user);
  // console.log(username);
  res.render("urls_index", templateVars);
});

//add new
app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"], user: users[req.cookies["user_id"]]}
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST req body to the console
  let longURL = req.body;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`http://localhost:${port}/urls/${shortURL}`)
});

//edit (new id page)
app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const {longURL} = req.body;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//delete
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

//longURL not updating on html to proper data
app.get("/urls/:shortURL", (req, res) => {
  let id = req.params.shortURL;
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[id],
    username: req.cookies["username"],
    user: users[req.cookies["userID"]]
  };
  // console.log(urlDatabase[id]);
  res.render("urls_show", templateVars);
});