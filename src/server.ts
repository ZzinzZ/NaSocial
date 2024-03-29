import "dotenv/config";
import App from "./app";
import { IndexRoute } from "@modules/index";
import { validateEnv } from "@core/utils";
import UserRoute from "@modules/users/user.route";
import AuthRoute from "@modules/auth/auth.route";
import ProfileRoute from "@modules/profile/profile.route";
import PostRoute from "@modules/posts/post.route";
import GroupRoute from "@modules/group/group.route";
import ConversationRoute from "@modules/conversation/conversation.route";

validateEnv();


const routes = [
    new IndexRoute(),
    new UserRoute(),
    new AuthRoute(),
    new ProfileRoute(),
    new PostRoute(),
    new GroupRoute(),
    new ConversationRoute(),
];
const app = new App(routes);

app.listen();