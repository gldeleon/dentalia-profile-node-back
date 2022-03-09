import {Request, Response} from 'express';
import { getManager } from 'typeorm';

export const getPatientName = async (req: Request, res: Response): Promise<Response> => {    
    interface Patient {
        idPerson: Number;
        idPatient: Number;
        namePerson: String;        
    };
    let patName = decodeURI(req.params.name);
    const entityManager = getManager();
    let patients = await entityManager.query(`SELECT
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
            p.per_complete like '%`+ patName +`%'
            AND p.active = 'activo'
            AND p2.pat_active = 'activo'`);
    const sendResponse = {
        "success": true,
        "data": patients,
        "message": "ok"
    };
    return res.json(sendResponse);
}

export const getPatientId = async (req: Request, res: Response): Promise<Response> => {
    let patId: number = +req.params.patId;    
    const patientData = {
        "patData": await patDetails(patId),
        "patDocuments": await patDocuments(patId),
        "patSessions": await patSessions(patId)
    }
    const sendResponse = {
        "success": true,
        "data": patientData,
        "message": "ok"
    };
    return res.json(sendResponse);
}


export const getReceiptData = async (req: Request, res: Response): Promise<Response> => {
    let session: number = +req.params.sesId;
    const entityManager = getManager();
    const receiptData = await entityManager.query(`select                                    
                                    p2.per_complete as nombre,
                                    p.pat_id as id,
                                    f.cli_id as cli_id,
                                    (SELECT
                                        pat_balance
                                    FROM
                                        file
                                    WHERE
                                        pat_id = f.pat_id 
                                        AND cli_id <= f.cli_id 
                                        AND status_id = 1
                                        AND filetype_id = 1
                                        AND DATE(file_date) <= f.file_date
                                    GROUP BY
                                        file_number
                                    ORDER BY
                                        file_id DESC
                                    LIMIT 1) as balance,
                                    (select f.file_number from file f 
                                        left join filereference f2 on f.file_id = f2.file_id 
                                        where f.id_sesion = `+session+`) as recibo,
                                    f.file_date as fecha,
                                    SUM(f2.quantity) as tto,
                                    t.trt_name as nombreTrt,
                                    f2.sessprice as precioU,
                                    f2.discount as descuentoPorcentual,
                                    ((f2.sessprice * f2.discount)/100) as descuento,
                                    SUM(f2.payment) as subtotal
                                from
                                    file f
                                left join fileentry f2 on
                                    f.file_id = f2.file_id
                                left join patient p on 
                                    f.pat_id = p.pat_id 
                                left join person p2 on
                                    p.person_id = p2.person_id 
                                left join treatment t on
                                    f2.trt_id = t.trt_id 
                                where
                                    f.id_sesion = (select f2.file_rel_id from file f 
                                left join filereference f2 on f.file_id = f2.file_id 
                                where f.id_sesion = `+session+`)
                                group by f2.trt_id, f2.discount`);

     const {id, cli_id, fecha} = receiptData[0];
     let date = new Date(fecha)
     let dd = date.getDate(); 
     let mm = date.getMonth()+1;
     let yyyy = date.getFullYear(); 
     if(dd<10){dd=+`0${dd}`};
     if(mm<10){mm=+`0${mm}`};
     let d = yyyy+'-'+mm+'-'+dd;
    console.info(id, cli_id, d);  
    const actualBalance = await entityManager.query(`SELECT
                                file_id,
                                pat_balance
                            FROM
                                file
                            WHERE
                                pat_id = ${id}
                                AND cli_id <= ${cli_id}
                                AND status_id = 1
                                AND filetype_id = 1
                                AND DATE(file_date) <= '${d}'
                            GROUP BY
                                file_number
                            ORDER BY
                                file_id 
                            DESC
                            LIMIT 2`);

    const response = {
        "receiptData": receiptData,
        "balanceData": actualBalance
    }

    const sendResponse = {
        "success": true,
        "data": response,
        "message": "ok"
    };
    return res.json(sendResponse);
}

async function patDetails(patId: number): Promise<any> {
    interface patDetails {
        idPatient: number,
        aPaterno: string,
        aMaterno: string,
        nombre: string,
        nombreCompleto: string,
        fnacimiento: string,
        idPlan: number,
        nombrePlan: string,
        email: string,
        telefono: number
    };
    const entityManager = getManager();    
    const patQuery: patDetails = await entityManager.query(`SELECT
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
            p2.pat_id = `+ patId +`
            -- AND a.agr_active = 'activo'
            -- AND e.email_active = 'activo'
            -- AND t.tel_active = 'activo'
            AND p2.pat_active = 'activo'
    GROUP BY p2.pat_id,p.per_lastname,p.per_surename,p.per_name,p.per_birthday,p3.agr_id,a.agr_name,e.email,t.tel_number
    LIMIT 1`);        
    return patQuery;
}

async function patDocuments(patId: number): Promise<any> {    
    const entityManager = getManager();    
    const patQuery = await entityManager.query(`SELECT
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
     AND f.pat_id = `+ patId +`
     AND fp.paymeth_id NOT IN (7)
ORDER BY
     f.file_date,
     f.file_number,
     f.cli_id`);
    return patQuery;
}

async function patSessions(patId: number): Promise<any> {
    const entityManager = getManager();    
    const patQuery = await entityManager.query(`select
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
    and pat_id = `+ patId +`
    and filetype_id = 2`);
    return patQuery;
}
