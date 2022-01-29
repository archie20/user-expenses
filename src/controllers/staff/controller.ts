import { Request, Response, RequestHandler } from "express";
import { body, ValidationChain } from "express-validator";
import Staff from "../../models/staff";
import { validateRequest } from "../../utils/request-validator";
import * as staffFunctions from "./functions";
import { verifyToken } from "../admin/functions";
import { JsonWebTokenError } from "jsonwebtoken";

const validate = (method: string): Array<ValidationChain> => {
  switch (method) {
    case "createStaff":
      return [
        body("name", "name is required").exists().trim(),
        body("staff_no", "staff number is required").exists().trim(),
        body("password", "password for staff is required").exists().trim(),
      ];
    case "login":
      return [
        body("staff_no", "staff number is required").exists().trim(),
        body("password", "password for staff is required").exists().trim(),
      ];
    case "saveExpense":
      return [
        body("trans_date", "transaction date is required")
          .exists()
          .isISO8601()
          .toDate(),
        body("description", "description is required").exists().trim(),
        body("cost", "cost is required").exists().isDecimal(),
      ];
    default:
      return [];
  }
};

const createStaff: Array<RequestHandler> = [
  ...validate("createStaff"),
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { name, staff_no, password } = req.body;
      const staff = await staffFunctions.create(name, staff_no, password);
      if (staff) {
        return res
          .status(201)
          .json({ message: "Created succesfully", staff: staff });
      } else {
        return res
          .status(500)
          .json({ message: "Something went wrong. Contact support" });
      }
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Something went wrong. Please try again" });
    }
  },
];

const login: Array<RequestHandler> = [
  ...validate("login"),
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { staff_no, password } = req.body;
      const token = await staffFunctions.login(staff_no, password);
      if(!token) {
          return res
              .status(401)
              .json({ message: "Wrong password or staff number"});
      }
      return res
        .status(200)
        .json({ message: "Successful login", token: token });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Something went wrong. Please try again" });
    }
  },
];

const getAllStaff: RequestHandler = async (req: Request, res: Response) => {
  try {
    const token =
      req.body.token || req.query.token || req.headers["x-access-token"];
    console.log(token);
    const admin = await verifyToken(token);
    if (!admin) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const staff = await Staff.find();

    return res.status(200).json({ message: "found succesfully", staff: staff });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again" });
  }
};

const getStaff: RequestHandler = async (req: Request, res: Response) => {
  try {
    const token =
      req.body.token || req.query.token || req.headers["x-access-token"];
    const admin = await verifyToken(token);
    if (!admin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const staffNo = req.params.num;
    const staff = await Staff.findOne({ staff_no: staffNo }).exec();

    if (staff) {
      return res
        .status(200)
        .json({ message: "found succesfully", staff: staff });
    } else {
      return res.status(404).json({ message: "not found" });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again" });
  }
};

const saveExpense: Array<RequestHandler> = [
  ...validate("saveExpense"),
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const token =
        req.body.token || req.query.token || req.headers["x-access-token"];
      const staff = await staffFunctions.verifyToken(token);
      if (!staff) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const { trans_date, description, cost } = req.body;

      staff.expenses.push({
        trans_date: trans_date,
        description: description,
        cost: cost,
      });
      staff.save();
      return res.status(201).json({ message: "Expense added succesfully" });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Something went wrong. Please try again" });
    }
  },
];

const getAllExpenses: RequestHandler = async (req: Request, res: Response) => {
  try {
    const token =
      req.body.token || req.query.token || req.headers["x-access-token"];
    const admin = await verifyToken(token);
    if (admin) {
      const staff = await Staff.findOne({ staff_no: req.params.num }).exec();
      if (!staff) {
        return res.status(404).json({ message: "Staff not found" });
      }
      return res
        .status(200)
        .json({ message: "Expenses", expenses: staff.expenses });
    } else {
      const staff = await staffFunctions.verifyToken(token);
      console.log(staff);
      if (!staff) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      return res
        .status(200)
        .json({ message: "Expenses", expenses: staff.expenses });
    }
  } catch (err) {
    console.error(err);
    if (err instanceof JsonWebTokenError) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again" });
  }
};

export {
  createStaff,
  login,
  getAllExpenses,
  getAllStaff,
  getStaff,
  saveExpense,
};
