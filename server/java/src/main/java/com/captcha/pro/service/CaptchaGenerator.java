package com.captcha.pro.service;

import com.captcha.pro.model.*;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.geom.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;

/**
 * Captcha generator service
 */
public class CaptchaGenerator {

    private final Random random = new Random();

    /**
     * Shape types for slider puzzle
     */
    private enum ShapeType {
        SQUARE, TRIANGLE, TRAPEZOID, PENTAGON
    }

    /**
     * Chinese vocabulary library (common idioms and words) - no duplicate characters in each word
     */
    private static final String[] CHINESE_WORDS = {
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
    };

    /**
     * Generate captcha based on options
     */
    public CaptchaGenerateResult generate(CaptchaGenerateOptions options) {
        return switch (options.getType() != null ? options.getType() : CaptchaType.SLIDER) {
            case CLICK -> generateClick(options);
            default -> generateSlider(options);
        };
    }

    /**
     * Generate slider captcha
     */
    private CaptchaGenerateResult generateSlider(CaptchaGenerateOptions options) {
        int width = options.getWidth();
        int height = options.getHeight();
        int sliderWidth = options.getSliderWidth();
        int sliderHeight = options.getSliderHeight();
        int borderRadius = 8;

        // Create background image
        BufferedImage bgImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D bgGraphics = bgImage.createGraphics();
        bgGraphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // Generate rich background
        generateBackground(bgGraphics, width, height);

        // Random shape type
        ShapeType[] shapes = ShapeType.values();
        ShapeType currentShape = shapes[randomInt(0, shapes.length - 1)];

        // Random target position (avoid edges)
        int targetX = randomInt(sliderWidth + 20, width - sliderWidth - 20);
        int targetY = randomInt(10, height - sliderHeight - 10);

        // Create slider image
        BufferedImage sliderImage = new BufferedImage(sliderWidth, sliderHeight, BufferedImage.TYPE_INT_ARGB);
        Graphics2D sliderGraphics = sliderImage.createGraphics();
        sliderGraphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // Copy background area to slider using shape clip
        Shape clipShape = createShape(currentShape, 0, 0, sliderWidth, sliderHeight, borderRadius);
        sliderGraphics.setClip(clipShape);
        sliderGraphics.drawImage(bgImage, -targetX, -targetY, null);
        sliderGraphics.setClip(null);

        // Draw slider border with shadow
        sliderGraphics.setStroke(new BasicStroke(1));
        sliderGraphics.setColor(Color.WHITE);
        sliderGraphics.draw(clipShape);

        // Draw decoy hole (deceptive pit with random rotation)
        drawDecoyHole(bgGraphics, currentShape, sliderWidth, sliderHeight, borderRadius, width, height, targetX, targetY);

        // Clear the puzzle area on background
        bgGraphics.setComposite(AlphaComposite.Clear);
        bgGraphics.fill(clipShape.getBounds2D()); // Simple clear
        bgGraphics.setComposite(AlphaComposite.SrcOver);

        // Draw hole: white border + dark overlay
        Shape targetShape = createShape(currentShape, targetX, targetY, sliderWidth, sliderHeight, borderRadius);
        bgGraphics.setColor(new Color(0, 0, 0, 77)); // rgba(0, 0, 0, 0.3)
        bgGraphics.fill(targetShape);
        bgGraphics.setStroke(new BasicStroke(1));
        bgGraphics.setColor(Color.WHITE);
        bgGraphics.draw(targetShape);

        bgGraphics.dispose();
        sliderGraphics.dispose();

        // Generate captcha ID
        String captchaId = UUID.randomUUID().toString();
        long now = System.currentTimeMillis();
        long expireTime = 60000;

        // Create cache entry
        CaptchaCache cache = CaptchaCache.builder()
                .id(captchaId)
                .type(CaptchaType.SLIDER)
                .target(List.of(targetX))
                .createdAt(now)
                .expiresAt(now + expireTime)
                .build();

        // Create response
        CaptchaResponse response = CaptchaResponse.builder()
                .captchaId(captchaId)
                .type(CaptchaType.SLIDER)
                .bgImage("data:image/png;base64," + imageToBase64(bgImage))
                .sliderImage("data:image/png;base64," + imageToBase64(sliderImage))
                .sliderY(targetY)
                .width(width)
                .height(height)
                .expiresAt(now + expireTime)
                .build();

        return new CaptchaGenerateResult(cache, response);
    }

