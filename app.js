const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const passport = require("passport");
const methodOverride = require('method-override')
const morgan = require("morgan");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session);
const connectDB = require("./config/db");

const exphbs = require("express-handlebars");

//load config
dotenv.config({ path: "./config/config.env" });

//passport config
require("./config/passport")(passport);

// load routes
const main = require("./routes/index");
const auth = require("./routes/auth");
const stories = require("./routes/stories");

const app = express();

// body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  })
)

const port = process.env.PORT || 5000;
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// helpers
const {
  formatDate,
  stripTags,
  truncate,
  editIcon,
  select,
} = require('./helpers/hbs')

//view engine
app.engine(
  "hbs",
  exphbs({
    helpers: { formatDate, stripTags, truncate, editIcon ,select},
    defaultLayout: "main",
    extname: "hbs",
  })
);
app.set("view engine", "hbs");

//sessions
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

//passport middlware
app.use(passport.initialize());
app.use(passport.session());

// Set global var
app.use(function (req, res, next) {
  res.locals.user = req.user || null
  next()
})

//static folder
app.use(express.static(path.join(__dirname, "public")));

//routes
app.use("/", main);
app.use("/auth", auth);
app.use("/stories", stories);

connectDB();

app.listen(
  port,
  console.log(
    `server running in ${process.env.NODE_ENV} mode,  on port ${port}  `
  )
);
