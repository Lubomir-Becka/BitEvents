package com.bitevents.bitevents.config;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class GlobalExceptionHandlerTest {

    @Test
    void handleIllegalArgumentException() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        ResponseEntity<Map<String, String>> resp = handler.handleBadRequest(new IllegalArgumentException("bad"));
        assertEquals(400, resp.getStatusCode().value());
        assertEquals("bad", resp.getBody().get("error"));
    }

    @Test
    void handleEntityNotFoundException() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        ResponseEntity<Map<String, String>> resp = handler.handleNotFound(new EntityNotFoundException("missing"));
        assertEquals(404, resp.getStatusCode().value());
        assertEquals("missing", resp.getBody().get("error"));
    }
}
