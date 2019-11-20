//loops through url db and checks for urls that belong to a specific user.
const urlsForUserId = function(user_id, db) {
  // console.log("urlsForUserID INITIATED AND RUNNING 😇")
  const userDB = {};
  for (const item in db) {
    if (user_id === db[item].userID) {
      userDB[item] = db[item].longURL;
    }
  }
  return userDB;
};

//loops through a user object and checks for match in email.
const getUserByEmail = function(eToFind, obj) {
  // console.log("/\/\//\/\//\/\/\/\\//\/\\/\//\/\//\/getUserByEmail ENGAGED!!!")
  for (const user in obj) {
    if (eToFind === obj[user].email) {
      // console.log(users[user].email)
      return obj[user];
    }
  }
};

module.exports = {
  urlsForUserId,
  getUserByEmail
};
