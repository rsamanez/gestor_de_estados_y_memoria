# File Manager Backend API

Backend Express con integración a AWS S3 para el Gestor de Estados y Archivos.

## 🚀 Configuración Rápida

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar AWS S3

#### Crear bucket S3:
1. Ve a [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Crea un nuevo bucket (ej: `my-file-manager-bucket`)
3. Configura permisos según necesidades

#### Configurar credenciales:
```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env con tus credenciales
AWS_ACCESS_KEY_ID=tu_access_key_aqui
AWS_SECRET_ACCESS_KEY=tu_secret_key_aqui
AWS_REGION=us-east-1
S3_BUCKET_NAME=tu-bucket-name-aqui
```

### 3. Ejecutar servidor
```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en: `http://localhost:3001`

## 📡 Endpoints API

### `POST /api/upload`
Sube un archivo a S3
- **Body**: FormData con `file` y `stateId`
- **Response**: Información del archivo subido

### `GET /api/files/:stateId`
Obtiene archivos por estado
- **Params**: `stateId` (1-4)
- **Response**: Array de archivos

### `DELETE /api/files/:fileId`
Elimina un archivo de S3
- **Params**: `fileId` (S3 key)
- **Response**: Confirmación de eliminación

### `GET /api/download/:fileId`
Genera URL de descarga temporal
- **Params**: `fileId` (S3 key)
- **Response**: URL firmada (válida 1 hora)

### `GET /api/health`
Verifica estado del servidor y S3
- **Response**: Estado de salud

## 🔐 Configuración AWS

### Política IAM recomendada:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::tu-bucket-name",
                "arn:aws:s3:::tu-bucket-name/*"
            ]
        }
    ]
}
```

### CORS del bucket S3:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://localhost:5173", "http://localhost:5174"],
        "ExposeHeaders": []
    }
]
```

## 🛠️ Desarrollo

### Scripts disponibles:
- `npm start`: Ejecutar en producción
- `npm run dev`: Ejecutar con nodemon (desarrollo)

### Estructura de archivos en S3:
```
bucket-name/
├── state-1/
│   ├── 1699123456789-abc12345-documento.pdf
│   └── 1699123567890-def67890-imagen.jpg
├── state-2/
│   └── ...archivos del estado 2...
├── state-3/
└── state-4/
```

## 🔍 Testing

### Probar conexión:
```bash
curl http://localhost:3001/api/health
```

### Probar upload:
```bash
curl -X POST -F "file=@test.txt" -F "stateId=1" http://localhost:3001/api/upload
```

## 📊 Monitoreo

El backend incluye logs detallados:
- ✅ Uploads exitosos
- ❌ Errores con detalles
- 📊 Información de archivos
- 📡 Estado de conexiones

## 🚨 Troubleshooting

### Error: "AWS credentials not found"
- Verifica `.env` con credenciales correctas
- Asegúrate que las credenciales tengan permisos S3

### Error: "Bucket does not exist"
- Verifica que el bucket existe en AWS
- Confirma que la región es correcta

### Error: "Access Denied"
- Revisa la política IAM del usuario
- Verifica permisos del bucket S3

## 🔒 Seguridad

- Las credenciales AWS solo están en el backend
- CORS configurado para dominios específicos
- Validación de tipos y tamaños de archivo
- URLs de descarga con expiración temporal
