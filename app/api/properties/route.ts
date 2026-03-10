import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    const session = await auth();

    // STRENG GEHEIM: Zugriff verweigern, wenn nicht eingeloggt
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as any).organizationId;

    if (!organizationId) {
        return NextResponse.json({ error: "No organization assigned to user" }, { status: 403 });
    }

    // MANDANTENFÄHIGKEIT (Multi-Tenancy): Zeige NUR Immobilien der eigenen organizationId (RLS equivalent im ORM)
    try {
        const properties = await prisma.property.findMany({
            where: {
                organizationId: organizationId,
                deletedAt: null // DSGVO: Keine gelöschten Datensätze
            },
            include: {
                units: true // Lade auch direkt Einheiten mit für das Dashboard
            }
        });

        return NextResponse.json(properties);
    } catch (error) {
        console.error("Failed to fetch properties:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as any).organizationId;
    const userId = session.user.id; // required for audit log

    try {
        const body = await request.json();

        // 1. Transaction für Konsistenz & Audit Logging (ISO 27001)
        const result = await prisma.$transaction(async (tx) => {

            // 1. Immobilie anlegen (gebunden an die OrgID!)
            const newProperty = await tx.property.create({
                data: {
                    organizationId: organizationId,
                    name: body.name,
                    street: body.street,
                    city: body.city,
                    zipCode: body.zipCode,
                    country: body.country || "DE"
                }
            });

            // 2. Audit Log Eintrag schreiben
            await tx.auditLog.create({
                data: {
                    organizationId: organizationId,
                    userId: userId as string,
                    action: "CREATE_PROPERTY",
                    tableName: "properties",
                    recordId: newProperty.id,
                    newData: newProperty as any
                }
            });

            return newProperty;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("Failed to create property:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