    /**
     * Generate rich background with gradient and decorations
     */
    private void generateBackground(Graphics2D g, int width, int height) {
        // Generate gradient background using HSL colors
        float hue1 = random.nextFloat() * 360;
        float hue2 = (hue1 + randomInt(30, 60)) % 360;

        GradientPaint gradient = new GradientPaint(0, 0, hslToRgba(hue1, 0.7f, 0.85f, 1.0f), width, height, hslToRgba(hue2, 0.7f, 0.75f, 1.0f));
        g.setPaint(gradient);
        g.fillRect(0, 0, width, height);

        // Add decorative background shapes
        for (int i = 0; i < 8; i++) {
            float shapeHue = (hue1 + random.nextFloat() * 120) % 360;
            g.setColor(hslToRgba(shapeHue, 0.6f, 0.6f, 0.15f));
            int shapeType = randomInt(0, 2);
            int x = randomInt(-20, width - 20);
            int y = randomInt(-20, height - 20);
            int size = randomInt(40, 80);
            if (shapeType == 0) {
                g.fillOval(x, y, size, size);
            } else if (shapeType == 1) {
                g.fillRect(x, y, (int)(size * 1.5), size);
            } else {
                int[] xp = {x + size / 2, x + size, x};
                int[] yp = {y, y + size, y + size};
                g.fillPolygon(xp, yp, 3);
            }
        }

        // Add small decorative dots
        for (int i = 0; i < 30; i++) {
            float dotHue = (hue1 + random.nextFloat() * 180) % 360;
            g.setColor(hslToRgba(dotHue, 0.5f, 0.5f, 0.3f));
            g.fillOval(randomInt(0, width), randomInt(0, height), randomInt(2, 8), randomInt(2, 8));
        }

        // Add some lines
        for (int i = 0; i < 5; i++) {
            float lineHue = (hue1 + random.nextFloat() * 180) % 360;
            g.setColor(hslToRgba(lineHue, 0.4f, 0.5f, 0.2f));
            g.setStroke(new BasicStroke(randomInt(1, 3)));
            g.drawLine(randomInt(0, width), randomInt(0, height), randomInt(0, width), randomInt(0, height));
        }
    }

    /**
     * Draw decoy hole (deceptive pit with random rotation)
     */
    private void drawDecoyHole(Graphics2D g, ShapeType shape, int w, int h, int r, int width, int height, int targetX, int targetY) {
        // Random decoy position (avoid overlapping with target)
        int decoyX, decoyY;
        do {
            decoyX = randomInt(w + 10, width - w - 10);
            decoyY = randomInt(10, height - h - 10);
        } while (Math.abs(decoyX - targetX) < w + 20 && Math.abs(decoyY - targetY) < h + 20);

        // Random rotation angle (5-15 degrees)
        double rotation = Math.toRadians(randomInt(5, 15));

        AffineTransform oldTransform = g.getTransform();
        g.rotate(rotation, decoyX + w / 2.0, decoyY + h / 2.0);

        // Draw decoy hole: white border + dark overlay
        Shape decoyShape = createShape(shape, decoyX, decoyY, w, h, r);
        g.setColor(new Color(0, 0, 0, 77)); // rgba(0, 0, 0, 0.3)
        g.fill(decoyShape);
        g.setStroke(new BasicStroke(1));
        g.setColor(Color.WHITE);
        g.draw(decoyShape);

        g.setTransform(oldTransform);
    }

    /**
     * Create shape based on type
     */
    private Shape createShape(ShapeType type, int x, int y, int w, int h, int r) {
        switch (type) {
            case TRIANGLE:
                return createTriangle(x, y, w, h);
            case TRAPEZOID:
                return createTrapezoid(x, y, w, h);
            case PENTAGON:
                return createPentagon(x, y, w, h);
            case SQUARE:
            default:
                return createRoundedRect(x, y, w, h, r);
        }
    }

    /**
     * Create rounded rectangle
     */
    private Shape createRoundedRect(int x, int y, int w, int h, int r) {
        return new RoundRectangle2D.Double(x, y, w, h, r, r);
    }

    /**
     * Create triangle
     */
    private Shape createTriangle(int x, int y, int w, int h) {
        int[] xp = {x + w / 2, x + w, x};
        int[] yp = {y, y + h, y + h};
        return new Polygon(xp, yp, 3);
    }

