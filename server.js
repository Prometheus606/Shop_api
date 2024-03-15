// import requirements
const express = require("express")
const morgan = require('morgan');
const helmet = require("helmet")
const cookieParser = require('cookie-parser')
const cookieSession  = require("cookie-session")
const path = require("path")

// get environment variables
require("dotenv").config()

const app = express()

// Middleware
app.use(express.urlencoded({extended: false, limit: "1mb"}))
app.use(express.json())
app.use(cookieParser())
app.use(helmet())
app.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET],
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }))

// use ether a IP limter (in Production), or use morgan logging
if (process.env.NODE_ENV === 'production') app.use(require("./middleware/limiter"));
  else app.use(morgan('dev'))

// Datebase
app.use(require("./model/db").connectDB) // Connect to the Database
app.use(require("./model/db").disconnectDB) // Disconnects from DB after res send

// Routes
app.use("/product", require("./routes/product"))
app.use("/seller", require("./routes/seller"))
app.use("/order", require("./routes/order"))
app.use("/user", require("./routes/user"))
app.use("/", require("./routes/index"))

// use error handler
app.use(require("./middleware/errorHandler"))


// Start server
app.listen(process.env.PORT || 3000, () => console.log(`Server is Listening on http://localhost:${process.env.PORT || 3000}`))
