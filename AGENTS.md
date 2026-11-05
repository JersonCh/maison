# maison-des-parfums

Proyecto de comercio electrónico de alta perfumería desarrollado con Astro 5, React 19, Tailwind CSS v4 y Cloudflare (D1 y R2).

## Servidor de Desarrollo

El servidor de desarrollo corre en el puerto 8443 (`http://localhost:8443`).

- Preview URL: Acceso local en `http://localhost:8443`
- Hot reload: Los cambios en el código fuente se reflejan inmediatamente

## Estructura del Proyecto

- `src/pages/` - Rutas y páginas de la tienda (Astro SSR / Cloudflare adapter)
  - `src/pages/index.astro` - Portada de lujo
  - `src/pages/perfumes/` - Catálogo y fichas técnicas de fragancias
  - `src/pages/nosotros.astro` - Historia y fundadora
  - `src/pages/contacto.astro` - Sede física en Tacna
  - `src/pages/envios.astro` - Políticas de envío (Shalom / Olva) y pagos
  - `src/pages/admin.astro` - Panel gestor administrativo
- `src/features/` - Islas interactivas en React (Catálogo, Carrito, Búsqueda, Admin, Envíos)
- `src/lib/db.ts` - Conexión y consultas a Cloudflare D1
- `src/styles/` - Hojas de estilo y diseño editorial
- `migrations/` - Esquema inicial y datos semilla SQL para Cloudflare D1
- `astro.config.mjs` - Configuración de Astro con Cloudflare Pages adapter

## Dependencias

- Framework: Astro 5
- Runtime de islas: React 19 y React DOM 19
- Estilos: Tailwind CSS v4 con `@tailwindcss/vite`
- Base de datos y almacenamiento: Cloudflare D1 y Cloudflare R2
- Herramienta de compilación: Vite 8, TypeScript 5.7

## Estilo y Calidad de Código

- Utiliza comillas dobles para cadenas con apóstrofes o caracteres especiales.
- Exporta componentes interactivos como export default.
- Reglas de redacción de la marca:
  - Para referirse al local, usar siempre: *tienda física*, *sede oficial* o *nuestro espacio*.
  - Para referirse a los productos, usar siempre: *selección*, *colección* o *catálogo*.
