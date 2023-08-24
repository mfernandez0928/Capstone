const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookie_parser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
const hbs = require('hbs');
const app = express();
const port = 8080;

dotenv.config({path:'./.env'});
app.set("view engine", "hbs");
hbs.registerPartials(__dirname + '/views/layouts/partials')
hbs.registerPartials(__dirname + '/views/layouts/partials/employee/')
hbs.registerPartials(__dirname + '/views/layouts/partials/admin')
app.use(express.static(path.join(__dirname, "./public/")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookie_parser());
app.use(session({
    secret: 'codeforgeek',
    saveUninitialized: true,
    resave: true
}))

app.use(flash());

app.use('/', require('./routes/auth'));
app.use('/register', require('./routes/register'));
app.use('/admin', require('./routes/admin'));
app.use('/employee', require('./routes/employee'));
app.use("/user", require("./routes/user"));

app.get('/', (req, res) => {
    res.redirect('/login')
})

app.listen(port, () => {
    console.log("Server is running. Port is " + port);
})

hbs.registerHelper('if_eq', function(a, b, opts) {
  if (a == b) {
      return opts.fn(this);
  } 
  
  return opts.inverse(this);
});

hbs.registerHelper('if_like', function(a, b, opts) {
  if (a.includes(b)) {
      return opts.fn(this);
  } 
  
  return opts.inverse(this);
});

hbs.registerHelper('dateFormat', require('handlebars-dateformat'));