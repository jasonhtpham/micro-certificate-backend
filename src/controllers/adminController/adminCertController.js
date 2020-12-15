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
        appLogger.info("Callback function getAllCerts controller | Error: ", err)
        appLogger.info("Callback function getAllCerts controller | Result: ", result)
        if (err) callback(err)
        else callback(null, { data: certList })
    })
}

const adminCreateCert = (payload, callback) => {
    console.log(payload);
}

export default {
    adminGetAllCerts,
    adminCreateCert
}