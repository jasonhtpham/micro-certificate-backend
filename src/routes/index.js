import DemoBaseRoute from "./demoRoute/demoBaseRoute";
import UserBaseRoute from "./userRoute/userBaseRoute";
import AdminBaseRoute from "./adminRoute/adminBaseRoute";
import UploadBaseRoute from "./uploadRoute/uploadBaseRoute";

import AdminCertRoute from "./adminRoute/adminCertRoute";


const Routes = [].concat(DemoBaseRoute, UserBaseRoute, AdminBaseRoute, UploadBaseRoute, AdminCertRoute);

export default Routes;
