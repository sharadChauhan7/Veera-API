import express from 'express';
import cors from 'cors';
import axios from 'axios'
import Auth from './routes/auth.route.js'
import SOS from './routes/sos.route.js'
import twilio from 'twilio';
const app = express();

// Basic middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.listen(3000, () => {
    console.log('Server running on port 3000');
});




app.use('/api/auth',Auth);
app.use('/api/help',SOS);


app.get('/',async (req,res)=>{
    console.log("Help");
    res.send("Help");
})