const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  // username: {
  //   type: String,
  //   required: true
  // },
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    default: ''
  },

  addresses: {
    type: [
      {
        street: {
          type: String,
          // required: true
        },
        city: {
          type: String,
          // required: true
        },
        state: {
          type: String,
          // required: true
        },
        zipCode: {
          type: String,
          // required: true
        },
      },
    ],
    default: [],
  },
  favorites: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
      },
    ],
  },
  role: {
    type: String,
    enum: ["buyer", "seller", "admin"],
    default: "buyer",
  },
  paymentMethods: {
    type: [
      {
        id: {
          type: Number,
        },
        type_: {
          type: String,
        },
        last4: {
          type: String,
        },
        expiry: {
          type: Date,
        },
      },
    ],
    default: [],
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
  } catch (err) {
    return next(err);
  }
});
userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (!update || !update.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    console.log(update.password)
    const hash = await bcrypt.hash(update.password, salt);
    update.password = hash; // Update the hashed password in the update object
    next();
  } catch (err) {
    return next(err);
  }
});
userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
