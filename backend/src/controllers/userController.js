const bcrypt = require("bcrypt");
const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; 

    const { name, email, password } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

   
    if (name) {
      user.name = name;
    }

  
    if (email) {
      const existingEmail = await User.findOne({ where: { email } });

      if (existingEmail && existingEmail.id !== userId) {
        return res.status(400).json({ message: "Email already in use" });
      }

      user.email = email;
    }

    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
   console.error("Update profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};