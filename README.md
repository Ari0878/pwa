# PWA Registro de Incidencias
Ejecutar: `node server.js` → abrir http://localhost:3000 (Service Worker requiere localhost o HTTPS).

## Cliente vs servidor
- Cliente: UI, validación, generación de UUID, IndexedDB, cola de pendientes, Cache API.
- Servidor: persistencia (db.json), GET/POST /api/incidencias, deduplicación por id.

## Pruebas
| # | | 
|---|--------|
| 1 | Splash y Home se muestran | 
| 2 | Datos visibles en la interfaz | 
| 3 | Datos persisten tras recargar | 
| 4 | Abre sin conexión (DevTools > Network > Offline) |
| 5 | Pendientes se envían al reconectar | 
| 6 | Sin duplicados en reintentos (revisar db.json) | 

## Limitaciones
- No hay Background Sync: el reintento ocurre al evento `online` o con el botón.
- Sin edición/borrado ni autenticación.
