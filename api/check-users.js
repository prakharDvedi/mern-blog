const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://Prakhar:Plasma%402005@cluster0.ei4shwv.mongodb.net/mern-auth?retryWrites=true&w=majority"
).then(async () => {
  console.log("Connected to MongoDB");
  
  try {
    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Count all users
    const totalUsers = await usersCollection.countDocuments();
    console.log("Total users in database:", totalUsers);
    
    // Get all users (without passwords for security)
    const users = await usersCollection.find({}, { username: 1, _id: 1, createdAt: 1 }).toArray();
    
    if (users.length === 0) {
      console.log("No users found in database");
    } else {
      console.log("Users found:");
      users.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}, ID: ${user._id}`);
      });
    }
    
    // Check if there are any users with null or empty usernames
    const nullUsers = await usersCollection.countDocuments({ 
      $or: [
        { username: null },
        { username: "" },
        { username: { $exists: false } }
      ]
    });
    console.log("Users with null/empty usernames:", nullUsers);
    
    console.log("Database check completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error during check:", error);
    process.exit(1);
  }
}).catch((err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
}); 