package com.captcha.pro.crypto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Decrypted captcha data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaptchaData {
    private String type;
    private Object target;
    private long timestamp;
    private String nonce;
}
