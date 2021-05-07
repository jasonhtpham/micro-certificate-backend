import Service from '../../services';
import async from "async";
import UniversalFunctions from "../../utils/universalFunctions";
const ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;


const adminGetAllCerts = (userData, callback) => {
    let certList = [];
    let userFound = false;
    
    async.series([
        // function (cb) {
        //     var criteria = {
        //       _id: userData._id
        //     };
        //     Service.AdminService.getRecord(criteria, { password: 0 }, {}, function (err, data) {
        //       if (err) cb(err);
        //       else {
        //         if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
        //         else {
        //           userFound = (data && data[0]) || null;
        //           if (userFound.isBlocked == true) cb(ERROR.ACCOUNT_BLOCKED)
        //           else cb()
        //         }
        //       }
        //     });
        // },
        function (cb) {
            Service.HyperledgerService.GetAllCerts()
            .then(allCerts => {
                // if (allCerts.length == 0) cb(ERR.FILE_NOT_FOUND);
                certList = allCerts
                // appLogger.info("[allCerts]", certList);
                cb();
            })
            .catch( err => cb(err) );
        }
    ],
    function (err, result) {
        if (err) callback(err)
        else callback(null, { data: certList })
    })
}

const adminGetCertsByUser = (userData, studentId, callback) => {
    let certList = [];
    let userFound = false;
    let userName = "";

    async.series([
        // function (cb) {
        //     var criteria = {
        //       _id: userData._id
        //     };
        //     Service.AdminService.getRecord(criteria, { password: 0 }, {}, function (err, data) {
        //       if (err) cb(err);
        //       else {
        //         if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
        //         else {
        //           userFound = (data && data[0]) || null;
        //           if (userFound.isBlocked == true) cb(ERROR.ACCOUNT_BLOCKED)
        //           else cb()
        //         }
        //       }
        //     });
        // },
        function (cb) {
            var criteria = {
                studentId: studentId
              };
              var projection = {
                  password: 0,
                  accessToken: 0,
                  OTPCode: 0,
                  code: 0,
                  codeUpdatedAt: 0,
                  __v: 0,
                  registrationDate: 0
              }
              Service.UserService.getRecord(criteria, projection, {}, function (err, data) {
                if (err) cb(err);
                else {
                  if (data.length == 0) cb(ERROR.USER_NOT_FOUND);
                  else {
                    const firstName = data[0].firstName;
                    const lastName = data[0].lastName;
                    userName = firstName + ' ' + lastName;
                    cb()
                  }
                }
              });
        },
        function (cb) {
            Service.HyperledgerService.GetCertsByOwner(userName, studentId)
            .then( certs => {
                // if (certs.length == 0) cb(ERR.FILE_NOT_FOUND);
                certList = certs
                // appLogger.info("[allCerts]", certList);
                cb();
            })
            .catch( err => cb(err) )
        }
    ],
    function (err, result) {
        if (err) callback(err)
        else callback(null, { data: certList })
    })
}

const adminGetCertHistory = (userData, certId, callback) => {
  let certHistory = null;
  let userFound = false;

  async.series([
      // function (cb) {
      //     var criteria = {
      //       _id: userData._id
      //     };
      //     Service.AdminService.getRecord(criteria, { password: 0 }, {}, function (err, data) {
      //       if (err) cb(err);
      //       else {
      //         if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
      //         else {
      //           userFound = (data && data[0]) || null;
      //           if (userFound.isBlocked == true) cb(ERROR.ACCOUNT_BLOCKED)
      //           else cb()
      //         }
      //       }
      //     });
      // },
      function (cb) {
          Service.HyperledgerService.GetCertHistory(certId)
          .then( history => {
              if (history.length == 0 || !history) cb(ERR.FILE_NOT_FOUND);
              certHistory = history
              cb();
          })
          .catch( err => cb(err) )
      }
  ],
  function (err, result) {
      if (err) callback(err)
      else callback(null, { data: certHistory })
  })
}

// const adminCreateCert = (userData, payloadData, callback) => {
//     const {studentId, unitCode, mark, credit, period} = payloadData
    

