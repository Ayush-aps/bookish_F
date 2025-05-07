const bcrypt = require("bcryptjs");

// Replace this with your desired admin password
const plainPassword = "123456";

bcrypt.genSalt(10, (err, salt) => {
  if (err) return console.error(err);
  bcrypt.hash(plainPassword, salt, (err, hash) => {
    if (err) return console.error(err);
    console.log("Hashed Password:", hash);
  });
});
