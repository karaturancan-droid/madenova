use crate::db::DbPool;
use crate::helpers::{new_id, now_iso, soft_delete};
use crate::models::{Product, StockMovement, StockSummary};
use tauri::State;

fn map_product_row(row: &rusqlite::Row) -> rusqlite::Result<Product> {
    Ok(Product {
        id: row.get(0)?,
        name: row.get(1)?,
        sku: row.get(2)?,
        category: row.get(3)?,
        unit: row.get(4)?,
        purchase_price: row.get(5)?,
        sale_price: row.get(6)?,
        min_stock: row.get(7)?,
        current_stock: row.get(8)?,
        supplier: row.get(9)?,
        created_at: row.get(10)?,
    })
}

const PRODUCT_COLS: &str = "id, name, sku, category, unit, purchase_price, sale_price, min_stock, current_stock, supplier, created_at";

#[tauri::command]
pub fn create_product(
    pool: State<DbPool>,
    name: String,
    sku: Option<String>,
    category: Option<String>,
    unit: Option<String>,
    purchase_price: f64,
    sale_price: f64,
    min_stock: f64,
    supplier: Option<String>,
) -> Result<Product, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let id = new_id();
    let created_at = now_iso();
    conn.execute(
        "INSERT INTO products (id, name, sku, category, unit, purchase_price, sale_price, min_stock, current_stock, supplier, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 0, ?9, ?10)",
        rusqlite::params![id, name, sku, category, unit, purchase_price, sale_price, min_stock, supplier, created_at],
    )
    .map_err(|e| e.to_string())?;

    Ok(Product {
        id,
        name,
        sku,
        category,
        unit,
        purchase_price,
        sale_price,
        min_stock,
        current_stock: 0.0,
        supplier,
        created_at,
    })
}

#[tauri::command]
pub fn update_product(
    pool: State<DbPool>,
    id: String,
    name: String,
    sku: Option<String>,
    category: Option<String>,
    unit: Option<String>,
    purchase_price: f64,
    sale_price: f64,
    min_stock: f64,
    supplier: Option<String>,
) -> Result<(), String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE products SET name=?1, sku=?2, category=?3, unit=?4, purchase_price=?5, sale_price=?6, min_stock=?7, supplier=?8 WHERE id=?9",
        rusqlite::params![name, sku, category, unit, purchase_price, sale_price, min_stock, supplier, id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_products(pool: State<DbPool>) -> Result<Vec<Product>, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let sql = format!("SELECT {} FROM products ORDER BY name ASC", PRODUCT_COLS);
    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let mapped = stmt.query_map([], map_product_row).map_err(|e| e.to_string())?;
    mapped.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_product(pool: State<DbPool>, id: String) -> Result<(), String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    soft_delete(&conn, "products", "product", &id)
}

#[tauri::command]
pub fn create_stock_movement(
    pool: State<DbPool>,
    product_id: String,
    r#type: String,
    quantity: f64,
    date: String,
    note: Option<String>,
) -> Result<StockMovement, String> {
    let mut conn = pool.0.get().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    let id = new_id();
    let created_at = now_iso();
    tx.execute(
        "INSERT INTO stock_movements (id, product_id, type, quantity, date, note, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![id, product_id, r#type, quantity, date, note, created_at],
    )
    .map_err(|e| e.to_string())?;

    let delta = if r#type == "giriş" || r#type == "giris" { quantity } else { -quantity };
    tx.execute(
        "UPDATE products SET current_stock = current_stock + ?1 WHERE id = ?2",
        rusqlite::params![delta, product_id],
    )
    .map_err(|e| e.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;

    Ok(StockMovement {
        id,
        product_id,
        movement_type: r#type,
        quantity,
        date,
        note,
        created_at,
    })
}

#[tauri::command]
pub fn list_stock_movements(
    pool: State<DbPool>,
    product_id: Option<String>,
) -> Result<Vec<StockMovement>, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let map_row = |row: &rusqlite::Row| -> rusqlite::Result<StockMovement> {
        Ok(StockMovement {
            id: row.get(0)?,
            product_id: row.get(1)?,
            movement_type: row.get(2)?,
            quantity: row.get(3)?,
            date: row.get(4)?,
            note: row.get(5)?,
            created_at: row.get(6)?,
        })
    };

    if let Some(pid) = product_id {
        let mut stmt = conn
            .prepare("SELECT id, product_id, type, quantity, date, note, created_at FROM stock_movements WHERE product_id = ?1 ORDER BY date DESC, created_at DESC")
            .map_err(|e| e.to_string())?;
        let mapped = stmt.query_map(rusqlite::params![pid], map_row).map_err(|e| e.to_string())?;
        mapped.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
    } else {
        let mut stmt = conn
            .prepare("SELECT id, product_id, type, quantity, date, note, created_at FROM stock_movements ORDER BY date DESC, created_at DESC")
            .map_err(|e| e.to_string())?;
        let mapped = stmt.query_map([], map_row).map_err(|e| e.to_string())?;
        mapped.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub fn get_stock_summary(pool: State<DbPool>) -> Result<StockSummary, String> {
    let conn = pool.0.get().map_err(|e| e.to_string())?;
    let total_stock_value: f64 = conn
        .query_row(
            "SELECT COALESCE(SUM(current_stock * purchase_price), 0) FROM products",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    let sql = format!(
        "SELECT {} FROM products WHERE current_stock <= min_stock ORDER BY name ASC",
        PRODUCT_COLS
    );
    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let critical_products = stmt
        .query_map([], map_product_row)
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(StockSummary {
        total_stock_value,
        critical_products,
    })
}
