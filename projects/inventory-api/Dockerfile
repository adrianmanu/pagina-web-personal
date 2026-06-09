# Etapa 1: compilar con Maven
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: ejecutar con JRE ligero
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/inventory-api-2.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
