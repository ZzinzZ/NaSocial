import { cleanEnv, str  } from "envalid";

const validateEnv = () => {
    cleanEnv(process.env, {
      NODE_ENV: str(),
      MONGODB_URL: str(),
    });
}

export default validateEnv;