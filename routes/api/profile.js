const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const { check , validationResult} = require('express-validator');
const request = require('request');
const config = require('config');


//@route    GET api/profile/me
//@desc     Get current user profile
//@access   Private
router.get('/me',auth, async (req,res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id }).populate('user',['name','avatar'])
        if(!profile){
            return res.status(400).json({msg: 'There is no profile for this user'})
        }
        res.json(profile);
    } catch (err) {
        console.message(err.message);
        res.status(500).send('Server Error')
    }
})

//@route    POST api/profile
//@desc     Create or Update user profile
//@access   Private

router.post('/', [auth , [
    check('status','Status is Required')
    .not()
    .isEmpty(),
    check('skills','Skills is Required')
    .not()
    .isEmpty(),
]] , async (req,res) => {
    const errors = validationResult(req);
    //!error is kapag my error
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const { company,website,location,bio,status,githubusername,skills,youtube,facebook,twitter,instagram,linkedin } = req.body; 

    //Build Profile Object

    const profileFields = {};
    profileFields.user = req.user.id;

    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }
    
    // Build Social Object
    
    profileFields.social = {}
    if(youtube) profileFields.social.youtube = youtube;
    if(facebook) profileFields.social.facebook = facebook;
    if(twitter) profileFields.social.twitter = twitter;
    if(instagram) profileFields.social.instagram = instagram;
    if(linkedin) profileFields.social.linkedin = linkedin;


    try{
        let profile = await Profile.findOne({ user: req.user.id  })

        if(profile){
            // Update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id }, 
                { $set: profileFields },
                { new: true }
                );
            
            return res.json(profile);
        }

        // Create
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);

    }catch(err){
        console.error(err.message);
        res.status(500).send({ msg: 'Server Error' })
    }
})

//@route    POST api/profile
//@desc     Get all Profile
//@access   Public
// req = request , res = response
// THIS IS HOW TO MAKE A GET METHOD
// THIS IS HOW TO GET ALL USER PROFILES
// POPULATE IS USE WHEN YOU NEED TO GET IN OTHER MODELS
router.get('/' , async (req,res) => {
    try {
        const profiles = await Profile.find().populate('user',['name','avatar'])
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})

//@route    POST api/profile/user/user_id
//@desc     Get Profile by User ID
//@access   Public
// req = request , res = response
// THIS IS HOW TO MAKE A GET METHOD
// THIS IS HOW TO GET A SINGLE USER PROFILE
router.get('/user/:user_id',auth, async (req,res) => {
    try {
        const profile = await Profile.findById({user: req.params.user_id}).populate(['user',['name','avatar']])
        if(!profile){
            return res.send(400).json({msg: 'Profile not found'})
        }
        res.json(profile)
    } catch (err) {
        console.message(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(400).json({msg: 'Profile not found'})
        }
        res.status(500).send('Server Error')
    }
});

//@route    Put api/profile/experience
//@desc     Add profile Experience
//@access   Private
// THIS IS HOW TO ADD AN EXPERIENCE TO THE USER
router.put('/experience',[auth, [
    check('title','Title is Required')
    .not()
    .isEmpty(),
    check('company','Company is Required')
    .not()
    .isEmpty(),
    check('from','From Date is Required')
    .not()
    .isEmpty()
]], async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }
    const {title,company,location,from,to,current,description} = req.body;

    const newExp = {
        title,company,location,from,to,current,description
    }
    try {
        const profile = await Profile.findOne({user: req.user.id });
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.message(err.message);
        res.status(500).send('Server Error')
    }
})

//@route    Put api/profile/education
//@desc     Add profile Education
//@access   Private
// THIS IS HOW TO ADD AN EDUCATION TO THE USER PROFILE
router.put('/education', [auth,[
    check('school','School is Required')
    .not()
    .isEmpty(),
    check('degree','Degree is Required')
    .not()
    .isEmpty(),
    check('fieldofstudy','Field of Study is Required')
    .not()
    .isEmpty(),
    check('from','From date is Required')
    .not()
    .isEmpty()
]] , async(req,res) => {
    const errors = validationResult(req);
    if(!errors){
        return res.status(400).json({ errors: errors.array() })
    }

    const { school,degree,fieldofstudy,from,to,current,description } = req.body;

    const newEduc = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    };

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.education.unshift(newEduc);

        await profile.save();

        res.json(profile)
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error')
    }
});

// @route    DELETE api/profile
// @desc     DELETE Profile , user and posts
// @access   Private
// req = request , res = response
// THIS IS HOW TO MAKE A DELETE METHOD
// THIS IS HOW TO GET DELETE USER , PROFILES , and POSTS
// POPULATE IS USE WHEN YOU NEED TO GET IN OTHER MODELS
router.delete('/education/:educ_id', auth , async (req,res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id});

        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.educ_id);

        profile.education.splice( removeIndex , 1);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})




// @route    DELETE api/profile
// @desc     DELETE Profile , user and posts
// @access   Private
// req = request , res = response
// THIS IS HOW TO MAKE A DELETE METHOD
// THIS IS HOW TO GET DELETE USER , PROFILES , and POSTS
// POPULATE IS USE WHEN YOU NEED TO GET IN OTHER MODELS
router.delete('/' , auth , async (req,res) => {
    try {
        // @todo - remove users posts
        // Remove Profile
        await Profile.findOneAndRemove({ user: req.user.id});
        // Remove User
        await User.findOneAndRemove({ _id: req.user.id});
        res.json({ msg: 'User deleted'});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})

// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete Experience from profile
// @access   Private
// req = request , res = response
// THIS IS HOW TO MAKE A DELETE METHOD FOR PROFILE EXPERIENCE
// THIS IS HOW TO DELETE PROFILE EXPERIENCE
router.delete('/experience/:exp_id' , auth , async (req,res) => {
    try {
        // @todo - remove users posts
        // Remove Profile Experience
        const profile = await Profile.findOne({user: req.user.id});

        // Remove Index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)

        profile.experience.splice(removeIndex,1);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})


// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get('/github/:username', (req,res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}
            /repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: {'user-agent': 'node.js'}
        };
        request(options ,(error,response,body) => {
            if(error) console.error(error);

            if(response.statusCode !== 200){
                return res.status(404).json({msg: 'No Github profile found'})
            }
            res.json(JSON.parse(body))
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})

module.exports = router;
