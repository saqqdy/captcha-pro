package com.captcha.pro.service;

import com.captcha.pro.model.CaptchaCache;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Memory cache store for captcha data
 */
public class CaptchaCache {

    private final Map<String, CaptchaCache> store = new ConcurrentHashMap<>();
    private final Map<String, Long> timers = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    /**
     * Get captcha data by ID
     */
    public CaptchaCache get(String key) {
        return store.get(key);
    }

    /**
     * Set captcha data with TTL
     */
    public void set(String key, CaptchaCache value, long ttl) {
        // Clear existing timer if any
        Long existingTimer = timers.get(key);
        if (existingTimer != null) {
            // Cancel scheduled task (we track by removing from timers map)
            timers.remove(key);
        }

        // Store value
        store.put(key, value);

        // Schedule auto-expire
        scheduler.schedule(() -> delete(key), ttl, TimeUnit.MILLISECONDS);
        timers.put(key, System.currentTimeMillis() + ttl);
    }

    /**
     * Delete captcha data
     */
    public void delete(String key) {
        store.remove(key);
        timers.remove(key);
    }

    /**
     * Check if key exists
     */
    public boolean has(String key) {
        return store.containsKey(key);
    }

    /**
     * Clear all cache
     */
    public void clear() {
        store.clear();
        timers.clear();
    }

    /**
     * Get cache size
     */
    public int size() {
        return store.size();
    }
}
