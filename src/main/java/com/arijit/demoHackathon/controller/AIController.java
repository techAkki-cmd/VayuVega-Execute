package com.arijit.demoHackathon.controller;

import com.arijit.demoHackathon.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AIController {

    @Autowired
    private AIService aiService;

    @PostMapping("/process")
    public String processText(@RequestBody String text) {
        return aiService.getAIResponse(text);
    }
}
