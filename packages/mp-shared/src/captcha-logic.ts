/**
 * Mini-program Captcha Shared Logic
 *
 * 平台无关的状态结构和异步操作。
 * 各框架（Vue composable / React hook）只需用响应式系统包裹 state 对象即可。
 *
 * 不包含触摸交互逻辑（uni-app 用手动 touch，Taro 用 MovableView，差异较大）。
 */
import type {
	BackendCaptchaParams,
	BackendCaptchaResponse,
	BackendConfig,
	BackendVerifyRequest,
	BackendVerifyResponse,
	Point,
} from './types'
import { FAIL_REFRESH_DELAY } from './constants'

// ============================================================
// State Structure
// ============================================================

/** 所有平台共用的验证码状态 */
export interface CaptchaState {
	/** 背景图 URL/base64 */
	bgImage: string
	/** 滑块图 URL/base64 */
	sliderImage: string
	/** 滑块 Y 坐标（rpx 或 px，由调用方决定） */
	sliderY: number
	/** 滑块 X 偏移（拖拽距离） */
	sliderX: number
	/** 验证码 ID */
	captchaId: string
	/** 验证状态 */
	status: '' | 'success' | 'fail'
	/** 加载中 */
	loading: boolean
	/** 错误信息 */
	errorMsg: string
}

export function createInitialCaptchaState(): CaptchaState {
	return {
		bgImage: '',
		sliderImage: '',
		sliderY: 0,
		sliderX: 0,
		captchaId: '',
		status: '',
		loading: false,
		errorMsg: '',
	}
}

// ============================================================
// Async Operations
// ============================================================

/**
 * 加载验证码 — 直接修改 state 对象
 *
 * @param state        响应式状态对象（Vue reactive / React setState 包裹后的可变引用）
 * @param config       后端配置
 * @param params       请求参数
 * @param fetchCaptcha 平台对应的 fetchCaptcha 函数
 * @param onError      错误回调（可选）
 */
export async function loadCaptcha<State extends CaptchaState>(
	state: State,
	config: BackendConfig,
	params: BackendCaptchaParams,
	fetchCaptcha: (config: BackendConfig, params: BackendCaptchaParams) => Promise<BackendCaptchaResponse>,
	onError?: (err: Error) => void,
): Promise<void> {
	state.loading = true
	state.errorMsg = ''
	state.status = ''
	state.sliderX = 0

	try {
		const res = await fetchCaptcha(config, params)
		if (!res.success || !res.data) {
			throw new Error(res.message || 'Failed to get captcha')
		}
		state.captchaId = res.data.captchaId
		state.bgImage = res.data.bgImage
		state.sliderImage = res.data.sliderImage ?? ''
		state.sliderY = res.data.sliderY ?? 0
	} catch (err) {
		const error = err instanceof Error ? err : new Error(typeof err === 'object' && err !== null ? JSON.stringify(err) : String(err))
		state.errorMsg = error.message
		onError?.(error)
	} finally {
		state.loading = false
	}
}

/**
 * 验证滑块验证码 — 直接修改 state 对象
 */
export async function verifySlider<State extends CaptchaState>(
	state: State,
	config: BackendConfig,
	verifyCaptcha: (config: BackendConfig, data: BackendVerifyRequest) => Promise<BackendVerifyResponse>,
	onSuccess?: (data?: { verifiedAt: number }) => void,
	onFail?: () => void,
	onRefresh?: () => void,
	onError?: (err: Error) => void,
): Promise<void> {
	if (state.status || state.loading || !state.captchaId) return

	state.loading = true
	try {
		const res = await verifyCaptcha(config, {
			captchaId: state.captchaId,
			type: 'slider',
			target: [state.sliderX],
		})
		if (res.success) {
			state.status = 'success'
			onSuccess?.(res.data)
		} else {
			state.status = 'fail'
			onFail?.()
			scheduleReload(state, onRefresh)
		}
	} catch (err) {
		const error = err instanceof Error ? err : new Error(typeof err === 'object' && err !== null ? JSON.stringify(err) : String(err))
		onError?.(error)
		state.status = 'fail'
		scheduleReload(state, onRefresh)
	} finally {
		state.loading = false
	}
}

/**
 * 验证点击验证码 — 直接修改 state 对象
 */
export async function verifyClick<State extends CaptchaState>(
	state: State,
	config: BackendConfig,
	clickPoints: Point[],
	verifyCaptcha: (config: BackendConfig, data: BackendVerifyRequest) => Promise<BackendVerifyResponse>,
	onSuccess?: (data?: { verifiedAt: number }) => void,
	onFail?: () => void,
	onRefresh?: () => void,
	onError?: (err: Error) => void,
): Promise<void> {
	if (state.status || state.loading || !state.captchaId) return

	state.loading = true
	try {
		const res = await verifyCaptcha(config, {
			captchaId: state.captchaId,
			type: 'click',
			target: clickPoints,
		})
		if (res.success) {
			state.status = 'success'
			onSuccess?.(res.data)
		} else {
			state.status = 'fail'
			onFail?.()
			scheduleReload(state, onRefresh)
		}
	} catch (err) {
		const error = err instanceof Error ? err : new Error(typeof err === 'object' && err !== null ? JSON.stringify(err) : String(err))
		onError?.(error)
		state.status = 'fail'
		scheduleReload(state, onRefresh)
	} finally {
		state.loading = false
	}
}

/** 重置可复位的状态（不清除 bgImage 等已加载数据） */
export function resetCaptcha<State extends CaptchaState>(state: State): void {
	state.sliderX = 0
	state.status = ''
	state.errorMsg = ''
}

// ============================================================
// Internal Helpers
// ============================================================

function scheduleReload<State extends CaptchaState>(state: State, onRefresh?: () => void): void {
	setTimeout(() => {
		resetCaptcha(state)
		onRefresh?.()
	}, FAIL_REFRESH_DELAY)
}
