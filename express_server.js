const express = require("express");
const app = express();
const port = 8080;
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const cookies = require("cookie-parser");
const {getUserByEmail, urlsForUserId} = require('./helpers')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookies());
const bcrypt = require('bcrypt');

var cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'user_id',
  keys: ['lol'],
  maxAge: 24 * 60 * 60 * 1000
}))

const crypto = require("crypto");
const generateRandomString = function() {
  const short = crypto.randomBytes(3).toString('hex');
  return short;
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID"}
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
  let templateVars = { urls: urlDatabase, username: req.cookies.username, user: users[req.session.user_id] }
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
  let user = getUserByEmail(email, users);
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session['user_id'] = user.id;
    res.redirect('/urls')
  } else {
    res.status(403).send("bad login")
  }
});

app.get('/login', (req, res) => {
  let newDB = urlsForUserId(req.session.user_id, urlDatabase)
  let templateVars = { urls: newDB, user: users[req.session.user_id] };
  res.render('urls_login', templateVars);
})

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/urls")
})

app.get("/register", (req, res) => {
  newDB = urlsForUserId(req.session.user_id)
  let templateVars = { urls: newDB, user: users[req.session.user_id] };
  res.render("register", templateVars)
})

app.post("/register", (req, res) => {

  if (req.body.email == "" || req.body.password == ""){
    res.status(400).send("EMAIL OR PASSWORD IS EMPTY!!😡");
  }

  if (getUserByEmail(req.body.email, users)){
    res.status(400).send("EMAIL ALREADY IN USE!!😡");
  }

  const userID = generateRandomString();
  users[userID] = {};
  let userInfo = users[userID];
  let password = req.body.password;
  userInfo.id = userID;
  userInfo.email = req.body.email;
  userInfo.password = bcrypt.hashSync(password, 10);
  req.session.user_id = userID;
  res.redirect("/urls");
})

app.get("/urls", (req, res) => {
  if (!req.session.user_id){
    newDB = urlsForUserId(req.session.user_id, urlDatabase)
    let templateVars = { urls: newDB, user: users[req.session.user_id] };
    res.render("urls_home", templateVars)
  } else {
    newDB = urlsForUserId(req.session.user_id, urlDatabase)
    let templateVars = { urls: newDB, user: users[req.session.user_id] };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  newDB = urlsForUserId(req.session.user_id, urlDatabase)
  let templateVars = {urls: newDB, user: users[req.session.user_id]}
  if (!req.session.user_id){
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  let longURL = req.body;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.session.user_id
  }
  res.redirect(`/urls/${shortURL}`)
});

app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body;
  urlDatabase[shortURL] = {
    "longURL": longURL,
    "userID": users["userID"]
  }
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:id/delete', (req, res) => {
  if (!req.session.user_id){
    res.redirect('/login')
  }else {
    const id = req.params.id;
    delete urlDatabase[id];
    res.redirect('/urls');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let id = req.params.shortURL;
  newDB = urlsForUserId(req.session.user_id, urlDatabase)
  let templateVars = { 
    shortURL: id, 
    urls: newDB,
    user: users[req.session.user_id]
  }
  res.render("urls_show", templateVars);
});