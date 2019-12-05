const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const { getUserByEmail } = require("./helpers.js");
const bcrypt = require("bcrypt");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(
  cookieSession({
    name: "user_id",
    keys: ["cat"],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);

//user database
const users = {
  "1": {
    id: "1",
    email: "123@123.com",
    password: "123"
  },
  "2": {
    id: "2",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
//url database
const urlDatabase = {
  b6UTxQ: { longURL: "http://www.tsn.ca", userID: "1" },
  i3BoGr: { longURL: "http://www.google.ca", userID: "2" }
};

let userURLS = function(userID) {
  let filteredURLS = {};
  for (let url in urlDatabase) {
    if (userID === urlDatabase[url].userID) {
      filteredURLS[url] = urlDatabase[url];
    }
  }
  return filteredURLS;
};

function generateRandomString() {
  Math.random()
    .toString(36)
    .slice(-6);
  return Math.random()
    .toString(36)
    .slice(-6);
}

//register page
app.post("/register", (req, res) => {
  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.status(400).send("No empty fields!");
  }
  for (key in users) {
    if (users[key].email === req.body.email) {
      res.status(400).send("Email already registered.");
    }
  }
  let newUser = {
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
    id: generateRandomString()
  };
  users[newUser.id] = newUser;
  req.session.user_id = ("user_id", newUser.id);
  res.redirect("/urls");
});

//login
app.post("/login", (req, res) => {
  const body = req.body;
  let user = getUserByEmail(body.email, users);
  if (!user) {
    res.status(403).send("Email is not registered.");
  }
  if (bcrypt.compareSync(body.password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.status(403).send("Wrong password or email.");
  }
});

//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//edit post
app.post("/urls/:shortURL/", (req, res) => {
  let userID = req.session.user_id;
  if (userID === undefined) {
    res.redirect(req.body.longURL);
  } else if (userID !== urlDatabase[req.params.shortURL].userID) {
    res
      .status(403)
      .send("Not your place to access! (Belongs to a different user");
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect(`/urls`);
  }
});

//delete post
app.post("/urls/:shortURL/delete", (req, res) => {
  let userID = req.session.user_id;
  let shortURL = req.params.shortURL;
  if (userID === undefined) {
    res.status(403).send("You should log in");
  } else if (userID !== urlDatabase[req.params.shortURL].userID) {
    res
      .status(403)
      .send("Not your place to access! (Belongs to a different user");
  } else {
    console.log(shortURL);
    delete urlDatabase[shortURL];

    res.redirect("/urls");
  }
});

//new
app.post("/urls", (req, res) => {
  let userID = req.session.user_id;
  shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/register", (req, res) => {
  let userID = req.session.user_id;
  let templateVars = {
    user_id: req.session.user_id,
    urls: urlDatabase,
    user: users[userID]
  };
  res.render("urls_register", templateVars);
});

//shorturl to longurl redirect
app.get("/u/:shortURL", (req, res) => {
  let userID = req.session.user_id;
  const longURL = "http://" + urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//displays page for /urls/new
app.get("/urls/new", (req, res) => {
  let userID = req.session.user_id;
  let templateVars = {
    user_id: req.session.user_id,
    urls: urlDatabase,
    user: users[userID]
  };

  if (userID) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  let userID = req.session.user_id;
  let templateVars = {
    user_id: req.session.user_id,
    urls: urlDatabase,
    user: users[userID]
  };
  res.render("urls_login", templateVars);
});

//homepage template
app.get("/urls", (req, res) => {
  let templateVars = {};
  let userID = req.session.user_id;
  if (userID === undefined) {
    templateVars = { ...templateVars, login: false };
    res.render("urls_index", templateVars);
  } else {
    const goodURL = userURLS(userID);
    templateVars = {
      ...templateVars,
      login: true,
      urls: goodURL,
      user: users[userID]
    };

    res.render("urls_index", templateVars);
  }
});

//displays url list
app.get("/urls/:shortURL", (req, res) => {
  let userID = req.session.user_id;
  let shortURL = req.params.shortURL;

  if (userID !== urlDatabase[req.params.shortURL].userID) {
    res.status(403).send("You aren't the right user!");
  } else {
    let templateVars = {
      user_id: req.session.user_id,
      urls: urlDatabase,
      user: users[userID],
      shortURL: shortURL,
      longURL: urlDatabase[shortURL]
    };
    res.render("urls_show", templateVars);
  }
});

//redirects to /urls
app.get("/", (req, res) => {
  let userID = req.session.user_id;
  if (userID === undefined) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

//displays json information of urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
