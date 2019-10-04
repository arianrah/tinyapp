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
const bcrypt = require('bcrypt');
const password = "purple-monkey-dinosaur"; // found in the req.params object
const hashedPassword = bcrypt.hashSync(password, 10);

  /////////////////////
 //////FUNCTION///////
/////////////////////


//RANDOM GENERATOR!
const crypto = require("crypto");
const generateRandomString = function() {
  const short = crypto.randomBytes(3).toString('hex');
  return short;
}

//EMAIL LOOKUPS!eEEEEE
const eLookup = function(eToFind) {
  console.log("/\/\//\/\//\/\/\/\\//\/\\/\//\/\//\/eLookup ENGAGED!!!")
  for (const user in users){
    if (eToFind === users[user].email){
      // console.log(users[user].email)
      return true
    }
  }
}

//PW LOOKUPS!6^V^V^V^V^V^V^V^V^V^V^V^
const pwLookup = function(eToFind) {
  console.log("pwLookup ENGAGED!!!/\/\//\/\//\/\/\/\\//\/\\/\//\/\//\/")
  for (const user in users){
    if (eToFind === users[user].password){
      // console.log(users[user].email)
      return true
    }
  }
}
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID"}
};
//compare current user_id with user_id of users obj and return url info
const urlsForUserId = function(user_id){
  console.log("urlsForUserID INITIATED AND RUNNING 😇")
  const userDB = {}
  for (const item in urlDatabase){
    if (user_id === urlDatabase[item].userID){
      userDB[item] = urlDatabase[item].longURL
    }
  }
  return userDB;
}
console.log(urlsForUserId("userRandomID"));

  /////////////////////
 ////////SERVER///////
/////////////////////

//./node_modules/.bin/nodemon -L express_server.js



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
  if (eLookup(email) === true && bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword)) {
    res.cookie("user_id", users["user_id"]) 
    //req.session.user_id = user.id
    res.redirect('/urls')
  } else {
    res.status(403).send("bad login")
  }
  // console.log(users)
  // let username = req.body;
  // let cookieGen = generateRandomString();
  // res.cookie("username", req.body.username)
  // res.redirect("/urls")
});

app.get('/login', (req, res) => {
  let newDB = urlsForUserId(req.cookies["user_id"])
  let templateVars = { urls: newDB, user: users[req.cookies["user_id"]] };
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
  newDB = urlsForUserId(req.cookies["user_id"])
  let templateVars = { urls: newDB, user: users[req.cookies["user_id"]] };
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
  userInfo.password = bcrypt.hashSync(req.body.password, 10);
  res.cookie("user_id", userID);
  // console.log(users)
  res.redirect("/urls");
})

app.get("/urls", (req, res) => {
  if (!req.cookies["user_id"]){
    newDB = urlsForUserId(req.cookies["user_id"])
    let templateVars = { urls: newDB, user: users[req.cookies["user_id"]] };
    res.render("urls_home", templateVars)
  } else {
    newDB = urlsForUserId(req.cookies["user_id"])
    let templateVars = { urls: newDB, user: users[req.cookies["user_id"]] };
    res.render("urls_index", templateVars);
  }
});

//add new
app.get("/urls/new", (req, res) => {
  newDB = urlsForUserId(req.cookies["user_id"])
  let templateVars = {urls: newDB, user: users[req.cookies["user_id"]]}
  // console.log(users)
  // console.log("database")
  console.log(urlDatabase)
  if (!req.cookies["user_id"]){
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});


//CREATE NEW URL!!!!!!!!!!!!!!
app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST req body to the console
  let longURL = req.body;
  // console.log(longURL);
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.cookies["user_id"]
  }
  res.redirect(`/urls/${shortURL}`)
});

//edit page
app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body;
  urlDatabase[shortURL] = {
    "longURL": longURL,
    "userID": users["userID"]
  }
  res.redirect(`/urls/${shortURL}`);
});

//delete 
app.post('/urls/:id/delete', (req, res) => {
  if (!req.cookies["user_id"]){
    res.redirect('/login')
  }else {
    const id = req.params.id;
    delete urlDatabase[id];
    res.redirect('/urls');
  }
});

//longURL not updating on html to proper data **fixed
app.get("/urls/:shortURL", (req, res) => {
  let id = req.params.shortURL;
  newDB = urlsForUserId(req.cookies["user_id"])
  let templateVars = { 
    shortURL: id, 
    urls: newDB,
    user: users[req.cookies["user_id"]]
  }
  // console.log(templateVars)
  res.render("urls_show", templateVars);
});