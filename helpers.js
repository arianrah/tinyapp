//Checks for urls of current user
const urlsForUserId = function(user_id, db) {
  const userDB = {};
  for (const item in db) {
    if (user_id === db[item].userID) {
      userDB[item] = db[item].longURL;
    }
  }
  return userDB;
};

//Verifies email
const getUserByEmail = function(email, users) {
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return undefined;
};

module.exports = { getUserByEmail };

module.exports = {
  urlsForUserId,
  getUserByEmail
};
