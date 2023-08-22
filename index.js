const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cookie_parser = require("cookie-parser");

const app = express();
const port = 7777;

dotenv.config({ path: "./.env" });
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookie_parser());

app.use("/", require("./routes/registerRoutes"));
app.use("/admin", require("./routes/admin"));
app.use("/user", require("./routes/user"));

app.listen(port, () => {
  console.log("Server is running.");
});
