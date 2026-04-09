# Guia Del Proyecto De Indicadores

## 1. Que Es Este Proyecto

Este proyecto es una aplicacion web para registrar resultados de indicadores de una organizacion.

La aplicacion permite:

- iniciar sesion con usuario y contrasena
- diligenciar un formulario de indicadores
- guardar los resultados en una base de datos
- consultar historial de registros
- administrar usuarios desde un panel de administracion

La idea general es esta:

1. un usuario entra al sistema
2. el sistema valida si tiene permiso
3. el usuario llena el formulario
4. el sistema guarda la informacion
5. luego esa informacion se puede consultar y administrar

## 2. Explicacion Simple De Cada Herramienta

### Next.js

Es la aplicacion web.

Piensa en `Next.js` como la parte visible del sistema y tambien como la logica que conecta la pantalla con la base de datos.

Con `Next.js` se construyen:

- pantallas
- formularios
- botones
- navegacion
- mensajes
- paneles
- servicios internos de la app

Si quieres cambiar algo visual o de comportamiento de la app, casi siempre vas a `Next.js`.

### PostgreSQL

Es la base de datos.

Piensa en `PostgreSQL` como el lugar donde queda guardada la informacion real:

- usuarios
- procesos
- indicadores
- resultados enviados
- variables del formulario

No se usa para diseñar pantallas. Se usa para guardar y consultar datos.

### Prisma

Es el puente entre la aplicacion y la base de datos.

Piensa en `Prisma` como un traductor:

- entiende la estructura de las tablas
- ayuda a crear tablas
- ayuda a leer y guardar informacion desde el codigo

No es una pantalla ni un panel visual. Sirve para organizar la estructura de los datos.

### Git

Es la herramienta que controla versiones del proyecto.

Sirve para:

- guardar cambios
- volver a versiones anteriores
- comparar cambios
- trabajar con mas seguridad

### GitHub

Es el repositorio remoto del codigo.

Si quieres entenderlo de manera simple:

- `Git` es la herramienta
- `GitHub` es el lugar en internet donde se guarda el proyecto

GitHub sirve como respaldo del codigo y como fuente desde la cual Railway despliega la app.

### Railway

Es donde esta publicada la aplicacion y la base de datos en la nube.

Railway hace dos cosas importantes en este proyecto:

- corre la app para que otras personas entren por un enlace
- aloja el PostgreSQL remoto

## 3. Donde Esta Guardada La Informacion

Hoy los datos del sistema se guardan en el `PostgreSQL` de `Railway`, no en tu computador.

Eso significa:

- si alguien usa la app publicada, la informacion va a la base remota
- no depende de que tu PC este encendido

## 4. Como Caen Los Datos

### 4.1 Datos del formulario

Cuando un usuario envia el formulario, la app guarda informacion en dos tablas principales:

- `IndicatorResult`
- `IndicatorResultVariable`

#### Tabla `IndicatorResult`

Aqui cae la informacion principal del envio:

- numero de radicado
- fecha del reporte
- fecha de inicio
- fecha de fin
- periodo en meses
- resultado del indicador
- porcentaje del indicador
- cumplimiento
- justificacion
- analisis
- observacion
- indicador seleccionado
- usuario que hizo el envio

#### Tabla `IndicatorResultVariable`

Aqui cae el detalle de las variables del indicador.

Por ejemplo:

- variable 1
- variable 2
- variable 3

Cada envio puede tener varias variables asociadas.

### 4.2 Datos maestros

Los datos con los que se alimenta el formulario vienen de estas tablas:

- `Process`
- `Indicator`
- `IndicatorVariable`

Eso significa que el formulario se llena con informacion que ya existe en la base.

### 4.3 Usuarios

Los usuarios del sistema se guardan en:

- `User`

En esa tabla quedan cosas como:

- nombre
- correo
- rol
- estado activo o inactivo

## 5. Mapa Facil: Si Quiero Cambiar Algo, A Donde Voy

### Si quiero cambiar colores, textos, botones o distribucion visual

Debes ir a archivos de `Next.js`.

Archivos mas importantes:

