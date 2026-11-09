# ---------- Etapa 1: compilar ----------
# Imagen con el JDK completo y Maven Wrapper para generar el .jar
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Primero solo lo necesario para bajar dependencias: así Docker las guarda en caché
# y no las vuelve a descargar cada vez que cambia el código
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN sh mvnw -B -q dependency:go-offline

# Ahora el código y el empaquetado (sin tests: necesitan la base de datos)
COPY src/ src/
RUN sh mvnw -B -q -DskipTests package

# ---------- Etapa 2: ejecutar ----------
# Imagen liviana solo con el entorno de ejecución de Java (sin compilador ni Maven)
FROM eclipse-temurin:21-jre
WORKDIR /app

# Hora de Argentina: el panel de "pedidos del día" usa la fecha del servidor
ENV TZ=America/Argentina/Buenos_Aires

COPY --from=build /app/target/*.jar app.jar

# Puerto por defecto; en Render/Railway manda la variable PORT
EXPOSE 8080

ENTRYPOINT ["java", "-Duser.timezone=America/Argentina/Buenos_Aires", "-jar", "app.jar"]