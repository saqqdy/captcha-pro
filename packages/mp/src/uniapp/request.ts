/**
 * uni-app HTTP request utils for captcha backend API
 */
import type {
	BackendCaptchaParams,
	BackendCaptchaResponse,
	BackendConfig,
	BackendVerifyRequest,
	BackendVerifyResponse,
} from './types'

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

	return new Promise((resolve, reject) => {
		uni.request({
			url,
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

	return new Promise((resolve, reject) => {
		uni.request({
			url: config.verify as string,
			method: 'POST',
			data,
			header: { 'Content-Type': 'application/json', ...config.headers },
			timeout: config.timeout ?? 10000,
			success: (r: { data: BackendVerifyResponse }) => resolve(r.data),
			fail: reject,
		})
	})
}

function buildQueryString(params: Record<string, unknown>): string {
	const parts = Object.entries(params)
		.filter(([, v]) => v !== undefined && v !== null && v !== '')
		.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
	return parts.length ? `?${parts.join('&')}` : ''
}
