package captcha

import (
	"bytes"
	"encoding/base64"
	"image"
	"image/color"
	"image/png"
	"math"
	"math/rand"
	"time"

	"github.com/fogleman/gg"
	"github.com/google/uuid"
	"github.com/saqqdy/captcha-pro/server/go/internal/types"
)

// Generator generates captcha images
type Generator struct {
	rand *rand.Rand
}

// NewGenerator creates a new generator
func NewGenerator() *Generator {
	return &Generator{
		rand: rand.New(rand.NewSource(time.Now().UnixNano())),
	}
}

// Generate generates a captcha based on options
func (g *Generator) Generate(opts types.CaptchaGenerateOptions, expireTime int64) *types.CaptchaGenerateResult {
	switch opts.Type {
	case types.CaptchaTypeClick:
		return g.generateClick(opts, expireTime)
	case types.CaptchaTypeRotate:
		return g.generateRotate(opts, expireTime)
	default:
		return g.generateSlider(opts, expireTime)
	}
}

func (g *Generator) generateSlider(opts types.CaptchaGenerateOptions, expireTime int64) *types.CaptchaGenerateResult {
	width := opts.Width
	height := opts.Height
	sliderW := opts.SliderWidth
	sliderH := opts.SliderHeight

	if width == 0 {
		width = 280
	}
	if height == 0 {
		height = 155
	}
	if sliderW == 0 {
		sliderW = 50
	}
	if sliderH == 0 {
		sliderH = 50
	}

	// Create background image
	dc := gg.NewContext(width, height)

	// Fill background with gradient
	grad := gg.NewLinearGradient(0, 0, float64(width), float64(height))
	grad.AddColorStop(0, g.randomColor(100, 200))
	grad.AddColorStop(1, g.randomColor(100, 200))
	dc.SetFillStyle(grad)
	dc.DrawRectangle(0, 0, float64(width), float64(height))
	dc.Fill()

	// Add random shapes
	for i := 0; i < 20; i++ {
		dc.SetColor(g.randomColorAlpha(100, 200, 80))
		x := g.randomFloat(0, float64(width))
		y := g.randomFloat(0, float64(height))
		w := g.randomFloat(10, 30)
		h := g.randomFloat(10, 30)
		dc.DrawEllipse(x, y, w, h)
		dc.Fill()
	}

	// Random target position
	targetX := g.randomInt(sliderW+20, width-sliderW-20)
	targetY := g.randomInt(20, height-sliderH-20)

	// Create slider image
	sliderDC := gg.NewContext(sliderW, sliderH)

	// Copy background area to slider
	for y := 0; y < sliderH; y++ {
		for x := 0; x < sliderW; x++ {
			bgX := targetX + x
			bgY := targetY + y
			if bgX < width && bgY < height {
				c := dc.Image().At(bgX, bgY)
				sliderDC.SetColor(c)
				sliderDC.SetPixel(x, y)
			}
		}
	}

	// Draw puzzle shape on background (hole)
	dc.SetColor(g.randomColor(200, 255))
	g.drawPuzzleMask(dc, float64(targetX), float64(targetY), float64(sliderW), float64(sliderH), true)

	// Draw puzzle outline on slider
	sliderDC.SetColor(g.randomColor(50, 100))
	g.drawPuzzleMask(sliderDC, 0, 0, float64(sliderW), float64(sliderH), false)

	// Generate captcha ID
	captchaID := uuid.New().String()
	now := time.Now().UnixMilli()

	// Create result
	bgBase64 := "data:image/png;base64," + g.imageToBase64(dc.Image())
	sliderBase64 := "data:image/png;base64," + g.imageToBase64(sliderDC.Image())

	return &types.CaptchaGenerateResult{
		Cache: types.CaptchaCache{
			ID:        captchaID,
			Type:      types.CaptchaTypeSlider,
			Target:    []int{targetX},
			CreatedAt: now,
			ExpiresAt: now + expireTime,
		},
		Response: types.CaptchaResponse{
			CaptchaID:   captchaID,
			Type:        types.CaptchaTypeSlider,
			BgImage:     bgBase64,
			SliderImage: sliderBase64,
			Width:       width,
			Height:      height,
			ExpiresAt:   now + expireTime,
		},
	}
}

