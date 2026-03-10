import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // 1. Create an Organization
    const org = await prisma.organization.create({
        data: {
            name: 'ImmoMaster GmbH',
        },
    })

    // 2. Create an Admin User
    const user = await prisma.user.create({
        data: {
            email: 'admin@immomaster.de',
            name: 'System Admin',
            organizationId: org.id,
            role: 'ADMIN',
        },
    })

    // 3. Create a Demo Property
    const property = await prisma.property.create({
        data: {
            organizationId: org.id,
            name: 'Münster Arkaden',
            street: 'Ludgeristraße 100',
            city: 'Münster',
            zipCode: '48143',
            country: 'DE',
        },
    })

    // 4. Create a Demo Unit
    await prisma.unit.create({
        data: {
            organizationId: org.id,
            propertyId: property.id,
            name: 'Erdgeschoss Ladenlokal',
            type: 'COMMERCIAL',
            sizeSqm: 120.5,
        },
    })

    // 5. Create a Demo Tenant
    const tenant = await prisma.tenant.create({
        data: {
            organizationId: org.id,
            firstName: 'Max',
            lastName: 'Mustermann',
            email: 'max@example.com',
        }
    })

    // 6. Create a Demo Lease
    const demoUnit = await prisma.unit.findFirst({ where: { organizationId: org.id } });

    if (demoUnit) {
        const lease = await prisma.lease.create({
            data: {
                organizationId: org.id,
                unitId: demoUnit.id,
                tenantId: tenant.id,
                startDate: new Date('2025-01-01'),
                depositAmount: 1500.00
            }
        })
    }

    console.log(`Database seeded successfully!`)
    console.log(`Test Login: admin@immomaster.de`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
