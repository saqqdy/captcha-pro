import type { ReactElement } from 'react'

export function Footer(): ReactElement {
  return (
    <footer class="footer">
      <p>
        <a href="https://github.com/saqqdy/captcha-pro" target="_blank" rel="noopener">GitHub</a>
        {' '}
        ·
        <a href="https://www.npmjs.com/package/@captcha-pro/core" target="_blank" rel="noopener">NPM</a>
      </p>
      <p>Made with ❤️ by saqqdy</p>
    </footer>
  )
}
