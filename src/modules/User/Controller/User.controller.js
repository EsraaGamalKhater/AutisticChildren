import { userModel } from '../../../../DB/Models/usermodel.js'
import cloudinary from "../../../Services/cloud.js";
import pkg from 'bcrypt';


/////////////////profilepic////////////////////
export const profilepic = async (req, res) => {
    const { _id } = req.params;
    if (!req.file || !req.file.path) {
        return res.status(400).json({ cause: 400, message: req.translate('Please upload the profile_pic') });
    }
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path)
    
    const user = await userModel.findByIdAndUpdate(_id, { profile_pic: { secure_url, public_id } }, { new: true });
    if (!user) {
        return res.status(404).json({ cause: 404, message: req.translate('User not found') });
    }
    return res.json({ message: req.translate("Profile picture added successfully"), user })
}


///////////editProfile////////////
export const editProfile = async (req, res, next) => {
    const { id } = req.params;
    const { userName, email } = req.body;

    // Fetch the existing user
    const existingUser = await userModel.findById(id);
    if (!existingUser) {
        return res.status(404).json({ cause: 404, message: req.translate('User not found') });
    }

    // Update the user entry, ensuring empty values do not overwrite existing ones
    const updatedData = {
        userName: userName && userName.trim() !== '' ? userName : existingUser.userName,
        email: email && email.trim() !== '' ? email : existingUser.email,
    };

    // Update the user in the database
    const updatedUser = await userModel.findByIdAndUpdate(id, updatedData, { new: true });

    res.status(200).json({ message: req.translate('Profile updated successfully'), user: updatedUser });
};
////////////updateprofilepic///////////////////
export const updateprofilepic = async (req, res) => {
    const { _id } = req.params;
    if (!req.file || !req.file.path) {
        return res.status(400).json({ cause: 400, message: req.translate('Please upload the profile_pic') });
    }
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path);
    
    const user = await userModel.findByIdAndUpdate(_id, { profile_pic: { secure_url, public_id } }, { new: true });
    if (!user) {
        return res.status(404).json({ cause: 404, message: req.translate('User not found') });
    }
    return res.json({ message: req.translate("Profile picture updated successfully"), user });
}

//////////////////changePassword////////////
export const changePassword = async (req, res, next) => {

    const userId = req.params.id;
    const { oldPassword, newPassword } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
        return res.status(404).json({ cause: 404, message: req.translate('User not found') });
    }
    const isPassMatch = pkg.compareSync(oldPassword, user.password);
    if (!isPassMatch) {
        return res.status(400).json({ cause: 400, message:req.translate( 'Invalid old password') });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: req.translate('Password changed successfully') });

};
///////////////////////////////// getuserById///////////// 
export const getuserById = async (req, res, next) => {

    const user = await userModel.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ cause: 404, Message:req.translate('User not found' )});

    } else {

        return res.json({ message:req.translate( 'Done'), user });
    }
}
/////////////////////deleteUser////////////////
export const deleteUser = async (req, res, next) => {
    const userId = req.params.id;
    const deletedUser = await userModel.findByIdAndDelete(userId);
    if (!deletedUser) {
        return res.status(404).json({ cause: 404, message: req.translate('User not found') });
    }
    res.status(200).json({ message: req.translate('User deleted successfully' )});

};
/////////////////////////logout//////////////////
export const logout = async (req, res, next) => {
    const userId = req.body.userId;
    const user = await userModel.findByIdAndUpdate(userId, { token: null });
    if (!user) {
        return res.status(404).json({ cause: 404, message:req.translate('User not found')});
    }
    res.status(200).json({ message: req.translate('Logout successful') });

};




