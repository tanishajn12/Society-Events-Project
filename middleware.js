const Event = require("./models/Event");
const { eventSchema } = require("./schema");
const { reviewSchema } = require("./schema");


const validateEvent = (req,res,next)=> {
    let {name, img, date, time, society, venue, type, desc} = req.body;
    const {error}= eventSchema.validate({name, img, date, time, society, venue, type, desc})
    if(error){
        const msg = error.details.map((err)=>err.message).join(',')
        return res.render('error',{err:msg})
    }
    next();
}

const validateReview = (req,res,next) =>{
    let {rating, comment} = req.body;
    const {error} = reviewSchema.validate({rating, comment})
    if(error){
        const msg = error.details.map((err)=>err.message).join(',')
        return res.render('error',{err:msg})
    }
    next();
}

//middleware to ensure that only logged in user can perform the app functionality
const isLoggedIn = (req,res,next)=>{

    if(req.xhr && !req.isAuthenticated()){
        return res.status(401).send('unauthorised');
        // console.log(req.xhr);//ajax hai ya nhi hai?
    }
    
    //this means user is not logged in -> log in first
    if(!req.isAuthenticated()){
        req.flash('error' , 'You need to login first');
        return res.redirect('/login')
    }
    next();
}

const isAdmin = (req,res,next)=>{
    if(!req.user.role){
        req.flash('error', 'Permissions Denied');
        return res.redirect('/events');
    }
    else if(req.user.role !== "admin"){
        req.flash('error', 'Permissions Denied');
        return res.redirect('/events');
    }

    next();

}

const isEventAuthor = async(req,res,next)=>{
    let {id} = req.params; //event id access
    let event = await Event.findById(id);

    //objects ids cant be compared with == or ===
    //use .equals method
    if(!event.author.equals(req.user._id)){
        req.flash('error', 'Permissions Denied');
        return res.redirect(`/events/${id}`);
    }
    next();
}

module.exports = {validateEvent, validateReview, isLoggedIn, isAdmin,isEventAuthor}