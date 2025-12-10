package com.bitevents.bitevents.config;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

public class JwtTokenProviderTest {

    @Test
    void generateValidateAndParseToken() {
        JwtTokenProvider provider = new JwtTokenProvider();
        ReflectionTestUtils.setField(provider, "jwtSecret", "01234567890123456789012345678901");
        ReflectionTestUtils.setField(provider, "jwtExpirationMs", 3600000L);

        String token = provider.generateToken("user@example.com");
        assertNotNull(token);
        assertTrue(provider.validateToken(token));
        String email = provider.getEmailFromToken(token);
        assertEquals("user@example.com", email);
    }

    @Test
    void validateMalformedTokenReturnsFalse() {
        JwtTokenProvider provider = new JwtTokenProvider();
        ReflectionTestUtils.setField(provider, "jwtSecret", "01234567890123456789012345678901");
        ReflectionTestUtils.setField(provider, "jwtExpirationMs", 3600000L);

        assertFalse(provider.validateToken("not-a-token"));
    }
}

