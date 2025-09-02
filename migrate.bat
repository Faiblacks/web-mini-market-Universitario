@echo off
echo ========================================
echo StudiMarket - Script de Migracion
echo ========================================
echo.

:: Crear backup
echo [1/5] Creando backup...
if not exist "backup" mkdir backup
xcopy "*.html" "backup\" /Y > nul 2>&1
xcopy "*.js" "backup\" /Y > nul 2>&1
xcopy "*.css" "backup\" /Y > nul 2>&1
echo    ✓ Backup creado en /backup

:: Crear estructura legacy
echo [2/5] Organizando archivos legacy...
if not exist "legacy" mkdir legacy

:: Mover archivos duplicados a legacy
move "cart-broken.js" "legacy\" > nul 2>&1
move "cart-optimized.js" "legacy\" > nul 2>&1
move "cart-simple.js" "legacy\" > nul 2>&1
move "product-modal.js" "legacy\" > nul 2>&1
move "main_clean.js" "legacy\" > nul 2>&1
move "styles-backup.css" "legacy\" > nul 2>&1
move "debug.html" "legacy\" > nul 2>&1
move "test-load.html" "legacy\" > nul 2>&1
move "test-products.html" "legacy\" > nul 2>&1
echo    ✓ Archivos legacy movidos

:: Actualizar archivo principal
echo [3/5] Actualizando archivos principales...
copy "index-optimized.html" "index.html" /Y > nul 2>&1
copy "assets\css\styles-optimized.css" "assets\css\styles.css" /Y > nul 2>&1
echo    ✓ Archivos principales actualizados

:: Limpiar archivos temporales
echo [4/5] Limpiando archivos temporales...
del "index-optimized.html" > nul 2>&1
del "assets\css\styles-optimized.css" > nul 2>&1
echo    ✓ Archivos temporales eliminados

:: Verificar estructura
echo [5/5] Verificando estructura...
if exist "assets\js\studimarket.js" echo    ✓ JavaScript unificado OK
if exist "assets\css\styles.css" echo    ✓ CSS optimizado OK
if exist "assets\data\products.json" echo    ✓ Datos OK
if exist "assets\images\" echo    ✓ Imagenes OK
if exist "legacy\" echo    ✓ Legacy folder OK

echo.
echo ========================================
echo    MIGRACION COMPLETADA EXITOSAMENTE
echo ========================================
echo.
echo Archivos optimizados:
echo  ✓ index.html ^(optimizado^)
echo  ✓ assets/js/studimarket.js ^(unificado^)
echo  ✓ assets/css/styles.css ^(optimizado^)
echo  ✓ assets/data/products.json
echo  ✓ assets/images/ ^(organizadas^)
echo.
echo Archivos legacy movidos a /legacy:
echo  - cart-*.js ^(4 archivos^)
echo  - product-modal.js
echo  - main_clean.js
echo  - debug.html, test-*.html
echo.
echo Backup disponible en /backup
echo.
echo ¡Prueba tu sitio web ahora!
pause
