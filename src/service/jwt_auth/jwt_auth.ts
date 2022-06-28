import jwt from "jsonwebtoken";
import { constants as JWT_CONST } from "../../constant/jwt_auth";
import { accessTokenData } from "../../repository/auth/auth.repo";
const SECRET = JWT_CONST.JWT_AUTH_SECRET;

class JWTAuth {
  async createToken(data: accessTokenData) {
    return new Promise((resolve, reject) => {
      const payload = { data };
      try {
        const token = Promise.resolve(
          jwt.sign(payload, SECRET, { expiresIn: "24h" })
        );
        resolve(token);
      } catch (err) {
        reject(err);
      }
    });
  }

  async verifyToken(accessToken: string) {
    return new Promise((resolve, reject) => {
      try {
        const decoded = jwt.verify(accessToken, SECRET);
        resolve(decoded.data);
      } catch (err) {
        reject(err);
      }
    });
  }
}
export default JWTAuth;
