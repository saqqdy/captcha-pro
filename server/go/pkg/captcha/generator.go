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

// ShapeType represents the shape type for slider puzzle
type ShapeType int

const (
	ShapeTypeSquare ShapeType = iota
	ShapeTypeTriangle
	ShapeTypeTrapezoid
	ShapeTypePentagon
)

// Chinese vocabulary library (common idioms and words) - no duplicate characters in each word
var chineseWords = []string{
	// Common idioms - Blessings and good fortune
	"一帆风顺", "二龙腾飞", "三阳开泰", "四季平安", "五福临门",
	"七星高照", "八方来财", "万事如意", "心想事成", "步步高升",
	"财源广进", "恭喜发财", "龙马精神", "马到成功", "金玉满堂",
	"花开富贵", "锦绣前程", "吉祥如意", "瑞气盈门", "紫气东来",
	// Common idioms - Prosperity
	"风调雨顺", "国泰民安", "繁荣昌盛", "万象更新", "春回大地",
	"阳光明媚", "奋发图强", "自强不息", "勇往直前", "坚持不懈",
	"厚德载物", "海纳百川", "宁静致远", "淡泊明志", "天道酬勤",
	// Common idioms - Virtue and character
	"实事求是", "与时俱进", "开拓创新", "继往开来", "励精图治",
	"安居乐业", "幸福美满", "和谐共处", "德才兼备", "品学兼优",
	"诚实守信", "勤劳致富", "艰苦奋斗", "团结友爱", "尊老爱幼",
	// Common idioms - Learning and progress
	"学无止境", "勤奋好学", "刻苦钻研", "博览群书", "学以致用",
	"融会贯通", "举一反三", "触类旁通", "温故知新", "循序渐进",
	"厚积薄发", "持之以恒", "孜孜不倦", "废寝忘食", "夜以继日",
	// Common idioms - Nature and scenery
	"春暖花开", "秋高气爽", "山清水秀", "鸟语花香", "绿树成荫",
	"风和日丽", "云淡风轻", "晴空万里", "皓月当空", "繁星闪烁",
	"波光粼粼", "层峦叠嶂", "悬崖峭壁", "山高水长", "水天一色",
	// Technology and innovation vocabulary
	"科技创新", "人工智能", "云计算", "大数据", "物联网",
	"智慧城市", "数字经济", "智能制造", "绿色发展", "生态环保",
	"区块链", "元宇宙", "量子计算", "机器学习", "深度学习",
	"自动驾驶", "智能家居", "工业互联", "数字孪生", "虚拟现实",
	// Life and emotion vocabulary
	"健康生活", "快乐工作", "简单实用", "美好时光", "精彩无限",
	"梦想成真", "未来可期", "热爱生活", "积极向上", "诚信为本",
	"品质至上", "服务周到", "客户满意", "合作共赢", "互利共赢",
	// Business and economy vocabulary
	"商业模式", "品牌价值", "核心竞争", "市场份额", "战略规划",
	"创新驱动", "转型升级", "经济效益", "企业文化", "团队协作",
	"人才培养", "绩效管理", "流程优化", "降本增效", "稳健经营",
	// Four-character auspicious words
	"福星高照", "鸿运当头", "前途光明", "事业有成", "功成名就",
	"名利双收", "前程似锦", "大展宏图", "鹏程万里", "旗开得胜",
	"马到功成", "飞黄腾达", "平步青云", "扶摇直上",
}

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
	borderRadius := 8.0

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

	// Generate rich background
	g.generateBackground(dc, width, height)

	// Random shape type
	shapeTypes := []ShapeType{ShapeTypeSquare, ShapeTypeTriangle, ShapeTypeTrapezoid, ShapeTypePentagon}
	currentShape := shapeTypes[g.randomInt(0, len(shapeTypes)-1)]

	// Random target position (avoid edges)
	targetX := g.randomInt(sliderW+20, width-sliderW-20)
	targetY := g.randomInt(10, height-sliderH-10)

	// Create slider image
	sliderDC := gg.NewContext(sliderW, sliderH)

	// Draw shape path and clip for slider
	g.drawShape(sliderDC, currentShape, 0, 0, float64(sliderW), float64(sliderH), borderRadius)
	sliderDC.Clip()

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

	sliderDC.ResetClip()

	// Draw slider border with shadow
	sliderDC.SetColor(color.RGBA{R: 255, G: 255, B: 255, A: 255})
	g.drawShape(sliderDC, currentShape, 0, 0, float64(sliderW), float64(sliderH), borderRadius)
	sliderDC.Stroke()

	// Draw decoy hole (deceptive pit with random rotation)
	g.drawDecoyHole(dc, currentShape, float64(sliderW), float64(sliderH), borderRadius, width, height, targetX, targetY)

	// Draw hole: white border + dark overlay
	dc.SetColor(color.RGBA{R: 0, G: 0, B: 0, A: 77}) // rgba(0, 0, 0, 0.3)
	g.drawShape(dc, currentShape, float64(targetX), float64(targetY), float64(sliderW), float64(sliderH), borderRadius)
	dc.Fill()
	dc.SetColor(color.RGBA{R: 255, G: 255, B: 255, A: 255})
	g.drawShape(dc, currentShape, float64(targetX), float64(targetY), float64(sliderW), float64(sliderH), borderRadius)
	dc.Stroke()

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
			SliderY:     &targetY,
			Width:       width,
			Height:      height,
			ExpiresAt:   now + expireTime,
		},
	}
}

