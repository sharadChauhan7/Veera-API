import axios from 'axios';
import User from '../models/user.modal.js';
class PriorityQueue {
    constructor(comparator = (a, b) => a - b) {
        this._heap = [];
        this._comparator = comparator;
    }

    size() {
        return this._heap.length;
    }

    isEmpty() {
        return this.size() === 0;
    }

    peek() {
        return this._heap[0];
    }

    push(...values) {
        values.forEach(value => {
            this._heap.push(value);
            this._siftUp();
        });
        return this.size();
    }

    pop() {
        const poppedValue = this.peek();
        const bottom = this.size() - 1;
        if (bottom > 0) {
            this._swap(0, bottom);
        }
        this._heap.pop();
        this._siftDown();
        return poppedValue;
    }

    _greater(i, j) {
        return this._comparator(this._heap[i], this._heap[j]) > 0;
    }

    _swap(i, j) {
        [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
    }

    _siftUp() {
        let node = this.size() - 1;
        while (node > 0 && this._greater(node, Math.floor((node - 1) / 2))) {
            this._swap(node, Math.floor((node - 1) / 2));
            node = Math.floor((node - 1) / 2);
        }
    }

    _siftDown() {
        let node = 0;
        while (
            (node * 2 + 1 < this.size() && this._greater(node * 2 + 1, node)) ||
            (node * 2 + 2 < this.size() && this._greater(node * 2 + 2, node))
        ) {
            let maxChild = (node * 2 + 2 < this.size() && this._greater(node * 2 + 2, node * 2 + 1)) ? node * 2 + 2 : node * 2 + 1;
            this._swap(node, maxChild);
            node = maxChild;
        }
    }
}

function kClosestPoints(points, x, y, k) {
    const pq = new PriorityQueue((a, b) => b.distance - a.distance);

    points.forEach(point => {
        const distance = Math.sqrt((point.coordinates[0] - x) ** 2 + (point.coordinates[1] - y) ** 2);
        pq.push({ ...point, distance });

        if (pq.size() > k) {
            pq.pop();
        }
    });

    const result = [];
    while (!pq.isEmpty()) {
        result.push(pq.pop());
    }

    return result;
}


export const sendSoS = async (req, res) => {
    // Send Sms to emergency contact
    // Get Current Location
    // Send Location to emergency contact
    // console.log(req.body);
    // console.log(req.body.emergencyContact);
    console.log("sos detected");
    const { location, name = "Sharad", gender = "Girl", k = 3 } = req.body;


    const coordinates = [req.body.location.coords.latitude, req.body.location.coords.longitude];
    // console.log(coordinates);
    // res.send("Working sos");

    if (!coordinates || k === undefined) {
        return res.status(400).send('Invalid input');
    }

    //THIS POINTS ARRAY IS TO BE FETCHED FROM DATABASE COLLECTION OF USERS WHERE VOLUNTEER = TRUE 
    const points = [
        { coordinates: [27.5312, 79.8455], phone: '+918273619318' }, // Hraryana
        { coordinates: [27.497462965783534, 77.68341135617429], phone: '+919634879999' }, // Mathura
        { coordinates: [27.1752554, 78.0098161], phone: '+916395134456' },  // Agra
    ];


    const closestPoints = kClosestPoints(points, coordinates[0], coordinates[1], k);

    // Sending sms to closest people
    closestPoints.map((item) => {

        const data = {
            phone_number: item.phone,
            message: `I need help. My name is ${name}, and i am in a danger, and I am at https://www.google.com/maps/dir/?api=1&destination=${coordinates[0]},${coordinates[1]}  `
        };

        axios.post('https://nomorenirbhaya.pythonanywhere.com/api/send-message/', data)
            .then(response => {
                console.log(`Message sent to ${item.phone}: ${response.data}`);
            })
            .catch(error => {
                console.error(`Error sending message to nearest  ${item.phone}: ${error}`);
            });
    });

    //Sending SMS to Emergency Contacts
    
    console.log("BNotify");
    req.body.emergencyContact.forEach((contact) => {

        const data = {
            phone_number: '+91' + contact.phone,
            message: `Hey ${contact.name} we think ${name} is in  danger, and He is at https://www.google.com/maps/dir/?api=1&destination=${coordinates[0]},${coordinates[1]}  `
        };

        axios.post('https://nomorenirbhaya.pythonanywhere.com/api/send-message/', data)
            .then(response => {
                console.log(`Message sent to ${contact.phone}: ${response.data}`);
            })
            .catch(error => {
                console.error(`Error sending message to emergency ${contact}: ${error}`);
            });

        User.findOne({ phone: contact.phone }).then((emergencyUser) => {
            if (!emergencyUser) {
                return;
            }
            console.log("User found");
            async function sendNotify() {
                try {
                    let res = await axios.post(`https://app.nativenotify.com/api/indie/notification`, {
                        subID: 'Abc@gmail.com',
                        appId: 23095,
                        appToken: 't7U6tMbwevUKc9gC7Eddsf',
                        title: 'Help message',
                        message: 'Indi Message send to emergency contact',
                        pushData: JSON.stringify({ "link": `https://www.google.com/maps/dir/?api=1&destination=${coordinates[0]},${coordinates[1]}` }),
                    });
                    console.log("Notification sent");
                }
                catch (err) {
                    console.log(err);
                    console.log("Notification not sent");
                }
            }
            sendNotify();
        })
    })
let msg ={
    message: `${req.body.name} is in Danger`,
    name: req.body.name,
    phone_number: req.body.phone,
    email: req.body.email,
    latitude: coordinates[0],
    longitude: coordinates[1]
  }
    try{
        console.log(JSON.stringify(msg));
        let res = await axios.post('http://13.234.217.68:8000/dashboard/api/sos-call/',JSON.stringify(msg));
        console.log(res.data);
    }
    catch(e){
        console.log(e);
    }


    res.send('SOS messages sent successfully');
}

export const wellNess=async(req,res)=>{
    async function sendNotify() {
        try {
            let result = await axios.post(`https://app.nativenotify.com/api/indie/notification`, {
                subID: 'Abc@gmail.com',
                appId: 23095,
                appToken: 't7U6tMbwevUKc9gC7Eddsf',
                title: 'WellNess message',
                message: 'WellNess msg send to emergency contact',
                pushData: JSON.stringify({ "response": `OK` }),
            });
            console.log("Notification sent");
        }
        catch (err) {
            console.log(err);
            console.log("Notification not sent");
        }
    }
    setInterval(sendNotify, 1000*60*2);
}