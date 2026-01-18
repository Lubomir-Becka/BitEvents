
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml ./
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn package -DskipTests

# Rename the jar to a predictable name (Spring Boot generates artifactId-version.jar)
RUN mv target/*.jar target/app.jar


FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Install netcat for database connection check
RUN apk add --no-cache netcat-openbsd

# Expose the application's port
EXPOSE 8080

# Allow passing JVM options via environment
ENV JAVA_OPTS="-Xms128m -Xmx512m"

COPY --from=build /app/target/app.jar ./app.jar

# Create startup script that waits for database
RUN echo '#!/bin/sh' > /app/wait-for-db.sh && \
    echo 'echo "Waiting for database..."' >> /app/wait-for-db.sh && \
    echo 'until nc -z db 5432; do' >> /app/wait-for-db.sh && \
    echo '  echo "Database is unavailable - sleeping"' >> /app/wait-for-db.sh && \
    echo '  sleep 2' >> /app/wait-for-db.sh && \
    echo 'done' >> /app/wait-for-db.sh && \
    echo 'echo "Database is up - starting application"' >> /app/wait-for-db.sh && \
    echo 'exec java $JAVA_OPTS -jar /app/app.jar' >> /app/wait-for-db.sh && \
    chmod +x /app/wait-for-db.sh

ENTRYPOINT ["/app/wait-for-db.sh"]
