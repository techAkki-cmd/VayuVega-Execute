package com.arijit.demoHackathon.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")  // Allow requests from React
public class TestController {

    private final RestTemplate restTemplate;

    @Autowired
    public TestController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping("/message")
    public String getMessage() {
        return "Hello from Spring Boot!";
    }

    @GetMapping("/ai")
    public String getAIResponse() {
        String aiResponse = restTemplate.getForObject("http://127.0.0.1:8000/ai", String.class);
        return "FastAPI Response: " + aiResponse;
    }
}
