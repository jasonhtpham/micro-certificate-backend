import Service from '../../services';
import async from "async";
import UniversalFunctions from "../../utils/universalFunctions";

const adminGetAllCerts = () => {
    let certList = [];
    async.series([
        function (cb) {
            Service.HyperledgerService.GetAllCerts()
            .then(data => {
                certList = data;
                cb();
            })
            .catch(err => cb(err))
        },
        function (err, result) {
            if (err) callback(err)
            else callback({ data: certList })
        }
    ])
}

// const adminCreateCert = (payload, callback) => {
    
// }

export default {
    adminCreateCert
}