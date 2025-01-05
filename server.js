const express = require("express");
const Admin = require("./model/admin");
const app = express();
const bcrypt = require("bcrypt");
const db = require("./db.js");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");
db();

app.use(express.static("Public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,"frontend")));

const auth = require("./auth.js")

app.post("/admin", async (req, res) => {
    try {
        const data = req.body;
        const newAdmin = new Admin(data);
        const response = await newAdmin.save();
        res.status(200).json(response);
    } catch (err) {
        console.log("Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    // Check if all fields are provided
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    };

    try {
        const existingAdmin = await Admin.findOne({ name: username });
        if (existingAdmin) {
            return res.status(401).json({ message: "Admin already exists" });
        }

        //hash password
        const hashedPasword = await bcrypt.hash(password, 10);

        //Create new admin
        const newAdmin = new Admin({
            name: username,
            email: email,
            password: hashedPasword
        });

        // Save the new admin to the database
        await newAdmin.save();

        // Send a success response
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})

const Jwt_token = "1234";
app.post("/login", async (req, res) => {
    //Admin login route
    const { username, password } = req.body;

    //check if both fields are required
    if (!username || !password) {
        return res.status(400).json({ message: "required email and password" })
    };

    try {
        //find admin by name
        const admin = await Admin.findOne({ name: username });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        };


        // Debugging: Log password and hash
        console.log('Provided password:', password);
        console.log('Hashed password from DB:', admin.password);

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Wrong Password.' });
        };

        console.log("Password Match:", isMatch);

        // Generate JWT token
        // const payload = {name: Admin.name,email:Admin.email};
        const token = jwt.sign({ usernamename: admin.name, email: admin.email }, Jwt_token);

        // Send success response with token
        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
})

app.get("/admin", async (req, res) => {
    try {
        const response = await Admin.find();
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(401).json({ error: err.message });
    }
});

app.put("/admin/:name", async (req, res) => {
    // const { name, updatedData } = req.body;
    const name = req.params.name;
    const updatedData = req.body;
    try {
        // find admin by email and update
        const updatedAdmin = await Admin.findOneAndUpdate(
            { name: name },  //find admin by email
            { $set: updatedData },     //update fields
            { new: true }      //return and updated  document
        );

        if (!updatedAdmin) {
            return res.status(401).json({ message: "User not found" });
        }
        if (!updatedData) {
            return res.status(401).json({ message: "Data updation required" });
        }
        res.status(200).json({ message: "User updated successfully", data: updatedData })
    } catch (err) {
        res.status(500).json({ error: err.message })
    };
});

app.delete("/admin/:name", async (req, res) => {
    // const { name } = req.body;
    const name = req.params.name;
    if (!name) {
        return res.status(401).json({ message: "name is required" });
    }
    try {
        const deletedUser = await Admin.findOneAndDelete({ name: name });
        if (!deletedUser) {
            return res.status(401).json({ message: "User not found" });
        }
        res.status(200).json({ message: "data deleted successfully", data: deletedUser });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

app.get("/", (req, res) => {
    // console.log("hello its a get request")
    // res.status(200).send("hey! there welcome to our new project.");
    res.sendFile(path.join(__dirname,"frontend","index.html"));
});


app.listen(4001, () => {
    console.log("listening on Port 4001")
});
