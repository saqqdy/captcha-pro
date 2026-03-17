package types

// CaptchaType represents the type of captcha
type CaptchaType string

const (
	CaptchaTypeSlider CaptchaType = "slider"
	CaptchaTypeClick  CaptchaType = "click"
	CaptchaTypeRotate CaptchaType = "rotate"
)

// Point represents a coordinate
type Point struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

// CaptchaCache represents cached captcha data
type CaptchaCache struct {
	ID           string      `json:"id"`
	Type         CaptchaType `json:"type"`
	Target       interface{} `json:"target"`
	TargetAngle  *float64    `json:"targetAngle,omitempty"`
	ClickTexts   []string    `json:"clickTexts,omitempty"`
	CreatedAt    int64       `json:"createdAt"`
	ExpiresAt    int64       `json:"expiresAt"`
}

// CaptchaGenerateOptions represents captcha generation options
type CaptchaGenerateOptions struct {
	Type         CaptchaType `json:"type"`
	Width        int         `json:"width"`
	Height       int         `json:"height"`
	SliderWidth  int         `json:"sliderWidth"`
	SliderHeight int         `json:"sliderHeight"`
	Precision    int         `json:"precision"`
	ClickCount   int         `json:"clickCount"`
	ClickText    string      `json:"clickText"`
}

// CaptchaResponse represents the response for frontend
type CaptchaResponse struct {
	CaptchaID    string      `json:"captchaId"`
	Type         CaptchaType `json:"type"`
	BgImage      string      `json:"bgImage"`
	SliderImage  string      `json:"sliderImage,omitempty"`
	TargetAngle  *float64    `json:"targetAngle,omitempty"`
	ClickTexts   []string    `json:"clickTexts,omitempty"`
	Width        int         `json:"width"`
	Height       int         `json:"height"`
	ExpiresAt    int64       `json:"expiresAt"`
}

// CaptchaGenerateResult represents captcha generation result
type CaptchaGenerateResult struct {
	Cache     CaptchaCache     `json:"cache"`
	Response  CaptchaResponse  `json:"response"`
}

// VerifyRequest represents verify request from frontend
type VerifyRequest struct {
	CaptchaID string      `json:"captchaId"`
	Type      CaptchaType `json:"type"`
	Target    interface{} `json:"target"`
	Timestamp *int64      `json:"timestamp,omitempty"`
	Signature string      `json:"signature,omitempty"`
	Nonce     string      `json:"nonce,omitempty"`
}

// VerifyResponse represents verify response
type VerifyResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    *VerifyData `json:"data,omitempty"`
}

// VerifyData represents verify data
type VerifyData struct {
	VerifiedAt int64 `json:"verifiedAt"`
}

// ApiResponse represents API response wrapper
type ApiResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}
