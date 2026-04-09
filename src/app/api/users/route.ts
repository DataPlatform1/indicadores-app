import { NextRequest, NextResponse } from "next/server";
import { hashPassword, getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageUsers } from "@/lib/roles";

type CreateUserPayload = {
  name?: string;
  email?: string;
  password?: string;
  role?: "ADMIN" | "EDITOR" | "VIEWER";
};

type UpdateUserPayload = {
  id?: string;
  name?: string;
  password?: string;
  role?: "ADMIN" | "EDITOR" | "VIEWER";
  isActive?: boolean;
};

export async function GET() {
  const session = await getCurrentSession();

  if (!session || !canManageUsers(session.role)) {
    return NextResponse.json(
      { message: "No tienes permisos para consultar usuarios." },
      { status: 403 },
    );
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();

  if (!session || !canManageUsers(session.role)) {
    return NextResponse.json(
      { message: "No tienes permisos para crear usuarios." },
      { status: 403 },
    );
  }

  const body = (await request.json()) as CreateUserPayload;
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();
  const role = body.role ?? "EDITOR";

  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "Debes diligenciar nombre, correo y contrasena." },
      { status: 400 },
    );
  }

  if (!["ADMIN", "EDITOR", "VIEWER"].includes(role)) {
    return NextResponse.json(
      { message: "El rol seleccionado no es valido." },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return NextResponse.json(
      { message: "Ya existe un usuario con ese correo." },
      { status: 409 },
    );
  }

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      role,
      isActive: true,
      passwordHash: hashPassword(password),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ user: createdUser }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await getCurrentSession();

  if (!session || !canManageUsers(session.role)) {
    return NextResponse.json(
      { message: "No tienes permisos para actualizar usuarios." },
      { status: 403 },
    );
  }

  const body = (await request.json()) as UpdateUserPayload;
  const id = body.id?.trim();
  const name = body.name?.trim();
  const password = body.password?.trim();
  const role = body.role;
  const isActive = body.isActive;

  if (!id || !name || !role || typeof isActive !== "boolean") {
    return NextResponse.json(
      { message: "Debes enviar id, nombre, rol y estado del usuario." },
      { status: 400 },
    );
  }

  if (!["ADMIN", "EDITOR", "VIEWER"].includes(role)) {
    return NextResponse.json(
      { message: "El rol seleccionado no es valido." },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
      isActive: true,
    },
  });

  if (!existingUser) {
    return NextResponse.json(
      { message: "El usuario que intentas actualizar no existe." },
      { status: 404 },
    );
  }

  if (session.userId === id && !isActive) {
    return NextResponse.json(
      { message: "No puedes desactivar tu propia cuenta." },
      { status: 400 },
    );
  }

  if (session.userId === id && role !== "ADMIN") {
    return NextResponse.json(
      { message: "No puedes quitarte a ti mismo el rol ADMIN." },
      { status: 400 },
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name,
      role,
      isActive,
      ...(password ? { passwordHash: hashPassword(password) } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ user: updatedUser });
}
