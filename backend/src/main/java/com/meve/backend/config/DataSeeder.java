package com.meve.backend.config;

import com.meve.backend.models.*;
import com.meve.backend.repositories.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private CategoriaRepository categoriaRepository;
    @Autowired private ComercioRepository comercioRepository;
    @Autowired private ProductoRepository productoRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private PedidoRepository pedidoRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Value("${meve.seed.password:}")
    private String passwordDePrueba;

    @Override
    public void run(String... args) {
        seedCategorias();

        if (passwordDePrueba.isBlank()) {
            log.info("MEVE_SEED_PASSWORD no definida: solo se verificaron categorías.");
            return;
        }

        crearUsuarioSiNoExiste("admin@meve.test", "Admin MeVe", Rol.SUPERADMIN, null);

        if (comercioRepository.count() > 0) {
            log.info("Ya existen comercios en la base: se omite el seed de datos de prueba.");
            return;
        }

        seedComerciosProductosYPedidos();
    }

    private void seedCategorias() {
        if (categoriaRepository.count() > 0) return;

        List<String[]> rubros = List.of(
                new String[]{"Comidas", "comidas"},
                new String[]{"Panadería", "panaderia"},
                new String[]{"Pastelería", "pasteleria"},
                new String[]{"Bebidas", "bebidas"},
                new String[]{"Verdulería", "verduleria"},
                new String[]{"Almacén", "almacen"},
                new String[]{"Carnicería", "carniceria"},
                new String[]{"Fiambrería", "fiambreria"},
                new String[]{"Dietética", "dietetica"},
                new String[]{"Artesanías", "artesanias"},
                new String[]{"Indumentaria", "indumentaria"},
                new String[]{"Limpieza", "limpieza"}
        );

        List<Categoria> categorias = rubros.stream().map(r -> {
            Categoria c = new Categoria();
            c.setNombre(r[0]);
            c.setSlug(r[1]);
            c.setActiva(true);
            return c;
        }).toList();

        categoriaRepository.saveAll(categorias);
        log.info("DataSeeder: {} categorías creadas.", categorias.size());
    }

    private void seedComerciosProductosYPedidos() {
        Comercio c1 = comercioRepository.save(crearComercio(
                "Panadería La Espiga", "panaderia-la-espiga",
                "Facturas, pan casero y masas frescas horneadas cada mañana.",
                "5493884111111", "Lun a Sáb 08:00 - 20:00",
                "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
                -65.2115, -24.2565, true, EstadoComercio.ACTIVO
        ));
        Comercio c2 = comercioRepository.save(crearComercio(
                "Rotisería Don Pepe", "rotiseria-don-pepe",
                "Empanadas jujeñas, milanesas y viandas caseras del día.",
                "5493884222222", "Mar a Dom 11:00 - 22:00",
                "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
                -65.2150, -24.2590, true, EstadoComercio.ACTIVO
        ));
        Comercio c3 = comercioRepository.save(crearComercio(
                "Verdulería El Sol", "verduleria-el-sol",
                "Frutas y verduras de estación directo de productores locales.",
                "5493884333333", "Lun a Sáb 08:30 - 21:00",
                "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
                -65.2080, -24.2530, true, EstadoComercio.ACTIVO
        ));
        Comercio c4 = comercioRepository.save(crearComercio(
                "Dulces del Norte", "dulces-del-norte",
                "Tortas artesanales, alfajores de maicena y budines.",
                "5493884444444", "Mié a Dom 10:00 - 19:30",
                "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
                -65.2210, -24.2620, true, EstadoComercio.ACTIVO
        ));
        Comercio c5 = comercioRepository.save(crearComercio(
                "Artesanías Quebrada", "artesanias-quebrada",
                "Tejidos y cerámica artesanal hechos a mano (pendiente de aprobación).",
                "5493884555555", "Lun a Vie 10:00 - 18:00",
                "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80",
                -65.2050, -24.2500, false, EstadoComercio.PENDIENTE
        ));

        // Vendedores vinculados a su comercioId real
        crearUsuarioSiNoExiste("espiga@meve.test", "Vendedor La Espiga", Rol.VENDEDOR, c1.getId());
        crearUsuarioSiNoExiste("donpepe@meve.test", "Vendedor Don Pepe", Rol.VENDEDOR, c2.getId());
        crearUsuarioSiNoExiste("elsol@meve.test", "Vendedor El Sol", Rol.VENDEDOR, c3.getId());
        crearUsuarioSiNoExiste("dulces@meve.test", "Vendedor Dulces del Norte", Rol.VENDEDOR, c4.getId());
        crearUsuarioSiNoExiste("quebrada@meve.test", "Vendedor Quebrada", Rol.VENDEDOR, c5.getId());

        // Productos (16 productos, incluye stock 0 y 1 pausado)
        Producto p1 = productoRepository.save(crearProducto(c1.getId(), "Panadería", "Docena de Facturas Surtidas", "Medialunas de manteca, vigilantes y bolas de fraile recién horneadas.", 4500.0, 12, true, "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80"));
        Producto p2 = productoRepository.save(crearProducto(c2.getId(), "Comidas", "Docena de Empanadas Jujeñas", "Carne cortada a cuchillo con papa, huevo y cebolla de verdeo.", 9500.0, 15, true, "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80"));
        Producto p3 = productoRepository.save(crearProducto(c3.getId(), "Verdulería", "Bolsón de Verduras de Estación (5kg)", "Papa, cebolla, zanahoria, zapallo y acelga fresca de quinta.", 7500.0, 9, true, "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80"));

        productoRepository.saveAll(List.of(
                crearProducto(c1.getId(), "Panadería", "Pan Casero con Chicharrón", "Bolillo tibio de campo hecho en horno de barro.", 1800.0, 20, true, "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&q=80"),
                crearProducto(c1.getId(), "Panadería", "Bizcochos de Grasa (500g)", "Crocantes, ideales para acompañar el mate de la tarde.", 2200.0, 0, true, "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80"),
                crearProducto(c1.getId(), "Dietética", "Pan Lactal Integral con Semillas", "Molde familiar con harina integral, chía y lino.", 3100.0, 5, false, "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80"),
                crearProducto(c2.getId(), "Comidas", "Sándwich de Milanesa Completo", "Pan sanguchero, lechuga, tomate, jamón, queso y huevo.", 6200.0, 10, true, "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80"),
                crearProducto(c2.getId(), "Comidas", "Tarta Individual de Jamón y Queso", "Masa casera crocante lista para calentar en 5 minutos.", 3800.0, 8, true, "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80"),
                crearProducto(c2.getId(), "Bebidas", "Gaseosa 1.5L", "Línea Coca-Cola bien fría lista para llevar.", 2900.0, 25, true, "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80"),
                crearProducto(c3.getId(), "Almacén", "Maple de Huevos Caseros (30 u.)", "Huevos frescos de granja tamaño grande.", 5400.0, 14, true, "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&q=80"),
                crearProducto(c3.getId(), "Verdulería", "Tomate Perita (1kg)", "Seleccionado en punto justo para salsa o ensalada.", 1900.0, 18, true, "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80"),
                crearProducto(c3.getId(), "Verdulería", "Palta Hass (500g)", "Cremosa, lista para consumir hoy mismo.", 3600.0, 0, true, "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&q=80"),
                crearProducto(c4.getId(), "Pastelería", "Caja de Alfajores de Maicena (x6)", "Rellenos con abundante dulce de leche repostero y coco rallado.", 4200.0, 11, true, "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80"),
                crearProducto(c4.getId(), "Pastelería", "Budín de Limón y Amapolas", "Glaseado artesanal, rinde 8 porciones generosas.", 4800.0, 6, true, "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80"),
                crearProducto(c4.getId(), "Pastelería", "Torta Rogel Chica", "Capas crocantes, dulce de leche y merengue italiano.", 11500.0, 3, true, "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80"),
                crearProducto(c4.getId(), "Pastelería", "Pastafrola de Membrillo", "Receta clásica casera de 24cm con masa quebrada.", 5900.0, 4, true, "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=600&q=80")
        ));

        // Pedidos en los 5 estados con trazabilidad temporal (RNF-11)
        Instant ahora = Instant.now();
        pedidoRepository.saveAll(List.of(
                crearPedido("MEVE-DEM001", c1, p1, 1, "Lucía Fernández", "3884900001", "11:00 - 12:00", EstadoPedido.PENDIENTE_PAGO, null, null, null, null, null),
                crearPedido("MEVE-DEM002", c2, p2, 2, "Martín Gómez", "3884900002", "11:00 - 12:00", EstadoPedido.PAGADO_CONFIRMADO, "MP-SANDBOX-002", ahora.minus(10, ChronoUnit.MINUTES), null, null, null),
                crearPedido("MEVE-DEM003", c3, p3, 1, "Sofía Morales", "3884900003", "10:00 - 11:00", EstadoPedido.RETIRADO, "MP-SANDBOX-003", ahora.minus(30, ChronoUnit.MINUTES), ahora.minus(10, ChronoUnit.MINUTES), null, null),
                crearPedido("MEVE-DEM004", c1, p1, 1, "Carlos Ruiz", "3884900004", "17:00 - 18:00", EstadoPedido.EXPIRADO, null, null, null, ahora.minus(25, ChronoUnit.MINUTES), null),
                crearPedido("MEVE-DEM005", c2, p2, 1, "Ana Torres", "3884900005", "17:00 - 18:00", EstadoPedido.CANCELADO, null, null, null, null, ahora.minus(15, ChronoUnit.MINUTES))
        ));

        log.info("DataSeeder: 5 comercios, 5 vendedores, 16 productos y 5 pedidos creados.");
    }

    private void crearUsuarioSiNoExiste(String email, String nombre, Rol rol, String comercioId) {
        if (usuarioRepository.findByEmail(email).isPresent()) return;
        Usuario usuario = new Usuario();
        usuario.setEmail(email);
        usuario.setNombre(nombre);
        usuario.setRol(rol);
        usuario.setComercioId(comercioId);
        usuario.setPassword(passwordEncoder.encode(passwordDePrueba));
        usuarioRepository.save(usuario);
    }

    private Comercio crearComercio(String nombre, String slug, String descripcion, String whatsapp,
                                   String horarios, String imagenUrl, double lng, double lat,
                                   boolean activo, EstadoComercio estado) {
        Comercio c = new Comercio();
        c.setNombre(nombre);
        c.setSlug(slug);
        c.setDescripcion(descripcion);
        c.setWhatsapp(whatsapp);
        c.setHorarios(horarios);
        c.setImagenUrl(imagenUrl);
        c.setUbicacion(new GeoJsonPoint(lng, lat));
        c.setFranjas(new ArrayList<>(List.of(
                new FranjaHoraria("10:00 - 11:00", 3, 3),
                new FranjaHoraria("11:00 - 12:00", 3, 2),
                new FranjaHoraria("17:00 - 18:00", 3, 3),
                new FranjaHoraria("18:00 - 19:00", 3, 0)
        )));
        c.setActivo(activo);
        c.setEstado(estado);
        return c;
    }

    private Producto crearProducto(String comercioId, String categoria, String nombre, String descripcion,
                                   Double precio, Integer stock, Boolean activo, String imagenUrl) {
        Producto p = new Producto();
        p.setComercioId(comercioId);
        p.setCategoria(categoria);
        p.setNombre(nombre);
        p.setDescripcion(descripcion);
        p.setPrecio(precio);
        p.setStock(stock);
        p.setActivo(activo);
        p.setEliminado(false);
        p.setImagenUrl(imagenUrl);
        return p;
    }

    private Pedido crearPedido(String ticket, Comercio comercio, Producto producto, int cantidad,
                               String comprador, String telefono, String franja, EstadoPedido estado,
                               String paymentId, Instant pagadoEn, Instant retiradoEn,
                               Instant expiradoEn, Instant canceladoEn) {
        double subtotal = producto.getPrecio() * cantidad;
        Pedido p = new Pedido();
        p.setCodigoTicket(ticket);
        p.setComercioId(comercio.getId());
        p.setComercioNombre(comercio.getNombre());
        p.setCompradorNombre(comprador);
        p.setCompradorTelefono(telefono);
        p.setFranjaHoraria(franja);
        p.setItems(List.of(new ItemPedido(producto.getId(), producto.getNombre(), producto.getPrecio(), cantidad, subtotal)));
        p.setTotal(subtotal);
        p.setEstado(estado);
        p.setPaymentId(paymentId);
        p.setCreatedAt(LocalDateTime.now().minusMinutes(30));
        p.setUpdatedAt(LocalDateTime.now());
        p.setPagadoEn(pagadoEn);
        p.setRetiradoEn(retiradoEn);
        p.setExpiradoEn(expiradoEn);
        p.setCanceladoEn(canceladoEn);
        return p;
    }
}