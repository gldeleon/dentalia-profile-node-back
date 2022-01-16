"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatientId = exports.getPatientName = void 0;
const typeorm_1 = require("typeorm");
const getPatientName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    ;
    let patName = decodeURI(req.params.name);
    const entityManager = (0, typeorm_1.getManager)();
    let patients = yield entityManager.query(`SELECT
    DISTINCT
            p.person_id AS idPerson,
            p2.pat_id AS idPatient,
            p.per_complete AS namePerson
    FROM
            person p
    LEFT JOIN patient p2 ON
            p.person_id = p2.person_id
    LEFT JOIN patagreement p3 ON
            p2.pat_id = p3.pat_id
    WHERE
            p.per_complete like '%` + patName + `%'
            AND p2.pat_active = 'activo'`);
    const sendResponse = {
        "success": true,
        "data": patients,
        "message": "ok"
    };
    return res.json(sendResponse);
});
exports.getPatientName = getPatientName;
const getPatientId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let patId = +req.params.patId;
    const patientData = {
        "patData": yield patDetails(patId),
        "patDocuments": yield patDocuments(patId),
        "patSessions": yield patSessions(patId)
    };
    const sendResponse = {
        "success": true,
        "data": patientData,
        "message": "ok"
    };
    return res.json(sendResponse);
});
exports.getPatientId = getPatientId;
function patDetails(patId) {
    return __awaiter(this, void 0, void 0, function* () {
        ;
        const entityManager = (0, typeorm_1.getManager)();
        const patQuery = yield entityManager.query(`SELECT
    DISTINCT
            p2.pat_id AS idPatient,
            p.per_lastname AS aPaterno,
            p.per_surename AS aMaterno,
            p.per_name AS nombre,
            p.per_complete AS nombreCompleto,
            p.per_birthday AS fnacimiento,
            p3.agr_id AS idPlan,
            a.agr_name AS nombrePlan,
            e.email AS email,
            t.tel_number AS telefono
    FROM
            person p
    LEFT JOIN patient p2 ON
            p.person_id = p2.person_id
    LEFT JOIN patagreement p3 ON
            p2.pat_id = p3.pat_id
    LEFT JOIN agreement a ON
            p3.agr_id = a.agr_id
    LEFT JOIN email e ON
            p.person_id = e.person_id
    LEFT JOIN telephone t ON
            p.person_id = t.person_id
    WHERE
            p2.pat_id = ` + patId + `
            AND a.agr_active = 'activo'
            -- AND e.email_active = 'activo'
            -- AND t.tel_active = 'activo'
            AND p2.pat_active = 'activo'
    GROUP BY p2.pat_id,p.per_lastname,p.per_surename,p.per_name,p.per_birthday,p3.agr_id,a.agr_name,e.email,t.tel_number
    LIMIT 1`);
        return patQuery;
    });
}
function patDocuments(patId) {
    return __awaiter(this, void 0, void 0, function* () {
        const entityManager = (0, typeorm_1.getManager)();
        const patQuery = yield entityManager.query(`SELECT
    DISTINCT
     f.*,
     c.cli_name,
     case
             when (pm.paymeth_abbr <> 'MS'
                     and pm.paymeth_abbr <> 'RM'
                     and pm.paymeth_abbr <> 'TR')
                                     then '--'
             else pm.paymeth_abbr
     end as paymeth
FROM
     file f
LEFT JOIN filepaymethod fp ON
     f.file_id = fp.file_id
LEFT JOIN paymethod pm ON
     fp.paymeth_id = pm.paymeth_id
LEFT JOIN clinic c ON
     f.cli_id = c.cli_id
WHERE
     f.filetype_id = '1'
     AND f.pat_id = ` + patId + `
     AND fp.paymeth_id NOT IN (7)
ORDER BY
     f.file_date,
     f.file_number,
     f.cli_id`);
        return patQuery;
    });
}
function patSessions(patId) {
    return __awaiter(this, void 0, void 0, function* () {
        const entityManager = (0, typeorm_1.getManager)();
        const patQuery = yield entityManager.query(`select
    f.file_date,
    c.cli_name,
    f2.emp_id,
    e.emp_abbr,
    t.trt_name,
    f.file_comment,
    t2.tht_num,
    f2.sessnum,
    f2.lastsess,
    f2.quantity,
    f3.file_rel_id,
    (
    select
            file_number
    from
            file
    where
            file_id = f3.file_id) as recibo
FROM
    file f
LEFT JOIN fileentry f2 ON
    f.file_id = f2.file_id
LEFT JOIN filereference f3 ON
    f.file_id = f3.file_rel_id and f3.active = 'activo'
LEFT JOIN clinic c ON
    f.cli_id = c.cli_id
LEFT JOIN employee e ON
    f2.emp_id = e.emp_id
LEFT JOIN treatment t ON
    f2.trt_id = t.trt_id
LEFT JOIN tooth t2 ON
    f2.tht_id = t2.tht_id
WHERE
    f.status_id != 2
    and pat_id = ` + patId + `
    and filetype_id = 2`);
        return patQuery;
    });
}