    /**
     * Create trapezoid
     */
    private Shape createTrapezoid(int x, int y, int w, int h) {
        int inset = (int)(w * 0.15);
        int[] xp = {x + inset, x + w - inset, x + w, x};
        int[] yp = {y, y, y + h, y + h};
        return new Polygon(xp, yp, 4);
    }

    /**
     * Create pentagon
     */
    private Shape createPentagon(int x, int y, int w, int h) {
        int[] xp = new int[5];
        int[] yp = new int[5];
        double centerX = x + w / 2.0;
        double centerY = y + h / 2.0;
        double radius = Math.min(w, h) / 2.0;
        for (int i = 0; i < 5; i++) {
            double angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
            xp[i] = (int)(centerX + radius * Math.cos(angle));
            yp[i] = (int)(centerY + radius * Math.sin(angle));
        }
        return new Polygon(xp, yp, 5);
    }

    /**
     * Convert HSL to RGBA color
     */
    private Color hslToRgba(float h, float s, float l, float a) {
        float c = (1 - Math.abs(2 * l - 1)) * s;
        float x = c * (1 - Math.abs((h / 60) % 2 - 1));
        float m = l - c / 2;
        float r = 0, g = 0, b = 0;
        if (h < 60) { r = c; g = x; }
        else if (h < 120) { r = x; g = c; }
        else if (h < 180) { g = c; b = x; }
        else if (h < 240) { g = x; b = c; }
        else if (h < 300) { r = x; b = c; }
        else { r = c; b = x; }
        return new Color((int)((r + m) * 255), (int)((g + m) * 255), (int)((b + m) * 255), (int)(a * 255));
    }

    /**
     * Generate click captcha
     */
    private CaptchaGenerateResult generateClick(CaptchaGenerateOptions options) {
        int width = options.getWidth();
        int height = options.getHeight();
        // Auto-generate random count (3-4) if not specified
        Integer clickCountValue = options.getClickCount();
        int clickCount = (clickCountValue != null && clickCountValue > 0) ? clickCountValue : randomInt(3, 4);

        // Create background image
        BufferedImage bgImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D graphics = bgImage.createGraphics();
        graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // Generate rich background
        generateBackground(graphics, width, height);

        // Generate click texts from Chinese vocabulary
        String chars;
        if (options.getClickText() != null) {
            chars = options.getClickText();
        } else {
            String randomWord = CHINESE_WORDS[randomInt(0, CHINESE_WORDS.length - 1)];
            if (randomWord.length() >= clickCount) {
                chars = randomWord.substring(0, clickCount);
            } else {
                chars = randomWord;
                while (chars.length() < clickCount) {
                    String extraWord = CHINESE_WORDS[randomInt(0, CHINESE_WORDS.length - 1)];
                    chars += extraWord.substring(0, Math.min(clickCount - chars.length(), extraWord.length()));
                }
            }
        }

        List<String> clickTexts = new ArrayList<>();
        List<Point> targetPoints = new ArrayList<>();
        List<Point> decoyPoints = new ArrayList<>();
        List<String> decoyTexts = new ArrayList<>();

        int fontSize = 20;
        int padding = fontSize + 10;

        // Parse click texts
        for (int i = 0; i < Math.min(clickCount, chars.length()); i++) {
            clickTexts.add(String.valueOf(chars.charAt(i)));
        }

        // Generate 1-2 decoy characters
        Set<String> usedChars = new HashSet<>(clickTexts);
        int decoyCount = randomInt(1, 2);
        for (int i = 0; i < decoyCount; i++) {
            int attempts = 0;
            while (attempts < 50) {
                String randomWord = CHINESE_WORDS[randomInt(0, CHINESE_WORDS.length - 1)];
                for (char c : randomWord.toCharArray()) {
                    String ch = String.valueOf(c);
                    if (!usedChars.contains(ch)) {
                        decoyTexts.add(ch);
                        usedChars.add(ch);
                        break;
                    }
                }
                if (decoyTexts.size() > i) break;
                attempts++;
            }
        }

        // Draw click target characters
        for (int i = 0; i < clickTexts.size(); i++) {
            String ch = clickTexts.get(i);
            int x, y, attempts = 0;
            do {
                x = randomInt(padding, width - padding);
                y = randomInt(padding, height - padding);
                attempts++;
            } while (isOverlapping(x, y, fontSize, targetPoints) && attempts < 100);

            targetPoints.add(new Point(x, y));

            // Draw character
            graphics.setFont(new Font("Arial", Font.BOLD, fontSize));
            graphics.setColor(new Color(51, 51, 51)); // #333

            // Random rotation
            double rotation = Math.toRadians(randomInt(-30, 30));
            AffineTransform oldTransform = graphics.getTransform();
            graphics.rotate(rotation, x, y);
            FontMetrics fm = graphics.getFontMetrics();
            graphics.drawString(ch, x - fm.stringWidth(ch) / 2, y + fm.getAscent() / 2);
            graphics.setTransform(oldTransform);
        }

        // Draw decoy characters (lighter color)
        for (int i = 0; i < decoyTexts.size(); i++) {
            String ch = decoyTexts.get(i);
            int x, y, attempts = 0;
            List<Point> allPoints = new ArrayList<>();
            allPoints.addAll(targetPoints);
            allPoints.addAll(decoyPoints);

            do {
                x = randomInt(padding, width - padding);
                y = randomInt(padding, height - padding);
                attempts++;
            } while (isOverlapping(x, y, fontSize, allPoints) && attempts < 100);

            decoyPoints.add(new Point(x, y));

            // Draw decoy character with lighter color
            graphics.setFont(new Font("Arial", Font.PLAIN, fontSize));
            graphics.setColor(new Color(85, 85, 85)); // #555

            // Random rotation
            double rotation = Math.toRadians(randomInt(-25, 25));
            AffineTransform oldTransform = graphics.getTransform();
            graphics.rotate(rotation, x, y);
            FontMetrics fm = graphics.getFontMetrics();
            graphics.drawString(ch, x - fm.stringWidth(ch) / 2, y + fm.getAscent() / 2);
            graphics.setTransform(oldTransform);
        }

        graphics.dispose();

        // Generate captcha ID
        String captchaId = UUID.randomUUID().toString();
        long now = System.currentTimeMillis();
        long expireTime = 60000;

        // Generate click character images for prompt
        List<String> clickCharImages = new ArrayList<>();
        for (String ch : clickTexts) {
            clickCharImages.add(generateCharImage(ch));
        }

        // Create cache entry
        CaptchaCache cache = CaptchaCache.builder()
                .id(captchaId)
                .type(CaptchaType.CLICK)
                .target(targetPoints)
                .clickTexts(clickTexts)
                .createdAt(now)
                .expiresAt(now + expireTime)
                .build();

        // Create response
        CaptchaResponse response = CaptchaResponse.builder()
                .captchaId(captchaId)
                .type(CaptchaType.CLICK)
                .bgImage("data:image/png;base64," + imageToBase64(bgImage))
                .clickTexts(clickTexts)
                .clickCharImages(clickCharImages)
                .width(width)
                .height(height)
                .expiresAt(now + expireTime)
                .build();

        return new CaptchaGenerateResult(cache, response);
    }

