import UniversalFunctions from "../../utils/universalFunctions";
import Joi from "joi";
import Controller from "../../controllers";

const adminGetAllCerts = {
  method: "GET",
  path: '/api/admin/getAllCerts',
  options: {
    description: "Admin get all certificates",
    tags: ["api", "admin", "certificate"],
    handler: (request, h) => {
      return new Promise((resolve, reject) => {
        Controller.AdminCertController.adminGetAllCerts(
          (error, data) => {
            appLogger.info("ERROR sent back from Controller to getAllCerts endpoint", error)
            appLogger.info("DATA sent back from Controller to getAllCerts endpoint", data)

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
        // security: [{ 'admin': {} }],
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
    handler: (request, h) => {
      return new Promise((resolve, reject) => {
        Controller.AdminCertController.adminCreateCert(
          request.payload,
          (error, data) => {
            if (error) reject(UniversalFunctions.sendError(error));
            else {
              resolve(UniversalFunctions.sendSuccess(null, data));
            }
          });
      });
    },
    validate: {
      payload: Joi.object({
        studentID: Joi.number().min(100000000).max(999999999).required(),
        firstName: Joi.string().trim().required(),
        lastName: Joi.string().trim().required(),
        unitCode: Joi.string().alphanum().pattern(/^[A-Z]{3}[0-9]{3}$/).trim().required(),
        mark: Joi.number().min(1).max(100).required(),
        credit: Joi.number().min(0).max(2).required(),
        period: Joi.string().trim().required(),
        provider: Joi.string().trim().required(),
      }).label("Admin: Create Certificate"),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      "hapi-swagger": {
        responseMessages:
          UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
};

export default [
  adminGetAllCerts,
  adminCreateCert
];
  