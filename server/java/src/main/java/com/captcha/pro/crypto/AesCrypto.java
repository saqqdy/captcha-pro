package com.captcha.pro.crypto;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * AES-GCM encryption utilities for captcha server
 * Compatible with frontend Web Crypto API implementation
 *
 * Frontend format: base64(salt[16] + iv[12] + ciphertext + authTag[16])
 */
public class AesCrypto {

    private static final int SALT_LENGTH = 16;
    private static final int IV_LENGTH = 12;
    private static final int KEY_LENGTH = 256;
    private static final int ITERATIONS = 100000;
    private static final int GCM_TAG_LENGTH = 128; // bits

    /**
     * Derive AES key from secret string using PBKDF2
     */
    private static SecretKey deriveKey(String secretKey, byte[] salt) throws Exception {
        PBEKeySpec spec = new PBEKeySpec(secretKey.toCharArray(), salt, ITERATIONS, KEY_LENGTH);
        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        byte[] keyBytes = factory.generateSecret(spec).getEncoded();
        return new SecretKeySpec(keyBytes, "AES");
    }

    /**
     * AES-GCM encryption
     * Output format: base64(salt[16] + iv[12] + ciphertext + authTag[16])
     */
    public static String encrypt(String plaintext, String secretKey) throws Exception {
        SecureRandom random = new SecureRandom();

        // Generate random salt and IV
        byte[] salt = new byte[SALT_LENGTH];
        byte[] iv = new byte[IV_LENGTH];
        random.nextBytes(salt);
        random.nextBytes(iv);

        // Derive key
        SecretKey key = deriveKey(secretKey, salt);

        // Encrypt
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
        cipher.init(Cipher.ENCRYPT_MODE, key, spec);
        byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

        // Combine: salt + iv + ciphertext (includes authTag)
        byte[] combined = new byte[SALT_LENGTH + IV_LENGTH + ciphertext.length];
        System.arraycopy(salt, 0, combined, 0, SALT_LENGTH);
        System.arraycopy(iv, 0, combined, SALT_LENGTH, IV_LENGTH);
        System.arraycopy(ciphertext, 0, combined, SALT_LENGTH + IV_LENGTH, ciphertext.length);

        return Base64.getEncoder().encodeToString(combined);
    }

    /**
     * AES-GCM decryption
     * Input format: base64(salt[16] + iv[12] + ciphertext + authTag[16])
     */
    public static String decrypt(String ciphertext, String secretKey) throws Exception {
        // Decode base64
        byte[] combined = Base64.getDecoder().decode(ciphertext);

        if (combined.length < SALT_LENGTH + IV_LENGTH + 16) {
            throw new IllegalArgumentException("Ciphertext too short");
        }

        // Extract components
        byte[] salt = new byte[SALT_LENGTH];
        byte[] iv = new byte[IV_LENGTH];
        byte[] encrypted = new byte[combined.length - SALT_LENGTH - IV_LENGTH];

        System.arraycopy(combined, 0, salt, 0, SALT_LENGTH);
        System.arraycopy(combined, SALT_LENGTH, iv, 0, IV_LENGTH);
        System.arraycopy(combined, SALT_LENGTH + IV_LENGTH, encrypted, 0, encrypted.length);

        // Derive key
        SecretKey key = deriveKey(secretKey, salt);

        // Decrypt
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
        cipher.init(Cipher.DECRYPT_MODE, key, spec);
        byte[] decrypted = cipher.doFinal(encrypted);

        return new String(decrypted, StandardCharsets.UTF_8);
    }

    /**
     * Validate timestamp
     */
    public static boolean validateTimestamp(long timestamp, long tolerance) {
        long now = System.currentTimeMillis();
        return Math.abs(now - timestamp) <= tolerance;
    }
}
