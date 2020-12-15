import Service from '../../services';
import async from "async";
import UniversalFunctions from "../../utils/universalFunctions";
const ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;


const adminGetAllCerts = (callback) => {
    let certList = [];
    async.series([
        function (cb) {
            Service.HyperledgerService.GetAllCerts()
            .then(allCerts => {
                certList = allCerts
                appLogger.info("[allCerts]", certList);
                cb();
            });
        }
    ],
    function (err, result) {
        if (err) callback(err)
        else callback(null, { data: certList })
    })
}

const adminCreateCert = (payload, callback) => {
    const {unitCode, mark, firstName, lastName, studentID, credit, period} = payload
    
    const name = firstName + ' ' + lastName;

    // certID = studentID_unitCode
    const processedStudentID = studentID.toString().trim()
    
    const upperCaseUnitCode = unitCode.trim().toUpperCase();

    const id = processedStudentID + "_" + upperCaseUnitCode;
    
    async.series([
        function (cb) {
            Service.HyperledgerService.CreateCert(id, unitCode, mark, name, studentID, credit, period)
            .then(addedCert => {
                if (!addedCert || addedCert.errors) cb(ERROR.DUPLICATE)
                else cb()
            });
        }
    ],
    function (err, result) {
        if (err) callback(err)
        else callback(null, `Certificate ${id} has been successfully created` )
    })
}

export default {
    adminGetAllCerts,
    adminCreateCert
}