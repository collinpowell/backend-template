
import {constants} from '../constant/bucket'

const cloudinary = require("cloudinary").v2;
// Configuration
cloudinary.config({
  cloud_name: constants.BUCKET_NAME,
  api_key: constants.API_KEY,
  api_secret: constants.API_SECRET,
});

export default cloudinary
