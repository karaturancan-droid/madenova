/**
 * Tauri backend komutlarını çağırmak için ince, tip güvenli bir sarmalayıcı.
 * Uygulama tarayıcıda (örn. `next dev` ile önizleme) çalıştırılıyorsa Tauri
 * ortamı bulunmadığından anlaşılır bir Türkçe hata fırlatılır; sayfalar bu
 * hatayı yakalayıp kullanıcıya dostça bir mesaj gösterebilir.
 */

export function isTauriEnvironment(): boolean {
  return (
    typeof window !== "undefined" &&
    "__TAURI_INTERNALS__" in (window as unknown as Record<string, unknown>)
  );
}

export async function callBackend<T>(
  cmd: string,
  args?: Record<string, unknown>
): Promise<T> {
  if (!isTauriEnvironment()) {
    throw new Error("Bu özellik yalnızca masaüstü uygulamasında çalışır.");
  }

  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(cmd, args);
}