    /**
     * Generate base64 image for a character (for prompt display)
     */
    private String generateCharImage(String ch) {
        int fontSize = 16;
        int padding = 4;
        int size = fontSize + padding * 2;

        BufferedImage image = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D graphics = image.createGraphics();
        graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        graphics.setFont(new Font("Arial", Font.BOLD, fontSize));
        graphics.setColor(new Color(25, 145, 250)); // #1991fa

        // Random slight rotation for anti-bot
        double rotation = Math.toRadians(randomInt(-10, 10));
        graphics.rotate(rotation, size / 2.0, size / 2.0);

        FontMetrics fm = graphics.getFontMetrics();
        int textX = (size - fm.stringWidth(ch)) / 2;
        int textY = (size - fm.getHeight()) / 2 + fm.getAscent();
        graphics.drawString(ch, textX, textY);

        graphics.dispose();
        return "data:image/png;base64," + imageToBase64(image);
    }

    /**
     * Check if position overlaps with existing points
     */
    private boolean isOverlapping(int x, int y, int size, List<Point> points) {
        for (Point point : points) {
            double distance = Math.sqrt(Math.pow(x - point.getX(), 2) + Math.pow(y - point.getY(), 2));
            if (distance < size * 1.5) {
                return true;
            }
        }
        return false;
    }

    /**
     * Generate random integer in range
     */
    private int randomInt(int min, int max) {
        return random.nextInt(max - min + 1) + min;
    }

    /**
     * Convert image to base64 string
     */
    private String imageToBase64(BufferedImage image) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "png", baos);
            return Base64.getEncoder().encodeToString(baos.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to convert image to base64", e);
        }
    }
}
