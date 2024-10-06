import {JSDOM} from 'jsdom'
import https from 'https'

export class ContentExtractor {
  private dom: JSDOM

  constructor(html: string) {
    this.dom = new JSDOM(html)
  }

  public extract(): string {
    this.removeUnwantedElements()
    this.removeEmptyElements()
    this.stripUnnecessaryAttributes()
    this.removeComments()
    return this.getMainContent()
  }

  public async extractProductInfo(html: string): Promise<any> {
    const FLOWWISE_LLM_URL =
      'https://agents.wasm.host/api/v1/prediction/eb28d39f-fe82-4500-964d-891cb5745a27'

    const queryFlowWiseLLM = async (data: any): Promise<any> => {
      try {
        const response = await fetch(FLOWWISE_LLM_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
      } catch (error) {
        console.error('Error querying FlowWise LLM:', error)
        throw error
      }
    }

    return queryFlowWiseLLM({ question: html })
  }

  private removeUnwantedElements(): void {
    const unwantedSelectors = [
      'script',
      'style',
      'nav',
      'header',
      'footer',
      'aside',
      'ads',
      'svg',
      'icon',
      '[id*="menu"]',
      '[id*="nav"]',
      '[id*="header"]',
      '[id*="footer"]',
      '[class*="menu"]',
      '[class*="nav"]',
      '[class*="header"]',
      '[class*="footer"]',
    ]

    unwantedSelectors.forEach((selector) => {
      this.dom.window.document
        .querySelectorAll(selector)
        .forEach((el: any) => el.remove())
    })
  }

  private removeEmptyElements(): void {
    const emptyElements = this.dom.window.document.querySelectorAll('*')
    emptyElements.forEach((el: any) => {
      if (el.textContent?.trim() === '' && el.children.length === 0) {
        el.remove()
      }
    })
  }

  private stripUnnecessaryAttributes(): void {
    const allElements = this.dom.window.document.querySelectorAll('*')
    const unnecessaryAttributes = [
      'class',
      'style',
      'id',
      'onclick',
      'onload',
      'onunload',
      'onresize',
      'onscroll',
      'data-*',
      'aria-*',
      'role',
    ]

    allElements.forEach((el: any) => {
      for (const attr of el.getAttributeNames()) {
        if (
          unnecessaryAttributes.some(
            (ua) => attr === ua || attr.startsWith(ua.replace('*', ''))
          )
        ) {
          el.removeAttribute(attr)
        }
      }
    })
  }

  private removeComments(): void {
    const removeCommentsFromNode = (node: Node) => {
      const childNodes = node.childNodes
      for (let n = childNodes.length - 1; n >= 0; n--) {
        const child = childNodes[n]
        if (child.nodeType === 8) {
          // 8 is for comment nodes
          node.removeChild(child)
        } else if (child.nodeType === 1) {
          // 1 is for element nodes
          removeCommentsFromNode(child)
        }
      }
    }

    removeCommentsFromNode(this.dom.window.document as any)
  }

  private getMainContent(): string {
    const contentSelectors = ['main', 'article', '#content', '.content', 'body']
    let mainContent: Element | null = null

    for (const selector of contentSelectors) {
      mainContent = this.dom.window.document.querySelector(selector)
      if (mainContent) break
    }

    if (!mainContent) {
      mainContent = this.dom.window.document.body
    }

    return this.cleanText(mainContent?.innerHTML || '')
  }

  private cleanText(text: string): string {
    return text.replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim()
  }
}

export function fetchHtml(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
        .get(url, (res: any) => {
        let data = ''
        res.on('data', (chunk: any) => (data += chunk))
        res.on('end', () => resolve(data))
      })
      .on('error', reject)
  })
}
