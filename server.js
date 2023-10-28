import app from "./app.js";
import connectDB from "./config/database.js";
import { config } from "dotenv";

config({
  path:"./config/config.env"
})

// Connectig Database
connectDB();



const port = process.env.PORT || 4000;
app.listen(port, function () {
  console.log(`listening on port ${port} `);
});


import ErrorMiddle from "./middlewares/Error.js";
app.use(ErrorMiddle)