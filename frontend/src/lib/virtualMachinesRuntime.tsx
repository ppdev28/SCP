import { createRoot, type Root } from 'react-dom/client'
import { X } from 'lucide-react'
import { T } from './tokens'
import VirtualMachinesView from '../views/VirtualMachinesView'

let root: Root | null = null
let overlay: HTMLDivElement | null = null
let button: HTMLButtonElement | null = null
let observer: MutationObserver | null = null

function closeVirtualMachines() {
  root?.unmount()
  root = null
  overlay?.remove()
  overlay = null
  if (button) {
    button.style.background = 'none'
    button.style.color = ''
    button.dataset.scpVmActive = 'false'
  }
}

function openVirtualMachines() {
  if (overlay) return
  const aside = document.querySelector('aside') as HTMLElement | null
  overlay = document.createElement('div')
  overlay.id = 'scp-virtual-machines-screen'
  overlay.style.cssText = `position:fixed;top:52px;right:0;bottom:0;left:${aside?.getBoundingClientRect().right ?? 220}px;background:${T.bg};overflow:auto;z-index:90;border-top:1px solid ${T.border};box-shadow:-10px 0 30px rgba(0,0,0,.16)`

  const toolbar = document.createElement('div')
  toolbar.style.cssText = `position:sticky;top:0;z-index:5;height:42px;display:flex;align-items:center;padding:0 16px;background:${T.bg};border-bottom:1px solid ${T.border}`
  const title = document.createElement('span')
  title.textContent = 'Virtual machines'
  title.style.cssText = `font-size:12px;font-weight:600;color:${T.text}`
  const close = document.createElement('button')
  close.setAttribute('aria-label', 'Close virtual machines')
  close.style.cssText = `margin-left:auto;width:28px;height:28px;border:1px solid ${T.border};border-radius:6px;background:transparent;color:${T.textDim};cursor:pointer;display:flex;align-items:center;justify-content:center`
  close.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
  const svg = close.firstElementChild as SVGElement
  svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('width', '14'); svg.setAttribute('height', '14'); svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '2'); svg.innerHTML = '<path d="M18 6 6 18M6 6l12 12"/>'
  close.onclick = closeVirtualMachines
  toolbar.append(title, close)

  const mount = document.createElement('div')
  overlay.append(toolbar, mount)
  document.body.appendChild(overlay)
  root = createRoot(mount)
  root.render(<VirtualMachinesView addToast={() => {}} />)
  if (button) {
    button.style.background = T.active
    button.style.color = T.text
    button.dataset.scpVmActive = 'true'
  }
}

function installButton() {
  const aside = document.querySelector('aside')
  if (!aside) return
  const nav = aside.querySelector('nav')
  if (!nav || nav.querySelector('[data-scp-virtual-machines]')) return
  const candidates = Array.from(nav.querySelectorAll('button'))
  const networkButton = candidates.find(item => item.textContent?.trim() === 'Network')
  if (!networkButton) return

  button = networkButton.cloneNode(true) as HTMLButtonElement
  button.dataset.scpVirtualMachines = 'true'
  button.dataset.scpVmActive = 'false'
  button.setAttribute('aria-label', 'Virtual machines')
  button.querySelector('svg')?.remove()
  const icon = document.createElement('span')
  icon.textContent = '▣'
  icon.style.cssText = `font-size:13px;line-height:1;color:${T.textDim};display:flex;flex-shrink:0`
  const label = button.querySelector('span:last-child')
  if (label) label.textContent = 'Virtual machines'
  button.insertBefore(icon, button.firstChild)
  button.onclick = event => { event.preventDefault(); event.stopPropagation(); openVirtualMachines() }
  networkButton.insertAdjacentElement('afterend', button)

  nav.querySelectorAll('button:not([data-scp-virtual-machines])').forEach(item => {
    item.addEventListener('click', () => closeVirtualMachines(), { capture: true })
  })
}

function reposition() {
  if (!overlay) return
  const aside = document.querySelector('aside') as HTMLElement | null
  if (aside) overlay.style.left = `${aside.getBoundingClientRect().right}px`
}

function init() {
  if (typeof document === 'undefined') return
  installButton()
  observer = new MutationObserver(() => { installButton(); reposition() })
  observer.observe(document.body, { childList: true, subtree: true })
  window.addEventListener('resize', reposition)
}

if (typeof window !== 'undefined') {
  window.setTimeout(init, 0)
}
