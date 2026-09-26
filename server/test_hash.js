const bcrypt = require("bcrypt");
bcrypt.compare("password123", "$2b$10$hVXxwEND/Zh8SsKXX39xsOdJHktytoywrXxbup5UPWDfdcASP0VlO").then(res => console.log("Match: " + res));
