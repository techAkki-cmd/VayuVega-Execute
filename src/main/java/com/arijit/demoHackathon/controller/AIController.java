package com.arijit.demoHackathon.controller;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@RestController
@RequestMapping("/ai")
public class AIController {
    private final RestTemplate restTemplate = new RestTemplate();
    private final String AI_BASE_URL = "https://d92d-34-16-138-253.ngrok-free.app";


    @PostMapping("/analyze-feedback")
    public ResponseEntity<Map> analyzeFeedback(@RequestBody Map<String, Object> inputData) {
        String aiUrl = AI_BASE_URL + "/analyze-feedback";
        return forwardPostRequest(aiUrl, inputData);
    }

    
    @GetMapping("/all-product-sentiments")
    public ResponseEntity<Map> getAllProductSentiments() {
        String aiUrl = AI_BASE_URL + "/all-product-sentiments";
        return forwardGetRequest(aiUrl);
    }


    @GetMapping("/product-sentiment/{productId}")
    public ResponseEntity<Map> getProductSentiment(@PathVariable String productId) {
        String aiUrl = AI_BASE_URL + "/product-sentiment/" + productId;
        return forwardGetRequest(aiUrl);
    }


    @PostMapping("/add-product")
    public ResponseEntity<Map> addProduct(@RequestBody Map<String, Object> productData) {
        String aiUrl = AI_BASE_URL + "/add-product";
        return forwardPostRequest(aiUrl, productData);
    }


    private ResponseEntity<Map> forwardPostRequest(String url, Map<String, Object> requestBody) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
        return restTemplate.postForEntity(url, requestEntity, Map.class);
    }


    private ResponseEntity<Map> forwardGetRequest(String url) {
        return restTemplate.getForEntity(url, Map.class);
    }
}