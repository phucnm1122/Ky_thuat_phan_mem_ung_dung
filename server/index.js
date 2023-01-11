const express = require('express');
const session = require('express-session');
const MSSQLStore = require('connect-mssql-v2');
const app = express();
const path = require('path');
const dotenv = require('dotenv').config();
const passport = require('passport');
const DBconfig = require('./db/connection').config;
const plantsRouter = require('./routes/plants');
const loginRouter = require('./routes/login');
const adminRouter = require('./routes/admin');
const registerRouter = require('./routes/register');



app.use(express.json());
express.urlencoded({ extended: true });

const options = {
  ttl: 1000 * 60 * 60 * 24,
  autoRemoveInterval: 1800, // check for expired sessions every 30 minutes
};

app.use(
  session({

    store: new MSSQLStore(DBconfig, options),
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    cookie : {
      maxAge: 1000 * 60 * 60 * 24,
    }
  }));
 

app.use(express.static('client'));



require('./routes/lib/passport.js');
app.use(passport.initialize());
app.use(passport.session());


app.use('/', plantsRouter);
app.use('/', loginRouter);
app.use('/', adminRouter);

app.use('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.use('/', registerRouter);



app.get('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, "../client/404.html"));
});

const port = 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
