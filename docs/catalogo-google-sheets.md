# Catalogo Gratis Con Google Sheets

Esta tienda puede usar Google Sheets como catalogo editable sin backend y sin costo extra.

## Columnas

Crea una hoja con estas columnas, o importa `public/catalog-template.csv`:

```csv
id,groupId,variantId,name,brand,category,description,tags,size,flavor,price,compareAt,inStock,image1,image2,image3,image4
```

- `id`: identificador unico de la fila/producto.
- `groupId`: mismo valor para variantes del mismo producto.
- `variantId`: identificador unico de la variante.
- `category`: una de `Proteína`, `Creatina`, `Pre-entreno`, `Aminoácidos`, `Ganador`, `Accesorios`, `Vitaminas`, `Minerales`, `Extras`, `Hybrid Club`.
- `tags`: separados por coma.
- `price` y `compareAt`: numeros en MXN.
- `inStock`: usa `si` o `no`.
- `image1` a `image4`: URL publica de imagen.
- Las imagenes de estas columnas solo se muestran en productos, carrito, busqueda y checkout.

## Productos Y Variantes

Cada fila del Sheet representa una variante vendible. Por ejemplo, si una creatina tiene
250 g, 500 g y 1 kg, deben existir 3 filas.

Para que la tienda las muestre como variantes del mismo producto:

- Usa el mismo `groupId` en todas esas filas.
- Usa el mismo `name`, `brand`, `category`, `description` y `tags`.
- Cambia `id` y `variantId` en cada fila para que sean unicos.
- Cambia `size`, `flavor`, `price`, `compareAt` e `inStock` segun la variante.

Ejemplo:

```csv
p-crea-250,p-crea-01,v-crea-250,Creatina Monohidratada Micronizada,MUÑEK LABS,Creatina,"Pura, sin rellenos.","monohidratada, fuerza",250 g,Sin sabor,349,399,si,,,,
p-crea-500,p-crea-01,v-crea-500,Creatina Monohidratada Micronizada,MUÑEK LABS,Creatina,"Pura, sin rellenos.","monohidratada, fuerza",500 g,Sin sabor,549,649,si,,,,
```

Si quieres agregar otro sabor o tamaño, duplica una fila del mismo producto, cambia `id`,
`variantId`, `size`, `flavor`, precio y stock.

## Imagenes Sin Costo

1. Sube las fotos a Google Drive.
2. En cada imagen usa `Compartir`.
3. Cambia acceso a `Cualquier persona con el enlace`.
4. Copia el enlace y pegalo en `image1`, `image2`, etc.

La app convierte enlaces de Drive al formato de miniatura publica automaticamente.

## Publicar La Hoja

1. En Google Sheets ve a `Archivo > Compartir > Publicar en la web`.
2. Elige la pestaña del catalogo.
3. Selecciona formato `CSV`.
4. Copia la URL publicada.
5. Esta tienda ya trae configurada como fuente predeterminada esta hoja:

```text
https://docs.google.com/spreadsheets/d/e/2PACX-1vTrZC0GrVa5KyWEvBVDjatUKHTQVKW3px_-B3ic9KHKUIgQshtL1HDx7vA-T8q0W4EtiqU2DFqNiF-1/pub?gid=0&single=true&output=csv
```

Si necesitas cambiarla por otra hoja en el futuro, en Vercel agrega o reemplaza la variable:

```env
VITE_CATALOG_CSV_URL=https://docs.google.com/spreadsheets/d/e/.../pub?gid=0&single=true&output=csv
```

Despues de configurarlo una vez, el cliente solo edita la hoja. Los cambios se reflejan al recargar la tienda; Google puede tardar unos minutos en actualizar el CSV publicado.
