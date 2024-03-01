import "dotenv/config";
import App from "./app";
import { IndexRoute } from "@modules/index";
import { validateEnv } from "@core/utils";
import UserRoute from "@modules/users/user.route";
import AuthRoute from "@modules/auth/auth.route";
import ProfileRoute from "@modules/profile/profile.route";

validateEnv();


const routes = [
    new IndexRoute(),
    new UserRoute(),
    new AuthRoute(),
    new ProfileRoute
];
const app = new App(routes);

app.listen();