# Esquema de la base de datos de MongoDB de MeVe

``` mermaid
erDiagram
    COMERCIO ||--o{ PRODUCTO : "ofrece (Ref)"
    COMERCIO ||--o{ USUARIO : "administrado por (Ref)"
    COMERCIO ||--o{ PEDIDO : "recibe (Ref)"

    COMERCIO {
        ObjectId _id
        String nombre
        String slug
        Point ubicacion "Indice 2dsphere"
        Array franjas_horarias "Embebido: inicio, fin, cupo"
    }
    PRODUCTO {
        ObjectId _id
        ObjectId comercio_id "FK: Ref a COMERCIO"
        String nombre
        Float precio
        Int stock
        Boolean activo "Baja lógica"
    }
    USUARIO {
        ObjectId _id
        ObjectId comercio_id "FK: Ref a COMERCIO"
        String email
        String password_hash
        String rol "Vendedor / SuperAdmin"
    }
    PEDIDO {
        ObjectId _id
        ObjectId comercio_id "FK: Ref a COMERCIO"
        Object comprador "Embebido: nombre, telefono"
        Array items "Embebido: producto_id, cantidad, precio"
        String estado "PENDIENTE_PAGO, CONFIRMADO, EXPIRADO"
        String franja_asignada
    }

```

