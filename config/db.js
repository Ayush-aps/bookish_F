/**
 * MongoDB Atlas connection configuration
 * Implements connection pooling for optimal performance
 */

const mongoose = require("mongoose")

/**
 * Establishes connection to MongoDB Atlas
 * @returns {Promise} MongoDB connection
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are no longer needed in Mongoose 6+, but kept for documentation
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useCreateIndex: true,
      // useFindAndModify: false
    })

    console.log(`MongoDB Connected: ${conn.connection.host}`)

    // Handle connection errors after initial connection
    mongoose.connection.on("error", (err) => {
      console.error(`MongoDB connection error: ${err}`)
    })

    // Handle when the connection is disconnected
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected")
    })

    // If the Node process ends, close the MongoDB connection
    // process.on("SIGINT", () => {
    //   mongoose.connection.close(() => {
    //     console.log("MongoDB connection disconnected through app termination")
    //     process.exit(0)
    //   })
    // })
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });
    

    return conn
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`)
    process.exit(1)
  }
}

module.exports = connectDB