func (g *Generator) generateClick(opts types.CaptchaGenerateOptions, expireTime int64) *types.CaptchaGenerateResult {
	width := opts.Width
	height := opts.Height
	clickCount := opts.ClickCount

	if width == 0 {
		width = 280
	}
	if height == 0 {
		height = 155
	}
	if clickCount == 0 {
		clickCount = 3
	}

	// Create background image
	dc := gg.NewContext(width, height)

	// Fill background with gradient
	grad := gg.NewLinearGradient(0, 0, float64(width), float64(height))
	grad.AddColorStop(0, g.randomColor(100, 200))
	grad.AddColorStop(1, g.randomColor(100, 200))
	dc.SetFillStyle(grad)
	dc.DrawRectangle(0, 0, float64(width), float64(height))
	dc.Fill()

	// Add random shapes
	for i := 0; i < 30; i++ {
		dc.SetColor(g.randomColorAlpha(100, 200, 80))
		x := g.randomFloat(0, float64(width))
		y := g.randomFloat(0, float64(height))
		w := g.randomFloat(10, 30)
		h := g.randomFloat(10, 30)
		dc.DrawEllipse(x, y, w, h)
		dc.Fill()
	}

	// Generate click texts and positions
	fontSize := 20.0
	padding := fontSize + 10
	clickTexts := make([]string, clickCount)
	targetPoints := make([]map[string]float64, clickCount)

	chars := "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678"
	if opts.ClickText != "" && len(opts.ClickText) >= clickCount {
		chars = opts.ClickText
	}

	for i := 0; i < clickCount; i++ {
		ch := string(chars[g.randomInt(0, len(chars)-1)])
		clickTexts[i] = ch

		var x, y float64
		for attempts := 0; attempts < 100; attempts++ {
			x = g.randomFloat(padding, float64(width)-padding)
			y = g.randomFloat(padding, float64(height)-padding)

			// Check overlap
			overlaps := false
			for _, p := range targetPoints {
				dist := math.Sqrt(math.Pow(x-p["x"], 2) + math.Pow(y-p["y"], 2))
				if dist < fontSize*1.5 {
					overlaps = true
					break
				}
			}
			if !overlaps {
				break
			}
		}

		targetPoints[i] = map[string]float64{"x": x, "y": y}

		// Draw character with rotation
		dc.SetColor(g.randomColor(30, 80))
		dc.Push()
		dc.RotateAbout(g.randomFloat(-0.5, 0.5), x, y)
		dc.DrawString(ch, x, y)
		dc.Pop()
	}

	// Generate captcha ID
	captchaID := uuid.New().String()
	now := time.Now().UnixMilli()

	bgBase64 := "data:image/png;base64," + g.imageToBase64(dc.Image())

	return &types.CaptchaGenerateResult{
		Cache: types.CaptchaCache{
			ID:         captchaID,
			Type:       types.CaptchaTypeClick,
			Target:     targetPoints,
			ClickTexts: clickTexts,
			CreatedAt:  now,
			ExpiresAt:  now + expireTime,
		},
		Response: types.CaptchaResponse{
			CaptchaID:  captchaID,
			Type:       types.CaptchaTypeClick,
			BgImage:    bgBase64,
			ClickTexts: clickTexts,
			Width:      width,
			Height:     height,
			ExpiresAt:  now + expireTime,
		},
	}
}

