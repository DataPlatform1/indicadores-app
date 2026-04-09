import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  sessionCookieName,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!body.email || !body.password) {
    return NextResponse.json(
      { message: "Debes ingresar correo y contraseña." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase().trim() },
  });

  if (!user || !verifyPassword(body.password, user.passwordHash)) {
    return NextResponse.json(
      { message: "Las credenciales no son válidas." },
      { status: 401 },
    );
  }

  if (!user.isActive) {
    return NextResponse.json(
      { message: "Tu usuario se encuentra inactivo. Contacta al administrador." },
      { status: 403 },
    );
  }

  const response = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

  response.cookies.set(sessionCookieName(), createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}


  return response;
}
