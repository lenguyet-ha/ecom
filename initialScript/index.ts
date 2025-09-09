import { env } from 'process';
import { HashingService } from 'src/shared/services/hashing.service';
import { PrismaService } from 'src/shared/services/prisma.service';

const prisma = new PrismaService();
const hashingService = new HashingService();

const main = async () => {
    const roleCount = await prisma.role.count();
    if (roleCount > 0) {
        throw new Error('Roles already exist. Aborting seeding process.');
    }
    const roles = await prisma.role.createMany({
        data: [
            { name: 'ADMIN', description: 'Administrator with full access' },
            { name: 'CLIENT', description: 'Client user with limited access' },
            { name: 'SELLER', description: 'Seller user with permissions to manage products and orders' },
        ],
    });
    const adminRole = await prisma.role.findFirstOrThrow({ where: { name: 'ADMIN' } });
    const hashedPassword = await hashingService.hash(env.ADMIN_PASSWORD as string);
    const adminUser = await prisma.user.create({
        data: {
            name: env.ADMIN_NAME as string,
            email: env.ADMIN_EMAIL as string,
            password: hashedPassword,
            phoneNumber: env.ADMIN_PHONE_NUMBER as string,
            roleId: adminRole.id,
        },
    });
    return {
        adminUser,
        createdRoleCount: roles.count,
    };
};

main()
    .then(({ adminUser, createdRoleCount }) => {
        console.log('Seeding completed successfully.');
    })
    .catch(console.error);
