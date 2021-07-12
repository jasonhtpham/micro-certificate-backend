import GenericService from './genericService';
import ForgetPasswordService from './forgetPasswordService';
import HyperledgerService from './hyperledgerService';
import RegisterAppUser from './registerUser';
import EnrollAdminUser from './enrollAdmin';

export default {
  UserService: new GenericService('User'),
  ForgetPasswordService,
  AdminService: new GenericService('Admin'),
  HyperledgerService: new HyperledgerService,
  RegisterAppUser,
  EnrollAdminUser
};
