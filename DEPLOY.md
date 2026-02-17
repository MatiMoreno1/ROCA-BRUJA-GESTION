# ROCA BRUJA - Guia de Deploy

## Resumen

Tu Google Sheet es la "base de datos". La app React lee esos datos automaticamente.
Cualquiera con el link del dashboard ve los datos actualizados en tiempo real.

## Costo: $0 (todo gratis)

---

## PASO 1: Subir template a Google Sheets

1. Abri Google Drive (drive.google.com)
2. Subi el archivo `roca-bruja-sheets-template.xlsx`
3. Abrilo con Google Sheets (click derecho > Abrir con > Google Sheets)
4. Ahora tenes un Google Sheet con 5 hojas: Eventos, Vendedores, VentasVendedores, CostosFijos, Config

## PASO 2: Publicar el Sheet

1. En Google Sheets, ir a Archivo > Compartir > Publicar en la web
2. Elegir "Documento completo" y "Pagina web"
3. Click en "Publicar"
4. Copiar el ID del Sheet de la URL. Ejemplo:
   - URL: `https://docs.google.com/spreadsheets/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/edit`
   - ID: `1aBcDeFgHiJkLmNoPqRsTuVwXyZ`

## PASO 3: Crear cuenta en GitHub (si no tenes)

1. Ir a github.com y crear cuenta gratis
2. Crear un repositorio nuevo llamado `roca-bruja-gestion`
3. Subir TODA la carpeta `roca-bruja-app` al repo

### Como subir archivos a GitHub:

Opcion A - Desde la web:
- En tu repo nuevo, click "uploading an existing file"
- Arrastra todos los archivos de la carpeta roca-bruja-app
- Click "Commit changes"

Opcion B - Desde terminal (si tenes git):
```bash
cd roca-bruja-app
git init
git add .
git commit -m "Roca Bruja Gestion v3.0"
git remote add origin https://github.com/TU_USUARIO/roca-bruja-gestion.git
git push -u origin main
```

## PASO 4: Deploy en Vercel (gratis)

1. Ir a vercel.com y crear cuenta con tu GitHub
2. Click "New Project"
3. Importar el repo `roca-bruja-gestion`
4. En "Environment Variables" agregar:
   - Key: `VITE_SHEET_ID`
   - Value: (el ID de tu Google Sheet del Paso 2)
5. Click "Deploy"
6. En 1-2 minutos tenes tu dashboard online con una URL tipo:
   `https://roca-bruja-gestion.vercel.app`

## PASO 5: Compartir con el equipo

- Copiar la URL de Vercel y pasarla por WhatsApp/grupo
- El link funciona en celular y computadora
- Los datos se actualizan automaticamente cada 60 segundos

---

## USO DIARIO

### Para cargar un evento nuevo:
1. Abri tu Google Sheet
2. En la hoja "Eventos", agrega una fila nueva con los datos del evento
3. En "VentasVendedores", agrega las ventas de cada vendedor para ese evento
4. Listo - el dashboard se actualiza solo en menos de 1 minuto

### Para modificar costos fijos:
1. En la hoja "CostosFijos", cambia los montos
2. El dashboard recalcula todo automaticamente

### Para agregar un vendedor:
1. En la hoja "Vendedores", agrega una fila con nombre y comision
2. Ya aparece en el dashboard

---

## ESTRUCTURA DEL GOOGLE SHEET

### Hoja: Eventos
| Columna | Que poner |
|---------|-----------|
| id | Numero unico (1, 2, 3...) |
| tipo | sabado, viernes, o master |
| fecha | Formato YYYY-MM-DD (2026-03-07) |
| asistencia | Numero de personas |
| rev_mesas | Ingreso por mesas en $ |
| rev_puerta | Ingreso por puerta en $ |
| rev_barra | Ingreso por barra en $ |
| cost_dj | Costo DJ/Artistico |
| cost_sonido | Costo Sonido/Tecnica |
| cost_seguridad | Costo Seguridad |
| cost_personal | Costo Personal/RRHH |
| cost_bebidas | Costo Bebidas (CMV) |
| cost_limpieza | Costo Limpieza |
| cost_energia | Costo Energia |
| cost_marketing | Costo Marketing |
| cost_comisiones | Costo Comisiones |
| cost_otros | Otros costos |

### Hoja: VentasVendedores
| Columna | Que poner |
|---------|-----------|
| evento_id | El id del evento (debe coincidir con Eventos) |
| vendedor | Nombre del vendedor (debe coincidir con Vendedores) |
| monto | Monto vendido en $ |

### Hoja: Vendedores
| Columna | Que poner |
|---------|-----------|
| nombre | Nombre del vendedor |
| comision_pct | Porcentaje de comision (10 = 10%) |

### Hoja: CostosFijos
| Columna | Que poner |
|---------|-----------|
| concepto | Nombre del costo fijo |
| monto_mensual | Monto mensual en $ |

### Hoja: Config
| Columna | Que poner |
|---------|-----------|
| tipo_id | sabado, viernes, o master |
| nombre | Nombre para mostrar |
| capacidad | Capacidad maxima |
| color | Color hex (#FCD34D) |
