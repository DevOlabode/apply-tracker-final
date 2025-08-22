const User = require('../models/auth');
const Application = require('../models/apply');

const statuses = ['applied', 'rejected', 'interviewing', 'offer', 'hired'];

module.exports.profile = async(req, res)=>{
    const user = await User.findById(req.user._id);

    const counts = {};
    for (let s of statuses) {
       counts[s] = await Application.countDocuments({ user: req.user._id, status: s });
    }

    res.render('user/show', { user, counts });
};

module.exports.editForm = async(req, res)=>{
    const user = await User.findById(req.user._id).populate('application');
    res.render('user/edit', { user })
};

module.exports.editProfile  = async(req, res)=>{
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        req.flash('error', 'User not found');
        return res.redirect(`/user/${id}`);
    }
    const info = req.body;

    user.firstName = info.firstName;
    user.lastName = info.lastName;
    user.email = info.email;
    user.username = info.username;
    user.bio = info.bio;
    user.location = info.location;
    user.website = info.website;

    await user.save()

    req.flash('success','Successfully Updated Your Profile')
    res.redirect(`/user/${user._id}`)
};

module.exports.changepasswordForm = async(req, res)=>{
    const { id } = req.params;
    const user = await User.findById(id);

    if(!user){
        req.flash('error', 'User does not exist');
        return res.redirect(`/user/${id}`)
    }
    res.render('user/changePassword')
};


module.exports.changepassword = async (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(id);

    if (!user) {
        req.flash('error', 'User does not exist');
        return res.redirect(`/user/${id}`);
    }

    if (newPassword !== confirmPassword) {
        req.flash('error', 'New passwords do not match');
        return res.redirect(`/user/${id}`);
    }

    // ✅ check if current password is correct
    const { user: authenticatedUser, error } = await user.authenticate(currentPassword);
    
    if (error || !authenticatedUser) {
        req.flash('error', 'Current password is incorrect');
        return res.redirect(`/user/${id}`);
    }

    // ✅ update password
    await user.changePassword(currentPassword, newPassword);
    await user.save();

    req.flash('success', 'Password updated successfully');
    res.redirect(`/user/${id}`);
};