//     // certID is created in the form of studentID_unitCode
//     const processedStudentId = studentId.toString().trim()
    
//     const upperCaseUnitCode = unitCode.trim().toUpperCase();

//     const id = processedStudentId + "_" + upperCaseUnitCode;

//     let userFound = false;
//     let userName = "";
    
//     async.series([
//         // function (cb) {
//         //     var criteria = {
//         //       _id: userData._id
//         //     };
//         //     Service.AdminService.getRecord(criteria, { password: 0 }, {}, function (err, data) {
//         //       if (err) cb(err);
//         //       else {
//         //         if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
//         //         else {
//         //           userFound = (data && data[0]) || null;
//         //           if (userFound.isBlocked == true) cb(ERROR.ACCOUNT_BLOCKED)
//         //           else cb()
//         //         }
//         //       }
//         //     });
//         // },
//         function (cb) {
//             var criteria = {
//               studentId: payloadData.studentId
//             };
//             var projection = {
//                 password: 0,
//                 accessToken: 0,
//                 OTPCode: 0,
//                 code: 0,
//                 codeUpdatedAt: 0,
//                 __v: 0,
//                 registrationDate: 0
//             }
//             Service.UserService.getRecord(criteria, projection, {}, function (err, data) {
//               if (err) cb(err);
//               else {
//                 if (data.length == 0) cb(ERROR.USER_NOT_FOUND);
//                 else {
//                   const firstName = data[0].firstName;
//                   const lastName = data[0].lastName;
//                   userName = firstName + ' ' + lastName;
//                   cb()
//                 }
//               }
//             });
//         },
//         function (cb) {
//             Service.HyperledgerService.CreateCert(id, unitCode, mark, userName, studentId, credit, period)
//             .then(addedCert => {
//                 if (!addedCert || addedCert.errors) cb(ERROR.DUPLICATE)
//                 else cb()
//             });
//         }
//     ],
//     function (err, result) {
//         if (err) callback(err)
//         else callback(null, `Certificate ${id} has been successfully created` )
//     })
// }

const adminCreateCert = (userData, payloadData, callback) => {
    
    async.series([
        function (cb) {
            Service.HyperledgerService.CreateCert(payloadData.documentFile)
            .then(addedCert => {
                if (!addedCert || addedCert.errors) cb(ERROR.DEFAULT)
                else cb()
            });
        }
    ],
    function (err, result) {
        if (err) callback(err)
        else callback(null, `Certificate has been successfully created` )
    })
}

const adminVerifyCert = (userData, payloadData, callback) => {
    
    async.series([
        function (cb) {
            Service.HyperledgerService.VerifyCert(payloadData.documentFile, payloadData.issuer)
            .then(certAdded => {
                if (!certAdded || certAdded.errors) cb(ERROR.USER_NOT_FOUND)
                const message = "This certificate is verified!!!";
                cb(null, message)
            });
        }
    ],
    function (err, result) {
        if (err) callback(err)
        else callback(null, {data: result})
    })
}

const adminRevokeCert = (userData, payloadData, callback) => {
  let userFound = false;
  
  async.series([
      // function (cb) {
      //     var criteria = {
      //       _id: userData._id
      //     };
      //     Service.AdminService.getRecord(criteria, { password: 0 }, {}, function (err, data) {
      //       if (err) cb(err);
      //       else {
      //         if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
      //         else {
      //           userFound = (data && data[0]) || null;
      //           if (userFound.isBlocked == true) cb(ERROR.ACCOUNT_BLOCKED)
      //           else cb()
      //         }
      //       }
      //     });
      // },
      function (cb) {
          Service.HyperledgerService.RevokeCert(payloadData.certId)
          .then(result => {
            if (!result || result.errors) cb(ERROR.FABRIC_ERROR);
            cb()
          });
      }
  ],
  function (err, result) {
      if (err) callback(err)
      else callback(null, `Certificate ${payloadData.certId} has been successfully revoked` )
  })
}

export default {
    adminGetAllCerts,
    adminGetCertsByUser,
    adminGetCertHistory,
    adminCreateCert,
    adminVerifyCert,
    adminRevokeCert
}