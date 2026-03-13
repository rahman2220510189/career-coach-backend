const { ObjectId } = require("mongodb");

const createUser = async (db, userData) => {
  const usersCollection = db.collection("users");

  // Check if email already exists
  const existing = await usersCollection.findOne({ email: userData.email });
  if (existing) {
    throw new Error("Email already exists ❌");
  }

  const result = await usersCollection.insertOne({
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role: "user",
    createdAt: new Date(),
  });

  return result;
};

const findUserByEmail = async (db, email) => {
  const usersCollection = db.collection("users");
  return await usersCollection.findOne({ email });
};

const findUserById = async (db, id) => {
  const usersCollection = db.collection("users");
  return await usersCollection.findOne({ _id: new ObjectId(id) });
};

module.exports = { createUser, findUserByEmail, findUserById };