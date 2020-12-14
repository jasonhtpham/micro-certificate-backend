import GenericService from './genericService';

import ForgetPasswordService from './forgetPasswordService';

import HyperledgerService from './hyperledgerService';

export default {
  UserService: new GenericService('User'),
  ForgetPasswordService,
  AdminService: new GenericService('Admin'),
  HyperledgerService: new HyperledgerService
};
