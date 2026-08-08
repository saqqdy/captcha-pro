package com.captcha.pro.core

import android.graphics.*
import android.util.Base64
import java.io.ByteArrayOutputStream
import java.net.HttpURLConnection
import java.net.URL
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

/**
 * Captcha generator for Android - Backend only
 */
class CaptchaGenerator {

    private var currentCaptchaId: String? = null
    private var currentTimestamp: Long = 0

    /**
     * Generate captcha from backend
     */
    suspend fun generate(options: CaptchaOptions): CaptchaResult {
        val response = resolveGetCaptcha(options)

        val data = response.data
        currentCaptchaId = data.captchaId
        currentTimestamp = data.timestamp ?: System.currentTimeMillis()

        val bgBitmap = withContext(Dispatchers.IO) {
            loadImageFromUrlOrBase64(data.bgImage)
        }

        val sliderBitmap = data.sliderImage?.let { sliderUrl ->
            withContext(Dispatchers.IO) {
                loadImageFromUrlOrBase64(sliderUrl)
            }
        }

        val targetPoints = mutableListOf<CaptchaPoint>()
        data.sliderY?.let { y ->
            targetPoints.add(CaptchaPoint(x = 0f, y = y, text = null))
        }

        return CaptchaResult(
            bgBitmap = bgBitmap,
            sliderBitmap = sliderBitmap,
            targetPoints = targetPoints,
            sliderY = data.sliderY ?: 0f,
            clickTexts = data.clickTexts,
            clickCharImages = data.clickCharImages,
            captchaId = data.captchaId,
            timestamp = currentTimestamp
        )
    }

    /**
     * Resolve getCaptcha endpoint: URL -> HTTP GET, Fn -> invoke.
     */
    private suspend fun resolveGetCaptcha(options: CaptchaOptions): BackendCaptchaResponse =
        withContext(Dispatchers.IO) {
            when (val ep = options.backendVerify.getCaptcha) {
                is GetCaptchaEndpoint.Url -> parseCaptchaResponse(
                    httpGetJson(buildCaptchaUrl(ep.url, options), options.backendVerify.headers, options.backendVerify.timeout)
                )
                is GetCaptchaEndpoint.Fn -> ep.fn()
            }
        }

    /**
     * Build getCaptcha URL with query params (type/width/height + slider|click dims).
     * Mirrors taro-vue BackendCaptchaParams query.
     */
    private fun buildCaptchaUrl(base: String, options: CaptchaOptions): String {
        val params = linkedMapOf(
            "type" to options.type.name.lowercase(),
            "width" to options.width.toString(),
            "height" to options.height.toString()
        )
        when (options.type) {
            CaptchaType.SLIDER -> {
                params["sliderWidth"] = options.sliderWidth.toString()
                params["sliderHeight"] = options.sliderHeight.toString()
            }
            CaptchaType.CLICK -> {
                params["clickCount"] = options.clickCount.toString()
            }
        }
        val query = params.entries.joinToString("&") { (k, v) -> "$k=$v" }
        val sep = if (base.contains("?")) "&" else "?"
        return "$base$sep$query"
    }

    /**
     * Resolve verify endpoint: URL -> HTTP POST, Fn -> invoke.
     */
    private suspend fun resolveVerify(data: CaptchaData, options: CaptchaOptions): BackendVerifyResponse =
        withContext(Dispatchers.IO) {
            when (val ep = options.backendVerify.verify) {
                is VerifyEndpoint.Url -> parseVerifyResponse(
                    httpPostJson(ep.url, serializeCaptchaData(data), options.backendVerify.headers, options.backendVerify.timeout)
                )
                is VerifyEndpoint.Fn -> ep.fn(data)
            }
        }

    private fun httpGetJson(url: String, headers: Map<String, String>?, timeout: Long): String {
        val conn = (URL(url).openConnection() as HttpURLConnection).apply {
            connectTimeout = timeout.toInt()
            readTimeout = timeout.toInt()
            requestMethod = "GET"
            headers?.forEach { (k, v) -> setRequestProperty(k, v) }
            setRequestProperty("Accept", "application/json")
        }
        try {
            return conn.inputStream.bufferedReader().use { it.readText() }
        } finally {
            conn.disconnect()
        }
    }

    private fun httpPostJson(url: String, body: String, headers: Map<String, String>?, timeout: Long): String {
        val conn = (URL(url).openConnection() as HttpURLConnection).apply {
            connectTimeout = timeout.toInt()
            readTimeout = timeout.toInt()
            requestMethod = "POST"
            doOutput = true
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("Accept", "application/json")
            headers?.forEach { (k, v) -> setRequestProperty(k, v) }
        }
        try {
            conn.outputStream.bufferedWriter().use { it.write(body) }
            return conn.inputStream.bufferedReader().use { it.readText() }
        } finally {
            conn.disconnect()
        }
    }

