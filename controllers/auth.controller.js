import User from '../models/user.modal.js'
import jwt from 'jsonwebtoken';
import 'dotenv/config'
import bcrypt from 'bcrypt';

export const signup = async (req, res) => {
    console.log("Signup called");
    try {

        let { name, email, location ,password,phone,emergencyContact } = new User(req.body);
        console.log(req.body.location);
        location = {type:"Point",coordinates:[req.body.location.coords.latitude,req.body.location.coords.longitude]};
        // Check if user already exist
        let userExists = await User.findOne({ email });
        if (userExists) {
            console.log("User already exists");
            return res.status(202).json({ message: "User already exists " });
        }
        bcrypt.hash(password, 15, async function (err, hash) {
            if (err) {
                return res.status(202).json({ message: "Error in hashing password" });
            };
            password = hash
            let user = new User({name, email, password,phone,emergencyContact,location});
            
            await user.save();

            jwt.sign({ user }, process.env.JWT_KEY, { expiresIn: '7d' }, async function (err, token) {
                if (err) {
                    res.send("Error in generating token");
                }
                res.cookie('user', JSON.stringify(user), { httpOnly: true, secure: true });
                // Set the second cookie
                res.cookie('authToken', token, {
                    httpOnly: false,
                    secure: true,
                });
                // Now send the response once after setting both cookies
                res.send({ token: token, user: user });
            });

            // res.send("Working");

        });
    }
    catch (err) {
        // console.log error message
        console.log(err.message);

        res.status(400).send("Error in saving user");
    }
}

export const login = async (req, res) => {
    console.log("Login called");
    try {
        let { email, password,location } = req.body;
        let user = await User.findOne({ email: email });
        // Update user location
        user.location = {type:"Point",coordinates:[location.coords.latitude,location.coords.longitude]};
        await user.save();
        if(user==null){
            return res.status(202).json({ message: "User Not Found " });
        }
        
        const match = await bcrypt.compare(password, user.password);
        if (user && match) {
            jwt.sign({ user }, process.env.JWT_KEY, { expiresIn: '7d' }, async function (err, token) {
                if (err) {
                    return res.status(202).json({ message: "Error in generating token " });
                }
                res.cookie('user', JSON.stringify(user), { httpOnly: true, secure: true });
                // Set the second cookie
                res.cookie('authToken', token, {
                    httpOnly: false,
                    secure: true
                });
                // Now send the response once after setting both cookies
                return res.send({ token: token, user: user });
            });
        }
        else {
            return res.status(202).json({ message: "Invalid Credintial" });;
        }
    } catch (err) {
        console.log(err.message);
        res.status(400).send(err.message);
    }
}

export const getUser = async (req, res) => {
    let {token} = req.body;
    // Verify jwt token 
    jwt.verify(token, process.env.JWT_KEY, function(err, decoded) {
        if(err){
            res.status(400).send("Invalid token");
        }
        else{
            res.status(200).send(decoded);
        }
    });
}

export const updateUser = async (req,res)=>{
    try{
        console.lod("Api called");
        let user = req.body;
        let updatedUser = await User.findByIdAndUpdate(user._id,user,{new:true});
        console.log(updatedUser);
        res.status(200).send("User updated successfully");
    }
    catch(e){
        res.status(400).send("Error in updating user");
    }

}

