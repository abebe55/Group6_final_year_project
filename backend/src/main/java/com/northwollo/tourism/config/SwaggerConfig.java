package com.northwollo.tourism.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("North Wollo Tourism API")
                        .description("Tourism Management System REST API")
                        .version("1.0"));
    }
}
