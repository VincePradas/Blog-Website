const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const dbURI =
  "mongodb+srv://pradasvince:vince691@blog-data.tkrucwg.mongodb.net/";
const BLOG = require("./models/blog");
const bodyParser = require("body-parser");
const path = require('path');
let currentPage;

mongoose
  .connect(dbURI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

const viewPath = path.join(__dirname, '/render');
app.set("view engine", "ejs");
app.set('views', viewPath);

// Routes
app.get('/', (req,res)=>{
  res.redirect('/home');
});

app.get('/home', (req,res)=>{
  res.render("home.ejs",{currentPage: 'home'});
});

app.post("/add-blog", async (req, res) => {
  try {
    const { title, author, subtitle, body, category } = req.body;
    const save = new BLOG({ 
      title: title,
      author: author,
      subtitle: subtitle,
      body: body,
      category: category
    });
    console.log("Data received:", req.body);
    await save.save();
    res.redirect('/blogs');
  } catch (err) {
    console.error("Error adding blog post:", err);
    res.status(500).send(err, "Internal server error");
  }
});

app.get("/blogs", async (req, res) => {
  try {
    const blogs = await BLOG.find().sort({createdAt: -1});
    res.render("index.ejs", { title: "Home", blogs: blogs, publicPath, currentPage});
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).send(err, "Internal server error, sa views");
  }
});

app.get("/about", async (req, res) => {
  try {
    res.render("about.ejs", { title: "About",publicPath, currentPage: 'about'});
  } catch (err) {
    console.log(err, "Internal error");
    res.status(500).send(err, "Internal server error");
  }
});

app.get("/create", (req, res) => {
  try {
    res.render("create.ejs", { title: "New Blog",publicPath, currentPage: 'create'});
  } catch (err) {
    res.status(500).send(err, "Internal server error");
  }
});

app.get('/blogs/delete/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (id) {
      // Find the blog post by ID and delete it
      await BLOG.findByIdAndDelete(id);
      res.status(200).json({ message: 'Blog post deleted successfully' });
    } else {
      res.status(404).json({ message: 'Blog post not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/blogs/view/:id', async (req,res)=>{ 
  const id = req.params.id;
  const blog = await BLOG.findById(id);
  res.render('single-page.ejs', {title: 'View', id, currentPage, blog: blog});
});

app.post('/blogs/view/edit/:id', async (req, res) => {
  const id = req.params.id;
  const update = { body: req.body.body };
  console.log(update);

  try {
    const updatedBlog = await BLOG.findByIdAndUpdate(id, update, { new: true });

    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.use((req, res) => {
  res.render("404.ejs", { title: "404", currentPage: req.url });
});

module.exports = app;