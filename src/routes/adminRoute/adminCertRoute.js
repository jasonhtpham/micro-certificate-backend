import UniversalFunctions from "../../utils/universalFunctions";
import Joi from "joi";
import Controller from "../../controllers";
import user from "../../models/user";

const adminGetAllCerts = {
  method: "GET",
  path: '/api/admin/getAllCerts',
  options: {
    description: "Admin get all certificates",
    tags: ["api", "admin", "certificate"],
    auth: "UserAuth",
    handler: (request, h) => {
      let userData =
      (request.auth &&
        request.auth.credentials &&
        request.auth.credentials.userData) ||
      null;
      return new Promise((resolve, reject) => {
        Controller.AdminCertController.adminGetAllCerts(userData, (error, data) => {
            // appLogger.info("Data sent back to getAllCerts endpoint: ", data);
            if (error) reject(UniversalFunctions.sendError(error));
            else {
              resolve(UniversalFunctions.sendSuccess(null, data));
            }
          }
        );
      });
    },
    validate: {
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      "hapi-swagger": {
        security: [{ 'admin': {} }],
        responseMessages:
          UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
};

const adminGetCertsByUser = {
  method: "GET",
  path: '/api/admin/getCertsByUser',
  options: {
    description: "Admin get certificates by user",
    tags: ["api", "admin", "certificate"],
    auth: "UserAuth",
    handler: (request, h) => {
      let userData =
      (request.auth &&
        request.auth.credentials &&
        request.auth.credentials.userData) || null;
      let studentId = request.query.studentId;
      return new Promise((resolve, reject) => {
        Controller.AdminCertController.adminGetCertsByUser(userData, studentId, (error, data) => {
            // appLogger.info("Data sent back to getAllCerts endpoint: ", data);
            if (error) reject(UniversalFunctions.sendError(error));
            else {
              resolve(UniversalFunctions.sendSuccess(null, data));
            }
          }
        );
      });
    },
    validate: {
      // payload: Joi.object({
      //   studentId: Joi.string().pattern(new RegExp('^[0-9]{9}$')).required()
      // }).label("Admin: Get Certificates by user"),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      "hapi-swagger": {
        security: [{ 'admin': {} }],
        responseMessages:
          UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
};

const adminCreateCert = {
  method: "POST",
  path: "/api/admin/createCert",
  options: {
    description: "Admin Create Certificate",
    tags: ["api", "admin", "certificate"],
    auth: "UserAuth",
    handler: (request, h) => {
      let userData =
      (request.auth &&
        request.auth.credentials &&
        request.auth.credentials.userData) ||
      null;
      let payloadData = request.payload;
      return new Promise((resolve, reject) => {
        Controller.AdminCertController.adminCreateCert(
          userData,
          payloadData,
          (error, data) => {
            // appLogger.info("Data sent back to createCert endpoint: ", data);
            if (error) reject(UniversalFunctions.sendError(error));
            else {
              resolve(UniversalFunctions.sendSuccess(data, null));
            }
          });
      });
    },
    validate: {
      payload: Joi.object({
        studentId: Joi.string().pattern(new RegExp('^[0-9]{9}$')).required(),
        unitCode: Joi.string().alphanum().pattern(new RegExp('^[A-Z]{3}[0-9]{3}$')).trim().required(),
        mark: Joi.number().min(1).max(100).required(),
        credit: Joi.number().min(0).max(2).required(),
        period: Joi.string().trim().required(),
      }).label("Admin: Create Certificate"),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      "hapi-swagger": {
        security: [{ 'admin': {} }],
        responseMessages:
          UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
};

export default [
  adminGetAllCerts,
  adminGetCertsByUser,
  adminCreateCert
];
  