import { Schema, model } from 'mongoose'
import pkg from 'bcrypt'
const userSchema = new Schema(
  {
    userName: {
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
    isConfirmed: {
      type: Boolean,
      required: true,
      default: false,
    },
    role: {
      type: String,
      default : 'Admin',
      enum :['User', 'Admin']
    },
    profile_pic: {
      secure_url: String,
      public_id: String,
    },
    token: String,
    forgetCode: String,
  },
  { timestamps: true },
)

userSchema.pre('save', function (next, hash) {
 
  this.password = pkg.hashSync(this.password, +process.env.SALT_ROUNDS)

  next()
})

export const userModel = model('User', userSchema)
