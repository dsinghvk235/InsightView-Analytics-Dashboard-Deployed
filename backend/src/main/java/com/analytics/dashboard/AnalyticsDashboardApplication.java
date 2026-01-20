package com.analytics.dashboard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;


@SpringBootApplication
@EnableJpaAuditing
public class AnalyticsDashboardApplication {

    public static void main(String[] args) {
        SpringApplication.run(AnalyticsDashboardApplication.class, args);
    }
}
 
