# CondeCeramicaE-CommerceWebpage
E commerce Webpage application


(Linux) 
docker-compose up -d
npx prisma migrate dev --name init_repo #
npx prisma studio #visualiza base de datos


(WINDOWS)
Instalar: Node.js (LTS) y Docker Desktop.

Clonar: Bajar el repo con Git.

Terminal: Abrir PowerShell en la carpeta del proyecto clonado (donde este el archivo docker-compose.yml)

Dependencias: npm install

Variables: Copiar .env.example a .env. (si no se compartio el .env, si ya esta no hace nada)

Docker: Ejecutar: docker compose up -d 

Base de Datos: Ejecutar: npx prisma migrate dev. (lee los archivos prisma, se conecta y carga la base de datos en docker->postgre)