- [login/page.tsx](C:/Users/Usuario/OneDrive/Desktop/UNAD/indicadores-app/src/app/login/page.tsx)
- [formulario/page.tsx](C:/Users/Usuario/OneDrive/Desktop/UNAD/indicadores-app/src/app/formulario/page.tsx)
- [formulario-indicadores.tsx](C:/Users/Usuario/OneDrive/Desktop/UNAD/indicadores-app/src/app/_components/formulario-indicadores.tsx)
- [globals.css](C:/Users/Usuario/OneDrive/Desktop/UNAD/indicadores-app/src/app/globals.css)
- [layout.tsx](C:/Users/Usuario/OneDrive/Desktop/UNAD/indicadores-app/src/app/layout.tsx)
- [branding.ts](C:/Users/Usuario/OneDrive/Desktop/UNAD/indicadores-app/src/lib/branding.ts)

### Si quiero cambiar la identidad visual desde un solo lugar

Debes empezar por:

- [branding.ts](C:/Users/Usuario/OneDrive/Desktop/UNAD/indicadores-app/src/lib/branding.ts)

Ese archivo ahora controla:

- nombre de la organizacion
- nombre corto del sistema
- textos principales del login
- colores base del sistema
- colores de apoyo
- tipografias base
- logo de texto
- futura imagen institucional

Regla practica:

- si quieres cambiar el estilo general, primero cambia `branding.ts`
- si quieres afinar como se ve una pantalla puntual, luego revisa `globals.css`, `login/page.tsx` o `formulario-indicadores.tsx`

### Si quiero cambiar login o acceso

Debes mirar:

- [login/page.tsx](C:/Users/Usuario/OneDrive/Desktop/UNAD/indicadores-app/src/app/login/page.tsx)
- [api/auth/login/route.ts](C:/Users/Usuario/OneDrive/Desktop/UNAD/indicadores-app/src/app/api/auth/login/route.ts)
- [api/auth/session/route.ts](C:/Users/Usuario/OneDrive/Desktop/UNAD/indicadores-app/src/app/api/auth/session/route.ts)
- [auth.ts](C:/Users/Usuario/OneDrive/Desktop/UNAD/indicadores-app/src/lib/auth.ts)

### Si quiero cambiar el formulario

Debes mirar:

- [formulario-indicadores.tsx](C:/Users/Usuario/OneDrive/Desktop/UNAD/indicadores-app/src/app/_components/formulario-indicadores.tsx)
- [api/form-template/route.ts](C:/Users/Usuario/OneDrive/Desktop/UNAD/indicadores-app/src/app/api/form-template/route.ts)
- [api/results/route.ts](C:/Users/Usuario/OneDrive/Desktop/UNAD/indicadores-app/src/app/api/results/route.ts)

### Si quiero cambiar usuarios y roles

Debes mirar:

- [admin/usuarios/page.tsx](C:/Users/Usuario/OneDrive/Desktop/UNAD/indicadores-app/src/app/admin/usuarios/page.tsx)
- [usuarios-admin-client.tsx](C:/Users/Usuario/OneDrive/Desktop/UNAD/indicadores-app/src/app/admin/usuarios/usuarios-admin-client.tsx)
- [api/users/route.ts](C:/Users/Usuario/OneDrive/Desktop/UNAD/indicadores-app/src/app/api/users/route.ts)
- [roles.ts](C:/Users/Usuario/OneDrive/Desktop/UNAD/indicadores-app/src/lib/roles.ts)

### Si quiero cambiar la estructura de la base de datos

Debes mirar:

- [schema.prisma](C:/Users/Usuario/OneDrive/Desktop/UNAD/indicadores-app/prisma/schema.prisma)
- [prisma/migrations](C:/Users/Usuario/OneDrive/Desktop/UNAD/indicadores-app/prisma/migrations)

Ejemplos de cambios de estructura:

- agregar una columna nueva
- crear una tabla nueva
- cambiar el tipo de un campo

### Si quiero cambiar datos iniciales o usuarios sembrados

Debes mirar:

- [seed.js](C:/Users/Usuario/OneDrive/Desktop/UNAD/indicadores-app/scripts/seed.js)

## 6. Estructura Del Proyecto En Lenguaje Simple

### `src/app`

Aqui estan las pantallas y rutas de la app.

Ejemplos:

- `login`
- `formulario`
- `registros`
- `sin-acceso`
- `admin`

### `src/app/api`

Aqui estan los servicios internos de la aplicacion.

Piensalo como la logica que hace cosas por detras, por ejemplo:

- iniciar sesion
- guardar resultados
- consultar usuarios

### `src/lib`

Aqui estan funciones de apoyo.

Por ejemplo:

