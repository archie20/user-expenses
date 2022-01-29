import Admin, { IAdmin } from "../../models/admin";
import jwt from "jsonwebtoken";
import { tokenSecret, tokenExpire } from "../../config/jwt";

export const create = async (
  email: string,
  password: string
): Promise<IAdmin> => {
  const admin = new Admin({ email: email, password: password });
  const result = await admin.save();
  return result;
};

export const login = async (
  email: string,
  password: string
): Promise<null | string> => {
  const admin = await Admin.findOne({ email: email }).exec();
  if (!admin) return null;
  const passwordMatch = await admin.verifyPassword(password);
  if (!passwordMatch) return null;
  return jwt.sign(admin.getTokenData(), tokenSecret, {
    expiresIn: tokenExpire,
  });
};

export const verifyToken = async (token: string): Promise<null | IAdmin> => {
  const decoded = jwt.verify(token, tokenSecret) as jwt.JwtPayload;
  if (!decoded) {
    return null;
  }
  const admin = await Admin.findById(decoded.id).exec();
  return admin;
};
