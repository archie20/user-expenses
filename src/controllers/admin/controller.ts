import { Request, Response, RequestHandler } from "express";
import { body, ValidationChain } from "express-validator";
import { validateRequest } from "../../utils/request-validator";
import * as adminFunctions from "./functions";

const validate = (method: string): Array<ValidationChain> => {
  switch (method) {
    case "createAdmin":
      return [
        body("email", "email is required").exists().normalizeEmail().isEmail(),
        body("password", "password is required").exists().trim(),
      ];
    default:
      return [];
  }
};

const createAdmin: Array<RequestHandler> = [
  ...validate("createAdmin"),
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const admin = await adminFunctions.create(email, password);
      if (admin) {
        return res
          .status(201)
          .json({ message: "Created succesfully", admin: admin });
      } else {
        return res.status(500).json({ message: "Failed to created admin" });
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
  ...validate("createAdmin"),
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const token = await adminFunctions.login(email, password);
      return res
        .status(200)
        .json({ message: "Login succesfull", token: token });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Something went wrong. Please try again" });
    }
  },
];

export { login, createAdmin };