// generateBackground generates a rich background with gradient and decorations
func (g *Generator) generateBackground(dc *gg.Context, width, height int) {
	// Generate gradient background using HSL colors
	hue1 := g.rand.Float64() * 360
	hue2 := math.Mod(hue1+float64(g.randomInt(30, 60)), 360)

	grad := gg.NewLinearGradient(0, 0, float64(width), float64(height))
	grad.AddColorStop(0, g.hslToRGB(hue1, 0.7, 0.85))
	grad.AddColorStop(1, g.hslToRGB(hue2, 0.7, 0.75))
	dc.SetFillStyle(grad)
	dc.DrawRectangle(0, 0, float64(width), float64(height))
	dc.Fill()

	// Add decorative background shapes
	for i := 0; i < 8; i++ {
		shapeHue := math.Mod(hue1+g.rand.Float64()*120, 360)
		dc.SetColor(g.hslToRGBA(shapeHue, 0.6, 0.6, 0.15))
		shapeType := g.randomInt(0, 2)
		x := g.randomInt(-20, width-20)
		y := g.randomInt(-20, height-20)
		size := float64(g.randomInt(40, 80))
		dc.NewSubPath()
		if shapeType == 0 {
			dc.DrawCircle(float64(x), float64(y), size)
		} else if shapeType == 1 {
			dc.DrawRectangle(float64(x), float64(y), size*1.5, size)
		} else {
			dc.MoveTo(float64(x)+size/2, float64(y))
			dc.LineTo(float64(x)+size, float64(y)+size)
			dc.LineTo(float64(x), float64(y)+size)
			dc.ClosePath()
		}
		dc.Fill()
	}

	// Add small decorative dots
	for i := 0; i < 30; i++ {
		dotHue := math.Mod(hue1+g.rand.Float64()*180, 360)
		dc.SetColor(g.hslToRGBA(dotHue, 0.5, 0.5, 0.3))
		dc.DrawCircle(float64(g.randomInt(0, width)), float64(g.randomInt(0, height)), float64(g.randomInt(2, 8)))
		dc.Fill()
	}

	// Add some lines
	for i := 0; i < 5; i++ {
		lineHue := math.Mod(hue1+g.rand.Float64()*180, 360)
		dc.SetColor(g.hslToRGBA(lineHue, 0.4, 0.5, 0.2))
		dc.SetLineWidth(float64(g.randomInt(1, 3)))
		dc.DrawLine(float64(g.randomInt(0, width)), float64(g.randomInt(0, height)), float64(g.randomInt(0, width)), float64(g.randomInt(0, height)))
		dc.Stroke()
	}
}

