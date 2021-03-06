const bcrypt = require("bcrypt");
const validator = require("validator");

const User = require("../model/user");

const jwt = require("jsonwebtoken");

const Post = require("../model/post");

const path = require("path");

const fs = require("fs");

module.exports = {
  createUser: async function(/*args*/ { userInput }, req) {
    // const email = args.userInput.email;
    const errors = [];
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: "Email is invalid!" });
    }
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ message: "Password is too short!" });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input!");
      error.data = errors;
      error.code = 422;

      throw error;
    }

    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      const error = new Error("User exists!");
      throw error;
    }

    const hash = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hash
    });

    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },

  login: async function({ email, password }) {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("User not exist!");
      error.code = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("User not exist!");
      error.code = 401;
      throw error;
    }
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      "i_use_rifa_to_secure",
      { expiresIn: "1h" }
    );

    return { token: token, userId: user._id.toString() };
  },

  createPost: async function({ postInput }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }

    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("Invalid user!");
      error.code = 401;
      throw error;
    }

    const errors = [];
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: "Title is invalid!" });
    }
    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 5 })
    ) {
      errors.push({ message: "Content is invalid!" });
    }

    if (errors.length > 0) {
      const error = new Error("Invalid input!");
      error.data = errors;
      error.code = 422;

      throw error;
    }

    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      imageUrl: postInput.imageUrl,
      creator: user
    });

    const createdPost = await post.save();

    user.posts.push(createdPost);
    await user.save();
    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString()
    };
  },

  getPosts: async function({ page }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }

    if (!page) {
      page = 1;
    }

    const perPage = 2;

    const totalPosts = await Post.find().countDocuments();
    const posts = await Post.find()
      .skip((page - 1) * perPage)
      .limit(page * perPage)
      .sort({ createdAt: -1 })
      .populate("creator");

    return {
      posts: posts.map(p => {
        return {
          ...p._doc,
          _id: p._id.toString(),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString()
        };
      }),
      totalPosts: totalPosts
    };
  },

  getPost: async function({ id }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }

    const post = await Post.findById(id).populate("creator");
    if (!post) {
      const error = new Error("No post found!");
      error.code = 404;
      throw error;
    }

    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    };
  },

  updatePost: async function({ id, postInput }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }

    const post = await Post.findById(id).populate("creator");
    if (!post) {
      const error = new Error("No post found!");
      error.code = 404;
      throw error;
    }

    if (post.creator._id.toString() !== req.userId.toString()) {
      const error = new Error("Not authenticated!");
      error.code = 403;
      throw error;
    }

    const errors = [];
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: "Title is invalid!" });
    }
    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 5 })
    ) {
      errors.push({ message: "Content is invalid!" });
    }

    if (errors.length > 0) {
      const error = new Error("Invalid input!");
      error.data = errors;
      error.code = 422;

      throw error;
    }

    post.title = postInput.title;
    post.content = postInput.content;

    if (postInput.imageUrl !== "undefined") {
      clearImage(post.imageUrl);
      post.imageUrl = postInput.imageUrl;
    }
    const updatedPost = await post.save();
    return {
      ...updatedPost._doc,
      _id: updatedPost._id.toString(),
      updatedAt: updatedPost.updatedAt.toISOString(),
      createdAt: updatedPost.createdAt.toISOString()
    };
  },

  deletePost: async function({ id }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }

    const post = await Post.findById(id).populate("creator");
    if (!post) {
      const error = new Error("No post found!");
      error.code = 404;
      throw error;
    }

    if (post.creator._id.toString() !== req.userId.toString()) {
      const error = new Error("Not authenticated!");
      error.code = 403;
      throw error;
    }

    const creator = await User.findById(post.creator._id);
    creator.posts = creator.posts.filter(p => {
      return p.toString() !== id.toString();
    });

    await creator.save();

    clearImage(post.imageUrl);
    await post.delete();
    return true;
  }
};

const clearImage = filePath => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, err => {
    if (err) {
      console.log(err);
    }
  });
};