func (g *Generator) generateRotate(opts types.CaptchaGenerateOptions, expireTime int64) *types.CaptchaGenerateResult {
	width := opts.Width
	height := opts.Height

	if width == 0 {
		width = 280
	}
	if height == 0 {
		height = 155
	}

	// Create image
	dc := gg.NewContext(width, height)

	centerX := float64(width) / 2
	centerY := float64(height) / 2
	size := float64(min(width, height))

	// Generate random angle
	targetAngle := float64(g.randomInt(0, 360))

	// Fill background
	dc.SetColor(g.randomColor(200, 240))
	dc.DrawRectangle(0, 0, float64(width), float64(height))
	dc.Fill()

	// Draw colorful circle
	grad := gg.NewRadialGradient(centerX, centerY, 0, centerX, centerY, size/2)
	grad.AddColorStop(0, g.randomColor(100, 255))
	grad.AddColorStop(1, g.randomColor(100, 255))
	dc.SetFillStyle(grad)
	dc.DrawCircle(centerX, centerY, size/2-10)
	dc.Fill()

	// Draw arrow indicator
	dc.SetColor(g.randomColor(200, 255))
	arrowPoints := [][]float64{
		{centerX, centerY - size/2 + 30},
		{centerX - 15, centerY - size/2 + 50},
		{centerX + 15, centerY - size/2 + 50},
	}
	dc.MoveTo(arrowPoints[0][0], arrowPoints[0][1])
	for _, p := range arrowPoints[1:] {
		dc.LineTo(p[0], p[1])
	}
	dc.ClosePath()
	dc.Fill()

	// Draw center circle
	dc.SetColor(g.randomColor(220, 255))
	dc.DrawCircle(centerX, centerY, 20)
	dc.Fill()

	// Generate captcha ID
	captchaID := uuid.New().String()
	now := time.Now().UnixMilli()

	bgBase64 := "data:image/png;base64," + g.imageToBase64(dc.Image())

	return &types.CaptchaGenerateResult{
		Cache: types.CaptchaCache{
			ID:          captchaID,
			Type:        types.CaptchaTypeRotate,
			Target:      []float64{targetAngle},
			TargetAngle: &targetAngle,
			CreatedAt:   now,
			ExpiresAt:   now + expireTime,
		},
		Response: types.CaptchaResponse{
			CaptchaID:   captchaID,
			Type:        types.CaptchaTypeRotate,
			BgImage:     bgBase64,
			TargetAngle: &targetAngle,
			Width:       width,
			Height:      height,
			ExpiresAt:   now + expireTime,
		},
	}
}

func (g *Generator) drawPuzzleMask(dc *gg.Context, x, y, w, h float64, fill bool) {
	notch := 10.0

	dc.MoveTo(x+5, y)
	dc.LineTo(x+w-5, y)
	dc.LineTo(x+w, y+5)
	dc.LineTo(x+w, y+h/2-notch/2)
	dc.LineTo(x+w+notch, y+h/2)
	dc.LineTo(x+w, y+h/2+notch/2)
	dc.LineTo(x+w, y+h-5)
	dc.LineTo(x+w-5, y+h)
	dc.LineTo(x+w/2+notch, y+h)
	dc.LineTo(x+w/2, y+h+notch)
	dc.LineTo(x+w/2-notch, y+h)
	dc.LineTo(x+5, y+h)
	dc.LineTo(x, y+h-5)
	dc.LineTo(x, y+5)
	dc.ClosePath()

	if fill {
		dc.Fill()
	} else {
		dc.Stroke()
	}
}

func (g *Generator) randomInt(min, max int) int {
	return g.rand.Intn(max-min+1) + min
}

func (g *Generator) randomFloat(min, max float64) float64 {
	return g.rand.Float64()*(max-min) + min
}

func (g *Generator) randomColor(min, max int) color.Color {
	return color.RGBA{
		R: uint8(g.randomInt(min, max)),
		G: uint8(g.randomInt(min, max)),
		B: uint8(g.randomInt(min, max)),
		A: 255,
	}
}

func (g *Generator) randomColorAlpha(min, max, alpha int) color.Color {
	return color.RGBA{
		R: uint8(g.randomInt(min, max)),
		G: uint8(g.randomInt(min, max)),
		B: uint8(g.randomInt(min, max)),
		A: uint8(alpha),
	}
}

func (g *Generator) imageToBase64(img image.Image) string {
	var buf bytes.Buffer
	png.Encode(&buf, img)
	return base64.StdEncoding.EncodeToString(buf.Bytes())
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
