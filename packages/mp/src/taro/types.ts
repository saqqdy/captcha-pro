/**
 * Taro Captcha Backend-Only Types
 * Taro 小程序端仅支持后端服务模式，backend 为必填配置
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

/** getCaptcha 响应 — 对齐 server/node 的 CaptchaResponse */
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
	/** 容器宽度（rpx），默认 650 */
	width?: number
	/** 容器高度（rpx），默认 380 */
	height?: number
	/** 滑块宽度（rpx），默认 80 */
	sliderWidth?: number
	/** 滑块高度（rpx），默认 80 */
	sliderHeight?: number
	/** 显示刷新按钮，默认 true */
	showRefresh?: boolean
	/** 后端配置（必填） */
	backend: BackendConfig
	/** 验证成功回调 */
	onSuccess?: (data?: { verifiedAt: number }) => void
	/** 验证失败回调 */
	onFail?: () => void
	/** 刷新回调 */
	onRefresh?: () => void
	/** 错误回调 */
	onError?: (err: Error) => void
}

/**
 * ClickCaptcha Props — backend 必填
 */
export interface ClickCaptchaProps {
	/** 容器宽度（rpx），默认 650 */
	width?: number
	/** 容器高度（rpx），默认 380 */
	height?: number
	/** 显示刷新按钮，默认 true */
	showRefresh?: boolean
	/** 后端配置（必填） */
	backend: BackendConfig
	/** 验证成功回调 */
	onSuccess?: (data?: { verifiedAt: number }) => void
	/** 验证失败回调 */
	onFail?: () => void
	/** 刷新回调 */
	onRefresh?: () => void
	/** 错误回调 */
	onError?: (err: Error) => void
}

/**
 * PopupCaptcha Props — backend 必填
 */
export interface PopupCaptchaProps {
	/** 验证码类型，默认 'slider' */
	type?: 'slider' | 'click'
	/** 弹窗标题 */
	title?: string
	/** 点击遮罩关闭，默认 true */
	maskClosable?: boolean
	/** 显示关闭按钮，默认 true */
	showClose?: boolean
	/** 验证成功自动关闭，默认 true */
	autoClose?: boolean
	/** 自动关闭延迟（ms），默认 500 */
	closeDelay?: number
	/** SliderCaptcha 配置（不含 backend） */
	sliderOptions?: Omit<SliderCaptchaProps, 'backend'>
	/** ClickCaptcha 配置（不含 backend） */
	clickOptions?: Omit<ClickCaptchaProps, 'backend'>
	/** 后端配置（必填） */
	backend: BackendConfig
	/** 验证成功回调 */
	onSuccess?: (data?: { verifiedAt: number }) => void
	/** 验证失败回调 */
	onFail?: () => void
	/** 弹窗打开回调 */
	onOpen?: () => void
	/** 弹窗关闭回调 */
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