- autenticacion
- reglas de permisos
- conexion con Prisma

### `prisma`

Aqui esta la estructura de la base y las migraciones.

### `scripts`

Aqui estan scripts auxiliares, por ejemplo el seed inicial.

## 7. Como Revisar La Informacion Guardada

Tienes dos formas principales.

### Opcion 1. Desde la misma app

Puedes revisar:

- historial de registros
- panel de usuarios
- comportamiento del formulario

### Opcion 2. Desde PostgreSQL

Puedes conectarte a la base remota de Railway usando herramientas como `pgAdmin`.

Las tablas que mas te interesan son:

- `User`
- `Process`
- `Indicator`
- `IndicatorVariable`
- `IndicatorResult`
- `IndicatorResultVariable`

## 8. Flujo Real Del Sistema

### Login

1. el usuario escribe correo y contrasena
2. la app valida esas credenciales
3. si son correctas y el usuario esta activo, entra
4. si no tiene permiso, va a pantalla de acceso restringido

### Formulario

1. la app carga procesos e indicadores desde la base
2. el usuario selecciona un indicador
3. la app muestra sus variables y metas
4. el usuario diligencia el resultado
5. la app guarda todo en PostgreSQL

### Administracion de usuarios

1. solo un `ADMIN` puede entrar
2. puede crear usuarios
3. puede editar roles
4. puede activar o inactivar usuarios

## 9. Que Cosas Ya Se Hicieron

Actualmente este proyecto ya tiene:

- app publicada en Railway
- base PostgreSQL remota
- login funcional
- formulario funcional
- guardado de resultados en base de datos
- historial de registros
- panel basico de administracion de usuarios
- roles y permisos

## 10. Mejoras Que Tienen Mas Sentido A Futuro

### Mejorar administracion

- panel de indicadores
- panel de procesos
- reset de contrasena desde admin
- filtros mas avanzados

### Mejorar presentacion

- branding de la organizacion
- dominio propio
- limpieza de textos temporales
- mejora visual del panel admin

### Mejorar trazabilidad

- saber quien creo o modifico usuarios
- saber quien modifico indicadores
- historial de cambios
- bitacora de acciones

## 11. Cosas Importantes Antes De Cambiar Algo

### No cambiar cosas al azar en `schema.prisma`

Si cambias la estructura de la base sin control, puedes romper el sistema.

### No cambiar varias cosas a la vez en produccion

Lo mejor es cambiar una cosa, probarla y luego seguir.

### Siempre verificar si el cambio es visual o de datos

Regla simple:

- si cambia lo que se ve en pantalla, normalmente vas a `src/app`
- si cambia lo que se guarda, normalmente vas a `prisma`, `api` o `PostgreSQL`

### GitHub no ejecuta la app

GitHub solo guarda el codigo.

La app real corre en Railway.

## 12. Costos En Lenguaje Simple

### Herramientas que no cobran por si mismas

- `Next.js`
- `Prisma`
- `Git`
- `PostgreSQL`

Estas no cobran licencia por usarlas.

### Donde si puede haber costo

- `GitHub` si subes de plan o tienes mas necesidades de equipo
- `Railway` porque ahi corre la app y la base de datos
- dominio propio si compras uno

En este proyecto el costo importante hoy esta en `Railway`, no en Next.js ni Prisma.

## 13. Recomendacion Practica Para Ti

Si en el futuro quieres pedir cambios, puedes pensar asi:

### Si quieres cambiar algo visual

Di:

`quiero cambiar el diseño del login`

o

`quiero mover los botones del formulario`

### Si quieres cambiar algo de negocio

Di:

`quiero que el formulario guarde un campo nuevo`

o

`quiero que solo ciertos roles vean esta opcion`

### Si quieres cambiar la base

Di:

`quiero agregar una columna nueva para...`

## 14. Resumen Final

Este proyecto ya no es solo una idea. Ya es una aplicacion real con:

- interfaz web
- base de datos en la nube
- usuarios
- formulario
- administracion

La forma mas simple de entenderlo es:

- `Next.js` muestra y mueve la app
- `PostgreSQL` guarda la informacion
- `Prisma` conecta la app con la base
- `GitHub` guarda el codigo
- `Railway` publica la app

Si quieres seguir creciendo el sistema, las siguientes capas naturales son:

- administracion de indicadores
- presentacion final institucional
- trazabilidad y auditoria
