package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"time"

	"golang.org/x/crypto/pbkdf2"
)

const (
	saltLength = 16
	ivLength   = 12
	keyLength  = 32
	iterations = 100000
	tagSize    = 16
)

// CaptchaData represents decrypted captcha data
type CaptchaData struct {
	Type      string      `json:"type"`
	Target    interface{} `json:"target"`
	Timestamp int64       `json:"timestamp"`
	Nonce     string      `json:"nonce"`
}

// DeriveKey derives AES key from secret string using PBKDF2
func DeriveKey(secretKey string, salt []byte) []byte {
	return pbkdf2.Key([]byte(secretKey), salt, iterations, keyLength, sha256.New)
}

// AesEncrypt encrypts plaintext using AES-GCM
// Output format: base64(salt[16] + iv[12] + ciphertext + authTag[16])
func AesEncrypt(plaintext, secretKey string) (string, error) {
	// Generate random salt and IV
	salt := make([]byte, saltLength)
	iv := make([]byte, ivLength)
	if _, err := io.ReadFull(rand.Reader, salt); err != nil {
		return "", err
	}
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return "", err
	}

	// Derive key
	key := DeriveKey(secretKey, salt)

	// Create cipher
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// Encrypt
	ciphertext := aesgcm.Seal(nil, iv, []byte(plaintext), nil)

	// Combine: salt + iv + ciphertext (includes authTag)
	combined := make([]byte, 0, saltLength+ivLength+len(ciphertext))
	combined = append(combined, salt...)
	combined = append(combined, iv...)
	combined = append(combined, ciphertext...)

	return base64.StdEncoding.EncodeToString(combined), nil
}

// AesDecrypt decrypts ciphertext using AES-GCM
// Input format: base64(salt[16] + iv[12] + ciphertext + authTag[16])
func AesDecrypt(ciphertext, secretKey string) (string, error) {
	// Decode base64
	combined, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", err
	}

	if len(combined) < saltLength+ivLength+tagSize {
		return "", errors.New("ciphertext too short")
	}

	// Extract components
	salt := combined[:saltLength]
	iv := combined[saltLength : saltLength+ivLength]
	encrypted := combined[saltLength+ivLength:]

	// Derive key
	key := DeriveKey(secretKey, salt)

	// Create cipher
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// Decrypt
	plaintext, err := aesgcm.Open(nil, iv, encrypted, nil)
	if err != nil {
		return "", errors.New("decryption failed: invalid ciphertext or wrong key")
	}

	return string(plaintext), nil
}

// DecryptCaptchaData decrypts and parses captcha data
func DecryptCaptchaData(encryptedData, secretKey string) (*CaptchaData, error) {
	decrypted, err := AesDecrypt(encryptedData, secretKey)
	if err != nil {
		return nil, err
	}

	var data CaptchaData
	if err := json.Unmarshal([]byte(decrypted), &data); err != nil {
		return nil, err
	}

	return &data, nil
}

// ValidateTimestamp validates timestamp within tolerance (in milliseconds)
func ValidateTimestamp(timestamp, tolerance int64) bool {
	now := time.Now().UnixMilli()
	diff := now - timestamp
	if diff < 0 {
		diff = -diff
	}
	return diff <= tolerance
}
