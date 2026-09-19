'use client';

import { useState, useCallback, useEffect } from 'react';
import { callBackend } from '@/lib/tauri';

export interface Product {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  unit?: string;
  purchase_price: number;
  sale_price: number;
  min_stock: number;
  current_stock: number;
  supplier?: string;
  created_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  type: 'giriş' | 'çıkış';
  quantity: number;
  date: string;
  note?: string;
  created_at: string;
}

export interface StockSummary {
  total_stock_value: number;
  critical_stock_list: Array<{
    product_id: string;
    product_name: string;
    current_stock: number;
    min_stock: number;
  }>;
}

export function useDepo() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [stockSummary, setStockSummary] = useState<StockSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ürünleri listele
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await callBackend<Product[]>('list_products');
      setProducts(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ürünler yüklenemedi';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Seçili ürün için stok hareketlerini ve özeti yükle
  const loadStockData = useCallback(async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [movements, summary] = await Promise.all([
        callBackend<StockMovement[]>('list_stock_movements', {
          product_id: productId,
        }),
        callBackend<StockSummary>('get_stock_summary'),
      ]);
      setStockMovements(movements);
      setStockSummary(summary);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Stok verileri yüklenemedi';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Ürün seç ve verilerini yükle
  const selectProduct = useCallback(
    async (productId: string) => {
      setSelectedProductId(productId);
      await loadStockData(productId);
    },
    [loadStockData]
  );

  // Ürün oluştur
  const createProduct = useCallback(
    async (data: {
      name: string;
      sku?: string;
      category?: string;
      unit?: string;
      purchase_price: number;
      sale_price: number;
      min_stock: number;
      current_stock: number;
      supplier?: string;
    }) => {
      setError(null);
      try {
        const newProduct = await callBackend<Product>('create_product', data);
        setProducts((prev) => [...prev, newProduct].sort((a, b) => a.name.localeCompare(b.name)));
        return newProduct;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Ürün oluşturulamadı';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Ürün güncelle
  const updateProduct = useCallback(
    async (
      id: string,
      data: {
        name: string;
        sku?: string;
        category?: string;
        unit?: string;
        purchase_price: number;
        sale_price: number;
        min_stock: number;
        current_stock: number;
        supplier?: string;
      }
    ) => {
      setError(null);
      try {
        await callBackend('update_product', { id, ...data });
        setProducts((prev) =>
          prev
            .map((p) => (p.id === id ? { ...p, ...data } : p))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Ürün güncellenemedi';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Ürün sil
  const deleteProduct = useCallback(
    async (id: string) => {
      setError(null);
      try {
        await callBackend('delete_product', { id });
        setProducts((prev) => prev.filter((p) => p.id !== id));
        if (selectedProductId === id) {
          setSelectedProductId(null);
          setStockMovements([]);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Ürün silinemedi';
        setError(message);
        throw err;
      }
    },
    [selectedProductId]
  );

  // Stok hareketi oluştur
  const createStockMovement = useCallback(
    async (data: {
      product_id: string;
      type: 'giriş' | 'çıkış';
      quantity: number;
      date: string;
      note?: string;
    }) => {
      setError(null);
      try {
        const newMovement = await callBackend<StockMovement>('create_stock_movement', data);
        await loadStockData(data.product_id);
        return newMovement;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Stok hareketi oluşturulamadı';
        setError(message);
        throw err;
      }
    },
    [loadStockData]
  );

  // İlk yükleme
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    selectedProductId,
    stockMovements,
    stockSummary,
    loading,
    error,
    selectProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    createStockMovement,
    loadProducts,
  };
}
