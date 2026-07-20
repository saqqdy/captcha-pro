/**
 * Mini-program Captcha Shared Utilities
 */

/**
 * 将参数对象序列化为 URL 查询字符串
 * 过滤掉 undefined / null / 空字符串的值
 */
export function buildQueryString(params: Record<string, unknown>): string {
	const parts = Object.entries(params)
		.filter(([, v]) => v !== undefined && v !== null && v !== '')
		.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
	return parts.length ? `?${parts.join('&')}` : ''
}