    private fun parseCaptchaResponse(json: String): BackendCaptchaResponse {
        val obj = JSONObject(json)
        val success = obj.optBoolean("success", true)
        if (!success) throw RuntimeException(obj.optString("message", "Failed to get captcha"))
        val dataObj = obj.optJSONObject("data") ?: obj
        val data = CaptchaResponseData(
            captchaId = dataObj.getString("captchaId"),
            bgImage = dataObj.getString("bgImage"),
            sliderImage = dataObj.optString("sliderImage").takeIf { it.isNotEmpty() },
            sliderY = dataObj.optDouble("sliderY").takeIf { !it.isNaN() }?.toFloat(),
            clickTexts = dataObj.optJSONArray("clickTexts")?.let { arr -> List(arr.length()) { arr.getString(it) } },
            clickCharImages = dataObj.optJSONArray("clickCharImages")?.let { arr -> List(arr.length()) { arr.getString(it) } },
            width = dataObj.optInt("width").takeIf { it != 0 },
            height = dataObj.optInt("height").takeIf { it != 0 },
            timestamp = dataObj.optDouble("timestamp").takeIf { it > 0 }?.toLong()
        )
        return BackendCaptchaResponse(data)
    }

    private fun parseVerifyResponse(json: String): BackendVerifyResponse {
        val obj = JSONObject(json)
        return BackendVerifyResponse(
            success = obj.optBoolean("success", false),
            message = obj.optString("message").takeIf { it.isNotEmpty() },
            data = obj.optJSONObject("data")?.let { d -> d.keys().asSequence().associateWith { d.get(it) } }
        )
    }

    private fun serializeCaptchaData(data: CaptchaData): String {
        val obj = JSONObject()
        obj.put("captchaId", data.captchaId)
        obj.put("type", when (data.type) {
            CaptchaType.SLIDER -> "slider"
            CaptchaType.CLICK -> "click"
        })
        val targetArr = JSONArray()
        data.target.forEach { item ->
            when (item) {
                is Float -> targetArr.put(item.toDouble())
                is Int -> targetArr.put(item)
                is Double -> targetArr.put(item)
                is CaptchaPoint -> {
                    val p = JSONObject()
                    p.put("x", item.x); p.put("y", item.y)
                    item.text?.let { p.put("text", it) }
                    targetArr.put(p)
                }
                else -> targetArr.put(item.toString())
            }
        }
        obj.put("target", targetArr)
        return obj.toString()
    }

    /**
     * Load image from URL or base64 string (public for views rendering char images)
     */
    fun loadImage(source: String): Bitmap = loadImageFromUrlOrBase64(source)

    /**
     * Load image from URL or base64 string
     */
    private fun loadImageFromUrlOrBase64(source: String): Bitmap {
        return when {
            source.startsWith("http://") || source.startsWith("https://") -> {
                URL(source).openStream().use { BitmapFactory.decodeStream(it) }
            }
            source.startsWith("data:image") -> {
                val base64Data = source.substringAfter(",")
                val bytes = Base64.decode(base64Data, Base64.DEFAULT)
                BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
            }
            else -> {
                try {
                    val bytes = Base64.decode(source, Base64.DEFAULT)
                    BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                } catch (e: Exception) {
                    throw IllegalArgumentException("Invalid image source: $source")
                }
            }
        }
    }

    /**
     * Get captcha data for verification.
     * target is polymorphic: SLIDER -> [sliderX] (Float); CLICK -> targetPoints.
     * Mirrors taro-vue target: number[] | Point[]
     */
    fun getCaptchaData(type: CaptchaType, targetPoints: List<CaptchaPoint> = emptyList(), sliderX: Float = 0f): CaptchaData {
        val target: List<Any> = when (type) {
            CaptchaType.SLIDER -> listOf(sliderX)
            CaptchaType.CLICK -> targetPoints
        }
        return CaptchaData(
            type = type,
            captchaId = currentCaptchaId ?: "",
            target = target,
            timestamp = currentTimestamp
        )
    }

    /**
     * Backend verify - resolve endpoint (URL -> HTTP, Fn -> invoke)
     */
    suspend fun backendVerify(data: CaptchaData, options: CaptchaOptions): BackendVerifyResponse {
        return resolveVerify(data, options)
    }

    /**
     * Convert bitmap to base64 string
     */
    fun bitmapToBase64(bitmap: Bitmap): String {
        val output = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, output)
        val bytes = output.toByteArray()
        return "data:image/png;base64," + Base64.encodeToString(bytes, Base64.NO_WRAP)
    }
}
