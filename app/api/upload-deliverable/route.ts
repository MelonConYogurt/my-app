import { NextRequest, NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const deliverableId = formData.get("deliverableId") as string;

    if (!file || !deliverableId) {
      return NextResponse.json(
        { message: "Archivo o ID de entregable no proporcionado" },
        { status: 400 },
      );
    }

    // Validar tamaño
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { message: "El archivo no puede superar 10MB" },
        { status: 400 },
      );
    }

    // Convertir el archivo a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crear FormData para enviar al backend
    const backendFormData = new FormData();
    backendFormData.append(
      "file",
      new Blob([buffer], { type: file.type }),
      file.name,
    );
    backendFormData.append("deliverableId", deliverableId);

    // Enviar al backend
    const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
    const backendResponse = await fetch(
      `${NEXT_PUBLIC_API_URL}/deliverables/upload`,
      {
        method: "POST",
        body: backendFormData,
      },
    );

    if (!backendResponse.ok) {
      const error = await backendResponse.json();
      return NextResponse.json(
        { message: error.message || "Error al procesar el archivo" },
        { status: backendResponse.status },
      );
    }

    const result = await backendResponse.json();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { message: "Error al subir el archivo" },
      { status: 500 },
    );
  }
}
