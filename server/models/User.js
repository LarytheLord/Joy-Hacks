import { db } from '../firebase.js';

const usersCollection = db.collection('users');

const User = {
  /**
   * Create a new user in Firestore
   * @param {Object} userData - User data including email, username, etc.
   * @returns {Object} Created user with ID
   */
  async create(userData) {
    const docRef = await usersCollection.add({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...userData };
  },

  /**
   * Find a user by email
   * @param {string} email - User's email
   * @returns {Object|null} User object or null if not found
   */
  async findByEmail(email) {
    const snapshot = await usersCollection.where('email', '==', email).get();
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  },
  
  /**
   * Find a user by ID
   * @param {string} id - User ID
   * @returns {Object|null} User object or null if not found
   */
  async findById(id) {
    const doc = await usersCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },
  
  /**
   * Update a user
   * @param {string} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated user
   */
  async update(id, updateData) {
    await usersCollection.doc(id).update({
      ...updateData,
      updatedAt: new Date()
    });
    const doc = await usersCollection.doc(id).get();
    return { id: doc.id, ...doc.data() };
  }
};

export default User;