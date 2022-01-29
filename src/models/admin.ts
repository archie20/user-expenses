import { Schema, model, ObjectId } from "mongoose";
import bcrypt from "bcrypt";

export interface IAdmin {
  _id: ObjectId;
  email: String;
  password: String;
  getTokenData: () => { id: string; email: string };
  verifyPassword: (candidatePassword: string) => Promise<boolean>;
  toJSON: () => {};
}

const AdminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
});

AdminSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
});

AdminSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    delete ret.password;
    return ret;
  },
});

AdminSchema.methods.getTokenData = function () {
  return {
    id: this.id,
    email: this.email,
  };
};

AdminSchema.methods.verifyPassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const result = await bcrypt.compare(candidatePassword, this.password);
  return result;
};

const Admin = model<IAdmin>("Admin", AdminSchema);

export default Admin;
