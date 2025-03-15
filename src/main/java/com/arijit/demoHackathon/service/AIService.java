package com.arijit.demoHackathon.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AIService {

    private final String AI_API_URL = "http://127.0.0.1:8000/predict";  // FastAPI endpoint

    public String getAIResponse(String text) {
        RestTemplate restTemplate = new RestTemplate();
        return restTemplate.postForObject(AI_API_URL, text, String.class);
    }
}
