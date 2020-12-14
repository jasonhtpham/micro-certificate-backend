import DemoBaseRoute from "./demoRoute/demoBaseRoute";
import UserBaseRoute from "./userRoute/userBaseRoute";
import AdminBaseRoute from "./adminRoute/adminBaseRoute";
import UploadBaseRoute from "./uploadRoute/uploadBaseRoute";

import AdminCreateCertRoute from "./adminRoute/adminCreateCertRoute";


const Routes = [].concat(DemoBaseRoute, UserBaseRoute, AdminBaseRoute, UploadBaseRoute, AdminCreateCertRoute);

export default Routes;
