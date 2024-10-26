import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import 'dotenv/config'


let url=process.env.MONGO_URL;

main().then((res)=>{console.log("Connection is up")}).catch(err => console.log(err));
console.log("Hello");

async function main() {
  await mongoose.connect(url);
}


const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        min:10,
        default:null,
        unique:false
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },

    emergencyContact:[{
        name:{
            type:String,
            default:null,
        },
        phone:{
            type:Number,
            min:10,
        default:null,
        default:null
        }
    }],
    role:{
        type:String,
        default:"User"
    },
    location: {
        type: {
          type: String, 
          enum: ['Point'], 
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      }
    
});

const User = mongoose.model('User',userSchema);

export default User;