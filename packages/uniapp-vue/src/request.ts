import type { BackendCaptchaParams, BackendCaptchaResponse, BackendConfig, BackendVerifyRequest, BackendVerifyResponse } from '@captcha-pro/mp-shared'
import { buildQueryString } from '@captcha-pro/mp-shared'
/**
 * uni-app HTTP request utils for captcha backend API
 *
 * Uses uni.request() wrapped in Promises for async/await compatibility.
 */

/** Send getCaptcha request */
export async function fetchCaptcha(
	config: BackendConfig,
	params: BackendCaptchaParams,
): Promise<BackendCaptchaResponse> {
	if (typeof config.getCaptcha === 'function') {
		return config.getCaptcha(params)
	}

	const queryString = buildQueryString({
		type: params.type,
		width: params.width,
		height: params.height,
		sliderWidth: params.sliderWidth,
		sliderHeight: params.sliderHeight,
		clickCount: params.clickCount,
	})
	const url = `${config.getCaptcha}${queryString}`

	return new Promise<BackendCaptchaResponse>((resolve, reject) => {
		uni.request({
			url,
			method: 'GET',
			header: config.headers,
			timeout: config.timeout ?? 10000,
			success: (res) => {
				if (res.statusCode < 200 || res.statusCode >= 300) {
					reject(new Error(`Captcha request failed with status ${res.statusCode}`))
					return
				}
				resolve(res.data as BackendCaptchaResponse)
			},
			fail: (err) => {
				const msg = err.errMsg || String(err)
				reject(new Error(`Captcha request failed: ${msg}`))
			},
		})
	})
}

/** Send verify request */
export async function verifyCaptcha(
	config: BackendConfig,
	data: BackendVerifyRequest,
): Promise<BackendVerifyResponse> {
	if (typeof config.verify === 'function') {
		return config.verify(data)
	}

	return new Promise<BackendVerifyResponse>((resolve, reject) => {
		uni.request({
			url: config.verify as string,
			method: 'POST',
			data,
			header: { 'Content-Type': 'application/json', ...config.headers },
			timeout: config.timeout ?? 10000,
			success: (res) => {
				if (res.statusCode < 200 || res.statusCode >= 300) {
					reject(new Error(`Captcha verify failed with status ${res.statusCode}`))
					return
				}
				resolve(res.data as BackendVerifyResponse)
			},
			fail: (err) => {
				const msg = err.errMsg || String(err)
				reject(new Error(`Captcha verify failed: ${msg}`))
			},
		})
	})
}
