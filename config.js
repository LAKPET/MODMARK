require("dotenv").config();

module.exports = {
  storageType: process.env.STORAGE_TYPE || "local", // "local" หรือ "cloud"
};
