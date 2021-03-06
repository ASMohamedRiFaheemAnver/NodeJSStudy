const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const path = require("path");

const fs = require("fs");

const multer = require("multer");

const app = express();

const graphqlHttp = require("express-graphql");
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");

const auth = require("./middleware/auth");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "|" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorizaition");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// app.use(bodyParser.urlencoded()); // x-www.form-urlencoded
app.use(bodyParser.json()); // application/json

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use("/images", express.static(path.join(__dirname, "images")));

app.use(auth);

app.put("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    const error = new Error("Not authenticated!");
    error.code = 401;
    throw error;
  }

  if (!req.file) {
    return res.status(200).json({ message: "No file provided!" });
  }
  // if (req.body.oldPath) {
  //   clearImage(req.body.oldPath);
  // }
  return res
    .status(201)
    .json({ message: "File stored!", filePath: req.file.path });
});

app.use(
  "/graphql",
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
      if (!err.originalError) {
        return err;
      }

      const data = err.originalError.data;
      const message = err.message || "An error occured!";
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
    },
  })
);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode;
  const messages = error.messages;
  const data = error.data;
  res.status(status).json({ messages: messages, data: data });
});

mongoose
  .connect("mongodb://localhost:27017/messages", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((_) => {
    const dir = path.join(__dirname, "images");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    app.listen(8080, () => {
      console.log("Server is running on localhost:" + 8080);
    });
  })
  .catch((err) => {
    console.log(err);
  });
