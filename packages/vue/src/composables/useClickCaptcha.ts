import type { Ref } from 'vue'
import {
  type BackendVerifyOptions,
  type CaptchaData,
  type CaptchaStatistics,
  ClickCaptcha as ClickCaptchaCore,
  type ClickCaptchaInstance,
  type ClickCaptchaOptions,
} from '@captcha-pro/core'
import { onMounted, onUnmounted, ref, watch } from 'vue'

export interface UseClickCaptchaOptions {
  el: () => HTMLElement | undefined
  width?: number
  height?: number
  bgImage?: string
  count?: number
  showRefresh?: boolean
  verifyMode?: 'frontend' | 'backend'
  locale?: 'zh-CN' | 'en-US'
  secretKey?: string
  backendVerify?: BackendVerifyOptions
  onSuccess?: () => void
  onFail?: () => void
  onRefresh?: () => void
  onError?: (err: Error) => void
}

export function useClickCaptcha(options: UseClickCaptchaOptions): {
  instance: Ref<ClickCaptchaInstance | null>
  isReady: Ref<boolean>
  refresh: () => void
  getData: () => CaptchaData | undefined
  getStatistics: () => CaptchaStatistics | undefined
  destroy: () => void
} {
  const instance = ref<ClickCaptchaInstance | null>(null)
  const isReady = ref(false)

  const init = (): void => {
    const container = options.el()
    if (!container) return

    const coreOptions: ClickCaptchaOptions = {
      el: container,
      width: options.width,
      height: options.height,
      bgImage: options.bgImage,
      count: options.count,
      showRefresh: options.showRefresh,
      verifyMode: options.verifyMode,
      locale: options.locale,
      security: options.secretKey ? { secretKey: options.secretKey } : undefined,
      backendVerify: options.backendVerify,
      onSuccess: () => options.onSuccess?.(),
      onFail: () => options.onFail?.(),
      onRefresh: () => options.onRefresh?.(),
    }

    instance.value = new ClickCaptchaCore(coreOptions) as ClickCaptchaInstance
    isReady.value = true
  }

  const refresh = (): void => instance.value?.refresh()
  const getData = (): CaptchaData | undefined => instance.value?.getData()
  const getStatistics = (): CaptchaStatistics | undefined => instance.value?.getStatistics()

  const destroy = (): void => {
    instance.value?.destroy()
    instance.value = null
    isReady.value = false
  }

  if (options.bgImage) {
    watch(() => options.bgImage, () => refresh())
  }

  onMounted(() => init())
  onUnmounted(() => destroy())

  return { instance, isReady, refresh, getData, getStatistics, destroy }
}
