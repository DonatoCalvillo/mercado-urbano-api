-- create database MercadoUrbano;
use MercadoUrbano;
-- Tablas
CREATE TABLE area (
	id VARCHAR(64) DEFAULT (uuid()),
	nombre VARCHAR(250),

	creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
	modificado_en DATETIME DEFAULT CURRENT_TIMESTAMP,

	PRIMARY KEY (id),
    UNIQUE(nombre)
);

CREATE TABLE rol (
	id VARCHAR(64) NOT NULL DEFAULT (uuid()),
	nombre VARCHAR(250) NOT NULL,
	descripcion VARCHAR(255) NOT NULL,

	creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
	modificado_en DATETIME DEFAULT CURRENT_TIMESTAMP,

	PRIMARY KEY (id),
    UNIQUE(nombre)
);

CREATE TABLE usuario (
	id VARCHAR(64) NOT NULL DEFAULT (uuid()),
	nombre VARCHAR(100) NOT NULL,
	apellido_paterno VARCHAR(100) NOT NULL,
	apellido_materno VARCHAR(100) NOT NULL,
	matricula VARCHAR(50) NOT NULL UNIQUE,
	contrasenia VARCHAR(250) NOT NULL,
	puntos INT NOT NULL DEFAULT 1999,
	correo VARCHAR(150) NULL UNIQUE,
	telefono VARCHAR(10) NULL UNIQUE,
	activo BIT DEFAULT 1,
	fk_area VARCHAR(255) NOT NULL,
	fk_rol VARCHAR(255) NOT NULL,

	creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
	modificado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
	borrado_en DATETIME DEFAULT NULL,

	PRIMARY KEY (id),
    FOREIGN KEY (fK_area) REFERENCES area(id),
    FOREIGN KEY (fk_rol) REFERENCES rol(id)
);

CREATE TABLE plaza (
	id VARCHAR(64) NOT NULL DEFAULT (uuid()),
	nombre VARCHAR(100) NOT NULL,
	direccion VARCHAR(250) NOT NULL,

	creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
	modificado_en DATETIME DEFAULT CURRENT_TIMESTAMP,

	PRIMARY KEY (id)
);

CREATE TABLE zona (
	id VARCHAR(64) NOT NULL DEFAULT (uuid()),
	nombre varchar(1) NOT NULL,

	creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
	modificado_en DATETIME DEFAULT CURRENT_TIMESTAMP,

	PRIMARY KEY (id)
);

CREATE TABLE lugar (
	id VARCHAR(64) NOT NULL DEFAULT (uuid()),
	numero SMALLINT NOT NULL,
    ocupado BIT NOT NULL DEFAULT 0,
    
	fk_area VARCHAR(255) NOT NULL,
    fk_plaza VARCHAR(255) NOT NULL,

	creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,

	PRIMARY KEY (id),
    FOREIGN KEY (fK_area) REFERENCES area(id),
    FOREIGN KEY (fK_plaza) REFERENCES plaza(id)
);

CREATE TABLE evento (
	id VARCHAR(64) NOT NULL DEFAULT (uuid()),
	nombre VARCHAR(100) NOT NULL,
    semana VARCHAR(50) NOT NULL,
	fechaInicio DATE NOT NULL,
    fechaFin DATE NOT NULL,
	activo int NOT NULL DEFAULT 1,
	fk_plaza VARCHAR(255) NOT NULL,

	creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
	modificado_en DATETIME DEFAULT CURRENT_TIMESTAMP,

	PRIMARY KEY (id),
    FOREIGN KEY (fk_plaza) REFERENCES plaza(id)
);

-- INSERT INTO Evento (nombre, semana, fechaInicio, fechaFin, fk_plaza) values ('Corredor Gastronómico', 'Semana 6', '2023-02-10','2023-02-11', 'e7f146b6-a8bb-11ed-96ab-4bda625ca93a');

CREATE TABLE usuario_evento (
	id VARCHAR(64) NOT NULL DEFAULT (uuid()),
	puntos INT NOT NULL DEFAULT 1000,
    dia VARCHAR(50) NOT NULL,
	fechaInscripcion DATETIME NOT NULL,
	fk_usuario VARCHAR(255) NOT NULL,
	fk_evento VARCHAR(255) NOT NULL,
    fk_lugar VARCHAR(255) NOT NULL,


	creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
	modificado_en DATETIME DEFAULT CURRENT_TIMESTAMP,

	PRIMARY KEY (id),
	FOREIGN KEY (fk_usuario) REFERENCES usuario(id),
	FOREIGN KEY (fk_evento) REFERENCES evento(id),
    FOREIGN KEY (fk_lugar) REFERENCES lugar(id)
);

-- INTO usuario_evento VALUES (dia, );

-- Area
INSERT INTO area (nombre) values ('Gastronomia');
INSERT INTO area (nombre) values ('Comercio');
INSERT INTO area (nombre) values ('Administrador');

SELECT * FROM area;

INSERT INTO rol (nombre, descripcion) values ('SuperAdministrador', 'Super administrador del portal');
INSERT INTO rol (nombre, descripcion) values ('Administrador', 'Administrador del portal');
INSERT INTO rol (nombre, descripcion) values ('Usuario', 'Usuario del portal');

SELECT * FROM rol;
SELECT * FROM usuario;

-- Plaza
INSERT INTO plaza (nombre, direccion) VALUES ('Parque Independencia','Pl. Hidalgo, Centro, 86500 Heroica Cárdenas, Tab.');

-- Evento
-- INSERT INTO Evento (nombre, semana, dia, fecha, fk_plaza) values ('Corredor Gastronómico', 'Semana 6', 'Viernes', '2023-02-10', 'e7f146b6-a8bb-11ed-96ab-4bda625ca93a');
-- INSERT INTO Evento (nombre, semana, dia, fecha, fk_plaza) values ('Corredor Gastronómico', 'Semana 6', 'Sabado', '2023-02-11','e7f146b6-a8bb-11ed-96ab-4bda625ca93a');

-- INSERT INTO Evento (nombre, semana, dia, fecha, fk_plaza) values ('Corredor Gastronómico', 'Semana 7', 'Viernes', '2023-02-17', 'e7f146b6-a8bb-11ed-96ab-4bda625ca93a');
-- INSERT INTO Evento (nombre, semana, dia, fecha, fk_plaza) values ('Corredor Gastronómico', 'Semana 7', 'Sabado', '2023-02-18','e7f146b6-a8bb-11ed-96ab-4bda625ca93a');


CREATE USER 'MERURBAPIUSR01'@'localhost' IDENTIFIED BY 'M~bu/UIB!0u*7yN47I=%';
GRANT ALL PRIVILEGES ON * . * TO 'MERURBAPIUSR01'@'localhost';
ALTER USER 'MERURBAPIUSR01'@'localhost' IDENTIFIED WITH mysql_native_password BY 'M~bu/UIB!0u*7yN47I=%';
flush privileges;

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'M~bu/UIB!0u*7yN47I=%';
