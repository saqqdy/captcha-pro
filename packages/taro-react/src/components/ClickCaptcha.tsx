import type { ClickCaptchaProps, ClickCaptchaRef, Point } from '../types'
import { Image, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { For, Show } from 'solid-js'
import { fetchCaptcha, verifyCaptcha } from '../request'
import '../styles/captcha.scss'

const ClickCaptcha = forwardRef<ClickCaptchaRef, ClickCaptchaProps>(({
  width = 650, height = 380, showRefresh = true, backend, onSuccess, onFail, onRefresh, onError,
}, ref) => {
  const [captchaId, setCaptchaId] = useState('')
  const [bgImage, setBgImage] = useState('')
  const [clickTexts, setClickTexts] = useState<string[]>([])
  const [clickCharImages, setClickCharImages] = useState<string[]>([])
  const [status, setStatus] = useState<'' | 'success' | 'fail'>('')
  const [clickMarkers, setClickMarkers] = useState<Array<Point & { index: number }>>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const loadSeqRef = useRef(0)
  const onSuccessRef = useRef(onSuccess)
  const onFailRef = useRef(onFail)
  const onRefreshRef = useRef(onRefresh)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onSuccessRef.current = onSuccess
    onFailRef.current = onFail
    onRefreshRef.current = onRefresh
    onErrorRef.current = onError
  }, [onSuccess, onFail, onRefresh, onError])

  const rpxToPx = useCallback((rpx: number) => Math.floor(rpx * Taro.getWindowInfo().screenWidth / 750), [])
  const widthPx = useMemo(() => rpxToPx(width), [width, rpxToPx])
  const heightPx = useMemo(() => rpxToPx(height), [height, rpxToPx])

  const loadCaptcha = useCallback(async () => {
    const seq = ++loadSeqRef.current
    setLoading(true)
    setErrorMsg('')
    setStatus('')
    setClickMarkers([])
    setClickTexts([])
    setClickCharImages([])
    try {
      const res = await fetchCaptcha(backend, { type: 'click', width: widthPx, height: heightPx })
      if (seq !== loadSeqRef.current) return
      if (!res.success || !res.data) throw new Error(res.message || 'Failed')
      setCaptchaId(res.data.captchaId)
      setBgImage(res.data.bgImage)
      setClickTexts(res.data.clickTexts ?? [])
      setClickCharImages(res.data.clickCharImages ?? [])
    } catch (err) {
      if (seq !== loadSeqRef.current) return
      const error = err instanceof Error ? err : new Error(String(err))
      setErrorMsg(error.message)
      onError?.(error)
    } finally {
      if (seq === loadSeqRef.current) setLoading(false)
    }
  }, [backend, widthPx, heightPx, onError])

  useEffect(() => { if (widthPx && heightPx) loadCaptcha() }, [widthPx, heightPx, loadCaptcha])

  const handleClick = useCallback((e: any) => {
    if (status || loading || clickMarkers.length >= clickTexts.length) return
    const touch = e.touches?.[0] || e.detail
    if (!touch) return
    Taro.createSelectorQuery().select('.captcha-area').boundingClientRect((rect: any) => {
      if (!rect) return
      const newMarkers = [...clickMarkers, { x: touch.clientX - rect.left, y: touch.clientY - rect.top, index: clickMarkers.length + 1 }]
      setClickMarkers(newMarkers)
      if (newMarkers.length >= clickTexts.length) {
        setTimeout(async () => {
          setLoading(true)
          try {
            const res = await verifyCaptcha(backend, { captchaId, type: 'click', target: newMarkers.map(m => ({ x: m.x, y: m.y })) })
            if (res.success) {
              setStatus('success')
              onSuccessRef.current?.(res.data)
            } else {
              setStatus('fail')
              onFailRef.current?.()
              setTimeout(() => { loadCaptcha(); onRefreshRef.current?.() }, 800)
            }
          } catch (err) {
            console.error('[ClickCaptcha] 错误', err)
            setStatus('fail')
            setTimeout(loadCaptcha, 800)
          } finally { setLoading(false) }
        }, 200)
      }
    }).exec()
  }, [status, loading, clickMarkers, clickTexts, captchaId, backend, loadCaptcha])

  const refresh = useCallback(() => { loadCaptcha(); onRefreshRef.current?.() }, [loadCaptcha])

  // Expose refresh method via ref
  useImperativeHandle(ref, () => ({ refresh }), [refresh])

  return (
    <View class="captcha-container">
      <View class="captcha-area" style={{ width: `${widthPx}px`, height: `${heightPx}px` }} onClick={handleClick}>
        <Show when={bgImage} fallback={<View class="captcha-loading"><Text>{errorMsg || '加载中...'}</Text></View>}><Image src={bgImage} mode="aspectFill" class="bg-image" style={{ width: `${widthPx}px`, height: `${heightPx}px` }} /></Show>
        <For each={clickMarkers}>
          {m => (
            <View key={m.index} class="click-marker" style={{ left: `${m.x}px`, top: `${m.y}px` }}>
              <Text class="marker-text">{m.index}</Text>
            </View>
          )}
        </For>
        <Show when={showRefresh && !loading}>
          <View class="refresh-btn" onClick={e => { e.stopPropagation(); refresh() }}>
            <Text class="refresh-icon">⟳</Text>
          </View>
        </Show>
        <Show when={status}>
          <View class={`status-overlay ${status}`}>
            <View class="status-icon"><Text>{status === 'success' ? '✓' : '✕'}</Text></View>
            <Text class="status-text">{status === 'success' ? '验证成功' : '验证失败'}</Text>
          </View>
        </Show>
      </View>
      <View class="prompt-bar" style={{ width: `${widthPx}px` }}>
        <Text class="prompt-text">请依次点击：</Text>
        <View class="prompt-chars">
          {clickCharImages.length > 0 ? clickCharImages.map(img => (
            <View key={img} class="char-item">
              <Image src={img} class="char-img" mode="aspectFit" />
            </View>
          )) : clickTexts.map(char => (
            <View key={char} class="char-item">
              <Text class="char-text">{char}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
})

ClickCaptcha.displayName = 'ClickCaptcha'

export default ClickCaptcha
