import { Schema, model } from "mongoose";

export interface IExpense {
  trans_date: Date;
  description: String;
  cost: Number;
}

const ExpenseSchema = new Schema<IExpense>({
  trans_date: { type: Date, required: true },
  description: { type: String, required: true },
  cost: { type: Number, required: true },
  // created_at: { type: Date, default: Date.now },
});

const Expense = model<IExpense>("Expense", ExpenseSchema);

export default ExpenseSchema;
