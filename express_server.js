/*
need assistance on:
  cookies login
  where to save username
  proper route usage(?)
*/

const express = require("express");
const app = express();
const port = 8080;
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const cookies = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookies());

//./node_modules/.bin/nodemon -L express_server.js

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const user = {

}

app.get("/", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] }
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
  let username = req.body;
  // let cookieGen = generateRandomString();
  res.cookie("username", username.username)
  res.redirect("/urls")
});

app.post('/logout', (req, res) => {
  res.clearCookie('user')
  console.log(req.cookies.username);
  res.redirect("/urls")
})

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: req.cookies.username };
  let user =  templateVars.user;
  // console.log("username test", templateVars.user);
  // console.log(username);
  res.render("urls_index", templateVars);
});

//add new
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
    username: req.cookies["username"]
  };
  // console.log(urlDatabase[id]);
  res.render("urls_show", templateVars);
});

  /////////////////////
 //////FUNCTION///////
/////////////////////

const crypto = require("crypto");
const generateRandomString = function() {
  const short = crypto.randomBytes(3).toString('hex');
  return short;
}
