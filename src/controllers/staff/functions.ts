import Staff, { IStaff } from "../../models/staff";
import jwt from "jsonwebtoken";
import { tokenSecret, tokenExpire } from "../../config/jwt";

export const create = async (
  name: string,
  staff_no: string,
  password: string
): Promise<IStaff> => {
  const staff = new Staff({
    name: name,
    staff_no: staff_no,
    password: password,
  });
  const result = await staff.save();
  return result;
};

export const login = async (
  staff_no: string,
  password: string
): Promise<null | string> => {
  const staff = await Staff.findOne({ staff_no: staff_no }).exec();
  if (!staff) return null;
  const passwordMatch = await staff.verifyPassword(password);
  if (!passwordMatch) return null;

  return jwt.sign(staff.getTokenData(), tokenSecret, {
    expiresIn: tokenExpire,
  });
};

export const verifyToken = async (token: string): Promise<null | IStaff> => {
  const decoded = jwt.verify(token, tokenSecret) as jwt.JwtPayload;
  if (!decoded) {
    return null;
  }
  const staff = await Staff.findById(decoded.id).exec();
  return staff;
};
