import { Schema, model, ObjectId } from "mongoose";
import ExpenseSchema, { IExpense } from "./expense";
import bcrypt from "bcrypt";

export interface IStaff {
  _id: ObjectId;
  name: String;
  staff_no: String;
  password: String;
  expenses: Array<IExpense>;
  getTokenData: () => { id: string; staff_no: string };
  verifyPassword: (candidatePassword: string) => Promise<boolean>;
  toJSON: () => {};
  save: () => Promise<{}>;
}

const StaffSchema = new Schema<IStaff>({
  name: { type: String, required: true },
  staff_no: { type: String, required: true, index: { unique: true } },
  password: String,
  expenses: [ExpenseSchema],
});

StaffSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
});

StaffSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    delete ret.password;
    delete ret.expenses;
    return ret;
  },
});

StaffSchema.methods.getTokenData = function () {
  return {
    id: this.id,
    staff_no: this.staff_no,
  };
};

StaffSchema.methods.verifyPassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const result = await bcrypt.compare(candidatePassword, this.password);
  return result;
};

const Staff = model<IStaff>("Staff", StaffSchema);

export default Staff;