// drawDecoyHole draws a decoy hole (deceptive pit with random rotation)
func (g *Generator) drawDecoyHole(dc *gg.Context, shape ShapeType, w, h, r float64, width, height, targetX, targetY int) {
	// Random decoy position (avoid overlapping with target)
	var decoyX, decoyY int
	for attempts := 0; attempts < 100; attempts++ {
		decoyX = g.randomInt(int(w)+10, width-int(w)-10)
		decoyY = g.randomInt(10, height-int(h)-10)
		if math.Abs(float64(decoyX-targetX)) >= w+20 || math.Abs(float64(decoyY-targetY)) >= h+20 {
			break
		}
	}

	// Random rotation angle (5-15 degrees)
	rotation := float64(g.randomInt(5, 15)) * math.Pi / 180

	dc.Push()
	dc.RotateAbout(rotation, float64(decoyX)+w/2, float64(decoyY)+h/2)

	// Draw decoy hole: white border + dark overlay
	dc.SetColor(color.RGBA{R: 0, G: 0, B: 0, A: 77}) // rgba(0, 0, 0, 0.3)
	g.drawShape(dc, shape, float64(decoyX), float64(decoyY), w, h, r)
	dc.Fill()
	dc.SetColor(color.RGBA{R: 255, G: 255, B: 255, A: 255})
	g.drawShape(dc, shape, float64(decoyX), float64(decoyY), w, h, r)
	dc.Stroke()

	dc.Pop()
}

// drawShape draws a shape based on type
func (g *Generator) drawShape(dc *gg.Context, shape ShapeType, x, y, w, h, r float64) {
	dc.NewSubPath()
	switch shape {
	case ShapeTypeTriangle:
		dc.MoveTo(x+w/2, y)
		dc.LineTo(x+w, y+h)
		dc.LineTo(x, y+h)
	case ShapeTypeTrapezoid:
		inset := w * 0.15
		dc.MoveTo(x+inset, y)
		dc.LineTo(x+w-inset, y)
		dc.LineTo(x+w, y+h)
		dc.LineTo(x, y+h)
	case ShapeTypePentagon:
		centerX := x + w/2
		centerY := y + h/2
		radius := math.Min(w, h) / 2
		for i := 0; i < 5; i++ {
			angle := float64(i)*2*math.Pi/5 - math.Pi/2
			px := centerX + radius*math.Cos(angle)
			py := centerY + radius*math.Sin(angle)
			if i == 0 {
				dc.MoveTo(px, py)
			} else {
				dc.LineTo(px, py)
			}
		}
	default: // Square
		dc.DrawRoundedRectangle(x, y, w, h, r)
	}
	dc.ClosePath()
}

// hslToRGB converts HSL to RGB color
func (g *Generator) hslToRGB(h, s, l float64) color.Color {
	return g.hslToRGBA(h, s, l, 1.0)
}

