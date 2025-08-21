# Backend - Aplicación de Cotizaciones

## Configuración

### Variables de Entorno

Este proyecto utiliza variables de entorno para manejar la configuración de manera segura. Sigue estos pasos:

1. **Copia el archivo de ejemplo:**
   ```bash
   cp .env.example .env
   ```

2. **Edita el archivo `.env`** con tus datos reales:
   ```env
   DB_USER=tu_usuario_sql_server
   DB_PASSWORD=tu_contraseña_segura
   DB_DATABASE=CotizacionesDB
   DB_SERVER=localhost
   ```

### Variables Disponibles

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `DB_USER` | Usuario de SQL Server | - |
| `DB_PASSWORD` | Contraseña de SQL Server | - |
| `DB_DATABASE` | Nombre de la base de datos | - |
| `DB_SERVER` | Servidor de base de datos | localhost |
| `DB_ENCRYPT` | Encriptar conexión | false |
| `DB_TRUST_SERVER_CERTIFICATE` | Confiar en certificado | true |
| `PORT` | Puerto del servidor | 5000 |
| `DB_POOL_MAX` | Máximo conexiones en pool | 10 |
| `DB_POOL_MIN` | Mínimo conexiones en pool | 0 |
| `DB_POOL_IDLE_TIMEOUT` | Timeout de conexiones inactivas | 30000 |

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm start
```

## Seguridad

- **NUNCA** subas el archivo `.env` al repositorio
- Usa contraseñas seguras
- Cambia las credenciales por defecto en producción