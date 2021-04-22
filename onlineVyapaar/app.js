const express = require('express')
const mongoose = require("mongoose")
const morgan = require("morgan")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
require('dotenv').config()

// Import routes
const userRoutes = require("./routes/user")


// App
const app = express()

// DATABASE
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() => console.log("DB connected"))

// Middleware
// app.use(morgan("dev"))
// app.use(bodyParser.json())
// app.use(cookieParser())

// Routes middleware
app.use("/api", userRoutes);


const port = process.env.PORT || 8000

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});