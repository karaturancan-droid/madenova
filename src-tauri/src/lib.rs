mod commands;
mod db;
mod helpers;
mod models;

use commands::backup::{export_backup, import_backup};
use commands::companies::{create_company, delete_company, get_company, list_companies, update_company};
use commands::documents::{
    create_document, delete_document, list_documents, list_expiring_documents, update_document,
};
use commands::invoices::{
    approve_invoice, check_import_hash, create_invoice, get_invoice, list_invoices,
    record_import_hash, reject_invoice, update_invoice,
};
use commands::ledger::{
    create_ledger_entry, delete_ledger_entry, get_ledger_summary, list_ledger_entries,
    update_ledger_entry,
};
use commands::notifications::{list_notifications, refresh_notifications, update_notification_status};
use commands::products::{
    create_product, create_stock_movement, delete_product, get_stock_summary, list_products,
    list_stock_movements, update_product,
};
use commands::recycle_bin::{
    list_recycle_bin, permanently_delete_recycle_item, purge_expired_recycle_bin,
    restore_from_recycle_bin,
};
use commands::settings::{get_setting, set_setting};
use commands::tax::{create_tax_item, delete_tax_item, list_tax_items, refresh_overdue_tax_items, update_tax_item};
use commands::vehicles::{
    create_tire, create_vehicle, create_vehicle_expense, delete_vehicle,
    get_vehicle_expense_summary, list_tires, list_vehicle_expenses, list_vehicles, update_vehicle,
};
use commands::workers::{
    calculate_severance, create_leave, create_overtime, create_payroll, create_worker,
    delete_worker, list_leaves, list_overtimes, list_payrolls, list_workers, update_payroll,
    update_worker,
};

use db::DbPool;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data dir");
            std::fs::create_dir_all(&app_data_dir).expect("failed to create app data dir");

            let pool_inner = db::create_pool(&app_data_dir);

            {
                let conn = pool_inner.get().expect("failed to get db connection");
                db::run_migrations(&conn).expect("failed to run migrations");

                commands::recycle_bin::purge_expired_recycle_bin_conn(&conn)
                    .expect("failed to purge expired recycle bin items");

                commands::tax::refresh_overdue_tax_items_conn(&conn)
                    .expect("failed to refresh overdue tax items");

                commands::notifications::refresh_notifications_conn(&conn)
                    .expect("failed to refresh notifications");
            }

            app.manage(DbPool(pool_inner));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // companies
            create_company,
            update_company,
            list_companies,
            get_company,
            delete_company,
            // ledger
            create_ledger_entry,
            update_ledger_entry,
            delete_ledger_entry,
            list_ledger_entries,
            get_ledger_summary,
            // recycle bin
            list_recycle_bin,
            restore_from_recycle_bin,
            permanently_delete_recycle_item,
            purge_expired_recycle_bin,
            // products / stock
            create_product,
            update_product,
            list_products,
            delete_product,
            create_stock_movement,
            list_stock_movements,
            get_stock_summary,
            // vehicles
            create_vehicle,
            update_vehicle,
            list_vehicles,
            delete_vehicle,
            create_vehicle_expense,
            list_vehicle_expenses,
            get_vehicle_expense_summary,
            create_tire,
            list_tires,
            // tax
            create_tax_item,
            update_tax_item,
            list_tax_items,
            delete_tax_item,
            refresh_overdue_tax_items,
            // workers
            create_worker,
            update_worker,
            list_workers,
            delete_worker,
            create_leave,
            list_leaves,
            create_overtime,
            list_overtimes,
            create_payroll,
            update_payroll,
            list_payrolls,
            calculate_severance,
            // documents
            create_document,
            update_document,
            list_documents,
            delete_document,
            list_expiring_documents,
            // notifications
            refresh_notifications,
            list_notifications,
            update_notification_status,
            // invoices
            create_invoice,
            update_invoice,
            list_invoices,
            get_invoice,
            approve_invoice,
            reject_invoice,
            check_import_hash,
            record_import_hash,
            // settings
            get_setting,
            set_setting,
            // backup
            export_backup,
            import_backup,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
