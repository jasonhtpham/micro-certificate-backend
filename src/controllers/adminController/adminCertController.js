import Service from '../../services';
import async from "async";
import UniversalFunctions from "../../utils/universalFunctions";

const adminGetAllCerts = (callback) => {
    // console.log("Hello from GACerts")
    let certList = [];
    async.series([
        function (cb) {
            Service.HyperledgerService.GetAllCerts()
            .then(data => {
                // console.log(data);
                certList = data;
                cb();
            })
            .catch(err => cb(err))
        },
        function (err, result) {
            if (err) callback(err)
            else callback(null, { data: certList })
        }
    ])
}

const adminCreateCert = (payload, callback) => {
    // console.log(payload);
}

export default {
    adminGetAllCerts,
    adminCreateCert
}