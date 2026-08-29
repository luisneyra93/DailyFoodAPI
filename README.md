# DailyFood API

API REST en NestJS 11 para DailyFood: usuarios, roles, perfil de paciente y
autenticación con JWT sobre MySQL con TypeORM.

## Convención de nombres

La API es **en español**: rutas, tags de Swagger, esquemas y campos del dominio.
Se mantienen en inglés los sufijos propios del framework (`Module`, `Service`,
`Controller`, `Repository`, `Dto`) y los verbos de método (`create`, `findAll`,
`register`), que son el idioma de Nest y TypeORM. `userName` y `password` se
quedan como están porque son literalmente los nombres de columna (`UserName`,
`Password`). El único endpoint en inglés es `/api/health`, por ser un endpoint
de infraestructura que las sondas de monitorización esperan en esa ruta.

## Arquitectura

Arquitectura **modular por feature con capas y puertos/adaptadores**: cada
módulo de dominio es autocontenido y la lógica de negocio no conoce el framework
de persistencia.

```
src/
├── config/                       Configuración tipada + validación Joi del .env
├── common/
│   ├── decorators/               @Publico(), @UsuarioActual()
│   ├── filters/                  Formato único de error para toda la API
│   ├── interceptors/             Logging de requests
│   └── security/                 Puerto HashingService + adaptador bcrypt
├── database/                     TypeORM (módulo Nest + data-source del CLI)
│   └── migrations/
└── modules/
    ├── usuarios/
    │   ├── domain/               Entidad Usuario + puerto UsuarioRepository
    │   ├── application/          UsuariosService (casos de uso) + DTOs de entrada
    │   ├── infrastructure/       TypeOrmUsuarioRepository (adaptador)
    │   └── presentation/         Controlador + DTOs de salida
    ├── roles/                    Catálogo de roles (alta y consulta)
    ├── perfil-paciente/          Perfil clínico del paciente
    └── autenticacion/
        ├── application/          AutenticacionService, DTOs, contrato del JWT
        ├── infrastructure/       JwtStrategy (passport-jwt)
        ├── guards/               JwtAuthGuard global
        └── presentation/         Controlador + DTO de respuesta
```

Reglas que sostienen el diseño:

- **Dependencias hacia adentro.** `application` depende de puertos abstractos
  (`UsuarioRepository`, `RolRepository`, `HashingService`); los adaptadores
  concretos se enlazan en el módulo. Cambiar TypeORM por otro ORM, o bcrypt por
  argon2, no toca los casos de uso.
- **Cerrado por defecto.** `JwtAuthGuard` es guard global: toda ruta pide token
  salvo que se marque con `@Publico()`.
- **Fail-fast en el arranque.** Si falta o es inválida una variable de entorno,
  la app no levanta (`envValidationSchema`).
- **La contraseña nunca sale.** La columna se mapea con `select: false` y las
  respuestas se construyen siempre con `UsuarioResponseDto`.
- **Sin credenciales en el código.** Todo llega por `.env` vía `ConfigService`.
- **La integridad la impone la base de datos.** Índices únicos y claves foráneas
  son la garantía real; las comprobaciones de los servicios sólo existen para
  devolver 409/422 legibles en lugar de un error opaco del driver.

## Puesta en marcha

```bash
npm install
cp .env.example .env
npm run migration:run
npm run start:dev
```

- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/api/docs`
- Health: `http://localhost:3000/api/health`

## Endpoints

| Método | Ruta | Auth | Descripción |
| ------ | ---- | ---- | ----------- |
| GET | `/api/health` | — | Estado del servicio |
| POST | `/api/v1/autenticacion/registro` | — | Alta de usuario (devuelve el token) |
| POST | `/api/v1/autenticacion/registro/paciente` | — | Alta de usuario con rol Paciente |
| POST | `/api/v1/autenticacion/acceso` | — | Autenticación (5 intentos/min) |
| POST | `/api/v1/autenticacion/refresco` | — | Renovar el access token (rota el refresh) |
| POST | `/api/v1/autenticacion/cierre-sesion` | — | Revocar el refresh token (204) |
| GET | `/api/v1/autenticacion/yo` | JWT | Perfil del usuario autenticado |
| GET | `/api/v1/usuarios/:id` | JWT | Consulta de usuario por id |
| POST | `/api/v1/roles` | JWT | Crear un rol |
| GET | `/api/v1/roles` | JWT | Listar el catálogo de roles |
| GET | `/api/v1/roles/:id` | JWT | Consultar un rol |
| POST | `/api/v1/perfil-paciente` | JWT | Crear el perfil de un paciente |
| GET | `/api/v1/perfil-paciente` | JWT | Listar perfiles |
| GET | `/api/v1/perfil-paciente/:id` | JWT | Consultar un perfil |
| GET | `/api/v1/perfil-paciente/usuario/:idUsuario` | JWT | Perfil de un usuario |

Roles y perfiles son catálogos de **alta y consulta**: no se expone baja ni
modificación, porque `Usuarios.IdRol` y `PerfilPaciente.IdUsuario` los
referencian y borrarlos rompería registros existentes.

### Registro de pacientes

`/autenticacion/registro` acepta un `idRol` opcional, pensado para roles de
autoservicio. `/autenticacion/registro/paciente` no lo acepta: el rol lo impone
el servidor con `ROL_PACIENTE_ID`, de modo que un endpoint público no pueda
usarse para autoasignarse un rol privilegiado. En cuanto exista un rol con
permisos elevados hay que restringir también qué roles son autoasignables en
`/autenticacion/registro`.

Un perfil de paciente sólo se puede crear sobre un usuario que ya tenga ese rol;
si no lo tiene, la API responde `422`.