// hslToRGBA converts HSL to RGBA color
func (g *Generator) hslToRGBA(h, s, l, a float64) color.Color {
	c := (1 - math.Abs(2*l-1)) * s
	x := c * (1 - math.Abs(math.Mod(h/60, 2)-1))
	m := l - c/2
	var r, g2, b float64
	if h < 60 {
		r, g2, b = c, x, 0
	} else if h < 120 {
		r, g2, b = x, c, 0
	} else if h < 180 {
		r, g2, b = 0, c, x
	} else if h < 240 {
		r, g2, b = 0, x, c
	} else if h < 300 {
		r, g2, b = x, 0, c
	} else {
		r, g2, b = c, 0, x
	}
	return color.RGBA{
		R: uint8((r + m) * 255),
		G: uint8((g2 + m) * 255),
		B: uint8((b + m) * 255),
		A: uint8(a * 255),
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

	// Generate rich background
	g.generateBackground(dc, width, height)

	// Generate click texts from Chinese vocabulary
	var chars string
	if opts.ClickText != "" && len(opts.ClickText) >= clickCount {
		chars = opts.ClickText
	} else {
		randomWord := chineseWords[g.randomInt(0, len(chineseWords)-1)]
		if len([]rune(randomWord)) >= clickCount {
			chars = string([]rune(randomWord)[:clickCount])
		} else {
			chars = randomWord
			runes := []rune(chars)
			for len(runes) < clickCount {
				extraWord := chineseWords[g.randomInt(0, len(chineseWords)-1)]
				extraRunes := []rune(extraWord)
				remaining := clickCount - len(runes)
				if len(extraRunes) < remaining {
					remaining = len(extraRunes)
				}
				runes = append(runes, extraRunes[:remaining]...)
			}
			chars = string(runes)
		}
	}

	clickTexts := make([]string, 0, clickCount)
	charRunes := []rune(chars)
	for i := 0; i < clickCount && i < len(charRunes); i++ {
		clickTexts = append(clickTexts, string(charRunes[i]))
	}

	// Generate 1-2 decoy characters
	usedChars := make(map[string]bool)
	for _, ch := range clickTexts {
		usedChars[ch] = true
	}
	decoyCount := g.randomInt(1, 2)
	decoyTexts := make([]string, 0, decoyCount)
	for i := 0; i < decoyCount; i++ {
		for attempts := 0; attempts < 50; attempts++ {
			randomWord := chineseWords[g.randomInt(0, len(chineseWords)-1)]
			for _, r := range randomWord {
				ch := string(r)
				if !usedChars[ch] {
					decoyTexts = append(decoyTexts, ch)
					usedChars[ch] = true
					break
				}
			}
			if len(decoyTexts) > i {
				break
			}
		}
	}

	fontSize := 20.0
	padding := fontSize + 10
	targetPoints := make([]map[string]float64, len(clickTexts))

	// Draw click target characters
	for i, ch := range clickTexts {
		var x, y float64
		for attempts := 0; attempts < 100; attempts++ {
			x = g.randomFloat(padding, float64(width)-padding)
			y = g.randomFloat(padding, float64(height)-padding)

			// Check overlap
			overlaps := false
			for _, p := range targetPoints {
				if p == nil {
					continue
				}
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
		dc.SetColor(color.RGBA{R: 51, G: 51, B: 51, A: 255}) // #333
		dc.Push()
		dc.RotateAbout(g.randomFloat(-0.5, 0.5), x, y)
		dc.DrawStringAnchored(ch, x, y, 0.5, 0.5)
		dc.Pop()
	}

	// Draw decoy characters (lighter color)
	decoyPoints := make([]map[string]float64, len(decoyTexts))
	for i, ch := range decoyTexts {
		var x, y float64
		for attempts := 0; attempts < 100; attempts++ {
			x = g.randomFloat(padding, float64(width)-padding)
			y = g.randomFloat(padding, float64(height)-padding)

			// Check overlap with all points
			overlaps := false
			for _, p := range targetPoints {
				if p == nil {
					continue
				}
				dist := math.Sqrt(math.Pow(x-p["x"], 2) + math.Pow(y-p["y"], 2))
				if dist < fontSize*1.5 {
					overlaps = true
					break
				}
			}
			if !overlaps {
				for j := 0; j < i; j++ {
					if decoyPoints[j] == nil {
						continue
					}
					dist := math.Sqrt(math.Pow(x-decoyPoints[j]["x"], 2) + math.Pow(y-decoyPoints[j]["y"], 2))
					if dist < fontSize*1.5 {
						overlaps = true
						break
					}
				}
			}
			if !overlaps {
				break
			}
		}

		decoyPoints[i] = map[string]float64{"x": x, "y": y}

		// Draw decoy character with lighter color
		dc.SetColor(color.RGBA{R: 85, G: 85, B: 85, A: 255}) // #555
		dc.Push()
		dc.RotateAbout(g.randomFloat(-0.4, 0.4), x, y)
		dc.DrawStringAnchored(ch, x, y, 0.5, 0.5)
		dc.Pop()
	}

	// Generate captcha ID
	captchaID := uuid.New().String()
	now := time.Now().UnixMilli()

	bgBase64 := "data:image/png;base64," + g.imageToBase64(dc.Image())

	// Generate click character images for prompt
	clickCharImages := make([]string, len(clickTexts))
	for i, ch := range clickTexts {
		clickCharImages[i] = g.generateCharImage(ch)
	}

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
			CaptchaID:      captchaID,
			Type:           types.CaptchaTypeClick,
			BgImage:        bgBase64,
			ClickTexts:     clickTexts,
			ClickCharImages: clickCharImages,
			Width:          width,
			Height:         height,
			ExpiresAt:      now + expireTime,
		},
	}
}

// generateCharImage generates a base64 image for a character (for prompt display)
func (g *Generator) generateCharImage(ch string) string {
	fontSize := 16.0
	padding := 4.0
	size := int(fontSize + padding*2)

	dc := gg.NewContext(size, size)

	dc.SetColor(color.RGBA{R: 25, G: 145, B: 250, A: 255}) // #1991fa

	// Random slight rotation for anti-bot
	rotation := g.randomFloat(-0.17, 0.17) // -10 to 10 degrees
	dc.RotateAbout(rotation, float64(size)/2, float64(size)/2)

	dc.DrawStringAnchored(ch, float64(size)/2, float64(size)/2, 0.5, 0.5)

	var buf bytes.Buffer
	png.Encode(&buf, dc.Image())
	return "data:image/png;base64," + base64.StdEncoding.EncodeToString(buf.Bytes())
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
