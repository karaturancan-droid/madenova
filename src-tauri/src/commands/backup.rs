use crate::db::DbPool;
use crate::helpers::restore_row_generic;
use rusqlite::types::ValueRef;
use rusqlite::Connection;
use serde_json::{Map, Value as JsonValue};
use tauri::State;

const ALL_TABLES: &[&str] = &[
    "companies",
    "ledger_entries",
    "recycle_bin",
    "products",
    "stock_movements",
    "vehicles",
    "vehicle_expenses",
    "tires",
    "tax_items",
    "workers",
    "leaves",
    "overtimes",
    "payrolls",
    "documents",
    "notifications",
    "invoices",
    "settings",
    "import_hashes",
];

fn sql_value_ref_to_json(v: ValueRef) -> JsonValue {
    match v {
        ValueRef::Null => JsonValue::Null,
        ValueRef::Integer(i) => JsonValue::from(i),
        ValueRef::Real(f) => JsonValue::from(f),
        ValueRef::Text(t) => JsonValue::from(String::from_utf8_lossy(t).to_string()),
        ValueRef::Blob(_) => JsonValue::Null,
    }
}

fn dump_table(conn: &Connection, table: &str) -> Result<Vec<JsonValue>, String> {
    let sql = format!("SELECT * FROM {}", table);
    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let col_names: Vec<String> = stmt.column_names().iter().map(|s| s.to_string()).collect();
    let mut rows = stmt.query([]).map_err(|e| e.to_string())?;
    let mut result = Vec::new();
    while let Some(row) = rows.next().map_err(|e| e.to_string())? {
        let mut map = Map::new();
        for (i, name) in col_names.iter().enumerate() {
            let value_ref = row.get_ref(i).map_err(|e| e.to_string())?;
            map.insert(name.clone(), sql_value_ref_to_json(value_ref));
        }
        result.push(JsonValue::Object(map));
    }
    Ok(result)
}

#[tauri::command]
pub fn export_backup(pool: State<DbPool>) -> Result<String, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let mut root = Map::new();
    for table in ALL_TABLES {
        let rows = dump_table(&conn, table)?;
        root.insert(table.to_string(), JsonValue::Array(rows));
    }
    root.insert(
        "exported_at".to_string(),
        JsonValue::from(chrono::Utc::now().to_rfc3339()),
    );
    serde_json::to_string_pretty(&JsonValue::Object(root)).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn import_backup(pool: State<DbPool>, json: String) -> Result<(), String> {
    let mut conn = pool.0.get().map_err(|e| e.to_string())?;
    let parsed: JsonValue = serde_json::from_str(&json).map_err(|e| e.to_string())?;
    let obj = parsed.as_object().ok_or_else(|| "Gecersiz yedek dosyasi".to_string())?;

    let tx = conn.transaction().map_err(|e| e.to_string())?;

    for table in ALL_TABLES {
        if let Some(JsonValue::Array(rows)) = obj.get(*table) {
            for row in rows {
                restore_row_generic(&tx, table, row)?;
            }
        }
    }

    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}
