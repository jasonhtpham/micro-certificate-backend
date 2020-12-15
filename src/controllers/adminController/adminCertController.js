import Service from '../../services';
import async from "async";
import UniversalFunctions from "../../utils/universalFunctions";

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
    let newCert;
    
    const name = firstName + ' ' + lastName;

    // certID = studentID_unitCode
    const processedStudentID = studentID.toString().trim()
    
    const upperCaseUnitCode = unitCode.trim().toUpperCase();

    const id = processedStudentID + "_" + upperCaseUnitCode;
    
    async.series([
        function (cb) {
            Service.HyperledgerService.CreateCert(id, unitCode, mark, name, studentID, credit, period)
            .then(addedCert => {
                newCert = addedCert;
                appLogger.info("[newCert]", newCert);
                cb();
            });
        }
    ],
    function (err, result) {
        if (err) callback(err)
        else callback(null, { data: newCert })
    })
}

export default {
    adminGetAllCerts,
    adminCreateCert
}