## Base de datos

El proyecto mapea tablas existentes: `Usuarios` (`Id`, `UserName`, `Password`,
`CreatedAt`, `IdRol`), `Roles` (`Id`, `Nombre`, `CreatedAt`) y `PerfilPaciente`.
`UserName` guarda el correo electrónico del usuario, normalizado a minúsculas y
sin espacios. `synchronize` está desactivado: el esquema se versiona con
migraciones.

```bash
npm run migration:run
npm run migration:revert
npm run migration:generate -- src/database/migrations/NombreDelCambio
```

Migraciones incluidas:

- `AddUsuariosConstraints`: `UserName` y `Password` a `NOT NULL` e índice único
  `UQ_Usuarios_UserName`.
- `CreateRolesAndUsuarioRol`: tabla `Roles`, índice único `UQ_Roles_Nombre` y
  columna `Usuarios.IdRol` con su FK. Los pasos son idempotentes porque el
  esquema ya se había aplicado a mano en desarrollo.
- `FixPerfilPacienteUsuarioFk`: mueve `FK_PerfilPaciente_Usuario` de
  `PerfilPaciente.Id` a `PerfilPaciente.IdUsuario` (estaba sobre la clave
  primaria, lo que hacía imposible insertar perfiles) y añade el índice único
  `UQ_PerfilPaciente_IdUsuario`.
- `AlterPerfilPacienteDecimales`: `Estatura` y `Peso` de `DECIMAL(10,0)` a
  `DECIMAL(5,2)`, para admitir metros y kilos con decimales.
- `EnsurePerfilPacienteUsuarioFk`: restablece la clave foránea. MySQL descarta
  las FK de una tabla cuando un `ALTER TABLE` se resuelve por copia con las
  comprobaciones de FK desactivadas, que es lo que ocurre al migrar; por eso la
  creación de la FK va después de cualquier cambio de columna.
- `CascadePerfilPacienteUsuario`: `FK_PerfilPaciente_Usuario` pasa a
  `ON DELETE CASCADE`. `Usuarios.IdRol` se queda en `NO ACTION` a propósito:
  borrar un rol no puede arrastrar a los usuarios que lo tienen.
- `CreateRefreshTokens`: tabla `RefreshTokens` (hash del token, caducidad,
  revocación y cadena de rotación) con FK en cascada sobre `Usuarios`.

Dos detalles del mapeo que conviene conocer:

- Las columnas `BIGINT` se exponen como `string` en el JSON para no perder
  precisión en JavaScript.
- Las columnas `DATE` se leen como cadena (`extra: { dateStrings: ['DATE'] }`).
  Sin eso el driver las convierte a `Date` en UTC y, al pasarlas a texto en la
  zona local, una fecha de nacimiento se desplaza un día.

## Variables de entorno

Ver `.env.example`: `DB_*` (conexión MySQL), `JWT_SECRET` (mínimo 32
caracteres), `JWT_EXPIRES_IN`, `BCRYPT_SALT_ROUNDS` (10–15), `ROL_PACIENTE_ID`
(id del rol Paciente en la tabla `Roles`) y `THROTTLE_*` (rate limiting global).

## Scripts

```bash
npm run start:dev
npm run build
npm run lint
npm test
npm run test:e2e
```

## Vaciar las tablas en desarrollo

`TRUNCATE TABLE Usuarios` **falla siempre** con el error 1701: MySQL rechaza
truncar cualquier tabla referenciada por una clave foránea, tenga o no
`ON DELETE CASCADE`. La cascada actúa sobre `DELETE`, no sobre `TRUNCATE`.

```sql
DELETE FROM DailyFood.Usuarios;
```

Ese borrado se lleva por delante los `PerfilPaciente` asociados gracias a la
cascada. Si además quieres reiniciar los autoincrementos:

```sql
DELETE FROM DailyFood.Usuarios;
ALTER TABLE DailyFood.Usuarios AUTO_INCREMENT = 1;
ALTER TABLE DailyFood.PerfilPaciente AUTO_INCREMENT = 1;
```

## Refresh tokens

El acceso devuelve dos tokens: un `accessToken` JWT de vida corta
(`JWT_EXPIRES_IN`, 1 h por defecto) y un `refreshToken` opaco de vida larga
(`JWT_REFRESH_TTL_DAYS`, 7 días).

El refresh token **no es un JWT**: es un valor aleatorio de 384 bits del que la
tabla `RefreshTokens` guarda sólo el hash SHA-256. Así el servidor es la fuente
de verdad y una sesión se puede revocar al instante, cosa imposible con un JWT
de larga vida, que sigue siendo válido hasta que caduca.

```
POST /autenticacion/acceso     -> accessToken + refreshToken (sesión nueva)
POST /autenticacion/refresco   -> accessToken + refreshToken NUEVOS
POST /autenticacion/cierre-sesion -> 204, el refresh token queda revocado
```

**Rotación obligatoria.** Cada refresco invalida el token usado y emite otro,
dejando registrado en `ReplacedById` cuál lo sustituyó.

**Detección de reúso.** Si llega un refresh token que ya estaba revocado, la
única explicación razonable es que alguien copió el token: se revocan *todas*
las sesiones de ese usuario y se registra un warning. El cliente legítimo tendrá
que volver a autenticarse, que es justo lo que se busca ante un robo.

Los mensajes de error son deliberadamente genéricos (`Refresh token inválido.`)
para no distinguir entre token inexistente, revocado y ajeno.

Queda pendiente una tarea programada que borre los tokens ya caducados: hoy la
tabla sólo crece. No afecta a la seguridad —un token caducado se rechaza igual—
pero conviene purgarla.
