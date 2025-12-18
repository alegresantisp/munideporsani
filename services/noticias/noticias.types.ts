export type NoticiaCategoria =
  | "Gobierno"
  | "Obras Públicas"
  | "Cultura"
  | "Deportes"
  | "Salud"
  | "Educación";

export type Noticia = {
  id: string;
  titulo: string;
  slug: string;
  cuerpo: string;
  resumen: string;
  categoria: NoticiaCategoria;
  imagenUrl?: string;
  imagenPublicId?: string;
  fechaPublicacion: string;
  destacado: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NoticiaCreateInput = Omit<
  Noticia,
  "id" | "createdAt" | "updatedAt"
>;

export type NoticiaUpdateInput = Partial<Omit<Noticia, "id" | "createdAt">>;


