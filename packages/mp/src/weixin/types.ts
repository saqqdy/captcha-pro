/**
 * WeChat Mini-program Captcha Backend-Only Types
 * 微信小程序端仅支持后端服务模式，backend 为必填配置
 */
import type { CaptchaType, Point } from '@captcha/core'

/**
 * 后端 API 配置（必填）
 */
export interface BackendConfig {
	/** 获取验证码的 URL 或自定义函数 */
	getCaptcha: string | ((params?: BackendCaptchaParams) => Promise<BackendCaptchaResponse>)
	/** 验证验证码的 URL 或自定义函数 */
	verify: string | ((data: BackendVerifyRequest) => Promise<BackendVerifyResponse>)
	/** 请求头 */
	headers?: Record<string, string>
	/** 超时时间（ms），默认 10000 */
	timeout?: number
}

/** getCaptcha 请求参数 */
export interface BackendCaptchaParams {
	type: CaptchaType
	width?: number
	height?: number
	sliderWidth?: number
	sliderHeight?: number
	clickCount?: number
}

/** getCaptcha 响应 */
export interface BackendCaptchaResponse {
	success: boolean
	data: {
		captchaId: string
		type: CaptchaType
		bgImage: string
		sliderImage?: string
		sliderY?: number
		clickTexts?: string[]
		clickCharImages?: string[]
		width: number
		height: number
		expiresAt: number
	}
	message?: string
}

/** verify 请求体 */
export interface BackendVerifyRequest {
	captchaId: string
	type: CaptchaType
	target: number[] | Point[]
}

/** verify 响应 */
export interface BackendVerifyResponse {
	success: boolean
	message?: string
	data?: { verifiedAt: number }
}

/**
 * SliderCaptcha Props — backend 必填
 */
export interface SliderCaptchaProps {
	width?: number
	height?: number
	sliderWidth?: number
	sliderHeight?: number
	showRefresh?: boolean
	backend: BackendConfig
	onSuccess?: (data?: { verifiedAt: number }) => void
	onFail?: () => void
	onRefresh?: () => void
	onError?: (err: Error) => void
}

/**
 * ClickCaptcha Props — backend 必填
 */
export interface ClickCaptchaProps {
	width?: number
	height?: number
	showRefresh?: boolean
	backend: BackendConfig
	onSuccess?: (data?: { verifiedAt: number }) => void
	onFail?: () => void
	onRefresh?: () => void
	onError?: (err: Error) => void
}

/**
 * PopupCaptcha Props — backend 必填
 */
export interface PopupCaptchaProps {
	type?: 'slider' | 'click'
	title?: string
	maskClosable?: boolean
	showClose?: boolean
	autoClose?: boolean
	closeDelay?: number
	sliderOptions?: Omit<SliderCaptchaProps, 'backend'>
	clickOptions?: Omit<ClickCaptchaProps, 'backend'>
	backend: BackendConfig
	onSuccess?: (data?: { verifiedAt: number }) => void
	onFail?: () => void
	onOpen?: () => void
	onClose?: () => void
}

/** SliderCaptcha 实例方法 */
export interface SliderCaptchaRef {
	refresh: () => void
}

/** ClickCaptcha 实例方法 */
export interface ClickCaptchaRef {
	refresh: () => void
}

/** PopupCaptcha 实例方法 */
export interface PopupCaptchaRef {
	show: () => void
	hide: () => void
	isVisible: () => boolean
}
