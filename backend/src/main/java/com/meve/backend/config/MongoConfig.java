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
        return "meve"; // Forzamos el nombre de tu base de datos
    }

    @Override
    public MongoClient mongoClient() {
        // Forzamos la URI directamente en el driver de MongoDB
        ConnectionString connectionString = new ConnectionString(
            "mongodb+srv://lautarocejas_db_user:VsTF9MODSgTODjdP@cluster0.opjgl8i.mongodb.net/meve?retryWrites=true&w=majority"
        );
        
        MongoClientSettings mongoClientSettings = MongoClientSettings.builder()
            .applyConnectionString(connectionString)
            .build();
            
        return MongoClients.create(mongoClientSettings);
    }
}