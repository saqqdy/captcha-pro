import type { BackendCaptchaParams, BackendCaptchaResponse, BackendConfig, BackendVerifyRequest, BackendVerifyResponse } from '@captcha-pro/mp-shared'
import { buildQueryString } from '@captcha-pro/mp-shared'
/**
 * Taro HTTP request utils for captcha backend API
 */
import Taro from '@tarojs/taro'

/** 发起 getCaptcha 请求 */
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

	let res
	try {
		res = await Taro.request({
			url,
			method: 'GET',
			header: config.headers,
			timeout: config.timeout ?? 10000,
		})
	} catch (err: unknown) {
		const msg = (err instanceof Error ? err.message : '') || (err as Record<string, unknown>)?.errMsg || String(err)
		throw new Error(`Captcha request failed: ${msg}`)
	}

	if (res.statusCode < 200 || res.statusCode >= 300) {
		throw new Error(`Captcha request failed with status ${res.statusCode}`)
	}

	return res.data as BackendCaptchaResponse
}

/** 发起 verify 请求 */
export async function verifyCaptcha(
	config: BackendConfig,
	data: BackendVerifyRequest,
): Promise<BackendVerifyResponse> {
	if (typeof config.verify === 'function') {
		return config.verify(data)
	}

	let res
	try {
		res = await Taro.request({
			url: config.verify,
			method: 'POST',
			data,
			header: { 'Content-Type': 'application/json', ...config.headers },
			timeout: config.timeout ?? 10000,
		})
	} catch (err: unknown) {
		const msg = (err instanceof Error ? err.message : '') || (err as Record<string, unknown>)?.errMsg || String(err)
		throw new Error(`Captcha verify failed: ${msg}`)
	}

	if (res.statusCode < 200 || res.statusCode >= 300) {
		throw new Error(`Captcha verify failed with status ${res.statusCode}`)
	}

	return res.data as BackendVerifyResponse
}
