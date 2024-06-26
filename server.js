const path = require("path");
const express = require("express");
const session = require("express-session");
const exphbs = require("express-handlebars");
const routes = require("./controllers");
const sequelize = require("./config/connection");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const helpers = require("./utils/helpers");
const helmet = require("helmet");

const app = express();

const PORT = process.env.PORT || 3001;

// This disables the Content-Security-Policy
// and X-Download-Options headers.
app.use(
  helmet({
    contentSecurityPolicy: false,
    xDownloadOptions: false,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "connect-src": [
          "'self'",
          "https://exercises-by-api-ninjas.p.rapidapi.com/v1/exercises",
          "https://gym-fit.p.rapidapi.com/exercises/search",
          "gym-fit.p.rapidapi.com",
        ],
      },
    },
  })
);

const hbs = exphbs.create({ helpers });

const sess = {
  secret: "Super secret secret",
  cookie: {},
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize,
  }),
};

app.use(session(sess));

// Inform Express.js on which template engine to use
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(routes);

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log("Now listening"));
});