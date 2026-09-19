use crate::db::DbPool;
use crate::helpers::{new_id, now_iso, soft_delete};
use crate::models::{Leave, Overtime, Payroll, Worker};
use chrono::NaiveDate;
use tauri::State;

const WORKER_COLS: &str = "id, full_name, tc_no, birth_date, hire_date, exit_date, position, sgk_no, iban, salary, contract_end_date, created_at";

fn map_worker_row(row: &rusqlite::Row) -> rusqlite::Result<Worker> {
    Ok(Worker {
        id: row.get(0)?,
        full_name: row.get(1)?,
        tc_no: row.get(2)?,
        birth_date: row.get(3)?,
        hire_date: row.get(4)?,
        exit_date: row.get(5)?,
        position: row.get(6)?,
        sgk_no: row.get(7)?,
        iban: row.get(8)?,
        salary: row.get(9)?,
        contract_end_date: row.get(10)?,
        created_at: row.get(11)?,
    })
}

#[tauri::command]
pub fn create_worker(
    pool: State<DbPool>,
    full_name: String,
    tc_no: Option<String>,
    birth_date: Option<String>,
    hire_date: Option<String>,
    position: Option<String>,
    sgk_no: Option<String>,
    iban: Option<String>,
    salary: f64,
    contract_end_date: Option<String>,
) -> Result<Worker, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let id = new_id();
    let created_at = now_iso();
    conn.execute(
        "INSERT INTO workers (id, full_name, tc_no, birth_date, hire_date, exit_date, position, sgk_no, iban, salary, contract_end_date, created_at) VALUES (?1, ?2, ?3, ?4, ?5, NULL, ?6, ?7, ?8, ?9, ?10, ?11)",
        rusqlite::params![id, full_name, tc_no, birth_date, hire_date, position, sgk_no, iban, salary, contract_end_date, created_at],
    )
    .map_err(|e| e.to_string())?;

    Ok(Worker {
        id,
        full_name,
        tc_no,
        birth_date,
        hire_date,
        exit_date: None,
        position,
        sgk_no,
        iban,
        salary,
        contract_end_date,
        created_at,
    })
}

#[tauri::command]
pub fn update_worker(
    pool: State<DbPool>,
    id: String,
    full_name: String,
    tc_no: Option<String>,
    birth_date: Option<String>,
    hire_date: Option<String>,
    exit_date: Option<String>,
    position: Option<String>,
    sgk_no: Option<String>,
    iban: Option<String>,
    salary: f64,
    contract_end_date: Option<String>,
) -> Result<(), String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE workers SET full_name=?1, tc_no=?2, birth_date=?3, hire_date=?4, exit_date=?5, position=?6, sgk_no=?7, iban=?8, salary=?9, contract_end_date=?10 WHERE id=?11",
        rusqlite::params![full_name, tc_no, birth_date, hire_date, exit_date, position, sgk_no, iban, salary, contract_end_date, id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_workers(pool: State<DbPool>) -> Result<Vec<Worker>, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let sql = format!("SELECT {} FROM workers ORDER BY full_name ASC", WORKER_COLS);
    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let mapped = stmt.query_map([], map_worker_row).map_err(|e| e.to_string())?;
    mapped.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_worker(pool: State<DbPool>, id: String) -> Result<(), String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    soft_delete(&conn, "workers", "worker", &id)
}

#[tauri::command]
pub fn create_leave(
    pool: State<DbPool>,
    worker_id: String,
    start_date: String,
    end_date: String,
    r#type: Option<String>,
    days: Option<f64>,
) -> Result<Leave, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let id = new_id();
    let created_at = now_iso();
    conn.execute(
        "INSERT INTO leaves (id, worker_id, start_date, end_date, type, days, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![id, worker_id, start_date, end_date, r#type, days, created_at],
    )
    .map_err(|e| e.to_string())?;

    Ok(Leave {
        id,
        worker_id,
        start_date,
        end_date,
        leave_type: r#type,
        days,
        created_at,
    })
}

