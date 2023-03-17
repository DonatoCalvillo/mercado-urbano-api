<p align="center">
  <a href="https://cardenas.gob.mx/" target="blank"><img src="https://cardenas.gob.mx/SARE/assets/images/LOGOAYUNTA.png" width="200" alt="Cárdenas, Tabasco" /></a>
</p>

## Descripción

Esta es el API REST hecha en NEST JS para la aplicación del mercado urbano, proyecto gubernamental que consiste en un reservador de espacios para los eventos semanales en Cárdenas, Tabasco.

## Instalacion

1. Clonamos el repositorio en la máquina
```bash
$ git clone -b main git@github.com:DonatoCalvillo/mercado-urbano-api.git
```
2. Instalar todos los paquetes necesarios para el API
```bash
$ yarn
```
3. Correr scripts de la base de datos
```bash
#Ruta de los scripts
./scripts/CreacionDeDB-MYSQL.sql

#Crear base de datos

#Insertar datos necesarios:
# * Agregar Areas
# * Agregar Roles
# * Agregar Plazas

#Crear usuario para base de datos especial o usar user Root
```
4. Agregar valores al .ENV

## PM2
1. Instalamos PM2
```bash
$ npm install pm2 -g
```
2. Instalamos Log Rotate
```bash
$ pm2 install pm2-logrotate
```
3. Configuramos el PM2 Log Rotate
```bash
$ pm2 set pm2-logrotate:max_size 10M
```
## Corriendo la apliacion

```bash
# desarrollo
$ yarn start:dev

# producción
## construimos la aplicación
$ yarn build
## montamos la api en pm2
$ pm2 start dist/main.js --name MercadoUrbanoAPI --time
```

## Creación de Super Administrador

1. Modificar endpoint
```bash
auth/register
```
2. Modificar el rol que con el que se va a crear el usuario
```bash
const rol = await this.rolRepository.findOne({where: {nombre: 'SuperUsuario'}})
```
3. Ejecutamos el endpoint y regresamos a su configuración

## Creación de lugares
1. Identificamos el endpoint
```bash
event/generarLugares
```
2. Cambiamos los uuid de plaza y área, corremos el endpoint y cambiamos a la área faltante, volvemos a correr el endpoint

## Creado por
* Edgar Donato Calvillo Lumbreras
