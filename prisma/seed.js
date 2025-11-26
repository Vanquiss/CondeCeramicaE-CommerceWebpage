const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando sembrado de datos (Seeding)...');

  // 1. Crear Categorías Iniciales (Necesarias para crear productos)
  // Usamos 'upsert' para que si ya existen, no intente crearlas de nuevo y falle
  const ceramica = await prisma.category.upsert({
    where: { id: 1 }, // Asumimos que será el ID 1
    update: {},
    create: {
      name: 'Cerámica',
    },
  });

  const banio = await prisma.category.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Baño y Grifería',
    },
  });

  console.log('✅ Categorías creadas:', ceramica.name, banio.name);

  // 2. Crear Usuario Administrador
  const passwordHash = await bcrypt.hash('admin123', 10); // Contraseña: admin123

  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@tienda.com' },
    update: {}, // Si existe, no hace nada
    create: {
      email: 'admin@tienda.com',
      name: 'Super Admin',
      password: passwordHash,
    },
  });

  console.log(`✅ Usuario Admin creado: ${admin.email} (Password: admin123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