#[tauri::command]
pub fn list_leaves(pool: State<DbPool>, worker_id: String) -> Result<Vec<Leave>, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, worker_id, start_date, end_date, type, days, created_at FROM leaves WHERE worker_id = ?1 ORDER BY start_date DESC")
        .map_err(|e| e.to_string())?;
    let mapped = stmt
        .query_map(rusqlite::params![worker_id], |row| {
            Ok(Leave {
                id: row.get(0)?,
                worker_id: row.get(1)?,
                start_date: row.get(2)?,
                end_date: row.get(3)?,
                leave_type: row.get(4)?,
                days: row.get(5)?,
                created_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;
    mapped.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_overtime(
    pool: State<DbPool>,
    worker_id: String,
    date: String,
    hours: f64,
    rate: f64,
) -> Result<Overtime, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let id = new_id();
    let created_at = now_iso();
    conn.execute(
        "INSERT INTO overtimes (id, worker_id, date, hours, rate, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![id, worker_id, date, hours, rate, created_at],
    )
    .map_err(|e| e.to_string())?;

    Ok(Overtime {
        id,
        worker_id,
        date,
        hours,
        rate,
        created_at,
    })
}

#[tauri::command]
pub fn list_overtimes(pool: State<DbPool>, worker_id: String) -> Result<Vec<Overtime>, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, worker_id, date, hours, rate, created_at FROM overtimes WHERE worker_id = ?1 ORDER BY date DESC")
        .map_err(|e| e.to_string())?;
    let mapped = stmt
        .query_map(rusqlite::params![worker_id], |row| {
            Ok(Overtime {
                id: row.get(0)?,
                worker_id: row.get(1)?,
                date: row.get(2)?,
                hours: row.get(3)?,
                rate: row.get(4)?,
                created_at: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?;
    mapped.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_payroll(
    pool: State<DbPool>,
    worker_id: String,
    period: String,
    gross: Option<f64>,
    net: Option<f64>,
    deductions: Option<f64>,
    status: Option<String>,
) -> Result<Payroll, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let id = new_id();
    let created_at = now_iso();
    conn.execute(
        "INSERT INTO payrolls (id, worker_id, period, gross, net, deductions, status, receipt_path, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, NULL, ?8)",
        rusqlite::params![id, worker_id, period, gross, net, deductions, status, created_at],
    )
    .map_err(|e| e.to_string())?;

    Ok(Payroll {
        id,
        worker_id,
        period,
        gross,
        net,
        deductions,
        status,
        receipt_path: None,
        created_at,
    })
}

#[tauri::command]
pub fn update_payroll(
    pool: State<DbPool>,
    id: String,
    gross: Option<f64>,
    net: Option<f64>,
    deductions: Option<f64>,
    status: Option<String>,
    receipt_path: Option<String>,
) -> Result<(), String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE payrolls SET gross=?1, net=?2, deductions=?3, status=?4, receipt_path=?5 WHERE id=?6",
        rusqlite::params![gross, net, deductions, status, receipt_path, id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_payrolls(pool: State<DbPool>, worker_id: String) -> Result<Vec<Payroll>, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, worker_id, period, gross, net, deductions, status, receipt_path, created_at FROM payrolls WHERE worker_id = ?1 ORDER BY period DESC")
        .map_err(|e| e.to_string())?;
    let mapped = stmt
        .query_map(rusqlite::params![worker_id], |row| {
            Ok(Payroll {
                id: row.get(0)?,
                worker_id: row.get(1)?,
                period: row.get(2)?,
                gross: row.get(3)?,
                net: row.get(4)?,
                deductions: row.get(5)?,
                status: row.get(6)?,
                receipt_path: row.get(7)?,
                created_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;
    mapped.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn calculate_severance(pool: State<DbPool>, worker_id: String) -> Result<f64, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let (hire_date, exit_date, salary): (Option<String>, Option<String>, f64) = conn
        .query_row(
            "SELECT hire_date, exit_date, salary FROM workers WHERE id = ?1",
            rusqlite::params![worker_id],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )
        .map_err(|e| e.to_string())?;

    let hire = hire_date
        .as_deref()
        .and_then(|d| NaiveDate::parse_from_str(d, "%Y-%m-%d").ok())
        .ok_or_else(|| "Gecerli bir ise giris tarihi bulunamadi".to_string())?;

    let end = match exit_date.as_deref() {
        Some(d) => NaiveDate::parse_from_str(d, "%Y-%m-%d").map_err(|e| e.to_string())?,
        None => chrono::Utc::now().date_naive(),
    };

    let days_employed = (end - hire).num_days();
    if days_employed <= 0 {
        return Ok(0.0);
    }

    let full_years = days_employed / 365;
    let daily_gross = salary / 30.0;
    let severance = (full_years as f64) * 30.0 * daily_gross;

    Ok(severance)
}
