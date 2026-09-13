package com.meve.backend.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Override
    protected String getDatabaseName() {
        return "meve+"; 
    }

    @Override
    public MongoClient mongoClient() {
        // Leemos la variable directamente del sistema operativo, esquivando application.properties
        String mongoUri = System.getenv("MONGO_URI");
        
        if (mongoUri == null || mongoUri.isEmpty()) {
            throw new RuntimeException("ERROR CRÍTICO: La variable de entorno MONGO_URI no está definida en tu sistema.");
        }

        ConnectionString connectionString = new ConnectionString(mongoUri);
        
        MongoClientSettings mongoClientSettings = MongoClientSettings.builder()
            .applyConnectionString(connectionString)
            .build();
            
        return MongoClients.create(mongoClientSettings);
    }
}