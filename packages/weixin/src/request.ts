/* global wx */
/**
 * WeChat HTTP request utils for captcha backend API
 */
import type {
	BackendCaptchaParams,
	BackendCaptchaResponse,
	BackendConfig,
	BackendVerifyRequest,
	BackendVerifyResponse,
} from '@captcha-pro/mp-shared'
import { buildQueryString } from '@captcha-pro/mp-shared'

/** 发起 getCaptcha 请求 */
export async function fetchCaptcha(
	config: BackendConfig,
	params: BackendCaptchaParams,
): Promise<BackendCaptchaResponse> {
	if (typeof config.getCaptcha === 'function') {
		return config.getCaptcha(params)
	}

	const url = config.getCaptcha
	if (typeof url !== 'string') {
		return Promise.reject(new Error('backend.getCaptcha must be a URL string or function'))
	}

	const queryString = buildQueryString({
		type: params.type,
		width: params.width,
		height: params.height,
		sliderWidth: params.sliderWidth,
		sliderHeight: params.sliderHeight,
		clickCount: params.clickCount,
	})

	return new Promise((resolve, reject) => {
		wx.request({
			url: `${url}${queryString}`,
			method: 'GET',
			header: config.headers,
			timeout: config.timeout ?? 10000,
			success: (r: { data: BackendCaptchaResponse }) => resolve(r.data),
			fail: reject,
		})
	})
}

/** 发起 verify 请求 */
export async function verifyCaptcha(
	config: BackendConfig,
	data: BackendVerifyRequest,
): Promise<BackendVerifyResponse> {
	if (typeof config.verify === 'function') {
		return config.verify(data)
	}

	const url = config.verify
	if (typeof url !== 'string') {
		return Promise.reject(new Error('backend.verify must be a URL string or function'))
	}

	return new Promise((resolve, reject) => {
		wx.request({
			url,
			method: 'POST',
			data,
			header: { 'Content-Type': 'application/json', ...config.headers },
			timeout: config.timeout ?? 10000,
			success: (r: { data: BackendVerifyResponse }) => resolve(r.data),
			fail: reject,
		})
	})
}
