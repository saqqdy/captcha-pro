package com.captcha.pro.service;

import com.captcha.pro.model.*;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.List;

/**
 * Captcha generator service
 */
public class CaptchaGenerator {

    private final Random random = new Random();

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
            case ROTATE -> generateRotate(options);
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

        // Create background image
        BufferedImage bgImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D bgGraphics = bgImage.createGraphics();
        bgGraphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // Fill background
        bgGraphics.setColor(Color.LIGHT_GRAY);
        bgGraphics.fillRect(0, 0, width, height);

        // Add random shapes
        for (int i = 0; i < 20; i++) {
            bgGraphics.setColor(new Color(
                    randomInt(100, 200),
                    randomInt(100, 200),
                    randomInt(100, 200),
                    80
            ));
            bgGraphics.fillOval(randomInt(0, width), randomInt(0, height), randomInt(10, 30), randomInt(10, 30));
        }

        // Random target position
        int targetX = randomInt(sliderWidth + 20, width - sliderWidth - 20);
        int targetY = randomInt(20, height - sliderHeight - 20);

        // Create slider image
        BufferedImage sliderImage = new BufferedImage(sliderWidth, sliderHeight, BufferedImage.TYPE_INT_ARGB);
        Graphics2D sliderGraphics = sliderImage.createGraphics();
        sliderGraphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // Copy background area to slider
        for (int y = 0; y < sliderHeight; y++) {
            for (int x = 0; x < sliderWidth; x++) {
                int bgX = targetX + x;
                int bgY = targetY + y;
                if (bgX < width && bgY < height) {
                    sliderImage.setRGB(x, y, bgImage.getRGB(bgX, bgY));
                }
            }
        }

        // Draw puzzle shape mask
        drawPuzzleMask(bgGraphics, targetX, targetY, sliderWidth, sliderHeight, false);
        drawPuzzleMask(sliderGraphics, 0, 0, sliderWidth, sliderHeight, true);

        // Clear puzzle area on background
        bgGraphics.setComposite(AlphaComposite.Clear);
        drawPuzzleMask(bgGraphics, targetX, targetY, sliderWidth, sliderHeight, true);
        bgGraphics.setComposite(AlphaComposite.SrcOver);

        // Draw puzzle outline
        bgGraphics.setColor(Color.WHITE);
        bgGraphics.setStroke(new BasicStroke(2));
        drawPuzzleMask(bgGraphics, targetX, targetY, sliderWidth, sliderHeight, false);

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
     * Generate click captcha
     */
    private CaptchaGenerateResult generateClick(CaptchaGenerateOptions options) {
        int width = options.getWidth();
        int height = options.getHeight();
        int clickCount = options.getClickCount();

        // Create background image
        BufferedImage bgImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = bgImage.createGraphics();
        graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // Fill background
        graphics.setColor(Color.LIGHT_GRAY);
        graphics.fillRect(0, 0, width, height);

        // Add random shapes
        for (int i = 0; i < 30; i++) {
            graphics.setColor(new Color(
                    randomInt(100, 200),
                    randomInt(100, 200),
                    randomInt(100, 200),
                    80
            ));
            graphics.fillOval(randomInt(0, width), randomInt(0, height), randomInt(10, 30), randomInt(10, 30));
        }

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
            graphics.setColor(Color.DARK_GRAY);

            // Random rotation
            double rotation = Math.toRadians(randomInt(-30, 30));
            graphics.rotate(rotation, x, y);
            graphics.drawString(ch, x, y);
            graphics.rotate(-rotation, x, y);
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
            graphics.rotate(rotation, x, y);
            graphics.drawString(ch, x, y);
            graphics.rotate(-rotation, x, y);
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
     * Generate rotate captcha
     */
    private CaptchaGenerateResult generateRotate(CaptchaGenerateOptions options) {
        int width = options.getWidth();
        int height = options.getHeight();
        int size = Math.min(width, height);
        int centerX = width / 2;
        int centerY = height / 2;

        // Create image
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = image.createGraphics();
        graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // Generate random angles
        double targetAngle = randomInt(0, 360);
        double currentAngle = randomInt(0, 360);

        // Generate colorful pattern
        GradientPaint gradient = new GradientPaint(
                centerX, centerY, new Color(randomInt(0, 255), randomInt(0, 255), randomInt(0, 255)),
                centerX + size / 2, centerY + size / 2, new Color(randomInt(0, 255), randomInt(0, 255), randomInt(0, 255))
        );

        graphics.rotate(Math.toRadians(currentAngle), centerX, centerY);

        // Draw background circle
        graphics.setPaint(gradient);
        graphics.fillOval(centerX - size / 2 + 10, centerY - size / 2 + 10, size - 20, size - 20);

        // Draw arrow indicator
        graphics.setColor(Color.WHITE);
        int[] xPoints = {centerX, centerX - 15, centerX + 15};
        int[] yPoints = {centerY - size / 2 + 30, centerY - size / 2 + 50, centerY - size / 2 + 50};
        graphics.fillPolygon(xPoints, yPoints, 3);

        // Draw center circle
        graphics.setColor(Color.WHITE);
        graphics.fillOval(centerX - 20, centerY - 20, 40, 40);

        graphics.dispose();

        // Generate captcha ID
        String captchaId = UUID.randomUUID().toString();
        long now = System.currentTimeMillis();
        long expireTime = 60000;

        // Create cache entry
        CaptchaCache cache = CaptchaCache.builder()
                .id(captchaId)
                .type(CaptchaType.ROTATE)
                .target(List.of(targetAngle))
                .targetAngle(targetAngle)
                .createdAt(now)
                .expiresAt(now + expireTime)
                .build();

        // Create response
        CaptchaResponse response = CaptchaResponse.builder()
                .captchaId(captchaId)
                .type(CaptchaType.ROTATE)
                .bgImage("data:image/png;base64," + imageToBase64(image))
                .targetAngle(targetAngle)
                .width(width)
                .height(height)
                .expiresAt(now + expireTime)
                .build();

        return new CaptchaGenerateResult(cache, response);
    }

    /**
     * Draw puzzle mask shape
     */
    private void drawPuzzleMask(Graphics2D g, int x, int y, int w, int h, boolean fill) {
        int notchSize = 10;

        Polygon polygon = new Polygon();
        polygon.addPoint(x + 5, y);
        polygon.addPoint(x + w - 5, y);
        polygon.addPoint(x + w, y + 5);
        polygon.addPoint(x + w, y + h / 2 - notchSize / 2);
        polygon.addPoint(x + w + notchSize, y + h / 2);
        polygon.addPoint(x + w, y + h / 2 + notchSize / 2);
        polygon.addPoint(x + w, y + h - 5);
        polygon.addPoint(x + w - 5, y + h);
        polygon.addPoint(x + w / 2 + notchSize, y + h);
        polygon.addPoint(x + w / 2, y + h + notchSize);
        polygon.addPoint(x + w / 2 - notchSize, y + h);
        polygon.addPoint(x + 5, y + h);
        polygon.addPoint(x, y + h - 5);
        polygon.addPoint(x, y + 5);

        if (fill) {
            g.fill(polygon);
        } else {
            g.draw(polygon);
        }
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
     * Generate random string
     */
    private String randomString(int length) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(CHARS.charAt(randomInt(0, CHARS.length() - 1)));
        }
        return sb.toString();
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
