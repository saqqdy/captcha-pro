package com.captcha.pro.service;

import com.captcha.pro.model.*;
import org.springframework.stereotype.Service;

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
@Service
public class CaptchaGenerator {

    private final Random random = new Random();
    private static final String CHARS = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";

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

        // Generate click texts
        String chars = options.getClickText() != null ? options.getClickText() : randomString(clickCount);
        List<String> clickTexts = new ArrayList<>();
        List<Point> targetPoints = new ArrayList<>();

        int fontSize = 20;
        int padding = fontSize + 10;

        for (int i = 0; i < Math.min(clickCount, chars.length()); i++) {
            String ch = String.valueOf(chars.charAt(i));
            clickTexts.add(ch);

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

        graphics.dispose();

        // Generate captcha ID
        String captchaId = UUID.randomUUID().toString();
        long now = System.currentTimeMillis();
        long expireTime = 60000;

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
                .width(width)
                .height(height)
                .expiresAt(now + expireTime)
                .build();

        return new CaptchaGenerateResult(cache, response);
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
