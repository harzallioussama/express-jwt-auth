const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const sanitizer = require("perfect-express-sanitizer");

const app = express();

dotenv.config({ path: "./config.env" });

const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
// console.log(process.env);

app.use(express.json());
app.use(cookieParser());
app.use(
  sanitizer.clean({
    xss: true,
    sql: true,
  })
);

app.use(authRoute);
app.use(userRoute);

app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: "Page not found!",
  });
});

app.use((err, req, res, next) => {
  // console.log(err) ;
  if (err.op) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "Error",
      message: "something went wrong!",
      // status: err.status,
      // message: err.message,
    });
  }
});

app.listen(3000);
