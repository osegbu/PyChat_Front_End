import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.AUTH_SECRET;

export function generateToken(payload) {
  try {
    const token = jwt.sign(payload, SECRET_KEY, {
      expiresIn: 240,
    });
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    return null;
  }
}
